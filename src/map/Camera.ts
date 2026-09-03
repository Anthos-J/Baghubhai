export class Camera {
  public x: number = 0;
  public y: number = 0;
  
  // Smoothly follow the target
  public update(targetX: number, targetY: number, deltaTime: number) {
    const lerpFactor = 12 * deltaTime; // Tight follow — snappy camera with no input lag
    this.x += (targetX - this.x) * lerpFactor;
    this.y += (targetY - this.y) * lerpFactor;
  }
}
