'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AgentState, ChatMessage } from '@/lib/types';
import { Send, Sparkles, Bot, User, Loader2 } from 'lucide-react';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  state: AgentState;
  onSendMessage: (text: string) => void;
}

const TEMPLATE_PROMPTS = [
  'Build a fullstack Next.js Todo app with Tailwind CSS and local storage',
  'Create a high-performance REST API with Express, validation, and JWT auth',
  'Build an interactive Markdown notes manager with search and export in React',
  'Create an autonomous web scraper CLI utility in Python with error retries',
];

export const ChatInterface: React.FC<ChatInterfaceProps> = ({
  messages,
  state,
  onSendMessage,
}) => {
  const [input, setInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  const isBusy = !['idle', 'completed', 'error'].includes(state);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isBusy) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-lg overflow-hidden">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center max-w-md mx-auto py-8">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mb-3 text-blue-400">
              <Bot className="w-6 h-6" />
            </div>
            <h2 className="text-sm font-semibold text-slate-100">Cder Agentic Software Engineer</h2>
            <p className="text-xs text-slate-400 mt-1">
              State your engineering objective, and Cder will plan the architecture, research libraries,
              write clean code, debug syntax, and deliver complete project files.
            </p>

            <div className="w-full mt-6 space-y-2 text-left">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                Quick Starters
              </span>
              {TEMPLATE_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onSendMessage(prompt)}
                  className="w-full text-left p-2.5 rounded-lg border border-slate-800/80 bg-slate-900/50 hover:bg-slate-800/80 hover:border-slate-700 text-xs text-slate-300 transition flex items-center gap-2 group"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-400 group-hover:scale-110 transition flex-shrink-0" />
                  <span className="truncate">{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.role !== 'user' && (
                <div className="w-6 h-6 rounded-lg bg-blue-600/20 border border-blue-500/40 flex items-center justify-center flex-shrink-0 text-blue-400 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl px-3.5 py-2.5 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-900 border border-slate-800 text-slate-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
                <div
                  className={`text-[9px] mt-1.5 opacity-60 ${
                    msg.role === 'user' ? 'text-blue-100' : 'text-slate-500'
                  }`}
                >
                  {msg.timestamp}
                </div>
              </div>

              {msg.role === 'user' && (
                <div className="w-6 h-6 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 text-slate-300 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 bg-slate-900/90 border-t border-slate-800">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isBusy
                ? 'Agent is actively executing tasks...'
                : 'Describe what software you want Cder to engineer...'
            }
            disabled={isBusy}
            rows={2}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 resize-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isBusy || !input.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 flex-shrink-0 shadow"
          >
            {isBusy ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span className="hidden sm:inline">Working</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Send</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
