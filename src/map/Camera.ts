export class Camera {
  public x: number = 0;
  public y: number = 0;
  
  public shakeOffsetX: number = 0;
  public shakeOffsetY: number = 0;
  private shakeDuration: number = 0;
  private shakeTimer: number = 0;
  private shakeIntensity: number = 0;

  // Render coordinates including any active shake offset
  public get renderX(): number {
    return this.x + this.shakeOffsetX;
  }

  public get renderY(): number {
    return this.y + this.shakeOffsetY;
  }

  // Smoothly follow the target and decay camera shake
  public update(targetX: number, targetY: number, deltaTime: number) {
    const lerpFactor = 12 * deltaTime; // Tight follow — snappy camera with no input lag
    this.x += (targetX - this.x) * lerpFactor;
    this.y += (targetY - this.y) * lerpFactor;

    if (this.shakeTimer > 0) {
      this.shakeTimer -= deltaTime;
      const progress = Math.max(0, this.shakeTimer / this.shakeDuration);
      const currentIntensity = this.shakeIntensity * progress;
      this.shakeOffsetX = (Math.random() * 2 - 1) * currentIntensity;
      this.shakeOffsetY = (Math.random() * 2 - 1) * currentIntensity;
      if (this.shakeTimer <= 0) {
        this.shakeOffsetX = 0;
        this.shakeOffsetY = 0;
      }
    } else {
      this.shakeOffsetX = 0;
      this.shakeOffsetY = 0;
    }
  }

  public triggerShake(intensity: number = 8, duration: number = 0.4) {
    this.shakeIntensity = intensity;
    this.shakeDuration = duration;
    this.shakeTimer = duration;
  }
}
