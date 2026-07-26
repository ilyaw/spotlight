/**
 * Transparent padding around the panel so RGB glow + soft elevation aren't
 * clipped by the window / overflow:hidden. Keep CSS `--rgb-glow-bleed` in sync
 * by setting it from this value on the panel root (see CommandDeckPanel).
 *
 * Must stay >= max elevation extent (offset + blur ≈ 14 + 32 = 46).
 */
export const GLOW_BLEED_PX = 52;
