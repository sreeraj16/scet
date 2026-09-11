-- Migration: 017_advanced_architecture_schema.sql
-- Description: Production Event Outbox, Audit Logging, and Geospatial Intelligence Schema

-- 1. EVENT OUTBOX TABLE (Asynchronous Reliable Messaging & Deduplication)
CREATE TABLE IF NOT EXISTS public.event_outbox (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type TEXT NOT NULL,
    aggregate_type TEXT NOT NULL,
    aggregate_id TEXT NOT NULL,
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    payload JSONB NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'dead_letter')),
    retry_count INT DEFAULT 0,
    max_retries INT DEFAULT 3,
    next_retry_at TIMESTAMPTZ DEFAULT NOW(),
    idempotency_key TEXT UNIQUE NOT NULL,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    processed_at TIMESTAMPTZ
);

-- 2. SECURITY AUDIT LOGS TABLE (Privileged Operations & Compliance Audit Trail)
CREATE TABLE IF NOT EXISTS public.security_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    action TEXT NOT NULL,
    target_entity TEXT NOT NULL,
    target_id TEXT NOT NULL,
    previous_state JSONB,
    new_state JSONB,
    ip_address TEXT,
    anomaly_flag BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. GEOSPATIAL ZONES & RISK BOUNDARIES TABLE
CREATE TABLE IF NOT EXISTS public.geospatial_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    code TEXT NOT NULL,
    boundary_geojson JSONB NOT NULL,
    center_latitude DOUBLE PRECISION,
    center_longitude DOUBLE PRECISION,
    risk_level TEXT DEFAULT 'LOW' CHECK (risk_level IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    active_collection_count INT DEFAULT 0,
    complaint_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RLS POLICIES FOR TENANT ISOLATION
ALTER TABLE public.event_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.geospatial_zones ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'event_outbox' AND policyname = 'tenant_event_outbox_policy'
    ) THEN
        CREATE POLICY tenant_event_outbox_policy ON public.event_outbox
            FOR ALL USING (organization_id = public.get_auth_user_org_id());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'security_audit_logs' AND policyname = 'tenant_audit_logs_policy'
    ) THEN
        CREATE POLICY tenant_audit_logs_policy ON public.security_audit_logs
            FOR ALL USING (organization_id = public.get_auth_user_org_id());
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'geospatial_zones' AND policyname = 'tenant_geospatial_zones_policy'
    ) THEN
        CREATE POLICY tenant_geospatial_zones_policy ON public.geospatial_zones
            FOR ALL USING (organization_id = public.get_auth_user_org_id());
    END IF;
END $$;

-- 5. INDEXES FOR LIGHTNING FAST EVENT & AUDIT RETRIEVAL
CREATE INDEX IF NOT EXISTS idx_outbox_status_next_retry ON public.event_outbox(status, next_retry_at);
CREATE INDEX IF NOT EXISTS idx_outbox_idempotency ON public.event_outbox(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_security_audit_org_action ON public.security_audit_logs(organization_id, action);
CREATE INDEX IF NOT EXISTS idx_geospatial_zones_org_risk ON public.geospatial_zones(organization_id, risk_level);

-- 6. SUPABASE REALTIME PUBLICATION SETUP
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'event_outbox'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.event_outbox;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'security_audit_logs'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.security_audit_logs;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;
