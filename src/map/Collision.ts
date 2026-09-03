import { Rect } from './MapData';

export function checkCollision(newX: number, newY: number, size: number, walls: Rect[]): boolean {
  // Player bounds (simplified as a square box)
  const playerRect: Rect = {
    x: newX - size / 2,
    y: newY - size / 2,
    w: size,
    h: size
  };

  for (const wall of walls) {
    if (
      playerRect.x < wall.x + wall.w &&
      playerRect.x + playerRect.w > wall.x &&
      playerRect.y < wall.y + wall.h &&
      playerRect.y + playerRect.h > wall.y
    ) {
      return true; // Collision detected
    }
  }

  return false;
}
