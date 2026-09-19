export interface OpenAIGenerateOptions {
  apiKey: string;
  prompt: string;
  model?: string;
  size?: string;
  width?: number;
  height?: number;
  quality?: 'standard' | 'hd' | 'low' | 'medium' | 'high' | 'xhigh' | 'max' | 'auto';
  style?: 'vivid' | 'natural';
}

export async function generateWithOpenAI(options: OpenAIGenerateOptions): Promise<{
  base64Data: string;
  contentType: string;
  revisedPrompt?: string;
  width: number;
  height: number;
}> {
  const {
    apiKey,
    prompt,
    model = 'gpt-image-2.5-sunburst',
    width = 1024,
    height = 1024,
    size,
    quality = 'high',
    style = 'vivid',
  } = options;

  if (!apiKey) {
    throw new Error('OpenAI API Key is required. Please set it in Settings.');
  }

  const endpoint = 'https://api.openai.com/v1/images/generations';

  const body: Record<string, unknown> = {
    model,
    prompt,
    n: 1,
    response_format: 'b64_json',
  };

  const isGpt25 = model.startsWith('gpt-image-2.5');

  if (isGpt25) {
    // GPT-Image-2.5 flexible sizes (multiples of 16, up to 3840 edge length)
    let finalW = Math.min(3840, Math.max(512, Math.round(width / 16) * 16));
    let finalH = Math.min(3840, Math.max(512, Math.round(height / 16) * 16));

    // Ensure total pixels is within 655,360 to 8,294,400 bounds
    const totalPixels = finalW * finalH;
    if (totalPixels > 8294400) {
      const scale = Math.sqrt(8294400 / totalPixels);
      finalW = Math.round((finalW * scale) / 16) * 16;
      finalH = Math.round((finalH * scale) / 16) * 16;
    }

    body.size = size || `${finalW}x${finalH}`;
    body.quality = ['low', 'medium', 'high', 'xhigh', 'max', 'auto'].includes(quality)
      ? quality
      : 'high';
  } else if (model === 'dall-e-3') {
    // DALL-E 3 supported sizes
    const validDalle3Sizes = ['1024x1024', '1024x1792', '1792x1024'];
    body.size = validDalle3Sizes.includes(size || '') ? size : '1024x1024';
    body.quality = quality === 'hd' ? 'hd' : 'standard';
    body.style = style;
  } else {
    // DALL-E 2 supported sizes: 256x256, 512x512, 1024x1024
    const validDalle2Sizes = ['256x256', '512x512', '1024x1024'];
    body.size = validDalle2Sizes.includes(size || '') ? size : '1024x1024';
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errMessage = `OpenAI API error (${response.status} ${response.statusText})`;
    try {
      const errJson = await response.json();
      if (errJson.error && errJson.error.message) {
        errMessage = errJson.error.message;
      }
    } catch {
      const text = await response.text().catch(() => '');
      if (text) errMessage += `: ${text.slice(0, 300)}`;
    }

    if (response.status === 401) {
      throw new Error('Invalid OpenAI API Key. Please verify your key in Settings.');
    }

    throw new Error(errMessage);
  }

  const data = await response.json();
  const item = data.data?.[0];

  if (!item || !item.b64_json) {
    throw new Error('No image was returned by OpenAI.');
  }

  const base64Data = `data:image/png;base64,${item.b64_json}`;
  const [actualW, actualH] = String(body.size || '').split('x').map(Number);

  return {
    base64Data,
    contentType: 'image/png',
    revisedPrompt: item.revised_prompt,
    width: actualW || width,
    height: actualH || height,
  };
}

export async function enhancePromptWithOpenAI(
  apiKey: string,
  userPrompt: string,
  styleHint?: string
): Promise<string> {
  if (!apiKey) {
    throw new Error('OpenAI API Key is required for prompt enhancement.');
  }

  const endpoint = 'https://api.openai.com/v1/chat/completions';

  const systemMessage = `You are an expert visual director and prompt engineer for state-of-the-art AI image generators (FLUX, Imagen 3, DALL-E 3).
Enhance the user's idea into a single, breathtaking, descriptive prompt.
Guidelines:
- Return ONLY the enhanced prompt. No commentary, no intro, no surrounding quotes.
- Specify visual details: subject nuances, composition, lighting (cinematic, volumetric, soft golden hour), mood, camera specs (35mm lens, f/1.8 aperture, sharp focus), textures, and color grading.
- Incorporate the style hint (${styleHint || 'natural realism'}) gracefully.
- Keep the prompt concise and punchy (under 90 words).`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 200,
    }),
  });

  if (!response.ok) {
    const errJson = await response.json().catch(() => ({}));
    throw new Error(errJson.error?.message || `OpenAI returned status ${response.status}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim();

  if (!text) {
    throw new Error('Failed to retrieve enhanced prompt from OpenAI.');
  }

  return text.replace(/^"|"$/g, '').trim();
}
