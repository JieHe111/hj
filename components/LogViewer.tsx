import React, { useEffect, useRef } from 'react';
import { LogEntry } from '../types';

interface LogViewerProps {
  logs: LogEntry[];
}

const LogViewer: React.FC<LogViewerProps> = ({ logs }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-700 flex flex-col h-64">
      <div className="bg-slate-800 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
        <span className="text-xs font-mono font-semibold text-slate-300">System Logs</span>
        <span className="text-[10px] bg-slate-700 text-slate-400 px-2 py-0.5 rounded">Real-time</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-1 font-mono text-xs log-scroll">
        {logs.length === 0 && <div className="text-slate-500 italic">No activity recorded...</div>}
        {logs.map((log) => {
            let color = 'text-slate-300';
            if (log.type === 'error') color = 'text-red-400 font-bold';
            if (log.type === 'success') color = 'text-green-400';
            if (log.type === 'warning') color = 'text-yellow-400';

            return (
                <div key={log.id} className="flex gap-2">
                    <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                    <span className={`font-bold w-12 shrink-0 ${log.source === 'PU1' ? 'text-blue-400' : log.source === 'PU2' ? 'text-indigo-400' : 'text-purple-400'}`}>{log.source}:</span>
                    <span className={color}>{log.message}</span>
                </div>
            )
        })}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};

export default LogViewer;