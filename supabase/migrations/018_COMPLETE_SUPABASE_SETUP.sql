-- ============================================================================
-- WASTELOOP 2.0 — COMPLETE SUPABASE DATABASE SETUP & COMPATIBILITY SCHEMA
-- Copy and paste this complete SQL script into your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/pcwjnhnmhyswbfxzcsxg/sql
-- ============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DROP OLD TABLES WITH CASCADE TO PURGE LEGACY UUID CONSTRAINTS
DROP TABLE IF EXISTS public.material_batch_events CASCADE;
DROP TABLE IF EXISTS public.waste_batches CASCADE;
DROP TABLE IF EXISTS public.collections CASCADE;
DROP TABLE IF EXISTS public.security_audit_logs CASCADE;
DROP TABLE IF EXISTS public.event_outbox CASCADE;
DROP TABLE IF EXISTS public.audit_logs CASCADE;
DROP TABLE IF EXISTS public.iot_devices CASCADE;
DROP TABLE IF EXISTS public.complaints CASCADE;
DROP TABLE IF EXISTS public.collectors CASCADE;
DROP TABLE IF EXISTS public.vehicles CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
DROP TABLE IF EXISTS public.organizations CASCADE;

-- 3. ORGANIZATIONS TABLE
CREATE TABLE public.organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT,
    type TEXT DEFAULT 'College / University',
    category_label TEXT,
    icon_name TEXT,
    subscription_plan TEXT DEFAULT 'enterprise',
    contact_email TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. USERS / PROFILES TABLE
