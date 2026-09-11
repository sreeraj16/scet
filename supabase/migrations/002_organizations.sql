-- Migration: 002_organizations.sql
-- Description: Create organizations, settings, and members tables

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
