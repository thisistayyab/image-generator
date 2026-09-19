import { ModelDefinition, StylePreset, AspectRatio, ProviderType } from '@/types/studio';

export const MODELS: ModelDefinition[] = [
  // Hugging Face Models
  {
    id: 'black-forest-labs/FLUX.1-schnell',
    name: 'FLUX.1 [schnell]',
    provider: 'huggingface',
    description: 'Ultra-fast 4-step state-of-the-art diffusion model with incredible prompt adherence.',
    badge: 'Popular • Ultra Fast',
    category: 'fast',
    tags: ['Next-Gen', '4-Step', 'High Detail'],
    recommendedSteps: 4,
    recommendedGuidance: 3.5,
    supportsNegativePrompt: false,
    supportsCustomDimensions: true,
    isDefault: true,
  },
  {
    id: 'black-forest-labs/FLUX.1-dev',
    name: 'FLUX.1 [dev]',
    provider: 'huggingface',
    description: 'High-fidelity open-weights version for photorealism, typography, and complex scenes.',
    badge: 'Flagship',
    category: 'photoreal',
    tags: ['Photorealism', 'Typography', 'Ultra-Detail'],
    recommendedSteps: 25,
    recommendedGuidance: 3.5,
    supportsNegativePrompt: false,
    supportsCustomDimensions: true,
  },
  {
    id: 'stabilityai/stable-diffusion-3.5-large',
    name: 'Stable Diffusion 3.5 Large',
    provider: 'huggingface',
    description: 'Stability AI flagship model with exceptional text rendering and anatomical correctness.',
    badge: 'State of the Art',
    category: 'photoreal',
    tags: ['Typography', 'Composition', 'Complex Prompts'],
    recommendedSteps: 28,
    recommendedGuidance: 4.5,
    supportsNegativePrompt: true,
    supportsCustomDimensions: true,
  },
  {
    id: 'stabilityai/stable-diffusion-xl-base-1.0',
    name: 'SDXL 1.0 Base',
    provider: 'huggingface',
    description: 'The industry-standard open diffusion model. Excellent community compatibility and styling.',
    badge: 'Classic',
    category: 'general',
    tags: ['Versatile', 'High Res', 'Community Favorite'],
    recommendedSteps: 30,
    recommendedGuidance: 7.5,
    supportsNegativePrompt: true,
    supportsCustomDimensions: true,
  },
  {
    id: 'Tongyi-MAI/Z-Image-Turbo',
    name: 'Z-Image Turbo',
    provider: 'huggingface',
    description: 'Sub-second photorealistic image generation model with exceptional lighting and detail.',
    badge: 'Ultra Fast',
    category: 'fast',
    tags: ['Fast', 'Low Latency', 'Photoreal'],
    recommendedSteps: 8,
    recommendedGuidance: 2.5,
    supportsNegativePrompt: false,
    supportsCustomDimensions: true,
  },
  {
    id: 'stabilityai/stable-diffusion-3.5-medium',
    name: 'Stable Diffusion 3.5 Medium',
    provider: 'huggingface',
    description: 'Balanced 2.5B parameter diffusion model for high prompt accuracy and nuanced artistic styles.',
    badge: 'Balanced',
    category: 'artistic',
    tags: ['Artistic', 'Nuanced', 'Stability AI'],
    recommendedSteps: 28,
    recommendedGuidance: 4.5,
    supportsNegativePrompt: true,
    supportsCustomDimensions: true,
  },
  {
    id: 'Qwen/Qwen-Image',
    name: 'Qwen Image',
    provider: 'huggingface',
    description: 'Advanced multimodal diffusion model with bilingual prompt comprehension and complex layout control.',
    badge: 'Multimodal',
    category: 'general',
    tags: ['High Res', 'Complex Layouts', 'Next-Gen'],
    recommendedSteps: 25,
    recommendedGuidance: 5.0,
    supportsNegativePrompt: true,
    supportsCustomDimensions: true,
  },
  {
    id: 'custom-huggingface-model',
    name: 'Custom Hugging Face Model',
    provider: 'huggingface',
    description: 'Enter any public text-to-image model repository ID hosted on the Hugging Face Hub.',
    badge: 'BYO Model',
    category: 'custom',
    tags: ['Custom ID', 'Any Repo', 'Serverless'],
    recommendedSteps: 25,
    recommendedGuidance: 7.5,
    supportsNegativePrompt: true,
    supportsCustomDimensions: true,
    isCustom: true,
  },

  // Google Models
  {
    id: 'gemini-3-pro-image',
    name: 'Gemini 3 Pro Image',
    provider: 'gemini',
    description: 'Google’s premier flagship image generation model for supreme visual fidelity, photorealism, and complex multi-turn generation.',
    badge: 'Flagship Google • 4K',
    category: 'photoreal',
    tags: ['Gemini 3', 'Pro Quality', 'Photorealism', '4K Ready'],
    supportsNegativePrompt: false,
    supportsCustomDimensions: true,
    isDefault: true,
  },
  {
    id: 'gemini-3.1-flash-image',
    name: 'Gemini 3.1 Flash Image',
    provider: 'gemini',
    description: 'The modern workhorse model for websites, blogs, social media, and rapid high-resolution ideation.',
    badge: 'Workhorse • Fast',
    category: 'fast',
    tags: ['Gemini 3.1', 'Low Latency', '4K Ready'],
    supportsNegativePrompt: false,
    supportsCustomDimensions: true,
  },
  {
    id: 'gemini-3.1-flash-lite-image',
    name: 'Gemini 3.1 Flash-Lite Image',
    provider: 'gemini',
    description: 'Google’s fastest and most cost-effective image model, optimized for sub-second, high-velocity throughput.',
    badge: 'Ultra Fast',
    category: 'fast',
    tags: ['Sub-Second', 'Lightweight', 'High Throughput'],
    supportsNegativePrompt: false,
    supportsCustomDimensions: true,
  },
  {
    id: 'gemini-2.5-flash-image',
    name: 'Gemini 2.5 Flash Image (Nano Banana)',
    provider: 'gemini',
    description: 'Multimodal-native model famous for character consistency, style blending, and conversational natural language editing.',
    badge: 'Nano Banana',
    category: 'general',
    tags: ['Nano Banana', 'Consistency', 'Multi-Turn'],
    supportsNegativePrompt: false,
    supportsCustomDimensions: true,
  },
  {
    id: 'imagen-3.0-generate-002',
    name: 'Imagen 3 (HQ Photoreal)',
    provider: 'gemini',
    description: 'Google’s dedicated diffusion model with benchmark-topping natural lighting, fine textures, and clean text rendering.',
    badge: 'Photorealism',
    category: 'photoreal',
    tags: ['Photorealism', 'Typography', 'Imagen 3'],
    supportsNegativePrompt: false,
    supportsCustomDimensions: true,
  },
  {
    id: 'imagen-3.0-fast-generate-001',
    name: 'Imagen 3 Fast',
    provider: 'gemini',
    description: 'Accelerated Imagen 3 variant delivering high-fidelity visuals with minimal latency for rapid prototyping.',
    badge: 'Turbo',
    category: 'fast',
    tags: ['Fast', 'Imagen 3', 'Low Latency'],
    supportsNegativePrompt: false,
    supportsCustomDimensions: true,
  },
  {
    id: 'imagen-3.0-capability-001',
    name: 'Imagen 3 Capability',
    provider: 'gemini',
    description: 'High-capability Imagen 3 model optimized for artistic styling, spatial composition, and complex concept rendering.',
    badge: 'Creative',
    category: 'artistic',
    tags: ['Artistic', 'Composition', 'Imagen 3'],
    supportsNegativePrompt: false,
    supportsCustomDimensions: true,
  },

  // OpenAI Models
  {
    id: 'gpt-image-2.5-sunburst',
    name: 'GPT-Image-2.5 Sunburst',
    provider: 'openai',
    description: 'OpenAI’s highest-capability image model for premium creative assets, product photography, and 4K output.',
    badge: 'Flagship • 4K Native',
    category: 'photoreal',
    tags: ['4K Native', 'Highest Quality', 'Precision Editing'],
    supportsNegativePrompt: false,
    supportsCustomDimensions: true,
    isDefault: true,
  },
  {
    id: 'gpt-image-2.5-flare',
    name: 'GPT-Image-2.5 Flare',
    provider: 'openai',
    description: 'OpenAI’s faster 2.5 variant. Delivers high-quality generation at up to 50% lower latency with full 4K support.',
    badge: 'High Speed • 4K',
    category: 'fast',
    tags: ['4K Support', 'Fast', 'Production Ready'],
    supportsNegativePrompt: false,
    supportsCustomDimensions: true,
  },
  {
    id: 'dall-e-3',
    name: 'OpenAI DALL·E 3 (Legacy)',
    provider: 'openai',
    description: 'Previous-generation DALL-E model with fixed 1024px sizes.',
    badge: 'Legacy',
    category: 'general',
    tags: ['Legacy', 'DALL-E 3'],
    supportsNegativePrompt: false,
    supportsCustomDimensions: false,
  },
];

