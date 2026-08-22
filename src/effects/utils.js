export function rand(min, max) {
  return min + Math.random() * (max - min);
}

export function pick(arr) {
  return arr[(Math.random() * arr.length) | 0];
}

export function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}
