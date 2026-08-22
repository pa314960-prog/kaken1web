import { rand, pick } from "./utils.js";

const COLORS = ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93", "#ff7ab6"];

export class Confetti {
  constructor() {
    this.particles = [];
    this.spawnTimer = 0;
  }

  onHold(dt, width) {
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = 0.02;
      for (let i = 0; i < 4; i++) {
        this.particles.push({
          x: rand(0, width),
          y: -20,
          vx: rand(-40, 40),
          vy: rand(120, 220),
          size: rand(6, 12),
          rot: rand(0, Math.PI * 2),
          vrot: rand(-6, 6),
          color: pick(COLORS),
          life: 0,
          maxLife: rand(3, 4.5)
        });
      }
    }
  }

  update(dt) {
    for (const p of this.particles) {
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 40 * dt;
      p.rot += p.vrot * dt;
    }
    this.particles = this.particles.filter((p) => p.life < p.maxLife);
  }

  draw(ctx) {
    for (const p of this.particles) {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      ctx.restore();
    }
  }

  isEmpty() {
    return this.particles.length === 0;
  }
}
