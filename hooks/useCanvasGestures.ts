// =============================================================================
// Vector Architect — Canvas Gesture Hook
// Pan + Pinch-to-Zoom running entirely on the UI thread.
// =============================================================================

import { useMemo } from 'react';
import { Gesture } from 'react-native-gesture-handler';
import {
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';

const MIN_ZOOM = 0.1;
const MAX_ZOOM = 5.0;

export interface CanvasGestureValues {
  translateX: SharedValue<number>;
  translateY: SharedValue<number>;
  scale: SharedValue<number>;
  gesture: ReturnType<typeof Gesture.Simultaneous>;
}

export function useCanvasGestures(): CanvasGestureValues {
  // --- Shared values (UI thread) ---
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  // Saved state at gesture start
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const savedScale = useSharedValue(1);

  // Focal point for pinch
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  const gesture = useMemo(() => {
    // --- Pan Gesture ---
    const panGesture = Gesture.Pan()
      .minPointers(2)
      .onStart(() => {
        'worklet';
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      })
      .onUpdate((event) => {
        'worklet';
        translateX.value = savedTranslateX.value + event.translationX;
        translateY.value = savedTranslateY.value + event.translationY;
      });

    // --- Pinch Gesture ---
    const pinchGesture = Gesture.Pinch()
      .onStart((event) => {
        'worklet';
        savedScale.value = scale.value;
        focalX.value = event.focalX;
        focalY.value = event.focalY;
      })
      .onUpdate((event) => {
        'worklet';
        const newScale = Math.min(
          MAX_ZOOM,
          Math.max(MIN_ZOOM, savedScale.value * event.scale),
        );

        // Adjust translation to keep the focal point stationary
        const scaleDiff = newScale / scale.value;
        translateX.value =
          focalX.value - scaleDiff * (focalX.value - translateX.value);
        translateY.value =
          focalY.value - scaleDiff * (focalY.value - translateY.value);

        scale.value = newScale;
      });

    return Gesture.Simultaneous(panGesture, pinchGesture);
  }, []);

  return { translateX, translateY, scale, gesture };
}
