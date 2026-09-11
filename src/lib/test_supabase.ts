import { supabase, isSupabaseConfigured } from './supabase';
import { supabaseDb } from './supabaseDb';

async function runEmpiricalSupabaseAudit() {
  console.log('=== SUPABASE EMPIRICAL CONNECTION AUDIT ===');
  console.log('Is Configured:', isSupabaseConfigured());

  // 1. Audit tables
  const tables = [
    'organizations',
    'users',
    'collections',
    'waste_batches',
    'material_batch_events',
    'vehicles',
    'collectors',
    'complaints',
    'iot_devices',
    'audit_logs',
    'event_outbox',
    'security_audit_logs'
  ];

  console.log('\n--- Checking Table Existence & Read Access ---');
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`❌ Table [${table}]: ERROR - ${error.code} (${error.message})`);
    } else {
      console.log(`✅ Table [${table}]: OK (${data ? data.length : 0} rows inspected)`);
    }
  }

  // 2. Test Write/Insert into collections using custom string ID format
  console.log('\n--- Testing Custom String ID Write Access ---');
  const customColId = `col-task-${Date.now()}`;
  const testCol = {
    id: customColId,
    organization_id: 'org-scet-01',
    zone_id: 'zone-1',
    type: 'normal' as const,
    waste_category: 'dry_recyclable' as const,
    scheduled_window_start: new Date().toISOString(),
    scheduled_window_end: new Date(Date.now() + 3600000).toISOString(),
    status: 'requested' as const,
    priority: 'medium' as const,
    estimated_weight_kg: 8.5,
    household_address: 'Supabase Verification Address',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  const writeSuccess = await supabaseDb.upsertCollection(testCol);
  if (writeSuccess) {
    console.log(`✅ Custom String ID Write Test: Successfully inserted record (${customColId}) into collections table!`);
    // Clean up test row
    const { error: delErr } = await supabase.from('collections').delete().eq('id', customColId);
    if (!delErr) {
      console.log('✅ Cleanup Test: Successfully removed temporary test record!');
    }
  } else {
    console.log('❌ Write Test FAILED: Could not insert into collections table.');
  }

  console.log('\n=== AUDIT COMPLETE ===');
}

runEmpiricalSupabaseAudit();
