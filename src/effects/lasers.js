import { rand, pick } from "./utils.js";

const COLORS = ["#ff2d6b", "#2dd4ff", "#ffe32d", "#7c2dff", "#2dff8f"];

export class Lasers {
  constructor() {
    this.beams = [];
    this.spawnTimer = 0;
  }

  onHold(dt, width, height) {
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = 0.06;
      const fromLeft = Math.random() < 0.5;
      this.beams.push({
        x: fromLeft ? -50 : width + 50,
        y: rand(0, height),
        vx: (fromLeft ? 1 : -1) * rand(900, 1400),
        angle: rand(-0.3, 0.3),
        width: rand(3, 7),
        color: pick(COLORS),
        life: 0,
        maxLife: 0.5
      });
    }
  }

  update(dt) {
    for (const b of this.beams) {
      b.life += dt;
      b.x += b.vx * dt;
      b.y += b.vx * dt * b.angle * 0.3;
    }
    this.beams = this.beams.filter((b) => b.life < b.maxLife);
  }

  draw(ctx, width, height) {
    ctx.save();
    ctx.fillStyle = "rgba(10, 0, 20, 0.18)";
    ctx.fillRect(0, 0, width, height);
    ctx.restore();

    for (const b of this.beams) {
      const alpha = 1 - b.life / b.maxLife;
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 20;
      ctx.strokeStyle = b.color;
      ctx.lineWidth = b.width;
      ctx.beginPath();
      ctx.moveTo(b.x, b.y);
      ctx.lineTo(b.x - b.vx * 0.05, b.y - b.vx * 0.05 * b.angle * 0.3);
      ctx.stroke();
      ctx.restore();
    }
  }

  isEmpty() {
    return this.beams.length === 0;
  }
}
