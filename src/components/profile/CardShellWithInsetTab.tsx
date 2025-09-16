import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type InsetTabPosition = 'left' | 'center' | 'right';

export interface InsetTabPathOptions {
  width: number;
  height: number;
  tabWidth: number;
  tabDepth: number;
  tabRoundness: number;
  tabPosition: InsetTabPosition;
  cornerRadius?: number;
}

export interface InsetTabPathResult {
  path: string;
  tabStartX: number;
  tabEndX: number;
  apexX: number;
  width: number;
  height: number;
  cornerRadius: number;
}

export interface CardShellWithInsetTabProps extends React.HTMLAttributes<HTMLDivElement> {
  tabPosition?: InsetTabPosition;
  tabWidth?: number;
  tabDepth?: number;
  tabRoundness?: number;
  tabSlot?: React.ReactNode;
  children: React.ReactNode;
  innerClassName?: string;
  backgroundClassName?: string;
}

const DEFAULT_SIZE = { width: 360, height: 320 };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export interface InsetTabPreset {
  tabPosition: InsetTabPosition;
  tabWidth: number;
  tabDepth: number;
  tabRoundness: number;
}

export const insetTabPresets: Record<InsetTabPosition, InsetTabPreset> = {
  left: {
    tabPosition: 'left',
    tabWidth: 180,
    tabDepth: 44,
    tabRoundness: 0.7,
  },
  center: {
    tabPosition: 'center',
    tabWidth: 220,
    tabDepth: 48,
    tabRoundness: 0.8,
  },
  right: {
    tabPosition: 'right',
    tabWidth: 180,
    tabDepth: 44,
    tabRoundness: 0.7,
  },
};

export function generateInsetTabPath(options: InsetTabPathOptions): InsetTabPathResult {
  const {
    width,
    height,
    tabWidth,
    tabDepth,
    tabRoundness,
    tabPosition,
    cornerRadius = 24,
  } = options;

  const w = Math.max(width, DEFAULT_SIZE.width);
  const h = Math.max(height, DEFAULT_SIZE.height);
  const r = clamp(cornerRadius, 12, Math.min(w, h) / 4);
  const margin = r + 12;

  const usableWidth = Math.max(w - margin * 2, 80);
  const clampedTabWidth = clamp(tabWidth, 80, usableWidth);

  let tabStart: number;
  switch (tabPosition) {
    case 'left':
      tabStart = margin;
      break;
    case 'right':
      tabStart = w - margin - clampedTabWidth;
      break;
    default:
      tabStart = (w - clampedTabWidth) / 2;
      break;
  }
  tabStart = clamp(tabStart, margin, w - margin - clampedTabWidth);
  const tabEnd = tabStart + clampedTabWidth;

  const maxDepth = h - r - 16;
  const depth = clamp(tabDepth, 20, maxDepth);
  const roundness = clamp(tabRoundness, 0, 1);

  const apexX = tabStart + clampedTabWidth / 2;
  const apexY = h - depth;
  // Enhanced curve parameters for better button wrapping
  const curveWidth = Math.max(clampedTabWidth / 2 - 8, clampedTabWidth * (0.35 + roundness * 0.2));
  const controlOffset = Math.min(curveWidth, clampedTabWidth / 2 - 4);
  const depthEase = depth * (0.4 + roundness * 0.35);

  // Enhanced curve control points for natural button wrapping
  const leftControlX = tabStart + controlOffset * 0.8;
  const rightControlX = tabEnd - controlOffset * 0.8;
  const leftControlY = h - depth * 0.15;
  const rightControlY = h - depth * 0.15;
  
  const commands = [
    `M ${r},0`,
    `H ${w - r}`,
    `C ${w - r * 0.4},0 ${w},${r * 0.4} ${w},${r}`,
    `V ${h - r}`,
    `C ${w},${h - r * 0.4} ${w - r * 0.4},${h} ${w - r},${h}`,
    `H ${tabEnd}`,
    `C ${rightControlX},${rightControlY} ${apexX + controlOffset * 0.25},${apexY + depthEase * 0.7} ${apexX},${apexY}`,
    `C ${apexX - controlOffset * 0.25},${apexY + depthEase * 0.7} ${leftControlX},${leftControlY} ${tabStart},${h}`,
    `H ${r}`,
    `C ${r * 0.4},${h} 0,${h - r * 0.4} 0,${h - r}`,
    `V ${r}`,
    `C 0,${r * 0.4} ${r * 0.4},0 ${r},0`,
    'Z',
  ];

  return {
    path: commands.join(' '),
    tabStartX: tabStart,
    tabEndX: tabEnd,
    apexX,
    width: w,
    height: h,
    cornerRadius: r,
  };
}

