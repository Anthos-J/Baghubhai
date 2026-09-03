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
  
  // Game state passed from React
  private players: Player[] = [];
  private localPlayerId: string = '';
  private currentInteractableRoom: string | null = null;

  // Animation and state tracking
  private playerStates: Map<string, PlayerRenderInfo> = new Map();
  private lastFacing: Map<string, 'left' | 'right'> = new Map();
  private prevPositions: Map<string, { x: number; y: number }> = new Map();
  
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
    if (!localPlayer || !localPlayer.alive) return;

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
      if (!checkCollision(newX, localPlayer.y, ALL_COLLIDERS)) {
        localPlayer.x = newX;
      }
      if (!checkCollision(localPlayer.x, newY, ALL_COLLIDERS)) {
        localPlayer.y = newY;
      }
      
      if (direction) {
        localPlayer.direction = direction;
      }

      // Notify React state of movement
      if (this.onLocalPlayerMove) {
        this.onLocalPlayerMove(localPlayer.x, localPlayer.y, localPlayer.direction);
      }

      // Check interaction zones
      const newRoom = getInteractableRoom(localPlayer.x, localPlayer.y);
      if (newRoom !== this.currentInteractableRoom) {
        this.currentInteractableRoom = newRoom;
        if (this.onInteractableRoomChange) {
          this.onInteractableRoomChange(newRoom);
        }
      }
    }

    // Update remote / other players' animation states
    for (const player of this.players) {
      if (player.id === this.localPlayerId) continue;

      const prev = this.prevPositions.get(player.id);
      let remoteIsMoving = false;
      let remoteFacing = this.lastFacing.get(player.id) ?? (player.direction === 'left' ? 'left' : 'right');

      if (prev) {
        const dx = player.x - prev.x;
        const dy = player.y - prev.y;
        if (Math.hypot(dx, dy) > 0.5) {
          remoteIsMoving = true;
          if (dx > 0.2) remoteFacing = 'right';
          else if (dx < -0.2) remoteFacing = 'left';
        }
      }

      this.lastFacing.set(player.id, remoteFacing);
      this.prevPositions.set(player.id, { x: player.x, y: player.y });

      const remoteState: PlayerAnimationState = remoteIsMoving
        ? (remoteFacing === 'right' ? 'run_right' : 'run_left')
        : (remoteFacing === 'right' ? 'stand_right' : 'stand_left');

      this.playerStates.set(player.id, {
        state: remoteState,
        isMoving: remoteIsMoving
      });
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
  }
}
