// =============================================================================
// Vector Architect — Main Editor Canvas (Skia + Reanimated)
// Assembles Grid, WallRenderer, ObjectRenderer with gesture-driven camera.
// Now with UI Zoom Controls!
// =============================================================================

import React, { useState } from 'react';
import { useWindowDimensions, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Canvas, Group, Path, Skia } from '@shopify/react-native-skia';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useDerivedValue, useAnimatedReaction, runOnJS } from 'react-native-reanimated';
import { useCanvasGestures } from '../../hooks/useCanvasGestures';
import { useEditorStore } from '../../store/editorStore';
import Grid from './Grid';
import WallRenderer from './WallRenderer';
import ObjectRenderer from './ObjectRenderer';
import { COLORS } from '../../types/blueprint';

interface CameraSnapshot {
  translateX: number;
  translateY: number;
  scale: number;
}

interface DraftInfo {
  isActive: boolean;
  length: number;
  screenX: number;
  screenY: number;
}

function EditorCanvasInner({ width, height }: { width: number; height: number }) {
  const activeLayer = useEditorStore((s) => s.activeLayer);
  
  // ДОСТАЕМ ФУНКЦИИ ЗУМА ОТСЮДА
  const { translateX, translateY, scale, gesture, drafting, zoomIn, zoomOut } = useCanvasGestures();

  const [camera, setCamera] = useState<CameraSnapshot>({
    translateX: 0,
    translateY: 0,
    scale: 1,
  });

  const [draftInfo, setDraftInfo] = useState<DraftInfo>({
    isActive: false,
    length: 0,
    screenX: 0,
    screenY: 0,
  });

  useAnimatedReaction(
    () => ({ tx: translateX.value, ty: translateY.value, s: scale.value }),
    (current) => runOnJS(setCamera)({ translateX: current.tx, translateY: current.ty, scale: current.s }),
    []
  );

  useAnimatedReaction(
    () => {
      if (!drafting || !drafting.isActive.value) return null;
      const sx = drafting.startX.value;
      const sy = drafting.startY.value;
      const ex = drafting.endX.value;
      const ey = drafting.endY.value;

      const length = Math.round(Math.sqrt(Math.pow(ex - sx, 2) + Math.pow(ey - sy, 2)));
      const midX = (sx + ex) / 2;
      const midY = (sy + ey) / 2;
      const screenX = midX * scale.value + translateX.value;
      const screenY = midY * scale.value + translateY.value;

      return { length, screenX, screenY };
    },
    (res) => {
      if (res) {
        runOnJS(setDraftInfo)({ isActive: true, length: res.length, screenX: res.screenX, screenY: res.screenY });
      } else {
        runOnJS(setDraftInfo)({ isActive: false, length: 0, screenX: 0, screenY: 0 });
      }
    },
    []
  );

  const draftPath = useDerivedValue(() => {
    const path = Skia.Path.Make();
    if (drafting && drafting.isActive.value) {
      path.moveTo(drafting.startX.value, drafting.startY.value);
      path.lineTo(drafting.endX.value, drafting.endY.value);
    }
    return path;
  });

  const transform = useDerivedValue(() => [
    { translateX: translateX.value },
    { translateY: translateY.value },
    { scale: scale.value },
  ]);

  return (
    <View style={styles.container}>
      <GestureDetector gesture={gesture}>
        <View style={styles.container}>
          <Canvas style={styles.canvas}>
            <Group transform={transform}>
              <Grid
                canvasWidth={width}
                canvasHeight={height}
                translateX={camera.translateX}
                translateY={camera.translateY}
                scale={camera.scale}
              />
              <WallRenderer activeLayer={activeLayer} scale={camera.scale} />
              <ObjectRenderer activeLayer={activeLayer} scale={camera.scale} />
              
              <Path 
                path={draftPath} 
                color={COLORS.WATER_COLD} 
                style="stroke" 
                strokeWidth={6 / camera.scale} 
                strokeCap="round"
              />
            </Group>
          </Canvas>

          {draftInfo.isActive && draftInfo.length > 0 && (
            <View 
              style={[styles.tooltip, { left: draftInfo.screenX - 35, top: draftInfo.screenY - 40 }]}
              pointerEvents="none" 
            >
              <Text style={styles.tooltipText}>{draftInfo.length} мм</Text>
            </View>
          )}
        </View>
      </GestureDetector>

      {/* --- КНОПКИ МАСШТАБА (Поверх холста, справа) --- */}
      <View style={styles.zoomControls} pointerEvents="box-none">
        <TouchableOpacity style={styles.zoomBtn} onPress={zoomIn}>
          <Text style={styles.zoomBtnText}>+</Text>
        </TouchableOpacity>
        <View style={styles.zoomDivider} />
        <TouchableOpacity style={styles.zoomBtn} onPress={zoomOut}>
          <Text style={styles.zoomBtnText}>-</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function EditorCanvas() {
  const { width, height } = useWindowDimensions();
  return <EditorCanvasInner width={width} height={height} />;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  canvas: { flex: 1, backgroundColor: '#FFFFFF' },
  tooltip: {
    position: 'absolute',
    backgroundColor: '#18181B',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 5,
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
  
  // Стили для панели зума
  zoomControls: {
    position: 'absolute',
    right: 24,
    bottom: 40,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E4E7',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 8,
    overflow: 'hidden',
  },
  zoomBtn: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  zoomDivider: {
    height: 1,
    backgroundColor: '#E4E4E7',
    marginHorizontal: 8,
  },
  zoomBtnText: {
    fontSize: 22,
    fontWeight: '400',
    color: '#18181B',
    lineHeight: 24,
  }
});