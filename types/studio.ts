export type ProviderType = 'huggingface' | 'gemini' | 'openai';

export type AspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '3:2' | '21:9' | 'custom';

export interface DimensionConfig {
  width: number;
  height: number;
  aspectRatio: AspectRatio;
  isCustom: boolean;
}

export interface ModelDefinition {
  id: string;
  name: string;
  provider: ProviderType;
  description: string;
  badge?: string;
  category: 'fast' | 'photoreal' | 'artistic' | 'anime' | 'general' | 'custom';
  tags: string[];
  recommendedSteps?: number;
  recommendedGuidance?: number;
  supportsNegativePrompt?: boolean;
  supportsCustomDimensions?: boolean;
  isDefault?: boolean;
  isCustom?: boolean;
}

export interface StylePreset {
  id: string;
  name: string;
  promptSuffix: string;
  negativeSuffix?: string;
  icon?: string;
  previewBg?: string;
}

export interface GenerationParameters {
  prompt: string;
  negativePrompt?: string;
  provider: ProviderType;
  model: string;
  customModelId?: string;
  dimensions: DimensionConfig;
  numInferenceSteps?: number;
  guidanceScale?: number;
  seed?: number;
  randomSeed: boolean;
  stylePreset?: string;
  // OpenAI specific (GPT-Image-2.5 and DALL-E)
  quality?: 'low' | 'medium' | 'high' | 'xhigh' | 'max' | 'auto' | 'standard' | 'hd';
  style?: 'vivid' | 'natural';
}

export interface GenerationResponse {
  success: boolean;
  imageUrl?: string;
  base64Data?: string;
  revisedPrompt?: string;
  provider: ProviderType;
  model: string;
  seed?: number;
  dimensions: {
    width: number;
    height: number;
  };
  durationMs: number;
  isUpscaled?: boolean;
  upscaledFrom?: {
    width: number;
    height: number;
  };
  error?: string;
  details?: string;
}

export interface ApiKeysState {
  huggingface: string;
  gemini: string;
  openai: string;
}

export interface ImageHistoryItem {
  id: string;
  imageUrl: string;
  prompt: string;
  negativePrompt?: string;
  provider: ProviderType;
  model: string;
  isUpscaled?: boolean;
  parameters: {
    dimensions: DimensionConfig;
    seed?: number;
    guidanceScale?: number;
    numInferenceSteps?: number;
    stylePreset?: string;
    quality?: string;
    style?: string;
  };
  createdAt: number;
}

export type EnhancementPersona = 'cinematic' | 'concept-art' | 'minimalist' | 'anime' | 'tags';

export interface TextModelOption {
  id: string;
  name: string;
  provider: ProviderType;
  description: string;
  badge?: string;
  isDefault?: boolean;
}

export interface TextModelConfig {
  provider: ProviderType;
  model: string;
  customModelId?: string;
  persona: EnhancementPersona;
}
