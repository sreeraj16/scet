-- Migration: 004_waste.sql
-- Description: Create waste_records and waste_batches tables

CREATE TABLE IF NOT EXISTS waste_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL, -- e.g. household, commercial, market, public
    source_id UUID,
    waste_category TEXT NOT NULL, -- Organic, Plastic, E-waste, Metal, Paper, Glass, Bulky, Hazardous, Mixed
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
    batch_code TEXT UNIQUE NOT NULL, -- WL-2026-000001
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL,
    source_id UUID,
    collection_id UUID,
    waste_category TEXT NOT NULL,
    material_type TEXT,
    estimated_weight NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    actual_weight NUMERIC(10, 2),
    current_location TEXT,
    current_stage TEXT NOT NULL DEFAULT 'Collected', -- Collected, Transported, Received, Coarse Separated, Processed, Recycled, Disposed
    destination TEXT,
    qr_code_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_waste_batches_code ON waste_batches(batch_code);
CREATE INDEX IF NOT EXISTS idx_waste_batches_org ON waste_batches(organization_id);
