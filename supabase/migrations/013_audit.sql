-- Migration: 013_audit.sql
-- Description: Create audit_logs table for system auditing

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- e.g. REASSIGN_TASK, UPDATE_COLLECTION_STATUS, VERIFY_RECYCLER, MANUAL_WEIGHT_OVERRIDE
    entity TEXT NOT NULL, -- collection, complaint, recycler_transaction, user
    entity_id UUID,
    previous_state JSONB,
    new_state JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_org ON audit_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_audit_action ON audit_logs(action);
