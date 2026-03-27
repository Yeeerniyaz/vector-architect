// =============================================================================
// Vector Architect — Main Zustand Store
// Holds the complete blueprint state (in-memory).
// TODO: Re-enable MMKV persistence after switching to dev build.
// =============================================================================

import { create } from 'zustand';
import {
  Layer,
  Wall,
  WallNode,
  SmartObject,
  WetZone,
  RoutePath,
  Room,
  Project,
  Point2D,
  SmartObjectType,
  OBJECT_LAYER_MAP,
  DEFAULTS,
} from '@/types/blueprint';
import { generateChildObjects } from '@/utils/smartPresets';

// =============================================================================
// ID Generator
// =============================================================================

let idCounter = 0;

function generateId(prefix: string = 'obj'): string {
  idCounter += 1;
  return `${prefix}_${Date.now()}_${idCounter}`;
}

// =============================================================================
// Store Interface
// =============================================================================

interface EditorState {
  // --- Project Data ---
  project: Project;

  // --- UI State ---
  activeLayer: Layer;
  selectedObjectId: string | null;

  // --- Layer Actions ---
  setActiveLayer: (layer: Layer) => void;

  // --- Selection ---
  selectObject: (id: string) => void;
  deselectObject: () => void;

  // --- Wall Operations ---
  addWallNode: (position: Point2D) => string;
  addWall: (startNodeId: string, endNodeId: string) => string;
  removeWall: (wallId: string) => void;

  // --- Object Operations ---
  addObject: (
    type: SmartObjectType,
    position: Point2D,
    width: number,
    height: number,
  ) => string;
  addSmartObject: (
    type: SmartObjectType,
    position: Point2D,
    width: number,
    height: number,
  ) => string;
  updateObject: (id: string, updates: Partial<SmartObject>) => void;
  removeObject: (id: string) => void;

  // --- Wet Zone Operations ---
  addWetZone: (vertices: Point2D[]) => string;

  // --- Route Operations ---
  setRoutes: (routes: RoutePath[]) => void;
  clearRoutes: () => void;
}

// =============================================================================
// Helper: Get Active Room
// =============================================================================

function getActiveRoom(project: Project): Room {
  const room = project.rooms.find((r) => r.id === project.activeRoomId);
  if (!room) throw new Error('No active room found');
  return room;
}

function updateActiveRoom(
  project: Project,
  updater: (room: Room) => Room,
): Project {
  return {
    ...project,
    updatedAt: Date.now(),
    rooms: project.rooms.map((r) =>
      r.id === project.activeRoomId ? updater(r) : r,
    ),
  };
}

// =============================================================================
// Default Project
// =============================================================================

function createDefaultProject(): Project {
  const roomId = generateId('room');
  return {
    id: generateId('project'),
    name: 'Untitled Project',
    activeRoomId: roomId,
    rooms: [
      {
        id: roomId,
        name: 'Room 1',
        walls: [],
        wallNodes: [],
        objects: [],
        wetZones: [],
        routes: [],
      },
    ],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

// =============================================================================
// Store
// =============================================================================

export const useEditorStore = create<EditorState>()(
    (set, get) => ({
      // --- Initial State ---
      project: createDefaultProject(),
      activeLayer: 'walls',
      selectedObjectId: null,

      // --- Layer ---
      setActiveLayer: (layer) => set({ activeLayer: layer }),

      // --- Selection ---
      selectObject: (id) => set({ selectedObjectId: id }),
      deselectObject: () => set({ selectedObjectId: null }),

      // --- Wall Nodes ---
      addWallNode: (position) => {
        const nodeId = generateId('node');
        const node: WallNode = { id: nodeId, position };
        set((state) => ({
          project: updateActiveRoom(state.project, (room) => ({
            ...room,
            wallNodes: [...room.wallNodes, node],
          })),
        }));
        return nodeId;
      },

      // --- Walls ---
      addWall: (startNodeId, endNodeId) => {
        const wallId = generateId('wall');
        const wall: Wall = {
          id: wallId,
          startNodeId,
          endNodeId,
          thickness: DEFAULTS.WALL_THICKNESS,
          height: DEFAULTS.WALL_HEIGHT,
        };
        set((state) => ({
          project: updateActiveRoom(state.project, (room) => ({
            ...room,
            walls: [...room.walls, wall],
          })),
        }));
        return wallId;
      },

      removeWall: (wallId) => {
        set((state) => ({
          project: updateActiveRoom(state.project, (room) => ({
            ...room,
            walls: room.walls.filter((w) => w.id !== wallId),
          })),
        }));
      },

      // --- Objects (without smart automation) ---
      addObject: (type, position, width, height) => {
        const objId = generateId('obj');
        const layer = OBJECT_LAYER_MAP[type];
        const obj: SmartObject = {
          id: objId,
          type,
          layer,
          position,
          rotation: 0,
          width,
          height,
          isAutoGenerated: false,
        };
        set((state) => ({
          project: updateActiveRoom(state.project, (room) => ({
            ...room,
            objects: [...room.objects, obj],
          })),
        }));
        return objId;
      },

      // --- Smart Objects (with parent-child automation) ---
      addSmartObject: (type, position, width, height) => {
        const objId = generateId('obj');
        const layer = OBJECT_LAYER_MAP[type];
        const parent: SmartObject = {
          id: objId,
          type,
          layer,
          position,
          rotation: 0,
          width,
          height,
          isAutoGenerated: false,
        };

        // Generate child objects (sockets, drains, etc.)
        const children = generateChildObjects(parent, () => generateId('auto'));

        set((state) => ({
          project: updateActiveRoom(state.project, (room) => ({
            ...room,
            objects: [...room.objects, parent, ...children],
          })),
        }));

        return objId;
      },

      updateObject: (id, updates) => {
        set((state) => ({
          project: updateActiveRoom(state.project, (room) => ({
            ...room,
            objects: room.objects.map((obj) =>
              obj.id === id ? { ...obj, ...updates } : obj,
            ),
          })),
        }));
      },

      removeObject: (id) => {
        set((state) => ({
          project: updateActiveRoom(state.project, (room) => ({
            ...room,
            // Remove the object AND all its auto-generated children
            objects: room.objects.filter(
              (obj) => obj.id !== id && obj.parentId !== id,
            ),
          })),
        }));
      },

      // --- Wet Zones ---
      addWetZone: (vertices) => {
        const zoneId = generateId('zone');
        const zone: WetZone = {
          id: zoneId,
          vertices,
          restrictionRadius: DEFAULTS.WET_ZONE_RESTRICTION,
        };
        set((state) => ({
          project: updateActiveRoom(state.project, (room) => ({
            ...room,
            wetZones: [...room.wetZones, zone],
          })),
        }));
        return zoneId;
      },

      // --- Routes ---
      setRoutes: (routes) => {
        set((state) => ({
          project: updateActiveRoom(state.project, (room) => ({
            ...room,
            routes,
          })),
        }));
      },

      clearRoutes: () => {
        set((state) => ({
          project: updateActiveRoom(state.project, (room) => ({
            ...room,
            routes: [],
          })),
        }));
      },
    }),
);