export const ASPECT_RATIOS: {
  ratio: AspectRatio;
  label: string;
  sublabel: string;
  width: number;
  height: number;
  iconName: string;
}[] = [
  { ratio: '1:1', label: '1:1', sublabel: 'Square', width: 1024, height: 1024, iconName: 'Square' },
  { ratio: '16:9', label: '16:9', sublabel: 'Landscape', width: 1344, height: 768, iconName: 'RectangleHorizontal' },
  { ratio: '9:16', label: '9:16', sublabel: 'Story / Reel', width: 768, height: 1344, iconName: 'RectangleVertical' },
  { ratio: '4:3', label: '4:3', sublabel: 'Standard', width: 1152, height: 864, iconName: 'Monitor' },
  { ratio: '3:4', label: '3:4', sublabel: 'Portrait', width: 864, height: 1152, iconName: 'Smartphone' },
  { ratio: '3:2', label: '3:2', sublabel: 'Photo', width: 1216, height: 832, iconName: 'Camera' },
  { ratio: '21:9', label: '21:9', sublabel: 'Ultrawide', width: 1536, height: 640, iconName: 'Film' },
];

export const QUICK_CUSTOM_DIMENSIONS: { label: string; width: number; height: number }[] = [
  { label: '512 × 512', width: 512, height: 512 },
  { label: '1024 × 1024 (HD)', width: 1024, height: 1024 },
  { label: '1344 × 768 (16:9)', width: 1344, height: 768 },
  { label: '1920 × 1080 (FHD)', width: 1920, height: 1080 },
  { label: '2560 × 1440 (2K QHD)', width: 2560, height: 1440 },
  { label: '3840 × 2160 (4K UHD)', width: 3840, height: 2160 },
  { label: '4096 × 4096 (4K Square)', width: 4096, height: 4096 },
];

