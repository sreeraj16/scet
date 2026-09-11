-- Migration: 006_routes.sql
-- Description: Create vehicles, routes, and route_stops tables

CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    vehicle_number TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL DEFAULT 'Compactor Truck', -- Compactor Truck, Electric Tipper, E-Rickshaw, Specialized Hauler
    capacity NUMERIC(10, 2) NOT NULL DEFAULT 1000.0, -- kg
    current_load NUMERIC(10, 2) NOT NULL DEFAULT 0.0,
    assigned_collector_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'Active', -- Active, Maintenance, Inactive, En Route
    current_latitude NUMERIC(10, 7),
    current_longitude NUMERIC(10, 7),
    gps_accuracy NUMERIC(5, 2), -- meters
    is_simulated_gps BOOLEAN DEFAULT false,
    maintenance_status TEXT DEFAULT 'Good',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    collector_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Planned', -- Planned, In Progress, Completed, Cancelled
    total_distance_km NUMERIC(6, 2) DEFAULT 0.0,
    estimated_duration_mins INT DEFAULT 0,
    completed_stops INT DEFAULT 0,
    total_stops INT DEFAULT 0,
    route_geometry JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS route_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES routes(id) ON DELETE CASCADE,
    collection_id UUID REFERENCES collections(id) ON DELETE SET NULL,
    stop_sequence INT NOT NULL,
    address TEXT NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    estimated_weight NUMERIC(10, 2) DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'Pending', -- Pending, Arrived, Completed, Skipped
    arrived_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_vehicles_org ON vehicles(organization_id);
CREATE INDEX IF NOT EXISTS idx_routes_org ON routes(organization_id);
