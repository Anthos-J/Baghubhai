import { drawMap } from './MapRenderer';
import { drawPlayers } from './PlayerRenderer';
import { MovementController } from './Movement';
import { checkCollision } from './Collision';
import { Camera } from './Camera';
import { Player } from '../types/game';
import { MAP_WALLS } from './MapData';
import { getInteractableRoom } from './RoomZones';

export class GameEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private movement: MovementController;
  private camera: Camera;
  private animationFrameId: number = 0;
  private lastTime: number = 0;
  
  public isFrozen: boolean = false;
  
  // Game state passed from React
  private players: Player[] = [];
  private localPlayerId: string = '';
  private currentInteractableRoom: string | null = null;
  
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
    const deltaTime = (currentTime - this.lastTime) / 1000;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.draw();

    this.animationFrameId = requestAnimationFrame(this.loop);
  };

  private update(deltaTime: number) {
    const localPlayer = this.players.find(p => p.id === this.localPlayerId);
    if (!localPlayer || !localPlayer.alive || this.isFrozen) return;

    const { vx, vy, direction } = this.movement.getVelocity();
    
    if (vx !== 0 || vy !== 0 || direction !== null) {
      let newX = localPlayer.x + vx * deltaTime;
      let newY = localPlayer.y + vy * deltaTime;
      
      const PLAYER_SIZE = 30;

      // Handle collision logic
      if (!checkCollision(newX, localPlayer.y, PLAYER_SIZE, MAP_WALLS)) {
        localPlayer.x = newX;
      }
      if (!checkCollision(localPlayer.x, newY, PLAYER_SIZE, MAP_WALLS)) {
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

    this.camera.update(localPlayer.x, localPlayer.y, deltaTime);
  }

  private draw() {
    // 1. Draw Map
    drawMap(this.ctx, this.camera.x, this.camera.y, this.canvas.width, this.canvas.height);
    // 2. Draw Players
    drawPlayers(this.ctx, this.players, this.camera.x, this.camera.y, this.canvas.width, this.canvas.height);
  }
}
