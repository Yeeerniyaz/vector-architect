// =============================================================================
// Vector Architect — Object Renderer
// Hardware-accelerated rendering using Skia Path from the SVG Library.
// =============================================================================

import React from 'react';
import { Group, Path } from '@shopify/react-native-skia';
import { useEditorStore } from '../../store/editorStore';
import { COLORS, Layer } from '../../types/blueprint';
import { SVG_LIBRARY } from '../../utils/svgLibrary';

interface ObjectRendererProps {
  activeLayer: Layer;
  scale: number;
}

export default function ObjectRenderer({ activeLayer, scale }: ObjectRendererProps) {
  const project = useEditorStore((state) => state.project);
  const selectedObjectId = useEditorStore((state) => state.selectedObjectId);
  const activeRoom = project.rooms.find((r) => r.id === project.activeRoomId);

  if (!activeRoom || activeRoom.objects.length === 0) return null;

  return (
    <Group>
      {activeRoom.objects.map((obj) => {
        const isActiveLayer = obj.layer === activeLayer;
        const isSelected = obj.id === selectedObjectId;
        const opacity = isActiveLayer ? 1 : 0.2;
        const strokeColor = isSelected ? COLORS.ACTIVE : COLORS.BLACK;

        // Достаем SVG путь (d="M ...") из нашей библиотеки. Если нет - берем fallback.
        const svgString = SVG_LIBRARY[obj.type] || SVG_LIBRARY.fallback;

        // МАСШТАБИРОВАНИЕ: 
        // Наша SVG нарисована в квадрате 100х100. 
        // Если объект (например, диван) имеет размер 2200x900, мы растягиваем SVG:
        const scaleX = obj.width / 100;
        const scaleY = obj.height / 100;

        // Чтобы линия (stroke) не становилась толщиной в бревно при масштабировании,
        // вычисляем компенсацию. Это магия CAD-рендера!
        const averageScale = (scaleX + scaleY) / 2;
        const baseStrokeWidth = isSelected ? 3 : 1.5;
        const compensatedStrokeWidth = (baseStrokeWidth / scale) / averageScale;

        return (
          <Group
            key={obj.id}
            // 1. Ставим объект в нужные координаты на чертеже
            // 2. Вращаем его на заданный угол
            // 3. Растягиваем квадрат 100х100 до реальных миллиметров
            transform={[
              { translateX: obj.position.x },
              { translateY: obj.position.y },
              { rotate: obj.rotation },
              { scaleX: scaleX },
              { scaleY: scaleY },
            ]}
          >
            {/* Белая подложка (заливка), чтобы мебель перекрывала линии стен и сетку */}
            <Path 
              path={svgString} 
              color={COLORS.WHITE} 
              style="fill" 
              opacity={opacity} 
            />
            {/* Сам чертеж (черные или желтые контуры) */}
            <Path 
              path={svgString} 
              color={strokeColor} 
              style="stroke" 
              strokeWidth={compensatedStrokeWidth} 
              strokeCap="round"
              strokeJoin="round"
              opacity={opacity} 
            />
          </Group>
        );
      })}
    </Group>
  );
}