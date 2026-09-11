-- ============================================================================
-- WASTELOOP PHASE 2 — COMPLETE UNIFIED SUPABASE DATABASE SCHEMA & SEED DATA
-- Copy and paste this complete SQL script into the Supabase SQL Editor.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ----------------------------------------------------------------------------
-- 2. ORGANIZATIONS
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE organization_type_enum AS ENUM (
        'Municipality',
        'College / University',
        'Hotel',
        'Residential Community',
        'Commercial Building',
        'Institution',
        'Market',
        'Hospital',
        'Transport Hub',
        'Public Place',
        'Construction Area',
        'Municipal Point',
        'Industrial Area',
        'Special Waste Facility',
        'Other'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    organization_type organization_type_enum NOT NULL DEFAULT 'Municipality',
    logo TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    country TEXT DEFAULT 'India',
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    contact_phone TEXT,
    contact_email TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organization_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    sla_complaint_hours INT DEFAULT 24,
    auto_escalate_missed_collections INT DEFAULT 3,
    enable_iot_simulation BOOLEAN DEFAULT true,
    default_timezone TEXT DEFAULT 'Asia/Kolkata',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_org_settings UNIQUE (organization_id)
);

CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    role TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_org_member UNIQUE (organization_id, user_id)
);

-- ----------------------------------------------------------------------------
-- 3. USERS & PROFILES
-- ----------------------------------------------------------------------------
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM (
        'citizen',
        'collector',
        'supervisor',
        'municipal_admin',
        'recycler',
        'organization_admin',
        'platform_admin'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role_enum NOT NULL DEFAULT 'citizen',
    avatar_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_org ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ----------------------------------------------------------------------------
-- 4. WASTE RECORDS & BATCHES (WL-2026-XXXXXX)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS waste_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL,
    source_id UUID,
    waste_category TEXT NOT NULL,
    estimated_weight NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    actual_weight NUMERIC(10, 2),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS waste_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_code TEXT UNIQUE NOT NULL,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL,
    source_id UUID,
    collection_id UUID,
    waste_category TEXT NOT NULL,
    material_type TEXT,
    estimated_weight NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    actual_weight NUMERIC(10, 2),
    current_location TEXT,
    current_stage TEXT NOT NULL DEFAULT 'Collected',
    destination TEXT,
    qr_code_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waste_batches_code ON waste_batches(batch_code);
CREATE INDEX IF NOT EXISTS idx_waste_batches_org ON waste_batches(organization_id);

-- ----------------------------------------------------------------------------
-- 5. ZONES, SCHEDULES, HOUSEHOLDS, COLLECTIONS & EVENTS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS zones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    boundary_geojson JSONB,
    center_latitude NUMERIC(10, 7),
    center_longitude NUMERIC(10, 7),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collection_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
    recurrence_pattern TEXT NOT NULL DEFAULT 'Daily',
    time_window_start TIME NOT NULL,
    time_window_end TIME NOT NULL,
    waste_stream TEXT NOT NULL DEFAULT 'Mixed',
    assigned_collector_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS households (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    address TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
    collection_schedule_id UUID REFERENCES collection_schedules(id) ON DELETE SET NULL,
    household_type TEXT DEFAULT 'Residential',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

DO $$ BEGIN
    CREATE TYPE collection_status_enum AS ENUM (
        'scheduled',
        'requested',
        'assigned',
        'accepted',
        'en_route',
        'arrived',
        'collected',
        'processed',
        'missed',
        'skipped',
        'issue_reported',
        'rescheduled',
        'cancelled'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    household_id UUID REFERENCES households(id) ON DELETE SET NULL,
    collector_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    supervisor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    vehicle_id UUID,
    zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
    collection_type TEXT NOT NULL DEFAULT 'Regular',
    waste_category TEXT NOT NULL DEFAULT 'Mixed',
    scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
    scheduled_start TIME,
    scheduled_end TIME,
    actual_start TIMESTAMPTZ,
    actual_completion TIMESTAMPTZ,
    estimated_weight NUMERIC(10, 2) DEFAULT 0.0,
    actual_weight NUMERIC(10, 2),
    status collection_status_enum NOT NULL DEFAULT 'scheduled',
    priority TEXT NOT NULL DEFAULT 'Normal',
    notes TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collection_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_id UUID NOT NULL REFERENCES collections(id) ON DELETE CASCADE,
    status collection_status_enum NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    notes TEXT,
    evidence_url TEXT,
    metadata JSONB
);

CREATE INDEX IF NOT EXISTS idx_collections_status ON collections(status);
CREATE INDEX IF NOT EXISTS idx_collections_org ON collections(organization_id);

-- ----------------------------------------------------------------------------
-- 6. VEHICLES & ROUTES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vehicle_number TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL DEFAULT 'Compactor Truck',
    capacity NUMERIC(10, 2) NOT NULL DEFAULT 1000.0,
    current_load NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    assigned_collector_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'Active',
    current_latitude NUMERIC(10, 7),
    current_longitude NUMERIC(10, 7),
    gps_accuracy NUMERIC(5, 2),
    is_simulated_gps BOOLEAN DEFAULT false,
    maintenance_status TEXT DEFAULT 'Good',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    collector_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Planned',
    total_distance_km NUMERIC(6, 2) DEFAULT 0.0,
    estimated_duration_mins INT DEFAULT 0,
    completed_stops INT DEFAULT 0,
    total_stops INT DEFAULT 0,
    route_geometry JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS route_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
    stop_sequence INT NOT NULL,
    address TEXT NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    estimated_weight NUMERIC(10, 2) DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'Pending',
    arrived_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 7. PROCESSING FACILITIES & COARSE SEPARATION
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS processing_facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    facility_type TEXT NOT NULL,
    address TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    daily_capacity_tons NUMERIC(8, 2) DEFAULT 10.0,
    current_occupancy_pct NUMERIC(5, 2) DEFAULT 0.0,
    operator_name TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS waste_processing_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    facility_id UUID NOT NULL REFERENCES processing_facilities(id) ON DELETE CASCADE,
    operator_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    input_batch_id UUID REFERENCES waste_batches(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    input_weight NUMERIC(10, 2) NOT NULL,
    organic_heavy_weight NUMERIC(10, 2) DEFAULT 0.0,
    dry_recoverable_weight NUMERIC(10, 2) DEFAULT 0.0,
    special_oversized_weight NUMERIC(10, 2) DEFAULT 0.0,
    residual_weight NUMERIC(10, 2) DEFAULT 0.0,
    recovery_efficiency_pct NUMERIC(5, 2) DEFAULT 0.0,
    evidence_url TEXT,
    notes TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 8. RECYCLERS & TRANSACTIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS recyclers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'Pending',
    license_number TEXT,
    contact_phone TEXT,
    contact_email TEXT,
    address TEXT,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    capacity_kg_per_day NUMERIC(10, 2) DEFAULT 5000.0,
    rating NUMERIC(3, 2) DEFAULT 4.5,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recycler_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recycler_id UUID NOT NULL REFERENCES recyclers(id) ON DELETE CASCADE,
    material_category TEXT NOT NULL,
    sub_type TEXT,
    accepted_rate_per_kg NUMERIC(8, 2) DEFAULT 0.0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recycler_service_areas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recycler_id UUID NOT NULL REFERENCES recyclers(id) ON DELETE CASCADE,
    city TEXT NOT NULL,
    zone_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS recycling_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    waste_batch_id UUID REFERENCES waste_batches(id) ON DELETE SET NULL,
    recycler_id UUID NOT NULL REFERENCES recyclers(id) ON DELETE CASCADE,
    requested_weight NUMERIC(10, 2) NOT NULL,
    accepted_weight NUMERIC(10, 2),
    recovered_material TEXT NOT NULL,
    final_weight NUMERIC(10, 2),
    indicative_value NUMERIC(10, 2) DEFAULT 0.0,
    final_value NUMERIC(10, 2),
    pickup_date TIMESTAMPTZ,
    processing_date TIMESTAMPTZ,
    status TEXT NOT NULL DEFAULT 'Requested',
    evidence_url TEXT,
    certificate_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 9. COMPLAINTS & EVIDENCE (WL-EV-2026-XXXXXX)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    citizen_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_supervisor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_collector_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    complaint_type TEXT NOT NULL,
    description TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    address TEXT,
    priority TEXT NOT NULL DEFAULT 'Normal',
    status TEXT NOT NULL DEFAULT 'Reported',
    sla_timer_start TIMESTAMPTZ DEFAULT NOW(),
    sla_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    sla_breached BOOLEAN DEFAULT false,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS complaint_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_code TEXT UNIQUE NOT NULL,
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    authenticity_confidence NUMERIC(5, 2) DEFAULT 89.0,
    suspicion_status TEXT DEFAULT 'Normal',
    verification_recommendation TEXT DEFAULT 'Manual verification recommended',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 10. NOTIFICATIONS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    entity_id UUID,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 11. AI / ML PREDICTIONS & ANOMALIES
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ai_ml_predictions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    model_type TEXT NOT NULL,
    target_entity_type TEXT NOT NULL,
    target_entity_id UUID,
    prediction_value JSONB NOT NULL,
    confidence_score NUMERIC(5, 2) NOT NULL DEFAULT 85.0,
    explanation TEXT,
    evaluation_metrics JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS anomalies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    anomaly_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    severity TEXT NOT NULL DEFAULT 'Medium',
    description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Flagged',
    flagged_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- ----------------------------------------------------------------------------
-- 12. IOT SMART BINS & TELEMETRY
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS iot_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    device_code TEXT UNIQUE NOT NULL,
    zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
    location_name TEXT NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    fill_level_pct NUMERIC(5, 2) DEFAULT 0.0,
    weight_kg NUMERIC(8, 2) DEFAULT 0.0,
    temperature_c NUMERIC(5, 2) DEFAULT 25.0,
    battery_pct NUMERIC(5, 2) DEFAULT 100.0,
    device_health TEXT DEFAULT 'Optimal',
    is_simulated_sensor BOOLEAN DEFAULT true,
    last_ping TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS iot_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES iot_devices(id) ON DELETE CASCADE,
    fill_level_pct NUMERIC(5, 2) NOT NULL,
    weight_kg NUMERIC(8, 2),
    temperature_c NUMERIC(5, 2),
    battery_pct NUMERIC(5, 2),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 13. AUDIT LOGS
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity TEXT NOT NULL,
    entity_id UUID,
    previous_state JSONB,
    new_state JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ----------------------------------------------------------------------------
-- 14. ROW LEVEL SECURITY (RLS) POLICIES
-- ----------------------------------------------------------------------------
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_processing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE recyclers ENABLE ROW LEVEL SECURITY;
ALTER TABLE recycling_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

CREATE OR REPLACE FUNCTION current_user_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

DO $$ BEGIN
    CREATE POLICY "Public profile read access" ON profiles FOR SELECT USING (auth.uid() = auth_user_id OR current_user_role() IN ('platform_admin', 'municipal_admin', 'supervisor'));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = auth_user_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Collections tenant read" ON collections FOR SELECT USING (organization_id = current_user_org_id() OR current_user_role() = 'platform_admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Collectors update assigned collections" ON collections FOR UPDATE USING (collector_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()) OR current_user_role() IN ('supervisor', 'municipal_admin', 'platform_admin'));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Complaints tenant isolation" ON complaints FOR SELECT USING (citizen_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()) OR organization_id = current_user_org_id() OR current_user_role() = 'platform_admin');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Waste Batches tenant isolation" ON waste_batches FOR SELECT USING (organization_id = current_user_org_id() OR current_user_role() IN ('recycler', 'platform_admin'));
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
    CREATE POLICY "Notifications recipient isolation" ON notifications FOR SELECT USING (recipient_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid()));
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ----------------------------------------------------------------------------
-- 15. DEMO SEED DATA
-- ----------------------------------------------------------------------------
INSERT INTO organizations (id, name, organization_type, address, city, state, latitude, longitude, contact_phone, contact_email)
VALUES 
('11111111-1111-1111-1111-111111111111', 'Green Valley Municipality', 'Municipality', 'Civil Station, Central Avenue', 'Green Valley', 'Karnataka', 12.9716, 77.5946, '+91 9876543210', 'contact@greenvalley.gov.in'),
('22222222-2222-2222-2222-222222222222', 'Swarnandhra Engineering College', 'College / University', 'Campus Road, Seetharampuram', 'Narsapur', 'Andhra Pradesh', 16.4344, 81.6965, '+91 9876543211', 'admin@swarnandhra.ac.in'),
('33333333-3333-3333-3333-333333333333', 'Grand Palace Hotel & Resort', 'Hotel', 'Beach Road', 'Visakhapatnam', 'Andhra Pradesh', 17.6868, 83.2185, '+91 9876543212', 'operations@grandpalace.com')
ON CONFLICT (id) DO NOTHING;

INSERT INTO profiles (id, organization_id, full_name, phone, role, avatar_url)
VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Aarav Sharma', '+91 9123456789', 'citizen', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Rajesh Kumar', '+91 9123456788', 'collector', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Priya Varma', '+91 9123456787', 'supervisor', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'Sreeraj Gantimall', '+91 9123456786', 'municipal_admin', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'Green Earth Recycling Co.', '+91 9123456785', 'recycler', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100')
ON CONFLICT (id) DO NOTHING;

