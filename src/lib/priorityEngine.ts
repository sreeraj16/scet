import { PriorityLevel, WasteCategory } from '../types';

interface PriorityParams {
  waste_category: WasteCategory;
  estimated_weight_kg: number;
  hours_since_request: number;
  overflow_probability_percent?: number;
  is_complaint?: boolean;
  is_sla_breached?: boolean;
}

export interface PriorityResult {
  priority: PriorityLevel;
  reason: string;
}

/**
 * WasteLoop Smart Priority Engine
 * Calculates collection priority from waste quantity, collection age, overflow risk, category, SLA status.
 */
export function calculateSmartPriority(params: PriorityParams): PriorityResult {
  const { 
    waste_category, 
    estimated_weight_kg, 
    hours_since_request, 
    overflow_probability_percent = 0, 
    is_complaint = false, 
    is_sla_breached = false 
  } = params;

  if (is_sla_breached || overflow_probability_percent > 85) {
    return {
      priority: 'critical',
      reason: `CRITICAL — ${is_sla_breached ? 'SLA Breached' : `Predicted Overflow (${overflow_probability_percent}%)`} + ${hours_since_request.toFixed(1)}h request age.`
    };
  }

  if (waste_category === 'hazardous' || waste_category === 'appliances' || overflow_probability_percent > 65 || is_complaint) {
    return {
      priority: 'high',
      reason: `HIGH — ${waste_category.toUpperCase()} category + ${is_complaint ? 'Active Citizen Escalation' : 'High Generation Velocity'}.`
    };
  }

  if (estimated_weight_kg > 20 || hours_since_request > 12) {
    return {
      priority: 'medium',
      reason: `MEDIUM — ${estimated_weight_kg} kg estimated volume + ${hours_since_request.toFixed(1)}h elapsed.`
    };
  }

  return {
    priority: 'low',
    reason: `LOW — Standard routine morning collection route.`
  };
}
