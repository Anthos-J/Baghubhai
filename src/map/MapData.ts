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

export const WORLD_WIDTH = 2000;
export const WORLD_HEIGHT = 1500;

export const MAP_ROOMS: RoomData[] = [
  { id: 'central_hub', name: 'CENTRAL HUB', x: 800, y: 550, w: 400, h: 400, color: '#333333' },
  { id: 'auth_lab', name: 'AUTH LAB', x: 200, y: 200, w: 300, h: 300, color: '#00F0FF' },
  { id: 'database_room', name: 'DATABASE ROOM', x: 1500, y: 200, w: 300, h: 300, color: '#FF003C' },
  { id: 'utilities_lab', name: 'UTILITIES LAB', x: 200, y: 1000, w: 300, h: 300, color: '#00FF00' },
  { id: 'payment_lab', name: 'PAYMENT LAB', x: 1500, y: 1000, w: 300, h: 300, color: '#FFA500' },
  { id: 'mainframe', name: 'MAINFRAME', x: 850, y: 100, w: 300, h: 300, color: '#8A2BE2' },
];

export const EMERGENCY_TERMINAL: RoomData = {
  id: 'emergency_terminal',
  name: 'EMERGENCY TERMINAL',
  x: 950,
  y: 700,
  w: 100,
  h: 100,
  color: '#FFB800'
};

// Simple walls (outer bounds for now)
export const MAP_WALLS: Rect[] = [
  { x: 0, y: 0, w: WORLD_WIDTH, h: 50 }, // Top
  { x: 0, y: WORLD_HEIGHT - 50, w: WORLD_WIDTH, h: 50 }, // Bottom
  { x: 0, y: 0, w: 50, h: WORLD_HEIGHT }, // Left
  { x: WORLD_WIDTH - 50, y: 0, w: 50, h: WORLD_HEIGHT }, // Right
];
