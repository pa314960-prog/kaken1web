import { easeOutBack } from "./utils.js";

export class ReactionBubble {
  constructor(emoji, color) {
    this.emoji = emoji;
    this.color = color;
    this.items = [];
    this.wasActive = false;
  }

  onEnter(x, y) {
    this.items.push({ x, y, life: 0, maxLife: 1.8 });
  }

  update(dt) {
    for (const it of this.items) it.life += dt;
    this.items = this.items.filter((it) => it.life < it.maxLife);
  }

  draw(ctx) {
    for (const it of this.items) {
      const t = it.life / it.maxLife;
      const rise = t * 100;
      const alpha = t < 0.12 ? t / 0.12 : 1 - (t - 0.12) / 0.88;
      const popT = Math.min(1, t / 0.28);
      const scale = t < 0.28 ? easeOutBack(popT) : 1 + (t - 0.28) * 0.06;

      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.translate(it.x, it.y - rise);
      ctx.scale(scale, scale);

      const w = 130, h = 80;

      ctx.save();
      ctx.filter = "blur(2px)";
      ctx.fillStyle = "rgba(255,255,255,0.22)";
      roundRect(ctx, -w / 2, -h / 2, w, h, 20);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(-10, h / 2 - 2);
      ctx.lineTo(0, h / 2 + 20);
      ctx.lineTo(14, h / 2 - 2);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      roundRect(ctx, -w / 2, -h / 2, w, h, 20);
      ctx.strokeStyle = "rgba(255,255,255,0.55)";
      ctx.lineWidth = 1.5;
      ctx.stroke();

      const sheen = ctx.createLinearGradient(-w / 2, -h / 2, -w / 2, h * 0.1);
      sheen.addColorStop(0, "rgba(255,255,255,0.35)");
      sheen.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = sheen;
      roundRect(ctx, -w / 2, -h / 2, w, h * 0.55, 20);
      ctx.fill();

      ctx.strokeStyle = this.color;
      ctx.lineWidth = 2;
      roundRect(ctx, -w / 2, -h / 2, w, h, 20);
      ctx.stroke();

      ctx.font = "42px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(this.emoji, 0, -4);
      ctx.restore();
    }
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
