-- Seed Data: seed.sql
-- Description: Realistic multi-tenant demo environment for WasteLoop Phase 2

-- Insert Organizations
INSERT INTO organizations (id, name, organization_type, address, city, state, latitude, longitude, contact_phone, contact_email)
VALUES 
('11111111-1111-1111-1111-111111111111', 'Green Valley Municipality', 'Municipality', 'Civil Station, Central Avenue', 'Green Valley', 'Karnataka', 12.9716, 77.5946, '+91 9876543210', 'contact@greenvalley.gov.in'),
('22222222-2222-2222-2222-222222222222', 'Swarnandhra Engineering College', 'College / University', 'Campus Road, Seetharampuram', 'Narsapur', 'Andhra Pradesh', 16.4344, 81.6965, '+91 9876543211', 'admin@swarnandhra.ac.in'),
('33333333-3333-3333-3333-333333333333', 'Grand Palace Hotel & Resort', 'Hotel', 'Beach Road', 'Visakhapatnam', 'Andhra Pradesh', 17.6868, 83.2185, '+91 9876543212', 'operations@grandpalace.com')
ON CONFLICT (id) DO NOTHING;

-- Insert User Profiles for Green Valley Municipality
INSERT INTO profiles (id, organization_id, full_name, phone, role, avatar_url)
VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Aarav Sharma', '+91 9123456789', 'citizen', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'Rajesh Kumar', '+91 9123456788', 'collector', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '11111111-1111-1111-1111-111111111111', 'Priya Varma', '+91 9123456787', 'supervisor', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '11111111-1111-1111-1111-111111111111', 'Sreeraj Gantimall', '+91 9123456786', 'municipal_admin', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '11111111-1111-1111-1111-111111111111', 'Green Earth Recycling Co.', '+91 9123456785', 'recycler', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100')
ON CONFLICT (id) DO NOTHING;

-- Insert Zones
INSERT INTO zones (id, organization_id, name, description, center_latitude, center_longitude)
VALUES
('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Zone 1 - North Sector', 'Residential residential and market area', 12.9750, 77.5900),
('a2222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Zone 2 - Commercial Hub', 'High density market and shopping centers', 12.9680, 77.6000)
ON CONFLICT (id) DO NOTHING;

-- Insert Vehicles
INSERT INTO vehicles (id, organization_id, vehicle_number, type, capacity, current_load, assigned_collector_id, status, current_latitude, current_longitude, gps_accuracy)
VALUES
('b1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'KA-01-EA-2026', 'Compactor Truck', 1500.0, 420.0, 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'En Route', 12.9730, 77.5920, 8.5)
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Waste Batches
INSERT INTO waste_batches (id, batch_code, organization_id, source_type, waste_category, material_type, estimated_weight, actual_weight, current_location, current_stage)
VALUES
('c1111111-1111-1111-1111-111111111111', 'WL-2026-000184', '11111111-1111-1111-1111-111111111111', 'Household Collection', 'Dry / Recyclable', 'HDPE Plastics', 50.0, 48.0, 'MRF Ward 4', 'Coarse Separated')
ON CONFLICT (id) DO NOTHING;

-- Insert Sample Complaint & Evidence
INSERT INTO complaints (id, organization_id, citizen_id, complaint_type, description, latitude, longitude, address, priority, status)
VALUES
('d1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Illegal Dumping', 'Overflowing garbage dumped near public park entrance.', 12.9740, 77.5930, '4th Main Road, North Sector', 'High', 'Reported')
ON CONFLICT (id) DO NOTHING;

INSERT INTO complaint_evidence (id, evidence_code, complaint_id, image_url, authenticity_confidence, suspicion_status, verification_recommendation)
VALUES
('e1111111-1111-1111-1111-111111111111', 'WL-EV-2026-000019', 'd1111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=500', 89.0, 'Normal', 'Manual verification recommended')
ON CONFLICT (id) DO NOTHING;
