export class MovementController {
  public keys: { [key: string]: boolean } = {};
  public speed = 300; // pixels per second

  constructor() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = true;
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    this.keys[e.key.toLowerCase()] = false;
  };

  public getVelocity(): { vx: number; vy: number; direction: 'up' | 'down' | 'left' | 'right' | null } {
    let vx = 0;
    let vy = 0;
    let direction: 'up' | 'down' | 'left' | 'right' | null = null;

    if (this.keys['w'] || this.keys['arrowup']) { vy -= 1; direction = 'up'; }
    if (this.keys['s'] || this.keys['arrowdown']) { vy += 1; direction = 'down'; }
    if (this.keys['a'] || this.keys['arrowleft']) { vx -= 1; direction = 'left'; }
    if (this.keys['d'] || this.keys['arrowright']) { vx += 1; direction = 'right'; }

    // Normalize for diagonal movement
    if (vx !== 0 && vy !== 0) {
      const length = Math.sqrt(vx * vx + vy * vy);
      vx /= length;
      vy /= length;
    }

    return { vx: vx * this.speed, vy: vy * this.speed, direction };
  }

  public cleanup() {
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
  }
}
