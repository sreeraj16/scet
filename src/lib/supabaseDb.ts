import { supabase, isSupabaseConfigured } from './supabase';
import { CollectionItem, WasteBatch, WasteBatchEvent, Collector, Complaint, AuditLog } from '../types';

/**
 * WasteLoop 2.0 — Supabase Persistence Engine
 * Handles bi-directional synchronization and direct database operations for WasteLoop entities.
 */

// Helper to filter out undefined or custom UI non-column properties before inserting/upserting to Supabase
function sanitizeRecord<T extends Record<string, any>>(record: T): Record<string, any> {
  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(record)) {
    if (value !== undefined) {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export const supabaseDb = {
  // ==================== COLLECTIONS ====================
  async fetchCollections(): Promise<CollectionItem[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('collections')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase DB] Failed to fetch collections:', error.message);
        return null;
      }
      return data as CollectionItem[];
    } catch (e) {
      console.warn('[Supabase DB] Exception fetching collections:', e);
      return null;
    }
  },

  async upsertCollection(collection: Partial<CollectionItem> & { id: string }): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const payload = sanitizeRecord(collection);
      const { error } = await supabase.from('collections').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('[Supabase DB] Error upserting collection:', error.message, payload);
        return false;
      }
      console.log('[Supabase DB] Collection persisted successfully:', collection.id);
      return true;
    } catch (e) {
      console.warn('[Supabase DB] Exception upserting collection:', e);
      return false;
    }
  },

  // ==================== WASTE BATCHES ====================
  async fetchWasteBatches(): Promise<WasteBatch[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase
        .from('waste_batches')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.warn('[Supabase DB] Failed to fetch waste_batches:', error.message);
        return null;
      }
      return data as WasteBatch[];
    } catch (e) {
      console.warn('[Supabase DB] Exception fetching waste_batches:', e);
      return null;
    }
  },

  async upsertWasteBatch(batch: Partial<WasteBatch> & { id: string }): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const payload = sanitizeRecord(batch);
      const { error } = await supabase.from('waste_batches').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('[Supabase DB] Error upserting waste batch:', error.message, payload);
        return false;
      }
      console.log('[Supabase DB] Waste batch persisted successfully:', batch.id);
      return true;
    } catch (e) {
      console.warn('[Supabase DB] Exception upserting waste batch:', e);
      return false;
    }
  },

  // ==================== MATERIAL BATCH EVENTS ====================
  async insertBatchEvent(event: WasteBatchEvent): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const payload = sanitizeRecord(event);
      const { error } = await supabase.from('material_batch_events').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('[Supabase DB] Error inserting material_batch_event:', error.message, payload);
        return false;
      }
      console.log('[Supabase DB] Batch event persisted successfully:', event.id);
      return true;
    } catch (e) {
      console.warn('[Supabase DB] Exception inserting material_batch_event:', e);
      return false;
    }
  },

  // ==================== COLLECTORS ====================
  async fetchCollectors(): Promise<Collector[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('collectors').select('*');
      if (error) {
        console.warn('[Supabase DB] Failed to fetch collectors:', error.message);
        return null;
      }
      return data as Collector[];
    } catch (e) {
      console.warn('[Supabase DB] Exception fetching collectors:', e);
      return null;
    }
  },

  async upsertCollector(collector: Partial<Collector> & { id: string }): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const payload = sanitizeRecord(collector);
      const { error } = await supabase.from('collectors').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('[Supabase DB] Error upserting collector:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[Supabase DB] Exception upserting collector:', e);
      return false;
    }
  },

  // ==================== COMPLAINTS ====================
  async fetchComplaints(): Promise<Complaint[] | null> {
    if (!isSupabaseConfigured()) return null;
    try {
      const { data, error } = await supabase.from('complaints').select('*');
      if (error) {
        console.warn('[Supabase DB] Failed to fetch complaints:', error.message);
        return null;
      }
      return data as Complaint[];
    } catch (e) {
      console.warn('[Supabase DB] Exception fetching complaints:', e);
      return null;
    }
  },

  async upsertComplaint(complaint: Partial<Complaint> & { id: string }): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const payload = sanitizeRecord(complaint);
      const { error } = await supabase.from('complaints').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('[Supabase DB] Error upserting complaint:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[Supabase DB] Exception upserting complaint:', e);
      return false;
    }
  },

  // ==================== AUDIT LOGS ====================
  async insertAuditLog(log: AuditLog): Promise<boolean> {
    if (!isSupabaseConfigured()) return false;
    try {
      const payload = sanitizeRecord(log);
      const { error } = await supabase.from('audit_logs').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('[Supabase DB] Error inserting audit log:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.warn('[Supabase DB] Exception inserting audit log:', e);
      return false;
    }
  }
};
