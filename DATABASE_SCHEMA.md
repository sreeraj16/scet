# WasteLoop — Database Schema Reference

## Overview of Core Entity Relations

```
[organizations] ──1:N──> [profiles] ──1:N──> [households]
       │                    │                     │
       ├──1:N──> [zones] ───┴─────────────────────┼──> [collections]
       │           │                              │         │
       │           └──> [collection_schedules] ───┘         ├──1:N──> [collection_events]
       │                                                    └──1:1──> [waste_batches]
       │                                                                  │
       ├──1:N──> [vehicles]                                               ├──> [waste_processing_events]
       ├──1:N──> [processing_facilities]                                  └──> [recycling_transactions]
       ├──1:N──> [recyclers]
       ├──1:N──> [complaints] ──1:N──> [complaint_evidence]
       ├──1:N──> [iot_devices] ──1:N──> [iot_readings]
       └──1:N──> [audit_logs]
```

## Supported Organization Types (15)
`Municipality`, `College / University`, `Hotel`, `Residential Community`, `Commercial Building`, `Institution`, `Market`, `Hospital`, `Transport Hub`, `Public Place`, `Construction Area`, `Municipal Point`, `Industrial Area`, `Special Waste Facility`, `Other`.

## Supported Roles (7)
`citizen`, `collector`, `supervisor`, `municipal_admin`, `recycler`, `organization_admin`, `platform_admin`.

## Waste Batch Identification
Batch codes follow the format `WL-2026-XXXXXX` (e.g. `WL-2026-000184`).

## Evidence Verification Identification
Evidence codes follow the format `WL-EV-2026-XXXXXX` (e.g. `WL-EV-2026-000019`).
