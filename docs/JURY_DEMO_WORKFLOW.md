# WasteLoop — Hackathon Jury Demonstration Guide & 21-Step Operational Workflow Manual

## Overview & Jury Presentation Principles

WasteLoop is engineered for live, interactive, input-to-output hackathon judging. Every button click, form submission, and status transition interacts directly with a production-grade Supabase PostgreSQL database, triggers transactional outbox events, recalculates GIS priority routes, and logs immutable security audit records.

---

## Complete 21-Step End-to-End Operational Workflow

```
[Citizen Waste Request]
       ↓
[Smart Priority Calculation (LOW/MED/HIGH/CRITICAL)]
       ↓
[Transactional Outbox Event (idempotency key protection)]
       ↓
[AI Image Classification & File Upload Security Validation]
       ↓
[Recurring Schedule Automation Generator]
       ↓
[Supervisor Fleet & Collector Task Assignment]
       ↓
[Dynamic Priority-Aware OSRM Route Optimization]
       ↓
[Collector En Route Dispatch & Live Location Broadcast]
       ↓
[GPS Distance Verification (Haversine Formula vs Curb)]
       ↓
[Collector Marks Completed + Verified Scale Weight]
       ↓
[Traceable Material Batch Created (WL-2026-XXXXXX)]
       ↓
[Vehicle Arrival at Central MRF Sorting Facility]
       ↓
[Facility Coarse Separation (Dry/Organic/Special/Residual)]
       ↓
[Weighbridge Scale Discrepancy Auditor (Variance Flagging)]
       ↓
[Verified Recycler Marketplace Listing & Bidding]
       ↓
[Recycler Acceptance & Transport Dispatch]
       ↓
[Recycler Intake Gate Confirmation & Processing]
       ↓
[Final Recycling Completion & Circular Certificate Generation]
       ↓
[Live QR Code Verification & Supabase DB Status Query]
       ↓
[Unified GIS Map Assets, Spatial Heatmaps & Risk Layers]
       ↓
[Security Audit Trail & Outbox Diagnostics Observability]
```

---

### Step-by-Step Operational Workflow Rationale & Actions

#### Step 1: Citizen Waste Schedule Request (`collection.created`)
- **Role**: Citizen
- **Action**: Submit household waste pickup request selecting category (`Dry Recyclable`, `Wet Organic`, `E-Waste`, `Hazardous`), address, and preferred time slot.
- **System Outcome**: Record created in PostgreSQL `public.collections` table.

