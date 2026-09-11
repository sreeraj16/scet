# WasteLoop — Advanced Architecture Specification
## Messaging & Event-Driven Architecture + Reliable Outbox System

WasteLoop is architected as an audit-grade, event-driven circular waste management platform. To ensure zero message loss, idempotent request execution, and real-time cross-portal updates without external message broker overhead, WasteLoop implements the **Transactional Event Outbox Pattern** on PostgreSQL & Supabase Realtime.

---

## 1. Domain Event Architecture

Operations in WasteLoop emit strongly-typed Domain Events representing business state changes:

- **Collection Lifecycle Events**:
  - `collection.created`, `collection.assigned`, `collection.en_route`, `collection.arrived`, `collection.completed`, `collection.missed`, `collection.escalated`
- **Vehicle & Fleet Events**:
  - `vehicle.assigned`, `vehicle.location_updated`, `vehicle.capacity_warning`
- **Waste Batch & Traceability Events**:
  - `waste_batch.created`, `waste_batch.collected`, `waste_batch.transferred`, `waste_batch.segregated`, `waste_batch.recovered`, `waste_batch.recycler_assigned`, `waste_batch.processing_started`, `waste_batch.recycled`
- **Circular Marketplace & Recycler Events**:
  - `recycler.request_created`, `recycler.accepted`, `recycler.rejected`, `recycler.received`
- **IoT & Sensor Events**:
  - `iot.sensor_reading`, `iot.overflow_detected`, `iot.device_offline`
- **Geospatial & Risk Events**:
  - `route.created`, `route.optimization_requested`, `route.optimized`, `route.failed`, `risk.calculated`

---

## 2. Transactional Outbox Pattern (`event_outbox`)

When operational state changes occur (e.g. Collector clicks `Mark Collected` or MRF completes `Coarse Separation`), events are written atomically to PostgreSQL table `public.event_outbox`:

```sql
CREATE TABLE public.event_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    aggregate_type TEXT NOT NULL,
    aggregate_id TEXT NOT NULL,
    organization_id UUID NOT NULL,
    payload JSONB NOT NULL,
    status TEXT DEFAULT 'pending',
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    next_retry_at TIMESTAMPTZ DEFAULT NOW(),
    idempotency_key TEXT UNIQUE NOT NULL,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. Idempotency & Replay Attack Protection

Every event submission generates a unique `idempotency_key` (e.g. `col-comp:{collection_id}:{timestamp}`). 
If a network retry or duplicate client request submits the same key:
1. `outboxEngine` checks in-memory idempotency sets and unique DB constraints.
2. Duplicate event executions are blocked.
3. System prevents duplicate waste batch creations, duplicate payouts, and duplicate notification dispatches.

---

## 4. Retries & Exponential Backoff

If an asynchronous downstream consumer fails:
1. Event status is marked as `failed`.
2. Retry count is incremented (`retry_count += 1`).
3. Next retry time is calculated using exponential backoff (`delay = 1s * 2^attempts`).
4. If `retry_count > max_retries`, event moves to `dead_letter` status for admin inspection and manual re-triggering.

---

## 5. Observability & Monitoring

The [`EventOutboxMonitor.tsx`](file:///c:/Users/SREERAJ%20GANTIMALL/OneDrive/Desktop/Swarnandhra/src/components/monitoring/EventOutboxMonitor.tsx) console provides administrators real-time visibility into:
- Total Events Published
- Completed Async Processing Rate
- Retry Attempts & Exponential Backoff Delay
- Dead Letter Queue Items with Error Tracebacks
- Replay Protection Deduplication Counter
