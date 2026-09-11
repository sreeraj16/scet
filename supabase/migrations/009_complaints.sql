-- Migration: 009_complaints.sql
-- Description: Create complaints and complaint_evidence tables with WL-EV evidence tracking

CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    citizen_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_supervisor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    assigned_collector_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    complaint_type TEXT NOT NULL, -- Missed Collection, Illegal Dumping, Overflow, Poor Collection, Damaged Bin, Other
    description TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    address TEXT,
    priority TEXT NOT NULL DEFAULT 'Normal', -- Normal, High, Urgent
    status TEXT NOT NULL DEFAULT 'Reported', -- Reported, Verified, Assigned, In Progress, Resolved, Closed
    sla_timer_start TIMESTAMPTZ DEFAULT NOW(),
    sla_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '24 hours'),
    sla_breached BOOLEAN DEFAULT false,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS complaint_evidence (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    evidence_code TEXT UNIQUE NOT NULL, -- WL-EV-2026-000019
    complaint_id UUID REFERENCES complaints(id) ON DELETE CASCADE,
    uploaded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    image_url TEXT NOT NULL,
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    authenticity_confidence NUMERIC(5, 2) DEFAULT 89.0,
    suspicion_status TEXT DEFAULT 'Normal', -- Normal, Duplicate, Suspicious, Possible AI Manipulation
    verification_recommendation TEXT DEFAULT 'Manual verification recommended',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_org ON complaints(organization_id);
CREATE INDEX IF NOT EXISTS idx_evidence_code ON complaint_evidence(evidence_code);