#### Step 2: Smart Priority Engine Rationale (`risk.calculated`)
- **System Action**: `calculateSmartPriority` evaluates waste volume, request age, SLA breach risk, and overflow risk percentage.
- **System Outcome**: Priority level (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`) assigned with explicit human-readable rationale.

#### Step 3: Event Outbox Dispatch & Deduplication (`collection.created`)
- **System Action**: `outboxEngine.publish('collection.created', ...)` writes event record to PostgreSQL `public.event_outbox`.
- **System Outcome**: Idempotency key (`col-comp:{collection_id}:{timestamp}`) protects against duplicate request replays on network retry.

#### Step 4: AI Image Waste Classification & Upload Validation
- **Role**: Citizen / Supervisor
- **Action**: Capture or upload waste photo for AI classification.
- **Security Check**: `securityService.validateFileUpload` verifies MIME type (`image/jpeg`, `image/png`, `application/pdf`), 10MB size limit, and replaces filename with safe UUID.

#### Step 5: Recurring Pickup Schedule Automation (`schedule.created`)
- **Role**: Citizen
- **Action**: Configure weekly or bi-weekly recurring collection frequency.
- **System Outcome**: Automated scheduler generates future collection occurrences in `public.collections`.

#### Step 6: Supervisor Fleet & Collector Task Assignment (`collection.assigned`)
- **Role**: Supervisor / Admin
- **Action**: Assign collector (*Rajesh Kumar*) and vehicle (*AP-37-EV-101*) to collection task.
- **Security Check**: `securityService.assertRolePermission` verifies `manage_collections` permission before executing assignment.

#### Step 7: Dynamic Priority-Aware Route Optimization (`route.optimized`)
- **Role**: Collector / Driver
- **Action**: OSRM route planner ranks waypoints by combining priority risk scores with shortest travel distance.
- **System Outcome**: High-priority and overdue overflow locations are placed at top of collector route.

#### Step 8: Collector En Route Dispatch (`collection.en_route`)
- **Role**: Collector
- **Action**: Collector clicks `Start Route`. Vehicle location updates broadcast to outbox engine.
- **System Outcome**: Live GIS map position updates and notification dispatched to citizen.

#### Step 9: GPS Distance & Geofence Verification (`collection.arrived`)
- **System Action**: `geospatialEngine.verifyCollectionLocation` computes Haversine distance between collector GPS and expected curb location.
- **System Outcome**: 
  - Within 100m radius → `✓ VERIFIED_LOCATION`
  - Beyond radius → `⚠ LOCATION_MISMATCH_FLAGGED` (Flagged for supervisor review).

#### Step 10: Collector Completion & Verified Scale Weight (`collection.completed`)
- **Role**: Collector
- **Action**: Collector enters actual scale weight (e.g. `24.5 kg`), attaches evidence photo, and clicks `Mark Completed`.
- **System Outcome**: Collection status updated to `collected` and `collection.completed` domain event emitted to outbox.

#### Step 11: Traceable Waste Batch Creation (`waste_batch.created`)
- **System Action**: System automatically initializes traceable material batch (`WL-2026-XXXXXX`) with initial `SOURCE`, `COLLECTED`, and `IN_TRANSIT` traceability events.
- **System Outcome**: Real-time Supabase publication updates Batch Traceability view.

#### Step 12: MRF Facility Gate Intake & Arrival (`waste_batch.transferred`)
- **System Action**: Vehicle arrives at Central MRF Sorting Facility.
- **System Outcome**: Batch status updates to `ARRIVED_AT_FACILITY` with real server timestamp.

#### Step 13: Coarse Separation & Fraction Diverting (`waste_batch.segregated`)
- **Role**: Facility Operator / Supervisor
- **Action**: `processCoarseSeparation` separates dry recyclables, organic fraction, special waste, and residual mass.
- **System Outcome**: Emits `SEGREGATION` and `RECOVERED` traceability events.

#### Step 14: Weighbridge Scale Discrepancy Auditing
- **System Action**: `auditWeightDiscrepancy` compares initial collection scale weight against facility weighbridge scale.
- **System Outcome**: If variance > 1.0 kg, flags `weight_discrepancy_flag = true` with audit notice (`FLAGGED_FOR_REVIEW`).

#### Step 15: Recycler Marketplace Listing & Valuation (`recycler.request_created`)
- **Role**: Recycler / Admin
- **Action**: Recovered dry fraction is listed on Verified Recycler Marketplace with agreed valuation ($/kg).
- **System Outcome**: Verified recyclers submit bids and schedule pickup slots.

#### Step 16: Recycler Acceptance & Transport Dispatch (`waste_batch.recycler_assigned`)
- **Role**: Recycler
- **Action**: Recycler accepts listing and schedules intake slot (`Tomorrow at 10:00 AM`).
- **System Outcome**: Emits `ASSIGNED_TO_RECYCLER` and `IN_TRANSIT_TO_RECYCLER` events.

#### Step 17: Recycler Intake Gate Confirmation & Processing (`waste_batch.processing_started`)
- **Role**: Recycler
- **Action**: Recycler confirms material intake at facility gate and starts processing (extrusion / shredding).
- **System Outcome**: Emits `ACCEPTED_BY_RECYCLER` and `PROCESSING` events.

#### Step 18: Final Recycling & Circular Certificate Generation (`waste_batch.recycled`)
- **Role**: Recycler / Admin
- **Action**: Recycling process completes. Batch final status updates to `RECYCLED`.
- **System Outcome**: Generates official Circular Economy Recovery Certificate with QR verification link.

#### Step 19: Live QR Code Verification & DB Query
- **Action**: Scan QR code or enter Batch Code (`WL-2026-XXXXXX`).
- **System Outcome**: Fetches current real-time database status, latest event timestamp, and verified supply chain custody.

#### Step 20: Unified Live GIS Operational Map & Risk Layer Monitoring
- **Role**: Municipal Admin / Supervisor
- **Action**: Open [`UnifiedLiveMap.tsx`](file:///c:/Users/SREERAJ%20GANTIMALL/OneDrive/Desktop/Swarnandhra/src/components/monitoring/UnifiedLiveMap.tsx) to inspect live collection markers, active vehicles, MRF facilities, spatial heatmaps, and zone risk cards.
- **System Outcome**: Displays real-time operational layer with fallback UI if GPS is unavailable.

#### Step 21: Security Audit Logging & Outbox Observability
- **Role**: Platform Admin / Auditor
- **Action**: Open [`EventOutboxMonitor.tsx`](file:///c:/Users/SREERAJ%20GANTIMALL/OneDrive/Desktop/Swarnandhra/src/components/monitoring/EventOutboxMonitor.tsx) to inspect event outbox metrics and `public.security_audit_logs`.
- **System Outcome**: Verifies 100% event completion rate, idempotency replay protection, and audit compliance.
