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

// 1. Walkable Floor Octagons for each room (the character can ONLY walk on the floor)
export const ROOM_OCTAGONS: RoomOctagon[] = [
  // Cafeteria / Central Hub (center ~ 1420, 960)
  { name: 'Cafeteria', x1: 1120, y1: 670, x2: 1720, y2: 1170, c: 130 },
  // Library (Top-Left, center ~ 700, 380)
  { name: 'Library', x1: 300, y1: 140, x2: 1080, y2: 600, c: 130 },
  // Medical Bay (Top-Right, center ~ 1900, 370)
  { name: 'Medbay', x1: 1480, y1: 130, x2: 2320, y2: 590, c: 130 },
  // Storage & Cargo (Mid-Right, center ~ 2570, 840)
  { name: 'Storage', x1: 2260, y1: 580, x2: 2880, y2: 1080, c: 130 },
  // Command & Tech (Bottom-Right, center ~ 2300, 1500)
  { name: 'Command', x1: 1900, y1: 1220, x2: 2700, y2: 1780, c: 140 },
  // Developer Workstations (Bottom-Center, center ~ 1200, 1640)
  { name: 'DevLab', x1: 880, y1: 1360, x2: 1520, y2: 1900, c: 120 },
  // Mafia Lair / Dark Room (Bottom-Left, center ~ 460, 1270)
  { name: 'MafiaLair', x1: 180, y1: 1000, x2: 740, y2: 1540, c: 130 }
];

// 2. Walkable Corridor Floors (open paths connecting all rooms)
export const CORRIDOR_FLOORS: Rect[] = [
  // Cafeteria to Library (Horizontal & Vertical segments)
  { x: 640, y: 740, w: 520, h: 140 },
  { x: 640, y: 560, w: 140, h: 220 },
  { x: 640, y: 840, w: 140, h: 320 },

  // Cafeteria to Medbay
  { x: 1680, y: 680, w: 260, h: 140 },
  { x: 1840, y: 560, w: 140, h: 200 },

  // Medbay to Storage
  { x: 1840, y: 720, w: 140, h: 420 },
  { x: 1940, y: 760, w: 380, h: 140 },

  // Cafeteria to Storage
  { x: 1680, y: 980, w: 280, h: 140 },

  // Cafeteria South corridor & branches (Dev Lab, Command, Airlock)
  { x: 1340, y: 1140, w: 160, h: 300 },
  { x: 1200, y: 1240, w: 800, h: 140 },
  { x: 1200, y: 1280, w: 180, h: 160 },
  { x: 1860, y: 1220, w: 180, h: 140 },
  { x: 1360, y: 1400, w: 140, h: 160 },

  // Cafeteria to Mafia Lair
  { x: 1040, y: 1040, w: 160, h: 140 },
  { x: 720, y: 1080, w: 360, h: 140 },
  { x: 660, y: 1100, w: 140, h: 140 }
];

