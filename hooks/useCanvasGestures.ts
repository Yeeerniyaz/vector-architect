// =============================================================================
// Vector Architect — Canvas Gestures Hook
// Handles 60fps Pan and Pinch gestures on the UI thread using Reanimated.
// =============================================================================

import { useSharedValue, withDecay, withSpring } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';

// Константы для ограничений камеры
const MAX_SCALE = 10; // Максимальное приближение (детально рассмотреть розетку)
const MIN_SCALE = 0.1; // Максимальное отдаление (увидеть весь ЖК)

export function useCanvasGestures() {
  // --- Состояние камеры (Shared Values для UI-потока) ---
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  // Кэш предыдущих состояний для бесшовного продолжения жеста
  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const savedScale = useSharedValue(1);

  // Центр фокуса при зуме (чтобы зум шел в точку между пальцами)
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  // =============================================================================
  // Pan Gesture (Панорамирование / Перемещение холста одним пальцем)
  // =============================================================================
  const panGesture = Gesture.Pan()
    .onStart(() => {
      // Запоминаем текущую позицию при касании
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      // Обновляем координаты с учетом масштаба (чтобы при зуме холст не летал слишком быстро)
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    })
    .onEnd((event) => {
      // Добавляем инерцию (Decay) для премиального ощущения от свайпа
      translateX.value = withDecay({
        velocity: event.velocityX,
        velocityFactor: 0.6,
      });
      translateY.value = withDecay({
        velocity: event.velocityY,
        velocityFactor: 0.6,
      });
    });

  // =============================================================================
  // Pinch Gesture (Масштабирование / Зум двумя пальцами)
  // =============================================================================
  const pinchGesture = Gesture.Pinch()
    .onStart((event) => {
      // Запоминаем текущий масштаб
      savedScale.value = scale.value;
      // Фиксируем точку между пальцами, чтобы зумить именно туда
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onUpdate((event) => {
      // Вычисляем новый масштаб с жесткими лимитами
      const newScale = Math.max(MIN_SCALE, Math.min(savedScale.value * event.scale, MAX_SCALE));
      
      // Корректируем смещение (Translate), чтобы точка фокуса оставалась под пальцами
      const focalOffsetX = focalX.value - (focalX.value - savedTranslateX.value) * (newScale / savedScale.value);
      const focalOffsetY = focalY.value - (focalY.value - savedTranslateY.value) * (newScale / savedScale.value);

      scale.value = newScale;
      translateX.value = focalOffsetX;
      translateY.value = focalOffsetY;
    })
    .onEnd(() => {
      // Если ушли за лимиты, плавно возвращаем обратно пружиной (Spring)
      if (scale.value < MIN_SCALE) {
        scale.value = withSpring(MIN_SCALE);
      } else if (scale.value > MAX_SCALE) {
        scale.value = withSpring(MAX_SCALE);
      }
      
      // Обновляем кэш позиций после зума
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // =============================================================================
  // Композиция жестов
  // =============================================================================
  // Simultaneous позволяет обрабатывать свайп и зум одновременно без конфликтов
  const gesture = Gesture.Simultaneous(panGesture, pinchGesture);

  return {
    translateX,
    translateY,
    scale,
    gesture,
  };
}