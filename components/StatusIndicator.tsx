
import React from 'react';
import { SystemStatus } from '../types';

interface StatusIndicatorProps {
  status: SystemStatus;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({ status }) => {
  const getStatusConfig = () => {
    switch (status) {
      case SystemStatus.STANDBY:
        return { color: 'text-yellow-500', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', label: 'STAND-BY' };
      case SystemStatus.ANALYZING:
        return { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30', label: 'ANALYZING...' };
      case SystemStatus.READY:
        return { color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/30', label: 'SYSTEM READY' };
      default:
        return { color: 'text-red-400', bg: 'bg-red-400/10', border: 'border-red-400/30', label: 'ERROR' };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`px-4 py-2 rounded-full border ${config.bg} ${config.border} flex items-center gap-2`}>
      <span className={`w-2 h-2 rounded-full ${config.color.replace('text', 'bg')} animate-pulse`}></span>
      <span className={`text-xs font-bold tracking-widest ${config.color}`}>{config.label}</span>
    </div>
  );
};
