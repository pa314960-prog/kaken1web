import { rand } from "./utils.js";

export class HeartEffect {
  constructor() {
    this.hearts = [];
    this.spawnTimer = 0;
  }

  onHold(dt, originX, originY) {
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = 0.05;
      this.hearts.push({
        x: originX + rand(-55, 55),
        y: originY + rand(-25, 25),
        vx: rand(-15, 15),
        vy: -rand(70, 140),
        size: rand(20, 44),
        rot: rand(-0.25, 0.25),
        sway: rand(0, Math.PI * 2),
        swaySpeed: rand(1.2, 2.4),
        swayAmp: rand(12, 30),
        life: 0,
        maxLife: rand(1.8, 2.8)
      });
    }
  }

  update(dt) {
    for (const h of this.hearts) {
      h.life += dt;
      h.sway += dt * h.swaySpeed;
      h.x += (h.vx + Math.sin(h.sway) * h.swayAmp) * dt;
      h.y += h.vy * dt;
      h.vy *= 0.995;
    }
    this.hearts = this.hearts.filter((h) => h.life < h.maxLife);
  }

  draw(ctx) {
    for (const h of this.hearts) {
      const t = h.life / h.maxLife;
      const growT = Math.min(1, h.life / 0.22);
      const alpha = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;

      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.translate(h.x, h.y);
      ctx.rotate(h.rot);
      ctx.scale(growT, growT);
      ctx.font = `${h.size}px sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("❤️", 0, 0);
      ctx.restore();
    }
  }

  isEmpty() {
    return this.hearts.length === 0;
  }
}
