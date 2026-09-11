# Recovery Strategy & Disaster Resilience - Swarnandhra WasteLoop Platform

## Overview
The platform employs automated retry policies, Dead-Letter Queue (DLQ) re-queuing, offline queue synchronization, and data redundancy strategies to recover seamlessly from runtime faults and network outages.

---

## 1. Asynchronous Retry Strategy (Exponential Backoff)

- **Max Retries**: Failed event message consumers execute up to 3 retry attempts.
- **Backoff Formula**: `Delay = 1000ms * (2 ^ attempt)`
  - Attempt 1: 2,000 ms delay
  - Attempt 2: 4,000 ms delay
  - Attempt 3: 8,000 ms delay
- **Dead-Letter Escalation**: Events exceeding max retries are safely quarantined in the DLQ for manual inspection via the **System Health Console**.

---

## 2. Offline Synchronization Strategy (`offlineQueue.ts`)

- **Local Persistence**: Collector photo uploads and collection completions occurring offline are saved in LocalStorage.
- **Sync Trigger**: Upon network restoration, `syncOfflineQueue()` iterates through pending queue items, dispatches API completion updates, and clears synced items.

---

## 3. Disaster Recovery & Data Replication

- **Database Point-In-Time Recovery (PITR)**: Supabase PostgreSQL automated daily snapshots with 30-day point-in-time recovery.
- **AI Model Cache Recovery**: Trained ML models (`wasteloop_classifier.joblib` and `wasteloop_forecaster.joblib`) are version-controlled and cached locally in `backend_ai/` for offline AI inference fallback.
