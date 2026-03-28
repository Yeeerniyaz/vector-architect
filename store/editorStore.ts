// =============================================================================
// Vector Architect — Main Zustand Store
// Holds the complete blueprint state (in-memory).
// Now with Smart Object Catalog and real-world dimensions.
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
} from '../types/blueprint';
import { generateChildObjects } from '../utils/smartPresets';

// =============================================================================
// Типы UI Режимов
// =============================================================================
export type ToolMode = 'SELECT' | 'DRAW_WALL' | 'ADD_OBJECT';

// =============================================================================
// КАТАЛОГ ОБЪЕКТОВ (Габариты в миллиметрах по стандартам эргономики)
// =============================================================================
export const OBJECT_CATALOG: Record<string, { width: number; height: number; label: string; icon: string }> = {
  // Электрика и Сеть
  socket_220v: { width: 40, height: 40, label: 'Розетка 220В', icon: '🔌' },
  socket_internet: { width: 40, height: 40, label: 'Интернет', icon: '🌐' },
  light_switch: { width: 40, height: 40, label: 'Выключатель', icon: '💡' },
  electric_panel: { width: 300, height: 100, label: 'Щиток', icon: '⚡' },
  router_wifi: { width: 200, height: 150, label: 'Роутер', icon: '📡' },
  camera: { width: 100, height: 100, label: 'Камера', icon: '📹' }, // Добавили камеру
  
  // Мебель
  bed_queen: { width: 1600, height: 2000, label: 'Кровать', icon: '🛏️' },
  sofa_standard: { width: 2200, height: 900, label: 'Диван', icon: '🛋️' },
  table_dining: { width: 1200, height: 800, label: 'Стол', icon: '🪑' }, // Добавили стол
  
  // Техника и Кухня
  kitchen_counter: { width: 1200, height: 600, label: 'Кухня', icon: '🍳' }, // Столешница с плитой
  dishwasher_builtin: { width: 600, height: 600, label: 'Посудомойка', icon: '🍽️' },
  oven_builtin: { width: 600, height: 600, label: 'Духовка', icon: '🔥' },
  
  // Сантехника
  toilet: { width: 400, height: 700, label: 'Унитаз', icon: '🚽' },
  sink: { width: 600, height: 450, label: 'Раковина', icon: '🚰' },
  shower_cabin: { width: 900, height: 900, label: 'Душевая', icon: '🚿' },
};
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
  activeTool: ToolMode;
  draftWallNodeId: string | null;
  activeObjectType: SmartObjectType; // НОВОЕ: Какой объект мы сейчас держим в руках

  // --- UI Actions ---
  setActiveLayer: (layer: Layer) => void;
  setActiveTool: (tool: ToolMode) => void;
  setDraftWallNodeId: (id: string | null) => void;
  setActiveObjectType: (type: SmartObjectType) => void; // НОВОЕ: Сменить объект

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
// Helper Functions
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

export const useEditorStore = create<EditorState>()((set, get) => ({
  project: createDefaultProject(),
  activeLayer: 'walls',
  selectedObjectId: null,
  activeTool: 'SELECT',
  draftWallNodeId: null,
  activeObjectType: 'socket_220v', // Изначально в руках розетка

  // --- UI Actions ---
  setActiveLayer: (layer) => set({ activeLayer: layer }),
  setActiveTool: (tool) => {
    set({ activeTool: tool, selectedObjectId: null, draftWallNodeId: null });
  },
  setDraftWallNodeId: (id) => set({ draftWallNodeId: id }),
  
  // Когда мы выбираем новый объект из каталога, мы автоматически переключаем инструмент на добавление
  setActiveObjectType: (type) => set({ activeObjectType: type, activeTool: 'ADD_OBJECT' }),

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
      rotation: 0, // Угол в радианах
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

    // Магия автоматизации: генерируем розетки и выключатели вокруг объекта
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
      project: updateActiveRoom(state.project, (room) => ({ ...room, routes })),
    }));
  },

  clearRoutes: () => {
    set((state) => ({
      project: updateActiveRoom(state.project, (room) => ({ ...room, routes: [] })),
    }));
  },
}));