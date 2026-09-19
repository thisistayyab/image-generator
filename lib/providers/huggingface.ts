import { InferenceClient } from '@huggingface/inference';

export interface HuggingFaceGenerateOptions {
  model: string;
  token: string;
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  guidanceScale?: number;
  numInferenceSteps?: number;
  seed?: number;
}

export async function generateWithHuggingFace(options: HuggingFaceGenerateOptions): Promise<{
  base64Data: string;
  contentType: string;
  providerUsed?: string;
  width: number;
  height: number;
}> {
  const {
    model,
    token,
    prompt,
    negativePrompt,
    width,
    height,
    guidanceScale,
    numInferenceSteps,
    seed,
  } = options;

  if (!token || !token.trim()) {
    throw new Error('Hugging Face API token is required. Please set it in Settings.');
  }

  const cleanModel = model.trim();
  const cleanToken = token.trim();

  console.log(`[Hugging Face] Initiating image generation for model: "${cleanModel}"`);

  // 1. Query Hugging Face Hub for available Inference Providers
  let liveProviders: string[] = [];
  try {
    const mappingRes = await fetch(
      `https://huggingface.co/api/models/${cleanModel}?expand[]=inferenceProviderMapping`,
      {
        headers: cleanToken.startsWith('hf_') ? { Authorization: `Bearer ${cleanToken}` } : {},
      }
    );

    if (mappingRes.ok) {
      const mappingData = await mappingRes.json();
      if (mappingData?.inferenceProviderMapping) {
        liveProviders = Object.entries(mappingData.inferenceProviderMapping)
          .filter(([, info]: [string, any]) => info?.status === 'live')
          .map(([p]) => p);
        console.log(`[Hugging Face] Live providers available for "${cleanModel}":`, liveProviders);
      }
    } else {
      console.warn(`[Hugging Face] Model info returned HTTP status ${mappingRes.status}`);
    }
  } catch (mapErr) {
    console.warn('[Hugging Face] Warning: Could not query inference provider mapping:', mapErr);
  }

  // 2. Prepare inference parameters
  const parameters: Record<string, any> = {};
  if (guidanceScale !== undefined) parameters.guidance_scale = guidanceScale;
  if (numInferenceSteps !== undefined) parameters.num_inference_steps = numInferenceSteps;
  if (negativePrompt && negativePrompt.trim()) parameters.negative_prompt = negativePrompt.trim();
  if (width) parameters.width = Math.min(2048, Math.max(256, Math.round(width / 8) * 8));
  if (height) parameters.height = Math.min(2048, Math.max(256, Math.round(height / 8) * 8));
  if (seed !== undefined && seed >= 0) parameters.seed = seed;

  const client = new InferenceClient(cleanToken);

  // If live providers were discovered, try 'auto' first, then each live provider sequentially as fallback
  const providersToTry: (string | undefined)[] =
    liveProviders.length > 0 ? [undefined, ...liveProviders] : [undefined];

  const errorsEncountered: string[] = [];

  for (const providerOption of providersToTry) {
    const providerLabel = providerOption || 'auto';
    console.log(
      `[Hugging Face] Attempting generation with provider "${providerLabel}" on model "${cleanModel}"...`
    );

    try {
      const output = (await client.textToImage({
        model: cleanModel,
        inputs: prompt,
        provider: providerOption as any,
        parameters: Object.keys(parameters).length > 0 ? parameters : undefined,
      })) as unknown;

      let base64Data = '';
      let contentType = 'image/jpeg';

      if (output instanceof Blob) {
        if (output.size === 0) {
          throw new Error('Received empty image response from Hugging Face.');
        }
        const arrayBuffer = await output.arrayBuffer();
        contentType = output.type || 'image/jpeg';
        base64Data = `data:${contentType};base64,${Buffer.from(arrayBuffer).toString('base64')}`;
      } else if (typeof output === 'string') {
        if (output.startsWith('data:')) {
          base64Data = output;
        } else if (output.startsWith('http')) {
          const imgRes = await fetch(output);
          const arrayBuffer = await imgRes.arrayBuffer();
          contentType = imgRes.headers.get('content-type') || 'image/jpeg';
          base64Data = `data:${contentType};base64,${Buffer.from(arrayBuffer).toString('base64')}`;
        } else {
          base64Data = `data:image/jpeg;base64,${output}`;
        }
      } else {
        throw new Error('Unexpected response format returned by Hugging Face Inference Provider.');
      }

      console.log(
        `[Hugging Face] Generation successful via provider "${providerLabel}"`
      );

      return {
        base64Data,
        contentType,
        providerUsed: providerLabel,
        width: width || 1024,
        height: height || 1024,
      };
    } catch (err: any) {
      const errMsg = err?.message || String(err);
      console.error(`[Hugging Face] Provider "${providerLabel}" failed:`, errMsg);
      errorsEncountered.push(`[${providerLabel}]: ${errMsg}`);

      // If it is a bad credential error, fail fast
      if (
        errMsg.toLowerCase().includes('invalid username or password') ||
        errMsg.toLowerCase().includes('unauthorized') ||
        errMsg.includes('401')
      ) {
        throw new Error(
          'Invalid Hugging Face Access Token. Please verify your token at https://huggingface.co/settings/tokens and ensure the "Make calls to Inference Providers" permission is enabled.'
        );
      }
    }
  }

  // If all providers failed, provide a diagnostic error message
  console.error(
    `[Hugging Face] All provider attempts failed for model "${cleanModel}". Logged errors:`,
    errorsEncountered
  );

  if (liveProviders.length === 0) {
    throw new Error(
      `The model "${cleanModel}" has no active serverless Inference Providers on Hugging Face. Hugging Face routes serverless inference through dedicated providers (Fal.ai, Replicate, Nscale, Wavespeed) for models like FLUX.1-schnell, FLUX.1-dev, SD 3.5 Large, and SDXL. Please select a supported model or deploy a dedicated Hugging Face Inference Endpoint.`
    );
  }

  throw new Error(
    `Hugging Face inference error on "${cleanModel}": ${errorsEncountered.join(' | ')}. Ensure your token has "Make calls to Inference Providers" permission enabled at https://huggingface.co/settings/tokens.`
  );
}

