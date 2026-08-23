import { rand } from "./utils.js";

export class Rain {
  constructor() {
    this.drops = [];
    this.spawnTimer = 0;
    this.lightningTimer = rand(2, 5);
    this.lightningAlpha = 0;
  }

  onHold(dt, width, height) {
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = 0.003;
      for (let i = 0; i < 5; i++) {
        this.drops.push({
          x: rand(-40, width),
          y: -10,
          vy: rand(820, 1150),
          vx: rand(-90, -50),
          len: rand(16, 30)
        });
      }
    }
    if (this.drops.length > 700) this.drops.splice(0, this.drops.length - 700);

    this.lightningTimer -= dt;
    if (this.lightningTimer <= 0) {
      this.lightningTimer = rand(3, 7);
      this.lightningAlpha = 0.55;
    }
  }

  update(dt, height) {
    for (const d of this.drops) {
      d.y += d.vy * dt;
      d.x += d.vx * dt;
    }
    this.drops = this.drops.filter((d) => d.y < height + 20);
    this.lightningAlpha = Math.max(0, this.lightningAlpha - dt * 2.2);
  }

  draw(ctx, width, height) {
    ctx.save();
    ctx.filter = "blur(0.5px)";
    ctx.strokeStyle = "rgba(210, 225, 245, 0.4)";
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    for (const d of this.drops) {
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x + d.vx * 0.02, d.y + d.len);
    }
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.filter = "blur(6px)";
    ctx.fillStyle = "rgba(210, 215, 230, 0.4)";
    for (let i = 0; i < 7; i++) {
      const cx = (width / 7) * i + Math.sin(i * 1.7) * 24;
      ctx.beginPath();
      ctx.ellipse(cx, 34, 100, 38, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    if (this.lightningAlpha > 0.01) {
      ctx.save();
      ctx.fillStyle = `rgba(230, 240, 255, ${this.lightningAlpha})`;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();
    }
  }

  isEmpty() {
    return this.drops.length === 0;
  }
}
