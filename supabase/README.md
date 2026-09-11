# WasteLoop Supabase Migrations & Database Setup

This directory contains the complete executable PostgreSQL database schema for **WasteLoop: Intelligent Waste Collection & Circular Economy Operations Platform**.

## Migration Files Sequence

1. `001_extensions.sql` - Enables PostGIS & UUID extensions
2. `002_organizations.sql` - Creates `organizations` & support for 15 organization/location types
3. `003_users.sql` - Profiles table with 7 user roles (`citizen`, `collector`, `supervisor`, `municipal_admin`, `recycler`, `organization_admin`, `platform_admin`)
4. `004_waste.sql` - Operational `waste_records` and `waste_batches` (`WL-2026-XXXXXX`)
5. `005_collections.sql` - `zones`, `households`, `collection_schedules`, `collections`, and `collection_events`
6. `006_routes.sql` - `vehicles`, `routes`, and `route_stops`
7. `007_processing.sql` - `processing_facilities` and `waste_processing_events` (Coarse separation)
8. `008_recyclers.sql` - `recyclers`, `recycler_materials`, `recycler_service_areas`, `recycling_transactions`
9. `009_complaints.sql` - `complaints` and `complaint_evidence` (`WL-EV-2026-XXXXXX`)
10. `010_notifications.sql` - `notifications` table for Realtime & in-app alerts
11. `011_ai_ml.sql` - `ai_ml_predictions` and `anomalies`
12. `012_iot.sql` - `iot_devices` and `iot_readings`
13. `013_audit.sql` - `audit_logs` table
14. `014_rls.sql` - Row Level Security (RLS) policies for multi-tenant isolation

## How to Apply Migrations

Using the Supabase CLI:

```bash
supabase db push
# or to reset and apply seed data:
supabase db reset
```
