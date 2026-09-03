import { MAP_ROOMS, MAP_WALLS, EMERGENCY_TERMINAL, WORLD_WIDTH, WORLD_HEIGHT } from './MapData';

export function drawMap(ctx: CanvasRenderingContext2D, cameraX: number, cameraY: number, canvasWidth: number, canvasHeight: number) {
  // Clear background
  ctx.fillStyle = '#0a0a0c'; // Deep dark background
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Apply camera translation
  ctx.save();
  ctx.translate(-cameraX + canvasWidth / 2, -cameraY + canvasHeight / 2);

  // Draw Grid/Floor
  ctx.strokeStyle = '#1a1a24';
  ctx.lineWidth = 1;
  const gridSize = 50;
  for (let x = 0; x <= WORLD_WIDTH; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, WORLD_HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y <= WORLD_HEIGHT; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WORLD_WIDTH, y);
    ctx.stroke();
  }

  // Draw Rooms
  for (const room of MAP_ROOMS) {
    // Room background
    ctx.fillStyle = '#111';
    ctx.fillRect(room.x, room.y, room.w, room.h);
    
    // Room Border (Neon)
    ctx.strokeStyle = room.color;
    ctx.lineWidth = 4;
    ctx.strokeRect(room.x, room.y, room.w, room.h);

    // Room Label
    ctx.fillStyle = room.color;
    ctx.font = '24px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(room.name, room.x + room.w / 2, room.y + room.h / 2);
  }

  // Draw Emergency Terminal
  ctx.fillStyle = '#221100';
  ctx.fillRect(EMERGENCY_TERMINAL.x, EMERGENCY_TERMINAL.y, EMERGENCY_TERMINAL.w, EMERGENCY_TERMINAL.h);
  ctx.strokeStyle = EMERGENCY_TERMINAL.color;
  ctx.lineWidth = 4;
  ctx.strokeRect(EMERGENCY_TERMINAL.x, EMERGENCY_TERMINAL.y, EMERGENCY_TERMINAL.w, EMERGENCY_TERMINAL.h);
  ctx.fillStyle = EMERGENCY_TERMINAL.color;
  ctx.font = 'bold 20px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('EMERGENCY', EMERGENCY_TERMINAL.x + EMERGENCY_TERMINAL.w / 2, EMERGENCY_TERMINAL.y + EMERGENCY_TERMINAL.h / 2);

  // Draw Walls (Outer bounds)
  ctx.fillStyle = '#222';
  for (const wall of MAP_WALLS) {
    ctx.fillRect(wall.x, wall.y, wall.w, wall.h);
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 2;
    ctx.strokeRect(wall.x, wall.y, wall.w, wall.h);
  }

  ctx.restore();
}
