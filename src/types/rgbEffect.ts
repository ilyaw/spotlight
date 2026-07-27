import { sanitizeCssColor } from "../lib/cssColor";

export type RgbPreset =
  | "static"
  | "two-color"
  | "rainbow"
  | "cyberpunk"
  | "sunset"
  | "ocean"
  | "toxic"
  | "lava"
  | "aurora"
  | "synthwave"
  | "neon-pulse";

export type RgbPresetAnimation = "static" | "spin" | "spin-tri" | "sweep" | "pulse";

export type RgbGradientDirection = "clockwise" | "counter-clockwise";

export type RgbEffectTarget = "full-panel";

export type RgbGradient = {
  angle: number;
  /** 2–6 color stops (hex or CSS color). */
  colors: string[];
};

const DEFAULT_RGB_COLORS = ["#ff006e", "#8338ec", "#3a86ff"];

export function normalizeRgbGradientColors(colors: unknown): string[] {
  const list = Array.isArray(colors)
    ? colors
        .filter((c): c is string => typeof c === "string" && c.length > 0)
        .map((c, i) =>
          sanitizeCssColor(c, DEFAULT_RGB_COLORS[i % DEFAULT_RGB_COLORS.length]!),
        )
    : [];
  if (list.length >= 2) return list.slice(0, 6);
  if (list.length === 1) return [list[0], list[0]];
  return [...DEFAULT_RGB_COLORS];
}

/** Build CSS gradient value for border / ambient layers. */
export function buildRgbGradientCss(
  gradient: RgbGradient,
  kind: "linear" | "conic" | "conic-loop" | "linear-loop",
): string {
  const stops = normalizeRgbGradientColors(gradient.colors);
  const joined = stops.join(", ");
  const loopJoined = [...stops, stops[0]].join(", ");

  switch (kind) {
    case "linear":
      return `linear-gradient(${gradient.angle}deg, ${joined})`;
    case "linear-loop":
      return `linear-gradient(${gradient.angle}deg, ${loopJoined})`;
    case "conic":
      // Angle must stay a CSS var so rgb-spin keyframes can rotate the border.
      return `conic-gradient(from var(--gradient-angle), ${joined})`;
    case "conic-loop":
      return `conic-gradient(from var(--gradient-angle), ${loopJoined})`;
  }
}

export function gradientKindForPreset(
  preset: RgbPreset,
): "linear" | "conic" | "conic-loop" | "linear-loop" {
  switch (preset) {
    case "static":
      return "linear";
    case "two-color":
      return "conic-loop";
    case "rainbow":
    case "sunset":
    case "ocean":
    case "lava":
    case "aurora":
      return "linear-loop";
    case "cyberpunk":
    case "toxic":
    case "synthwave":
    case "neon-pulse":
      return "conic-loop";
  }
}

export type RgbPresetMeta = {
  label: string;
  gradient: RgbGradient;
  animation: RgbPresetAnimation;
  baseDuration: number;
};

export type RgbEffectSettings = {
  enabled: boolean;
  ambientBackground: boolean;
  preset: RgbPreset;
  target: RgbEffectTarget;
  direction: RgbGradientDirection;
  speed: number;
  thickness: number;
  glowIntensity: number;
  gradient: RgbGradient;
};

export const RGB_PRESETS: Record<RgbPreset, RgbPresetMeta> = {
  static: {
    label: "Статичный",
    animation: "static",
    baseDuration: 0,
    gradient: {
      angle: 135,
      colors: ["#7928ca", "#7928ca", "#7928ca"],
    },
  },
  "two-color": {
    label: "Двухцветный",
    animation: "spin",
    baseDuration: 4,
    gradient: {
      angle: 135,
      colors: ["#00f0ff", "#ff00aa", "#ff00aa"],
    },
  },
  rainbow: {
    label: "Радуга",
    animation: "sweep",
    baseDuration: 4,
    gradient: {
      angle: 90,
      colors: ["#ff0080", "#7928ca", "#0070f3"],
    },
  },
  cyberpunk: {
    label: "Киберпанк",
    animation: "spin-tri",
    baseDuration: 3,
    gradient: {
      angle: 135,
      colors: ["#00f0ff", "#ff00aa", "#ffe600"],
    },
  },
  sunset: {
    label: "Закат",
    animation: "sweep",
    baseDuration: 5,
    gradient: {
      angle: 120,
      colors: ["#ff6b35", "#f72585", "#7209b7"],
    },
  },
  ocean: {
    label: "Океан",
    animation: "sweep",
    baseDuration: 4,
    gradient: {
      angle: 160,
      colors: ["#00d4ff", "#0099ff", "#7b2ff7"],
    },
  },
  toxic: {
    label: "Токсик",
    animation: "spin-tri",
    baseDuration: 2.5,
    gradient: {
      angle: 90,
      colors: ["#39ff14", "#00ff88", "#b8ff00"],
    },
  },
  lava: {
    label: "Лава",
    animation: "sweep",
    baseDuration: 3.5,
    gradient: {
      angle: 45,
      colors: ["#ff4500", "#ff006e", "#ffbe0b"],
    },
  },
  aurora: {
    label: "Аврора",
    animation: "sweep",
    baseDuration: 6,
    gradient: {
      angle: 100,
      colors: ["#00ff87", "#60efff", "#a855f7"],
    },
  },
  synthwave: {
    label: "Синтвейв",
    animation: "spin-tri",
    baseDuration: 4,
    gradient: {
      angle: 180,
      colors: ["#ff00de", "#7b2ff7", "#00f5ff"],
    },
  },
  "neon-pulse": {
    label: "Неон-пульс",
    animation: "pulse",
    baseDuration: 2,
    gradient: {
      angle: 180,
      colors: ["#ff006e", "#8338ec", "#3a86ff"],
    },
  },
};

