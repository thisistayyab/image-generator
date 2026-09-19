/* eslint-disable @next/next/no-img-element */
'use strict';
'use client';

import React, { useState } from 'react';
import {
  X,
  History,
  Trash2,
  Download,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ImageHistoryItem } from '@/types/studio';

interface GalleryHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  history: ImageHistoryItem[];
  onSelectRemix: (item: ImageHistoryItem) => void;
  onDeleteHistoryItem: (id: string) => void;
  onClearHistory: () => void;
}

export function GalleryHistory({
  isOpen,
  onClose,
  history,
  onSelectRemix,
  onDeleteHistoryItem,
  onClearHistory,
}: GalleryHistoryProps) {
  const [filterProvider, setFilterProvider] = useState<string>('all');
  const [copiedPromptId, setCopiedPromptId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredHistory = history.filter((item) => {
    if (filterProvider === 'all') return true;
    return item.provider === filterProvider;
  });

  const handleCopyPrompt = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPromptId(id);
    setTimeout(() => setCopiedPromptId(null), 2000);
  };

  const handleDownload = (item: ImageHistoryItem) => {
    const a = document.createElement('a');
    a.href = item.imageUrl;
    a.download = `history-${item.model.replace(/[^a-zA-Z0-9]/g, '_')}-${item.id}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm">
      {/* Slide-in Panel */}
      <div className="flex h-full w-full max-w-xl flex-col border-l border-border bg-card p-6 text-foreground shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-md bg-cyan-950/60 text-cyan-300 border border-cyan-500/30">
              <History className="size-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Generation History</h2>
              <p className="text-xs text-muted-foreground">
                {history.length} {history.length === 1 ? 'item' : 'items'} stored in local browser cache
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex items-center justify-between pt-3 pb-2">
          <div className="flex items-center gap-1">
            {['all', 'huggingface', 'gemini', 'openai'].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setFilterProvider(p)}
                className={`rounded px-2.5 py-1 text-xs font-medium capitalize transition-all ${
                  filterProvider === p
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {p === 'all' ? 'All' : p}
              </button>
            ))}
          </div>

          {history.length > 0 && (
            <Button
              variant="ghost"
              size="xs"
              onClick={onClearHistory}
              className="h-6 text-xs text-muted-foreground hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="size-3 mr-1" />
              <span>Clear</span>
            </Button>
          )}
        </div>

        {/* Gallery Grid */}
        <div className="flex-1 overflow-y-auto pr-1 py-2">
          {filteredHistory.length === 0 ? (
            <div className="flex h-48 flex-col items-center justify-center space-y-2 rounded border border-dashed border-border p-6 text-center text-muted-foreground">
              <p className="text-xs">No historical items found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2">
              {filteredHistory.map((item) => (
                <div
                  key={item.id}
                  className="group relative overflow-hidden rounded-md border border-border bg-background p-2 transition-all hover:border-cyan-500/40"
                >
                  <div className="relative aspect-square w-full overflow-hidden rounded bg-card">
                    <img
                      src={item.imageUrl}
                      alt={item.prompt}
                      className="size-full object-cover"
                    />

                    {/* Action overlay on thumbnail */}
                    <div className="absolute inset-0 flex flex-col justify-between bg-black/80 p-2 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => handleDownload(item)}
                          title="Download"
                          className="rounded border border-border bg-card p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <Download className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteHistoryItem(item.id)}
                          title="Delete"
                          className="rounded border border-border bg-card p-1 text-muted-foreground hover:bg-muted hover:text-red-400"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                          <span className="capitalize">{item.provider}</span>
                          <span>
                            {item.parameters.dimensions.width}×{item.parameters.dimensions.height}
                          </span>
                        </div>
                        <Button
                          size="xs"
                          onClick={() => {
                            onSelectRemix(item);
                            onClose();
                          }}
                          className="h-6 w-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[11px] font-semibold shadow-sm"
                        >
                          <RotateCcw className="size-2.5 mr-1" />
                          <span>Load Settings</span>
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-2 space-y-1 px-0.5">
                    <p className="line-clamp-2 text-[11px] text-foreground leading-tight">
                      {item.prompt}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                      <span className="truncate max-w-[110px] text-cyan-400">{item.model}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyPrompt(item.id, item.prompt)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {copiedPromptId === item.id ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
