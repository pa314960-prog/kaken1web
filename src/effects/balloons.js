import { rand, pick } from "./utils.js";

const COLORS = ["#ff6b6b", "#ffd93d", "#6bcB77", "#4d96ff", "#ff8fab", "#b385ff"];

export class Balloons {
  constructor() {
    this.particles = [];
    this.spawnTimer = 0;
  }

  onHold(dt, width, height) {
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = 0.18;
      this.particles.push({
        x: rand(width * 0.1, width * 0.9),
        y: height + 40,
        vx: rand(-12, 12),
        vy: rand(-70, -40),
        r: rand(22, 34),
        color: pick(COLORS),
        sway: rand(0, Math.PI * 2),
        life: 0,
        maxLife: rand(5, 7)
      });
    }
  }

  update(dt) {
    for (const p of this.particles) {
      p.life += dt;
      p.sway += dt * 2;
      p.x += Math.sin(p.sway) * 14 * dt + p.vx * dt * 0.1;
      p.y += p.vy * dt;
    }
    this.particles = this.particles.filter((p) => p.life < p.maxLife);
  }

  draw(ctx) {
    for (const p of this.particles) {
      const alpha = Math.min(1, (p.maxLife - p.life) / 1.2);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, p.r * 0.8, p.r, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y + p.r);
      ctx.lineTo(p.x, p.y + p.r + 24);
      ctx.stroke();
      ctx.restore();
    }
  }

  isEmpty() {
    return this.particles.length === 0;
  }
}
