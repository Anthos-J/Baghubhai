export const VALID_PLAYER_COLORS = [
  'Blue',
  'Cyan',
  'Green',
  'Magenta',
  'Orange',
  'Red',
  'Violet',
  'White',
  'Yellow'
] as const;

export type PlayerColorName = typeof VALID_PLAYER_COLORS[number];
export type PlayerAnimationState = 'stand_right' | 'stand_left' | 'run_right' | 'run_left';

const COLOR_HEX_MAP: Record<string, PlayerColorName> = {
  '#00f0ff': 'Cyan',
  '#00ffff': 'Cyan',
  '#06b6d4': 'Cyan',
  '#22d3ee': 'Cyan',
  '#ff003c': 'Red',
  '#ff0000': 'Red',
  '#ef4444': 'Red',
  '#dc2626': 'Red',
  '#00ff00': 'Green',
  '#00ff66': 'Green',
  '#22c55e': 'Green',
  '#10b981': 'Green',
  '#8a2be2': 'Violet',
  '#a855f7': 'Violet',
  '#7c3aed': 'Violet',
  '#9333ea': 'Violet',
  '#ffa500': 'Orange',
  '#f97316': 'Orange',
  '#ea580c': 'Orange',
  '#0066ff': 'Blue',
  '#0000ff': 'Blue',
  '#3b82f6': 'Blue',
  '#2563eb': 'Blue',
  '#ff00ff': 'Magenta',
  '#ec4899': 'Magenta',
  '#f43f5e': 'Magenta',
  '#ffffff': 'White',
  '#ffb800': 'Yellow',
  '#ffff00': 'Yellow',
  '#eab308': 'Yellow',
};

const COLOR_RGB_PALETTE: { name: PlayerColorName; r: number; g: number; b: number }[] = [
  { name: 'Blue', r: 0, g: 102, b: 255 },
  { name: 'Cyan', r: 0, g: 240, b: 255 },
  { name: 'Green', r: 0, g: 255, b: 102 },
  { name: 'Magenta', r: 255, g: 0, b: 255 },
  { name: 'Orange', r: 255, g: 165, b: 0 },
  { name: 'Red', r: 255, g: 0, b: 60 },
  { name: 'Violet', r: 138, g: 43, b: 226 },
  { name: 'White', r: 255, g: 255, b: 255 },
  { name: 'Yellow', r: 255, g: 215, b: 0 },
];

/**
 * Resolves a player color (color name or hex code) to one of the 9 asset color names.
 */
export function resolvePlayerColor(color: string): PlayerColorName {
  if (!color) return 'Cyan';

  const clean = color.trim().toLowerCase();

  // 1. Direct name match (e.g. 'cyan', 'blue')
  const directMatch = VALID_PLAYER_COLORS.find(c => c.toLowerCase() === clean);
  if (directMatch) return directMatch;

  // 2. Known hex match
  if (COLOR_HEX_MAP[clean]) {
    return COLOR_HEX_MAP[clean];
  }

  // 3. Fallback: Parse hex and find nearest palette color by Euclidean distance
  if (clean.startsWith('#')) {
    let hex = clean.slice(1);
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);

      let closest: PlayerColorName = 'Cyan';
      let minDist = Infinity;

      for (const item of COLOR_RGB_PALETTE) {
        const dist = Math.hypot(item.r - r, item.g - g, item.b - b);
        if (dist < minDist) {
          minDist = dist;
          closest = item.name;
        }
      }
      return closest;
    }
  }

  return 'Cyan';
}

/**
 * Returns the profile picture (pfp) avatar asset URL named '{Color}.png'
 */
export function getPlayerAvatarUrl(color: string): string {
  const colorName = resolvePlayerColor(color);
  return encodeURI(`/assets/${colorName}.png`);
}

/**
 * Returns the asset filename suffix for a given animation state:
 * - stand_right -> 'Player 1'
 * - stand_left  -> 'Player 1L'
 * - run_right   -> 'Player R'
 * - run_left    -> 'Player L'
 */
export function getStateSuffix(state: PlayerAnimationState): string {
  switch (state) {
    case 'stand_right':
      return 'Player 1';
    case 'stand_left':
      return 'Player 1L';
    case 'run_right':
      return 'Player R';
    case 'run_left':
      return 'Player L';
  }
}

class SpriteManager {
  private cache: Map<string, HTMLImageElement> = new Map();
  private loadedMap: Map<string, boolean> = new Map();
  private initialized = false;

  constructor() {
    this.preloadAll();
  }

  /**
   * Preload all 36 player sprites into memory.
   */
  public preloadAll() {
    if (this.initialized || typeof window === 'undefined') return;
    this.initialized = true;

    const states: PlayerAnimationState[] = ['stand_right', 'stand_left', 'run_right', 'run_left'];

    for (const color of VALID_PLAYER_COLORS) {
      for (const state of states) {
        const suffix = getStateSuffix(state);
        const fileName = `${color} ${suffix}.png`;
        const path = encodeURI(`/assets/${fileName}`);
        const key = `${color}_${state}`;

        const img = new Image();
        img.src = path;
        img.onload = () => {
          this.loadedMap.set(key, true);
        };
        img.onerror = () => {
          console.warn(`Failed to load player sprite: ${path}`);
          this.loadedMap.set(key, false);
        };
        this.cache.set(key, img);
      }
    }
  }

  /**
   * Get the sprite image for a color and animation state.
   */
  public getSprite(colorInput: string, state: PlayerAnimationState): HTMLImageElement | null {
    const color = resolvePlayerColor(colorInput);
    const key = `${color}_${state}`;
    const img = this.cache.get(key);

    if (img && img.complete && img.naturalWidth > 0) {
      return img;
    }

    // Lazy load if not cached
    if (!img && typeof window !== 'undefined') {
      const suffix = getStateSuffix(state);
      const fileName = `${color} ${suffix}.png`;
      const path = encodeURI(`/assets/${fileName}`);
      const newImg = new Image();
      newImg.src = path;
      this.cache.set(key, newImg);
      return newImg.complete && newImg.naturalWidth > 0 ? newImg : null;
    }

    return null;
  }
}

export const spriteManager = new SpriteManager();
