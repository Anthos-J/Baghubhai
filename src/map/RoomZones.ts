import { MAP_ROOMS, EMERGENCY_TERMINAL } from './MapData';

export function getInteractableRoom(playerX: number, playerY: number): string | null {
  // 1. Prioritize Emergency Terminal check first (inside Central Hub)
  // Check both expanded bounding box and distance to terminal center (1000, 750)
  const termCenterX = EMERGENCY_TERMINAL.x + EMERGENCY_TERMINAL.w / 2;
  const termCenterY = EMERGENCY_TERMINAL.y + EMERGENCY_TERMINAL.h / 2;
  const distSq = (playerX - termCenterX) ** 2 + (playerY - termCenterY) ** 2;

  if (
    distSq <= 120 * 120 ||
    (playerX >= EMERGENCY_TERMINAL.x - 30 &&
      playerX <= EMERGENCY_TERMINAL.x + EMERGENCY_TERMINAL.w + 30 &&
      playerY >= EMERGENCY_TERMINAL.y - 30 &&
      playerY <= EMERGENCY_TERMINAL.y + EMERGENCY_TERMINAL.h + 30)
  ) {
    return 'EMERGENCY_TERMINAL';
  }

  // 2. Check room interaction zones
  for (const room of MAP_ROOMS) {
    if (
      playerX >= room.x &&
      playerX <= room.x + room.w &&
      playerY >= room.y &&
      playerY <= room.y + room.h
    ) {
      return room.name; // Use ID for real app, Name for display mock
    }
  }

  return null;
}
