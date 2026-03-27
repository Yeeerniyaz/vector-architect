// =============================================================================
// Vector Architect — Main Editor Canvas (Skia + Reanimated)
// Assembles Grid, WallRenderer, ObjectRenderer with gesture-driven camera.
// =============================================================================

import React, { useState } from 'react';
import { useWindowDimensions, LayoutChangeEvent } from 'react-native';
import { Canvas, Group } from '@shopify/react-native-skia';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useDerivedValue, useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import { useCanvasGestures } from '@/hooks/useCanvasGestures';
import { useEditorStore } from '@/store/editorStore';
import Grid from '@/components/canvas/Grid';
import WallRenderer from '@/components/canvas/WallRenderer';
import ObjectRenderer from '@/components/canvas/ObjectRenderer';
import { COLORS } from '@/types/blueprint';

interface CameraSnapshot {
  translateX: number;
  translateY: number;
  scale: number;
}

function EditorCanvasInner({ width, height }: { width: number; height: number }) {
  const activeLayer = useEditorStore((s) => s.activeLayer);
  const { translateX, translateY, scale, gesture } = useCanvasGestures();

  // Snapshot of camera state for child components (updated via animated reaction)
  const [camera, setCamera] = useState<CameraSnapshot>({
    translateX: 0,
    translateY: 0,
    scale: 1,
  });

  // Sync shared values → JS state for Grid viewport calculations
  useAnimatedReaction(
    () => ({
      tx: translateX.value,
      ty: translateY.value,
      s: scale.value,
    }),
    (current) => {
      runOnJS(setCamera)({
        translateX: current.tx,
        translateY: current.ty,
        scale: current.s,
      });
    },
    [],
  );

  // Build the camera transform for the Skia Group (driven by shared values)
  const transform = useDerivedValue(() => [
    { translateX: translateX.value },
    { translateY: translateY.value },
    { scale: scale.value },
  ]);

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={{ flex: 1 }}>
        <Canvas style={{ flex: 1, backgroundColor: COLORS.WHITE }}>
          <Group transform={transform}>
            <Grid
              canvasWidth={width}
              canvasHeight={height}
              translateX={camera.translateX}
              translateY={camera.translateY}
              scale={camera.scale}
            />
            <WallRenderer
              activeLayer={activeLayer}
              scale={camera.scale}
            />
            <ObjectRenderer
              activeLayer={activeLayer}
              scale={camera.scale}
            />
          </Group>
        </Canvas>
      </Animated.View>
    </GestureDetector>
  );
}

/**
 * Wrapper that measures layout and passes dimensions to the inner canvas.
 */
export default function EditorCanvas() {
  const { width, height } = useWindowDimensions();
  return <EditorCanvasInner width={width} height={height} />;
}
