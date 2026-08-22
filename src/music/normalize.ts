export function normalize(
  value: number,
  min: number,
  max: number
): number {
  if (max <= min) {
    return 0;
  }

  const normalized =
    (value - min) / (max - min);

  return Math.min(
    1,
    Math.max(0, normalized)
  );
}