-- Migration: 007_processing.sql
-- Description: Create processing_facilities and waste_processing_events tables

CREATE TABLE IF NOT EXISTS processing_facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    facility_type TEXT NOT NULL, -- Ward-level micro-processing, MRF, Composting, Bioprocessing, E-waste processing, Specialized processing, Disposal
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
    event_type TEXT NOT NULL, -- Received, Coarse Separated, Sorted, Recovered, Recycled, Composted, Disposed
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

CREATE INDEX IF NOT EXISTS idx_facilities_org ON processing_facilities(organization_id);
