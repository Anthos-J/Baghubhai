import { Player } from '../types/game';
import { spriteManager, PlayerAnimationState, resolvePlayerColor } from './SpriteManager';

export interface PlayerRenderInfo {
  state: PlayerAnimationState;
  isMoving: boolean;
}

export function drawPlayers(
  ctx: CanvasRenderingContext2D,
  players: Player[],
  cameraX: number,
  cameraY: number,
  canvasWidth: number,
  canvasHeight: number,
  localPlayerId: string = '',
  playerStates?: Map<string, PlayerRenderInfo>,
  time: number = 0
) {
  ctx.save();
  ctx.translate(-cameraX + canvasWidth / 2, -cameraY + canvasHeight / 2);

  const TARGET_HEIGHT = 64;

  for (const player of players) {
    if (!player.connected) continue;

    const renderInfo = playerStates?.get(player.id) ?? {
      state: player.direction === 'left' ? 'stand_left' : 'stand_right',
      isMoving: false
    };

    const isLocal = player.id === localPlayerId;
    const isAlive = player.alive;

    // Running animation micro-bob & tilt
    let offsetY = 0;
    let rotation = 0;

    if (renderInfo.isMoving) {
      offsetY = -Math.abs(Math.sin(time * 14)) * 5;
      rotation = Math.sin(time * 14) * 0.05;
    } else if (!isAlive) {
      // Gentle ghost floating bob
      offsetY = Math.sin(time * 3) * 6;
    }

    ctx.save();

    // Eliminated / Ghost transparency
    if (!isAlive) {
      ctx.globalAlpha = 0.45;
    }

    // 1. Draw soft shadow under feet
    if (isAlive) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(player.x, player.y + TARGET_HEIGHT / 2 - 4, 18, 6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Draw Player Sprite
    const sprite = spriteManager.getSprite(player.color, renderInfo.state);

    ctx.save();
    ctx.translate(player.x, player.y + offsetY);
    if (rotation !== 0) {
      ctx.rotate(rotation);
    }

    if (sprite && sprite.complete && sprite.naturalWidth > 0) {
      const aspect = sprite.naturalWidth / sprite.naturalHeight;
      const drawWidth = TARGET_HEIGHT * aspect;
      const drawHeight = TARGET_HEIGHT;

      ctx.drawImage(
        sprite,
        -drawWidth / 2,
        -drawHeight / 2,
        drawWidth,
        drawHeight
      );
    } else {
      // Fallback while image loads
      const fallbackColor = player.color || '#00F0FF';
      ctx.fillStyle = isAlive ? fallbackColor : 'rgba(150, 150, 150, 0.5)';
      ctx.fillRect(-15, -TARGET_HEIGHT / 2, 30, TARGET_HEIGHT);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(-15, -TARGET_HEIGHT / 2, 30, TARGET_HEIGHT);
    }

    ctx.restore(); // Restore sprite transform

    // 3. Local Player "YOU" Marker
    if (isLocal && isAlive) {
      ctx.save();
      const markerY = player.y + offsetY - TARGET_HEIGHT / 2 - 28;
      // Glowing downward triangle
      ctx.fillStyle = '#00F0FF';
      ctx.shadowColor = '#00F0FF';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(player.x, markerY + 6);
      ctx.lineTo(player.x - 5, markerY);
      ctx.lineTo(player.x + 5, markerY);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 4. Username pill badge
    ctx.save();
    ctx.font = 'bold 11px monospace';
    const textWidth = ctx.measureText(player.username).width;
    const badgeW = textWidth + 14;
    const badgeH = 18;
    const badgeX = player.x - badgeW / 2;
    const badgeY = player.y + offsetY - TARGET_HEIGHT / 2 - 22;

    // Dark pill background
    ctx.fillStyle = 'rgba(10, 10, 15, 0.75)';
    ctx.strokeStyle = isLocal ? '#00F0FF' : 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4);
    ctx.fill();
    ctx.stroke();

    // Username text
    ctx.fillStyle = isLocal ? '#00F0FF' : '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(player.username, player.x, badgeY + badgeH / 2);
    ctx.restore();

    ctx.restore(); // Restore player save
  }

  ctx.restore();
}
