export type RgbPreset = "static" | "two-color" | "rainbow";

export type RgbGradientDirection = "clockwise" | "counter-clockwise";

export type RgbEffectTarget = "full-panel";

export type RgbGradient = {
  angle: number;
  colors: [string, string, string];
};

export type RgbEffectSettings = {
  enabled: boolean;
  preset: RgbPreset;
  target: RgbEffectTarget;
  direction: RgbGradientDirection;
  speed: number;
  thickness: number;
  glowIntensity: number;
  gradient: RgbGradient;
};

export const RGB_PRESET_GRADIENTS: Record<RgbPreset, RgbGradient> = {
  static: {
    angle: 135,
    colors: ["#7928ca", "#7928ca", "#7928ca"],
  },
  "two-color": {
    angle: 135,
    colors: ["#00f0ff", "#ff00aa", "#ff00aa"],
  },
  rainbow: {
    angle: 90,
    colors: ["#ff0080", "#7928ca", "#0070f3"],
  },
};

export const DEFAULT_RGB_SETTINGS: RgbEffectSettings = {
  enabled: true,
  preset: "rainbow",
  target: "full-panel",
  direction: "clockwise",
  speed: 5,
  thickness: 2,
  glowIntensity: 100,
  gradient: RGB_PRESET_GRADIENTS.rainbow,
};

export const RGB_STORAGE_KEY = "spotlight-rgb-settings";

export function getPresetGradient(preset: RgbPreset): RgbGradient {
  return RGB_PRESET_GRADIENTS[preset];
}

export function getBaseDuration(preset: RgbPreset): number {
  switch (preset) {
    case "static":
      return 0;
    case "two-color":
      return 4;
    case "rainbow":
      return 4;
  }
}

export function speedToDuration(speed: number, preset: RgbPreset): string {
  const base = getBaseDuration(preset);
  if (base === 0) return "0s";
  const clampedSpeed = Math.max(1, Math.min(10, speed));
  return `${base / (clampedSpeed / 5)}s`;
}

export function glowVars(intensity: number): {
  blur: string;
  opacity: string;
} {
  const t = Math.max(0, Math.min(100, intensity)) / 100;
  return {
    blur: `${8 + t * 24}px`,
    opacity: `${0.2 + t * 0.6}`,
  };
}
