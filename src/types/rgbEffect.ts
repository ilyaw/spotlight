export type RgbPreset = "cyberpunk" | "rainbow-wave" | "neon-pulse";

export type RgbEffectTarget = "search-row" | "full-panel";

export type RgbGradient = {
  angle: number;
  colors: [string, string, string];
};

export type RgbEffectSettings = {
  enabled: boolean;
  preset: RgbPreset;
  target: RgbEffectTarget;
  speed: number;
  thickness: number;
  gradient: RgbGradient;
};

export const RGB_PRESET_GRADIENTS: Record<RgbPreset, RgbGradient> = {
  cyberpunk: {
    angle: 135,
    colors: ["#00f0ff", "#ff00aa", "#ffe600"],
  },
  "rainbow-wave": {
    angle: 90,
    colors: ["#ff0080", "#7928ca", "#0070f3"],
  },
  "neon-pulse": {
    angle: 180,
    colors: ["#ff006e", "#8338ec", "#3a86ff"],
  },
};

export const DEFAULT_RGB_SETTINGS: RgbEffectSettings = {
  enabled: false,
  preset: "cyberpunk",
  target: "search-row",
  speed: 1,
  thickness: 2,
  gradient: RGB_PRESET_GRADIENTS.cyberpunk,
};

export const RGB_STORAGE_KEY = "spotlight-rgb-settings";

export function getPresetGradient(preset: RgbPreset): RgbGradient {
  return RGB_PRESET_GRADIENTS[preset];
}

export function getBaseDuration(preset: RgbPreset): number {
  switch (preset) {
    case "cyberpunk":
      return 3;
    case "rainbow-wave":
      return 4;
    case "neon-pulse":
      return 2;
  }
}
