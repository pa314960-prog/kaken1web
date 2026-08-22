import {
  HandLandmarker,
  FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs";

const WASM_URL = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm";
const MODEL_URL = "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

const FINGERS = {
  thumb: [1, 2, 3, 4],
  index: [5, 6, 7, 8],
  middle: [9, 10, 11, 12],
  ring: [13, 14, 15, 16],
  pinky: [17, 18, 19, 20]
};

export async function createHandLandmarker() {
  const filesetResolver = await FilesetResolver.forVisionTasks(WASM_URL);
  return HandLandmarker.createFromOptions(filesetResolver, {
    baseOptions: { modelAssetPath: MODEL_URL, delegate: "GPU" },
    runningMode: "VIDEO",
    numHands: 2,
    minHandDetectionConfidence: 0.6,
    minHandPresenceConfidence: 0.6,
    minTrackingConfidence: 0.6
  });
}

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y, (a.z || 0) - (b.z || 0));
}

function isFingerExtended(landmarks, wrist, [mcp, pip, , tip]) {
  const tipDist = dist(landmarks[tip], wrist);
  const pipDist = dist(landmarks[pip], wrist);
  const mcpDist = dist(landmarks[mcp], wrist);
  return tipDist > pipDist && pipDist >= mcpDist * 0.95;
}

function isThumbExtended(landmarks) {
  const wrist = landmarks[0];
  const pinkyMcp = landmarks[FINGERS.pinky[0]];
  const thumbTip = landmarks[FINGERS.thumb[3]];
  const thumbMcp = landmarks[FINGERS.thumb[0]];
  const spread = dist(thumbTip, pinkyMcp);
  const base = dist(thumbMcp, pinkyMcp);
  const reach = dist(thumbTip, wrist) > dist(thumbMcp, wrist);
  return spread > base * 0.85 && reach;
}

export function analyzeHand(landmarks) {
  const wrist = landmarks[0];
  const extended = {
    thumb: isThumbExtended(landmarks),
    index: isFingerExtended(landmarks, wrist, FINGERS.index),
    middle: isFingerExtended(landmarks, wrist, FINGERS.middle),
    ring: isFingerExtended(landmarks, wrist, FINGERS.ring),
    pinky: isFingerExtended(landmarks, wrist, FINGERS.pinky)
  };

  const curledCount = Object.entries(extended).filter(
    ([k, v]) => k !== "thumb" && !v
  ).length;

  let gesture = "unknown";

  if (extended.index && extended.middle && !extended.ring && !extended.pinky) {
    gesture = "peace";
  } else if (
    extended.index &&
    extended.pinky &&
    !extended.middle &&
    !extended.ring
  ) {
    gesture = "rock";
  } else if (extended.thumb && curledCount === 4) {
    const thumbTip = landmarks[FINGERS.thumb[3]];
    const middleMcp = landmarks[FINGERS.middle[0]];
    if (thumbTip.y < middleMcp.y - 0.06) {
      gesture = "thumbsUp";
    } else if (thumbTip.y > middleMcp.y + 0.06) {
      gesture = "thumbsDown";
    } else {
      gesture = "thumbSide";
    }
  } else if (curledCount === 4 && !extended.thumb) {
    gesture = "fist";
  } else if (
    extended.index &&
    extended.middle &&
    extended.ring &&
    extended.pinky
  ) {
    gesture = "open";
  }

  return {
    gesture,
    extended,
    thumbTip: landmarks[FINGERS.thumb[3]],
    indexTip: landmarks[FINGERS.index[3]],
    wrist
  };
}

const HEART_TOUCH_THRESHOLD = 0.12;

export function classifyCombinedGesture(handResults) {
  if (!handResults || handResults.length === 0) {
    return { gesture: "none", hands: [] };
  }

  if (handResults.length === 1) {
    const g = handResults[0].gesture;
    if (g === "peace") return { gesture: "peaceOne", hands: handResults };
    if (g === "thumbsUp") return { gesture: "goodOne", hands: handResults };
    if (g === "thumbsDown") return { gesture: "badOne", hands: handResults };
    if (g === "rock") return { gesture: "rock", hands: handResults };
    return { gesture: "none", hands: handResults };
  }

  const [a, b] = handResults;

  const thumbsClose = dist(a.thumbTip, b.thumbTip) < HEART_TOUCH_THRESHOLD;
  const indexClose = dist(a.indexTip, b.indexTip) < HEART_TOUCH_THRESHOLD;
  const indexAboveThumb =
    a.indexTip.y < a.thumbTip.y + 0.03 && b.indexTip.y < b.thumbTip.y + 0.03;

  if (thumbsClose && indexClose && indexAboveThumb) {
    return { gesture: "heart", hands: handResults };
  }

  if (a.gesture === "peace" && b.gesture === "peace") {
    return { gesture: "peaceTwo", hands: handResults };
  }

  if (a.gesture === "thumbsUp" && b.gesture === "thumbsUp") {
    return { gesture: "goodTwo", hands: handResults };
  }

  if (a.gesture === "thumbsDown" && b.gesture === "thumbsDown") {
    return { gesture: "badTwo", hands: handResults };
  }

  if (a.gesture === "rock" || b.gesture === "rock") {
    return { gesture: "rock", hands: handResults };
  }

  if (a.gesture === "peace" || b.gesture === "peace") {
    return { gesture: "peaceOne", hands: handResults };
  }

  if (a.gesture === "thumbsUp" || b.gesture === "thumbsUp") {
    return { gesture: "goodOne", hands: handResults };
  }

  if (a.gesture === "thumbsDown" || b.gesture === "thumbsDown") {
    return { gesture: "badOne", hands: handResults };
  }

  return { gesture: "none", hands: handResults };
}
