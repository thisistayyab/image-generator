'use strict';
'use client';

import React from 'react';
import { Layers, Key, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ApiKeysState, ProviderType } from '@/types/studio';

interface HeaderProps {
  apiKeys: ApiKeysState;
  activeProvider: ProviderType;
  historyCount: number;
  onOpenSettings: () => void;
  onOpenHistory: () => void;
}

export function StudioHeader({
  apiKeys,
  activeProvider,
  historyCount,
  onOpenSettings,
  onOpenHistory,
}: HeaderProps) {
  const hasHfKey = Boolean(apiKeys.huggingface?.trim());
  const hasGeminiKey = Boolean(apiKeys.gemini?.trim());
  const hasOpenAiKey = Boolean(apiKeys.openai?.trim());

  const currentKeySet =
    activeProvider === 'huggingface' ? hasHfKey : activeProvider === 'gemini' ? hasGeminiKey : hasOpenAiKey;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex size-7 items-center justify-center rounded-md bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(34,211,238,0.4)]">
            <Layers className="size-4 stroke-[2.2]" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold tracking-tight text-foreground">
              Studio
            </span>
            <span className="text-muted-foreground/50">/</span>
            <span className="text-xs font-medium text-muted-foreground">
              Image Synthesis
            </span>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Provider Status */}
          <div className="hidden items-center gap-2 rounded-md border border-border bg-card/80 px-2.5 py-1 text-xs text-foreground sm:flex">
            <span
              className={`size-1.5 rounded-full ${
                currentKeySet ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]' : 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.5)]'
              }`}
            />
            <span className="capitalize text-muted-foreground">{activeProvider}:</span>
            <span className={currentKeySet ? 'font-medium text-foreground' : 'font-medium text-amber-300'}>
              {currentKeySet ? 'Ready' : 'Key Required'}
            </span>
          </div>

          {/* History Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenHistory}
            className="h-8 border-border bg-card text-xs font-medium text-muted-foreground hover:bg-accent hover:border-cyan-500/30 hover:text-foreground"
          >
            <History className="size-3.5 mr-1 text-muted-foreground" />
            <span>History</span>
            {historyCount > 0 && (
              <span className="ml-1.5 rounded bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.2 text-[10px] font-medium text-cyan-300">
                {historyCount}
              </span>
            )}
          </Button>

          {/* Settings / API Keys Button */}
          <Button
            size="sm"
            onClick={onOpenSettings}
            className="h-8 border border-border bg-card text-xs font-medium text-foreground hover:bg-accent hover:border-cyan-500/30 hover:text-foreground"
          >
            <Key className="size-3.5 mr-1 text-muted-foreground" />
            <span>API Keys</span>
            {(!hasHfKey || !hasGeminiKey || !hasOpenAiKey) && (
              <span className="size-1.5 rounded-full bg-amber-400 ml-1 shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
            )}
          </Button>
        </div>
      </div>
    </header>
  );
}
