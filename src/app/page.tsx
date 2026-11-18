'use client';

import React, { useState, useEffect } from 'react';
import {
  AgentLog,
  AgentState,
  AgentStreamEvent,
  ChatMessage,
  LLMConfig,
  ProjectFile,
  ProjectPlan,
} from '@/lib/types';
import { ProjectSidebar } from '@/components/ProjectSidebar';
import { AgentStepper } from '@/components/AgentStepper';
import { ChatInterface } from '@/components/ChatInterface';
import { CodeViewer } from '@/components/CodeViewer';
import { TerminalLogs } from '@/components/TerminalLogs';
import { SettingsModal } from '@/components/SettingsModal';

export default function Home() {
  const [projectName, setProjectName] = useState('cder-app');
  const [agentState, setAgentState] = useState<AgentState>('idle');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const [files, setFiles] = useState<Record<string, ProjectFile>>({});
  const [plan, setPlan] = useState<ProjectPlan | undefined>();
  const [report, setReport] = useState<string | undefined>();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'code' | 'logs'>('code');

  const [llmConfig, setLlmConfig] = useState<LLMConfig>({
    provider: 'gemini',
    model: 'gemini-2.5-flash',
  });

  // Load saved configuration from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cder_llm_config');
      if (saved) {
        setLlmConfig(JSON.parse(saved));
      }
    } catch {
      // Ignore localStorage read errors
    }
  }, []);

  const handleSaveConfig = (newConfig: LLMConfig) => {
    setLlmConfig(newConfig);
    try {
      localStorage.setItem('cder_llm_config', JSON.stringify(newConfig));
    } catch {
      // Ignore localStorage write errors
    }
  };

  const handleNewProject = () => {
    if (['planning', 'researching', 'coding', 'patching'].includes(agentState)) {
      if (!confirm('An agent task is currently in progress. Start a new workspace anyway?')) {
        return;
      }
    }
    const id = Math.floor(1000 + Math.random() * 9000);
    setProjectName(`cder-app-${id}`);
    setAgentState('idle');
    setMessages([]);
    setLogs([]);
    setFiles({});
    setPlan(undefined);
    setReport(undefined);
  };

  const handleSendMessage = async (userPrompt: string) => {
    const userMsg: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'user',
      content: userPrompt,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setAgentState('starting');

    // Switch right panel to logs or code automatically
    setRightPanelTab('code');

    try {
      const response = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userPrompt,
          projectName,
          config: llmConfig,
        }),
      });

      if (!response.ok || !response.body) {
        const errorText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event: AgentStreamEvent = JSON.parse(line.slice(6));

              if (event.type === 'state' && event.state) {
                setAgentState(event.state);
              } else if (event.type === 'log' && event.log) {
                setLogs((prev) => [...prev, event.log!]);
              } else if (event.type === 'plan' && event.plan) {
                setPlan(event.plan);
              } else if (event.type === 'files_sync' && event.files) {
                setFiles(event.files);
              } else if (event.type === 'report' && event.report) {
                setReport(event.report);
                // Also post an assistant message with completion summary
                setMessages((prev) => [
                  ...prev,
                  {
                    id: Math.random().toString(36).substring(2, 9),
                    role: 'assistant',
                    content: `🎉 **Project Completed!** Generated ${Object.keys(files).length || 'all'} files according to the architectural plan. You can inspect the source code, view the executive report, or download the ZIP archive.`,
                    timestamp: new Date().toLocaleTimeString(),
                  },
                ]);
              } else if (event.type === 'error' && event.error) {
                setAgentState('error');
                setMessages((prev) => [
                  ...prev,
                  {
                    id: Math.random().toString(36).substring(2, 9),
                    role: 'assistant',
                    content: `❌ **Execution Error:** ${event.error}`,
                    timestamp: new Date().toLocaleTimeString(),
                  },
                ]);
              } else if (event.type === 'done') {
                setAgentState('completed');
              }
            } catch {
              // Ignore chunk parse anomalies
            }
          }
        }
      }
    } catch (err: unknown) {
      setAgentState('error');
      const msg = err instanceof Error ? err.message : String(err);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(36).substring(2, 9),
          role: 'assistant',
          content: `❌ **Network/Execution Error:** ${msg}`,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden">
      {/* Left Sidebar */}
      <ProjectSidebar
        projectName={projectName}
        onProjectNameChange={setProjectName}
        onNewProject={handleNewProject}
        onOpenSettings={() => setIsSettingsOpen(true)}
        currentModel={llmConfig.model}
      />

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Agent Stepper */}
        <AgentStepper state={agentState} />

        {/* Center Grid Workspace */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3 overflow-hidden">
          {/* Chat Interface Column (5 cols on lg) */}
          <section className="lg:col-span-5 h-full overflow-hidden">
            <ChatInterface
              messages={messages}
              state={agentState}
              onSendMessage={handleSendMessage}
            />
          </section>

          {/* Right Workspace Column (7 cols on lg) */}
          <section className="lg:col-span-7 h-full flex flex-col overflow-hidden">
            {/* View switcher between Code & Terminal */}
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
                <button
                  onClick={() => setRightPanelTab('code')}
                  className={`px-3 py-1 rounded-md font-medium transition ${
                    rightPanelTab === 'code'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Code & Workspace
                </button>
                <button
                  onClick={() => setRightPanelTab('logs')}
                  className={`px-3 py-1 rounded-md font-medium transition ${
                    rightPanelTab === 'logs'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Terminal Logs ({logs.length})
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              {rightPanelTab === 'code' ? (
                <CodeViewer files={files} plan={plan} report={report} />
              ) : (
                <TerminalLogs logs={logs} onClear={() => setLogs([])} />
              )}
            </div>
          </section>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={llmConfig}
        onSave={handleSaveConfig}
      />
    </div>
  );
}
