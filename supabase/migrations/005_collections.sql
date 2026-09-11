-- Migration: 005_collections.sql
-- Description: Create zones, households, collection_schedules, collections, and collection_events

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
    recurrence_pattern TEXT NOT NULL DEFAULT 'Daily', -- Daily, Weekly, Custom
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

CREATE TABLE IF NOT EXISTS collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    household_id UUID REFERENCES households(id) ON DELETE SET NULL,
    collector_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    supervisor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    vehicle_id UUID,
    zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
    collection_type TEXT NOT NULL DEFAULT 'Regular', -- Regular, Special, Emergency
    waste_category TEXT NOT NULL DEFAULT 'Mixed',
    scheduled_date DATE NOT NULL DEFAULT CURRENT_DATE,
    scheduled_start TIME,
    scheduled_end TIME,
    actual_start TIMESTAMPTZ,
    actual_completion TIMESTAMPTZ,
    estimated_weight NUMERIC(10, 2) DEFAULT 0.0,
    actual_weight NUMERIC(10, 2),
    status collection_status_enum NOT NULL DEFAULT 'scheduled',
    priority TEXT NOT NULL DEFAULT 'Normal', -- Low, Normal, High, Urgent
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
