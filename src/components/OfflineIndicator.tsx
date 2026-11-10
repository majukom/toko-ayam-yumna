import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-stone-900/90 backdrop-blur-md px-3.5 py-2 text-xs font-medium text-amber-300 shadow-xl border border-amber-500/30 animate-pulse">
      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
      <span>Mode Offline — Aplikasi tetap dapat diakses dari cache PWA</span>
    </div>
  );
};
