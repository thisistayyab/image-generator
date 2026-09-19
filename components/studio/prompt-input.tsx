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
  Cpu,
  Sliders,
  AlertTriangle,
  Key,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  STYLE_PRESETS,
  TEXT_GENERATION_MODELS,
  ENHANCEMENT_PERSONAS,
} from '@/lib/constants/models';
import {
  TextModelConfig,
  ApiKeysState,
  ProviderType,
  EnhancementPersona,
} from '@/types/studio';

interface PromptInputProps {
  prompt: string;
  negativePrompt: string;
  selectedStyle: string;
  supportsNegativePrompt?: boolean;
  isEnhancing: boolean;
  hasEnhancerKey: boolean;
  enhanceError: string | null;
  textModelConfig: TextModelConfig;
  apiKeys: ApiKeysState;
  onChangePrompt: (text: string) => void;
  onChangeNegativePrompt: (text: string) => void;
  onSelectStyle: (styleId: string) => void;
  onChangeTextModelConfig: (config: TextModelConfig) => void;
  onEnhancePrompt: () => void;
  onClearEnhanceError: () => void;
  onOpenSettings: () => void;
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
  enhanceError,
  textModelConfig,
  apiKeys,
  onChangePrompt,
  onChangeNegativePrompt,
  onSelectStyle,
  onChangeTextModelConfig,
  onEnhancePrompt,
  onClearEnhanceError,
  onOpenSettings,
}: PromptInputProps) {
  const [showNegative, setShowNegative] = useState(false);
  const [showModelDrawer, setShowModelDrawer] = useState(false);
  const [customModelInput, setCustomModelInput] = useState(textModelConfig.customModelId || '');

  const handleSamplePrompt = () => {
    const sample = SAMPLE_PROMPTS[Math.floor(Math.random() * SAMPLE_PROMPTS.length)];
    onChangePrompt(sample);
  };

  // Find active text model name
  const currentModelDef = TEXT_GENERATION_MODELS.find(
    (m) => m.provider === textModelConfig.provider && m.id === textModelConfig.model
  );
  const displayedModelName = currentModelDef
    ? currentModelDef.name
    : textModelConfig.customModelId || textModelConfig.model;

  // Filter text models for active text provider
  const availableModels = TEXT_GENERATION_MODELS.filter(
    (m) => m.provider === textModelConfig.provider
  );

  // Check if active text provider has an API key configured
  const isKeyConfigured = Boolean(
    (textModelConfig.provider === 'gemini' && apiKeys.gemini) ||
      (textModelConfig.provider === 'openai' && apiKeys.openai) ||
      (textModelConfig.provider === 'huggingface' && apiKeys.huggingface)
  );

  const handleSelectProvider = (prov: ProviderType) => {
    const defaultForProv = TEXT_GENERATION_MODELS.find((m) => m.provider === prov && m.isDefault);
    onChangeTextModelConfig({
      ...textModelConfig,
      provider: prov,
      model: defaultForProv ? defaultForProv.id : (TEXT_GENERATION_MODELS.find((m) => m.provider === prov)?.id || ''),
    });
  };

  const handleSelectModel = (modelId: string) => {
    onChangeTextModelConfig({
      ...textModelConfig,
      model: modelId,
    });
  };

  const handleSelectPersona = (persona: EnhancementPersona) => {
    onChangeTextModelConfig({
      ...textModelConfig,
      persona,
    });
  };

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-5">
      {/* Top action row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <span>Prompt</span>
        </label>

        <div className="flex flex-wrap items-center gap-2">
          {/* Example prompt */}
          <button
            type="button"
            onClick={handleSamplePrompt}
            className="flex h-8 items-center gap-1.5 rounded-md border border-border/70 bg-background/80 px-2.5 text-xs font-medium text-muted-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
          >
            <Lightbulb className="size-3.5 text-amber-400" />
            <span>Sample Prompt</span>
          </button>

          {/* Text Model Config Trigger */}
          <button
            type="button"
            onClick={() => setShowModelDrawer(!showModelDrawer)}
            className={`flex h-8 items-center gap-2 rounded-md px-3 text-xs font-mono transition-all border ${
              showModelDrawer
                ? 'border-cyan-500 bg-cyan-950/50 text-cyan-300 font-semibold shadow-sm'
                : 'border-border bg-background/80 text-muted-foreground hover:border-cyan-500/40 hover:text-foreground'
            }`}
            title="Configure model and persona for text generation & prompt enhancement"
          >
            <Cpu className="size-3.5 text-cyan-400" />
            <span className="truncate max-w-[140px] font-semibold">{displayedModelName}</span>
            <span
              className={`size-2 rounded-full ${
                isKeyConfigured ? 'bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.6)]' : 'bg-amber-400'
              }`}
            />
            <Sliders className="size-3 opacity-70 ml-0.5" />
          </button>

          {/* AI Prompt Enhancer Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onEnhancePrompt}
            disabled={isEnhancing || !prompt.trim()}
            title={
              isKeyConfigured
                ? `Enhance prompt with ${displayedModelName}`
                : `Configure API key for ${textModelConfig.provider} in Settings`
            }
            className="h-8 border-cyan-500/40 bg-cyan-950/40 px-3 text-xs font-semibold text-cyan-200 hover:bg-cyan-900/60 hover:text-cyan-100"
          >
            <Wand2 className={`size-3.5 mr-1.5 text-cyan-300 ${isEnhancing ? 'animate-spin' : ''}`} />
            <span>{isEnhancing ? 'Enhancing...' : 'Enhance'}</span>
          </Button>
        </div>
      </div>

      {/* TEXT MODEL CONFIGURATION DRAWER */}
      {showModelDrawer && (
        <div className="rounded-xl border border-border bg-background/90 p-4 space-y-3.5 shadow-inner">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="size-4 text-cyan-400" />
              <span className="text-sm font-semibold text-foreground">
                Text Generation & Enhancer Model
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowModelDrawer(false)}
              className="rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* 1. Provider Tabs */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              <span>Text Provider</span>
              {!isKeyConfigured && (
                <button
                  type="button"
                  onClick={onOpenSettings}
                  className="flex items-center gap-1.5 text-xs font-medium text-amber-400 hover:text-amber-300 normal-case"
                >
                  <Key className="size-3.5" />
                  <span>Configure API Key</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-1.5 rounded-lg bg-card p-1.5 border border-border">
              {(['gemini', 'openai', 'huggingface'] as const).map((prov) => {
                const isSelected = textModelConfig.provider === prov;
                const hasKey = Boolean(
                  (prov === 'gemini' && apiKeys.gemini) ||
                    (prov === 'openai' && apiKeys.openai) ||
                    (prov === 'huggingface' && apiKeys.huggingface)
                );
                return (
                  <button
                    key={prov}
                    type="button"
                    onClick={() => handleSelectProvider(prov)}
                    className={`flex h-8 items-center justify-center gap-2 rounded-md text-xs sm:text-sm capitalize transition-all ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
                    }`}
                  >
                    <span>{prov === 'gemini' ? 'Google' : prov === 'openai' ? 'OpenAI' : 'Hugging Face'}</span>
                    <span
                      className={`size-2 rounded-full ${
                        hasKey ? (isSelected ? 'bg-slate-950' : 'bg-cyan-400') : 'bg-amber-400'
                      }`}
                      title={hasKey ? 'Key configured' : 'No key configured'}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Model List */}
          <div className="space-y-2">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Select Model
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-52 overflow-y-auto pr-1">
              {availableModels.map((m) => {
                const isSelected = textModelConfig.model === m.id;
                return (
                  <div
                    key={m.id}
                    onClick={() => handleSelectModel(m.id)}
                    className={`cursor-pointer rounded-lg border p-2.5 transition-all ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-950/35 text-foreground shadow-[0_0_12px_rgba(6,182,212,0.1)]'
                        : 'border-border bg-card/60 text-muted-foreground hover:border-cyan-500/40 hover:text-foreground'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{m.name}</span>
                      {m.badge && (
                        <span className="rounded-md bg-cyan-950/70 border border-cyan-500/40 px-2 py-0.5 text-xs text-cyan-300 font-mono font-medium">
                          {m.badge}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                      {m.description}
                    </p>
                  </div>
                );
              })}

              {/* Custom Model Option */}
              <div
                onClick={() => handleSelectModel('custom')}
                className={`cursor-pointer rounded-lg border p-2.5 transition-all ${
                  textModelConfig.model === 'custom'
                    ? 'border-cyan-500 bg-cyan-950/35 text-foreground'
                    : 'border-border bg-card/60 text-muted-foreground hover:border-cyan-500/40 hover:text-foreground'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Custom Model ID</span>
                  <span className="rounded-md bg-card border border-border px-2 py-0.5 text-xs text-muted-foreground font-mono">
                    Manual
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Enter any valid model endpoint name
                </p>
              </div>
            </div>

            {/* Custom Model ID Text Input */}
            {textModelConfig.model === 'custom' && (
              <div className="pt-1">
                <input
                  type="text"
                  value={customModelInput}
                  onChange={(e) => {
                    setCustomModelInput(e.target.value);
                    onChangeTextModelConfig({
                      ...textModelConfig,
                      customModelId: e.target.value,
                    });
                  }}
                  placeholder={
                    textModelConfig.provider === 'gemini'
                      ? 'e.g. gemini-2.5-flash or gemini-2.0-flash'
                      : textModelConfig.provider === 'openai'
                      ? 'e.g. gpt-4o or o3-mini'
                      : 'e.g. deepseek-ai/DeepSeek-R1-Distill-Qwen-32B'
                  }
                  className="h-10 w-full rounded-lg border border-border bg-card px-3 font-mono text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none"
                />
              </div>
            )}
          </div>

          {/* 3. Enhancement Persona / Style */}
          <div className="space-y-2 pt-1">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Enhancement Tone & Persona
            </span>
            <div className="flex flex-wrap gap-1.5">
              {ENHANCEMENT_PERSONAS.map((persona) => {
                const isSelected = textModelConfig.persona === persona.id;
                return (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => handleSelectPersona(persona.id)}
                    title={persona.description}
                    className={`h-8 rounded-md px-3 text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                        : 'border border-border bg-card text-muted-foreground hover:border-cyan-500/40 hover:text-foreground'
                    }`}
                  >
                    {persona.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* INLINE ENHANCE ERROR NOTICE */}
      {enhanceError && (
        <div className="flex items-start justify-between gap-3 rounded-lg border border-amber-500/40 bg-amber-950/20 p-3.5 text-xs text-amber-200">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="size-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1.5">
              <span className="text-sm font-semibold text-amber-300">Text Generation Notice</span>
              <p className="text-xs text-amber-200/90 leading-relaxed">{enhanceError}</p>
              <div className="flex items-center gap-2 pt-1">
                {enhanceError.includes('gemini-1.5-flash') && (
                  <button
                    type="button"
                    onClick={() => {
                      onChangeTextModelConfig({
                        ...textModelConfig,
                        provider: 'gemini',
                        model: 'gemini-2.0-flash',
                      });
                      onClearEnhanceError();
                    }}
                    className="h-7.5 rounded-md bg-cyan-500 px-3 text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors"
                  >
                    Switch to Gemini 2.0 Flash
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowModelDrawer(true)}
                  className="h-7.5 rounded-md border border-amber-500/40 px-3 text-xs font-semibold text-amber-200 hover:bg-amber-900/40 transition-colors"
                >
                  Choose Model
                </button>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClearEnhanceError}
            className="rounded-md p-1 text-amber-400 hover:text-amber-200"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Main Textarea */}
      <div className="relative">
        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => onChangePrompt(e.target.value)}
          placeholder="Describe your subject, scene composition, lighting direction, and camera specifications..."
          className="w-full resize-y rounded-lg border border-border bg-background p-3.5 text-sm sm:text-base text-foreground placeholder:text-muted-foreground focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 focus:outline-none leading-relaxed"
        />
        {prompt && (
          <button
            type="button"
            onClick={() => onChangePrompt('')}
            className="absolute top-3 right-3 rounded-md p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {/* Character count & hint */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Specify camera focal length, material textures, and illumination source.</span>
        <span className="font-mono font-semibold">{prompt.length} chars</span>
      </div>

      {/* Style Presets */}
      <div className="space-y-2 pt-1">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Aesthetic Preset
        </span>
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {STYLE_PRESETS.map((preset) => {
            const isSelected = selectedStyle === preset.id;
            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => onSelectStyle(preset.id)}
                className={`flex h-8 shrink-0 items-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'border border-border bg-background text-muted-foreground hover:border-cyan-500/40 hover:text-foreground'
                }`}
              >
                <span>{preset.name}</span>
                {isSelected && <Check className="size-3.5 stroke-[3]" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Collapsible Negative Prompt */}
      <div className="border-t border-border pt-3">
        <button
          type="button"
          onClick={() => setShowNegative(!showNegative)}
          className="flex w-full items-center justify-between text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <div className="flex items-center gap-2">
            <EyeOff className="size-4 text-muted-foreground" />
            <span>Negative Prompt</span>
            {!supportsNegativePrompt && (
              <span className="text-xs text-muted-foreground font-normal">
                (Unsupported by active model)
              </span>
            )}
          </div>
          {showNegative ? <ChevronUp className="size-4" /> : <ChevronDown className="size-4" />}
        </button>

        {showNegative && (
          <div className="mt-2.5 space-y-2.5">
            <textarea
              rows={2}
              value={negativePrompt}
              onChange={(e) => onChangeNegativePrompt(e.target.value)}
              placeholder="e.g. low resolution, distorted geometry, blurred textures, artifacts"
              className="w-full resize-y rounded-lg border border-border bg-background p-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:border-cyan-500 focus:outline-none leading-relaxed"
            />
            <div className="flex flex-wrap gap-1.5">
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
                  className="h-7 rounded-md border border-border bg-card px-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:border-cyan-500/40 transition-colors"
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

