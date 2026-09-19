import { NextRequest, NextResponse } from 'next/server';
import { enhancePromptWithGemini } from '@/lib/providers/gemini';
import { enhancePromptWithOpenAI } from '@/lib/providers/openai';

export async function POST(req: NextRequest) {
  try {
    const { prompt, styleHint, enhancerProvider = 'auto' } = await req.json();

    if (!prompt || !prompt.trim()) {
      return NextResponse.json({ success: false, error: 'Prompt is required.' }, { status: 400 });
    }

    const geminiKey = req.headers.get('x-gemini-key') || process.env.GEMINI_API_KEY || '';
    const openaiKey = req.headers.get('x-openai-key') || process.env.OPENAI_API_KEY || '';

    let enhancedPrompt = '';
    let usedProvider = '';

    // If auto or gemini preferred and gemini key is available
    if ((enhancerProvider === 'auto' || enhancerProvider === 'gemini') && geminiKey) {
      try {
        enhancedPrompt = await enhancePromptWithGemini(geminiKey, prompt, styleHint);
        usedProvider = 'gemini';
      } catch (err) {
        if (enhancerProvider === 'gemini') throw err;
      }
    }

    // Fallback to OpenAI if gemini wasn't used or failed
    if (!enhancedPrompt && ((enhancerProvider === 'auto' || enhancerProvider === 'openai') && openaiKey)) {
      enhancedPrompt = await enhancePromptWithOpenAI(openaiKey, prompt, styleHint);
      usedProvider = 'openai';
    }

    if (!enhancedPrompt) {
      return NextResponse.json(
        {
          success: false,
          error:
            'To use AI Prompt Enhancement, please configure either a Google Gemini or OpenAI API key in Settings.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      enhancedPrompt,
      provider: usedProvider,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to enhance prompt';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
