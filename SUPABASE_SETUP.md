# WasteLoop — Supabase Setup Guide

This guide explains how to deploy the database schema and enable Realtime services for **WasteLoop**.

## 1. Create a Supabase Project
1. Log into your [Supabase Dashboard](https://supabase.com/dashboard).
2. Click **New Project** and set up your project name (e.g. `wasteloop-production`).
3. Copy your **Project URL** and **Anon Key** into `.env.local` / `.env`.

## 2. Execute Migration Files
In the SQL Editor or using Supabase CLI:
Run migration files `001_extensions.sql` through `014_rls.sql` in numerical sequence, followed by `seed.sql`.

## 3. Storage Buckets
Create the following storage buckets in Supabase Storage:
* `waste-images` (Public/Signed access for waste items)
* `complaint-evidence` (Private access for evidence verification)
* `collection-evidence` (Private access for collector proof)
* `recycler-documents` (Private access for business licenses)
* `certificates` (Public/Signed access for recovery certificates)

## 4. Enable Realtime Channels
In the Supabase Dashboard under **Database -> Realtime**, enable replication for tables:
* `collections`
* `collection_events`
* `complaints`
* `vehicles`
* `notifications`
* `iot_devices`
