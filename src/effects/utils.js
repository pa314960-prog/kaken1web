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

export function easeOutCubic(t) {
  const c = clamp(t, 0, 1);
  return 1 - Math.pow(1 - c, 3);
}

export function easeOutBack(t) {
  const c = clamp(t, 0, 1);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(c - 1, 3) + c1 * Math.pow(c - 1, 2);
}

export function easeInQuad(t) {
  const c = clamp(t, 0, 1);
  return c * c;
}
