// WasteLoop Phase 2 TypeScript Type Definitions

export type UserRole = 
  | 'citizen'
  | 'collector'
  | 'driver'
  | 'supervisor'
  | 'municipal_admin'
  | 'recycler'
  | 'organization_admin'
  | 'platform_admin'
  | 'vendor'
  | 'admin';

export type OrganizationType = 
  | 'Municipality'
  | 'College / University'
  | 'Hotel'
  | 'Residential Community'
  | 'Commercial Building'
  | 'Institution'
  | 'Market'
  | 'Hospital'
  | 'Transport Hub'
  | 'Public Place'
  | 'Construction Area'
  | 'Municipal Point'
  | 'Industrial Area'
  | 'Special Waste Facility'
  | 'Other';

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  slug: string;
  contact_email: string;
  subscription_plan: 'starter' | 'professional' | 'enterprise';
  is_active: boolean;
  created_at: string;
  category_label: string;
  icon_name: string;
}

export interface UserProfile {
  id: string;
  organization_id: string;
  role: UserRole;
  full_name: string;
  email?: string;
  phone?: string;
  avatar_url?: string;
  is_verified: boolean;
}

export interface Household {
  id: string;
  organization_id: string;
  user_id?: string;
  zone_id: string;
  address: string;
  latitude: number;
  longitude: number;
  qr_code_token: string;
}

export type WasteCategory = 
  | 'mixed'
  | 'wet_organic'
  | 'dry_recyclable'
  | 'e_waste'
  | 'appliances'
  | 'bulky'
  | 'hazardous'
  | 'food_waste'
  | 'paper_cardboard';

export type CollectionStatus = 
  | 'scheduled'
  | 'requested'
  | 'assigned'
  | 'accepted'
  | 'collector_en_route'
  | 'arrived'
  | 'collected'
  | 'processed'
  | 'missed'
  | 'skipped'
  | 'cancelled';

export type PriorityLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Zone {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  boundary_geojson?: any;
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  created_at?: string;
}

export interface CollectionItem {
  id: string;
  organization_id: string;
  household_id?: string;
  collector_id?: string;
  vehicle_id?: string;
  zone_id: string;
  type: 'normal' | 'on_demand' | 'special' | 'e_waste' | 'bulky';
  waste_category: WasteCategory;
  scheduled_window_start: string;
  scheduled_window_end: string;
  status: CollectionStatus;
  priority: PriorityLevel;
  priority_reason?: string;
  estimated_weight_kg: number;
  actual_weight_kg?: number;
  segregation_verified?: boolean;
  evidence_image_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Spatial Coordinates
  latitude?: number;
  longitude?: number;
  // Joins
  household_address?: string;
  collector_name?: string;
  assigned_collector_name?: string;
  assigned_collector_id?: string;
  ticket_code?: string;
  scheduled_pickup_window?: string;
  vehicle_reg?: string;
}

export interface Collector {
  id: string;
  organization_id: string;
  user_id: string;
  badge_number: string;
  name: string;
  shift_status: 'offline' | 'on_duty' | 'on_break';
  assigned_vehicle_id?: string;
  current_latitude?: number;
  current_longitude?: number;
  completed_tasks_today: number;
  remaining_tasks_today: number;
}

export interface Vehicle {
  id: string;
  organization_id: string;
  registration_number: string;
  type: string;
  capacity_kg: number;
  current_load_kg: number;
  status: 'available' | 'assigned' | 'on_route' | 'near_capacity' | 'maintenance' | 'offline';
  assigned_collector_name?: string;
}

export interface ProcessingFacility {
  id: string;
  organization_id: string;
  name: string;
  type: 'coarse_sorting' | 'mrf' | 'composting_plant' | 'special_waste_facility' | 'waste_to_energy' | 'landfill';
  address: string;
  latitude: number;
  longitude: number;
  daily_capacity_tons: number;
}

