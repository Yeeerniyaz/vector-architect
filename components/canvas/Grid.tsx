// =============================================================================
// Vector Architect — Infinite Grid Renderer (Skia)
// Draws minor (100mm) and major (1m) gridlines based on visible viewport.
// =============================================================================

import React from 'react';
import { Line, vec } from '@shopify/react-native-skia';
import { COLORS, GRID } from '@/types/blueprint';

interface GridProps {
  /** Canvas width in pixels */
  canvasWidth: number;
  /** Canvas height in pixels */
  canvasHeight: number;
  /** Current camera translation X */
  translateX: number;
  /** Current camera translation Y */
  translateY: number;
  /** Current zoom scale */
  scale: number;
}

const MINOR_COLOR = COLORS.GRID_MINOR;
const MAJOR_COLOR = COLORS.GRID_MAJOR;

function Grid({
  canvasWidth,
  canvasHeight,
  translateX,
  translateY,
  scale,
}: GridProps) {
  const lines: React.ReactElement[] = [];

  const minorSpacing = GRID.MINOR_SPACING * scale;
  const majorSpacing = GRID.MAJOR_SPACING * scale;

  // Determine grid density — skip minor lines when zoomed out too far
  const drawMinor = minorSpacing >= 4;

  // Visible bounds in world coordinates
  const worldLeft = -translateX / scale;
  const worldTop = -translateY / scale;
  const worldRight = worldLeft + canvasWidth / scale;
  const worldBottom = worldTop + canvasHeight / scale;

  // Major gridlines (always drawn)
  const majorStartX =
    Math.floor(worldLeft / GRID.MAJOR_SPACING) * GRID.MAJOR_SPACING;
  const majorEndX =
    Math.ceil(worldRight / GRID.MAJOR_SPACING) * GRID.MAJOR_SPACING;
  const majorStartY =
    Math.floor(worldTop / GRID.MAJOR_SPACING) * GRID.MAJOR_SPACING;
  const majorEndY =
    Math.ceil(worldBottom / GRID.MAJOR_SPACING) * GRID.MAJOR_SPACING;

  // Vertical major lines
  for (let x = majorStartX; x <= majorEndX; x += GRID.MAJOR_SPACING) {
    lines.push(
      <Line
        key={`mv_${x}`}
        p1={vec(x, worldTop)}
        p2={vec(x, worldBottom)}
        color={MAJOR_COLOR}
        strokeWidth={1 / scale}
      />,
    );
  }

  // Horizontal major lines
  for (let y = majorStartY; y <= majorEndY; y += GRID.MAJOR_SPACING) {
    lines.push(
      <Line
        key={`mh_${y}`}
        p1={vec(worldLeft, y)}
        p2={vec(worldRight, y)}
        color={MAJOR_COLOR}
        strokeWidth={1 / scale}
      />,
    );
  }

  // Minor gridlines (only when zoomed in enough)
  if (drawMinor) {
    const minorStartX =
      Math.floor(worldLeft / GRID.MINOR_SPACING) * GRID.MINOR_SPACING;
    const minorEndX =
      Math.ceil(worldRight / GRID.MINOR_SPACING) * GRID.MINOR_SPACING;
    const minorStartY =
      Math.floor(worldTop / GRID.MINOR_SPACING) * GRID.MINOR_SPACING;
    const minorEndY =
      Math.ceil(worldBottom / GRID.MINOR_SPACING) * GRID.MINOR_SPACING;

    // Vertical minor lines (skip those already drawn as major)
    for (let x = minorStartX; x <= minorEndX; x += GRID.MINOR_SPACING) {
      if (x % GRID.MAJOR_SPACING === 0) continue;
      lines.push(
        <Line
          key={`nv_${x}`}
          p1={vec(x, worldTop)}
          p2={vec(x, worldBottom)}
          color={MINOR_COLOR}
          strokeWidth={0.5 / scale}
        />,
      );
    }

    // Horizontal minor lines
    for (let y = minorStartY; y <= minorEndY; y += GRID.MINOR_SPACING) {
      if (y % GRID.MAJOR_SPACING === 0) continue;
      lines.push(
        <Line
          key={`nh_${y}`}
          p1={vec(worldLeft, y)}
          p2={vec(worldRight, y)}
          color={MINOR_COLOR}
          strokeWidth={0.5 / scale}
        />,
      );
    }
  }

  return <>{lines}</>;
}

export default React.memo(Grid);
