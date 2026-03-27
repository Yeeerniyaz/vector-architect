// =============================================================================
// Vector Architect — Infinite Grid Renderer
// Highly optimized Skia Grid. Only draws lines visible in the current viewport.
// Uses single Path objects for rendering to maintain 60fps during gestures.
// =============================================================================

import React, { useMemo } from 'react';
import { Path, Skia } from '@shopify/react-native-skia';
import { DEFAULTS, COLORS } from '@/types/blueprint';

interface GridProps {
  canvasWidth: number;
  canvasHeight: number;
  translateX: number;
  translateY: number;
  scale: number;
}

export default function Grid({
  canvasWidth,
  canvasHeight,
  translateX,
  translateY,
  scale,
}: GridProps) {
  // Вычисляем видимую область чертежа (Viewport) с учетом зума и панорамирования
  const viewport = useMemo(() => {
    return {
      left: -translateX / scale,
      right: (canvasWidth - translateX) / scale,
      top: -translateY / scale,
      bottom: (canvasHeight - translateY) / scale,
    };
  }, [canvasWidth, canvasHeight, translateX, translateY, scale]);

  // Генерируем пути (Path) для сетки
  const { minorGridPath, majorGridPath } = useMemo(() => {
    const minorPath = Skia.Path.Make();
    const majorPath = Skia.Path.Make();

    const step = DEFAULTS.GRID_SIZE; // Обычный шаг (например, 100мм)
    const majorStep = step * 10;     // Крупный шаг (каждый 1 метр)

    // Если мы слишком сильно отдалили камеру, нет смысла рисовать мелкую сетку 
    // (она сольется в серое пятно и убьет FPS).
    const hideMinorGrid = scale < 0.3;

    // Вычисляем начальные точки отрисовки, округленные до сетки
    const startX = Math.floor(viewport.left / step) * step;
    const endX = Math.ceil(viewport.right / step) * step;
    const startY = Math.floor(viewport.top / step) * step;
    const endY = Math.ceil(viewport.bottom / step) * step;

    // Рисуем вертикальные линии
    for (let x = startX; x <= endX; x += step) {
      const isMajor = x % majorStep === 0;
      if (isMajor) {
        majorPath.moveTo(x, viewport.top);
        majorPath.lineTo(x, viewport.bottom);
      } else if (!hideMinorGrid) {
        minorPath.moveTo(x, viewport.top);
        minorPath.lineTo(x, viewport.bottom);
      }
    }

    // Рисуем горизонтальные линии
    for (let y = startY; y <= endY; y += step) {
      const isMajor = y % majorStep === 0;
      if (isMajor) {
        majorPath.moveTo(viewport.left, y);
        majorPath.lineTo(viewport.right, y);
      } else if (!hideMinorGrid) {
        minorPath.moveTo(viewport.left, y);
        minorPath.lineTo(viewport.right, y);
      }
    }

    return { minorGridPath: minorPath, majorGridPath: majorPath };
  }, [viewport, scale]);

  return (
    <>
      {/* Мелкая сетка (шаг 100мм). Более тонкая и светлая */}
      <Path
        path={minorGridPath}
        color={COLORS.GRID_LINE}
        style="stroke"
        strokeWidth={1 / scale} // Толщина всегда 1px на экране, независимо от зума!
        opacity={0.5}
      />
      
      {/* Крупная сетка (каждый 1 метр). Более жирная */}
      <Path
        path={majorGridPath}
        color={COLORS.GRID_LINE}
        style="stroke"
        strokeWidth={2 / scale}
        opacity={1}
      />
    </>
  );
}