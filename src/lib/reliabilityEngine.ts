import { CollectionItem, Vehicle, IoTDevice } from '../types';
import { eventQueue } from './eventQueue';

export interface ReliabilityAlert {
  id: string;
  type: 'MISSED_PICKUP' | 'VEHICLE_BREAKDOWN' | 'SENSOR_PING_FAILURE' | 'WEIGHBRIDGE_DISCREPANCY' | 'DUPLICATE_REQUEST_BLOCKED';
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  autoMitigated: boolean;
  mitigationNotes?: string;
}

class ReliabilityEngine {
  private alerts: ReliabilityAlert[] = [];

  /**
   * 1. Detect Missed Pickups & Trigger SLA Escalation + Reassignment
   */
  checkMissedPickups(collections: CollectionItem[], collectors: { id: string; name: string }[]): {
    escalatedCollections: CollectionItem[];
    alerts: ReliabilityAlert[];
  } {
    const escalated: CollectionItem[] = [];
    const newAlerts: ReliabilityAlert[] = [];
    const now = Date.now();

    collections.forEach(col => {
      if (col.status === 'scheduled' || col.status === 'assigned') {
        const scheduledTime = new Date(col.scheduled_window_start || col.created_at).getTime();
        // If 2 hours past scheduled time
        if (now - scheduledTime > 2 * 3600 * 1000) {
          const fallbackCollector = collectors.find(c => c.id !== (col.collector_id || col.assigned_collector_id)) || collectors[0];
          
          escalated.push({
            ...col,
            status: 'assigned',
            collector_id: fallbackCollector?.id || col.collector_id,
            collector_name: fallbackCollector?.name || col.collector_name,
            assigned_collector_id: fallbackCollector?.id || col.assigned_collector_id,
            assigned_collector_name: fallbackCollector?.name || col.assigned_collector_name
          });

          const alert: ReliabilityAlert = {
            id: `rel-miss-${Date.now()}-${col.id}`,
            type: 'MISSED_PICKUP',
            title: `Missed Pickup Escalation: ${col.ticket_code || col.id}`,
            severity: 'high',
            description: `Pickup window expired without collector verification. Reassigned to ${fallbackCollector?.name}.`,
            timestamp: new Date().toISOString(),
            autoMitigated: true,
            mitigationNotes: `Automated SLA Engine reassigned collection task to ${fallbackCollector?.name}.`
          };

          newAlerts.push(alert);
          this.alerts.unshift(alert);

          eventQueue.publish('SLA_BREACH_DETECTED', { collectionId: col.id, fallbackCollector: fallbackCollector?.name });
        }
      }
    });

    return { escalatedCollections: escalated, alerts: newAlerts };
  }

  /**
   * 2. Detect Vehicle Breakdown & Execute Fallback Fleet Reassignment
   */
  handleVehicleBreakdown(failedVehicleId: string, vehicles: Vehicle[]): {
    fallbackVehicle?: Vehicle;
    alert: ReliabilityAlert;
  } {
    const failedVeh = vehicles.find(v => v.id === failedVehicleId);
    const fallback = vehicles.find(v => v.id !== failedVehicleId && (v.status === 'available' || v.status === 'on_route'));

    const alert: ReliabilityAlert = {
      id: `rel-veh-${Date.now()}`,
      type: 'VEHICLE_BREAKDOWN',
      title: `Vehicle Out of Service: ${failedVeh?.registration_number || failedVehicleId}`,
      severity: 'critical',
      description: `Vehicle registered mechanical fault. Active route automatically transferred to fallback unit ${fallback?.registration_number || 'Standby Truck'}.`,
      timestamp: new Date().toISOString(),
      autoMitigated: !!fallback,
      mitigationNotes: fallback 
        ? `Transferred driver & bin route to backup vehicle ${fallback.registration_number}.`
        : `No active backup vehicle available. Alerted fleet manager for emergency dispatch.`
    };

    this.alerts.unshift(alert);
    eventQueue.publish('ROUTE_FAILED', { vehicleId: failedVehicleId, fallbackVehicleId: fallback?.id });

    return { fallbackVehicle: fallback, alert };
  }

  /**
   * 3. Sensor Failure Ping Watchdog
   */
  checkSensorHealth(devices: IoTDevice[]): ReliabilityAlert[] {
    const deadAlerts: ReliabilityAlert[] = [];
    const now = Date.now();

    devices.forEach(dev => {
      const lastPingTime = new Date(dev.last_ping).getTime();
      // If no ping for > 12 hours
      if (now - lastPingTime > 12 * 3600 * 1000) {
        const alert: ReliabilityAlert = {
          id: `rel-iot-${Date.now()}-${dev.id}`,
          type: 'SENSOR_PING_FAILURE',
          title: `IoT Sensor Ping Offline: ${dev.device_code}`,
          severity: 'medium',
          description: `Device at ${dev.location_name} missed heartbeat ping window (12h). Field maintenance technician dispatched.`,
          timestamp: new Date().toISOString(),
          autoMitigated: true,
          mitigationNotes: `Automated maintenance ticket generated for hardware check.`
        };

        deadAlerts.push(alert);
        this.alerts.unshift(alert);
      }
    });

    return deadAlerts;
  }

  /**
   * 4. Weighbridge Weight Discrepancy Validator
   */
  validateWeightRecord(recordedKg: number, scaleKg: number, batchCode: string): ReliabilityAlert | null {
    const variance = Math.abs(recordedKg - scaleKg) / (scaleKg || 1);

    if (variance > 0.05) { // > 5% mismatch
      const alert: ReliabilityAlert = {
        id: `rel-weight-${Date.now()}`,
        type: 'WEIGHBRIDGE_DISCREPANCY',
        title: `Weight Discrepancy Flagged: ${batchCode}`,
        severity: 'high',
        description: `Collector recorded ${recordedKg} kg vs Weighbridge scale ${scaleKg} kg (${(variance * 100).toFixed(1)}% variance). Escrow payout paused for audit.`,
        timestamp: new Date().toISOString(),
        autoMitigated: false,
        mitigationNotes: `Supervisory audit hold applied.`
      };

      this.alerts.unshift(alert);
      return alert;
    }

    return null;
  }

  /**
   * 5. Duplicate Request Detection & Prevention
   */
  checkDuplicateRequest(collections: CollectionItem[], address: string): boolean {
    const recent = collections.find(c => 
      c.household_address?.toLowerCase() === address.toLowerCase() &&
      c.status !== 'collected' &&
      c.status !== 'cancelled'
    );

    if (recent) {
      const alert: ReliabilityAlert = {
        id: `rel-dup-${Date.now()}`,
        type: 'DUPLICATE_REQUEST_BLOCKED',
        title: `Duplicate Request Intercepted`,
        severity: 'low',
        description: `Blocked duplicate pickup request for ${address}. Existing task active: ${recent.ticket_code || recent.id}.`,
        timestamp: new Date().toISOString(),
        autoMitigated: true,
        mitigationNotes: `Prevented redundant route generation.`
      };
      this.alerts.unshift(alert);
      return true; // Is Duplicate
    }

    return false;
  }

  getAlerts(): ReliabilityAlert[] {
    return [...this.alerts];
  }
}

export const reliabilityEngine = new ReliabilityEngine();
