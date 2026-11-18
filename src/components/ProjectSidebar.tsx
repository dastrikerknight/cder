'use client';

import React from 'react';
import {
  Code,
  FolderPlus,
  Settings,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface ProjectSidebarProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  onNewProject: () => void;
  onOpenSettings: () => void;
  currentModel: string;
}

export const ProjectSidebar: React.FC<ProjectSidebarProps> = ({
  projectName,
  onProjectNameChange,
  onNewProject,
  onOpenSettings,
  currentModel,
}) => {
  return (
    <aside
      aria-label="Project Workspace Navigation"
      className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between flex-shrink-0"
    >
      {/* Brand Header */}
      <div>
        <header className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20"
              aria-hidden="true"
            >
              <Code className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                <span>Cder</span>
                <span className="text-[10px] px-1.5 py-0.2 bg-blue-500/20 text-blue-300 font-mono rounded">
                  v1.0
                </span>
              </h1>
              <p className="text-[10px] text-slate-300">Agentic Software Engineer</p>
            </div>
          </div>
        </header>

        {/* Action: New Project */}
        <div className="p-3">
          <button
            type="button"
            onClick={onNewProject}
            aria-label="Create new engineering workspace"
            className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition shadow-sm focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none"
          >
            <FolderPlus className="w-3.5 h-3.5" aria-hidden="true" />
            <span>New Workspace</span>
          </button>
        </div>

        {/* Project Context */}
        <div className="px-3 py-2 space-y-3">
          <div>
            <label
              htmlFor="active-project-name-input"
              className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1"
            >
              Active Project
            </label>
            <input
              id="active-project-name-input"
              type="text"
              value={projectName}
              onChange={(e) => onProjectNameChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono focus-visible:ring-2 focus-visible:ring-blue-500 focus:outline-none"
              placeholder="my-awesome-app"
            />
          </div>

          <div className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Active Engine:</span>
              <span className="font-mono text-blue-300 font-medium truncate max-w-[120px]">
                {currentModel}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Architecture:</span>
              <span className="text-slate-200">Devika Multi-Agent</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Target Host:</span>
              <span className="text-emerald-300 flex items-center gap-1 font-medium">
                <Sparkles className="w-2.5 h-2.5" aria-hidden="true" /> Vercel Serverless
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Settings & Links */}
      <nav aria-label="Settings and external resources" className="p-3 border-t border-slate-800 space-y-2">
        <button
          type="button"
          onClick={onOpenSettings}
          aria-label="Open model and API key configuration"
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-200 hover:text-white hover:bg-slate-900 border border-slate-700 transition focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
        >
          <Settings className="w-3.5 h-3.5 text-slate-300" aria-hidden="true" />
          <span>API & Model Settings</span>
        </button>

        <a
          href="https://vercel.com/docs"
          target="_blank"
          rel="noreferrer"
          aria-label="Open Vercel Documentation in a new window"
          className="flex items-center justify-between px-3 py-2 text-[11px] text-slate-300 hover:text-white hover:bg-slate-900 rounded-lg transition focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
        >
          <span className="flex items-center gap-1.5">
            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M24 22.525H0l12-21.05 12 21.05z" />
            </svg>
            <span>Vercel Documentation</span>
          </span>
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </a>
      </nav>
    </aside>
  );
};
