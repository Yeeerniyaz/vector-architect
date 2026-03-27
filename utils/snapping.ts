// =============================================================================
// Vector Architect — Snapping Utilities
// Pure math functions. No React dependencies.
// =============================================================================

import { Point2D, WallNode, GRID } from '@/types/blueprint';

/**
 * Snap a point to the nearest grid intersection.
 */
export function snapToGrid(
  point: Point2D,
  gridSize: number = GRID.MINOR_SPACING,
): Point2D {
  return {
    x: Math.round(point.x / gridSize) * gridSize,
    y: Math.round(point.y / gridSize) * gridSize,
  };
}

/**
 * Constrain the endpoint of a line to the nearest standard angle
 * (0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°).
 * Returns the snapped endpoint.
 */
export function snapAngle(start: Point2D, end: Point2D): Point2D {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  if (distance === 0) return end;

  // Calculate angle in radians, then snap to nearest 45°
  const angle = Math.atan2(dy, dx);
  const snappedAngle = Math.round(angle / (Math.PI / 4)) * (Math.PI / 4);

  return {
    x: start.x + distance * Math.cos(snappedAngle),
    y: start.y + distance * Math.sin(snappedAngle),
  };
}

/**
 * Find the nearest existing wall node within a threshold distance.
 * Returns the node's position if found, null otherwise.
 */
export function snapToNearestNode(
  point: Point2D,
  nodes: WallNode[],
  threshold: number = 15,
): Point2D | null {
  let closest: Point2D | null = null;
  let minDist = threshold;

  for (const node of nodes) {
    const dx = point.x - node.position.x;
    const dy = point.y - node.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < minDist) {
      minDist = dist;
      closest = node.position;
    }
  }

  return closest;
}

/**
 * Apply all snapping logic in priority order:
 * 1. Snap to nearest existing node (highest priority — magnetic)
 * 2. Snap angle to 45° increments (if drawing from a start point)
 * 3. Snap to grid (lowest priority)
 */
export function applySnapping(
  point: Point2D,
  nodes: WallNode[],
  startPoint?: Point2D,
  nodeThreshold: number = 15,
): Point2D {
  // 1. Try magnetic snap to existing node
  const nodeSnap = snapToNearestNode(point, nodes, nodeThreshold);
  if (nodeSnap) return nodeSnap;

  // 2. If drawing a wall, snap angle
  if (startPoint) {
    const angleSnapped = snapAngle(startPoint, point);
    return snapToGrid(angleSnapped);
  }

  // 3. Default: snap to grid
  return snapToGrid(point);
}

/**
 * Calculate the distance between two points in mm.
 * Canvas pixels * 10 = mm.
 */
export function distanceMm(a: Point2D, b: Point2D): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy) * 10;
}

/**
 * Convert mm to canvas pixels.
 */
export function mmToCanvas(mm: number): number {
  return mm / 10;
}

/**
 * Convert canvas pixels to mm.
 */
export function canvasToMm(px: number): number {
  return px * 10;
}