export async function enhancePromptWithHuggingFace(
  token: string,
  userPrompt: string,
  styleHint?: string,
  modelName: string = 'meta-llama/Llama-3.3-70B-Instruct',
  persona: string = 'cinematic'
): Promise<string> {
  if (!token || !token.trim()) {
    throw new Error('Hugging Face Access Token is required for prompt enhancement.');
  }

  const cleanToken = token.trim();
  const cleanModel = modelName.trim() || 'meta-llama/Llama-3.3-70B-Instruct';

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

  const systemMessage = `You are an elite visual director and prompt engineer for state-of-the-art AI image generators (FLUX, Imagen 3, DALL-E 3).
Transform the user's idea into an exquisite, highly descriptive text-to-image prompt.
Rules:
- Return ONLY the enhanced prompt. No commentary, no intro, no surrounding quotes.
- ${personaGuide}
- Incorporate the style hint (${styleHint || 'natural realism'}) gracefully.
- Keep the prompt concise and punchy (under 90 words).`;

  try {
    const client = new InferenceClient(cleanToken);
    const response = await client.chatCompletion({
      model: cleanModel,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userPrompt },
      ],
      max_tokens: 220,
      temperature: 0.7,
    });

    const text = response.choices?.[0]?.message?.content?.trim();
    if (text) {
      return text.replace(/^"|"$/g, '').trim();
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Hugging Face text model (${cleanModel}) error: ${msg}`);
  }

  throw new Error(`No text returned by Hugging Face model "${cleanModel}".`);
}
