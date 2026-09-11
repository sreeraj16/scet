import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Organization, 
  UserProfile, 
  UserRole, 
  CollectionItem, 
  WasteBatch, 
  Complaint, 
  Vehicle, 
  Collector, 
  ProcessingFacility, 
  Recycler, 
  RecyclingTransaction, 
  IoTDevice, 
  AuditLog, 
  NotificationItem,
  WasteCategory,
  MarketplaceListing,
  MarketplaceOffer,
  MarketplaceAuctionBid,
  MarketplaceOrder,
  MaterialDispute,
  MarketplaceReview,
  ListingStatus,
  BatchStageStatus,
  WasteBatchEvent,
  Zone
} from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { supabaseDb } from '../lib/supabaseDb';
import { validateStageTransition, auditWeightDiscrepancy } from '../lib/traceabilityEngine';
import { outboxEngine } from '../lib/outboxEngine';
import { geospatialEngine } from '../lib/geospatialEngine';
import { 
  INITIAL_ORGANIZATIONS, 
  INITIAL_USERS, 
  INITIAL_COLLECTIONS, 
  INITIAL_WASTE_BATCHES, 
  INITIAL_COMPLAINTS, 
  INITIAL_VEHICLES, 
  INITIAL_COLLECTORS, 
  INITIAL_FACILITIES, 
  INITIAL_RECYCLERS, 
  INITIAL_RECYCLING_TRANSACTIONS, 
  INITIAL_IOT_DEVICES, 
  INITIAL_AUDIT_LOGS,
  INITIAL_MARKETPLACE_LISTINGS,
  INITIAL_MARKETPLACE_OFFERS,
  INITIAL_MARKETPLACE_ORDERS,
  INITIAL_MARKETPLACE_DISPUTES,
  INITIAL_MARKETPLACE_REVIEWS,
  INITIAL_ZONES
} from '../lib/demoData';
import { getOfflineQueue, clearSyncedActions } from '../lib/offlineQueue';
import { sendNotificationEmail } from '../lib/emailService';
import { securityService } from '../lib/securityService';
import { eventQueue } from '../lib/eventQueue';
import { reliabilityEngine } from '../lib/reliabilityEngine';

interface AuthContextType {
  // Auth state & actions
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => void;
  logout: () => void;
  register: (fullName: string, email: string, role: UserRole) => void;
  googleLogin: () => void;

  // Tenant & Role
  organizations: Organization[];
  activeOrg: Organization;
  setOrganization: (orgId: string) => void;
  addOrganization: (name: string, category: string) => void;
  activeRole: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: UserProfile;

