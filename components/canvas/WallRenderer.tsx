// =============================================================================
// Vector Architect — Wall Renderer (Skia)
// Reads walls/wallNodes from Zustand and draws thick lines + node markers.
// =============================================================================

import React from 'react';
import { Line, Rect, vec } from '@shopify/react-native-skia';
import { useEditorStore } from '@/store/editorStore';
import { COLORS, type Layer } from '@/types/blueprint';
import { mmToCanvas } from '@/utils/snapping';

interface WallRendererProps {
  activeLayer: Layer;
  scale: number;
}

const NODE_SIZE = 6; // pixels at 1x zoom

function WallRenderer({ activeLayer, scale }: WallRendererProps) {
  const project = useEditorStore((s) => s.project);
  const room = project.rooms.find((r) => r.id === project.activeRoomId);

  if (!room) return null;

  const { walls, wallNodes } = room;
  const isActive = activeLayer === 'walls';
  const opacity = isActive ? 1.0 : 0.2;

  // Build a quick lookup for node positions
  const nodeMap = new Map(wallNodes.map((n) => [n.id, n.position]));

  return (
    <>
      {/* Draw wall segments */}
      {walls.map((wall) => {
        const start = nodeMap.get(wall.startNodeId);
        const end = nodeMap.get(wall.endNodeId);
        if (!start || !end) return null;

        const thicknessPx = mmToCanvas(wall.thickness);

        return (
          <Line
            key={wall.id}
            p1={vec(start.x, start.y)}
            p2={vec(end.x, end.y)}
            color={COLORS.BLACK}
            strokeWidth={thicknessPx / scale}
            opacity={opacity}
            style="stroke"
            strokeCap="square"
          />
        );
      })}

      {/* Draw wall node markers (small squares) */}
      {isActive &&
        wallNodes.map((node) => {
          const halfSize = NODE_SIZE / (2 * scale);
          return (
            <Rect
              key={node.id}
              x={node.position.x - halfSize}
              y={node.position.y - halfSize}
              width={halfSize * 2}
              height={halfSize * 2}
              color={COLORS.BLACK}
            />
          );
        })}
    </>
  );
}

export default React.memo(WallRenderer);
