# WasteLoop — Complete End-to-End Workflow Architecture

This document details the complete 15-stage lifecycle of waste through the **WasteLoop** platform.

```
[1. CITIZEN RECURRING SCHEDULE]
               ↓
[2. ZONE & ROUTE CLUSTERING]
               ↓
[3. COLLECTOR & VEHICLE ASSIGNMENT]
               ↓
[4. OSRM ROAD NAVIGATION]
               ↓
[5. FIELD COLLECTION & WEIGHT ENTRY]
               ↓
[6. VEHICLE LOAD UPDATES]
               ↓
[7. MRF HANDOVER & BATCH CREATION]
               ↓
[8. COARSE SEPARATION LOGGING]
               ↓
[9. RECYCLER MATCHING & RECOMMENDATION]
               ↓
[10. RECYCLER ACCEPTANCE & PICKUP SCHEDULE]
               ↓
[11. MATERIAL RECOVERY & COMPOSITION LOG]
               ↓
[12. TRACEABILITY & WASTE JOURNEY UPDATE]
               ↓
[13. LOCAL QR CERTIFICATE GENERATION]
               ↓
[14. ESG SUSTAINABILITY ANALYTICS UPDATE]
               ↓
[15. REALTIME CITIZEN & ADMIN NOTIFICATION]
```

---

## Stage-by-Stage Operational Specification

### Stage 1: Citizen Recurring Schedule Creation
- **Trigger**: Citizen opens Eco Portal → Configures 5-Step Wizard (Location GPS, Waste Types, Frequency, Time Window).
- **Database Mutation**: Inserts record into `collection_schedules` & initializes active `collections` occurrence task.
- **Result**: Citizen dashboard displays **NEXT COLLECTION** card (`Tomorrow · 8:00–10:00 AM`).

### Stage 2 & 3: Zone Clustering & Resource Assignment
- **Trigger**: System maps pickup address to active `zones` (e.g. Zone 1 - North Sector).
- **Priority Engine**: Computes Priority Score based on Volume + Overflow Risk + SLA Urgency + Route Proximity.
- **Resource Allocation**: Assigns duty collector (e.g. Rajesh Kumar) and vehicle (e.g. KA-01-EA-2026 Compactor Truck).

### Stage 4 & 5: Field Collection Execution
- **Collector Actions**: Collector opens mobile UI → Views Today's Route → Clicks `[ Start Navigation ]` → `[ Arrived ]` → `[ Mark Collected ]` → Enters verified weight (`8.5 kg`).
- **Database Mutation**: Updates `collections` status to `collected`, sets `actual_weight_kg`, records timestamp.

### Stage 6 & 7: MRF Handover & Waste Batch Ingestion
- **Trigger**: Collection completion automatically generates a traceable `waste_batches` record (e.g. `WL-2026-000184`).
- **Vehicle Load**: Increments `vehicles.current_load_kg` by 8.5 kg.

### Stage 8 & 9: Coarse Separation & Recycler Recommendation
- **Org Admin Action**: Opens Coarse Sorting Tracker → Inputs separated fractions:
  - Organic Biomass (60 kg)
  - Dry Recyclables (75 kg)
  - Special / E-Waste (5 kg)
  - Residual Inert (10 kg)
- **Validation**: Ensures `Organic + Dry + Special + Residual <= Incoming Weight`.
- **Recycler Recommendation**: System ranks verified recyclers based on accepted materials, service area, and proximity.

### Stage 10 & 11: Recycler Acceptance & Recovery Verification
- **Recycler Action**: Recycler opens B2B Marketplace → Clicks `Accept Material & Schedule Pickup` → Configures pickup date/time & valuation ($140) → Confirms pickup.
- **Status Progression**: `AVAILABLE` → `ACCEPTED` → `PICKUP_SCHEDULED` → `COLLECTED` → `COMPLETED`.

### Stage 12 & 13: Traceability, Waste Journey & QR Certificate
- **Waste Journey Timeline**: Appends timeline event (Source → Collection → Transfer → Segregation → Recycler → Recovery).
- **QR Certificate**: Generates local `qrcode.react` SVG encoding `/waste/verify/{batchCode}` and enables printable PDF Certificate download.

### Stage 14 & 15: ESG Sustainability Analytics & Realtime Notifications
- **Analytics Update**: Increments total diverted tonnage, composting mass, landfill avoided, and CO2e avoided metrics.
- **Notifications**: Triggers in-app Realtime notification to citizen, collector, supervisor, and admin.
