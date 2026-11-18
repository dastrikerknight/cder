'use client';

import React from 'react';
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

  React.useEffect(() => {
    setProvider(config.provider);
    setModel(config.model);
    setApiKey(config.apiKey || '');
  }, [config, isOpen]);

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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            <h3 className="font-semibold text-slate-100 text-sm">Model & API Configuration</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1 rounded-md transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Provider Selection */}
          <div>
            <label className="block text-slate-300 font-medium mb-1.5">LLM Provider</label>
            <select
              value={provider}
              onChange={(e) => handleProviderChange(e.target.value as LLMProvider)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500"
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
            <label className="block text-slate-300 font-medium mb-1.5">Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
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
              <label className="text-slate-300 font-medium flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>API Key</span>
              </label>
              <span className="text-[10px] text-slate-500">Stored in browser</span>
            </div>
            <input
              type="password"
              placeholder={`Enter ${provider.toUpperCase()}_API_KEY or leave blank if set in Vercel`}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          <div className="p-3 rounded-lg bg-blue-950/30 border border-blue-900/50 flex items-start gap-2 text-slate-300 text-[11px] leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
            <div>
              When deployed on Vercel, you can also securely set{' '}
              <code className="text-blue-300">GEMINI_API_KEY</code>,{' '}
              <code className="text-blue-300">OPENAI_API_KEY</code>, etc., directly in your Vercel Project Environment Variables.
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-950 border-t border-slate-800 flex justify-end gap-2 text-xs">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium transition"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
};
