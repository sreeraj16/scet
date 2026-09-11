-- Migration: 003_users.sql
-- Description: Create profiles table for Supabase Auth integration with 7 roles

CREATE TYPE user_role_enum AS ENUM (
    'citizen',
    'collector',
    'supervisor',
    'municipal_admin',
    'recycler',
    'organization_admin',
    'platform_admin'
);

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role_enum NOT NULL DEFAULT 'citizen',
    avatar_url TEXT,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_profiles_org ON profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
