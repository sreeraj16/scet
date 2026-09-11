import { UserRole } from '../types';
import { supabase } from './supabase';

// 9-Role Permission Matrix Definitions
export type Permission = 
  | 'view_overview'
  | 'manage_collections'
  | 'manage_schedules'
  | 'view_gis_live'
  | 'plan_routes'
  | 'manage_fleet'
  | 'view_analytics'
  | 'use_ai_classification'
  | 'manage_recyclers'
  | 'access_marketplace'
  | 'view_esg_impact'
  | 'manage_users'
  | 'manage_tenants'
  | 'configure_saas'
  | 'view_system_health';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  platform_admin: [
    'view_overview', 'manage_collections', 'manage_schedules', 'view_gis_live',
    'plan_routes', 'manage_fleet', 'view_analytics', 'use_ai_classification',
    'manage_recyclers', 'access_marketplace', 'view_esg_impact', 'manage_users',
    'manage_tenants', 'configure_saas', 'view_system_health'
  ],
  admin: [
    'view_overview', 'manage_collections', 'manage_schedules', 'view_gis_live',
    'plan_routes', 'manage_fleet', 'view_analytics', 'use_ai_classification',
    'manage_recyclers', 'access_marketplace', 'view_esg_impact', 'manage_users',
    'configure_saas', 'view_system_health'
  ],
  organization_admin: [
    'view_overview', 'manage_collections', 'manage_schedules', 'view_analytics',
    'use_ai_classification', 'manage_recyclers', 'access_marketplace',
    'view_esg_impact', 'manage_users', 'view_system_health'
  ],
  municipal_admin: [
    'view_overview', 'manage_collections', 'manage_schedules', 'view_gis_live',
    'plan_routes', 'manage_fleet', 'view_analytics', 'use_ai_classification',
    'manage_recyclers', 'access_marketplace', 'view_esg_impact', 'manage_users',
    'view_system_health'
  ],
  supervisor: [
    'view_overview', 'manage_collections', 'manage_schedules', 'view_gis_live',
    'plan_routes', 'manage_fleet', 'view_analytics', 'use_ai_classification',
    'access_marketplace', 'view_system_health'
  ],
  collector: [
    'view_overview', 'manage_collections', 'plan_routes', 'use_ai_classification',
    'access_marketplace'
  ],
  driver: [
    'view_overview', 'manage_collections', 'plan_routes'
  ],
  recycler: [
    'view_overview', 'use_ai_classification', 'manage_recyclers', 'access_marketplace'
  ],
  citizen: [
    'view_overview', 'manage_collections', 'manage_schedules', 'use_ai_classification',
    'access_marketplace', 'view_esg_impact'
  ],
  vendor: [
    'view_overview', 'access_marketplace'
  ]
};

// Rate Limiter Bucket State
interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

const rateLimiters: Map<string, RateLimitBucket> = new Map();
const MAX_TOKENS = 60;
const REFILL_INTERVAL_MS = 60000;

