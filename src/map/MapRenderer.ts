import { WORLD_WIDTH, WORLD_HEIGHT } from './MapData';
import { initCollisionMask } from './Collision';

let mapImage: HTMLImageElement | null = null;
let mapLoaded = false;

function getMapImage(): HTMLImageElement {
  if (!mapImage && typeof window !== 'undefined') {
    mapImage = new Image();
    mapImage.src = '/assets/Map.png';
    mapImage.onload = () => {
      mapLoaded = true;
      initCollisionMask(mapImage!);
    };
    mapImage.onerror = () => {
      console.error('Failed to load /assets/Map.png');
    };
  }
  return mapImage!;
}

// Generate static background stars for the deep space void
const STAR_COUNT = 150;
interface Star {
  x: number;
  y: number;
  r: number;
  alpha: number;
}
const stars: Star[] = [];

function initStars() {
  if (stars.length > 0) return;
  for (let i = 0; i < STAR_COUNT; i++) {
    stars.push({
      x: Math.random() * (WORLD_WIDTH + 800) - 400,
      y: Math.random() * (WORLD_HEIGHT + 800) - 400,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.7 + 0.3
    });
  }
}

export function drawMap(
  ctx: CanvasRenderingContext2D,
  cameraX: number,
  cameraY: number,
  canvasWidth: number,
  canvasHeight: number
) {
  initStars();
  const img = getMapImage();

  // Clear canvas background with deep space dark
  ctx.fillStyle = '#04050a';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Apply camera translation
  ctx.save();
  ctx.translate(-cameraX + canvasWidth / 2, -cameraY + canvasHeight / 2);

  // 1. Draw Deep Space Stars in the void outside the spaceship
  ctx.save();
  for (const s of stars) {
    ctx.fillStyle = `rgba(200, 220, 255, ${s.alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 2. Draw Scaled Map Image
  if (img && (img.complete || mapLoaded) && img.naturalWidth > 0) {
    initCollisionMask(img);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, WORLD_WIDTH, WORLD_HEIGHT);
  } else {
    // Loading placeholder
    ctx.fillStyle = '#11131c';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);
    ctx.fillStyle = '#00F0FF';
    ctx.font = '28px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('LOADING SPACESHIP MAP...', WORLD_WIDTH / 2, WORLD_HEIGHT / 2);
  }

  ctx.restore();
}
