-- Migration: 015_material_batch_events.sql
-- Description: Audit-grade Live Material Batch Events table & Supabase Realtime publishing for WasteLoop

CREATE TABLE IF NOT EXISTS public.material_batch_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    batch_id UUID NOT NULL REFERENCES public.waste_batches(id) ON DELETE CASCADE,
    batch_code TEXT NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'SOURCE',
        'COLLECTED',
        'IN_TRANSIT',
        'ARRIVED_AT_FACILITY',
        'SEGREGATION',
        'RECOVERED',
        'ASSIGNED_TO_RECYCLER',
        'IN_TRANSIT_TO_RECYCLER',
        'ARRIVED_AT_RECYCLER',
        'ACCEPTED_BY_RECYCLER',
        'PROCESSING',
        'RECYCLED',
        'EXCEPTION'
    )),
    previous_status TEXT,
    new_status TEXT NOT NULL,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    actor_name TEXT NOT NULL,
    actor_role TEXT NOT NULL,
    location_name TEXT NOT NULL,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
    collector_id UUID REFERENCES public.collectors(id) ON DELETE SET NULL,
    recycler_id UUID REFERENCES public.recyclers(id) ON DELETE SET NULL,
    weight_kg DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    notes TEXT,
    weight_discrepancy_flag BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policy for Tenant Isolation
ALTER TABLE public.material_batch_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_batch_events_policy ON public.material_batch_events
    FOR ALL
    USING (organization_id = public.get_auth_user_org_id());

-- Indexes for lightning fast timeline queries
CREATE INDEX IF NOT EXISTS idx_batch_events_batch_id ON public.material_batch_events(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_events_timestamp ON public.material_batch_events(timestamp DESC);

-- Enable Supabase Realtime Publication for material_batch_events
ALTER PUBLICATION supabase_realtime ADD TABLE public.material_batch_events;
