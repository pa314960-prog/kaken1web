import { rand } from "./utils.js";

export class Lasers {
  constructor() {
    this.beams = [];
    this.spawnTimer = 0;
    this.hue = 0;
  }

  onHold(dt, width, height) {
    this.hue = (this.hue + dt * 60) % 360;
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = 0.045;
      const originX = width / 2 + rand(-40, 40);
      const originY = height + 20;
      const angle = rand(-1.15, -Math.PI + 1.15) - Math.PI / 2;
      const length = Math.max(width, height) * 1.4;
      this.beams.push({
        x: originX,
        y: originY,
        ex: originX + Math.cos(angle) * length,
        ey: originY + Math.sin(angle) * length,
        width: rand(3, 8),
        hue: (this.hue + rand(-30, 30) + 360) % 360,
        life: 0,
        maxLife: rand(0.35, 0.6),
        sweep: rand(0.3, 0.9)
      });
    }
  }

  update(dt) {
    for (const b of this.beams) {
      b.life += dt;
    }
    this.beams = this.beams.filter((b) => b.life < b.maxLife);
  }

  draw(ctx, width, height) {
    ctx.save();
    ctx.fillStyle = "rgba(20, 15, 30, 0.22)";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    for (const b of this.beams) {
      const t = b.life / b.maxLife;
      const alpha = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
      const color = `hsl(${b.hue}, 55%, 78%)`;
      const currentEx = b.x + (b.ex - b.x) * Math.min(1, t / b.sweep + 0.3);
      const currentEy = b.y + (b.ey - b.y) * Math.min(1, t / b.sweep + 0.3);

      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha) * 0.55;
      ctx.filter = "blur(6px)";
      ctx.strokeStyle = color;
      ctx.lineWidth = b.width * 2.6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(currentEx, currentEy);
      ctx.stroke();

      ctx.filter = "blur(1px)";
      ctx.globalAlpha = Math.max(0, alpha) * 0.75;
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.lineWidth = b.width * 0.6;
      ctx.stroke();
      ctx.restore();
    }
  }

  isEmpty() {
    return this.beams.length === 0;
  }
}
