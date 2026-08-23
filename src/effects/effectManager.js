import { Balloons } from "./balloons.js";
import { Confetti } from "./confetti.js";
import { ReactionBubble } from "./bubble.js";
import { Fireworks } from "./fireworks.js";
import { Rain } from "./rain.js";
import { Lasers } from "./lasers.js";
import { HeartEffect } from "./heart.js";

const DIM_GESTURES = new Set(["goodTwo", "badTwo"]);

const GESTURE_LABELS = {
  none: "-",
  heart: "ハート（両手）",
  peaceOne: "ピース（片手）",
  peaceTwo: "ピース（両手）",
  goodOne: "グッド（片手）",
  goodTwo: "グッド（両手）",
  badOne: "バッド（片手）",
  badTwo: "バッド（両手）",
  rock: "メロイックサイン"
};

const EFFECT_LABELS = {
  none: "-",
  heart: "3Dハート",
  peaceOne: "風船",
  peaceTwo: "紙吹雪",
  goodOne: "いいね吹き出し",
  goodTwo: "花火",
  badOne: "バッド吹き出し",
  badTwo: "雨",
  rock: "レーザービーム"
};

export class EffectManager {
  constructor({ fxCanvas, threeCanvas }) {
    this.fxCanvas = fxCanvas;
    this.ctx = fxCanvas.getContext("2d");
    this.heart = new HeartEffect(threeCanvas);

    this.balloons = new Balloons();
    this.confetti = new Confetti();
    this.fireworks = new Fireworks();
    this.rain = new Rain();
    this.lasers = new Lasers();
    this.goodBubble = new ReactionBubble("\u{1F44D}", "#4d96ff");
    this.badBubble = new ReactionBubble("\u{1F44E}", "#ff6b6b");

    this.currentGesture = "none";
    this.dimAlpha = 0;
    this.gestureLabelEl = document.getElementById("gesture-label");
    this.effectLabelEl = document.getElementById("effect-label");

    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.fxCanvas.width = w;
    this.fxCanvas.height = h;
    this.heart.resize();
    this.width = w;
    this.height = h;
  }

  setGesture(gesture, origin) {
    if (gesture !== this.currentGesture) {
      if (gesture === "goodOne") this.goodBubble.onEnter(origin.x * this.width, origin.y * this.height);
      if (gesture === "badOne") this.badBubble.onEnter(origin.x * this.width, origin.y * this.height);
      this.currentGesture = gesture;
    }

    this.gestureLabelEl.textContent = `ジェスチャー: ${GESTURE_LABELS[gesture] || gesture}`;
    this.effectLabelEl.textContent = `エフェクト: ${EFFECT_LABELS[gesture] || "-"}`;
    this.origin = origin;
  }

  update(dt) {
    const g = this.currentGesture;
    const o = this.origin || { x: 0.5, y: 0.5 };

    if (g === "peaceOne") this.balloons.onHold(dt, this.width, this.height);
    if (g === "peaceTwo") this.confetti.onHold(dt, this.width);
    if (g === "goodTwo") this.fireworks.onHold(dt, this.width, this.height);
    if (g === "badTwo") this.rain.onHold(dt, this.width, this.height);
    if (g === "rock") this.lasers.onHold(dt, this.width, this.height);
    if (g === "heart") this.heart.onHold(dt, o.x, o.y);

    const targetDim = DIM_GESTURES.has(g) ? (g === "goodTwo" ? 0.55 : 0.4) : 0;
    const dimRate = targetDim > this.dimAlpha ? 5 : 1.5;
    this.dimAlpha += (targetDim - this.dimAlpha) * Math.min(1, dt * dimRate);

    this.balloons.update(dt);
    this.confetti.update(dt);
    this.fireworks.update(dt);
    this.rain.update(dt, this.height);
    this.lasers.update(dt);
    this.goodBubble.update(dt);
    this.badBubble.update(dt);
    this.heart.update(dt);
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    if (this.dimAlpha > 0.01) {
      ctx.save();
      ctx.fillStyle = `rgba(4, 6, 20, ${this.dimAlpha})`;
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.restore();
    }

    this.balloons.draw(ctx);
    this.confetti.draw(ctx);
    if (this.currentGesture === "badTwo" || !this.rain.isEmpty()) {
      this.rain.draw(ctx, this.width, this.height);
    }
    this.fireworks.draw(ctx);
    this.lasers.draw(ctx, this.width, this.height);
    this.goodBubble.draw(ctx);
    this.badBubble.draw(ctx);

    this.heart.render();
  }
}
