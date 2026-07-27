const UNSAFE_PATTERN = /[;{}]|url\s*\(|expression\s*\(|@import/i;

const HEX_COLOR =
  /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;

/** Modern space-separated or legacy comma-separated rgb/hsl functions. */
const RGB_HSL_FN =
  /^(?:rgb|rgba|hsl|hsla)\(\s*[-+0-9.%\s,/]+\s*\)$/i;

export function isSafeCssColor(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > 64) return false;
  if (UNSAFE_PATTERN.test(trimmed)) return false;
  if (HEX_COLOR.test(trimmed)) return true;
  if (RGB_HSL_FN.test(trimmed)) return true;
  return false;
}

export function sanitizeCssColor(value: string, fallback: string): string {
  return isSafeCssColor(value) ? value.trim() : fallback;
}
