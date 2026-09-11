export type EventTopic = 
  | 'PICKUP_CREATED'
  | 'COLLECTION_COMPLETED'
  | 'SENSOR_PING'
  | 'ROUTE_FAILED'
  | 'MARKETPLACE_TRANSACTION'
  | 'RECOVERY_CERTIFICATE_ISSUED'
  | 'SLA_BREACH_DETECTED';

export interface EventMessage {
  id: string;
  topic: EventTopic;
  payload: any;
  timestamp: string;
  attempts: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'dead_letter';
  errorMessage?: string;
}

type EventSubscriber = (event: EventMessage) => Promise<void> | void;

class EventQueueBroker {
  private queue: EventMessage[] = [];
  private deadLetterQueue: EventMessage[] = [];
  private subscribers: Map<EventTopic, EventSubscriber[]> = new Map();
  private processedCount: number = 0;
  private failedCount: number = 0;

  /**
   * Subscribe a handler function to a specific topic
   */
  subscribe(topic: EventTopic, subscriber: EventSubscriber): () => void {
    const subs = this.subscribers.get(topic) || [];
    this.subscribers.set(topic, [...subs, subscriber]);

    return () => {
      const current = this.subscribers.get(topic) || [];
      this.subscribers.set(topic, current.filter(s => s !== subscriber));
    };
  }

  /**
   * Publish an event to the queue
   */
  publish(topic: EventTopic, payload: any, maxRetries: number = 3): EventMessage {
    const event: EventMessage = {
      id: `evt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      topic,
      payload,
      timestamp: new Date().toISOString(),
      attempts: 0,
      maxRetries,
      status: 'pending'
    };

    this.queue.push(event);
    this.processNext(event);
    return event;
  }

  /**
   * Internal processor for consuming queue events
   */
  private async processNext(event: EventMessage) {
    event.status = 'processing';
    event.attempts += 1;

    const handlers = this.subscribers.get(event.topic) || [];

    try {
      for (const handler of handlers) {
        await handler(event);
      }
      event.status = 'completed';
      this.processedCount += 1;
    } catch (err: any) {
      event.errorMessage = err?.message || 'Unknown processing error';

      if (event.attempts < event.maxRetries) {
        event.status = 'pending';
        // Exponential backoff retry simulation
        setTimeout(() => this.processNext(event), 1000 * Math.pow(2, event.attempts));
      } else {
        event.status = 'dead_letter';
        this.failedCount += 1;
        this.deadLetterQueue.push(event);
      }
    }
  }

  /**
   * Retry an item currently in the Dead Letter Queue
   */
  retryDeadLetter(eventId: string): boolean {
    const idx = this.deadLetterQueue.findIndex(e => e.id === eventId);
    if (idx === -1) return false;

    const [event] = this.deadLetterQueue.splice(idx, 1);
    event.attempts = 0;
    event.status = 'pending';
    this.queue.push(event);
    this.processNext(event);
    return true;
  }

  /**
   * Get overall queue metrics for monitoring console
   */
  getMetrics() {
    return {
      pendingInQueue: this.queue.filter(q => q.status === 'pending' || q.status === 'processing').length,
      completedCount: this.processedCount,
      deadLetterCount: this.deadLetterQueue.length,
      deadLetterEvents: [...this.deadLetterQueue],
      activeQueue: [...this.queue].slice(-20) // last 20 events
    };
  }
}

export const eventQueue = new EventQueueBroker();
