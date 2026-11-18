'use client';

import React from 'react';
import { AgentState } from '@/lib/types';
import {
  FileText,
  Search,
  Code2,
  Wrench,
  PlayCircle,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from 'lucide-react';

interface StepperProps {
  state: AgentState;
}

const STEPS = [
  { key: 'planning', label: 'Planner', icon: FileText, desc: 'Architecture & tasks' },
  { key: 'researching', label: 'Researcher', icon: Search, desc: 'Docs & API specs' },
  { key: 'coding', label: 'Coder', icon: Code2, desc: 'Writing source files' },
  { key: 'patching', label: 'Patcher', icon: Wrench, desc: 'Syntax & bug fix' },
  { key: 'running', label: 'Runner', icon: PlayCircle, desc: 'Pre-flight sanity' },
  { key: 'reporting', label: 'Reporter', icon: FileCheck, desc: 'Project report' },
] as const;

export const AgentStepper: React.FC<StepperProps> = ({ state }) => {
  const stepKeys = STEPS.map((s) => s.key as string);
  const currentIndex = stepKeys.indexOf(state);
  const isCompleted = state === 'completed';
  const isError = state === 'error';

  return (
    <div className="w-full bg-slate-900/80 border-b border-slate-800 px-4 py-2.5 backdrop-blur">
      <div className="flex items-center justify-between max-w-7xl mx-auto gap-2 overflow-x-auto text-xs py-1">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = state === step.key;
          const isDone = isCompleted || (currentIndex > idx && !isError);

          let badgeColor = 'bg-slate-800 text-slate-400 border-slate-700';
          let textColor = 'text-slate-400';

          if (isActive) {
            badgeColor = 'bg-blue-600/20 text-blue-400 border-blue-500 shadow-sm shadow-blue-500/20';
            textColor = 'text-blue-300 font-semibold';
          } else if (isDone) {
            badgeColor = 'bg-emerald-950/60 text-emerald-400 border-emerald-700/60';
            textColor = 'text-emerald-400/90';
          } else if (isError && idx === currentIndex) {
            badgeColor = 'bg-rose-950/60 text-rose-400 border-rose-700';
            textColor = 'text-rose-400';
          }

          return (
            <div key={step.key} className="flex items-center gap-2 flex-shrink-0">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border transition-all ${badgeColor}`}
              >
                {isActive ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />
                ) : isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : isError && idx === currentIndex ? (
                  <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Icon className="w-3.5 h-3.5" />
                )}
                <div>
                  <span className={`block font-medium ${textColor}`}>{step.label}</span>
                  <span className="text-[10px] text-slate-500 hidden sm:inline">{step.desc}</span>
                </div>
              </div>

              {idx < STEPS.length - 1 && (
                <div
                  className={`w-4 h-[1.5px] rounded ${
                    isDone ? 'bg-emerald-600/70' : 'bg-slate-800'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
