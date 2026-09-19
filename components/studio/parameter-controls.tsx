'use strict';
'use client';

import React, { useState } from 'react';
import {
  Sliders,
  ChevronDown,
  ChevronUp,
  Dice5,
} from 'lucide-react';
import { ProviderType, ModelDefinition } from '@/types/studio';

interface ParameterControlsProps {
  provider: ProviderType;
  model: ModelDefinition;
  numInferenceSteps: number;
  guidanceScale: number;
  seed?: number;
  randomSeed: boolean;
  quality: 'low' | 'medium' | 'high' | 'xhigh' | 'max' | 'auto' | 'standard' | 'hd';
  style: 'vivid' | 'natural';
  onChangeSteps: (steps: number) => void;
  onChangeGuidance: (guidance: number) => void;
  onChangeSeed: (seed: number) => void;
  onToggleRandomSeed: (random: boolean) => void;
  onChangeQuality: (quality: 'low' | 'medium' | 'high' | 'xhigh' | 'max' | 'auto' | 'standard' | 'hd') => void;
  onChangeStyle: (style: 'vivid' | 'natural') => void;
}

export function ParameterControls({
  provider,
  model,
  numInferenceSteps,
  guidanceScale,
  seed,
  randomSeed,
  quality,
  style,
  onChangeSteps,
  onChangeGuidance,
  onChangeSeed,
  onToggleRandomSeed,
  onChangeQuality,
  onChangeStyle,
}: ParameterControlsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isHf = provider === 'huggingface';
  const isOpenAi = provider === 'openai';

  return (
    <div className="rounded-xl border border-border bg-card transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-4 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        <div className="flex items-center gap-2">
          <Sliders className="size-4 text-cyan-400" />
          <span>Inference Parameters</span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="font-mono text-xs text-muted-foreground font-medium bg-muted/60 px-2.5 py-1 rounded-md border border-border/70">
            {isHf ? `Steps: ${numInferenceSteps} | CFG: ${guidanceScale}` : isOpenAi ? `Quality: ${quality}` : 'Standard'}
          </span>
          {isOpen ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
        </div>
      </button>

      {isOpen && (
        <div className="space-y-4 border-t border-border p-4 sm:p-5 pt-3.5">
          {/* Hugging Face Diffusion Parameters */}
          {isHf && (
            <>
              {/* Inference Steps */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-xs sm:text-sm font-semibold text-foreground">
                      Inference Steps
                    </label>
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-muted/70 text-cyan-300 border border-border">
                      {numInferenceSteps}
                    </span>
                  </div>
                  {model.recommendedSteps && (
                    <button
                      type="button"
                      onClick={() => onChangeSteps(model.recommendedSteps || 25)}
                      className="text-xs font-medium text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
                    >
                      Reset default ({model.recommendedSteps})
                    </button>
                  )}
                </div>
                <input
                  type="range"
                  min={1}
                  max={50}
                  step={1}
                  value={numInferenceSteps}
                  onChange={(e) => onChangeSteps(Number(e.target.value))}
                  className="w-full h-2 rounded-lg accent-cyan-400 cursor-pointer bg-muted"
                />
                <div className="flex justify-between font-mono text-xs text-muted-foreground">
                  <span>1 (Draft)</span>
                  <span>25 (Balanced)</span>
                  <span>50 (High Quality)</span>
                </div>
              </div>

              {/* Guidance Scale */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <label className="text-xs sm:text-sm font-semibold text-foreground">
                      Guidance Scale (CFG)
                    </label>
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-muted/70 text-cyan-300 border border-border">
                      {guidanceScale}
                    </span>
                  </div>
                  {model.recommendedGuidance && (
                    <button
                      type="button"
                      onClick={() => onChangeGuidance(model.recommendedGuidance || 7.5)}
                      className="text-xs font-medium text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
                    >
                      Reset default ({model.recommendedGuidance})
                    </button>
                  )}
                </div>
                <input
                  type="range"
                  min={1}
                  max={20}
                  step={0.5}
                  value={guidanceScale}
                  onChange={(e) => onChangeGuidance(Number(e.target.value))}
                  className="w-full h-2 rounded-lg accent-cyan-400 cursor-pointer bg-muted"
                />
                <div className="flex justify-between font-mono text-xs text-muted-foreground">
                  <span>1.0 (Creative)</span>
                  <span>7.5 (Standard)</span>
                  <span>20.0 (Strict Prompt)</span>
                </div>
              </div>
            </>
          )}

          {/* OpenAI GPT-Image-2.5 Controls */}
          {isOpenAi && model.id.startsWith('gpt-image-2.5') && (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-semibold text-foreground">Rendering Quality</label>
                <span className="font-mono text-xs font-semibold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded-md border border-cyan-500/40 capitalize">
                  {quality === 'standard' || quality === 'hd' ? 'high' : quality}
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1 rounded-lg bg-muted/60 p-1 border border-border">
                {(['low', 'medium', 'high', 'xhigh', 'max', 'auto'] as const).map((tier) => {
                  const isActive = quality === tier || (tier === 'high' && (quality === 'standard' || quality === 'hd'));
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => onChangeQuality(tier)}
                      className={`h-8 rounded-md text-center font-mono text-xs font-semibold flex items-center justify-center transition-all ${
                        isActive ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                      }`}
                    >
                      {tier}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                &apos;max&apos; or &apos;xhigh&apos; is recommended for Sunburst production assets; &apos;high&apos; for Flare.
              </p>
            </div>
          )}

          {/* OpenAI DALL-E 3 Legacy Controls */}
          {isOpenAi && model.id === 'dall-e-3' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-foreground">Quality</label>
                <div className="flex rounded-lg bg-muted/60 p-1 border border-border">
                  <button
                    type="button"
                    onClick={() => onChangeQuality('standard')}
                    className={`flex-1 h-8 rounded-md text-center text-xs sm:text-sm font-semibold flex items-center justify-center transition-all ${
                      quality === 'standard' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeQuality('hd')}
                    className={`flex-1 h-8 rounded-md text-center text-xs sm:text-sm font-semibold flex items-center justify-center transition-all ${
                      quality === 'hd' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    HD
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs sm:text-sm font-semibold text-foreground">Visual Style</label>
                <div className="flex rounded-lg bg-muted/60 p-1 border border-border">
                  <button
                    type="button"
                    onClick={() => onChangeStyle('vivid')}
                    className={`flex-1 h-8 rounded-md text-center text-xs sm:text-sm font-semibold flex items-center justify-center transition-all ${
                      style === 'vivid' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Vivid
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeStyle('natural')}
                    className={`flex-1 h-8 rounded-md text-center text-xs sm:text-sm font-semibold flex items-center justify-center transition-all ${
                      style === 'natural' ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Natural
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Seed Control */}
          <div className="space-y-2 border-t border-border pt-3">
            <div className="flex items-center justify-between">
              <label className="text-xs sm:text-sm font-semibold text-foreground">Seed</label>
              <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-muted-foreground">
                <input
                  type="checkbox"
                  checked={randomSeed}
                  onChange={(e) => onToggleRandomSeed(e.target.checked)}
                  className="size-3.5 rounded border-border bg-background text-cyan-400 accent-cyan-400"
                />
                <span>Randomize</span>
              </label>
            </div>

            {!randomSeed && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={2147483647}
                  value={seed || 0}
                  onChange={(e) => onChangeSeed(Number(e.target.value))}
                  placeholder="Fixed Seed Number"
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 font-mono text-xs sm:text-sm text-foreground focus:border-cyan-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => onChangeSeed(Math.floor(Math.random() * 2147483647))}
                  className="h-10 w-10 shrink-0 flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-muted hover:border-cyan-500/40 hover:text-foreground transition-colors"
                  title="Generate Random Seed"
                >
                  <Dice5 className="size-4 text-muted-foreground" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
