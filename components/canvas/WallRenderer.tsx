// =============================================================================
// Vector Architect — Wall Renderer
// Hardware-accelerated rendering of all structural walls using a single Skia Path.
// =============================================================================

import React, { useMemo } from 'react';
import { Path, Skia, Group } from '@shopify/react-native-skia';
import { useEditorStore } from '../../store/editorStore';
import { COLORS, Layer } from '../../types/blueprint';

interface WallRendererProps {
  activeLayer: Layer;
  scale: number;
}

export default function WallRenderer({ activeLayer, scale }: WallRendererProps) {
  // Получаем весь проект из стора
  const project = useEditorStore((state) => state.project);
  
  // Ищем активную комнату (этаж/чертеж)
  const activeRoom = project.rooms.find((r) => r.id === project.activeRoomId);

  // Мемоизируем сборку стен, чтобы не пересчитывать математику при каждом свайпе камеры
  const wallsPath = useMemo(() => {
    const path = Skia.Path.Make();

    if (!activeRoom) return path;

    // Для быстрого поиска узлов превращаем массив в словарь (Map)
    const nodesMap = new Map(activeRoom.wallNodes.map((n) => [n.id, n.position]));

    // Проходимся по всем стенам и рисуем их
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

  // Если чертеж пустой - ничего не рендерим
  if (!activeRoom || activeRoom.walls.length === 0) return null;

  // Логика слоев: если мы сейчас работаем с электрикой или мебелью,
  // стены должны стать полупрозрачными и уйти на задний план.
  const isWallsActive = activeLayer === 'walls';
  const wallOpacity = isWallsActive ? 1 : 0.2;

  return (
    <Group>
      {/* Рисуем все стены одним махом. 
        В будущем здесь можно будет добавить штриховку (Hatch) для заливки бетона,
        но для начала нам нужен строгий минимализм - просто черные линии.
      */}
      <Path
        path={wallsPath}
        color={COLORS.BLACK}
        style="stroke"
        // strokeWidth={200} // Настоящая толщина стены (например, 200мм)
        // Для режима черчения (wireframe) можно использовать тонкие линии:
        strokeWidth={isWallsActive ? 4 / scale : 2 / scale} 
        strokeJoin="miter" // Острые углы на стыках стен
        strokeCap="square" // Квадратные обрубовки на концах
        opacity={wallOpacity}
      />
      
      {/* Здесь позже появится рендер "Узлов" (Nodes) - маленьких квадратиков 
        на концах стен, за которые пользователь будет тянуть пальцем.
      */}
    </Group>
  );
}