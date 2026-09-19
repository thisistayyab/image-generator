'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import { StudioHeader } from '@/components/studio/header';
import { ApiKeysModal } from '@/components/studio/api-keys-modal';
import { ModelSelector } from '@/components/studio/model-selector';
import { PromptInput } from '@/components/studio/prompt-input';
import { DimensionSelector } from '@/components/studio/dimension-selector';
import { ParameterControls } from '@/components/studio/parameter-controls';
import { ImageCanvas } from '@/components/studio/image-canvas';
import { GalleryHistory } from '@/components/studio/gallery-history';
import { Button } from '@/components/ui/button';
import {
  ApiKeysState,
  ProviderType,
  ModelDefinition,
  DimensionConfig,
  GenerationResponse,
  ImageHistoryItem,
} from '@/types/studio';
import { MODELS } from '@/lib/constants/models';
import { Play, Loader2 } from 'lucide-react';

const STORAGE_KEYS_KEY = 'aura_api_keys_v1';
const STORAGE_HISTORY_KEY = 'aura_history_v1';

export function StudioClient() {
  // API Keys state
  const [apiKeys, setApiKeys] = useState<ApiKeysState>({
    huggingface: '',
    gemini: '',
    openai: '',
  });

  // Prompt state
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('none');

  // Model & Provider state
  const [provider, setProvider] = useState<ProviderType>('huggingface');
  const [selectedModel, setSelectedModel] = useState<ModelDefinition>(
    MODELS.find((m) => m.isDefault) || MODELS[0]
  );
  const [customModelId, setCustomModelId] = useState('');

  // Dimension state (default 1024x1024 1:1)
  const [dimensions, setDimensions] = useState<DimensionConfig>({
    width: 1024,
    height: 1024,
    aspectRatio: '1:1',
    isCustom: false,
  });

  // Diffusion / Generation Tuning Parameters
  const [numInferenceSteps, setNumInferenceSteps] = useState(
    selectedModel.recommendedSteps || 4
  );
  const [guidanceScale, setGuidanceScale] = useState(
    selectedModel.recommendedGuidance || 3.5
  );
  const [seed, setSeed] = useState<number | undefined>(undefined);
  const [randomSeed, setRandomSeed] = useState(true);
  const [quality, setQuality] = useState<
    'low' | 'medium' | 'high' | 'xhigh' | 'max' | 'auto' | 'standard' | 'hd'
  >('high');
  const [style, setStyle] = useState<'vivid' | 'natural'>('vivid');

  // Canvas & Execution state
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [generationResult, setGenerationResult] = useState<GenerationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Gallery History state
  const [history, setHistory] = useState<ImageHistoryItem[]>([]);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // 1. Load keys & history from localStorage on client mount
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedKeys = localStorage.getItem(STORAGE_KEYS_KEY);
        if (savedKeys) {
          setApiKeys(JSON.parse(savedKeys));
        } else {
          // Open settings modal on first visit so user knows to add their Hugging Face token
          setIsSettingsOpen(true);
        }

        const savedHistory = localStorage.getItem(STORAGE_HISTORY_KEY);
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        }
      } catch (e) {
        console.error('Failed to load data from localStorage', e);
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  // 2. Save keys to localStorage
  const handleSaveKeys = (newKeys: ApiKeysState) => {
    setApiKeys(newKeys);
    try {
      localStorage.setItem(STORAGE_KEYS_KEY, JSON.stringify(newKeys));
    } catch (e) {
      console.error('Failed to save keys to localStorage', e);
    }
  };

  // 3. Save generation to history
  const saveToHistory = (res: GenerationResponse) => {
    if (!res.imageUrl) return;

    const newItem: ImageHistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      imageUrl: res.imageUrl,
      prompt: prompt,
      negativePrompt: negativePrompt,
      provider: res.provider,
      model: res.model,
      parameters: {
        dimensions,
        seed: res.seed,
        guidanceScale,
        numInferenceSteps,
        stylePreset: selectedStyle,
        quality,
        style,
      },
      createdAt: Date.now(),
    };

    setHistory((prev) => {
      const updated = [newItem, ...prev].slice(0, 40); // Keep last 40 images
      try {
        localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('LocalStorage limit reached for history', e);
      }
      return updated;
    });
  };

  // 4. Handle Model Selection
  const handleSelectModel = (model: ModelDefinition) => {
    setSelectedModel(model);
    setProvider(model.provider);
    if (model.recommendedSteps) setNumInferenceSteps(model.recommendedSteps);
    if (model.recommendedGuidance) setGuidanceScale(model.recommendedGuidance);
  };

  // 5. Handle Image Generation
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter an image prompt before generating.');
      return;
    }

    // Check if relevant API key is configured
    const activeKey =
      provider === 'huggingface'
        ? apiKeys.huggingface
        : provider === 'gemini'
        ? apiKeys.gemini
        : apiKeys.openai;

    if (!activeKey?.trim()) {
      setIsSettingsOpen(true);
      setError(`Please configure your ${provider} API key or token in Settings to generate images.`);
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiKeys.huggingface) headers['x-hf-token'] = apiKeys.huggingface;
      if (apiKeys.gemini) headers['x-gemini-key'] = apiKeys.gemini;
      if (apiKeys.openai) headers['x-openai-key'] = apiKeys.openai;

      const response = await fetch('/api/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt,
          negativePrompt,
          provider,
          model: selectedModel.id,
          customModelId: selectedModel.isCustom ? customModelId : undefined,
          dimensions,
          numInferenceSteps,
          guidanceScale,
          seed,
          randomSeed,
          stylePreset: selectedStyle,
          quality,
          style,
        }),
      });

      const data = (await response.json()) as GenerationResponse;

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate image.');
      }

      setGenerationResult(data);
      saveToHistory(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'An unexpected generation error occurred.';
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  // 6. Handle AI Prompt Enhancement
  const handleEnhancePrompt = async () => {
    if (!prompt.trim()) return;

    // Check if Gemini or OpenAI key is present
    if (!apiKeys.gemini && !apiKeys.openai) {
      setIsSettingsOpen(true);
      setError('Prompt enhancement requires either a Google Gemini or OpenAI API key. Please configure one in Settings.');
      return;
    }

    setIsEnhancing(true);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (apiKeys.gemini) headers['x-gemini-key'] = apiKeys.gemini;
      if (apiKeys.openai) headers['x-openai-key'] = apiKeys.openai;

      const response = await fetch('/api/enhance-prompt', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          prompt,
          styleHint: selectedStyle !== 'none' ? selectedStyle : undefined,
          enhancerProvider: apiKeys.gemini ? 'gemini' : 'openai',
        }),
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to enhance prompt.');
      }

      setPrompt(data.enhancedPrompt);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to enhance prompt.';
      setError(msg);
    } finally {
      setIsEnhancing(false);
    }
  };

  // 7. Handle Remix / Re-loading previous generation
  const handleRemix = (item: ImageHistoryItem) => {
    setPrompt(item.prompt);
    if (item.negativePrompt) setNegativePrompt(item.negativePrompt);
    setProvider(item.provider);

    const matchingModel = MODELS.find((m) => m.id === item.model);
    if (matchingModel) {
      setSelectedModel(matchingModel);
    } else if (item.provider === 'huggingface') {
      const customM = MODELS.find((m) => m.isCustom);
      if (customM) {
        setSelectedModel(customM);
        setCustomModelId(item.model);
      }
    }

    if (item.parameters.dimensions) {
      setDimensions(item.parameters.dimensions);
    }
    if (item.parameters.numInferenceSteps) {
      setNumInferenceSteps(item.parameters.numInferenceSteps);
    }
    if (item.parameters.guidanceScale) {
      setGuidanceScale(item.parameters.guidanceScale);
    }
    if (item.parameters.stylePreset) {
      setSelectedStyle(item.parameters.stylePreset);
    }
  };

  // 8. Clear History
  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_HISTORY_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  // 9. Delete single history item
  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    setHistory(updated);
    try {
      localStorage.setItem(STORAGE_HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground font-sans selection:bg-cyan-500/30 selection:text-foreground">
      {/* Studio Navigation Header */}
      <StudioHeader
        apiKeys={apiKeys}
        activeProvider={provider}
        historyCount={history.length}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: Controls & Generation Studio */}
          <div className="lg:col-span-6 space-y-4">
            {/* Model & Provider Selector */}
            <ModelSelector
              provider={provider}
              modelId={selectedModel.id}
              customModelId={customModelId}
              onSelectProvider={(p) => setProvider(p)}
              onSelectModel={handleSelectModel}
              onChangeCustomModelId={setCustomModelId}
            />

            {/* Prompt & Style Presets */}
            <PromptInput
              prompt={prompt}
              negativePrompt={negativePrompt}
              selectedStyle={selectedStyle}
              supportsNegativePrompt={selectedModel.supportsNegativePrompt}
              isEnhancing={isEnhancing}
              hasEnhancerKey={Boolean(apiKeys.gemini || apiKeys.openai)}
              onChangePrompt={setPrompt}
              onChangeNegativePrompt={setNegativePrompt}
              onSelectStyle={setSelectedStyle}
              onEnhancePrompt={handleEnhancePrompt}
            />

            {/* Aspect Ratio & Custom Dimensions (W x H) */}
            <DimensionSelector
              dimensions={dimensions}
              provider={provider}
              model={selectedModel}
              onChangeDimensions={setDimensions}
            />

            {/* Advanced Parameter Controls */}
            <ParameterControls
              provider={provider}
              model={selectedModel}
              numInferenceSteps={numInferenceSteps}
              guidanceScale={guidanceScale}
              seed={seed}
              randomSeed={randomSeed}
              quality={quality}
              style={style}
              onChangeSteps={setNumInferenceSteps}
              onChangeGuidance={setGuidanceScale}
              onChangeSeed={setSeed}
              onToggleRandomSeed={setRandomSeed}
              onChangeQuality={setQuality}
              onChangeStyle={setStyle}
            />

            {/* GENERATE PRIMARY ACTION BUTTON */}
            <div className="pt-1">
              <Button
                size="lg"
                disabled={isGenerating || !prompt.trim()}
                onClick={handleGenerate}
                className="w-full h-11 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs sm:text-sm shadow-[0_4px_20px_rgba(6,182,212,0.25)] hover:shadow-[0_6px_28px_rgba(6,182,212,0.35)] hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="size-4 animate-spin text-slate-950" />
                    <span>Processing Inference...</span>
                  </>
                ) : (
                  <>
                    <Play className="size-3.5 fill-current" />
                    <span>Generate ({selectedModel.name})</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* RIGHT COLUMN: Live Canvas & Viewport (6 cols on large screens) */}
          <div className="lg:col-span-6 sticky top-22">
            <ImageCanvas
              isGenerating={isGenerating}
              activeProvider={provider}
              activeModelName={selectedModel.name}
              generationResult={generationResult}
              error={error}
              onRetry={handleGenerate}
              onOpenSettings={() => setIsSettingsOpen(true)}
              onSelectPrompt={setPrompt}
              onUpdateGenerationResult={setGenerationResult}
            />
          </div>
        </div>
      </main>

      {/* API Keys Configuration Modal */}
      <ApiKeysModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKeys={apiKeys}
        onSaveKeys={handleSaveKeys}
      />

      {/* Saved Gallery History Drawer */}
      <GalleryHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onSelectRemix={handleRemix}
        onDeleteHistoryItem={handleDeleteHistoryItem}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