export type BatchStageStatus = 
  | 'SOURCE'
  | 'COLLECTED'
  | 'IN_TRANSIT'
  | 'ARRIVED_AT_FACILITY'
  | 'SEGREGATION'
  | 'RECOVERED'
  | 'ASSIGNED_TO_RECYCLER'
  | 'IN_TRANSIT_TO_RECYCLER'
  | 'ARRIVED_AT_RECYCLER'
  | 'ACCEPTED_BY_RECYCLER'
  | 'PROCESSING'
  | 'RECYCLED'
  | 'EXCEPTION';

export interface WasteBatchEvent {
  id: string;
  batch_id: string;
  batch_code: string;
  event_type: BatchStageStatus;
  previous_status?: string;
  new_status: BatchStageStatus;
  timestamp: string;
  organization_id: string;
  actor_name: string;
  actor_role: string;
  location_name: string;
  latitude?: number;
  longitude?: number;
  vehicle_id?: string;
  collector_id?: string;
  recycler_id?: string;
  weight_kg: number;
  notes?: string;
  weight_discrepancy_flag?: boolean;
}

export interface WasteBatch {
  id: string;
  batch_code: string; // e.g. WL-2026-000184
  organization_id: string;
  collection_id?: string;
  waste_category: WasteCategory;
  actual_weight_kg: number;
  collected_weight_kg?: number;
  facility_received_weight_kg?: number;
  recycler_received_weight_kg?: number;
  recovered_weight_kg?: number;
  weight_discrepancy_kg?: number;
  collector_id?: string;
  collector_name?: string;
  vehicle_id?: string;
  processing_facility_id?: string;
  processing_facility_name?: string;
  coarse_separation_status: 'pending' | 'in_progress' | 'completed';
  organic_fraction_kg: number;
  dry_fraction_kg: number;
  special_fraction_kg: number;
  residual_fraction_kg: number;
  recycler_id?: string;
  recycler_name?: string;
  final_status: BatchStageStatus;
  current_location_name?: string;
  current_latitude?: number;
  current_longitude?: number;
  current_responsible_entity?: string;
  last_updated_at?: string;
  events?: WasteBatchEvent[];
  created_at: string;
}

export interface Recycler {
  id: string;
  organization_id: string;
  company_name: string;
  verification_status: 'pending' | 'verified' | 'suspended' | 'rejected';
  accepted_materials: string[];
  service_area: string;
  capacity_kg_per_day: number;
  contact_phone: string;
  rating: number;
}

export interface RecyclingTransaction {
  id: string;
  organization_id: string;
  waste_batch_id: string;
  batch_code: string;
  recycler_id: string;
  recycler_name: string;
  material_type: string;
  weight_kg: number;
  agreed_value_usd: number;
  status: 'pending' | 'accepted' | 'collected' | 'completed' | 'cancelled';
  created_at: string;
}

export interface Complaint {
  id: string;
  ticket_code: string; // e.g. TKT-88491
  organization_id: string;
  household_id?: string;
  user_id?: string;
  reporter_name?: string;
  category: 'missed_collection' | 'illegal_dumping' | 'overflow' | 'poor_service' | 'damaged_bin' | 'other';
  severity: PriorityLevel;
  description: string;
  evidence_image_url?: string;
  latitude?: number;
  longitude?: number;
  status: 'reported' | 'verified' | 'assigned' | 'in_progress' | 'resolved' | 'closed';
  assigned_supervisor_name?: string;
  is_auto_escalated: boolean;
  created_at: string;
}

export interface ComplaintEvidence {
  id: string;
  evidence_code: string; // e.g. WL-EV-2026-000019
  complaint_id: string;
  image_url: string;
  latitude?: number;
  longitude?: number;
  authenticity_confidence: number; // e.g. 89%
  suspicion_status: 'Normal' | 'Duplicate' | 'Suspicious' | 'Possible AI Manipulation';
  verification_recommendation: string;
  created_at: string;
}

