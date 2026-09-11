-- WasteLoop Phase 2 Production Database Schema
-- Multi-Tenant PostgreSQL Schema with Supabase Auth & Row Level Security (RLS)

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ORGANIZATIONS
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('municipality', 'university', 'residential_community', 'commercial_building', 'hotel', 'industrial_park', 'waste_company', 'circular_org')),
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    contact_email TEXT NOT NULL,
    subscription_plan TEXT NOT NULL DEFAULT 'starter' CHECK (subscription_plan IN ('starter', 'professional', 'enterprise')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USERS / PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('citizen', 'collector', 'supervisor', 'admin', 'recycler', 'platform_admin')),
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    is_verified BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ZONES
CREATE TABLE IF NOT EXISTS public.zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    boundary_geojson JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. HOUSEHOLDS
CREATE TABLE IF NOT EXISTS public.households (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    zone_id UUID REFERENCES public.zones(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    qr_code_token TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COLLECTORS
CREATE TABLE IF NOT EXISTS public.collectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
    badge_number TEXT NOT NULL,
    shift_status TEXT DEFAULT 'offline' CHECK (shift_status IN ('offline', 'on_duty', 'on_break')),
    assigned_vehicle_id UUID,
    current_latitude DOUBLE PRECISION,
    current_longitude DOUBLE PRECISION,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. VEHICLES
CREATE TABLE IF NOT EXISTS public.vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    registration_number TEXT NOT NULL,
    type TEXT NOT NULL,
    capacity_kg DOUBLE PRECISION NOT NULL,
    current_load_kg DOUBLE PRECISION DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'assigned', 'on_route', 'near_capacity', 'maintenance', 'offline')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PROCESSING FACILITIES
CREATE TABLE IF NOT EXISTS public.processing_facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('coarse_sorting', 'mrf', 'composting_plant', 'special_waste_facility', 'waste_to_energy', 'landfill')),
    address TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    daily_capacity_tons DOUBLE PRECISION DEFAULT 50.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. RECYCLERS
CREATE TABLE IF NOT EXISTS public.recyclers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    verification_status TEXT DEFAULT 'verified' CHECK (verification_status IN ('pending', 'verified', 'suspended', 'rejected')),
    accepted_materials JSONB NOT NULL,
    service_area TEXT NOT NULL,
    capacity_kg_per_day DOUBLE PRECISION DEFAULT 5000.0,
    contact_phone TEXT NOT NULL,
    rating DOUBLE PRECISION DEFAULT 4.8,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. COLLECTIONS
CREATE TABLE IF NOT EXISTS public.collections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    household_id UUID REFERENCES public.households(id) ON DELETE CASCADE,
    collector_id UUID REFERENCES public.collectors(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    zone_id UUID REFERENCES public.zones(id) ON DELETE CASCADE,
    type TEXT NOT NULL DEFAULT 'normal' CHECK (type IN ('normal', 'on_demand', 'special', 'e_waste', 'bulky')),
    waste_category TEXT NOT NULL CHECK (waste_category IN ('mixed', 'wet_organic', 'dry_recyclable', 'e_waste', 'appliances', 'bulky', 'hazardous')),
    scheduled_window_start TIMESTAMPTZ NOT NULL,
    scheduled_window_end TIMESTAMPTZ NOT NULL,
    status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'requested', 'assigned', 'accepted', 'collector_en_route', 'arrived', 'collected', 'processed', 'missed', 'skipped', 'cancelled')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
    priority_reason TEXT,
    estimated_weight_kg DOUBLE PRECISION DEFAULT 5.0,
    actual_weight_kg DOUBLE PRECISION,
    segregation_verified BOOLEAN DEFAULT false,
    evidence_image_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. WASTE BATCHES (End-to-End Traceability)
