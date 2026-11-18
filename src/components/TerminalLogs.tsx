'use client';

import React, { useEffect, useRef } from 'react';
import { AgentLog } from '@/lib/types';
import { Terminal, Trash2 } from 'lucide-react';

interface TerminalLogsProps {
  logs: AgentLog[];
  onClear?: () => void;
}

export const TerminalLogs: React.FC<TerminalLogsProps> = ({ logs, onClear }) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const getSenderBadge = (sender: string) => {
    switch (sender) {
      case 'planner':
        return 'bg-purple-950/80 text-purple-300 border-purple-800';
      case 'researcher':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800';
      case 'coder':
        return 'bg-amber-950/80 text-amber-300 border-amber-800';
      case 'patcher':
        return 'bg-indigo-950/80 text-indigo-300 border-indigo-800';
      case 'runner':
        return 'bg-sky-950/80 text-sky-300 border-sky-800';
      case 'reporter':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800';
      default:
        return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  const getTextColor = (level: AgentLog['level']) => {
    switch (level) {
      case 'success':
        return 'text-emerald-300';
      case 'warn':
        return 'text-amber-300';
      case 'error':
        return 'text-rose-400';
      default:
        return 'text-slate-300';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-lg overflow-hidden font-mono text-xs">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2 text-slate-300 font-sans font-medium text-xs">
          <Terminal className="w-3.5 h-3.5 text-blue-400" />
          <span>Agent Execution Console</span>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
            {logs.length} events
          </span>
        </div>
        {onClear && (
          <button
            onClick={onClear}
            className="p-1 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition"
            title="Clear logs"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <div className="flex-1 p-3 overflow-y-auto space-y-1.5 selection:bg-slate-800">
        {logs.length === 0 ? (
          <div className="text-slate-600 italic py-8 text-center font-sans">
            Awaiting task instruction...
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 leading-relaxed">
              <span className="text-slate-600 select-none text-[10px] pt-0.5">
                [{log.timestamp}]
              </span>
              <span
                className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-semibold border ${getSenderBadge(
                  log.sender
                )}`}
              >
                {log.sender}
              </span>
              <span className={`flex-1 break-words ${getTextColor(log.level)}`}>
                {log.message}
              </span>
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
