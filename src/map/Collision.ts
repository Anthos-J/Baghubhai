import { isPointOnFloor, isOverlappingObstacle, Rect } from './MapData';

// Top-down feet-only collision hitbox
// Positioned at the base/feet of the 64px avatar sprite so the avatar's body/head
// can overlap the depth of tables and walls naturally without hitting invisible barriers.
export const PLAYER_HITBOX = {
  w: 16,
  h: 10,
  offsetY: 24 // Positioned right at the feet / shoes
};

// 1-bit ship alpha mask (1536 x 1024)
// Prevents character from ever stepping out of the ship map image into the black void
let shipMask: Uint8Array | null = null;

// Asynchronously load the precomputed ship bitmask
if (typeof window !== 'undefined') {
  fetch('/assets/ship_mask.bin')
    .then((res) => {
      if (res.ok) return res.arrayBuffer();
      throw new Error('Failed to load ship_mask.bin');
    })
    .then((buf) => {
      shipMask = new Uint8Array(buf);
    })
    .catch(() => {
      // Fallback will be handled by initCollisionMask when Map.png renders
    });
}

/**
 * Initializes the collision mask directly from the loaded Map.png image
 */
export function initCollisionMask(img: HTMLImageElement) {
  if (shipMask) return;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth || 1536;
    canvas.height = img.naturalHeight || 1024;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

    const totalBits = canvas.width * canvas.height;
    const mask = new Uint8Array(Math.ceil(totalBits / 8));
    for (let i = 0; i < totalBits; i++) {
      if (data[i * 4 + 3] > 20) {
        mask[i >> 3] |= (1 << (i & 7));
      }
    }
    shipMask = mask;
  } catch (e) {
    console.warn('initCollisionMask warning:', e);
  }
}

/**
 * Returns true if (worldX, worldY) is outside the ship / map image
 */
export function isOutsideShip(worldX: number, worldY: number): boolean {
  if (!shipMask) return false;
  const mx = Math.floor(worldX / 2);
  const my = Math.floor(worldY / 2);
  if (mx < 0 || mx >= 1536 || my < 0 || my >= 1024) return true;
  const bitIndex = my * 1536 + mx;
  return (shipMask[bitIndex >> 3] & (1 << (bitIndex & 7))) === 0;
}

/**
 * Validates if the player's feet box is entirely on the walkable floor and not inside any obstacle or out of bounds.
 */
export function canWalkTo(newX: number, newY: number): boolean {
  const feetX = newX - PLAYER_HITBOX.w / 2;
  const feetY = newY + PLAYER_HITBOX.offsetY - PLAYER_HITBOX.h / 2;
  const w = PLAYER_HITBOX.w;
  const h = PLAYER_HITBOX.h;

  // 1. MUST NEVER STEP OUTSIDE THE MAP IMAGE
  if (
    isOutsideShip(feetX, feetY) ||
    isOutsideShip(feetX + w, feetY) ||
    isOutsideShip(feetX, feetY + h) ||
    isOutsideShip(feetX + w, feetY + h)
  ) {
    return false; // Out of map image boundary!
  }

  // 2. All 4 corners of the feet hitbox must be firmly on the walkable floor zones
  if (
    !isPointOnFloor(feetX, feetY) ||
    !isPointOnFloor(feetX + w, feetY) ||
    !isPointOnFloor(feetX, feetY + h) ||
    !isPointOnFloor(feetX + w, feetY + h)
  ) {
    return false; // Stepped onto an outer wall
  }

  // 3. Obstacles on the floor obstruct movement
  if (isOverlappingObstacle(feetX, feetY, w, h)) {
    return false;
  }

  return true;
}

/**
 * Collision check function: returns true if movement is BLOCKED.
 */
export function checkCollision(newX: number, newY: number, _colliders?: Rect[]): boolean {
  return !canWalkTo(newX, newY);
}
