import { MAP_ROOMS, EMERGENCY_TERMINAL, Rect } from './MapData';

export function getInteractableRoom(playerX: number, playerY: number): string | null {
  // Check Emergency Terminal first (specific interaction zone)
  if (
    playerX >= EMERGENCY_TERMINAL.x &&
    playerX <= EMERGENCY_TERMINAL.x + EMERGENCY_TERMINAL.w &&
    playerY >= EMERGENCY_TERMINAL.y &&
    playerY <= EMERGENCY_TERMINAL.y + EMERGENCY_TERMINAL.h
  ) {
    return 'EMERGENCY_TERMINAL';
  }

  // Check general room zones
  for (const room of MAP_ROOMS) {
    if (
      playerX >= room.x &&
      playerX <= room.x + room.w &&
      playerY >= room.y &&
      playerY <= room.y + room.h
    ) {
      return room.name;
    }
  }

  return null;
}