export const STYLE_PRESETS: StylePreset[] = [
  {
    id: 'none',
    name: 'Raw / Direct',
    promptSuffix: '',
  },
  {
    id: 'editorial',
    name: 'Editorial Photography',
    promptSuffix: ', professional editorial photography, natural diffused lighting, shot on 35mm lens, f/2.0 aperture, realistic textures, balanced dynamic range',
    negativeSuffix: ', oversaturated, cartoon, 3d render, distorted, artificial, plastic look',
  },
  {
    id: 'cinematic',
    name: 'Cinematic Still',
    promptSuffix: ', 35mm cinematic film still, subtle volumetric lighting, natural contrast, professional color grade, anamorphic framing, photorealistic detail',
    negativeSuffix: ', flat lighting, digital noise, oversaturated, amateur framing',
  },
  {
    id: 'studio-product',
    name: 'Commercial Studio',
    promptSuffix: ', commercial studio product photography, clean neutral backdrop, softbox key light with fill, sharp geometric focus, premium tactile materials',
    negativeSuffix: ', cluttered background, low resolution, harsh shadows',
  },
  {
    id: 'architectural',
    name: 'Architectural',
    promptSuffix: ', architectural photography, straight vertical lines, balanced ambient daylight, authentic concrete and glass textures, wide perspective',
    negativeSuffix: ', distorted perspective, fisheye, blurry edges',
  },
  {
    id: 'analog-film',
    name: 'Analog 35mm',
    promptSuffix: ', authentic analog 35mm film photograph, subtle organic film grain, natural skin and material tones, gentle highlight roll-off',
    negativeSuffix: ', digital HDR, oversharpened, plastic textures',
  },
  {
    id: 'minimalist',
    name: 'Minimalist',
    promptSuffix: ', minimalist composition, negative space, refined tonal palette, clean geometric lines, soft natural shadows',
    negativeSuffix: ', busy composition, visual noise, chaotic background',
  },
];

