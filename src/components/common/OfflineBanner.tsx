import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { getOfflineQueue, flushOfflineQueue, initOfflineSync } from '../../lib/offlineQueue';
import { useToast } from '../../context/ToastContext';

export const OfflineBanner: React.FC = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [pendingCount, setPendingCount] = useState(getOfflineQueue().length);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleQueueChange = (e: any) => {
      setPendingCount(e.detail?.count ?? getOfflineQueue().length);
    };

    window.addEventListener('kaarigar_queue_changed', handleQueueChange);

    const cleanupSync = initOfflineSync(
      () => {
        setIsOffline(false);
        showToast({
          type: 'success',
          title: t('common.onlineNotice'),
          message: 'Connection re-established with cloud.'
        });
      },
      () => {
        setIsOffline(true);
        showToast({
          type: 'info',
          title: 'Offline Mode Active',
          message: t('common.offlineNotice')
        });
      },
      (syncedCount) => {
        setPendingCount(getOfflineQueue().length);
        showToast({
          type: 'sync',
          title: 'Synced with Cloud',
          message: `Successfully synchronized ${syncedCount} item(s).`
        });
      }
    );

    return () => {
      window.removeEventListener('kaarigar_queue_changed', handleQueueChange);
      cleanupSync();
    };
  }, [t, showToast]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const count = await flushOfflineQueue();
      setPendingCount(getOfflineQueue().length);
      if (count > 0) {
        showToast({
          type: 'success',
          title: 'Synced Successfully',
          message: `${count} pending craft(s) uploaded.`
        });
      }
    } finally {
      setIsSyncing(false);
    }
  };

  if (!isOffline && pendingCount === 0) return null;

  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs sm:text-sm font-medium transition-all shadow-xs">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {isOffline ? (
            <WifiOff className="w-4 h-4 text-terracotta-600 shrink-0" />
          ) : (
            <RefreshCw className="w-4 h-4 text-amber-700 shrink-0 animate-spin" />
          )}
          <span>
            {isOffline 
              ? t('common.offlineNotice') 
              : `Online with ${pendingCount} offline item(s) pending sync.`}
          </span>
        </div>
        {pendingCount > 0 && !isOffline && (
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="text-xs bg-amber-200 hover:bg-amber-300 text-amber-900 font-semibold px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Now ({pendingCount})</span>
          </button>
        )}
      </div>
    </div>
  );
};
