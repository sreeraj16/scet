-- Migration: 010_notifications.sql
-- Description: Create notifications table for Realtime and in-app updates

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- Collection Completed, Missed Collection, Special Pickup Assigned, SLA Breach, Anomaly
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    entity_id UUID, -- collection_id, complaint_id, etc.
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_recipient ON notifications(recipient_id, read);
