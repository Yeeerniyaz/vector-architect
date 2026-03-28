// =============================================================================
// Vector Architect — Canvas Gestures Hook
// Handles 60fps Pan and Pinch gestures on the UI thread using Reanimated.
// Translates Screen coordinates to Canvas coordinates for tapping & drawing.
// =============================================================================

import { useSharedValue, withDecay, withSpring, runOnJS } from 'react-native-reanimated';
import { Gesture } from 'react-native-gesture-handler';
import { Dimensions } from 'react-native';
import { useEditorStore, OBJECT_CATALOG } from '../store/editorStore';
import { DEFAULTS } from '../types/blueprint';

const MAX_SCALE = 10;
const MIN_SCALE = 0.1;

export function useCanvasGestures() {
  // --- Состояние камеры (UI-поток) ---
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);

  const savedTranslateX = useSharedValue(0);
  const savedTranslateY = useSharedValue(0);
  const savedScale = useSharedValue(1);
  const focalX = useSharedValue(0);
  const focalY = useSharedValue(0);

  // --- ДРАФТИНГ (Предпросмотр стен в реальном времени) ---
  const isDrafting = useSharedValue(false);
  const draftStartX = useSharedValue(0);
  const draftStartY = useSharedValue(0);
  const draftEndX = useSharedValue(0);
  const draftEndY = useSharedValue(0);

  // --- Подключение к "Мозгу" (JS-поток) ---
  const activeTool = useEditorStore((state) => state.activeTool);
  const activeObjectType = useEditorStore((state) => state.activeObjectType); // Читаем активный объект
  const addWallNode = useEditorStore((state) => state.addWallNode);
  const addWall = useEditorStore((state) => state.addWall);
  const addSmartObject = useEditorStore((state) => state.addSmartObject);

  // =============================================================================
  // ЛОГИКА ИНСТРУМЕНТОВ (Выполняется в JS)
  // =============================================================================
  
  // Сохранение готовой стены в стор после того, как отпустили палец
  const commitWall = (startX: number, startY: number, endX: number, endY: number) => {
    // Защита от случайных микро-свайпов (стена не может быть точкой)
    if (startX === endX && startY === endY) return;

    const n1 = addWallNode({ x: startX, y: startY });
    const n2 = addWallNode({ x: endX, y: endY });
    addWall(n1, n2);
  };

  // Одиночный тап (поставить мебель/технику/розетку)
  const handleTap = (screenX: number, screenY: number) => {
    if (activeTool !== 'ADD_OBJECT') return;

    let realX = (screenX - translateX.value) / scale.value;
    let realY = (screenY - translateY.value) / scale.value;
    
    // Магнитная сетка
    const gridSize = DEFAULTS.GRID_SIZE;
    realX = Math.round(realX / gridSize) * gridSize;
    realY = Math.round(realY / gridSize) * gridSize;

    // Достаем физические габариты выбранного предмета из каталога
    const itemConfig = OBJECT_CATALOG[activeObjectType];

    // Спавним объект с правильными размерами!
    addSmartObject(activeObjectType, { x: realX, y: realY }, itemConfig.width, itemConfig.height);
  };

  // =============================================================================
  // ЖЕСТЫ
  // =============================================================================
  
  // 1. Панорама или Черчение стены (Строго 1 палец)
  const panGesture = Gesture.Pan()
    .maxPointers(1) 
    .onStart((event) => {
      if (activeTool === 'DRAW_WALL') {
        isDrafting.value = true;
        let realX = (event.x - translateX.value) / scale.value;
        let realY = (event.y - translateY.value) / scale.value;
        
        realX = Math.round(realX / DEFAULTS.GRID_SIZE) * DEFAULTS.GRID_SIZE;
        realY = Math.round(realY / DEFAULTS.GRID_SIZE) * DEFAULTS.GRID_SIZE;

        draftStartX.value = realX;
        draftStartY.value = realY;
        draftEndX.value = realX;
        draftEndY.value = realY;
      } else {
        savedTranslateX.value = translateX.value;
        savedTranslateY.value = translateY.value;
      }
    })
    .onUpdate((event) => {
      if (activeTool === 'DRAW_WALL') {
        let realX = (event.x - translateX.value) / scale.value;
        let realY = (event.y - translateY.value) / scale.value;
        
        realX = Math.round(realX / DEFAULTS.GRID_SIZE) * DEFAULTS.GRID_SIZE;
        realY = Math.round(realY / DEFAULTS.GRID_SIZE) * DEFAULTS.GRID_SIZE;

        // --- ОРТОГОНАЛЬНЫЙ МАГНИТ (Ortho Snap) ---
        const dx = Math.abs(realX - draftStartX.value);
        const dy = Math.abs(realY - draftStartY.value);
        
        if (dx > dy * 1.2) {
          realY = draftStartY.value; 
        } else if (dy > dx * 1.2) {
          realX = draftStartX.value; 
        }

        draftEndX.value = realX;
        draftEndY.value = realY;
      } else {
        translateX.value = savedTranslateX.value + event.translationX;
        translateY.value = savedTranslateY.value + event.translationY;
      }
    })
    .onEnd((event) => {
      if (activeTool === 'DRAW_WALL' && isDrafting.value) {
        isDrafting.value = false;
        runOnJS(commitWall)(
          draftStartX.value,
          draftStartY.value,
          draftEndX.value,
          draftEndY.value
        );
      } else if (activeTool !== 'DRAW_WALL') {
        translateX.value = withDecay({ velocity: event.velocityX, velocityFactor: 0.6 });
        translateY.value = withDecay({ velocity: event.velocityY, velocityFactor: 0.6 });
      }
    });

  // 2. Панорама камеры (От 2 пальцев)
  const twoFingerPanGesture = Gesture.Pan()
    .minPointers(2)
    .onStart(() => {
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    })
    .onUpdate((event) => {
      translateX.value = savedTranslateX.value + event.translationX;
      translateY.value = savedTranslateY.value + event.translationY;
    });

  // 3. Зум (Щипок)
  const pinchGesture = Gesture.Pinch()
    .onStart((event) => {
      savedScale.value = scale.value;
      focalX.value = event.focalX;
      focalY.value = event.focalY;
    })
    .onUpdate((event) => {
      const newScale = Math.max(MIN_SCALE, Math.min(savedScale.value * event.scale, MAX_SCALE));
      const focalOffsetX = focalX.value - (focalX.value - savedTranslateX.value) * (newScale / savedScale.value);
      const focalOffsetY = focalY.value - (focalY.value - savedTranslateY.value) * (newScale / savedScale.value);

      scale.value = newScale;
      translateX.value = focalOffsetX;
      translateY.value = focalOffsetY;
    })
    .onEnd(() => {
      if (scale.value < MIN_SCALE) scale.value = withSpring(MIN_SCALE);
      else if (scale.value > MAX_SCALE) scale.value = withSpring(MAX_SCALE);
      savedTranslateX.value = translateX.value;
      savedTranslateY.value = translateY.value;
    });

  // 4. Одиночный тап
  const tapGesture = Gesture.Tap()
    .maxDistance(15) 
    .onEnd((event) => {
      runOnJS(handleTap)(event.x, event.y);
    });

  const gesture = Gesture.Simultaneous(
    Gesture.Simultaneous(panGesture, twoFingerPanGesture),
    Gesture.Simultaneous(pinchGesture, tapGesture)
  );

  const zoomIn = () => {
    const { width, height } = Dimensions.get('window');
    const focalX = width / 2;
    const focalY = height / 2;
    const newScale = Math.min(scale.value * 1.5, MAX_SCALE);
    
    const focalOffsetX = focalX - (focalX - translateX.value) * (newScale / scale.value);
    const focalOffsetY = focalY - (focalY - translateY.value) * (newScale / scale.value);

    scale.value = withSpring(newScale);
    translateX.value = withSpring(focalOffsetX);
    translateY.value = withSpring(focalOffsetY);
  };

  const zoomOut = () => {
    const { width, height } = Dimensions.get('window');
    const focalX = width / 2;
    const focalY = height / 2;
    const newScale = Math.max(scale.value / 1.5, MIN_SCALE);
    
    const focalOffsetX = focalX - (focalX - translateX.value) * (newScale / scale.value);
    const focalOffsetY = focalY - (focalY - translateY.value) * (newScale / scale.value);

    scale.value = withSpring(newScale);
    translateX.value = withSpring(focalOffsetX);
    translateY.value = withSpring(focalOffsetY);
  };

  return {
    translateX,
    translateY,
    scale,
    gesture,
    drafting: {
      isActive: isDrafting,
      startX: draftStartX,
      startY: draftStartY,
      endX: draftEndX,
      endY: draftEndY,
    },
    zoomIn,
    zoomOut,
  };
}