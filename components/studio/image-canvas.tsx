/* eslint-disable @next/next/no-img-element */
'use strict';
'use client';

import React, { useState, useEffect } from 'react';
import {
  Download,
  Copy,
  Check,
  Maximize,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  AlertTriangle,
  RefreshCw,
  Share2,
  X,
  Loader2,
  ImageIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GenerationResponse, ProviderType } from '@/types/studio';

interface ImageCanvasProps {
  isGenerating: boolean;
  activeProvider: ProviderType;
  activeModelName: string;
  generationResult: GenerationResponse | null;
  error: string | null;
  onRetry: () => void;
  onOpenSettings: () => void;
  onSelectPrompt: (prompt: string) => void;
  onUpdateGenerationResult?: (result: GenerationResponse) => void;
}

const INSPIRATION_PROMPTS = [
  {
    title: 'Minimalist Architecture',
    prompt: 'Clean modernist concrete villa cantilevered over a calm misty lake, dusk ambient glow, raw brutalist textures, architectural photography, Hasselblad X2D',
    category: 'Architecture',
  },
  {
    title: 'Macro Cybernetic',
    prompt: 'Extreme macro close-up of a holographic microchip wafer, intricate iridescent gold circuitry, depth of field, neon micro-reflections, studio light',
    category: 'Technology',
  },
  {
    title: 'Editorial Portrait',
    prompt: 'Studio portrait of an artisan ceramicist in an airy workshop, natural window lighting, subtle chiaroscuro contrast, shallow depth of field, 85mm lens',
    category: 'Portrait',
  },
  {
    title: 'Natural Landscape',
    prompt: 'High-altitude alpine valley with morning mist settling over evergreen forest, golden hour rim lighting on distant snowcapped peaks, atmospheric realism',
    category: 'Landscape',
  },
];