function formatPathForClip(path: string) {
  return `path('${path}')`;
}

export const CardShellWithInsetTab = React.forwardRef<HTMLDivElement, CardShellWithInsetTabProps>(
  (
    {
      tabPosition = insetTabPresets.left.tabPosition,
      tabWidth = insetTabPresets.left.tabWidth,
      tabDepth = insetTabPresets.left.tabDepth,
      tabRoundness = insetTabPresets.left.tabRoundness,
      tabSlot,
      children,
      className,
      innerClassName,
      backgroundClassName,
      style,
      ...rest
    },
    ref,
  ) => {
    const localRef = useRef<HTMLDivElement | null>(null);
    const [size, setSize] = useState(DEFAULT_SIZE);

    const setRefs = useCallback(
      (node: HTMLDivElement | null) => {
        localRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      },
      [ref],
    );

    useLayoutEffect(() => {
      const element = localRef.current;
      if (!element || typeof ResizeObserver === 'undefined') {
        return;
      }

      const updateSize = () => {
        const rect = element.getBoundingClientRect();
        if (!rect.width || !rect.height) return;
        setSize((prev) => {
          if (Math.abs(prev.width - rect.width) < 0.5 && Math.abs(prev.height - rect.height) < 0.5) {
            return prev;
          }
          return { width: rect.width, height: rect.height };
        });
      };

      updateSize();

      const observer = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          if (!width || !height) continue;
          setSize((prev) => {
            if (Math.abs(prev.width - width) < 0.5 && Math.abs(prev.height - height) < 0.5) {
              return prev;
            }
            return { width, height };
          });
        }
      });

      observer.observe(element);

      return () => observer.disconnect();
    }, []);

    const metrics = useMemo(
      () =>
        generateInsetTabPath({
          width: size.width,
          height: size.height,
          tabWidth,
          tabDepth,
          tabRoundness,
          tabPosition,
        }),
      [size.width, size.height, tabWidth, tabDepth, tabRoundness, tabPosition],
    );

    const clipPath = formatPathForClip(metrics.path);
    const tabSpan = metrics.tabEndX - metrics.tabStartX;
    const slotLeft =
      tabPosition === 'left'
        ? metrics.tabStartX + 16
        : tabPosition === 'right'
        ? metrics.tabEndX - 16
        : metrics.apexX;
    const slotTransform =
      tabPosition === 'left'
        ? 'translateX(0)'
        : tabPosition === 'right'
        ? 'translateX(-100%)'
        : 'translateX(-50%)';
    const slotBottom = Math.max(10, tabDepth - 18);
    const slotWidth = Math.max(140, tabSpan * 0.6);

    return (
      <div
        ref={setRefs}
        className={cn('relative', className)}
        style={{
          ...style,
          '--inset-tab-path': clipPath,
          '--tab-start': `${metrics.tabStartX}px`,
          '--tab-end': `${metrics.tabEndX}px`,
          '--tab-apex': `${metrics.apexX}px`,
          '--tab-depth': `${tabDepth}px`,
        } as React.CSSProperties}
        {...rest}
      >
        <div
          className={cn('relative overflow-hidden', innerClassName)}
          style={{
            clipPath,
            WebkitClipPath: clipPath,
          }}
        >
          <div
            className={cn(
              'absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-zinc-900',
              backgroundClassName,
            )}
          />
          <svg
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox={`0 0 ${metrics.width} ${metrics.height}`}
            preserveAspectRatio="none"
          >
            <path
              d={metrics.path}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={1.25}
            />
          </svg>
          <div className="relative flex h-full w-full flex-col">{children}</div>
        </div>
        {tabSlot ? (
          <div
            className="pointer-events-none absolute"
            style={{
              left: slotLeft,
              bottom: slotBottom,
              transform: `${slotTransform}`,
            }}
          >
            <div className="pointer-events-auto relative inline-flex justify-center">
              <div
                aria-hidden="true"
                className="absolute left-1/2 top-full h-10 w-full -translate-x-1/2 -translate-y-3 opacity-70"
                style={{
                  minWidth: slotWidth,
                  background:
                    'radial-gradient(circle at center, rgba(99, 102, 241, 0.28), rgba(79, 70, 229, 0.12) 55%, transparent 75%)',
                }}
              />
              {tabSlot}
            </div>
          </div>
        ) : null}
      </div>
    );
  },
);

CardShellWithInsetTab.displayName = 'CardShellWithInsetTab';

