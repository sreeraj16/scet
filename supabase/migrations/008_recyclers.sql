-- Migration: 008_recyclers.sql
-- Description: Create recyclers, recycler_materials, recycler_service_areas, and recycling_transactions tables

CREATE TABLE IF NOT EXISTS recyclers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    verification_status TEXT NOT NULL DEFAULT 'Pending', -- Pending, Verified, Suspended, Rejected
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
    material_category TEXT NOT NULL, -- Plastic, Paper, Metal, Glass, E-waste, Battery, Textile
    sub_type TEXT, -- HDPE, PET, Copper, Aluminum
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
    status TEXT NOT NULL DEFAULT 'Requested', -- Requested, Accepted, In Transit, Received, Recovered, Completed, Discrepancy Flagged
    evidence_url TEXT,
    certificate_id TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recyclers_status ON recyclers(verification_status);
