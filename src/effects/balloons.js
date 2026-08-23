import { rand, pick, easeOutBack } from "./utils.js";

const COLORS = [
  "rgba(255,140,150,0.5)",
  "rgba(255,210,120,0.5)",
  "rgba(140,220,190,0.5)",
  "rgba(130,180,255,0.5)",
  "rgba(255,170,210,0.5)",
  "rgba(190,160,255,0.5)"
];

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

      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, p.r);
      ctx.lineTo(0, p.r + 26);
      ctx.stroke();

      ctx.filter = "blur(1.5px)";
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.r * 0.82, p.r, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.filter = "none";

      ctx.strokeStyle = "rgba(255,255,255,0.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.r * 0.82, p.r, 0, 0, Math.PI * 2);
      ctx.stroke();

      const sheen = ctx.createRadialGradient(-p.r * 0.28, -p.r * 0.4, 0, -p.r * 0.28, -p.r * 0.4, p.r * 0.5);
      sheen.addColorStop(0, "rgba(255,255,255,0.55)");
      sheen.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = sheen;
      ctx.beginPath();
      ctx.ellipse(-p.r * 0.28, -p.r * 0.4, p.r * 0.35, p.r * 0.45, -0.4, 0, Math.PI * 2);
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
