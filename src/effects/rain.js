import { rand } from "./utils.js";

export class Rain {
  constructor() {
    this.drops = [];
    this.spawnTimer = 0;
  }

  onHold(dt, width, height) {
    this.spawnTimer -= dt;
    if (this.spawnTimer <= 0) {
      this.spawnTimer = 0.005;
      for (let i = 0; i < 3; i++) {
        this.drops.push({
          x: rand(0, width),
          y: -10,
          vy: rand(650, 950),
          len: rand(14, 26),
          life: 0,
          maxLife: height / 500
        });
      }
    }
    if (this.drops.length > 500) this.drops.splice(0, this.drops.length - 500);
  }

  update(dt, height) {
    for (const d of this.drops) {
      d.y += d.vy * dt;
      d.life += dt;
    }
    this.drops = this.drops.filter((d) => d.y < height + 20);
  }

  draw(ctx, width, height) {
    ctx.save();
    ctx.strokeStyle = "rgba(180, 210, 255, 0.55)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (const d of this.drops) {
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x - 4, d.y + d.len);
    }
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.fillStyle = "rgba(60, 65, 80, 0.55)";
    for (let i = 0; i < 6; i++) {
      const cx = (width / 6) * i + Math.sin(i) * 20;
      ctx.beginPath();
      ctx.ellipse(cx, 40, 90, 34, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  isEmpty() {
    return this.drops.length === 0;
  }
}
