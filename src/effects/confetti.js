import { rand, pick } from "./utils.js";

const COLORS = ["#ff595e", "#ffca3a", "#8ac926", "#1982c4", "#6a4c93", "#ff7ab6", "#00d0ff"];

export class Confetti {
  constructor() {
    this.particles = [];
    this.spawnTimer = 0;
    this.wind = 0;
    this.windTimer = 0;
  }

  onHold(dt, width) {
    this.windTimer -= dt;
    if (this.windTimer <= 0) {
      this.windTimer = rand(1.5, 3);
      this.wind = rand(-30, 30);
    }

    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = 0.012;
      for (let i = 0; i < 6; i++) {
        this.particles.push({
          x: rand(0, width),
          y: -20,
          vx: rand(-50, 50),
          vy: rand(160, 280),
          size: rand(8, 16),
          elongation: rand(1.8, 3.2),
          rot: rand(0, Math.PI * 2),
          vrot: rand(-8, 8),
          flip: rand(0, Math.PI * 2),
          flipSpeed: rand(4, 9),
          color: pick(COLORS),
          life: 0,
          maxLife: rand(3.5, 5)
        });
      }
    }
  }

  update(dt) {
    for (const p of this.particles) {
      p.life += dt;
      p.x += (p.vx + this.wind) * dt;
      p.y += p.vy * dt;
      p.vy = Math.min(p.vy + 60 * dt, 320);
      p.rot += p.vrot * dt;
      p.flip += p.flipSpeed * dt;
    }
    this.particles = this.particles.filter((p) => p.life < p.maxLife);
  }

  draw(ctx) {
    for (const p of this.particles) {
      const scaleX = Math.abs(Math.cos(p.flip));
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(scaleX, 1);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, (-p.size * p.elongation) / 2, p.size, p.size * p.elongation);
      ctx.restore();
    }
  }

  isEmpty() {
    return this.particles.length === 0;
  }
}