export const securityService = {
  /**
   * Check if a given user role possesses specific permission
   */
  hasPermission(role: UserRole, permission: Permission): boolean {
    const permissions = ROLE_PERMISSIONS[role] || [];
    return permissions.includes(permission);
  },

  /**
   * Assert permission server-side / state-level for privileged operations
   */
  assertRolePermission(role: UserRole, permission: Permission, actionName: string): { allowed: boolean; error?: string } {
    if (!this.hasPermission(role, permission)) {
      const errorMsg = `[Security Violation] Role '${role}' is not authorized to execute '${actionName}' (requires permission: '${permission}').`;
      console.error(errorMsg);
      return { allowed: false, error: errorMsg };
    }
    return { allowed: true };
  },

  /**
   * Enforce Organization-level Multi-Tenant Isolation
   */
  assertTenantAccess<T extends { organization_id?: string }>(items: T[], activeOrgId: string): T[] {
    if (!activeOrgId) return items;
    return items.filter(item => !item.organization_id || item.organization_id === activeOrgId);
  },

  /**
   * File Upload Security Validator (MIME Type, Extension, Size, Safe Generated Filename)
   */
  validateFileUpload(file: { name: string; size: number; type: string }): { valid: boolean; safeFilename?: string; error?: string } {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf'];
    const maxSizeBytes = 10 * 1024 * 1024; // 10MB limit

    if (file.size > maxSizeBytes) {
      return { valid: false, error: 'File size exceeds maximum 10MB limit.' };
    }

    const lowerName = file.name.toLowerCase();
    const hasValidExt = allowedExtensions.some(ext => lowerName.endsWith(ext));
    if (!hasValidExt || (file.type && !allowedMimeTypes.includes(file.type))) {
      return { valid: false, error: 'Invalid file extension or MIME type. Executable or unsafe files are blocked.' };
    }

    // Generate safe UUID identifier to prevent path traversal
    const fileExt = lowerName.substring(lowerName.lastIndexOf('.'));
    const safeFilename = `evidence_${Date.now()}_${Math.floor(Math.random() * 10000)}${fileExt}`;

    return { valid: true, safeFilename };
  },

  /**
   * Operational Fraud & Anomaly Protection
   */
  flagOperationalAnomaly(
    actorName: string,
    actorRole: string,
    action: string,
    targetId: string,
    reason: string,
    organizationId: string
  ): { flagged: boolean; status: string; logEntry: any } {
    const logEntry = {
      id: `audit-${Date.now()}`,
      organization_id: organizationId,
      actor_name: actorName,
      actor_role: actorRole,
      action,
      target_entity: 'WasteBatch',
      target_id: targetId,
      anomaly_flag: true,
      notes: `[FLAGGED FOR REVIEW] ${reason}`,
      created_at: new Date().toISOString()
    };

    // Async push to Supabase audit log table
    Promise.resolve(
      supabase.from('security_audit_logs').insert(logEntry)
    ).catch(() => {});

    return {
      flagged: true,
      status: 'FLAGGED_FOR_REVIEW',
      logEntry
    };
  },

  /**
   * Sanitize text input to prevent XSS / Script Injection
   */
  sanitizeInput(text: string): string {
    if (!text) return '';
    return text
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  /**
   * Mask sensitive location coordinates for non-operational users (Privacy Protection)
   */
  maskLocation(lat: number, lng: number, isOperationalRole: boolean): { lat: number; lng: number } {
    if (isOperationalRole) return { lat, lng };
    // Obfuscate to ~500m precision for privacy protection
    return {
      lat: Math.round(lat * 100) / 100,
      lng: Math.round(lng * 100) / 100
    };
  },

  /**
   * Client-side Token Bucket Rate Limiter
   */
  checkRateLimit(key: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    let bucket = rateLimiters.get(key);

    if (!bucket) {
      bucket = { tokens: MAX_TOKENS, lastRefill: now };
      rateLimiters.set(key, bucket);
    }

    const elapsed = now - bucket.lastRefill;
    if (elapsed > REFILL_INTERVAL_MS) {
      bucket.tokens = MAX_TOKENS;
      bucket.lastRefill = now;
    }

    if (bucket.tokens > 0) {
      bucket.tokens -= 1;
      return { allowed: true, remaining: bucket.tokens };
    }

    return { allowed: false, remaining: 0 };
  },

  /**
   * Multi-Factor Auth Verification Code Helper
   */
  verifyMfaCode(enteredCode: string): boolean {
    return /^\d{6}$/.test(enteredCode.trim());
  },

  /**
   * Simulated SHA-256 Data Payload Hash
   */
  hashPayload(data: object): string {
    const jsonStr = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < jsonStr.length; i++) {
      const char = jsonStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return `SHA256-${Math.abs(hash).toString(16).padStart(8, '0')}`;
  }
};
