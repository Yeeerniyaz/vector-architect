// =============================================================================
// Vector Architect — Conflict Detection (Anti-Fool System)
// Detects electrical objects placed inside wet zones and pushes them out.
// =============================================================================

import { Point2D, WetZone, DEFAULTS } from '@/types/blueprint';
import { mmToCanvas } from '@/utils/snapping';

export interface ConflictResult {
  /** Whether the point is inside or within restriction radius of a wet zone */
  hasConflict: boolean;
  /** The conflicting wet zone, if any */
  zone?: WetZone;
  /** The corrected position pushed outside the restriction radius */
  correctedPosition?: Point2D;
}

/**
 * Ray-casting algorithm to check if a point is inside a polygon.
 */
function isPointInPolygon(point: Point2D, vertices: Point2D[]): boolean {
  let inside = false;
  const n = vertices.length;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = vertices[i].x;
    const yi = vertices[i].y;
    const xj = vertices[j].x;
    const yj = vertices[j].y;

    const intersect =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

/**
 * Calculate the centroid (center) of a polygon.
 */
function polygonCentroid(vertices: Point2D[]): Point2D {
  let cx = 0;
  let cy = 0;
  for (const v of vertices) {
    cx += v.x;
    cy += v.y;
  }
  return { x: cx / vertices.length, y: cy / vertices.length };
}

/**
 * Find the nearest point on a polygon edge to a given point.
 */
function nearestPointOnPolygonEdge(
  point: Point2D,
  vertices: Point2D[],
): Point2D {
  let nearest: Point2D = vertices[0];
  let minDist = Infinity;
  const n = vertices.length;

  for (let i = 0; i < n; i++) {
    const a = vertices[i];
    const b = vertices[(i + 1) % n];

    // Project point onto segment a-b
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const apx = point.x - a.x;
    const apy = point.y - a.y;
    const abLenSq = abx * abx + aby * aby;

    if (abLenSq === 0) continue;

    let t = (apx * abx + apy * aby) / abLenSq;
    t = Math.max(0, Math.min(1, t));

    const proj: Point2D = {
      x: a.x + t * abx,
      y: a.y + t * aby,
    };

    const dx = point.x - proj.x;
    const dy = point.y - proj.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < minDist) {
      minDist = dist;
      nearest = proj;
    }
  }

  return nearest;
}

/**
 * Check if a point is inside any wet zone (including restriction radius)
 * and calculate the corrected push-out position.
 */
export function checkWetZoneConflict(
  point: Point2D,
  wetZones: WetZone[],
): ConflictResult {
  const restrictionPx = mmToCanvas(DEFAULTS.WET_ZONE_RESTRICTION);

  for (const zone of wetZones) {
    if (!isPointInPolygon(point, zone.vertices)) continue;

    // Point is inside the wet zone — push it out
    const nearestEdge = nearestPointOnPolygonEdge(point, zone.vertices);
    const dx = point.x - nearestEdge.x;
    const dy = point.y - nearestEdge.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Direction from zone center toward the point (outward)
    const centroid = polygonCentroid(zone.vertices);
    const outDx = point.x - centroid.x;
    const outDy = point.y - centroid.y;
    const outDist = Math.sqrt(outDx * outDx + outDy * outDy);

    if (outDist === 0) {
      // Point is exactly at centroid; push toward first vertex
      return {
        hasConflict: true,
        zone,
        correctedPosition: {
          x: zone.vertices[0].x + restrictionPx,
          y: zone.vertices[0].y,
        },
      };
    }

    // Normalize outward direction and push past edge + restriction radius
    const normX = outDx / outDist;
    const normY = outDy / outDist;

    // Push to nearest edge point + restriction radius in outward direction
    const correctedPosition: Point2D = {
      x: nearestEdge.x + normX * restrictionPx,
      y: nearestEdge.y + normY * restrictionPx,
    };

    return {
      hasConflict: true,
      zone,
      correctedPosition,
    };
  }

  return { hasConflict: false };
}

/**
 * Quick check: is a point inside any wet zone? (Without correction logic)
 */
export function isInWetZone(
  point: Point2D,
  wetZones: WetZone[],
): boolean {
  return wetZones.some((zone) => isPointInPolygon(point, zone.vertices));
}
