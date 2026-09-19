import { GOOGLE_ASPECT_RATIO_PIXELS } from '@/lib/constants/models';

export interface GeminiGenerateOptions {
  apiKey: string;
  prompt: string;
  aspectRatio?: '1:1' | '3:4' | '4:3' | '9:16' | '16:9';
  model?: string;
}

export async function generateWithGemini(options: GeminiGenerateOptions): Promise<{
  base64Data: string;
  contentType: string;
  width: number;
  height: number;
}> {
  const { apiKey, prompt, aspectRatio = '1:1', model = 'gemini-3-pro-image' } = options;

  if (!apiKey || !apiKey.trim()) {
    throw new Error('Google Gemini API Key is required. Please set it in Settings.');
  }

  const cleanKey = apiKey.trim();
  const cleanModel = model.trim();

  // Determine whether this is a native multimodal Gemini model or a dedicated Imagen model
  const isNativeGemini = cleanModel.startsWith('gemini-');

  console.log(`[Google Gemini] Initiating generation with model "${cleanModel}" (aspectRatio: ${aspectRatio})`);
  console.log(`[Google Gemini] Method: ${isNativeGemini ? 'generateContent (Multimodal)' : 'predict (Imagen)'}`);

  if (isNativeGemini) {
    // 1. Native Gemini Multimodal Image Generation (:generateContent with responseModalities: ["TEXT", "IMAGE"])
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${cleanKey}`;

    const payload = {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        responseModalities: ['TEXT', 'IMAGE'],
        imageConfig: {
          aspectRatio: aspectRatio,
        },
      },
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errMessage = `Google Gemini generation error (${response.status} ${response.statusText})`;
      try {
        const errJson = await response.json();
        if (errJson.error?.message) {
          errMessage = errJson.error.message;
        }
      } catch {
        const text = await response.text().catch(() => '');
        if (text) errMessage += `: ${text.slice(0, 300)}`;
      }

      console.error(`[Google Gemini] API error on ${cleanModel}:`, errMessage);

      if (response.status === 400 && errMessage.toLowerCase().includes('api key')) {
        throw new Error('Invalid Google Gemini API Key. Please verify your key at https://aistudio.google.com/app/apikey.');
      }

      throw new Error(errMessage);
    }

    const data = await response.json();
    const candidate = data.candidates?.[0];

    if (!candidate) {
      throw new Error('No candidate response returned by Google Gemini.');
    }

    // Find the inlineData part containing the generated image
    const parts = candidate.content?.parts || [];
    const imagePart = parts.find(
      (part: any) => part.inlineData && part.inlineData.data
    );

    if (!imagePart) {
      const reason = candidate.finishReason || 'UNKNOWN';
      throw new Error(
        `No image was returned by Google Gemini (finishReason: ${reason}). The prompt may have triggered content or safety filters.`
      );
    }

    const mimeType = imagePart.inlineData.mimeType || 'image/jpeg';
    const base64Data = `data:${mimeType};base64,${imagePart.inlineData.data}`;

    const nativeDims = GOOGLE_ASPECT_RATIO_PIXELS[aspectRatio] || { width: 1024, height: 1024 };

    console.log(`[Google Gemini] Successfully generated image with ${cleanModel} (${mimeType}, ${nativeDims.width}x${nativeDims.height})`);

    return {
      base64Data,
      contentType: mimeType,
      width: nativeDims.width,
      height: nativeDims.height,
    };
  } else {
    // 2. Dedicated Google Imagen Generation (:predict with instances)
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:predict?key=${cleanKey}`;

    const payload = {
      instances: [
        {
          prompt: prompt,
        },
      ],
      parameters: {
        sampleCount: 1,
        aspectRatio: aspectRatio,
        personGeneration: 'ALLOW_ADULT',
        outputMimeType: 'image/jpeg',
      },
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errMessage = `Google Imagen error (${response.status} ${response.statusText})`;
      try {
        const errJson = await response.json();
        if (errJson.error?.message) {
          errMessage = errJson.error.message;
        }
      } catch {
        const text = await response.text().catch(() => '');
        if (text) errMessage += `: ${text.slice(0, 300)}`;
      }

      console.error(`[Google Imagen] API error on ${cleanModel}:`, errMessage);

      if (response.status === 400 && errMessage.toLowerCase().includes('api key')) {
        throw new Error('Invalid Google Gemini API Key. Please verify your key at https://aistudio.google.com/app/apikey.');
      }

      throw new Error(errMessage);
    }

    const data = await response.json();
    const prediction = data.predictions?.[0];

    if (!prediction || !prediction.bytesBase64Encoded) {
      throw new Error('No image was returned by Google Imagen. The prompt may have triggered a safety filter.');
    }

    const mimeType = prediction.mimeType || 'image/jpeg';
    const base64Data = `data:${mimeType};base64,${prediction.bytesBase64Encoded}`;

    const nativeDims = GOOGLE_ASPECT_RATIO_PIXELS[aspectRatio] || { width: 1024, height: 1024 };
    console.log(`[Google Imagen] Successfully generated image with ${cleanModel} (${mimeType}, ${nativeDims.width}x${nativeDims.height})`);

    return {
      base64Data,
      contentType: mimeType,
      width: nativeDims.width,
      height: nativeDims.height,
    };
  }
}