export function getClosestSupportedDalle3Size(width: number, height: number): '1024x1024' | '1024x1792' | '1792x1024' {
  const ratio = width / height;
  if (ratio >= 1.3) {
    return '1792x1024'; // landscape
  } else if (ratio <= 0.77) {
    return '1024x1792'; // portrait
  }
  return '1024x1024'; // square
}

export const GOOGLE_ASPECT_RATIO_PIXELS: Record<'1:1' | '3:4' | '4:3' | '9:16' | '16:9', { width: number; height: number }> = {
  '1:1': { width: 1024, height: 1024 },
  '16:9': { width: 1344, height: 768 },
  '9:16': { width: 768, height: 1344 },
  '4:3': { width: 1152, height: 864 },
  '3:4': { width: 864, height: 1152 },
};

export function getClosestImagenAspectRatio(width: number, height: number): '1:1' | '3:4' | '4:3' | '9:16' | '16:9' {
  const ratio = width / height;
  const supported: { ratio: '1:1' | '3:4' | '4:3' | '9:16' | '16:9'; val: number }[] = [
    { ratio: '16:9', val: 16 / 9 },
    { ratio: '4:3', val: 4 / 3 },
    { ratio: '1:1', val: 1 },
    { ratio: '3:4', val: 3 / 4 },
    { ratio: '9:16', val: 9 / 16 },
  ];

  let closest = supported[0];
  let minDiff = Math.abs(ratio - closest.val);

  for (const item of supported) {
    const diff = Math.abs(ratio - item.val);
    if (diff < minDiff) {
      minDiff = diff;
      closest = item;
    }
  }

  return closest.ratio;
}

export function getSupportedAspectRatiosForModel(modelId?: string, provider?: ProviderType) {
  if (provider === 'gemini') {
    // Google Gemini & Imagen natively support these 5 aspect ratios
    return ASPECT_RATIOS.filter((r) =>
      ['1:1', '16:9', '9:16', '4:3', '3:4'].includes(r.ratio)
    );
  }
  if (modelId === 'dall-e-3') {
    // DALL-E 3 only supports 3 native resolutions
    return [
      { ratio: '1:1' as const, label: '1:1', sublabel: 'Square', width: 1024, height: 1024, iconName: 'Square' },
      { ratio: '16:9' as const, label: '16:9', sublabel: 'Landscape', width: 1792, height: 1024, iconName: 'RectangleHorizontal' },
      { ratio: '9:16' as const, label: '9:16', sublabel: 'Portrait', width: 1024, height: 1792, iconName: 'RectangleVertical' },
    ];
  }
  if (modelId === 'dall-e-2') {
    return [
      { ratio: '1:1' as const, label: '1:1', sublabel: 'Square', width: 1024, height: 1024, iconName: 'Square' },
    ];
  }
  // For GPT-Image-2.5 and Hugging Face models, return all 7 calibrated ratios
  return ASPECT_RATIOS;
}

