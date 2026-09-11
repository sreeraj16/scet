import { BatchStageStatus } from '../types';

/**
 * WasteLoop Material Traceability State Machine Rule Engine
 * Enforces valid operational workflow transitions and blocks invalid backwards jumps.
 */

// Permitted transition mapping for WasteLoop material lifecycle
export const ALLOWED_TRANSITIONS: Record<BatchStageStatus, BatchStageStatus[]> = {
  SOURCE: ['COLLECTED', 'EXCEPTION'],
  COLLECTED: ['IN_TRANSIT', 'ARRIVED_AT_FACILITY', 'EXCEPTION'],
  IN_TRANSIT: ['ARRIVED_AT_FACILITY', 'EXCEPTION'],
  ARRIVED_AT_FACILITY: ['SEGREGATION', 'EXCEPTION'],
  SEGREGATION: ['RECOVERED', 'ASSIGNED_TO_RECYCLER', 'EXCEPTION'],
  RECOVERED: ['ASSIGNED_TO_RECYCLER', 'IN_TRANSIT_TO_RECYCLER', 'EXCEPTION'],
  ASSIGNED_TO_RECYCLER: ['IN_TRANSIT_TO_RECYCLER', 'ARRIVED_AT_RECYCLER', 'ACCEPTED_BY_RECYCLER', 'EXCEPTION'],
  IN_TRANSIT_TO_RECYCLER: ['ARRIVED_AT_RECYCLER', 'ACCEPTED_BY_RECYCLER', 'EXCEPTION'],
  ARRIVED_AT_RECYCLER: ['ACCEPTED_BY_RECYCLER', 'EXCEPTION'],
  ACCEPTED_BY_RECYCLER: ['PROCESSING', 'EXCEPTION'],
  PROCESSING: ['RECYCLED', 'EXCEPTION'],
  RECYCLED: [], // Terminal stage
  EXCEPTION: ['COLLECTED', 'SEGREGATION', 'ASSIGNED_TO_RECYCLER', 'PROCESSING'] // Recovery from exception
};

/**
 * Validates whether transitioning from currentStatus to targetStatus is permitted.
 */
export function validateStageTransition(
  currentStatus: BatchStageStatus, 
  targetStatus: BatchStageStatus
): { valid: boolean; reason?: string } {
  if (currentStatus === targetStatus) {
    return { valid: true };
  }

  const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (allowedNext.includes(targetStatus)) {
    return { valid: true };
  }

  return {
    valid: false,
    reason: `Invalid status transition: Batch cannot transition directly from "${currentStatus}" to "${targetStatus}". Expected one of: ${allowedNext.join(', ')}`
  };
}

/**
 * Audits weight discrepancy between initial collection scale reading and subsequent facility/recycler scale readings.
 * Returns variance details and anomaly flag status.
 */
export function auditWeightDiscrepancy(
  initialWeightKg: number,
  stageWeightKg: number,
  thresholdKg: number = 1.0
): {
  hasDiscrepancy: boolean;
  differenceKg: number;
  percentageDiff: number;
  message: string;
} {
  if (!initialWeightKg || initialWeightKg <= 0 || !stageWeightKg || stageWeightKg <= 0) {
    return {
      hasDiscrepancy: false,
      differenceKg: 0,
      percentageDiff: 0,
      message: 'Initial or stage weight not recorded yet.'
    };
  }

  const differenceKg = Math.abs(initialWeightKg - stageWeightKg);
  const percentageDiff = (differenceKg / initialWeightKg) * 100;
  const hasDiscrepancy = differenceKg > thresholdKg;

  let message = 'Weight audit pass: Scale readings match expected tolerance.';
  if (hasDiscrepancy) {
    message = `Scale Variance Flagged: Initial ${initialWeightKg.toFixed(1)} kg vs Intake ${stageWeightKg.toFixed(1)} kg (Diff: ${differenceKg.toFixed(1)} kg / ${percentageDiff.toFixed(1)}%). Reconciled & logged for audit.`;
  }

  return {
    hasDiscrepancy,
    differenceKg,
    percentageDiff,
    message
  };
}

/**
 * Formats ISO timestamps into user-friendly local timezone strings.
 */
export function formatTraceabilityTimestamp(isoString?: string): string {
  if (!isoString) return 'Pending Stage';
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString;

  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  if (isToday) {
    return `Today at ${timeStr}`;
  }

  const dateStr = date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return `${dateStr}, ${timeStr}`;
}
