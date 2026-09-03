import { isPointOnFloor, isOverlappingObstacle, Rect } from './MapData';

// Top-down feet-only collision hitbox
// Positioned at the base/feet of the 64px avatar sprite so the avatar's body/head
// can overlap the depth of tables and walls naturally without hitting invisible barriers.
export const PLAYER_HITBOX = {
  w: 16,
  h: 10,
  offsetY: 24 // Positioned right at the feet / shoes
};

/**
 * Validates if the player's feet box is entirely on the walkable floor and not inside any obstacle.
 * The character can ONLY run on the floor. Walls and out-of-bounds cannot be passed.
 * The obstacles placed on the floor (tables, desks, forklift, beds, etc.) are the objects that obstruct.
 */
export function canWalkTo(newX: number, newY: number): boolean {
  const feetX = newX - PLAYER_HITBOX.w / 2;
  const feetY = newY + PLAYER_HITBOX.offsetY - PLAYER_HITBOX.h / 2;
  const w = PLAYER_HITBOX.w;
  const h = PLAYER_HITBOX.h;

  // 1. All 4 corners of the feet hitbox must be firmly on the walkable floor
  if (
    !isPointOnFloor(feetX, feetY) ||
    !isPointOnFloor(feetX + w, feetY) ||
    !isPointOnFloor(feetX, feetY + h) ||
    !isPointOnFloor(feetX + w, feetY + h)
  ) {
    return false; // Stepped onto a wall or out of bounds
  }

  // 2. Obstacles on the floor obstruct movement
  if (isOverlappingObstacle(feetX, feetY, w, h)) {
    return false; // Hit a table, desk, bed, forklift, etc.
  }

  return true;
}

/**
 * Collision check function: returns true if movement is BLOCKED.
 */
export function checkCollision(newX: number, newY: number, _colliders?: Rect[]): boolean {
  return !canWalkTo(newX, newY);
}

// Backward compatibility stubs
export function initCollisionMask(_img: HTMLImageElement) {}
export function isOutsideShip(_worldX: number, _worldY: number): boolean {
  return false;
}