// 3. Solid Obstacles placed on the floor (Tables, Desks, Forklift, Beds, Server Racks, Bookshelves)
export const MAP_OBSTACLES: Rect[] = [
  // --- CAFETERIA / CENTRAL HUB ---
  // Top bar / kitchen counter
  { x: 1280, y: 650, w: 320, h: 100 },
  // 4 Dining tables with chairs
  { x: 1260, y: 860, w: 100, h: 90 }, // Table 1 (Top-Left)
  { x: 1520, y: 860, w: 100, h: 90 }, // Table 2 (Top-Right)
  { x: 1290, y: 1010, w: 100, h: 90 }, // Table 3 (Bottom-Left)
  { x: 1500, y: 1010, w: 100, h: 90 }, // Table 4 (Bottom-Right)
  // Wall plants/vending units
  { x: 1140, y: 700, w: 60, h: 100 },
  { x: 1710, y: 700, w: 60, h: 100 },

  // --- LIBRARY (TOP-LEFT) ---
  // Central large book study table
  { x: 580, y: 340, w: 250, h: 120 },
  // Purple armchair
  { x: 360, y: 270, w: 120, h: 110 },
  // Bookshelves along top
  { x: 300, y: 140, w: 200, h: 100 },
  { x: 750, y: 140, w: 250, h: 100 },
  // Terminal desk on right
  { x: 900, y: 240, w: 140, h: 100 },
  // Bottom crates/terminals
  { x: 340, y: 450, w: 110, h: 80 },
  { x: 880, y: 440, w: 130, h: 100 },

  // --- MEDBAY (TOP-RIGHT) ---
  // Hospital bed 1 (top)
  { x: 1480, y: 220, w: 190, h: 110 },
  // Hospital bed 2 (bottom)
  { x: 1510, y: 400, w: 190, h: 110 },
  // Medical privacy curtain
  { x: 1710, y: 220, w: 30, h: 160 },
  // Medical supply cabinets (top-right)
  { x: 1980, y: 150, w: 130, h: 110 },
  // Diagnostic ECG consoles & screens (right wall)
  { x: 2130, y: 230, w: 160, h: 200 },
  // Mobile cart/scanner
  { x: 2080, y: 440, w: 100, h: 100 },

  // --- STORAGE & CARGO (MID-RIGHT) ---
  // Central forklift
  { x: 2470, y: 760, w: 160, h: 170 },
  // Top cargo crates
  { x: 2300, y: 620, w: 140, h: 140 },
  { x: 2650, y: 620, w: 120, h: 130 },
  // Right wall fuel canister / barrels
  { x: 2760, y: 710, w: 100, h: 140 },
  // Bottom cargo crates
  { x: 2700, y: 880, w: 160, h: 130 },
  { x: 2310, y: 930, w: 150, h: 130 },

  // --- COMMAND & TECH (BOTTOM-RIGHT) ---
  // Central Holographic Command Table with chairs
  { x: 2130, y: 1480, w: 280, h: 180 },
  // Left wall server racks
  { x: 1960, y: 1270, w: 80, h: 190 },
  // Right wall server racks
  { x: 2490, y: 1270, w: 80, h: 190 },
  // Top wall display console
  { x: 2140, y: 1210, w: 260, h: 110 },
  // Left terminal workstation
  { x: 1900, y: 1510, w: 100, h: 160 },
  // Right terminal workstation
  { x: 2500, y: 1550, w: 120, h: 150 },

  // --- DEVELOPER WORKSTATION LAB (BOTTOM-CENTER) ---
  // Multi-monitor Developer Desks with chairs
  { x: 960, y: 1520, w: 430, h: 160 },
  // Left developer workstation
  { x: 880, y: 1640, w: 100, h: 120 },
  // Right developer workstation
  { x: 1360, y: 1650, w: 100, h: 120 },
  // Top coding screen / whiteboard
  { x: 970, y: 1370, w: 360, h: 90 },

  // --- MAFIA LAIR / DARK ROOM (BOTTOM-LEFT) ---
  // Top altar & neon skull gate
  { x: 360, y: 1030, w: 160, h: 130 },
  // Left cobweb desk & terminal
  { x: 160, y: 1130, w: 120, h: 130 },
  // Left crates & pumpkins
  { x: 150, y: 1390, w: 100, h: 90 },
  // Right bookcase & pumpkin crates
  { x: 550, y: 1140, w: 110, h: 120 },
  // Bottom-right crates
  { x: 570, y: 1400, w: 110, h: 110 },
];

/**
 * Returns true if a point (px, py) is inside an octagonal room floor
 */
export function isInsideOctagon(px: number, py: number, oct: RoomOctagon): boolean {
  if (px < oct.x1 || px > oct.x2 || py < oct.y1 || py > oct.y2) return false;
  if ((px - oct.x1) + (py - oct.y1) < oct.c) return false; // Top-Left cut
  if ((oct.x2 - px) + (py - oct.y1) < oct.c) return false; // Top-Right cut
  if ((px - oct.x1) + (oct.y2 - py) < oct.c) return false; // Bottom-Left cut
  if ((oct.x2 - px) + (oct.y2 - py) < oct.c) return false; // Bottom-Right cut
  return true;
}

/**
 * Returns true if (px, py) is on the walkable floor of any room or corridor
 */
export function isPointOnFloor(px: number, py: number): boolean {
  return true; // Walls removed: anywhere is considered floor
}

/**
 * Returns true if the bounding box overlaps any obstacle on the floor
 */
export function isOverlappingObstacle(x: number, y: number, w: number, h: number): boolean {
  for (let i = 0; i < MAP_OBSTACLES.length; i++) {
    const obs = MAP_OBSTACLES[i];
    if (
      x < obs.x + obs.w &&
      x + w > obs.x &&
      y < obs.y + obs.h &&
      y + h > obs.y
    ) {
      return true;
    }
  }
  return false;
}

// Keep export for backwards compatibility
export const MAP_WALLS: Rect[] = [];
export const ALL_COLLIDERS: Rect[] = MAP_OBSTACLES;
