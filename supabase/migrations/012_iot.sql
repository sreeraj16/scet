-- Migration: 012_iot.sql
-- Description: Create iot_devices and iot_readings tables

CREATE TABLE IF NOT EXISTS iot_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    device_code TEXT UNIQUE NOT NULL,
    zone_id UUID REFERENCES zones(id) ON DELETE SET NULL,
    location_name TEXT NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    fill_level_pct NUMERIC(5, 2) DEFAULT 0.0,
    weight_kg NUMERIC(8, 2) DEFAULT 0.0,
    temperature_c NUMERIC(5, 2) DEFAULT 25.0,
    battery_pct NUMERIC(5, 2) DEFAULT 100.0,
    device_health TEXT DEFAULT 'Optimal',
    is_simulated_sensor BOOLEAN DEFAULT true,
    last_ping TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS iot_readings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    device_id UUID NOT NULL REFERENCES iot_devices(id) ON DELETE CASCADE,
    fill_level_pct NUMERIC(5, 2) NOT NULL,
    weight_kg NUMERIC(8, 2),
    temperature_c NUMERIC(5, 2),
    battery_pct NUMERIC(5, 2),
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_iot_devices_org ON iot_devices(organization_id);
