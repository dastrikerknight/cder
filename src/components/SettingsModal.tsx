'use client';

import React, { useEffect, useRef } from 'react';
import { LLMConfig, LLMProvider } from '@/lib/types';
import { X, Key, Cpu, ShieldCheck } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: LLMConfig;
  onSave: (config: LLMConfig) => void;
}

const PROVIDER_MODELS: Record<LLMProvider, string[]> = {
  gemini: ['gemini-2.5-flash', 'gemini-1.5-pro', 'gemini-2.5-pro'],
  openai: ['gpt-4o', 'gpt-4o-mini', 'o1', 'o3-mini'],
  anthropic: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022'],
  groq: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'],
  openrouter: ['google/gemini-2.5-flash', 'anthropic/claude-3.5-sonnet', 'openai/gpt-4o'],
};

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [provider, setProvider] = React.useState<LLMProvider>(config.provider);
  const [model, setModel] = React.useState<string>(config.model);
  const [apiKey, setApiKey] = React.useState<string>(config.apiKey || '');
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProvider(config.provider);
    setModel(config.model);
    setApiKey(config.apiKey || '');
  }, [config, isOpen]);

  // Handle Escape key to close dialog
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleProviderChange = (newProvider: LLMProvider) => {
    setProvider(newProvider);
    setModel(PROVIDER_MODELS[newProvider][0]);
  };

  const handleSave = () => {
    onSave({
      provider,
      model,
      apiKey: apiKey.trim() || undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-modal-title"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        ref={dialogRef}
        className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl focus:outline-none"
        tabIndex={-1}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" aria-hidden="true" />
            <h2 id="settings-modal-title" className="font-semibold text-slate-100 text-sm">
              Model & API Configuration
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings dialog"
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md transition focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Provider Selection */}
          <div>
            <label htmlFor="settings-provider" className="block text-slate-200 font-medium mb-1.5">
              LLM Provider
            </label>
            <select
              id="settings-provider"
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value as LLMProvider)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus-visible:ring-2 focus-visible:ring-blue-500 focus:outline-none"
            >
              <option value="gemini">Google Gemini (Recommended - Fast & High Quota)</option>
              <option value="anthropic">Anthropic (Claude 3.5 Sonnet)</option>
              <option value="openai">OpenAI (GPT-4o / o1)</option>
              <option value="groq">Groq (Ultra-fast Llama 3.3)</option>
              <option value="openrouter">OpenRouter (Aggregated Models)</option>
            </select>
          </div>

          {/* Model Selection */}
          <div>
            <label htmlFor="settings-model" className="block text-slate-200 font-medium mb-1.5">
              Model
            </label>
            <select
              id="settings-model"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus-visible:ring-2 focus-visible:ring-blue-500 focus:outline-none"
            >
              {PROVIDER_MODELS[provider].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* API Key */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="settings-apikey" className="text-slate-200 font-medium flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
                <span>API Key</span>
              </label>
              <span className="text-[10px] text-slate-400">Stored in browser</span>
            </div>
            <input
              id="settings-apikey"
              type="password"
              placeholder={`Enter ${provider.toUpperCase()}_API_KEY or leave blank if set in Vercel`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 font-mono focus-visible:ring-2 focus-visible:ring-blue-500 focus:outline-none"
            />
          </div>

          <div
            role="note"
            className="p-3 rounded-lg bg-blue-950/40 border border-blue-900/60 flex items-start gap-2 text-slate-300 text-[11px] leading-relaxed"
          >
            <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              When deployed on Vercel, you can also securely set{' '}
              <code className="text-blue-300 font-mono">GEMINI_API_KEY</code>,{' '}
              <code className="text-blue-300 font-mono">OPENAI_API_KEY</code>, etc., directly in your Vercel Project Environment Variables.
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:outline-none"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
