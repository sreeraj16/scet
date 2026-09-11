-- Migration: 016_live_batch_traceability.sql
-- Description: Live Event-Driven Material Traceability DB Schema, Atomic Functions, Triggers & Realtime Publishing

-- 1. Enhance public.waste_batches table with live tracking & weight verification fields
ALTER TABLE public.waste_batches 
    ADD COLUMN IF NOT EXISTS collected_weight_kg DOUBLE PRECISION DEFAULT 0.0,
    ADD COLUMN IF NOT EXISTS facility_received_weight_kg DOUBLE PRECISION DEFAULT 0.0,
    ADD COLUMN IF NOT EXISTS recycler_received_weight_kg DOUBLE PRECISION DEFAULT 0.0,
    ADD COLUMN IF NOT EXISTS recovered_weight_kg DOUBLE PRECISION DEFAULT 0.0,
    ADD COLUMN IF NOT EXISTS weight_discrepancy_kg DOUBLE PRECISION DEFAULT 0.0,
    ADD COLUMN IF NOT EXISTS current_location_name TEXT DEFAULT 'Source Generation Point',
    ADD COLUMN IF NOT EXISTS current_latitude DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS current_longitude DOUBLE PRECISION,
    ADD COLUMN IF NOT EXISTS current_responsible_entity TEXT DEFAULT 'Collection Operations',
    ADD COLUMN IF NOT EXISTS last_updated_at TIMESTAMPTZ DEFAULT NOW();

-- 2. Drop old check constraint on final_status if exists and update constraint to match full BatchStageStatus enum
DO $$ 
BEGIN 
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'waste_batches_final_status_check' 
        AND table_name = 'waste_batches'
    ) THEN
        ALTER TABLE public.waste_batches DROP CONSTRAINT waste_batches_final_status_check;
    END IF;
END $$;

-- 3. Ensure material_batch_events exists (from 015)
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

-- 4. Trigger Function: Sync waste_batches on material_batch_events INSERT
CREATE OR REPLACE FUNCTION public.sync_waste_batch_on_event()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.waste_batches
    SET 
        final_status = NEW.new_status,
        current_location_name = NEW.location_name,
        current_latitude = COALESCE(NEW.latitude, current_latitude),
        current_longitude = COALESCE(NEW.longitude, current_longitude),
        current_responsible_entity = NEW.actor_name,
        last_updated_at = NEW.timestamp,
        updated_at = NOW()
    WHERE id = NEW.batch_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if already exists
DROP TRIGGER IF EXISTS trg_sync_waste_batch_event ON public.material_batch_events;

CREATE TRIGGER trg_sync_waste_batch_event
    AFTER INSERT ON public.material_batch_events
    FOR EACH ROW
    EXECUTE FUNCTION public.sync_waste_batch_on_event();

-- 5. Atomic RPC Function to Record Event & Update Batch in single PostgreSQL Transaction
CREATE OR REPLACE FUNCTION public.record_material_batch_event(
    p_batch_id UUID,
    p_batch_code TEXT,
    p_event_type TEXT,
    p_previous_status TEXT,
    p_new_status TEXT,
    p_organization_id UUID,
    p_actor_name TEXT,
    p_actor_role TEXT,
    p_location_name TEXT,
    p_latitude DOUBLE PRECISION DEFAULT NULL,
    p_longitude DOUBLE PRECISION DEFAULT NULL,
    p_vehicle_id UUID DEFAULT NULL,
    p_collector_id UUID DEFAULT NULL,
    p_recycler_id UUID DEFAULT NULL,
    p_weight_kg DOUBLE PRECISION DEFAULT 0.0,
    p_notes TEXT DEFAULT NULL,
    p_weight_discrepancy_flag BOOLEAN DEFAULT false
)
RETURNS UUID AS $$
DECLARE
    v_event_id UUID;
BEGIN
    INSERT INTO public.material_batch_events (
        batch_id,
        batch_code,
        event_type,
        previous_status,
        new_status,
        timestamp,
        organization_id,
        actor_name,
        actor_role,
        location_name,
        latitude,
        longitude,
        vehicle_id,
        collector_id,
        recycler_id,
        weight_kg,
        notes,
        weight_discrepancy_flag
    ) VALUES (
        p_batch_id,
        p_batch_code,
        p_event_type,
        p_previous_status,
        p_new_status,
        NOW(),
        p_organization_id,
        p_actor_name,
        p_actor_role,
        p_location_name,
        p_latitude,
        p_longitude,
        p_vehicle_id,
        p_collector_id,
        p_recycler_id,
        p_weight_kg,
        p_notes,
        p_weight_discrepancy_flag
    ) RETURNING id INTO v_event_id;

    RETURN v_event_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Indexes for Fast Event History & Realtime Queries
CREATE INDEX IF NOT EXISTS idx_batch_events_batch_id ON public.material_batch_events(batch_id);
CREATE INDEX IF NOT EXISTS idx_batch_events_timestamp ON public.material_batch_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_waste_batches_org_status ON public.waste_batches(organization_id, final_status);

-- 7. Supabase Realtime Publication Setup
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'material_batch_events'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.material_batch_events;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' AND tablename = 'waste_batches'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.waste_batches;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        NULL;
END $$;
