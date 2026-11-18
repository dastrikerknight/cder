'use client';

import React, { useState } from 'react';
import { ProjectFile, ProjectPlan } from '@/lib/types';
import JSZip from 'jszip';
import {
  FileCode,
  FolderTree,
  Download,
  Copy,
  Check,
  FileText,
  FileJson,
  FileSpreadsheet,
  File,
} from 'lucide-react';

interface CodeViewerProps {
  files: Record<string, ProjectFile>;
  plan?: ProjectPlan;
  report?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ files, plan, report }) => {
  const fileKeys = Object.keys(files);
  const [activeTab, setActiveTab] = useState<'files' | 'plan' | 'report'>('files');
  const [selectedPath, setSelectedPath] = useState<string>(fileKeys[0] || '');
  const [copied, setCopied] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  // Auto-select first file when files load
  React.useEffect(() => {
    if ((!selectedPath || !files[selectedPath]) && fileKeys.length > 0) {
      setSelectedPath(fileKeys[0]);
    }
  }, [files, fileKeys, selectedPath]);

  const activeFile = files[selectedPath];

  const handleCopy = () => {
    if (!activeFile) return;
    navigator.clipboard.writeText(activeFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    if (fileKeys.length === 0) return;
    setIsZipping(true);
    try {
      const zip = new JSZip();
      for (const [path, file] of Object.entries(files)) {
        zip.file(path, file.content);
      }
      if (report) {
        zip.file('CDER_REPORT.md', report);
      }
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${plan?.title?.toLowerCase().replace(/\s+/g, '-') || 'cder-project'}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('ZIP generation error:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const getFileIcon = (path: string) => {
    if (path.endsWith('.json')) return <FileJson className="w-3.5 h-3.5 text-amber-400" />;
    if (path.endsWith('.md')) return <FileText className="w-3.5 h-3.5 text-blue-400" />;
    if (path.endsWith('.ts') || path.endsWith('.tsx')) return <FileCode className="w-3.5 h-3.5 text-sky-400" />;
    if (path.endsWith('.js') || path.endsWith('.jsx')) return <FileCode className="w-3.5 h-3.5 text-yellow-400" />;
    if (path.endsWith('.py')) return <FileCode className="w-3.5 h-3.5 text-emerald-400" />;
    if (path.endsWith('.css') || path.endsWith('.html')) return <FileSpreadsheet className="w-3.5 h-3.5 text-purple-400" />;
    return <File className="w-3.5 h-3.5 text-slate-400" />;
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
      {/* Top Bar with Tabs and Download Action */}
      <div className="flex items-center justify-between px-3 py-2 bg-slate-900 border-b border-slate-800">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('files')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition ${
              activeTab === 'files'
                ? 'bg-slate-800 text-blue-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Files ({fileKeys.length})
          </button>
          {plan && (
            <button
              onClick={() => setActiveTab('plan')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                activeTab === 'plan'
                  ? 'bg-slate-800 text-purple-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Plan ({plan.steps.length})
            </button>
          )}
          {report && (
            <button
              onClick={() => setActiveTab('report')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                activeTab === 'report'
                  ? 'bg-slate-800 text-emerald-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Executive Report
            </button>
          )}
        </div>

        {fileKeys.length > 0 && (
          <button
            onClick={handleDownloadZip}
            disabled={isZipping}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white rounded-md transition shadow disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>{isZipping ? 'Archiving...' : 'Download ZIP'}</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {activeTab === 'files' && (
          <>
            {/* File Tree Left Column */}
            <div className="w-60 border-r border-slate-800 bg-slate-900/40 flex flex-col flex-shrink-0">
              <div className="px-3 py-2 border-b border-slate-800/80 text-[11px] font-semibold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                <FolderTree className="w-3 h-3 text-slate-500" />
                <span>Explorer</span>
              </div>
              <div className="flex-1 overflow-y-auto p-1 space-y-0.5">
                {fileKeys.length === 0 ? (
                  <div className="text-slate-500 text-xs text-center py-6">No files generated yet</div>
                ) : (
                  fileKeys.map((path) => (
                    <button
                      key={path}
                      onClick={() => setSelectedPath(path)}
                      className={`w-full flex items-center gap-2 px-2.5 py-1.5 text-xs rounded text-left transition ${
                        selectedPath === path
                          ? 'bg-blue-600/20 text-blue-300 font-medium'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                      }`}
                    >
                      {getFileIcon(path)}
                      <span className="truncate flex-1 font-mono text-[11px]">{path}</span>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Code Body Column */}
            <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
              {activeFile ? (
                <>
                  <div className="flex items-center justify-between px-3 py-1.5 bg-slate-900/80 border-b border-slate-800 text-xs">
                    <span className="font-mono text-slate-300">{activeFile.path}</span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1 text-slate-400 hover:text-slate-200 text-xs transition"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="flex-1 overflow-auto p-3 font-mono text-xs leading-relaxed text-slate-200">
                    <pre>
                      <code>{activeFile.content}</code>
                    </pre>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center flex-1 text-slate-500 text-xs">
                  Select a file from the explorer to view its contents
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'plan' && plan && (
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            <div>
              <h2 className="text-base font-semibold text-slate-100">{plan.title}</h2>
              <p className="text-xs text-slate-400 mt-1">{plan.description}</p>
            </div>

            <div>
              <h3 className="text-xs uppercase font-bold text-slate-500 mb-2">Tech Stack</h3>
              <div className="flex flex-wrap gap-1.5">
                {plan.techStack.map((tech) => (
                  <span
                    key={tech}
                    className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-xs"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase font-bold text-slate-500 mb-2">Milestones & Steps</h3>
              <div className="space-y-2">
                {plan.steps.map((step) => (
                  <div
                    key={step.id}
                    className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 flex items-start gap-3"
                  >
                    <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600/30 text-blue-400 text-xs font-bold">
                      {step.id}
                    </span>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200">{step.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'report' && report && (
          <div className="flex-1 overflow-y-auto p-6 prose prose-invert prose-xs max-w-none text-slate-200 leading-relaxed font-sans">
            <pre className="whitespace-pre-wrap font-sans text-xs bg-transparent border-0 p-0 text-slate-200">
              {report}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
