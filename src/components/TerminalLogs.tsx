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
        return 'bg-purple-950 text-purple-200 border-purple-700';
      case 'researcher':
        return 'bg-cyan-950 text-cyan-200 border-cyan-700';
      case 'coder':
        return 'bg-amber-950 text-amber-200 border-amber-700';
      case 'patcher':
        return 'bg-indigo-950 text-indigo-200 border-indigo-700';
      case 'runner':
        return 'bg-sky-950 text-sky-200 border-sky-700';
      case 'reporter':
        return 'bg-emerald-950 text-emerald-200 border-emerald-700';
      default:
        return 'bg-slate-800 text-slate-200 border-slate-600';
    }
  };

  const getTextColor = (level: AgentLog['level']) => {
    switch (level) {
      case 'success':
        return 'text-emerald-300';
      case 'warn':
        return 'text-amber-300 font-medium';
      case 'error':
        return 'text-rose-300 font-medium';
      default:
        return 'text-slate-200';
    }
  };

  return (
    <section
      role="region"
      aria-label="Agent Execution Console"
      className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-lg overflow-hidden font-mono text-xs"
    >
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-2 text-slate-200 font-sans font-medium text-xs">
          <Terminal className="w-3.5 h-3.5 text-blue-400" aria-hidden="true" />
          <span>Agent Execution Console</span>
          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
            {logs.length} events
          </span>
        </div>
        {onClear && (
          <button
            onClick={onClear}
            aria-label="Clear execution console logs"
            className="p-1 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded transition focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            title="Clear logs"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      <div
        role="log"
        aria-live="polite"
        className="flex-1 p-3 overflow-y-auto space-y-1.5 selection:bg-slate-800"
      >
        {logs.length === 0 ? (
          <div className="text-slate-400 italic py-8 text-center font-sans">
            Awaiting task instruction...
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2 leading-relaxed">
              <span className="text-slate-400 select-none text-[10px] pt-0.5" aria-hidden="true">
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
    </section>
  );
};