INSERT INTO zones (id, organization_id, name, description, center_latitude, center_longitude)
VALUES
('z1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Zone 1 - North Sector', 'Residential residential and market area', 12.9750, 77.5900),
('z2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Zone 2 - Commercial Hub', 'High density market and shopping centers', 12.9680, 77.6000)
ON CONFLICT (id) DO NOTHING;

INSERT INTO vehicles (id, organization_id, vehicle_number, type, capacity, current_load, assigned_collector_id, status, current_latitude, current_longitude, gps_accuracy)
VALUES
('v1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'KA-01-EA-2026', 'Compactor Truck', 1500.0, 420.0, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'En Route', 12.9730, 77.5920, 8.5)
ON CONFLICT (id) DO NOTHING;

INSERT INTO waste_batches (id, batch_code, organization_id, source_type, waste_category, material_type, estimated_weight, actual_weight, current_location, current_stage)
VALUES
('b1111111-1111-1111-1111-111111111111', 'WL-2026-000184', '11111111-1111-1111-1111-111111111111', 'Household Collection', 'Dry / Recyclable', 'HDPE Plastics', 50.0, 48.0, 'MRF Ward 4', 'Coarse Separated')
ON CONFLICT (id) DO NOTHING;

INSERT INTO complaints (id, organization_id, citizen_id, complaint_type, description, latitude, longitude, address, priority, status)
VALUES
('c1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Illegal Dumping', 'Overflowing garbage dumped near public park entrance.', 12.9740, 77.5930, '4th Main Road, North Sector', 'High', 'Reported')
ON CONFLICT (id) DO NOTHING;

INSERT INTO complaint_evidence (id, evidence_code, complaint_id, image_url, authenticity_confidence, suspicion_status, verification_recommendation)
VALUES
('e1111111-1111-1111-1111-111111111111', 'WL-EV-2026-000019', 'c1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500', 89.0, 'Normal', 'Manual verification recommended')
ON CONFLICT (id) DO NOTHING;
