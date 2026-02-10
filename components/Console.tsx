
import React from 'react';
import { LogEntry } from '../types';

interface ConsoleProps {
  logs: LogEntry[];
}

export const Console: React.FC<ConsoleProps> = ({ logs }) => {
  return (
    <div className="bg-black/60 rounded-lg border border-slate-700 h-64 overflow-y-auto p-4 custom-scrollbar">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-2">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
          <div className="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
        </div>
        <span className="text-[10px] text-slate-500 font-mono ml-2 uppercase">System_Terminal.log</span>
      </div>
      <div className="space-y-2">
        {logs.map((log) => (
          <div key={log.id} className="text-xs font-mono flex gap-4">
            <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
            <span className={`${
              log.type === 'critical' ? 'text-red-400' : 
              log.type === 'warning' ? 'text-yellow-300' : 'text-cyan-200'
            }`}>
              {log.type === 'warning' ? '>> ' : '> '}
              {log.message}
            </span>
          </div>
        ))}
        <div className="text-xs text-cyan-500/50 animate-pulse">_</div>
      </div>
    </div>
  );
};
