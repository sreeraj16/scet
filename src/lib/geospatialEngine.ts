import { CollectionItem, Complaint, Zone } from '../types';
import { calculateSmartPriority } from './priorityEngine';

export interface SpatialDataPoint {
  latitude: number;
  longitude: number;
  intensity: number; // 0.0 - 1.0
  type: 'waste_volume' | 'complaint_density' | 'illegal_dumping' | 'overflow_risk';
  label: string;
}

export interface GeospatialRiskZone {
  zoneId: string;
  zoneName: string;
  centerLat: number;
  centerLng: number;
  compositeRiskScore: number; // 0 - 100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  contributingFactors: string[];
}

export interface CollectionLocationVerification {
  verified: boolean;
  distanceMeters: number;
  toleranceRadiusMeters: number;
  status: 'VERIFIED_LOCATION' | 'LOCATION_MISMATCH_FLAGGED' | 'GPS_UNAVAILABLE';
  message: string;
}

export const geospatialEngine = {
  /**
   * Haversine formula to compute exact distance in meters between two lat/lng points
   */
  calculateDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // Radius of Earth in meters
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c);
  },

  /**
   * Verify Collector GPS against expected Household / Collection Point location
   */
  verifyCollectionLocation(
    expectedLat: number,
    expectedLng: number,
    actualLat?: number,
    actualLng?: number,
    toleranceRadiusMeters: number = 100
  ): CollectionLocationVerification {
    if (!actualLat || !actualLng) {
      return {
        verified: false,
        distanceMeters: 0,
        toleranceRadiusMeters,
        status: 'GPS_UNAVAILABLE',
        message: 'GPS coordinates unavailable at collection point. Allowed to proceed with operational note.'
      };
    }

    const distanceMeters = this.calculateDistanceMeters(expectedLat, expectedLng, actualLat, actualLng);
    const verified = distanceMeters <= toleranceRadiusMeters;

    if (verified) {
      return {
        verified: true,
        distanceMeters,
        toleranceRadiusMeters,
        status: 'VERIFIED_LOCATION',
        message: `✓ Location verified: Collector is ${distanceMeters}m from collection point (within ${toleranceRadiusMeters}m radius).`
      };
    }

    return {
      verified: false,
      distanceMeters,
      toleranceRadiusMeters,
      status: 'LOCATION_MISMATCH_FLAGGED',
      message: `⚠ Location mismatch: Collector is ${distanceMeters}m away from expected curb location. Flagged for supervisor review.`
    };
  },

  /**
   * Determine if a point is within a circular Geofence boundary
   */
  checkGeofenceBoundary(
    lat: number, 
    lng: number, 
    centerLat: number, 
    centerLng: number, 
    radiusMeters: number = 200
  ): { isInside: boolean; distanceMeters: number; statusText: string } {
    const distanceMeters = this.calculateDistanceMeters(lat, lng, centerLat, centerLng);
    const isInside = distanceMeters <= radiusMeters;
    return {
      isInside,
      distanceMeters,
      statusText: isInside ? 'INSIDE_COLLECTION_GEOFENCE' : 'OUTSIDE_COLLECTION_GEOFENCE'
    };
  },

  /**
   * Sort & optimize route waypoints considering both distance and Priority Engine scores
   */
  rankRouteWaypointsByPriority<T extends { id: string; priority?: string; estimated_weight_kg?: number }>(
    stops: T[]
  ): T[] {
    return [...stops].sort((a, b) => {
      const priorityWeight: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
      const scoreA = (priorityWeight[a.priority || 'medium'] || 2) * 10 + (a.estimated_weight_kg || 5);
      const scoreB = (priorityWeight[b.priority || 'medium'] || 2) * 10 + (b.estimated_weight_kg || 5);
      return scoreB - scoreA; // descending urgency
    });
  },

  /**
   * Compute spatial heatmap density data points based on actual collections and complaints
   */
  generateSpatialHeatmap(
    collections: CollectionItem[], 
    complaints: Complaint[]
  ): SpatialDataPoint[] {
    const points: SpatialDataPoint[] = [];

    // Map collections
    collections.forEach(col => {
      if (col.latitude && col.longitude) {
        const weight = col.actual_weight_kg || col.estimated_weight_kg || 5;
        const intensity = Math.min(weight / 25, 1.0);
        points.push({
          latitude: col.latitude,
          longitude: col.longitude,
          intensity,
          type: 'waste_volume',
          label: `Collection Point (${weight} kg)`
        });
      }
    });

    // Map complaints & dumping
    complaints.forEach(cmp => {
      if (cmp.latitude && cmp.longitude) {
        const intensity = cmp.severity === 'critical' ? 0.95 : cmp.severity === 'high' ? 0.75 : 0.45;
        points.push({
          latitude: cmp.latitude,
          longitude: cmp.longitude,
          intensity,
          type: cmp.category === 'illegal_dumping' ? 'illegal_dumping' : 'complaint_density',
          label: `${cmp.category.replace('_', ' ').toUpperCase()} (${cmp.severity})`
        });
      }
    });

    return points;
  },

  /**
   * Compute Composite Geospatial Risk for Zones
   */
  calculateCompositeGeospatialRisk(
    zone: Zone, 
    zoneCollections: CollectionItem[], 
    zoneComplaints: Complaint[]
  ): GeospatialRiskZone {
    const centerLat = zoneCollections[0]?.latitude || 16.5420;
    const centerLng = zoneCollections[0]?.longitude || 81.5255;

    const missedCount = zoneCollections.filter(c => c.status === 'missed').length;
    const highPriorityCount = zoneCollections.filter(c => c.priority === 'high' || c.priority === 'critical').length;
    const complaintCount = zoneComplaints.filter(c => c.status !== 'resolved').length;

    // Composite risk score formula (0 - 100)
    const riskScore = Math.min(
      (missedCount * 20) + (highPriorityCount * 15) + (complaintCount * 10) + 15,
      100
    );

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (riskScore >= 75) riskLevel = 'CRITICAL';
    else if (riskScore >= 50) riskLevel = 'HIGH';
    else if (riskScore >= 30) riskLevel = 'MEDIUM';

    const contributingFactors: string[] = [];
    if (missedCount > 0) contributingFactors.push(`${missedCount} Missed Pickups`);
    if (highPriorityCount > 0) contributingFactors.push(`${highPriorityCount} Urgent SLA Requests`);
    if (complaintCount > 0) contributingFactors.push(`${complaintCount} Unresolved Complaints`);
    if (contributingFactors.length === 0) contributingFactors.push('Normal Operational State');

    return {
      zoneId: zone.id,
      zoneName: zone.name,
      centerLat,
      centerLng,
      compositeRiskScore: riskScore,
      riskLevel,
      contributingFactors
    };
  }
};
