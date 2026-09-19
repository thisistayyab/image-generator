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
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
      {/* Label and Count */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Cpu className="size-4 text-cyan-400" />
          <span>Model Architecture</span>
        </label>
        <span className="rounded-md bg-muted/60 px-2 py-0.5 text-xs font-mono font-medium text-muted-foreground">
          {providerModels.length} models
        </span>
      </div>

      {/* Segmented Provider Switcher */}
      <div className="grid grid-cols-3 gap-1.5 rounded-lg bg-muted/70 p-1.5 border border-border">
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
              className={`h-9 rounded-md text-xs sm:text-sm font-semibold transition-all flex items-center justify-center ${
                isActive
                  ? 'bg-cyan-500 text-slate-950 shadow-sm font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Hugging Face Search & Category Filter */}
      {provider === 'huggingface' && (
        <div className="space-y-2.5 pt-0.5">
          <div className="relative">
            <Search className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Filter by name, tag, or speed..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 focus:outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-1.5">
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
                className={`h-7.5 px-3 rounded-md text-xs font-semibold transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/40'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 border border-transparent'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Models List */}
      <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
        {filteredModels.map((m) => {
          const isSelected = m.id === modelId;
          return (
            <div
              key={m.id}
              onClick={() => onSelectModel(m)}
              className={`group flex cursor-pointer items-start justify-between rounded-lg border p-3 transition-all ${
                isSelected
                  ? 'border-cyan-500/70 bg-cyan-950/25 text-foreground shadow-[0_0_16px_rgba(6,182,212,0.12)]'
                  : 'border-border/80 bg-background/50 text-muted-foreground hover:border-cyan-500/40 hover:bg-muted/40 hover:text-foreground'
              }`}
            >
              <div className="space-y-1.5 pr-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {m.name}
                  </span>
                  {m.badge && (
                    <span className="rounded-md bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 text-xs text-cyan-300 font-mono font-medium">
                      {m.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                  {m.description}
                </p>
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {m.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md bg-card border border-border px-2 py-0.5 text-xs text-muted-foreground font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="shrink-0 pt-0.5">
                <div
                  className={`flex size-5 items-center justify-center rounded-md border transition-colors ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-500 text-slate-950'
                      : 'border-border bg-transparent group-hover:border-muted-foreground'
                  }`}
                >
                  {isSelected && <Check className="size-3.5 stroke-[3]" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Custom Model ID Input */}
      {provider === 'huggingface' && selectedModel?.isCustom && (
        <div className="space-y-2 rounded-lg border border-border bg-background p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-semibold text-foreground">
              Custom Hugging Face Model ID
            </span>
            <a
              href="https://huggingface.co/models?pipeline_tag=text-to-image&sort=trending"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-medium text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              <span>Explore Hub</span>
              <ExternalLink className="size-3.5" />
            </a>
          </div>
          <input
            type="text"
            placeholder="e.g. black-forest-labs/FLUX.1-schnell"
            value={customModelId}
            onChange={(e) => onChangeCustomModelId(e.target.value)}
            className="h-10 w-full rounded-md border border-border bg-card px-3 font-mono text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
