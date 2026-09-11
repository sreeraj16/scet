import { supabase } from './supabase';

export type WasteLoopDomainEventType = 
  | 'collection.created'
  | 'collection.assigned'
  | 'collection.en_route'
  | 'collection.arrived'
  | 'collection.completed'
  | 'collection.missed'
  | 'collection.escalated'
  | 'vehicle.assigned'
  | 'vehicle.location_updated'
  | 'vehicle.capacity_warning'
  | 'waste_batch.created'
  | 'waste_batch.collected'
  | 'waste_batch.transferred'
  | 'waste_batch.segregated'
  | 'waste_batch.recovered'
  | 'waste_batch.recycler_assigned'
  | 'waste_batch.processing_started'
  | 'waste_batch.recycled'
  | 'recycler.request_created'
  | 'recycler.accepted'
  | 'recycler.rejected'
  | 'recycler.received'
  | 'complaint.created'
  | 'complaint.assigned'
  | 'complaint.escalated'
  | 'complaint.resolved'
  | 'iot.sensor_reading'
  | 'iot.overflow_detected'
  | 'iot.device_offline'
  | 'route.created'
  | 'route.optimization_requested'
  | 'route.optimized'
  | 'route.failed'
  | 'risk.calculation_requested'
  | 'risk.calculated';

export interface OutboxEventRecord {
  id: string;
  event_type: WasteLoopDomainEventType;
  aggregate_type: string;
  aggregate_id: string;
  organization_id: string;
  payload: any;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'dead_letter';
  retry_count: number;
  max_retries: number;
  next_retry_at: string;
  idempotency_key: string;
  last_error?: string;
  created_at: string;
  processed_at?: string;
}

type EventSubscriber = (event: OutboxEventRecord) => Promise<void> | void;

class OutboxEngine {
  private outbox: OutboxEventRecord[] = [];
  private idempotencyKeys: Set<string> = new Set();
  private subscribers: Map<WasteLoopDomainEventType, EventSubscriber[]> = new Map();
  private metrics = {
    totalEventsPublished: 0,
    totalCompleted: 0,
    totalRetried: 0,
    totalDeadLetter: 0,
    duplicateBlockedCount: 0
  };

  /**
   * Register a subscriber callback for a specific domain event topic
   */
  subscribe(topic: WasteLoopDomainEventType, subscriber: EventSubscriber): () => void {
    const existing = this.subscribers.get(topic) || [];
    this.subscribers.set(topic, [...existing, subscriber]);

    return () => {
      const current = this.subscribers.get(topic) || [];
      this.subscribers.set(topic, current.filter(s => s !== subscriber));
    };
  }

  /**
   * Publish a new Domain Event into the Outbox with Idempotency Key protection
   */
  async publish(
    eventType: WasteLoopDomainEventType,
    aggregateType: string,
    aggregateId: string,
    organizationId: string,
    payload: any,
    idempotencyKey?: string,
    maxRetries: number = 3
  ): Promise<{ success: boolean; event?: OutboxEventRecord; duplicateKey?: boolean }> {
    const key = idempotencyKey || `${eventType}:${aggregateId}:${JSON.stringify(payload)}`;

    // Replay / Duplicate Protection
    if (this.idempotencyKeys.has(key)) {
      this.metrics.duplicateBlockedCount += 1;
      console.warn(`[Outbox Replay Protection] Duplicate event blocked for key: ${key}`);
      return { success: false, duplicateKey: true };
    }

    this.idempotencyKeys.add(key);

    const now = new Date().toISOString();
    const eventRecord: OutboxEventRecord = {
      id: `outbox-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      event_type: eventType,
      aggregate_type: aggregateType,
      aggregate_id: aggregateId,
      organization_id: organizationId,
      payload,
      status: 'pending',
      retry_count: 0,
      max_retries: maxRetries,
      next_retry_at: now,
      idempotency_key: key,
      created_at: now
    };

    this.outbox.unshift(eventRecord);
    this.metrics.totalEventsPublished += 1;

    // Asynchronously push to Supabase PostgreSQL table if configured
    Promise.resolve(
      supabase.from('event_outbox').insert({
        id: eventRecord.id,
        event_type: eventRecord.event_type,
        aggregate_type: eventRecord.aggregate_type,
        aggregate_id: eventRecord.aggregate_id,
        organization_id: eventRecord.organization_id,
        payload: eventRecord.payload,
        status: eventRecord.status,
        retry_count: eventRecord.retry_count,
        max_retries: eventRecord.max_retries,
        next_retry_at: eventRecord.next_retry_at,
        idempotency_key: eventRecord.idempotency_key,
        created_at: eventRecord.created_at
      })
    ).catch(() => {});

    // Trigger async processing handler
    this.processEvent(eventRecord);

    return { success: true, event: eventRecord };
  }

  /**
   * Internal Outbox Processor with Exponential Backoff Retries & Failure Recovery
   */
  private async processEvent(event: OutboxEventRecord) {
    event.status = 'processing';
    event.retry_count += 1;

    const handlers = this.subscribers.get(event.event_type) || [];

    try {
      for (const handler of handlers) {
        await handler(event);
      }
      event.status = 'completed';
      event.processed_at = new Date().toISOString();
      this.metrics.totalCompleted += 1;
    } catch (err: any) {
      event.last_error = err?.message || 'Asynchronous processing error';
      console.error(`[Outbox Process Error] Event ${event.id} failed attempt ${event.retry_count}:`, err);

      if (event.retry_count <= event.max_retries) {
        event.status = 'failed';
        this.metrics.totalRetried += 1;
        const delayMs = Math.min(1000 * Math.pow(2, event.retry_count), 30000);
        event.next_retry_at = new Date(Date.now() + delayMs).toISOString();

        setTimeout(() => {
          event.status = 'pending';
          this.processEvent(event);
        }, delayMs);
      } else {
        event.status = 'dead_letter';
        this.metrics.totalDeadLetter += 1;
      }
    }
  }

  /**
   * Manual retry for a Dead Letter Event
   */
  retryDeadLetter(eventId: string): boolean {
    const event = this.outbox.find(e => e.id === eventId && e.status === 'dead_letter');
    if (!event) return false;

    event.retry_count = 0;
    event.status = 'pending';
    event.next_retry_at = new Date().toISOString();
    this.processEvent(event);
    return true;
  }

  /**
   * Get Outbox Observability & Diagnostics Metrics
   */
  getDiagnostics() {
    return {
      metrics: { ...this.metrics },
      pendingCount: this.outbox.filter(e => e.status === 'pending' || e.status === 'processing').length,
      completedCount: this.outbox.filter(e => e.status === 'completed').length,
      deadLetterCount: this.outbox.filter(e => e.status === 'dead_letter').length,
      events: [...this.outbox].slice(0, 50) // last 50 outbox events
    };
  }
}

export const outboxEngine = new OutboxEngine();
