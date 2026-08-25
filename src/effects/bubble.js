import { easeOutBack } from "./utils.js";

export class ReactionBubble {
  constructor(emoji, color) {
    this.emoji = emoji;
    this.color = color;
    this.items = [];
  }

  onEnter(x, y) {
    this.items.push({ x, y, life: 0, maxLife: 1.8, driftX: 26 + Math.random() * 22 });
  }

  update(dt) {
    for (const it of this.items) it.life += dt;
    this.items = this.items.filter((it) => it.life < it.maxLife);
  }

  draw(ctx) {
    for (const it of this.items) {
      const t = it.life / it.maxLife;
      const rise = t * 120;
      const alpha = t < 0.12 ? t / 0.12 : 1 - (t - 0.12) / 0.88;
      const popT = Math.min(1, t / 0.28);
      const scale = t < 0.28 ? easeOutBack(popT) : 1 + (t - 0.28) * 0.04;
      const r = 46;

      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.translate(it.x + it.driftX * t, it.y - rise);
      ctx.scale(scale, scale);

      ctx.save();
      ctx.filter = "blur(3px)";
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      const body = ctx.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r);
      body.addColorStop(0, "rgba(255,255,255,0.5)");
      body.addColorStop(0.55, "rgba(255,255,255,0.16)");
      body.addColorStop(1, "rgba(255,255,255,0.08)");
      ctx.fillStyle = body;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = this.color;
      ctx.globalAlpha = Math.max(0, alpha) * 0.75;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();

      const sheen = ctx.createRadialGradient(-r * 0.35, -r * 0.4, 0, -r * 0.35, -r * 0.4, r * 0.5);
      sheen.addColorStop(0, "rgba(255,255,255,0.8)");
      sheen.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = sheen;
      ctx.beginPath();
      ctx.arc(-r * 0.35, -r * 0.4, r * 0.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.globalAlpha = Math.max(0, alpha);
      ctx.font = "44px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.emoji, 0, 2);
      ctx.restore();
    }
  }
}
