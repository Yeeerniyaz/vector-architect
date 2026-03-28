// =============================================================================
// Vector Architect — Wall Renderer
// Hardware-accelerated rendering of walls and their connection nodes.
// =============================================================================

import React, { useMemo } from 'react';
import { Path, Skia, Group, Rect } from '@shopify/react-native-skia';
import { useEditorStore } from '../../store/editorStore';
import { COLORS, Layer } from '../../types/blueprint';

interface WallRendererProps {
  activeLayer: Layer;
  scale: number;
}

export default function WallRenderer({ activeLayer, scale }: WallRendererProps) {
  const project = useEditorStore((state) => state.project);
  const draftWallNodeId = useEditorStore((state) => state.draftWallNodeId);
  const activeRoom = project.rooms.find((r) => r.id === project.activeRoomId);

  // 1. РЕНДЕР СТЕН (Массивная геометрия)
  const wallsPath = useMemo(() => {
    const path = Skia.Path.Make();
    if (!activeRoom) return path;

    const nodesMap = new Map(activeRoom.wallNodes.map((n) => [n.id, n.position]));

    activeRoom.walls.forEach((wall) => {
      const startNode = nodesMap.get(wall.startNodeId);
      const endNode = nodesMap.get(wall.endNodeId);

      if (startNode && endNode) {
        path.moveTo(startNode.x, startNode.y);
        path.lineTo(endNode.x, endNode.y);
      }
    });

    return path;
  }, [activeRoom?.walls, activeRoom?.wallNodes]);

  if (!activeRoom) return null;

  const isWallsActive = activeLayer === 'walls';
  const wallOpacity = isWallsActive ? 1 : 0.2;
  const wallThickness = isWallsActive ? 4 / scale : 2 / scale;
  
  // Размер архитектурного узла (колышка) на чертеже
  const nodeSize = 10 / scale; 

  return (
    <Group>
      {/* 1. Линии Стен */}
      <Path
        path={wallsPath}
        color={COLORS.BLACK}
        style="stroke"
        strokeWidth={wallThickness}
        strokeJoin="miter"
        strokeCap="square"
        opacity={wallOpacity}
      />

      {/* 2. Точки стыков (Узлы). Рисуем только если активен слой стен */}
      {isWallsActive && activeRoom.wallNodes.map((node) => {
        // Подсвечиваем активный узел (от которого сейчас тянем стену) желтым цветом
        const isDrafting = node.id === draftWallNodeId;
        const color = isDrafting ? COLORS.ACTIVE : COLORS.BLACK;
        const currentSize = isDrafting ? nodeSize * 1.5 : nodeSize; // Активный узел делаем чуть больше
        
        // Смещаем координаты на половину размера, чтобы центр квадрата лежал ровно в точке клика
        const offset = currentSize / 2;

        return (
          <Rect
            key={node.id}
            x={node.position.x - offset}
            y={node.position.y - offset}
            width={currentSize}
            height={currentSize}
            color={color}
            style={isDrafting ? "fill" : "stroke"} // Активный заливаем, обычный - контуром
            strokeWidth={1.5 / scale}
          />
        );
      })}
    </Group>
  );
}