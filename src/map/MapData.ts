export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RoomData extends Rect {
  id: string;
  name: string;
  color: string;
}

export interface RoomOctagon {
  name: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  c: number; // corner cut / chamfer
}

// Map dimensions: Map.png is 1536x1024, scaled 2x for gameplay
export const MAP_SCALE = 2;
export const WORLD_WIDTH = 1536 * MAP_SCALE; // 3072
export const WORLD_HEIGHT = 1024 * MAP_SCALE; // 2048

// Spawn coordinates in Cafeteria center aisle
export const SPAWN_POSITION = {
  x: 1420,
  y: 960
};

export const MAP_ROOMS: RoomData[] = [
  { id: 'central_hub', name: 'CENTRAL HUB / CAFETERIA', x: 1160, y: 680, w: 600, h: 440, color: '#00F0FF' },
  { id: 'library', name: 'LIBRARY & ARCHIVES', x: 260, y: 120, w: 720, h: 440, color: '#38bdf8' },
  { id: 'medbay', name: 'MEDICAL BAY', x: 1680, y: 120, w: 740, h: 440, color: '#10b981' },
  { id: 'storage', name: 'STORAGE & CARGO', x: 2360, y: 660, w: 560, h: 440, color: '#f59e0b' },
  { id: 'command', name: 'COMMAND & TECH', x: 1940, y: 1280, w: 740, h: 460, color: '#a855f7' },
  { id: 'dev_lab', name: 'DEV WORKSTATIONS', x: 920, y: 1360, w: 640, h: 440, color: '#06b6d4' },
  { id: 'mafia_lair', name: 'DARK LAIR', x: 180, y: 1040, w: 560, h: 460, color: '#ef4444' },
];

export const EMERGENCY_TERMINAL: RoomData = {
  id: 'emergency_terminal',
  name: 'EMERGENCY TERMINAL',
  x: 1370,
  y: 920,
  w: 100,
  h: 100,
  color: '#FFB800'
};

// ── FRESH WALKABLE FLOOR ZONES & WALL BOUNDARIES ──
// Strictly following the paths and open corridors shown in the reference image.
// Outside these zones are the solid outer walls.
// Inside these zones, movement is completely clear with no internal obstacles.
export const WALKABLE_ZONES: Rect[] = [
  // ── ROOM FLOORS ──
  // Cafeteria (Central Hub)
  { x: 1120, y: 680, w: 600, h: 480 },
  // Library (Top-Left)
  { x: 300, y: 140, w: 780, h: 460 },
  // Medical Bay (Top-Right)
  { x: 1540, y: 140, w: 760, h: 450 },
  // Storage & Cargo (Mid-Right)
  { x: 2280, y: 590, w: 580, h: 480 },
  // Command & Tech (Bottom-Right)
  { x: 1940, y: 1240, w: 740, h: 520 },
  // Developer Workstations (Bottom-Center)
  { x: 920, y: 1370, w: 580, h: 500 },
  // Mafia Lair / Dark Room (Bottom-Left)
  { x: 200, y: 990, w: 540, h: 520 },

  // ── CORRIDORS & CONNECTORS ──
  // West Corridor (Library South -> Cafeteria West -> Mafia East)
  { x: 640, y: 540, w: 140, h: 260 },
  { x: 680, y: 740, w: 460, h: 180 }, // Cafeteria West Door
  { x: 920, y: 880, w: 160, h: 260 }, // West vertical corridor outside Cafeteria (Image 2)
  { x: 560, y: 1100, w: 480, h: 140 }, // West corridor turn down-left towards Mafia Lair (Image 2)
  { x: 560, y: 920, w: 200, h: 240 },
  { x: 560, y: 1060, w: 200, h: 180 }, // Mafia Lair East Door

  // East Corridor (Medbay South -> Storage West -> Command North)
  { x: 1840, y: 540, w: 160, h: 260 },
  { x: 1840, y: 760, w: 160, h: 320 },
  { x: 1840, y: 1060, w: 160, h: 140 },
  { x: 1660, y: 900, w: 200, h: 160 }, // Cafeteria East Door
  { x: 1660, y: 700, w: 200, h: 160 }, // Cafeteria North-East Door
  { x: 1960, y: 800, w: 340, h: 140 }, // Storage West Door
  { x: 1940, y: 1140, w: 180, h: 140 }, // Command North Door

  // Library East Corridor connector
  { x: 1000, y: 460, w: 160, h: 140 },
  { x: 1140, y: 460, w: 200, h: 140 },
  { x: 1140, y: 580, w: 180, h: 160 }, // Cafeteria North-West Door

  // ── SOUTH CORRIDOR SYSTEM (Center -> Mid-Bottom -> Right-Bottom -> Airlock) ──
  // Vertical stem from Cafeteria south doorway
  { x: 1360, y: 1120, w: 160, h: 380 },
  // Horizontal corridor connecting Dev Lab (Mid-Bottom) and Command (Right-Bottom)
  { x: 1160, y: 1440, w: 880, h: 160 },
  // Door connection into Dev Lab
  { x: 1160, y: 1360, w: 160, h: 160 },
  // Door connection into Command West entrance
  { x: 1900, y: 1440, w: 180, h: 160 },
  // South Airlock stub going straight down between Dev Lab and Command (Image 1)
  { x: 1660, y: 1540, w: 150, h: 240 }
];

export const CORRIDOR_FLOORS: Rect[] = WALKABLE_ZONES;
export const ROOM_OCTAGONS: RoomOctagon[] = [];
export const MAP_OBSTACLES: Rect[] = [];

/**
 * Returns true if (px, py) is on the walkable floor of any room or corridor
 */
export function isPointOnFloor(px: number, py: number): boolean {
  for (let i = 0; i < WALKABLE_ZONES.length; i++) {
    const z = WALKABLE_ZONES[i];
    if (px >= z.x && px <= z.x + z.w && py >= z.y && py <= z.y + z.h) {
      return true;
    }
  }
  return false;
}

/**
 * Returns true if the bounding box overlaps any obstacle on the floor
 */
export function isOverlappingObstacle(_x: number, _y: number, _w: number, _h: number): boolean {
  return false;
}

// Keep export for backwards compatibility
export const MAP_WALLS: Rect[] = [];
export const ALL_COLLIDERS: Rect[] = [];
