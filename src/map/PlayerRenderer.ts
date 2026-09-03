import { Player } from '../types/game';

export function drawPlayers(ctx: CanvasRenderingContext2D, players: Player[], cameraX: number, cameraY: number, canvasWidth: number, canvasHeight: number) {
  ctx.save();
  ctx.translate(-cameraX + canvasWidth / 2, -cameraY + canvasHeight / 2);

  const PLAYER_SIZE = 30;

  for (const player of players) {
    if (!player.connected) continue;

    // Player body
    ctx.fillStyle = player.alive ? player.color : 'rgba(150, 150, 150, 0.5)';
    ctx.fillRect(player.x - PLAYER_SIZE / 2, player.y - PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE);

    // Player border
    ctx.strokeStyle = player.alive ? '#fff' : 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(player.x - PLAYER_SIZE / 2, player.y - PLAYER_SIZE / 2, PLAYER_SIZE, PLAYER_SIZE);

    // Direction indicator
    ctx.fillStyle = '#fff';
    const indicatorSize = 8;
    let ix = player.x;
    let iy = player.y;
    
    if (player.direction === 'up') iy -= PLAYER_SIZE / 2;
    if (player.direction === 'down') iy += PLAYER_SIZE / 2;
    if (player.direction === 'left') ix -= PLAYER_SIZE / 2;
    if (player.direction === 'right') ix += PLAYER_SIZE / 2;

    ctx.beginPath();
    ctx.arc(ix, iy, indicatorSize / 2, 0, Math.PI * 2);
    ctx.fill();

    // Username
    ctx.fillStyle = '#fff';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';
    ctx.fillText(player.username, player.x, player.y - PLAYER_SIZE / 2 - 10);
  }

  ctx.restore();
}
