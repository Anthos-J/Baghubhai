/**
 * roomMapping.ts
 *
 * Deterministic, read-only mapping between physical map rooms and editor file IDs.
 *
 * Spatial room IDs come from src/map/MapData.ts (MAP_ROOMS[i].id).
 * Display names come from RoomZones.ts which currently returns room.name instead of room.id.
 * Both variants are mapped here so the RoomEditorModal works regardless of which form
 * the store provides.
 *
 * File IDs and task IDs are authoritative in predefinedProject.ts — this file only
 * references them as strings and never duplicates code content.
 */

export interface RoomMapping {
  /** The fileId from predefinedProject.ts (e.g. 'file-auth') */
  fileId: string;
  /** The taskId from testRunner.ts TASK_VALIDATORS (e.g. 'task-auth') */
  taskId: string;
  /** Human-readable label shown in the modal header */
  roomLabel: string;
}

/**
 * Primary lookup by MapData room id (e.g. 'auth_lab').
 */
const ROOM_ID_MAP: Record<string, RoomMapping> = {
  library: { fileId: 'file-auth',     taskId: 'task-auth',     roomLabel: 'LIBRARY & ARCHIVES' },
  medbay:  { fileId: 'file-database', taskId: 'task-database', roomLabel: 'MEDICAL BAY' },
  storage: { fileId: 'file-utils',    taskId: 'task-utils',    roomLabel: 'STORAGE & CARGO' },
  dev_lab: { fileId: 'file-payment',  taskId: 'task-payment',  roomLabel: 'DEV WORKSTATIONS' },
  command: { fileId: 'file-app',      taskId: 'task-app',      roomLabel: 'COMMAND & TECH' },
};

/**
 * Secondary lookup by display name as currently returned by RoomZones.ts
 * (room.name instead of room.id).  Kept separate so the fix is isolated here
 * and does not require changing any P1 files.
 */
const ROOM_NAME_MAP: Record<string, RoomMapping> = {
  'LIBRARY & ARCHIVES': ROOM_ID_MAP['library'],
  'MEDICAL BAY':        ROOM_ID_MAP['medbay'],
  'STORAGE & CARGO':    ROOM_ID_MAP['storage'],
  'DEV WORKSTATIONS':   ROOM_ID_MAP['dev_lab'],
  'COMMAND & TECH':     ROOM_ID_MAP['command'],
};

/**
 * Returns the RoomMapping for the given room identifier, or null if the room
 * is not a coding terminal (e.g. 'CENTRAL HUB', 'EMERGENCY_TERMINAL', unknown).
 *
 * Accepts both:
 *   - The MapData room id  (e.g. 'auth_lab')
 *   - The MapData room name as returned by RoomZones.ts (e.g. 'AUTH LAB')
 */
export function getRoomMapping(roomId: string): RoomMapping | null {
  return ROOM_ID_MAP[roomId] ?? ROOM_NAME_MAP[roomId] ?? null;
}

/**
 * Convenience helper: returns the editor fileId for a given room, or null.
 */
export function getFileIdForRoom(roomId: string): string | null {
  return getRoomMapping(roomId)?.fileId ?? null;
}

/**
 * Convenience helper: returns the taskId for a given room, or null.
 */
export function getTaskIdForRoom(roomId: string): string | null {
  return getRoomMapping(roomId)?.taskId ?? null;
}

/**
 * Returns true when the room has an associated coding terminal.
 * CENTRAL HUB, EMERGENCY_TERMINAL, and unknown rooms return false.
 */
export function isCodingRoom(roomId: string): boolean {
  return getRoomMapping(roomId) !== null;
}
