import { NextRequest, NextResponse } from 'next/server';
import { generateWithHuggingFace } from '@/lib/providers/huggingface';
import { generateWithGemini } from '@/lib/providers/gemini';
import { generateWithOpenAI } from '@/lib/providers/openai';
import { GenerationParameters, GenerationResponse } from '@/types/studio';
import { getClosestImagenAspectRatio, getClosestSupportedDalle3Size, STYLE_PRESETS } from '@/lib/constants/models';

export const maxDuration = 60; // Allow long generation tasks

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    const body = (await req.json()) as GenerationParameters;
    console.log('[API /api/generate] Incoming generation request:', {
      provider: body.provider,
      model: body.model,
      dimensions: body.dimensions,
      hasPrompt: Boolean(body.prompt),
    });

    const {
      prompt,
      negativePrompt,
      provider = 'huggingface',
      model,
      customModelId,
      dimensions = { width: 1024, height: 1024, aspectRatio: '1:1', isCustom: false },
      numInferenceSteps,
      guidanceScale,
      seed,
      randomSeed,
      stylePreset,
      quality,
      style,
    } = body;

    if (!prompt || !prompt.trim()) {
      return NextResponse.json(
        { success: false, error: 'Prompt cannot be empty.' },
        { status: 400 }
      );
    }

    // Append style preset suffix if selected
    let finalPrompt = prompt.trim();
    let finalNegativePrompt = negativePrompt?.trim() || '';

    if (stylePreset && stylePreset !== 'none') {
      const selectedStyle = STYLE_PRESETS.find((s) => s.id === stylePreset);
      if (selectedStyle) {
        if (selectedStyle.promptSuffix && !finalPrompt.includes(selectedStyle.promptSuffix.trim())) {
          finalPrompt += selectedStyle.promptSuffix;
        }
        if (selectedStyle.negativeSuffix) {
          finalNegativePrompt = finalNegativePrompt
            ? `${finalNegativePrompt}, ${selectedStyle.negativeSuffix.replace(/^, /, '')}`
            : selectedStyle.negativeSuffix.replace(/^, /, '');
        }
      }
    }

    // Determine seed
    const effectiveSeed = randomSeed || seed === undefined ? Math.floor(Math.random() * 2147483647) : seed;

    let base64Data = '';
    let revisedPrompt: string | undefined;
    let finalModel = model;
    let generatedWidth = dimensions.width;
    let generatedHeight = dimensions.height;

    if (provider === 'huggingface') {
      const hfToken = req.headers.get('x-hf-token') || process.env.HUGGINGFACE_API_KEY || '';
      if (!hfToken) {
        return NextResponse.json(
          {
            success: false,
            error: 'Hugging Face API token is required. Please add your token in the Settings modal.',
          },
          { status: 401 }
        );
      }

      const targetModel = model === 'custom-huggingface-model' ? (customModelId?.trim() || '') : model;
      if (!targetModel) {
        return NextResponse.json(
          { success: false, error: 'Please enter a valid Hugging Face model repository ID.' },
          { status: 400 }
        );
      }
      finalModel = targetModel;

      const result = await generateWithHuggingFace({
        model: targetModel,
        token: hfToken,
        prompt: finalPrompt,
        negativePrompt: finalNegativePrompt,
        width: dimensions.width,
        height: dimensions.height,
        guidanceScale,
        numInferenceSteps,
        seed: effectiveSeed,
      });

      base64Data = result.base64Data;
      generatedWidth = result.width;
      generatedHeight = result.height;
    } else if (provider === 'gemini') {
      const geminiKey = req.headers.get('x-gemini-key') || process.env.GEMINI_API_KEY || '';
      if (!geminiKey) {
        return NextResponse.json(
          {
            success: false,
            error: 'Google Gemini API key is required. Please add your key in the Settings modal.',
          },
          { status: 401 }
        );
      }

      // Convert custom dimensions or aspect ratio to Gemini Imagen supported aspect ratios
      const imagenAspect = getClosestImagenAspectRatio(dimensions.width, dimensions.height);

      const result = await generateWithGemini({
        apiKey: geminiKey,
        prompt: finalPrompt,
        aspectRatio: imagenAspect,
        model: model || 'gemini-3-pro-image',
      });

      base64Data = result.base64Data;
      generatedWidth = result.width;
      generatedHeight = result.height;
    } else if (provider === 'openai') {
      const openaiKey = req.headers.get('x-openai-key') || process.env.OPENAI_API_KEY || '';
      if (!openaiKey) {
        return NextResponse.json(
          {
            success: false,
            error: 'OpenAI API key is required. Please add your key in the Settings modal.',
          },
          { status: 401 }
        );
      }

      const openaiModel = model || 'gpt-image-2.5-sunburst';

      const result = await generateWithOpenAI({
        apiKey: openaiKey,
        prompt: finalPrompt,
        model: openaiModel,
        width: dimensions.width,
        height: dimensions.height,
        quality: quality || 'high',
        style: style || 'vivid',
      });

      base64Data = result.base64Data;
      revisedPrompt = result.revisedPrompt;
      generatedWidth = result.width;
      generatedHeight = result.height;
    } else {
      return NextResponse.json(
        { success: false, error: `Unsupported provider: ${provider}` },
        { status: 400 }
      );
    }

    const durationMs = Date.now() - startTime;

    const responseData: GenerationResponse = {
      success: true,
      imageUrl: base64Data,
      base64Data,
      revisedPrompt,
      provider,
      model: finalModel,
      seed: effectiveSeed,
      dimensions: {
        width: generatedWidth,
        height: generatedHeight,
      },
      durationMs,
    };

    return NextResponse.json(responseData);
  } catch (error: unknown) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred during generation.';
    console.error('[API /api/generate] Generation failure:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      durationMs,
    });

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        durationMs,
      },
      { status: 500 }
    );
  }
}