export const RGB_PRESET_LIST = Object.entries(RGB_PRESETS).map(
  ([id, meta]) => ({
    id: id as RgbPreset,
    label: meta.label,
  }),
);

/** @deprecated Use RGB_PRESETS[preset].gradient */
export const RGB_PRESET_GRADIENTS: Record<RgbPreset, RgbGradient> =
  Object.fromEntries(
    Object.entries(RGB_PRESETS).map(([id, meta]) => [id, meta.gradient]),
  ) as Record<RgbPreset, RgbGradient>;

export const DEFAULT_RGB_SETTINGS: RgbEffectSettings = {
  enabled: true,
  ambientBackground: true,
  preset: "neon-pulse",
  target: "full-panel",
  direction: "clockwise",
  speed: 5,
  thickness: 2,
  glowIntensity: 100,
  gradient: RGB_PRESETS["neon-pulse"].gradient,
};

export const RGB_STORAGE_KEY = "spotlight-rgb-settings";

export function migrateRgbSettings(
  parsed: Partial<RgbEffectSettings>,
): RgbEffectSettings {
  const presetMap: Record<string, RgbPreset> = {
    cyberpunk: "cyberpunk",
    "rainbow-wave": "rainbow",
    "neon-pulse": "neon-pulse",
    static: "static",
    "two-color": "two-color",
    rainbow: "rainbow",
    sunset: "sunset",
    ocean: "ocean",
    toxic: "toxic",
    lava: "lava",
    aurora: "aurora",
    synthwave: "synthwave",
  };

  const rawPreset = parsed.preset as string | undefined;
  const preset = rawPreset
    ? (presetMap[rawPreset] ??
      (rawPreset in RGB_PRESETS ? (rawPreset as RgbPreset) : "rainbow"))
    : DEFAULT_RGB_SETTINGS.preset;

  return {
    ...DEFAULT_RGB_SETTINGS,
    ...parsed,
    preset,
    target: "full-panel",
    direction: parsed.direction ?? DEFAULT_RGB_SETTINGS.direction,
    glowIntensity: parsed.glowIntensity ?? DEFAULT_RGB_SETTINGS.glowIntensity,
    ambientBackground:
      parsed.ambientBackground ?? DEFAULT_RGB_SETTINGS.ambientBackground,
    gradient: {
      ...DEFAULT_RGB_SETTINGS.gradient,
      ...parsed.gradient,
      angle:
        typeof parsed.gradient?.angle === "number"
          ? parsed.gradient.angle
          : getPresetGradient(preset).angle,
      colors: normalizeRgbGradientColors(
        parsed.gradient?.colors ?? getPresetGradient(preset).colors,
      ),
    },
  };
}

export function getPresetMeta(preset: RgbPreset): RgbPresetMeta {
  return RGB_PRESETS[preset];
}

export function getPresetGradient(preset: RgbPreset): RgbGradient {
  const g = RGB_PRESETS[preset].gradient;
  return { angle: g.angle, colors: [...g.colors] };
}

export function isPresetAnimated(preset: RgbPreset): boolean {
  return RGB_PRESETS[preset].animation !== "static";
}

export function getBaseDuration(preset: RgbPreset): number {
  return RGB_PRESETS[preset].baseDuration;
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
  nearAlpha: string;
  farAlpha: string;
  ambientOpacity: string;
} {
  const t = Math.max(0, Math.min(100, intensity)) / 100;
  return {
    blur: `${t * 8}px`,
    opacity: `${t * 0.25}`,
    nearAlpha: `${t * 0.45}`,
    farAlpha: `${t * 0.12}`,
    ambientOpacity: `${t * 0.5}`,
  };
}
