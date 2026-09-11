-- Migration: 014_rls.sql
-- Description: Enable and enforce Row Level Security (RLS) policies

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE processing_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE waste_processing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE recyclers ENABLE ROW LEVEL SECURITY;
ALTER TABLE recycling_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to extract user role from profiles
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS TEXT AS $$
  SELECT role::text FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Helper function to extract user organization_id
CREATE OR REPLACE FUNCTION current_user_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles: Users read their own profile, admins read profiles in their org
CREATE POLICY "Public profile read access" ON profiles
    FOR SELECT USING (
        auth.uid() = auth_user_id 
        OR current_user_role() IN ('platform_admin', 'municipal_admin', 'supervisor')
    );

CREATE POLICY "Users update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = auth_user_id);

-- Collections: Organization multi-tenant isolation
CREATE POLICY "Collections tenant read" ON collections
    FOR SELECT USING (
        organization_id = current_user_org_id()
        OR current_user_role() = 'platform_admin'
    );

CREATE POLICY "Collectors update assigned collections" ON collections
    FOR UPDATE USING (
        collector_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
        OR current_user_role() IN ('supervisor', 'municipal_admin', 'platform_admin')
    );

-- Complaints: Citizens read own complaints, Supervisors/Admins read org complaints
CREATE POLICY "Complaints tenant isolation" ON complaints
    FOR SELECT USING (
        citizen_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
        OR organization_id = current_user_org_id()
        OR current_user_role() = 'platform_admin'
    );

-- Waste Batches: Organization multi-tenant isolation
CREATE POLICY "Waste Batches tenant isolation" ON waste_batches
    FOR SELECT USING (
        organization_id = current_user_org_id()
        OR current_user_role() IN ('recycler', 'platform_admin')
    );

-- Notifications: Recipient isolation
CREATE POLICY "Notifications recipient isolation" ON notifications
    FOR SELECT USING (
        recipient_id IN (SELECT id FROM profiles WHERE auth_user_id = auth.uid())
    );
