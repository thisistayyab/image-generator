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
    <div className="rounded-lg border border-border bg-card transition-all">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between p-3.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
      >
        <div className="flex items-center gap-1.5">
          <Sliders className="size-3.5 text-muted-foreground" />
          <span>Inference Parameters</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-muted-foreground font-normal">
            {isHf ? `Steps: ${numInferenceSteps} | CFG: ${guidanceScale}` : isOpenAi ? `Quality: ${quality}` : 'Standard'}
          </span>
          {isOpen ? <ChevronUp className="size-3.5 text-muted-foreground" /> : <ChevronDown className="size-3.5 text-muted-foreground" />}
        </div>
      </button>

      {isOpen && (
        <div className="space-y-4 border-t border-border p-4 pt-3 text-xs">
          {/* Hugging Face Diffusion Parameters */}
          {isHf && (
            <>
              {/* Inference Steps */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-foreground">
                    Steps ({numInferenceSteps})
                  </label>
                  {model.recommendedSteps && (
                    <button
                      type="button"
                      onClick={() => onChangeSteps(model.recommendedSteps || 25)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline"
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
                  className="w-full accent-cyan-400"
                />
                <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                  <span>1 (Draft)</span>
                  <span>25 (Balanced)</span>
                  <span>50 (High)</span>
                </div>
              </div>

              {/* Guidance Scale */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-foreground">
                    CFG Scale ({guidanceScale})
                  </label>
                  {model.recommendedGuidance && (
                    <button
                      type="button"
                      onClick={() => onChangeGuidance(model.recommendedGuidance || 7.5)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline"
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
                  className="w-full accent-cyan-400"
                />
                <div className="flex justify-between font-mono text-[10px] text-muted-foreground">
                  <span>1.0 (Creative)</span>
                  <span>7.5 (Standard)</span>
                  <span>20.0 (Strict)</span>
                </div>
              </div>
            </>
          )}

          {/* OpenAI GPT-Image-2.5 Controls */}
          {isOpenAi && model.id.startsWith('gpt-image-2.5') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-medium text-foreground">Rendering Quality</label>
                <span className="font-mono text-[11px] text-cyan-400 capitalize">
                  {quality === 'standard' || quality === 'hd' ? 'high' : quality}
                </span>
              </div>
              <div className="grid grid-cols-6 gap-1 rounded-md bg-muted/50 p-1 border border-border">
                {(['low', 'medium', 'high', 'xhigh', 'max', 'auto'] as const).map((tier) => {
                  const isActive = quality === tier || (tier === 'high' && (quality === 'standard' || quality === 'hd'));
                  return (
                    <button
                      key={tier}
                      type="button"
                      onClick={() => onChangeQuality(tier)}
                      className={`rounded py-1 text-center font-mono text-[11px] font-medium transition-all ${
                        isActive ? 'bg-cyan-500 text-slate-950 font-semibold shadow-sm' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {tier}
                    </button>
                  );
                })}
              </div>
              <p className="text-[10px] text-muted-foreground">
                &apos;max&apos; or &apos;xhigh&apos; is recommended for Sunburst production assets; &apos;high&apos; for Flare.
              </p>
            </div>
          )}

          {/* OpenAI DALL-E 3 Legacy Controls */}
          {isOpenAi && model.id === 'dall-e-3' && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-medium text-foreground">Quality</label>
                <div className="flex rounded-md bg-muted/50 p-0.5 border border-border">
                  <button
                    type="button"
                    onClick={() => onChangeQuality('standard')}
                    className={`flex-1 rounded py-1 text-center text-xs font-medium transition-all ${
                      quality === 'standard' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-muted-foreground'
                    }`}
                  >
                    Standard
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeQuality('hd')}
                    className={`flex-1 rounded py-1 text-center text-xs font-medium transition-all ${
                      quality === 'hd' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-muted-foreground'
                    }`}
                  >
                    HD
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-foreground">Visual Style</label>
                <div className="flex rounded-md bg-muted/50 p-0.5 border border-border">
                  <button
                    type="button"
                    onClick={() => onChangeStyle('vivid')}
                    className={`flex-1 rounded py-1 text-center text-xs font-medium transition-all ${
                      style === 'vivid' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-muted-foreground'
                    }`}
                  >
                    Vivid
                  </button>
                  <button
                    type="button"
                    onClick={() => onChangeStyle('natural')}
                    className={`flex-1 rounded py-1 text-center text-xs font-medium transition-all ${
                      style === 'natural' ? 'bg-cyan-500 text-slate-950 font-semibold' : 'text-muted-foreground'
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
              <label className="font-medium text-foreground">Seed</label>
              <label className="flex cursor-pointer items-center gap-1.5 text-[11px] text-muted-foreground">
                <input
                  type="checkbox"
                  checked={randomSeed}
                  onChange={(e) => onToggleRandomSeed(e.target.checked)}
                  className="rounded border-border bg-background text-cyan-400 accent-cyan-400"
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
                  className="w-full rounded border border-border bg-background px-2.5 py-1.5 font-mono text-xs text-foreground focus:border-cyan-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => onChangeSeed(Math.floor(Math.random() * 2147483647))}
                  className="rounded border border-border bg-card p-2 text-muted-foreground hover:bg-muted hover:border-cyan-500/30 hover:text-foreground"
                  title="Generate Random Seed"
                >
                  <Dice5 className="size-3.5 text-muted-foreground" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
