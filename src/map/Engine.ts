import { drawMap } from './MapRenderer';
import { drawPlayers, PlayerRenderInfo } from './PlayerRenderer';
import { MovementController } from './Movement';
import { checkCollision } from './Collision';
import { Camera } from './Camera';
import { Player } from '../types/game';
import { ALL_COLLIDERS } from './MapData';
import { getInteractableRoom } from './RoomZones';
import { PlayerAnimationState } from './SpriteManager';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private movement: MovementController;
  private camera: Camera;
  private animationFrameId: number = 0;
  private lastTime: number = 0;
  private totalTime: number = 0;
  
  public isFrozen: boolean = false;
  
  // Game state passed from React
  private players: Player[] = [];
  private localPlayerId: string = '';
  private currentInteractableRoom: string | null = null;

  // Animation and state tracking
  private playerStates: Map<string, PlayerRenderInfo> = new Map();
  private lastFacing: Map<string, 'left' | 'right'> = new Map();
  private prevPositions: Map<string, { x: number; y: number }> = new Map();

  // Client-side interpolation targets for remote players (set by GameCanvas on each broadcast)
  private remoteTargets: Map<string, { x: number; y: number; direction: Player['direction'] }> = new Map();

  // Persistent render positions for remote players — NEVER reset by React's updateState.
  // This is what actually gets lerped 60fps and drawn. Immune to store resets.
  private remoteRenderPos: Map<string, { x: number; y: number }> = new Map();
  
  // Callbacks to sync state back to React/Zustand
  public onLocalPlayerMove?: (x: number, y: number, direction: Player['direction']) => void;
  public onInteractableRoomChange?: (room: string | null) => void;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error("Could not get 2D context");
    this.ctx = context;
    
    this.movement = new MovementController();
    this.camera = new Camera();
  }

  public updateState(players: Player[], localPlayerId: string) {
    this.players = players;
    this.localPlayerId = localPlayerId;
  }

  /**
   * Called by GameCanvas whenever a Supabase broadcast arrives for a remote player.
   * Stores the authoritative position as an interpolation TARGET — the engine lerps
   * toward this each frame so movement is smooth at 60fps instead of snapping at 10Hz.
   */
  public setRemoteTarget(playerId: string, x: number, y: number, direction: Player['direction']) {
    this.remoteTargets.set(playerId, { x, y, direction });
  }

  public start() {
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  public stop() {
    cancelAnimationFrame(this.animationFrameId);
    this.movement.cleanup();
  }

  private loop = (currentTime: number) => {
    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.draw();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private update(deltaTime: number) {
    this.totalTime += deltaTime;

    const localPlayer = this.players.find(p => p.id === this.localPlayerId);
    if (!localPlayer || this.isFrozen) return;

    const { vx, vy, direction } = this.movement.getVelocity();
    const isMoving = vx !== 0 || vy !== 0;

    // Track facing direction (right or left)
    let localFacing = this.lastFacing.get(this.localPlayerId) ?? (localPlayer.direction === 'left' ? 'left' : 'right');
    if (vx > 0) {
      localFacing = 'right';
    } else if (vx < 0) {
      localFacing = 'left';
    }
    this.lastFacing.set(this.localPlayerId, localFacing);

    // Determine local animation state based on user requirements:
    // Moving right -> 'run_right' (Color Player R)
    // Moving left -> 'run_left' (Color Player L)
    // Stop after moving right -> 'stand_right' (Color Player 1)
    // Stop after moving left -> 'stand_left' (Color Player 1L)
    let localAnimState: PlayerAnimationState;
    if (isMoving) {
      localAnimState = localFacing === 'right' ? 'run_right' : 'run_left';
    } else {
      localAnimState = localFacing === 'right' ? 'stand_right' : 'stand_left';
    }

    this.playerStates.set(this.localPlayerId, {
      state: localAnimState,
      isMoving
    });

    if (isMoving) {
      let newX = localPlayer.x + vx * deltaTime;
      let newY = localPlayer.y + vy * deltaTime;
      
      // Handle collision logic against walls and obstacles using the feet-only hitbox
      if (localPlayer.alive) {
        if (!checkCollision(newX, localPlayer.y, ALL_COLLIDERS)) {
          localPlayer.x = newX;
        }
        if (!checkCollision(localPlayer.x, newY, ALL_COLLIDERS)) {
          localPlayer.y = newY;
        }
      } else {
        // Ghost mode - walk through walls
        localPlayer.x = newX;
        localPlayer.y = newY;
      }
      
      if (direction) {
        localPlayer.direction = direction;
      }

      // Notify React state of movement
      if (this.onLocalPlayerMove) {
        this.onLocalPlayerMove(localPlayer.x, localPlayer.y, localPlayer.direction);
      }

      // Check interaction zones ONLY if alive
      if (localPlayer.alive) {
        const newRoom = getInteractableRoom(localPlayer.x, localPlayer.y);
        if (newRoom !== this.currentInteractableRoom) {
          this.currentInteractableRoom = newRoom;
          if (this.onInteractableRoomChange) {
            this.onInteractableRoomChange(newRoom);
          }
        }
      } else if (this.currentInteractableRoom !== null) {
        // clear if died in room
        this.currentInteractableRoom = null;
        if (this.onInteractableRoomChange) {
          this.onInteractableRoomChange(null);
        }
      }
    }

    // ── Client-side interpolation for remote players ──
    // remoteRenderPos is the key: it's a persistent position that only lives in the engine
    // and is NEVER overwritten by React's updateState. This means the lerp always produces
    // a real non-zero dx each frame → remoteIsMoving = true → correct directional sprite.
    for (const player of this.players) {
      if (player.id === this.localPlayerId) continue;

      const target = this.remoteTargets.get(player.id);

      if (!target) {
        // First frame for this player — seed render pos from store, skip lerp
        this.remoteRenderPos.set(player.id, { x: player.x, y: player.y });
        this.remoteTargets.set(player.id, { x: player.x, y: player.y, direction: player.direction });
        this.lastFacing.set(player.id, player.direction === 'left' ? 'left' : 'right');
        this.playerStates.set(player.id, { state: 'stand_right', isMoving: false });
        continue;
      }

      // Get the PERSISTENT render position (never reset by React)
      const renderPos = this.remoteRenderPos.get(player.id) ?? { x: player.x, y: player.y };

      const prevX = renderPos.x;
      const prevY = renderPos.y;

      // Lerp the render position toward the authoritative target
      const lerpFactor = Math.min(1, 8 * deltaTime);
      const newRenderX = prevX + (target.x - prevX) * lerpFactor;
      const newRenderY = prevY + (target.y - prevY) * lerpFactor;

      // Persist the smoothed render position for next frame
      this.remoteRenderPos.set(player.id, { x: newRenderX, y: newRenderY });

      // Detect movement from the per-frame render delta (runs at 60fps — always smooth)
      const dx = newRenderX - prevX;
      const dy = newRenderY - prevY;
      const remoteIsMoving = Math.hypot(dx, dy) > 0.05;

      // Update facing direction from direction of travel this frame
      let remoteFacing = this.lastFacing.get(player.id) ?? 'right';
      if (dx > 0.05) remoteFacing = 'right';
      else if (dx < -0.05) remoteFacing = 'left';
      this.lastFacing.set(player.id, remoteFacing);

      const remoteState: PlayerAnimationState = remoteIsMoving
        ? (remoteFacing === 'right' ? 'run_right' : 'run_left')
        : (remoteFacing === 'right' ? 'stand_right' : 'stand_left');

      this.playerStates.set(player.id, { state: remoteState, isMoving: remoteIsMoving });

      // Write smooth render coords onto player object so drawPlayers uses them this frame.
      // (player is a fresh deep-copy from React; overwriting here is safe — next frame
      //  updateState brings a new copy, but remoteRenderPos survives across frames.)
      player.x = newRenderX;
      player.y = newRenderY;
    }

    this.camera.update(localPlayer.x, localPlayer.y, deltaTime);
  }

  private draw() {
    // 1. Draw Map
    drawMap(this.ctx, this.camera.x, this.camera.y, this.canvas.width, this.canvas.height);
    // 2. Draw Players
    drawPlayers(
      this.ctx,
      this.players,
      this.camera.x,
      this.camera.y,
      this.canvas.width,
      this.canvas.height,
      this.localPlayerId,
      this.playerStates,
      this.totalTime
    );

    // 3. Draw Player Vision Lighting / Darkness Radius (Fog of War)
    const localPlayer = this.players.find((p) => p.id === this.localPlayerId);
    if (localPlayer) {
      this.drawVisionLighting(localPlayer);
    }
  }

  /**
   * Draws realistic Among Us style circular player vision radius.
   * Only the area around the player is illuminated, with deep dark shadows across the rest of the map.
   */
  private drawVisionLighting(localPlayer: Player) {
    const ctx = this.ctx;
    const width = this.canvas.width;
    const height = this.canvas.height;

    // Calculate local player's screen center coordinates
    const screenX = localPlayer.x - this.camera.x + width / 2;
    const screenY = localPlayer.y - this.camera.y + height / 2;

    const isGhost = !localPlayer.alive;
    const isMafia = localPlayer.role === 'MAFIA';

    // Generously increased vision radius around the player
    const innerRadius = isGhost ? 600 : isMafia ? 420 : 340;
    const outerRadius = isGhost ? 1000 : isMafia ? 800 : 680;
    const shadowOpacity = isGhost ? 0.35 : 0.94;

    ctx.save();

    // Create smooth radial gradient for vision cone falloff
    const gradient = ctx.createRadialGradient(
      screenX,
      screenY,
      innerRadius,
      screenX,
      screenY,
      outerRadius
    );

    gradient.addColorStop(0, 'rgba(4, 7, 14, 0)');
    gradient.addColorStop(0.35, 'rgba(4, 7, 14, 0.15)');
    gradient.addColorStop(0.7, 'rgba(4, 7, 14, 0.6)');
    gradient.addColorStop(0.92, `rgba(4, 7, 14, ${shadowOpacity * 0.92})`);
    gradient.addColorStop(1, `rgba(4, 7, 14, ${shadowOpacity})`);

    // Fill screen with darkness & illuminated player vision circle
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Subtle edge vignette
    const vignette = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.min(width, height) * 0.55,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.85
    );
    vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, width, height);

    ctx.restore();
  }
}