CREATE TABLE public.users (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    role TEXT NOT NULL DEFAULT 'citizen',
    full_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COLLECTIONS TABLE
CREATE TABLE public.collections (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    household_id TEXT,
    collector_id TEXT,
    vehicle_id TEXT,
    zone_id TEXT DEFAULT 'zone-1',
    type TEXT DEFAULT 'normal',
    waste_category TEXT DEFAULT 'mixed',
    scheduled_window_start TIMESTAMPTZ DEFAULT NOW(),
    scheduled_window_end TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '2 hours'),
    status TEXT NOT NULL DEFAULT 'requested',
    priority TEXT DEFAULT 'medium',
    priority_reason TEXT,
    estimated_weight_kg NUMERIC(10, 2) DEFAULT 10.0,
    actual_weight_kg NUMERIC(10, 2),
    segregation_verified BOOLEAN DEFAULT true,
    household_address TEXT,
    collector_name TEXT,
    vehicle_reg TEXT,
    evidence_image_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. WASTE BATCHES TABLE
CREATE TABLE public.waste_batches (
    id TEXT PRIMARY KEY,
    batch_code TEXT UNIQUE NOT NULL,
    organization_id TEXT,
    collection_id TEXT,
    waste_category TEXT NOT NULL DEFAULT 'dry_recyclable',
    actual_weight_kg NUMERIC(10, 2) DEFAULT 0.0,
    collected_weight_kg NUMERIC(10, 2) DEFAULT 0.0,
    facility_received_weight_kg NUMERIC(10, 2),
    recycler_received_weight_kg NUMERIC(10, 2),
    recovered_weight_kg NUMERIC(10, 2) DEFAULT 0.0,
    weight_discrepancy_kg NUMERIC(10, 2) DEFAULT 0.0,
    collector_id TEXT,
    collector_name TEXT,
    vehicle_id TEXT,
    processing_facility_id TEXT,
    processing_facility_name TEXT,
    coarse_separation_status TEXT DEFAULT 'pending',
    organic_fraction_kg NUMERIC(10, 2) DEFAULT 0.0,
    dry_fraction_kg NUMERIC(10, 2) DEFAULT 0.0,
    special_fraction_kg NUMERIC(10, 2) DEFAULT 0.0,
    residual_fraction_kg NUMERIC(10, 2) DEFAULT 0.0,
    recycler_id TEXT,
    recycler_name TEXT,
    final_status TEXT NOT NULL DEFAULT 'IN_TRANSIT',
    current_location_name TEXT,
    current_latitude NUMERIC(10, 7),
    current_longitude NUMERIC(10, 7),
    current_responsible_entity TEXT,
    last_updated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MATERIAL BATCH EVENTS TABLE
CREATE TABLE public.material_batch_events (
    id TEXT PRIMARY KEY DEFAULT ('ev-' || extract(epoch from now())::bigint || '-' || floor(random()*1000)::int),
    batch_id TEXT,
    batch_code TEXT NOT NULL,
    organization_id TEXT,
    event_type TEXT NOT NULL,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    location_name TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    collector_id TEXT,
    vehicle_id TEXT,
    recycler_id TEXT,
    weight_kg NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    weight_discrepancy_flag BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. VEHICLES TABLE
CREATE TABLE public.vehicles (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    registration_number TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL,
    capacity_kg NUMERIC(10, 2) NOT NULL DEFAULT 2000.0,
    current_load_kg NUMERIC(10, 2) DEFAULT 0.0,
    status TEXT DEFAULT 'available',
    assigned_collector_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. COLLECTORS TABLE
CREATE TABLE public.collectors (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    user_id TEXT,
    badge_number TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    shift_status TEXT DEFAULT 'on_duty',
    assigned_vehicle_id TEXT,
    current_latitude NUMERIC(10, 7),
    current_longitude NUMERIC(10, 7),
    completed_tasks_today INT DEFAULT 0,
    remaining_tasks_today INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. COMPLAINTS TABLE
CREATE TABLE public.complaints (
    id TEXT PRIMARY KEY,
    ticket_code TEXT UNIQUE NOT NULL,
    organization_id TEXT,
    household_id TEXT,
    user_id TEXT,
    reporter_name TEXT,
    category TEXT NOT NULL,
    severity TEXT DEFAULT 'high',
    description TEXT NOT NULL,
    evidence_image_url TEXT,
    status TEXT DEFAULT 'reported',
    assigned_supervisor_name TEXT,
    is_auto_escalated BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. IOT SMART DEVICES TABLE
CREATE TABLE public.iot_devices (
    id TEXT PRIMARY KEY,
    device_code TEXT UNIQUE NOT NULL,
    organization_id TEXT,
    zone_name TEXT,
    location_name TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    fill_level_percent INT DEFAULT 0,
    battery_level_percent INT DEFAULT 100,
    temperature_celsius NUMERIC(5, 2) DEFAULT 25.0,
    last_ping TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'normal',
    predicted_overflow_hours NUMERIC(5, 2)
);

-- 12. AUDIT LOGS TABLE
CREATE TABLE public.audit_logs (
    id TEXT PRIMARY KEY,
    organization_id TEXT,
    user_name TEXT,
    role TEXT,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 13. EVENT OUTBOX TABLE
CREATE TABLE public.event_outbox (
    id TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    aggregate_type TEXT NOT NULL,
    aggregate_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    next_retry_at TIMESTAMPTZ DEFAULT NOW(),
    idempotency_key TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. SECURITY AUDIT LOGS TABLE
CREATE TABLE public.security_audit_logs (
    id TEXT PRIMARY KEY,
    organization_id TEXT NOT NULL,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    target_id TEXT NOT NULL,
    anomaly_flag BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. PERMISSIONS & RLS OPEN ACCESS FOR DEMO WRITES
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_batch_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow anon and authenticated roles full read/write access
CREATE POLICY "Public read/write organizations" ON public.organizations FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write collections" ON public.collections FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write waste_batches" ON public.waste_batches FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write material_batch_events" ON public.material_batch_events FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write vehicles" ON public.vehicles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write collectors" ON public.collectors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write complaints" ON public.complaints FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write iot_devices" ON public.iot_devices FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write event_outbox" ON public.event_outbox FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public read/write security_audit_logs" ON public.security_audit_logs FOR ALL USING (true) WITH CHECK (true);

-- Grant privileges to anon and authenticated roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, postgres, service_role;
