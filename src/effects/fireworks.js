import { rand, pick } from "./utils.js";

const COLORS = [
  "rgba(255,140,140,0.85)",
  "rgba(140,200,255,0.85)",
  "rgba(255,215,140,0.85)",
  "rgba(200,150,255,0.85)",
  "rgba(150,230,190,0.85)",
  "rgba(255,170,210,0.85)",
  "rgba(255,255,255,0.85)"
];

export class Fireworks {
  constructor() {
    this.rockets = [];
    this.sparks = [];
    this.launchTimer = 0;
  }

  onHold(dt, width, height) {
    this.launchTimer -= dt;
    if (this.launchTimer <= 0) {
      this.launchTimer = rand(0.22, 0.5);
      const targetY = rand(height * 0.12, height * 0.42);
      this.rockets.push({
        x: rand(width * 0.12, width * 0.88),
        y: height,
        vy: -rand(520, 680),
        targetY,
        color: pick(COLORS),
        trail: []
      });
    }
  }

  explode(rocket) {
    const count = 60;
    const big = Math.random() < 0.35;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + rand(-0.05, 0.05);
      const speed = rand(big ? 140 : 90, big ? 320 : 240);
      this.sparks.push({
        x: rocket.x,
        y: rocket.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color: rocket.color,
        size: rand(2, 4),
        life: 0,
        maxLife: rand(0.9, 1.5)
      });
    }
  }

  update(dt) {
    for (const r of this.rockets) {
      r.trail.push({ x: r.x, y: r.y, a: 1 });
      if (r.trail.length > 8) r.trail.shift();
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
      s.vy += 220 * dt;
      s.vx *= 0.97;
      s.vy *= 0.97;
    }
    this.sparks = this.sparks.filter((s) => s.life < s.maxLife);
  }

  draw(ctx) {
    for (const r of this.rockets) {
      ctx.save();
      for (let i = 0; i < r.trail.length; i++) {
        const t = r.trail[i];
        ctx.globalAlpha = (i / r.trail.length) * 0.5;
        ctx.fillStyle = r.color;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
      ctx.filter = "blur(2px)";
      ctx.fillStyle = "rgba(255,255,255,0.9)";
      ctx.beginPath();
      ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    for (const s of this.sparks) {
      const t = s.life / s.maxLife;
      const alpha = 1 - t;
      const flicker = 0.75 + 0.25 * Math.sin(s.life * 30);
      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha) * flicker;
      ctx.filter = "blur(1.5px)";
      ctx.fillStyle = s.color;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size * 1.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  isEmpty() {
    return this.rockets.length === 0 && this.sparks.length === 0;
  }
}
