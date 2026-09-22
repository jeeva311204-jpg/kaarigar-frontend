import { Product } from '../types';
import { saveProductRecord } from './firebase';

export interface QueuedSubmission {
  id: string;
  type: 'product_draft' | 'product_publish';
  timestamp: number;
  data: Product;
}

const QUEUE_KEY = 'kaarigar_offline_queue';

export function getOfflineQueue(): QueuedSubmission[] {
  try {
    const raw = localStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOfflineQueue(queue: QueuedSubmission[]): void {
  try {
    localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    window.dispatchEvent(new CustomEvent('kaarigar_queue_changed', { detail: { count: queue.length } }));
  } catch (e) {
    console.error('Failed to save offline queue:', e);
  }
}

export function enqueueOfflineProduct(product: Product, type: 'product_draft' | 'product_publish' = 'product_publish'): void {
  const queue = getOfflineQueue();
  const entry: QueuedSubmission = {
    id: `queue-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    type,
    timestamp: Date.now(),
    data: {
      ...product,
      status: 'pending_sync'
    }
  };
  
  // Also save to local products store marked as pending_sync so artisan sees it immediately on dashboard
  saveProductRecord(entry.data);

  queue.push(entry);
  saveOfflineQueue(queue);
}

export async function flushOfflineQueue(
  onSynced?: (count: number) => void
): Promise<number> {
  const queue = getOfflineQueue();
  if (queue.length === 0) return 0;

  let syncedCount = 0;
  const remaining: QueuedSubmission[] = [];

  for (const item of queue) {
    try {
      const syncedProduct: Product = {
        ...item.data,
        status: item.type === 'product_publish' ? 'live' : 'draft'
      };
      await saveProductRecord(syncedProduct);
      syncedCount++;
    } catch (err) {
      console.error('Failed to sync offline item:', err);
      remaining.push(item);
    }
  }

  saveOfflineQueue(remaining);
  if (syncedCount > 0 && onSynced) {
    onSynced(syncedCount);
  }
  return syncedCount;
}

/**
 * Global offline/online listener setup
 */
export function initOfflineSync(
  onOnline?: () => void,
  onOffline?: () => void,
  onFlush?: (count: number) => void
): () => void {
  const handleOnline = async () => {
    onOnline?.();
    const count = await flushOfflineQueue(onFlush);
    if (count > 0) {
      console.info(`Kaarigar: Flushed ${count} offline items upon reconnection.`);
    }
  };

  const handleOffline = () => {
    onOffline?.();
  };

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