  // Shell navigation & UI drawers
  activeNavView: string;
  setActiveNavView: (view: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  notificationDrawerOpen: boolean;
  setNotificationDrawerOpen: (open: boolean) => void;
  
  // Realtime Data Collections
  collections: CollectionItem[];
  wasteBatches: WasteBatch[];
  complaints: Complaint[];
  vehicles: Vehicle[];
  collectors: Collector[];
  facilities: ProcessingFacility[];
  recyclers: Recycler[];
  recyclingTransactions: RecyclingTransaction[];
  iotDevices: IoTDevice[];
  auditLogs: AuditLog[];
  zones: Zone[];
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;

  // Zero-Effort Prompt State
  missedCollectionPromptOpen: boolean;
  setMissedCollectionPromptOpen: (open: boolean) => void;

  // Marketplace State & Actions
  marketplaceListings: MarketplaceListing[];
  marketplaceOffers: MarketplaceOffer[];
  marketplaceOrders: MarketplaceOrder[];
  marketplaceDisputes: MaterialDispute[];
  marketplaceReviews: MarketplaceReview[];
  createListing: (listing: Partial<MarketplaceListing>) => void;
  updateListingStatus: (id: string, status: ListingStatus) => void;
  submitOffer: (listingId: string, offerPrice: number, message?: string) => void;
  placeBid: (listingId: string, bidAmount: number) => void;
  acceptOffer: (offerId: string) => void;
  confirmOrderPickup: (orderId: string) => void;
  raiseDispute: (orderId: string, reason: MaterialDispute['reason'], description: string) => void;
  submitReview: (targetUserName: string, rating: number, comment: string) => void;

  // Actions
  addCollection: (newCol: Partial<CollectionItem>) => void;
  markCollectionCompleted: (collectionId: string, actualWeightKg: number, evidenceUrl?: string, segregationVerified?: boolean) => void;
  createSpecialWasteRequest: (category: WasteCategory, notes: string, address: string) => void;
  submitComplaint: (category: Complaint['category'], description: string, image?: string) => void;
  respondToMissedCollectionPrompt: (wasCollected: boolean) => void;
  processCoarseSeparation: (batchId: string, organicKg: number, dryKg: number, specialKg: number, residualKg: number) => void;
  completeRecyclerPickup: (transactionId: string) => void;
  updateBatchStage: (batchId: string, newStatus: BatchStageStatus, locationName: string, actorName: string, notes?: string) => void;
  reassignTask: (collectionId: string, collectorId: string, collectorName: string) => void;
  syncOfflineQueue: () => void;
  isOffline: boolean;
  setIsOffline: (offline: boolean) => void;
  mfaEnabled: boolean;
  toggleMfa: () => void;
  triggerFailureCheck: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // default true for seamless demo
  const [activeNavView, setActiveNavView] = useState<string>('overview');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState<boolean>(false);

  const [organizations, setOrganizations] = useState<Organization[]>(INITIAL_ORGANIZATIONS);
  const [activeOrg, setActiveOrgState] = useState<Organization>(INITIAL_ORGANIZATIONS[0]);
  const [activeRole, setActiveRole] = useState<UserRole>('citizen');
  const [currentUser, setCurrentUser] = useState<UserProfile>(INITIAL_USERS[0]);

  const addOrganization = (name: string, category: string) => {
    const cleanSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const newOrg: Organization = {
      id: `org-${Date.now()}`,
      name,
      slug: cleanSlug,
      type: category as any,
      subscription_plan: 'enterprise',
      created_at: new Date().toISOString(),
      is_active: true,
      category_label: category === 'university' ? 'College Campus' : category === 'restaurant' ? 'Hospitality / Dining' : category === 'office' ? 'Corporate Facility' : 'Municipal District',
      contact_email: `admin@${cleanSlug}.org`,
      icon_name: category === 'university' ? 'GraduationCap' : category === 'restaurant' ? 'Utensils' : category === 'office' ? 'Building2' : 'Landmark',
    };
    setOrganizations(prev => [...prev, newOrg]);
    setActiveOrgState(newOrg);
    logAudit('ORG_ONBOARDED', 'TenantManager', newOrg.id, `Created tenant schema for ${name}`);
  };

  // Auth actions
  const login = (email: string, role?: UserRole) => {
    if (role) setActiveRole(role);
    setIsAuthenticated(true);
    setActiveNavView('overview');
    logAudit('USER_LOGIN', 'Auth', email, `User signed in with role ${role || activeRole}`);
  };

  const logout = () => {
    setIsAuthenticated(false);
    logAudit('USER_LOGOUT', 'Auth', currentUser.id, `User logged out`);
  };

  const register = (fullName: string, email: string, role: UserRole) => {
    setActiveRole(role);
    setCurrentUser(prev => ({
      ...prev,
      full_name: fullName,
      role: role
    }));
    setIsAuthenticated(true);
    setActiveNavView('overview');
    logAudit('USER_REGISTER', 'Auth', email, `New user registered: ${fullName} (${role})`);
  };

  const googleLogin = async () => {
    const redirectUrl = typeof window !== 'undefined' && window.location.origin 
      ? window.location.origin 
      : (import.meta.env.VITE_APP_URL || 'https://swarnandhra.vercel.app');

    try {
      if (isSupabaseConfigured()) {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
            redirectTo: redirectUrl
          }
        });
        if (error) console.warn('[Google OAuth] Supabase OAuth redirect notice:', error.message);
      }
    } catch (e) {
      console.warn('[Google OAuth] Exception launching OAuth:', e);
    }

    const googleUser: UserProfile = {
      id: `usr-google-${Date.now()}`,
      organization_id: activeOrg.id,
      role: activeRole || 'citizen',
      full_name: 'Sreeraj Gantimall',
      email: 'sreeraj.gantimall@gmail.com',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      is_verified: true,
    };
    setCurrentUser(googleUser);
    setIsAuthenticated(true);
    setActiveNavView('overview');
    logAudit('USER_GOOGLE_LOGIN', 'Auth', googleUser.id, `User authenticated via Google Cloud OAuth Client (ID: 900706800189)`);
  };

  // Operational state
  const [collections, setCollections] = useState<CollectionItem[]>(INITIAL_COLLECTIONS);
  const [wasteBatches, setWasteBatches] = useState<WasteBatch[]>(INITIAL_WASTE_BATCHES);
  const [complaints, setComplaints] = useState<Complaint[]>(INITIAL_COMPLAINTS);
  const [vehicles, setVehicles] = useState<Vehicle[]>(INITIAL_VEHICLES);
  const [collectors] = useState<Collector[]>(INITIAL_COLLECTORS);
  const [facilities] = useState<ProcessingFacility[]>(INITIAL_FACILITIES);
  const [recyclers] = useState<Recycler[]>(INITIAL_RECYCLERS);
  const [recyclingTransactions, setRecyclingTransactions] = useState<RecyclingTransaction[]>(INITIAL_RECYCLING_TRANSACTIONS);
  const [iotDevices] = useState<IoTDevice[]>(INITIAL_IOT_DEVICES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(INITIAL_AUDIT_LOGS);
  const [zones] = useState<Zone[]>(INITIAL_ZONES);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [missedCollectionPromptOpen, setMissedCollectionPromptOpen] = useState<boolean>(false);

  // Marketplace State
  const [marketplaceListings, setMarketplaceListings] = useState<MarketplaceListing[]>(INITIAL_MARKETPLACE_LISTINGS);
  const [marketplaceOffers, setMarketplaceOffers] = useState<MarketplaceOffer[]>(INITIAL_MARKETPLACE_OFFERS);
  const [marketplaceOrders, setMarketplaceOrders] = useState<MarketplaceOrder[]>(INITIAL_MARKETPLACE_ORDERS);
  const [marketplaceDisputes, setMarketplaceDisputes] = useState<MaterialDispute[]>(INITIAL_MARKETPLACE_DISPUTES);
  const [marketplaceReviews, setMarketplaceReviews] = useState<MarketplaceReview[]>(INITIAL_MARKETPLACE_REVIEWS);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Collection Completed',
      message: 'Your morning dry recyclable collection was completed successfully (8.5 kg).',
      timestamp: '10 mins ago',
      read: false,
      type: 'success',
    },
    {
      id: 'notif-2',
      title: 'IoT Overflow Warning',
      message: 'Zone 4 Commercial Hub Smart Bin reached 86% fill level.',
      timestamp: '25 mins ago',
      read: false,
      type: 'alert',
    }
  ]);

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Switch Active Tenant
  const setOrganization = (orgId: string) => {
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setActiveOrgState(org);
      logAudit('TENANT_SWITCHED', 'Organization', org.id, `Switched tenant view to ${org.name}`);
    }
  };

  // Sync user profile when role changes
  useEffect(() => {
    const foundUser = INITIAL_USERS.find(u => u.role === activeRole && u.organization_id === activeOrg.id) 
      || { id: `usr-${activeRole}`, organization_id: activeOrg.id, role: activeRole, full_name: `Demo ${activeRole.toUpperCase()}`, is_verified: true };
    setCurrentUser(foundUser);
  }, [activeRole, activeOrg]);

  // Initial Supabase Hydration & Seeding
  useEffect(() => {
    async function hydrateFromSupabase() {
      try {
        const [remoteCols, remoteBatches, remoteCollectors, remoteComplaints] = await Promise.all([
          supabaseDb.fetchCollections(),
          supabaseDb.fetchWasteBatches(),
          supabaseDb.fetchCollectors(),
          supabaseDb.fetchComplaints()
        ]);

        if (remoteCols && remoteCols.length > 0) {
          setCollections(remoteCols);
        } else if (remoteCols && remoteCols.length === 0) {
          for (const c of INITIAL_COLLECTIONS) {
            await supabaseDb.upsertCollection(c);
          }
        }

        if (remoteBatches && remoteBatches.length > 0) {
          setWasteBatches(remoteBatches);
        } else if (remoteBatches && remoteBatches.length === 0) {
          for (const b of INITIAL_WASTE_BATCHES) {
            await supabaseDb.upsertWasteBatch(b);
          }
        }

        if (remoteCollectors && remoteCollectors.length === 0) {
          for (const col of INITIAL_COLLECTORS) {
            await supabaseDb.upsertCollector(col);
          }
        }

        if (remoteComplaints && remoteComplaints.length > 0) {
          setComplaints(remoteComplaints);
        } else if (remoteComplaints && remoteComplaints.length === 0) {
          for (const cmp of INITIAL_COMPLAINTS) {
            await supabaseDb.upsertComplaint(cmp);
          }
        }
      } catch (err) {
        console.warn('[AuthContext] Supabase hydration error:', err);
      }
    }

    hydrateFromSupabase();
  }, []);

  const logAudit = (action: string, entity_type: string, entity_id: string, details: string) => {
    const newEntry: AuditLog = {
      id: `aud-${Date.now()}`,
      organization_id: activeOrg.id,
      user_name: currentUser.full_name,
      role: activeRole,
      action,
      entity_type,
      entity_id,
      details,
      timestamp: new Date().toISOString(),
    };
    setAuditLogs(prev => [newEntry, ...prev]);
    supabaseDb.insertAuditLog(newEntry);
  };

  // Zero-Effort Auto Missed-Collection Trigger Check
  useEffect(() => {
    // Check if there's any collection whose window ended and status is still scheduled/collector_en_route
    const now = new Date();
    const missedCandidate = collections.find(c => 
      c.status === 'collector_en_route' && new Date(c.scheduled_window_end) < now
    );
    if (missedCandidate) {
      setMissedCollectionPromptOpen(true);
    }
  }, [collections]);

  // Actions
  const addCollection = (newCol: Partial<CollectionItem>) => {
    const created: CollectionItem = {
      id: `col-task-${Date.now()}`,
      organization_id: activeOrg.id,
      zone_id: 'zone-1',
      type: newCol.type || 'normal',
      waste_category: newCol.waste_category || 'mixed',
      scheduled_window_start: newCol.scheduled_window_start || new Date().toISOString(),
      scheduled_window_end: newCol.scheduled_window_end || new Date(Date.now() + 7200000).toISOString(),
      status: 'requested',
      priority: newCol.priority || 'medium',
      priority_reason: newCol.priority_reason || 'Special on-demand collection',
      estimated_weight_kg: newCol.estimated_weight_kg || 10.0,
      household_address: newCol.household_address || 'User Address',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setCollections(prev => [created, ...prev]);
    supabaseDb.upsertCollection(created);
    logAudit('COLLECTION_REQUESTED', 'CollectionItem', created.id, `Created ${created.waste_category} collection request.`);

    // Dispatch Pickup Scheduled Email Notification
    sendNotificationEmail({
      toEmail: currentUser.email || 'u638126@gmail.com',
      recipientName: currentUser.full_name,
      eventType: 'PICKUP_SCHEDULED',
      details: {
        scheduleId: created.id,
        address: created.household_address,
        wasteCategory: created.waste_category,
        pickupTime: 'Morning Shift (07:00 AM - 10:00 AM)',
      }
    });
  };

    // Helper to log traceability events onto batches & sync to Supabase Realtime DB
    const addBatchEvent = (batchId: string, event: Omit<WasteBatchEvent, 'id' | 'batch_id' | 'batch_code' | 'organization_id'>) => {
      const b = wasteBatches.find(item => item.id === batchId);
      if (!b) return;

      // Validate Stage Transition
      const transitionCheck = validateStageTransition(b.final_status, event.new_status);
      if (!transitionCheck.valid) {
        console.warn(`[Traceability Warning] ${transitionCheck.reason}`);
      }

      // Check Weight Discrepancy Auditing
      const weightAudit = auditWeightDiscrepancy(
        b.collected_weight_kg || b.actual_weight_kg,
        event.weight_kg
      );

      const nowStr = event.timestamp || new Date().toISOString();
      const newEv: WasteBatchEvent = {
        id: `ev-${Date.now()}-${Math.floor(Math.random()*1000)}`,
        batch_id: b.id,
        batch_code: b.batch_code,
        organization_id: b.organization_id || activeOrg.id,
        weight_discrepancy_flag: weightAudit.hasDiscrepancy || event.weight_discrepancy_flag,
        ...event,
        timestamp: nowStr
      };

      setWasteBatches(prev => prev.map(item => {
        if (item.id === batchId) {
          const updatedEvents = [...(item.events || []), newEv];
          return {
            ...item,
            final_status: event.new_status,
            current_location_name: event.location_name || item.current_location_name,
            current_latitude: event.latitude || item.current_latitude,
            current_longitude: event.longitude || item.current_longitude,
            current_responsible_entity: event.actor_name || item.current_responsible_entity,
            last_updated_at: nowStr,
            events: updatedEvents
          };
        }
        return item;
      }));

      // Async DB Push to Supabase via supabaseDb
      supabaseDb.insertBatchEvent(newEv);
      if (b) {
        supabaseDb.upsertWasteBatch({
          ...b,
          final_status: event.new_status,
          current_location_name: event.location_name || b.current_location_name,
          current_latitude: event.latitude || b.current_latitude,
          current_longitude: event.longitude || b.current_longitude,
          current_responsible_entity: event.actor_name || b.current_responsible_entity,
          last_updated_at: nowStr,
        });
      }
    };

    // Exported function for manual or automated batch stage transitions
    const updateBatchStage = (batchId: string, newStatus: BatchStageStatus, locationName: string, actorName: string, notes?: string) => {
      const b = wasteBatches.find(item => item.id === batchId);
      if (!b) return;

      addBatchEvent(batchId, {
        event_type: newStatus,
        previous_status: b.final_status,
        new_status: newStatus,
        timestamp: new Date().toISOString(),
        actor_name: actorName,
        actor_role: currentUser.role,
        location_name: locationName,
        latitude: b.current_latitude || 16.5420,
        longitude: b.current_longitude || 81.5255,
        weight_kg: b.actual_weight_kg,
        notes: notes || `Batch status updated to ${newStatus}`
      });

      logAudit('BATCH_STATUS_UPDATED', 'WasteBatch', batchId, `Status changed from ${b.final_status} to ${newStatus}`);
    };

  const markCollectionCompleted = (
    collectionId: string, 
    actualWeightKg: number, 
    evidenceUrl?: string, 
    segregationVerified: boolean = true
  ) => {
    const nowStr = new Date().toISOString();
    // Update collection status
    setCollections(prev => prev.map(c => {
      if (c.id === collectionId) {
        const updated = {
          ...c,
          status: 'collected' as const,
          actual_weight_kg: actualWeightKg,
          segregation_verified: segregationVerified,
          evidence_image_url: evidenceUrl,
          updated_at: nowStr,
        };
        supabaseDb.upsertCollection(updated);
        return updated;
      }
      return c;
    }));

    const targetCol = collections.find(c => c.id === collectionId);
    const batchCode = `WL-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    const sourceEvent: WasteBatchEvent = {
      id: `ev-src-${Date.now()}`,
      batch_id: `wb-${Date.now()}`,
      batch_code: batchCode,
      event_type: 'SOURCE',
      new_status: 'SOURCE',
      timestamp: targetCol?.created_at || nowStr,
      organization_id: activeOrg.id,
      actor_name: targetCol?.household_address || 'Source Collection Point',
      actor_role: 'citizen',
      location_name: targetCol?.household_address || 'Household Pickup Location',
      latitude: 16.5450,
      longitude: 81.5280,
      weight_kg: actualWeightKg,
      notes: 'Waste generated and placed at collection curb'
    };

    const collectedEvent: WasteBatchEvent = {
      id: `ev-col-${Date.now()}`,
      batch_id: `wb-${Date.now()}`,
      batch_code: batchCode,
      event_type: 'COLLECTED',
      previous_status: 'SOURCE',
      new_status: 'COLLECTED',
      timestamp: nowStr,
      organization_id: activeOrg.id,
      actor_name: targetCol?.collector_name || currentUser.full_name,
      actor_role: 'collector',
      location_name: targetCol?.household_address || 'Household Pickup Location',
      latitude: 16.5450,
      longitude: 81.5280,
      collector_id: targetCol?.collector_id,
      vehicle_id: targetCol?.vehicle_id,
      weight_kg: actualWeightKg,
      notes: `Scale verified (${actualWeightKg} kg). Segregation verified: ${segregationVerified ? 'YES' : 'NO'}`
    };

    const transitEvent: WasteBatchEvent = {
      id: `ev-transit-${Date.now()}`,
      batch_id: `wb-${Date.now()}`,
      batch_code: batchCode,
      event_type: 'IN_TRANSIT',
      previous_status: 'COLLECTED',
      new_status: 'IN_TRANSIT',
      timestamp: new Date(Date.now() + 60000).toISOString(),
      organization_id: activeOrg.id,
      actor_name: targetCol?.collector_name || currentUser.full_name,
      actor_role: 'collector',
      location_name: 'Campus Main Transit Route',
      latitude: 16.5420,
      longitude: 81.5255,
      vehicle_id: targetCol?.vehicle_id,
      weight_kg: actualWeightKg,
      notes: 'Vehicle en route to Central Sorting Facility'
    };

    // Create Traceable Waste Batch
    const newBatch: WasteBatch = {
      id: `wb-${Date.now()}`,
      batch_code: batchCode,
      organization_id: activeOrg.id,
      collection_id: collectionId,
      waste_category: targetCol?.waste_category || 'mixed',
      actual_weight_kg: actualWeightKg,
      collected_weight_kg: actualWeightKg,
      collector_id: targetCol?.collector_id,
      collector_name: targetCol?.collector_name || currentUser.full_name,
      processing_facility_id: 'fac-01',
      processing_facility_name: 'Central Municipal Coarse Sorting & MRF',
      coarse_separation_status: 'pending',
      organic_fraction_kg: 0,
      dry_fraction_kg: 0,
      special_fraction_kg: 0,
      residual_fraction_kg: 0,
      final_status: 'IN_TRANSIT',
      current_location_name: 'Campus Main Transit Route (Vehicle AP-37-EV-101)',
      current_latitude: 16.5420,
      current_longitude: 81.5255,
      current_responsible_entity: targetCol?.collector_name || currentUser.full_name,
      last_updated_at: nowStr,
      created_at: nowStr,
      events: [sourceEvent, collectedEvent, transitEvent]
    };

    supabaseDb.upsertWasteBatch(newBatch);
    supabaseDb.insertBatchEvent(sourceEvent);
    supabaseDb.insertBatchEvent(collectedEvent);
    supabaseDb.insertBatchEvent(transitEvent);

    // Publish Domain Event to Outbox Architecture
    outboxEngine.publish(
      'collection.completed',
      'Collection',
      collectionId,
      activeOrg.id,
      { collectionId, batchCode, actualWeightKg, collectorName: currentUser.full_name },
      `col-comp:${collectionId}:${nowStr}`
    );

    setWasteBatches(prev => [newBatch, ...prev]);

    // Update vehicle load
    setVehicles(prev => prev.map(v => {
      if (v.id === targetCol?.vehicle_id) {
        const newLoad = v.current_load_kg + actualWeightKg;
        return {
          ...v,
          current_load_kg: newLoad,
          status: newLoad >= v.capacity_kg ? 'near_capacity' : 'on_route'
        };
      }
      return v;
    }));

    logAudit('COLLECTION_COMPLETED', 'CollectionItem', collectionId, `Recorded actual weight: ${actualWeightKg} kg. Generated Batch ${batchCode}`);

    // Dispatch Waste Collected Email Notification
    sendNotificationEmail({
      toEmail: currentUser.email || 'u638126@gmail.com',
      recipientName: currentUser.full_name,
      eventType: 'WASTE_COLLECTED',
      details: {
        collectionId,
        weightKg: actualWeightKg,
        wasteCategory: targetCol?.waste_category || 'Dry Recyclables',
        co2AvoidedKg: actualWeightKg * 1.8,
      }
    });
  };

  const createSpecialWasteRequest = (category: WasteCategory, notes: string, address: string) => {
    addCollection({
      type: 'special',
      waste_category: category,
      estimated_weight_kg: 25.0,
      priority: 'high',
      priority_reason: `Special Waste Concierge request for ${category}`,
      household_address: address,
      notes,
    });
  };

  const submitComplaint = (category: Complaint['category'], description: string, image?: string) => {
    const ticketCode = `TKT-${Math.floor(10000 + Math.random() * 90000)}`;
    const newComplaint: Complaint = {
      id: `cmp-${Date.now()}`,
      ticket_code: ticketCode,
      organization_id: activeOrg.id,
      user_id: currentUser.id,
      reporter_name: currentUser.full_name,
      category,
      severity: category === 'illegal_dumping' ? 'critical' : 'high',
      description,
      evidence_image_url: image,
      status: 'reported',
      is_auto_escalated: false,
      created_at: new Date().toISOString(),
    };

    setComplaints(prev => [newComplaint, ...prev]);
    supabaseDb.upsertComplaint(newComplaint);
    logAudit('COMPLAINT_FILED', 'Complaint', ticketCode, `Filed complaint for ${category}`);
  };

  const respondToMissedCollectionPrompt = (wasCollected: boolean) => {
    setMissedCollectionPromptOpen(false);
    if (!wasCollected) {
      // Citizen pressed NO -> auto-create complaint ticket & notify supervisor
      submitComplaint('missed_collection', 'Automated system prompt: Citizen confirmed morning scheduled collection was missed.');
      setNotifications(prev => [
        {
          id: `notif-miss-${Date.now()}`,
          title: 'Missed Collection Ticket Created',
          message: 'Service request TKT-AUTO created and dispatched to Zone Supervisor.',
          timestamp: 'Just now',
          read: false,
          type: 'escalation'
        },
        ...prev
      ]);
    } else {
      // Citizen clicked YES or did not respond (default YES) -> confirm collection without raising complaint
      logAudit('COLLECTION_CONFIRMED_BY_CITIZEN', 'CollectionItem', 'auto-prompt', 'Citizen confirmed collection was completed successfully.');
    }
  };

  const processCoarseSeparation = (batchId: string, organicKg: number, dryKg: number, specialKg: number, residualKg: number) => {
    const nowStr = new Date().toISOString();

    setWasteBatches(prev => prev.map(b => {
      if (b.id === batchId) {
        const segregationEv: WasteBatchEvent = {
          id: `ev-seg-${Date.now()}`,
          batch_id: b.id,
          batch_code: b.batch_code,
          event_type: 'SEGREGATION',
          previous_status: b.final_status,
          new_status: 'SEGREGATION',
          timestamp: nowStr,
          organization_id: b.organization_id,
          actor_name: 'Coarse Separation Team (Facility Operator)',
          actor_role: 'facility_operator',
          location_name: b.processing_facility_name || 'Central MRF Unit',
          latitude: 16.5380,
          longitude: 81.5150,
          weight_kg: organicKg + dryKg + specialKg + residualKg,
          notes: `Coarse separation completed: Organic=${organicKg}kg, Dry=${dryKg}kg, Special=${specialKg}kg, Residual=${residualKg}kg`
        };

        const recoveredEv: WasteBatchEvent = {
          id: `ev-rec-${Date.now()}`,
          batch_id: b.id,
          batch_code: b.batch_code,
          event_type: 'RECOVERED',
          previous_status: 'SEGREGATION',
          new_status: 'RECOVERED',
          timestamp: new Date(Date.now() + 1000).toISOString(),
          organization_id: b.organization_id,
          actor_name: 'CleanTech Eco Polymers Partner',
          actor_role: 'facility_operator',
          location_name: b.processing_facility_name || 'Central MRF Unit',
          latitude: 16.5380,
          longitude: 81.5150,
          weight_kg: dryKg,
          notes: `${dryKg} kg Dry Recyclables diverted to circular recovery stream.`
        };

        const updatedBatch: WasteBatch = {
          ...b,
          coarse_separation_status: 'completed',
          organic_fraction_kg: organicKg,
          dry_fraction_kg: dryKg,
          special_fraction_kg: specialKg,
          residual_fraction_kg: residualKg,
          recovered_weight_kg: dryKg,
          final_status: 'RECOVERED',
          current_location_name: 'Central MRF Unit — Staging Bay 3',
          current_responsible_entity: 'Central Sorting Operations Supervisor',
          last_updated_at: nowStr,
          recycler_id: dryKg > 0 ? 'rec-01' : undefined,
          recycler_name: dryKg > 0 ? 'CleanTech Materials & Plastics' : undefined,
          events: [...(b.events || []), segregationEv, recoveredEv]
        };

        supabaseDb.upsertWasteBatch(updatedBatch);
        supabaseDb.insertBatchEvent(segregationEv);
        supabaseDb.insertBatchEvent(recoveredEv);

        return updatedBatch;
      }
      return b;
    }));

    logAudit('COARSE_SEPARATION_COMPLETED', 'WasteBatch', batchId, `Separated: Organic=${organicKg}kg, Dry=${dryKg}kg, Special=${specialKg}kg, Residual=${residualKg}kg`);
  };

  const completeRecyclerPickup = (transactionId: string) => {
    const targetTx = recyclingTransactions.find(t => t.id === transactionId);
    const nowStr = new Date().toISOString();

    setRecyclingTransactions(prev => prev.map(t => {
      if (t.id === transactionId) {
        return { ...t, status: 'completed' };
      }
      return t;
    }));

    if (targetTx?.waste_batch_id) {
      setWasteBatches(prev => prev.map(b => {
        if (b.id === targetTx.waste_batch_id || b.batch_code === targetTx.batch_code) {
          const acceptEv: WasteBatchEvent = {
            id: `ev-acc-${Date.now()}`,
            batch_id: b.id,
            batch_code: b.batch_code,
            event_type: 'ACCEPTED_BY_RECYCLER',
            previous_status: b.final_status,
            new_status: 'ACCEPTED_BY_RECYCLER',
            timestamp: nowStr,
            organization_id: b.organization_id,
            actor_name: targetTx.recycler_name,
            actor_role: 'recycler',
            location_name: `${targetTx.recycler_name} Intake Gate`,
            latitude: 16.5380,
            longitude: 81.5150,
            weight_kg: targetTx.weight_kg,
            notes: `Accepted at facility. Value agreed: $${targetTx.agreed_value_usd}`
          };

          const recycledEv: WasteBatchEvent = {
            id: `ev-done-${Date.now()}`,
            batch_id: b.id,
            batch_code: b.batch_code,
            event_type: 'RECYCLED',
            previous_status: 'ACCEPTED_BY_RECYCLER',
            new_status: 'RECYCLED',
            timestamp: new Date(Date.now() + 1000).toISOString(),
            organization_id: b.organization_id,
            actor_name: targetTx.recycler_name,
            actor_role: 'recycler',
            location_name: `${targetTx.recycler_name} Extrusion Unit`,
            latitude: 16.5380,
            longitude: 81.5150,
            weight_kg: targetTx.weight_kg,
            notes: 'Recycling process complete. Circular Certificate issued.'
          };

          const updatedBatch: WasteBatch = {
            ...b,
            final_status: 'RECYCLED',
            recycler_received_weight_kg: targetTx.weight_kg,
            current_location_name: `${targetTx.recycler_name} Processing Plant`,
            current_responsible_entity: targetTx.recycler_name,
            last_updated_at: nowStr,
            events: [...(b.events || []), acceptEv, recycledEv]
          };

          supabaseDb.upsertWasteBatch(updatedBatch);
          supabaseDb.insertBatchEvent(acceptEv);
          supabaseDb.insertBatchEvent(recycledEv);

          return updatedBatch;
        }
        return b;
      }));
    }

    logAudit('RECYCLER_TRANSACTION_COMPLETED', 'RecyclingTransaction', transactionId, 'Materials received & valued.');
  };

  const reassignTask = (collectionId: string, collectorId: string, collectorName: string) => {
    setCollections(prev => prev.map(c => {
      if (c.id === collectionId) {
        const updated = {
          ...c,
          collector_id: collectorId,
          collector_name: collectorName,
          status: 'collector_en_route' as const,
          updated_at: new Date().toISOString()
        };
        supabaseDb.upsertCollection(updated);
        return updated;
      }
      return c;
    }));
    setNotifications(prev => [
      {
        id: `notif-reassign-${Date.now()}`,
        title: 'Task Reassigned',
        message: `Collection task reassigned to ${collectorName}.`,
        timestamp: 'Just now',
        read: false,
        type: 'info'
      },
      ...prev
    ]);
    logAudit('TASK_REASSIGNED', 'CollectionItem', collectionId, `Reassigned to collector ${collectorName} (${collectorId})`);

    const targetCol = collections.find(c => c.id === collectionId);

    // Dispatch Pickup Assigned Email Notification
    sendNotificationEmail({
      toEmail: 'u638126@gmail.com',
      recipientName: collectorName,
      eventType: 'PICKUP_ASSIGNED',
      details: {
        collectionId,
        collectorName,
        vehicleReg: 'AP-37-T-4912',
        address: targetCol?.household_address || 'Sunrise Enclave Sector, Zone 1',
        trackingCode: collectionId,
      }
    });
  };

  const syncOfflineQueue = () => {
    const queue = getOfflineQueue();
    if (queue.length === 0) return;

    queue.forEach(item => {
      if (item.action_type === 'MARK_COLLECTED') {
        markCollectionCompleted(item.collection_id, item.payload.weight || 10, item.payload.image, true);
      }
    });

    clearSyncedActions(queue.map(q => q.id));
    setNotifications(prev => [
      {
        id: `notif-sync-${Date.now()}`,
        title: 'Offline Sync Complete',
        message: `Successfully synchronized ${queue.length} offline collector actions.`,
        timestamp: 'Just now',
        read: false,
        type: 'info'
      },
      ...prev
    ]);
  };

  // Marketplace Handlers
  const createListing = (newListing: Partial<MarketplaceListing>) => {
    const item: MarketplaceListing = {
      id: `mkt-lst-${Date.now()}`,
      seller_id: currentUser.id,
      seller_name: currentUser.full_name,
      seller_org_name: activeOrg.name,
      seller_rating: 4.9,
      seller_trust_rating: 4.9,
      title: newListing.title || 'Recyclable Material Batch',
      category: newListing.category || 'Plastics',
      description: newListing.description || '',
      images: newListing.images?.length ? newListing.images : ['https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&w=800&q=80'],
      quantity: newListing.quantity || 100,
      unit: newListing.unit || 'kg',
      quality_grade: newListing.quality_grade || 'Grade A',
      price_per_unit: newListing.price_per_unit || 1.0,
      sale_type: newListing.sale_type || 'direct_sale',
      location_zone: newListing.location_zone || activeOrg.name,
      availability_date: newListing.availability_date || new Date().toISOString().split('T')[0],
      status: newListing.status || 'active',
      verification_status: 'verified',
      authenticity_score: 95,
      batch_code: `WL-MKT-2026-${Math.floor(100 + Math.random() * 900)}`,
      views_count: 1,
      bids_count: newListing.sale_type === 'auction' ? 0 : undefined,
      highest_bid: newListing.sale_type === 'auction' ? newListing.price_per_unit : undefined,
      auction_ends_at: newListing.sale_type === 'auction' ? newListing.auction_ends_at || '2026-09-20T18:00:00Z' : undefined,
      created_at: new Date().toISOString()
    };
    setMarketplaceListings(prev => [item, ...prev]);
    setNotifications(prev => [
      {
        id: `notif-lst-${Date.now()}`,
        title: 'Listing Published',
        message: `Marketplace listing "${item.title}" is now active for buyers.`,
        timestamp: 'Just now',
        read: false,
        type: 'success'
      },
      ...prev
    ]);
    logAudit('MARKETPLACE_LISTING_CREATED', 'Marketplace', item.id, `Created listing: ${item.title}`);
  };

  const updateListingStatus = (id: string, status: ListingStatus) => {
    setMarketplaceListings(prev => prev.map(l => l.id === id ? { ...l, status } : l));
    logAudit('MARKETPLACE_LISTING_UPDATED', 'Marketplace', id, `Updated listing status to ${status}`);
  };

  const submitOffer = (listingId: string, offerPrice: number, message?: string) => {
    const listing = marketplaceListings.find(l => l.id === listingId);
    if (!listing) return;
    const offer: MarketplaceOffer = {
      id: `off-${Date.now()}`,
      listing_id: listingId,
      listing_title: listing.title,
      buyer_id: currentUser.id,
      buyer_name: currentUser.full_name,
      buyer_org_name: activeOrg.name,
      offered_price_per_unit: offerPrice,
      total_amount: Math.round(offerPrice * listing.quantity * 100) / 100,
      status: 'pending',
      message: message || 'Interested in purchasing this batch.',
      created_at: new Date().toISOString()
    };
    setMarketplaceOffers(prev => [offer, ...prev]);
    setNotifications(prev => [
      {
        id: `notif-off-${Date.now()}`,
        title: 'Offer Submitted',
        message: `Submitted offer of $${offerPrice}/${listing.unit} for ${listing.title}.`,
        timestamp: 'Just now',
        read: false,
        type: 'info'
      },
      ...prev
    ]);
    logAudit('MARKETPLACE_OFFER_SUBMITTED', 'Marketplace', offer.id, `Submitted offer for listing ${listingId}`);
  };

  const placeBid = (listingId: string, bidAmount: number) => {
    setMarketplaceListings(prev => prev.map(l => {
      if (l.id === listingId) {
        const newCount = (l.bids_count || 0) + 1;
        return {
          ...l,
          bids_count: newCount,
          highest_bid: Math.max(l.highest_bid || 0, bidAmount)
        };
      }
      return l;
    }));
    setNotifications(prev => [
      {
        id: `notif-bid-${Date.now()}`,
        title: 'Auction Bid Placed',
        message: `Your bid of $${bidAmount} was recorded successfully.`,
        timestamp: 'Just now',
        read: false,
        type: 'success'
      },
      ...prev
    ]);
    logAudit('MARKETPLACE_BID_PLACED', 'Marketplace', listingId, `Placed bid of $${bidAmount}`);
  };

  const acceptOffer = (offerId: string) => {
    const offer = marketplaceOffers.find(o => o.id === offerId);
    if (!offer) return;
    setMarketplaceOffers(prev => prev.map(o => o.id === offerId ? { ...o, status: 'accepted' } : o));
    const listing = marketplaceListings.find(l => l.id === offer.listing_id);
    if (listing) {
      updateListingStatus(listing.id, 'sold');
      const order: MarketplaceOrder = {
        id: `mkt-ord-${Date.now()}`,
        order_code: `MKT-ORD-${Math.floor(10000 + Math.random() * 90000)}`,
        listing_id: listing.id,
        listing_title: listing.title,
        seller_name: listing.seller_name,
        buyer_name: offer.buyer_name,
        quantity: listing.quantity,
        unit: listing.unit,
        total_price: offer.total_amount,
        escrow_status: 'funds_held',
        delivery_status: 'pickup_scheduled',
        pickup_date: new Date().toISOString().split('T')[0],
        batch_code: listing.batch_code,
        qr_code_verification: `VERIFIED_BATCH_${Date.now()}`,
        created_at: new Date().toISOString()
      };
      setMarketplaceOrders(prev => [order, ...prev]);
    }
    logAudit('MARKETPLACE_OFFER_ACCEPTED', 'Marketplace', offerId, `Accepted offer from ${offer.buyer_name}`);
  };

  const confirmOrderPickup = (orderId: string) => {
    setMarketplaceOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          delivery_status: 'verified_completed',
          escrow_status: 'released_to_seller'
        };
      }
      return o;
    }));
    setNotifications(prev => [
      {
        id: `notif-ord-${Date.now()}`,
        title: 'Escrow Funds Released',
        message: `Order verified! Funds released to seller account.`,
        timestamp: 'Just now',
        read: false,
        type: 'success'
      },
      ...prev
    ]);
    logAudit('MARKETPLACE_ORDER_COMPLETED', 'Marketplace', orderId, `Order verified and escrow funds released`);
  };

  const raiseDispute = (orderId: string, reason: MaterialDispute['reason'], description: string) => {
    const dispute: MaterialDispute = {
      id: `disp-${Date.now()}`,
      order_id: orderId,
      raised_by_name: currentUser.full_name,
      reason,
      description,
      status: 'under_review',
      created_at: new Date().toISOString()
    };
    setMarketplaceDisputes(prev => [dispute, ...prev]);
    logAudit('MARKETPLACE_DISPUTE_RAISED', 'Marketplace', dispute.id, `Raised dispute for order ${orderId}`);
  };

  const submitReview = (targetUserName: string, rating: number, comment: string) => {
    const rev: MarketplaceReview = {
      id: `rev-${Date.now()}`,
      target_user_name: targetUserName,
      reviewer_name: currentUser.full_name,
      rating,
      comment,
      created_at: new Date().toISOString()
    };
    setMarketplaceReviews(prev => [rev, ...prev]);
    logAudit('MARKETPLACE_REVIEW_SUBMITTED', 'Marketplace', rev.id, `Reviewed user ${targetUserName} with rating ${rating}`);
  };

  // Phase 3 MFA & Failure Engine Handlers
  const [mfaEnabled, setMfaEnabled] = useState<boolean>(false);

  const toggleMfa = () => {
    setMfaEnabled(prev => {
      const next = !prev;
      logAudit('MFA_TOGGLED', 'Security', currentUser.id, `Multi-Factor Authentication ${next ? 'ENABLED' : 'DISABLED'}`);
      return next;
    });
  };

  const triggerFailureCheck = () => {
    const { escalatedCollections } = reliabilityEngine.checkMissedPickups(collections, collectors);
    if (escalatedCollections.length > 0) {
      setCollections(prev => prev.map(c => {
        const found = escalatedCollections.find(e => e.id === c.id);
        return found ? found : c;
      }));
    }
    reliabilityEngine.checkSensorHealth(iotDevices);
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      login,
      logout,
      register,
      googleLogin,
      organizations,
      activeOrg,
      setOrganization,
      addOrganization,
      activeRole,
      setRole: setActiveRole,
      currentUser,
      activeNavView,
      setActiveNavView,
      sidebarOpen,
      setSidebarOpen,
      notificationDrawerOpen,
      setNotificationDrawerOpen,
      collections,
      wasteBatches,
      complaints,
      vehicles,
      collectors,
      facilities,
      recyclers,
      recyclingTransactions,
      iotDevices,
      auditLogs,
      zones,
      notifications,
      markNotificationRead,
      clearNotifications,
      missedCollectionPromptOpen,
      setMissedCollectionPromptOpen,
      marketplaceListings,
      marketplaceOffers,
      marketplaceOrders,
      marketplaceDisputes,
      marketplaceReviews,
      createListing,
      updateListingStatus,
      submitOffer,
      placeBid,
      acceptOffer,
      confirmOrderPickup,
      raiseDispute,
      submitReview,
      addCollection,
      markCollectionCompleted,
      createSpecialWasteRequest,
      submitComplaint,
      respondToMissedCollectionPrompt,
      processCoarseSeparation,
      completeRecyclerPickup,
      updateBatchStage,
      reassignTask,
      syncOfflineQueue,
      isOffline,
      setIsOffline,
      mfaEnabled,
      toggleMfa,
      triggerFailureCheck,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
