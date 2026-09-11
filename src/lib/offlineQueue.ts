export interface OfflineAction {
  id: string;
  action_type: 'MARK_COLLECTED' | 'REPORT_ISSUE' | 'SKIP_STOP' | 'UPDATE_WEIGHT';
  collection_id: string;
  payload: Record<string, any>;
  timestamp: string;
  synced: boolean;
}

const OFFLINE_QUEUE_KEY = 'wasteloop_collector_offline_queue';

export function getOfflineQueue(): OfflineAction[] {
  try {
    const raw = localStorage.getItem(OFFLINE_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Failed to read offline queue', e);
    return [];
  }
}

export function saveOfflineAction(actionType: OfflineAction['action_type'], collectionId: string, payload: Record<string, any>): OfflineAction {
  const queue = getOfflineQueue();
  const newAction: OfflineAction = {
    id: `off-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    action_type: actionType,
    collection_id: collectionId,
    payload,
    timestamp: new Date().toISOString(),
    synced: false,
  };
  
  queue.push(newAction);
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
  return newAction;
}

export function clearSyncedActions(syncedIds: string[]): void {
  const queue = getOfflineQueue();
  const remaining = queue.filter(a => !syncedIds.includes(a.id));
  localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(remaining));
}
