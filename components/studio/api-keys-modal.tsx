'use strict';
'use client';

import React, { useState } from 'react';
import {
  X,
  Key,
  Eye,
  EyeOff,
  CheckCircle2,
  ExternalLink,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiKeysState } from '@/types/studio';

interface ApiKeysModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKeys: ApiKeysState;
  onSaveKeys: (keys: ApiKeysState) => void;
}

export function ApiKeysModal({ isOpen, onClose, apiKeys, onSaveKeys }: ApiKeysModalProps) {
  const [keys, setKeys] = useState<ApiKeysState>(apiKeys);
  const [showHf, setShowHf] = useState(false);
  const [showGemini, setShowGemini] = useState(false);
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveKeys(keys);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  const handleClearAll = () => {
    const emptyKeys = { huggingface: '', gemini: '', openai: '' };
    setKeys(emptyKeys);
    onSaveKeys(emptyKeys);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Solid Dim Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Solid Professional Dialog Card */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-lg border border-border bg-card p-6 text-foreground shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(6,182,212,0.15)]">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
              <Key className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Provider Credentials</h2>
              <p className="text-xs text-muted-foreground">Keys are stored locally in your browser session</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="mt-4 space-y-4">
          {/* Hugging Face API Token */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <span>Hugging Face Access Token</span>
                {keys.huggingface && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-normal">
                    <CheckCircle2 className="size-3" /> Configured
                  </span>
                )}
              </label>
              <a
                href="https://huggingface.co/settings/tokens"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <span>Get token</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
            <div className="relative flex items-center">
              <input
                type={showHf ? 'text' : 'password'}
                placeholder="hf_..."
                value={keys.huggingface}
                onChange={(e) => setKeys({ ...keys, huggingface: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowHf(!showHf)}
                className="absolute right-2.5 text-muted-foreground hover:text-foreground"
              >
                {showHf ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Required for FLUX.1, SDXL, and SD 3.5. Ensure token has &quot;Make calls to Inference Providers&quot; permission enabled.
            </p>
          </div>

          {/* Google Gemini API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <span>Google Gemini API Key</span>
                {keys.gemini && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-normal">
                    <CheckCircle2 className="size-3" /> Configured
                  </span>
                )}
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <span>Get key</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
            <div className="relative flex items-center">
              <input
                type={showGemini ? 'text' : 'password'}
                placeholder="AIzaSy..."
                value={keys.gemini}
                onChange={(e) => setKeys({ ...keys, gemini: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowGemini(!showGemini)}
                className="absolute right-2.5 text-muted-foreground hover:text-foreground"
              >
                {showGemini ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Enables Google Imagen 3 and Gemini Flash prompt expansion.
            </p>
          </div>

          {/* OpenAI API Key */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                <span>OpenAI API Key</span>
                {keys.openai && (
                  <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-normal">
                    <CheckCircle2 className="size-3" /> Configured
                  </span>
                )}
              </label>
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <span>Get key</span>
                <ExternalLink className="size-3" />
              </a>
            </div>
            <div className="relative flex items-center">
              <input
                type={showOpenAi ? 'text' : 'password'}
                placeholder="sk-..."
                value={keys.openai}
                onChange={(e) => setKeys({ ...keys, openai: e.target.value })}
                className="w-full rounded-md border border-border bg-background px-3 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground/60 focus:border-cyan-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowOpenAi(!showOpenAi)}
                className="absolute right-2.5 text-muted-foreground hover:text-foreground"
              >
                {showOpenAi ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
              </button>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Enables DALL·E 3 and DALL·E 2 model endpoints.
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between border-t border-border pt-4 mt-6">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="h-8 text-xs text-muted-foreground hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="size-3 mr-1" />
              <span>Reset</span>
            </Button>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="h-8 border-border bg-card text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                className="h-8 bg-cyan-500 hover:bg-cyan-400 text-xs font-semibold text-slate-950 shadow-[0_4px_16px_rgba(6,182,212,0.2)]"
              >
                {savedSuccess ? 'Saved' : 'Save Keys'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
