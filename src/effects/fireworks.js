import { rand, pick } from "./utils.js";

const COLORS = ["#ff5e5e", "#5ecbff", "#ffd25e", "#c15eff", "#5eff8f", "#ff5ec1"];

export class Fireworks {
  constructor() {
    this.rockets = [];
    this.sparks = [];
    this.launchTimer = 0;
  }

  onHold(dt, width, height) {
    this.launchTimer -= dt;
    if (this.launchTimer <= 0) {
      this.launchTimer = rand(0.35, 0.75);
      const targetY = rand(height * 0.15, height * 0.45);
      this.rockets.push({
        x: rand(width * 0.15, width * 0.85),
        y: height,
        vy: -rand(420, 560),
        targetY,
        color: pick(COLORS)
      });
    }
  }

  explode(rocket) {
    const count = 46;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count;
      const speed = rand(80, 220);
      this.sparks.push({
        x: rocket.x,
        y: rocket.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: rocket.color,
        life: 0,
        maxLife: rand(0.8, 1.3)
      });
    }
  }

  update(dt) {
    for (const r of this.rockets) {
      r.y += r.vy * dt;
    }
    for (const r of this.rockets) {
      if (r.y <= r.targetY) this.explode(r);
    }
    this.rockets = this.rockets.filter((r) => r.y > r.targetY);

    for (const s of this.sparks) {
      s.life += dt;
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.vy += 160 * dt;
      s.vx *= 0.98;
    }
    this.sparks = this.sparks.filter((s) => s.life < s.maxLife);
  }

  draw(ctx) {
    for (const r of this.rockets) {
      ctx.save();
      ctx.fillStyle = r.color;
      ctx.beginPath();
      ctx.arc(r.x, r.y, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    for (const s of this.sparks) {
      const alpha = 1 - s.life / s.maxLife;
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  isEmpty() {
    return this.rockets.length === 0 && this.sparks.length === 0;
  }
}