export function ImageCanvas({
  isGenerating,
  activeProvider,
  activeModelName,
  generationResult,
  error,
  onRetry,
  onOpenSettings,
  onSelectPrompt,
}: ImageCanvasProps) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedImage, setCopiedImage] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [naturalDims, setNaturalDims] = useState<{ width: number; height: number } | null>(null);

  // Reset natural dimensions on new image
  useEffect(() => {
    setNaturalDims(null);
  }, [generationResult?.imageUrl]);

  // Stopwatch for elapsed generation time
  useEffect(() => {
    if (!isGenerating) return;
    const startTime = Date.now();
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
    }, 500);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // Handle image download
  const handleDownload = () => {
    if (!generationResult?.imageUrl) return;
    const a = document.createElement('a');
    a.href = generationResult.imageUrl;
    const safeModel = generationResult.model.replace(/[^a-zA-Z0-9]/g, '_');
    a.download = `aura-${safeModel}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Handle copy prompt
  const handleCopyPrompt = () => {
    const textToCopy = generationResult?.revisedPrompt || generationResult?.imageUrl;
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  // Handle copy image to clipboard
  const handleCopyImage = async () => {
    if (!generationResult?.imageUrl) return;
    try {
      const res = await fetch(generationResult.imageUrl);
      const blob = await res.blob();
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob,
        }),
      ]);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    } catch {
      navigator.clipboard.writeText(generationResult.imageUrl);
      setCopiedImage(true);
      setTimeout(() => setCopiedImage(false), 2000);
    }
  };

  // Calculate actual pixel dimensions and aspect ratio ratio label
  const displayedWidth = naturalDims?.width || generationResult?.dimensions.width || 1024;
  const displayedHeight = naturalDims?.height || generationResult?.dimensions.height || 1024;
  const ratioCalc = (displayedWidth / displayedHeight).toFixed(2);

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[520px] rounded-lg border border-border bg-card/85 backdrop-blur-md p-4 sm:p-6 shadow-sm overflow-hidden">
      {/* 1. LOADING STATE */}
      {isGenerating && (
        <div className="flex flex-col items-center justify-center space-y-4 py-20 text-center">
          <div className="flex size-12 items-center justify-center rounded-md border border-cyan-500/30 bg-cyan-950/40 shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <Loader2 className="size-6 text-cyan-300 animate-spin" />
          </div>

          <div className="space-y-1 max-w-sm">
            <h3 className="text-sm font-semibold text-foreground">
              Generating Image
            </h3>
            <p className="text-xs text-muted-foreground">
              Running <span className="text-cyan-300 font-medium">{activeModelName}</span> via{' '}
              <span className="capitalize text-foreground">{activeProvider}</span>
            </p>
          </div>

          <div className="font-mono text-xs text-muted-foreground border border-border bg-background px-3 py-1 rounded">
            Elapsed: {elapsedSeconds}s
          </div>
        </div>
      )}

      {/* 2. ERROR STATE */}
      {!isGenerating && error && (
        <div className="flex max-w-md flex-col items-center justify-center rounded-md border border-red-500/30 bg-background p-6 text-center">
          <div className="flex size-10 items-center justify-center rounded-full bg-red-950/60 border border-red-800/80 text-red-400">
            <AlertTriangle className="size-5" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-foreground">Generation Error</h3>
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">{error}</p>

          <div className="mt-4 flex items-center gap-2">
            {error.toLowerCase().includes('key') || error.toLowerCase().includes('token') ? (
              <Button
                onClick={onOpenSettings}
                size="sm"
                className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium shadow-[0_4px_16px_rgba(6,182,212,0.2)]"
              >
                Open Settings
              </Button>
            ) : (
              <Button
                onClick={onRetry}
                size="sm"
                variant="outline"
                className="border-border bg-card text-foreground hover:bg-muted hover:border-cyan-500/30"
              >
                <RefreshCw className="size-3.5 mr-1.5" />
                Retry
              </Button>
            )}
          </div>
        </div>
      )}

      {/* 3. SUCCESS DISPLAY CANVAS */}
      {!isGenerating && !error && generationResult?.imageUrl && (
        <div className="flex flex-col items-center w-full space-y-4">
          {/* Main Visual Image Card */}
          <div className="relative group w-full flex items-center justify-center rounded-md bg-background border border-border p-2 overflow-hidden">
            <div
              className="relative max-w-full flex items-center justify-center overflow-hidden rounded"
              style={{
                aspectRatio: `${displayedWidth} / ${displayedHeight}`,
                maxHeight: '650px',
              }}
            >
              <img
                src={generationResult.imageUrl}
                alt="AI Generated Output"
                onLoad={(e) => {
                  const target = e.currentTarget;
                  if (target.naturalWidth && target.naturalHeight) {
                    setNaturalDims({
                      width: target.naturalWidth,
                      height: target.naturalHeight,
                    });
                  }
                }}
                className="w-full h-full object-contain rounded select-none"
              />

              {/* Quick action buttons floating on image hover */}
              <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <Button
                  size="icon-xs"
                  variant="secondary"
                  onClick={() => setIsLightboxOpen(true)}
                  title="Full screen view"
                  className="bg-card/90 border border-border text-foreground hover:bg-muted hover:text-cyan-300 backdrop-blur-sm"
                >
                  <Maximize className="size-3" />
                </Button>
                <Button
                  size="icon-xs"
                  variant="secondary"
                  onClick={handleDownload}
                  title="Download Image"
                  className="bg-card/90 border border-border text-foreground hover:bg-muted hover:text-cyan-300 backdrop-blur-sm"
                >
                  <Download className="size-3" />
                </Button>
              </div>
            </div>
          </div>

          {/* Metadata & Actions Bar */}
          <div className="flex w-full flex-wrap items-center justify-between gap-2 rounded-md border border-border bg-background p-2.5 text-xs">
            {/* Metadata Badges: Shows Verified Pixel Dimensions */}
            <div className="flex flex-wrap items-center gap-2 text-muted-foreground">
              <span className="rounded bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.5 text-[11px] font-mono text-cyan-200 font-medium">
                {generationResult.model}
              </span>
              <span className="rounded bg-card border border-border px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                {displayedWidth} × {displayedHeight} px ({ratioCalc}:1)
              </span>
              <span>•</span>
              <span className="font-mono text-[11px]">
                {(generationResult.durationMs / 1000).toFixed(1)}s
              </span>
              {generationResult.seed !== undefined && (
                <>
                  <span>•</span>
                  <span className="font-mono text-[11px] text-muted-foreground/70">
                    Seed: {generationResult.seed}
                  </span>
                </>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                size="xs"
                variant="outline"
                onClick={handleCopyPrompt}
                className="h-7 border-border bg-card text-xs text-muted-foreground hover:bg-muted hover:border-cyan-500/30 hover:text-foreground"
              >
                {copiedPrompt ? <Check className="size-3 mr-1 text-emerald-400" /> : <Copy className="size-3 mr-1" />}
                <span>{copiedPrompt ? 'Copied' : 'Prompt'}</span>
              </Button>

              <Button
                size="xs"
                variant="outline"
                onClick={handleCopyImage}
                className="h-7 border-border bg-card text-xs text-muted-foreground hover:bg-muted hover:border-cyan-500/30 hover:text-foreground"
              >
                {copiedImage ? <Check className="size-3 mr-1 text-emerald-400" /> : <Share2 className="size-3 mr-1" />}
                <span>{copiedImage ? 'Copied' : 'Copy'}</span>
              </Button>

              <Button
                size="xs"
                onClick={handleDownload}
                className="h-7 bg-cyan-500 hover:bg-cyan-400 text-xs font-semibold text-slate-950 shadow-[0_4px_16px_rgba(6,182,212,0.2)]"
              >
                <Download className="size-3 mr-1" />
                <span>Download</span>
              </Button>
            </div>
          </div>

          {/* DALL-E 3 revised prompt callout */}
          {generationResult.revisedPrompt && (
            <div className="w-full rounded-md border border-border bg-background p-3 text-left text-xs">
              <span className="font-semibold text-foreground">OpenAI Revised Prompt:</span>
              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                {generationResult.revisedPrompt}
              </p>
            </div>
          )}
        </div>
      )}

      {/* 4. EMPTY STATE */}
      {!isGenerating && !error && !generationResult?.imageUrl && (
        <div className="flex w-full max-w-lg flex-col items-center justify-center space-y-5 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-md border border-border bg-background text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.15)]">
            <ImageIcon className="size-6 stroke-[1.5]" />
          </div>

          <div className="space-y-1">
            <h2 className="text-sm font-semibold text-foreground">
              Generation Canvas
            </h2>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Select your provider and model on the left. Choose a native orientation to generate clean, undistorted visuals.
            </p>
          </div>

          {/* Clean Reference Templates */}
          <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2 text-left pt-2">
            {INSPIRATION_PROMPTS.map((item) => (
              <div
                key={item.title}
                onClick={() => onSelectPrompt(item.prompt)}
                className="cursor-pointer rounded-md border border-border bg-background p-2.5 transition-all hover:border-cyan-500/40 hover:bg-card/70"
              >
                <div className="flex items-center justify-between text-xs font-medium text-foreground">
                  <span>{item.title}</span>
                  <span className="font-mono text-[10px] text-cyan-400">
                    {item.category}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                  {item.prompt}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX */}
      {isLightboxOpen && generationResult?.imageUrl && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md p-4">
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            <Button
              size="icon-xs"
              variant="outline"
              onClick={() => setZoomLevel((z) => Math.min(3, z + 0.25))}
              className="border-border bg-card text-foreground hover:bg-muted hover:border-cyan-500/30"
            >
              <ZoomIn className="size-3.5" />
            </Button>
            <Button
              size="icon-xs"
              variant="outline"
              onClick={() => setZoomLevel((z) => Math.max(0.5, z - 0.25))}
              className="border-border bg-card text-foreground hover:bg-muted hover:border-cyan-500/30"
            >
              <ZoomOut className="size-3.5" />
            </Button>
            <Button
              size="icon-xs"
              variant="outline"
              onClick={() => setZoomLevel(1)}
              className="border-border bg-card text-foreground hover:bg-muted hover:border-cyan-500/30"
            >
              <RotateCcw className="size-3.5" />
            </Button>
            <Button
              size="icon-xs"
              variant="outline"
              onClick={handleDownload}
              className="border-border bg-card text-foreground hover:bg-muted hover:border-cyan-500/30"
            >
              <Download className="size-3.5" />
            </Button>
            <Button
              size="icon-xs"
              variant="outline"
              onClick={() => {
                setIsLightboxOpen(false);
                setZoomLevel(1);
              }}
              className="border-border bg-card text-foreground hover:bg-muted hover:border-cyan-500/30"
            >
              <X className="size-3.5" />
            </Button>
          </div>

          <div className="overflow-auto max-w-full max-h-full flex items-center justify-center p-4">
            <img
              src={generationResult.imageUrl}
              alt="Full size preview"
              style={{ transform: `scale(${zoomLevel})` }}
              className="max-h-[85vh] max-w-[85vw] object-contain rounded border border-border"
            />
          </div>
        </div>
      )}
    </div>
  );
}
