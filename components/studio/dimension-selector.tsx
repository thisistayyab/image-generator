'use strict';
'use client';

import React, { useEffect } from 'react';
import {
  Maximize2,
  Smartphone,
  Monitor,
  Square,
  RectangleHorizontal,
  RectangleVertical,
  Film,
  Camera,
  CheckCircle2,
} from 'lucide-react';
import { DimensionConfig, ProviderType, ModelDefinition } from '@/types/studio';
import { getSupportedAspectRatiosForModel } from '@/lib/constants/models';

interface DimensionSelectorProps {
  dimensions: DimensionConfig;
  provider: ProviderType;
  model?: ModelDefinition;
  onChangeDimensions: (dimensions: DimensionConfig) => void;
}

export function DimensionSelector({
  dimensions,
  provider,
  model,
  onChangeDimensions,
}: DimensionSelectorProps) {
  // 1. Get model-specific supported aspect ratios
  const supportedPresets = getSupportedAspectRatiosForModel(model?.id, provider);

  // 2. Automatically ensure selected ratio is supported whenever model/provider changes
  useEffect(() => {
    const isCurrentSupported = supportedPresets.some(
      (p) => p.ratio === dimensions.aspectRatio
    );
    if (!isCurrentSupported && supportedPresets.length > 0) {
      const fallback = supportedPresets[0];
      onChangeDimensions({
        width: fallback.width,
        height: fallback.height,
        aspectRatio: fallback.ratio,
        isCustom: false,
      });
    }
  }, [model?.id, provider, supportedPresets, dimensions.aspectRatio, onChangeDimensions]);

  const handleSelectPreset = (preset: (typeof supportedPresets)[0]) => {
    onChangeDimensions({
      width: preset.width,
      height: preset.height,
      aspectRatio: preset.ratio,
      isCustom: false,
    });
  };

  // Find active preset details
  const activePreset =
    supportedPresets.find((p) => p.ratio === dimensions.aspectRatio) ||
    supportedPresets[0] || {
      ratio: '1:1',
      label: '1:1',
      sublabel: 'Square',
      width: 1024,
      height: 1024,
    };

  const megapixels = ((activePreset.width * activePreset.height) / 1000000).toFixed(2);

  // Model-specific orientation badge info
  const getFormatBadge = () => {
    if (provider === 'gemini') {
      return {
        title: 'Google Native Formats',
        desc: '5 verified ratios synthesized without letterboxing or stretching',
      };
    }
    if (model?.id === 'dall-e-3') {
      return {
        title: 'DALL·E 3 Native Sizes',
        desc: 'Fixed 1024px and 1792px dimensions',
      };
    }
    if (model?.id?.startsWith('gpt-image-2.5')) {
      return {
        title: 'GPT-Image-2.5 Formats',
        desc: 'Full aspect-ratio support with high-resolution output',
      };
    }
    return {
      title: 'Diffusion Latent Buckets',
      desc: 'Trained resolution buckets for optimal subject framing',
    };
  };

  const formatInfo = getFormatBadge();

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      {/* Header: Label and verified resolution */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          <Maximize2 className="size-3.5 text-muted-foreground" />
          <span>Orientation & Framing</span>
        </label>
        <span className="font-mono text-[11px] text-foreground bg-background px-2 py-0.5 rounded border border-border">
          {activePreset.width} × {activePreset.height} px ({megapixels} MP)
        </span>
      </div>

      {/* Model-Verified Badge */}
      <div className="flex items-center justify-between rounded bg-background px-2.5 py-1.5 border border-border text-[11px]">
        <div className="flex items-center gap-1.5 text-foreground">
          <CheckCircle2 className="size-3 text-emerald-400 shrink-0" />
          <span className="font-medium text-foreground">{formatInfo.title}</span>
        </div>
        <span className="text-[10px] text-muted-foreground hidden sm:inline">
          {formatInfo.desc}
        </span>
      </div>

      {/* Native Orientation Grid: Only shows ratios supported by this model */}
      <div
        className={`grid gap-1.5 ${
          supportedPresets.length <= 3
            ? 'grid-cols-3'
            : supportedPresets.length <= 5
            ? 'grid-cols-3 sm:grid-cols-5'
            : 'grid-cols-4 sm:grid-cols-4'
        }`}
      >
        {supportedPresets.map((item) => {
          const isSelected = dimensions.aspectRatio === item.ratio;
          return (
            <button
              key={item.ratio}
              type="button"
              onClick={() => handleSelectPreset(item)}
              className={`flex flex-col items-center justify-center rounded-md border p-2.5 text-center transition-all ${
                isSelected
                  ? 'border-cyan-500/70 bg-cyan-950/30 text-foreground font-semibold shadow-[0_0_16px_rgba(6,182,212,0.15)]'
                  : 'border-border/80 bg-background/60 text-muted-foreground hover:border-cyan-500/30 hover:text-foreground'
              }`}
            >
              <div className={`flex size-6 items-center justify-center ${isSelected ? 'text-cyan-300' : 'text-muted-foreground'}`}>
                {item.ratio === '1:1' && <Square className="size-4" />}
                {item.ratio === '16:9' && <RectangleHorizontal className="size-4" />}
                {item.ratio === '9:16' && <RectangleVertical className="size-4" />}
                {item.ratio === '4:3' && <Monitor className="size-4" />}
                {item.ratio === '3:4' && <Smartphone className="size-4" />}
                {item.ratio === '3:2' && <Camera className="size-4" />}
                {item.ratio === '21:9' && <Film className="size-4" />}
              </div>

              <span className="mt-1 text-xs font-semibold">{item.label}</span>
              <span className="text-[10px] text-muted-foreground">{item.sublabel}</span>
              <span className="mt-1 font-mono text-[9px] text-muted-foreground/80">
                {item.width}×{item.height}
              </span>
            </button>
          );
        })}
      </div>

      {/* Live Aspect Ratio Visual Preview */}
      <div className="flex items-center justify-between rounded bg-background px-3 py-2 text-xs text-muted-foreground border border-border">
        <div className="flex items-center gap-2.5">
          <div
            className="rounded border border-cyan-500/60 bg-cyan-950/60 transition-all duration-200 flex items-center justify-center shadow-[0_0_8px_rgba(6,182,212,0.2)]"
            style={{
              width: `${Math.min(36, Math.max(12, (activePreset.width / Math.max(activePreset.width, activePreset.height)) * 36))}px`,
              height: `${Math.min(36, Math.max(12, (activePreset.height / Math.max(activePreset.width, activePreset.height)) * 36))}px`,
            }}
          />
          <span className="font-mono text-[11px] text-foreground">
            Selected: <strong className="text-foreground">{activePreset.label}</strong> ({activePreset.sublabel})
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground">
          Native model resolution
        </span>
      </div>
    </div>
  );
}
