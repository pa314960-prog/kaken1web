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
      const rise = t * 90;
      const alpha = t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85;
      const scale = t < 0.2 ? 0.6 + (t / 0.2) * 0.5 : 1.1 - (t - 0.2) * 0.1;

      ctx.save();
      ctx.globalAlpha = Math.max(0, alpha);
      ctx.translate(it.x, it.y - rise);
      ctx.scale(scale, scale);

      const w = 130, h = 80;
      ctx.fillStyle = "#ffffff";
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 4;
      roundRect(ctx, -w / 2, -h / 2, w, h, 20);
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-10, h / 2 - 2);
      ctx.lineTo(0, h / 2 + 20);
      ctx.lineTo(14, h / 2 - 2);
      ctx.closePath();
      ctx.fillStyle = "#ffffff";
      ctx.fill();

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
