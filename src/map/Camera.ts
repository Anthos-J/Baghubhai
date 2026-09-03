export class Camera {
  public x: number = 0;
  public y: number = 0;
  
  // Smoothly follow the target
  public update(targetX: number, targetY: number, deltaTime: number) {
    const lerpFactor = 5 * deltaTime; // Adjust for smoothness
    this.x += (targetX - this.x) * lerpFactor;
    this.y += (targetY - this.y) * lerpFactor;
  }
}
