'use strict';
'use client';

import React, { useState } from 'react';
import {
  Cpu,
  Search,
  Check,
  ExternalLink,
} from 'lucide-react';
import { ProviderType, ModelDefinition } from '@/types/studio';
import { MODELS } from '@/lib/constants/models';

interface ModelSelectorProps {
  provider: ProviderType;
  modelId: string;
  customModelId: string;
  onSelectProvider: (provider: ProviderType) => void;
  onSelectModel: (model: ModelDefinition) => void;
  onChangeCustomModelId: (id: string) => void;
}

export function ModelSelector({
  provider,
  modelId,
  customModelId,
  onSelectProvider,
  onSelectModel,
  onChangeCustomModelId,
}: ModelSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const providerModels = MODELS.filter((m) => m.provider === provider);

  const filteredModels = providerModels.filter((m) => {
    const matchesCategory = activeCategory === 'all' || m.category === activeCategory;
    const matchesQuery =
      !searchQuery.trim() ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesQuery;
  });

  const selectedModel = providerModels.find((m) => m.id === modelId) || providerModels[0];

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      {/* Label and Count */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Cpu className="size-3.5 text-muted-foreground" />
          <span>Model Architecture</span>
        </label>
        <span className="text-[11px] font-mono text-muted-foreground">
          {providerModels.length} models
        </span>
      </div>

      {/* Segmented Provider Switcher */}
      <div className="grid grid-cols-3 gap-1 rounded-md bg-muted/60 p-1 border border-border">
        {[
          { id: 'huggingface' as ProviderType, label: 'Hugging Face' },
          { id: 'gemini' as ProviderType, label: 'Google Gemini' },
          { id: 'openai' as ProviderType, label: 'OpenAI' },
        ].map((item) => {
          const isActive = provider === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelectProvider(item.id);
                const target = MODELS.find((m) => m.provider === item.id && (m.isDefault || true));
                if (target) onSelectModel(target);
              }}
              className={`rounded py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 shadow-sm font-semibold'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Hugging Face Search & Category Filter */}
      {provider === 'huggingface' && (
        <div className="space-y-2 pt-0.5">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter by name, tag, or speed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-md border border-border bg-background pl-8 pr-3 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-1">
            {[
              { id: 'all', label: 'All' },
              { id: 'fast', label: 'Fast / Turbo' },
              { id: 'photoreal', label: 'Photoreal' },
              { id: 'artistic', label: 'Artistic' },
              { id: 'custom', label: 'Custom' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`rounded px-2 py-0.5 text-[11px] font-medium transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Models List */}
      <div className="max-h-56 space-y-1 overflow-y-auto pr-1">
        {filteredModels.map((m) => {
          const isSelected = m.id === modelId;
          return (
            <div
              key={m.id}
              onClick={() => onSelectModel(m)}
              className={`group flex cursor-pointer items-start justify-between rounded-md border p-2.5 transition-all ${
                isSelected
                  ? 'border-cyan-500/60 bg-cyan-950/20 text-foreground shadow-[0_0_16px_rgba(6,182,212,0.1)]'
                  : 'border-border/70 bg-background/50 text-muted-foreground hover:border-cyan-500/30 hover:bg-muted/40 hover:text-foreground'
              }`}
            >
              <div className="space-y-1 pr-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground">
                    {m.name}
                  </span>
                  {m.badge && (
                    <span className="rounded bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.2 text-[10px] text-cyan-300 font-mono">
                      {m.badge}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                  {m.description}
                </p>
                <div className="flex flex-wrap items-center gap-1 pt-0.5">
                  {m.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-card border border-border px-1.5 py-0.2 text-[10px] text-muted-foreground font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="shrink-0 pt-0.5">
                <div
                  className={`flex size-4 items-center justify-center rounded border ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-500 text-slate-950'
                      : 'border-border bg-transparent'
                  }`}
                >
                  {isSelected && <Check className="size-3 stroke-[3]" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Model ID Input */}
      {provider === 'huggingface' && selectedModel?.isCustom && (
        <div className="space-y-1.5 rounded-md border border-border bg-background p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-foreground">
              Custom Hugging Face Model ID
            </span>
            <a
              href="https://huggingface.co/models?pipeline_tag=text-to-image&sort=trending"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
            >
              <span>Explore Hub</span>
              <ExternalLink className="size-3" />
            </a>
          </div>
          <input
            type="text"
            placeholder="e.g. black-forest-labs/FLUX.1-schnell"
            value={customModelId}
            onChange={(e) => onChangeCustomModelId(e.target.value)}
            className="w-full rounded border border-border bg-card px-2.5 py-1.5 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
