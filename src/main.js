import { createHandLandmarker, analyzeHand, classifyCombinedGesture } from "./handTracking.js";
import { EffectManager } from "./effects/effectManager.js";

const video = document.getElementById("webcam");
const startOverlay = document.getElementById("start-overlay");
const startBtn = document.getElementById("start-btn");

const effectManager = new EffectManager({
  fxCanvas: document.getElementById("fx"),
  threeCanvas: document.getElementById("three-layer")
});

const STABLE_FRAMES_REQUIRED = 4;
let stableGesture = "none";
let candidateGesture = "none";
let candidateCount = 0;
let lastOrigin = { x: 0.5, y: 0.5 };

function mirrorPoint(pt) {
  return { x: 1 - pt.x, y: pt.y };
}

function computeOrigin(gesture, hands) {
  if (gesture === "heart" && hands.length === 2) {
    const [a, b] = hands;
    const mx = (a.thumbTip.x + a.indexTip.x + b.thumbTip.x + b.indexTip.x) / 4;
    const my = (a.thumbTip.y + a.indexTip.y + b.thumbTip.y + b.indexTip.y) / 4;
    return mirrorPoint({ x: mx, y: my });
  }
  if (gesture === "peaceOne" || gesture === "goodOne" || gesture === "badOne") {
    const hand = hands.find((h) =>
      gesture === "peaceOne" ? h.gesture === "peace" :
      gesture === "goodOne" ? h.gesture === "thumbsUp" :
      h.gesture === "thumbsDown"
    ) || hands[0];
    return mirrorPoint(hand.wrist);
  }
  return lastOrigin;
}

function updateGesture(rawGesture, hands) {
  if (rawGesture === candidateGesture) {
    candidateCount++;
  } else {
    candidateGesture = rawGesture;
    candidateCount = 1;
  }

  if (candidateCount >= STABLE_FRAMES_REQUIRED && candidateGesture !== stableGesture) {
    stableGesture = candidateGesture;
  }

  if (stableGesture !== "none") {
    lastOrigin = computeOrigin(stableGesture, hands);
  }

  effectManager.setGesture(stableGesture, lastOrigin);
}

async function main() {
  startBtn.addEventListener("click", async () => {
    startBtn.disabled = true;
    startBtn.textContent = "起動中...";
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: "user" },
        audio: false
      });
      video.srcObject = stream;
      await video.play();

      const landmarker = await createHandLandmarker();
      startOverlay.classList.add("hidden");
      runLoop(landmarker);
    } catch (err) {
      console.error(err);
      startBtn.disabled = false;
      startBtn.textContent = "カメラを開始";
      alert("カメラの起動に失敗しました: " + err.message);
    }
  });
}

function runLoop(landmarker) {
  let lastTime = performance.now();

  function frame(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    if (video.readyState >= 2) {
      const result = landmarker.detectForVideo(video, now);
      const hands = (result.landmarks || []).map((lm) => analyzeHand(lm));
      const combined = classifyCombinedGesture(hands);
      updateGesture(combined.gesture, hands);
    }

    effectManager.update(dt);
    effectManager.draw();

    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

main();