CREATE TABLE IF NOT EXISTS public.waste_batches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_code TEXT UNIQUE NOT NULL, -- e.g. WL-2026-000184
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    collection_id UUID REFERENCES public.collections(id) ON DELETE SET NULL,
    waste_category TEXT NOT NULL,
    actual_weight_kg DOUBLE PRECISION NOT NULL,
    collector_id UUID REFERENCES public.collectors(id),
    vehicle_id UUID REFERENCES public.vehicles(id),
    processing_facility_id UUID REFERENCES public.processing_facilities(id),
    coarse_separation_status TEXT DEFAULT 'pending' CHECK (coarse_separation_status IN ('pending', 'in_progress', 'completed')),
    organic_fraction_kg DOUBLE PRECISION DEFAULT 0.0,
    dry_fraction_kg DOUBLE PRECISION DEFAULT 0.0,
    special_fraction_kg DOUBLE PRECISION DEFAULT 0.0,
    residual_fraction_kg DOUBLE PRECISION DEFAULT 0.0,
    recycler_id UUID REFERENCES public.recyclers(id),
    final_status TEXT DEFAULT 'in_transit' CHECK (final_status IN ('in_transit', 'received_at_facility', 'coarse_separated', 'recovered', 'recycled', 'composted', 'landfilled')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. RECYCLING TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.recycling_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    waste_batch_id UUID NOT NULL REFERENCES public.waste_batches(id) ON DELETE CASCADE,
    recycler_id UUID NOT NULL REFERENCES public.recyclers(id) ON DELETE CASCADE,
    material_type TEXT NOT NULL,
    weight_kg DOUBLE PRECISION NOT NULL,
    agreed_value_usd DOUBLE PRECISION DEFAULT 0.0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'collected', 'completed', 'cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. COMPLAINTS & SERVICE REQUESTS
CREATE TABLE IF NOT EXISTS public.complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_code TEXT UNIQUE NOT NULL, -- e.g. TKT-88491
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    household_id UUID REFERENCES public.households(id) ON DELETE SET NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    category TEXT NOT NULL CHECK (category IN ('missed_collection', 'illegal_dumping', 'overflow', 'poor_service', 'damaged_bin', 'other')),
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    description TEXT NOT NULL,
    evidence_image_url TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    status TEXT DEFAULT 'reported' CHECK (status IN ('reported', 'verified', 'assigned', 'in_progress', 'resolved', 'closed')),
    assigned_supervisor_id UUID REFERENCES public.profiles(id),
    is_auto_escalated BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. IoT SMART BINS
CREATE TABLE IF NOT EXISTS public.iot_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_code TEXT UNIQUE NOT NULL,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    zone_id UUID REFERENCES public.zones(id),
    location_name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    fill_level_percent INT DEFAULT 0,
    battery_level_percent INT DEFAULT 100,
    temperature_celsius DOUBLE PRECISION DEFAULT 25.0,
    last_ping TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'warning', 'overflow_imminent', 'offline'))
);

-- 14. AUDIT LOGS
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    details JSONB,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collectors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.waste_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recyclers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recycling_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.iot_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper RLS function: retrieve organization_id of current session user
CREATE OR REPLACE FUNCTION public.get_auth_user_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Universal Tenant Isolation Policy Example for collections
CREATE POLICY tenant_collections_policy ON public.collections
    FOR ALL
    USING (organization_id = public.get_auth_user_org_id());

CREATE POLICY tenant_waste_batches_policy ON public.waste_batches
    FOR ALL
    USING (organization_id = public.get_auth_user_org_id());

CREATE POLICY tenant_complaints_policy ON public.complaints
    FOR ALL
    USING (organization_id = public.get_auth_user_org_id());

CREATE POLICY tenant_vehicles_policy ON public.vehicles
    FOR ALL
    USING (organization_id = public.get_auth_user_org_id());

-- Indexes for maximum query performance
CREATE INDEX IF NOT EXISTS idx_collections_org_status ON public.collections(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_collections_date ON public.collections(scheduled_window_start);
CREATE INDEX IF NOT EXISTS idx_waste_batches_code ON public.waste_batches(batch_code);
CREATE INDEX IF NOT EXISTS idx_complaints_org_status ON public.complaints(organization_id, status);
CREATE INDEX IF NOT EXISTS idx_iot_devices_fill ON public.iot_devices(organization_id, fill_level_percent);
