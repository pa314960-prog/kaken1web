import { rand, pick, easeOutBack } from "./utils.js";

const COLORS = ["#ff6b6b", "#ffd93d", "#6bcB77", "#4d96ff", "#ff8fab", "#b385ff", "#ff9f4d"];

export class Balloons {
  constructor() {
    this.particles = [];
    this.spawnTimer = 0;
  }

  onHold(dt, width, height) {
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = 0.09;
      this.particles.push({
        x: rand(width * 0.08, width * 0.92),
        y: height + 40,
        vy: -rand(160, 230),
        r: rand(24, 40),
        color: pick(COLORS),
        sway: rand(0, Math.PI * 2),
        swaySpeed: rand(1.6, 2.6),
        swayAmp: rand(18, 34),
        life: 0,
        maxLife: rand(4.5, 6),
        popIn: 0
      });
    }
  }

  update(dt) {
    for (const p of this.particles) {
      p.life += dt;
      p.popIn = Math.min(1, p.popIn + dt * 4);
      p.sway += dt * p.swaySpeed;
      p.x += Math.sin(p.sway) * p.swayAmp * dt;
      p.y += p.vy * dt;
      p.vy *= 0.995;
    }
    this.particles = this.particles.filter((p) => p.life < p.maxLife);
  }

  draw(ctx) {
    for (const p of this.particles) {
      const fadeOut = Math.min(1, (p.maxLife - p.life) / 1.0);
      const scale = easeOutBack(p.popIn);
      const alpha = Math.min(fadeOut, p.popIn < 1 ? p.popIn : 1);

      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.translate(p.x, p.y);
      ctx.scale(scale, scale);

      ctx.strokeStyle = "rgba(255,255,255,0.4)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, p.r);
      ctx.lineTo(0, p.r + 26);
      ctx.stroke();

      const grad = ctx.createRadialGradient(-p.r * 0.3, -p.r * 0.35, p.r * 0.1, 0, 0, p.r * 1.1);
      grad.addColorStop(0, "rgba(255,255,255,0.85)");
      grad.addColorStop(0.25, p.color);
      grad.addColorStop(1, p.color);
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.r * 0.82, p.r, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(-p.r * 0.15, p.r * 0.95);
      ctx.lineTo(0, p.r * 1.15);
      ctx.lineTo(p.r * 0.15, p.r * 0.95);
      ctx.closePath();
      ctx.fillStyle = p.color;
      ctx.fill();

      ctx.restore();
    }
  }

  isEmpty() {
    return this.particles.length === 0;
  }
}
