import { CollectionItem, Vehicle } from '../types';

export interface RouteOptimizationResult {
  vehicle_id: string;
  stops: CollectionItem[];
  total_distance_km: number;
  estimated_duration_minutes: number;
  capacity_utilization_percent: number;
}

/**
 * Route Optimization Service Abstraction
 * Calculates optimized stop sequence, total distance, time estimate and vehicle capacity utilization.
 * Can be swapped with live OSRM, Mapbox, or Google Maps Directions API.
 */
export function optimizeCollectorRoute(vehicle: Vehicle, collections: CollectionItem[]): RouteOptimizationResult {
  // Sort collections by priority (Critical > High > Medium > Low) then schedule window
  const priorityScore: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
  
  const sortedStops = [...collections].sort((a, b) => {
    const scoreA = priorityScore[a.priority] || 1;
    const scoreB = priorityScore[b.priority] || 1;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return new Date(a.scheduled_window_start).getTime() - new Date(b.scheduled_window_start).getTime();
  });

  const totalEstWeight = sortedStops.reduce((sum, item) => sum + (item.actual_weight_kg || item.estimated_weight_kg), 0);
  const capacityUtil = Math.min(100, Math.round((totalEstWeight / (vehicle.capacity_kg || 1000)) * 100));

  // Distance estimation (~1.2 km per stop average in urban zone)
  const totalDistance = Math.round((sortedStops.length * 1.45) * 10) / 10;
  const estimatedDuration = Math.round(sortedStops.length * 12 + totalDistance * 3);

  return {
    vehicle_id: vehicle.id,
    stops: sortedStops,
    total_distance_km: totalDistance,
    estimated_duration_minutes: estimatedDuration,
    capacity_utilization_percent: capacityUtil,
  };
}
