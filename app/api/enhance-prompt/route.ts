import { NextRequest, NextResponse } from 'next/server';
import { enhancePromptWithGemini } from '@/lib/providers/gemini';
import { enhancePromptWithOpenAI } from '@/lib/providers/openai';
import { enhancePromptWithHuggingFace } from '@/lib/providers/huggingface';
import { ProviderType, EnhancementPersona } from '@/types/studio';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      styleHint,
      provider = 'auto',
      model,
      customModelId,
      persona = 'cinematic',
    } = body as {
      prompt: string;
      styleHint?: string;
      provider?: ProviderType | 'auto';
      model?: string;
      customModelId?: string;
      persona?: EnhancementPersona;
    };

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ success: false, error: 'Prompt is required.' }, { status: 400 });
    }

    const geminiKey = req.headers.get('x-gemini-key') || process.env.GEMINI_API_KEY || '';
    const openaiKey = req.headers.get('x-openai-key') || process.env.OPENAI_API_KEY || '';
    const hfToken = req.headers.get('x-hf-token') || process.env.HUGGINGFACE_API_KEY || '';

    let enhancedPrompt = '';
    let usedProvider = provider;
    let usedModel = model || '';

    // Determine target model
    const targetModel = (model === 'custom' || !model) ? (customModelId?.trim() || model) : model;

    // 1. Explicit Gemini
    if (provider === 'gemini') {
      if (!geminiKey) {
        return NextResponse.json(
          {
            success: false,
            error: 'Google Gemini API Key is required. Please configure your key in Settings.',
          },
          { status: 401 }
        );
      }
      const modelToUse = targetModel || 'gemini-2.0-flash';
      enhancedPrompt = await enhancePromptWithGemini(geminiKey, prompt, styleHint, modelToUse, persona);
      usedModel = modelToUse;
    }
    // 2. Explicit OpenAI
    else if (provider === 'openai') {
      if (!openaiKey) {
        return NextResponse.json(
          {
            success: false,
            error: 'OpenAI API Key is required. Please configure your key in Settings.',
          },
          { status: 401 }
        );
      }
      const modelToUse = targetModel || 'gpt-4o-mini';
      enhancedPrompt = await enhancePromptWithOpenAI(openaiKey, prompt, styleHint, modelToUse, persona);
      usedModel = modelToUse;
    }
    // 3. Explicit Hugging Face
    else if (provider === 'huggingface') {
      if (!hfToken) {
        return NextResponse.json(
          {
            success: false,
            error: 'Hugging Face Access Token is required. Please configure your token in Settings.',
          },
          { status: 401 }
        );
      }
      const modelToUse = targetModel || 'meta-llama/Llama-3.3-70B-Instruct';
      enhancedPrompt = await enhancePromptWithHuggingFace(hfToken, prompt, styleHint, modelToUse, persona);
      usedModel = modelToUse;
    }
    // 4. Auto Mode: tries available keys in order of efficiency
    else {
      let lastErr: Error | null = null;

      if (geminiKey) {
        try {
          const m = targetModel || 'gemini-2.0-flash';
          enhancedPrompt = await enhancePromptWithGemini(geminiKey, prompt, styleHint, m, persona);
          usedProvider = 'gemini';
          usedModel = m;
        } catch (err) {
          lastErr = err instanceof Error ? err : new Error(String(err));
        }
      }

      if (!enhancedPrompt && openaiKey) {
        try {
          const m = targetModel || 'gpt-4o-mini';
          enhancedPrompt = await enhancePromptWithOpenAI(openaiKey, prompt, styleHint, m, persona);
          usedProvider = 'openai';
          usedModel = m;
        } catch (err) {
          lastErr = err instanceof Error ? err : new Error(String(err));
        }
      }

      if (!enhancedPrompt && hfToken) {
        try {
          const m = targetModel || 'meta-llama/Llama-3.3-70B-Instruct';
          enhancedPrompt = await enhancePromptWithHuggingFace(hfToken, prompt, styleHint, m, persona);
          usedProvider = 'huggingface';
          usedModel = m;
        } catch (err) {
          lastErr = err instanceof Error ? err : new Error(String(err));
        }
      }

      if (!enhancedPrompt) {
        if (lastErr) {
          throw lastErr;
        }
        return NextResponse.json(
          {
            success: false,
            error:
              'To use AI Prompt Enhancement, please configure a Google Gemini, OpenAI, or Hugging Face API key in Settings.',
          },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      enhancedPrompt,
      provider: usedProvider,
      model: usedModel,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to enhance prompt';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
