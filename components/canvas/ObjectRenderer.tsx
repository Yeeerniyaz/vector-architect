// =============================================================================
// Vector Architect — Object Renderer (Skia)
// Draws parametric SmartObjects as Skia paths based on type/dimensions.
// =============================================================================

import React from 'react';
import {
  Rect,
  Circle,
  Group,
  vec,
  Line,
} from '@shopify/react-native-skia';
import { useEditorStore } from '@/store/editorStore';
import { COLORS, type Layer, type SmartObject, type SmartObjectType } from '@/types/blueprint';
import { mmToCanvas } from '@/utils/snapping';

interface ObjectRendererProps {
  activeLayer: Layer;
  scale: number;
}

/**
 * Renders a single SmartObject as a parametric Skia shape.
 * Each type has its own visual representation.
 */
function renderObject(
  obj: SmartObject,
  isActive: boolean,
  scale: number,
  isSelected: boolean,
) {
  const w = mmToCanvas(obj.width);
  const h = mmToCanvas(obj.height);
  const opacity = isActive ? 1.0 : 0.2;
  const x = obj.position.x - w / 2;
  const y = obj.position.y - h / 2;

  // Selection highlight
  const selectionBorder = isSelected ? (
    <Rect
      x={x - 2 / scale}
      y={y - 2 / scale}
      width={w + 4 / scale}
      height={h + 4 / scale}
      color={COLORS.ACTIVE}
      style="stroke"
      strokeWidth={2 / scale}
    />
  ) : null;

  const strokeWidth = 1 / scale;

  // Type-specific rendering
  switch (obj.type as SmartObjectType) {
    // --- Sockets: small filled square with + sign ---
    case 'socket':
      return (
        <Group key={obj.id} opacity={opacity}>
          {selectionBorder}
          <Rect x={x} y={y} width={w} height={h} color={COLORS.BLACK} style="stroke" strokeWidth={strokeWidth} />
          <Line p1={vec(obj.position.x, y + 2 / scale)} p2={vec(obj.position.x, y + h - 2 / scale)} color={COLORS.BLACK} strokeWidth={strokeWidth} />
          <Line p1={vec(x + 2 / scale, obj.position.y)} p2={vec(x + w - 2 / scale, obj.position.y)} color={COLORS.BLACK} strokeWidth={strokeWidth} />
        </Group>
      );

    // --- Lights: circle ---
    case 'light':
      return (
        <Group key={obj.id} opacity={opacity}>
          {selectionBorder}
          <Circle cx={obj.position.x} cy={obj.position.y} r={w / 2} color={COLORS.BLACK} style="stroke" strokeWidth={strokeWidth} />
          {/* Cross inside */}
          <Line p1={vec(obj.position.x - w / 3, obj.position.y - w / 3)} p2={vec(obj.position.x + w / 3, obj.position.y + w / 3)} color={COLORS.BLACK} strokeWidth={strokeWidth} />
          <Line p1={vec(obj.position.x + w / 3, obj.position.y - w / 3)} p2={vec(obj.position.x - w / 3, obj.position.y + w / 3)} color={COLORS.BLACK} strokeWidth={strokeWidth} />
        </Group>
      );

    // --- Switches: small square with diagonal ---
    case 'switch':
      return (
        <Group key={obj.id} opacity={opacity}>
          {selectionBorder}
          <Rect x={x} y={y} width={w} height={h} color={COLORS.BLACK} style="stroke" strokeWidth={strokeWidth} />
          <Line p1={vec(x, y)} p2={vec(x + w, y + h)} color={COLORS.BLACK} strokeWidth={strokeWidth} />
        </Group>
      );

    // --- Doors: rectangle with arc indicator ---
    case 'door':
      return (
        <Group key={obj.id} opacity={opacity}>
          {selectionBorder}
          <Rect x={x} y={y} width={w} height={h} color={COLORS.WHITE} />
          <Rect x={x} y={y} width={w} height={h} color={COLORS.BLACK} style="stroke" strokeWidth={strokeWidth} />
          {/* Door swing line */}
          <Line p1={vec(x, y + h)} p2={vec(x + w, y)} color={COLORS.BLACK} strokeWidth={strokeWidth} />
        </Group>
      );

    // --- Plumbing items: circles ---
    case 'drain':
    case 'pipe':
      return (
        <Group key={obj.id} opacity={opacity}>
          {selectionBorder}
          <Circle cx={obj.position.x} cy={obj.position.y} r={w / 2} color={COLORS.BLACK} style="stroke" strokeWidth={strokeWidth} />
          <Circle cx={obj.position.x} cy={obj.position.y} r={w / 4} color={COLORS.BLACK} style="fill" />
        </Group>
      );

    // --- Default: filled rectangle for furniture / appliances ---
    default:
      return (
        <Group key={obj.id} opacity={opacity}>
          {selectionBorder}
          <Rect x={x} y={y} width={w} height={h} color={COLORS.WHITE} />
          <Rect x={x} y={y} width={w} height={h} color={COLORS.BLACK} style="stroke" strokeWidth={strokeWidth} />
        </Group>
      );
  }
}

function ObjectRenderer({ activeLayer, scale }: ObjectRendererProps) {
  const project = useEditorStore((s) => s.project);
  const selectedObjectId = useEditorStore((s) => s.selectedObjectId);
  const room = project.rooms.find((r) => r.id === project.activeRoomId);

  if (!room) return null;

  return (
    <>
      {room.objects.map((obj) => {
        const isActive = obj.layer === activeLayer;
        const isSelected = obj.id === selectedObjectId;
        return renderObject(obj, isActive, scale, isSelected);
      })}
    </>
  );
}

export default React.memo(ObjectRenderer);
