import { COLORS } from "../consts";

export function invariant(
  condition?: boolean,
  message?: string
): asserts condition {
  if (condition) return;
  throw new Error(`[Assertion Error] ${message}`);
}

export function random_color() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}