export interface IoTDevice {
  id: string;
  device_code: string;
  organization_id: string;
  zone_name: string;
  location_name: string;
  latitude: number;
  longitude: number;
  fill_level_percent: number;
  battery_level_percent: number;
  temperature_celsius: number;
  last_ping: string;
  status: 'active' | 'warning' | 'overflow_imminent' | 'offline';
  predicted_overflow_hours?: number;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  user_name: string;
  role: UserRole;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  timestamp: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'alert' | 'success' | 'escalation';
}

// ============================================================
// MARKETPLACE MODULE TYPE DEFINITIONS
// ============================================================

export type ListingStatus = 
  | 'draft'
  | 'pending_review'
  | 'verified'
  | 'active'
  | 'paused'
  | 'reserved'
  | 'sold'
  | 'completed'
  | 'expired'
  | 'archived'
  | 'rejected';

export type QualityGrade = 'Grade A (95-100% Pure)' | 'Grade B (85-94% Pure)' | 'Grade C (70-84% Pure)' | 'Grade D (<70% Pure)' | 'Grade A' | 'Grade B' | 'Grade C' | 'Grade D';

export type MarketplaceCategory = 'PET Plastics' | 'HDPE Plastics' | 'Paper & Fiber' | 'Paper & Cardboard' | 'E-Waste' | 'Electronics' | 'Metal & Aluminum' | 'Metals & Aluminum' | 'Organic Biomass' | 'Organic Compost' | 'Textiles' | 'Glass' | 'Plastics';

export interface MarketplaceListing {
  id: string;
  title: string;
  seller_id: string;
  seller_name: string;
  seller_org_id?: string;
  seller_org_name: string;
  seller_rating: number; // e.g. 4.9
  seller_trust_rating?: number;
  category: MarketplaceCategory;
  material_type?: string;
  description: string;
  images: string[];
  quantity: number;
  unit: 'kg' | 'Tons' | 'Units' | 'Bales';
  quality_grade: QualityGrade;
  price_per_unit: number; // $
  sale_type: 'direct_sale' | 'auction';
  location_zone: string;
  availability_date: string;
  status: ListingStatus;
  verification_status: 'verified' | 'pending' | 'unverified';
  authenticity_score: number; // e.g. 96%
  batch_code: string;
  views_count: number;
  bids_count?: number;
  highest_bid?: number;
  auction_ends_at?: string;
  created_at: string;
}

export interface MarketplaceOffer {
  id: string;
  listing_id: string;
  listing_title: string;
  buyer_id: string;
  buyer_name: string;
  buyer_org_name: string;
  offered_price_per_unit: number;
  total_amount: number;
  status: 'pending' | 'accepted' | 'countered' | 'rejected' | 'expired';
  counter_price_per_unit?: number;
  message?: string;
  created_at: string;
}

export interface MarketplaceAuctionBid {
  id: string;
  listing_id: string;
  bidder_id: string;
  bidder_name: string;
  bid_amount: number;
  timestamp: string;
}

export interface MarketplaceOrder {
  id: string;
  order_code: string; // e.g. MKT-ORD-88412
  listing_id: string;
  listing_title: string;
  seller_name: string;
  buyer_name: string;
  quantity: number;
  unit: string;
  total_price: number;
  escrow_status: 'funds_held' | 'released_to_seller' | 'refunded';
  delivery_status: 'pickup_scheduled' | 'in_transit' | 'delivered' | 'verified_completed';
  pickup_date: string;
  batch_code: string;
  qr_code_verification: string;
  created_at: string;
}

export interface MaterialDispute {
  id: string;
  order_id: string;
  raised_by_name: string;
  reason: 'quantity_mismatch' | 'grade_quality_issue' | 'failed_pickup' | 'other';
  description: string;
  evidence_url?: string;
  status: 'open' | 'under_review' | 'resolved' | 'rejected';
  resolution_notes?: string;
  created_at: string;
}

export interface MarketplaceReview {
  id: string;
  target_user_name: string;
  reviewer_name: string;
  rating: number; // 1-5
  comment: string;
  created_at: string;
}