export async function enhancePromptWithGemini(
  apiKey: string,
  userPrompt: string,
  styleHint?: string,
  modelName: string = 'gemini-2.0-flash',
  persona: string = 'cinematic'
): Promise<string> {
  if (!apiKey) {
    throw new Error('Google Gemini API Key is required for prompt enhancement.');
  }

  // Clean model identifier: ensure no redundant "models/" prefix
  const cleanModel = modelName.replace(/^models\//, '').trim() || 'gemini-2.0-flash';

  let personaGuide = 'Focus on rich visual details, 35mm camera lens specs, dynamic lighting, and atmospheric mood.';
  if (persona === 'cinematic') {
    personaGuide = 'Focus on cinematic storytelling, 35mm anamorphic camera optics, volumetric rim lighting, deep shadows, and cinematic color grade.';
  } else if (persona === 'concept-art') {
    personaGuide = 'Focus on dramatic worldbuilding, high-concept visual scale, intricate biomechanical textures, and vibrant color dynamics.';
  } else if (persona === 'minimalist') {
    personaGuide = 'Focus on clean negative space, raw brutalist or natural textures, overcast soft light, and elegant composition.';
  } else if (persona === 'anime') {
    personaGuide = 'Focus on vibrant cel-shading, dynamic camera perspective, glowing rim lighting, and high-fidelity anime art style.';
  } else if (persona === 'tags') {
    personaGuide = 'Output a sequence of high-density diffusion comma-separated tags (e.g. masterpiece, highly detailed, dramatic lighting, sharp focus).';
  }

  const systemInstruction = `You are an elite AI Image Prompt Engineer.
Transform the user's idea into an exquisite, highly descriptive text-to-image prompt.
Rules:
1. Output ONLY the final enhanced prompt. Do NOT include greetings, intro, quotation marks, or explanations.
2. ${personaGuide}
3. If a style hint is provided (${styleHint || 'general'}), weave that aesthetic seamlessly into the composition.
4. Keep the enhanced prompt under 90 words for maximum diffusion model coherence.`;

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${cleanModel}:generateContent?key=${apiKey.trim()}`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nUser Idea: "${userPrompt}"` }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 220,
      },
    }),
  });

  if (!response.ok) {
    let errMessage = `Gemini API returned ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.error?.message) {
        errMessage = errJson.error.message;
      }
    } catch {
      const text = await response.text().catch(() => '');
      if (text) errMessage = text.slice(0, 300);
    }
    throw new Error(`Google Gemini (${cleanModel}) error: ${errMessage}`);
  }

  const data = await response.json();
  const enhancedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

  if (enhancedText) {
    return enhancedText.replace(/^"|"$/g, '').trim();
  }

  throw new Error(`No text generated by Google Gemini model "${cleanModel}".`);
}
