'use strict';
'use client';

import React, { useState } from 'react';
import {
  Wand2,
  X,
  ChevronDown,
  ChevronUp,
  Check,
  EyeOff,
  Lightbulb,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { STYLE_PRESETS } from '@/lib/constants/models';

interface PromptInputProps {
  prompt: string;
  negativePrompt: string;
  selectedStyle: string;
  supportsNegativePrompt?: boolean;
  isEnhancing: boolean;
  hasEnhancerKey: boolean;
  onChangePrompt: (text: string) => void;
  onChangeNegativePrompt: (text: string) => void;
  onSelectStyle: (styleId: string) => void;
  onEnhancePrompt: () => void;
}

const SAMPLE_PROMPTS = [
  'A minimalist concrete pavilion in a Norwegian fjord landscape, overcast Nordic daylight, 35mm photography',
  'Editorial studio portrait of an elderly watchmaker at work, warm directional spotlight, shallow depth of field',
  'Commercial product photography of a ceramic dripper on matte graphite surface, soft diffused morning rim lighting',
  'Architectural interior of a modern library with double-height oak bookshelves, warm ambient light, symmetrical wide shot',
  'Macro shot of raw textured obsidian stone with gold veins, studio lighting, hyper-sharp geometric edges',
];

export function PromptInput({
  prompt,
  negativePrompt,
  selectedStyle,
  supportsNegativePrompt = false,
  isEnhancing,
  hasEnhancerKey,
  onChangePrompt,
  onChangeNegativePrompt,
  onSelectStyle,
  onEnhancePrompt,
}: PromptInputProps) {
  const [showNegative, setShowNegative] = useState(false);

  const handleSamplePrompt = () => {
    const sample = SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
    onChangePrompt(sample);
  };

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      {/* Top action row */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <span>Prompt</span>
        </label>

        <div className="flex items-center gap-2">
          {/* Example prompt */}
          <button
            type="button"
            onClick={handleSamplePrompt}
            className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <Lightbulb className="size-3 text-muted-foreground" />
            <span>Insert example</span>
          </button>

          {/* AI Prompt Enhancer */}
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={onEnhancePrompt}
            disabled={isEnhancing || !prompt.trim()}
            title={
              hasEnhancerKey
                ? 'Enhance prompt details with Gemini or OpenAI'
                : 'Configure a Gemini or OpenAI API key in Settings to use prompt enhancement'
            }
            className="h-6 border-cyan-500/30 bg-cyan-950/40 text-[11px] font-medium text-cyan-200 hover:bg-cyan-900/50 hover:text-cyan-100"
          >
            <Wand2 className={`size-3 mr-1 text-cyan-300 ${isEnhancing ? 'animate-spin' : ''}`} />
            <span>{isEnhancing ? 'Enhancing...' : 'Enhance'}</span>
          </Button>
        </div>
      </div>

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => onChangePrompt(e.target.value)}
          placeholder="Describe your subject, scene composition, lighting direction, and camera specifications..."
          className="w-full resize-y rounded-md border border-border bg-background p-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 focus:outline-none leading-relaxed"
        />
        {prompt && (
          <button
            type="button"
            onClick={() => onChangePrompt('')}
            className="absolute top-2.5 right-2.5 rounded p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Character count & hint */}
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Specify camera focal length, material textures, and illumination source.</span>
        <span className="font-mono">{prompt.length} chars</span>
      </div>

      {/* Style Presets */}
      <div className="space-y-1.5 pt-1">
        <span className="text-[11px] font-medium text-muted-foreground">
          Aesthetic Preset
        </span>
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {STYLE_PRESETS.map((preset) => {
            const isSelected = selectedStyle === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectStyle(preset.id)}
                className={`flex shrink-0 items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm'
                    : 'border border-border bg-background text-muted-foreground hover:border-cyan-500/30 hover:text-foreground'
                }`}
              >
                <span>{preset.name}</span>
                {isSelected && <Check className="size-3 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Collapsible Negative Prompt */}
      <div className="border-t border-border pt-2.5">
        <button
          type="button"
          onClick={() => setShowNegative(!showNegative)}
          className="flex w-full items-center justify-between text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <div className="flex items-center gap-1.5">
            <EyeOff className="size-3 text-muted-foreground" />
            <span>Negative Prompt</span>
            {!supportsNegativePrompt && (
              <span className="text-[10px] text-muted-foreground">
                (Unsupported by active model)
              </span>
            )}
          </div>
          {showNegative ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
        </button>

        {showNegative && (
          <div className="mt-2 space-y-2">
            <textarea
              rows={2}
              value={negativePrompt}
              onChange={(e) => onChangeNegativePrompt(e.target.value)}
              placeholder="e.g. low resolution, distorted geometry, blurred textures, artifacts"
              className="w-full resize-y rounded-md border border-border bg-background p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none"
            />
            <div className="flex flex-wrap gap-1">
              {[
                'low resolution, artifacts',
                'deformed anatomy',
                'watermark, signature',
                'blur, motion blur',
              ].map((pill) => (
                <button
                  key={pill}
                  type="button"
                  onClick={() => {
                    const current = negativePrompt ? `${negativePrompt}, ${pill}` : pill;
                    onChangeNegativePrompt(current);
                  }}
                  className="rounded border border-border bg-card px-1.5 py-0.5 text-[10px] text-muted-foreground hover:text-foreground hover:border-cyan-500/30"
                >
                  + {pill}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
