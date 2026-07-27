import { sanitizeCssColor } from "../lib/cssColor";

export type ThemeMode = "dark" | "light";

export type ThemeId = ThemeMode | (string & {});

export type ThemeColors = {
  bg: string;
  surface: string;
  surfaceHover: string;
  border: string;
  text: string;
  muted: string;
  accent: string;
};

export type ThemeGradient = {
  angle: number;
  colors: string[];
};

export type CustomTheme = {
  id: string;
  name: string;
  baseMode: ThemeMode;
  colors: ThemeColors;
  gradient: ThemeGradient;
};

export type ThemeLibraryState = {
  activeId: ThemeId;
  customThemes: CustomTheme[];
};

export const THEME_STORAGE_KEY = "spotlight-theme";
export const THEME_LIBRARY_STORAGE_KEY = "spotlight-theme-library";

export const DEFAULT_THEME: ThemeMode = "dark";

export const MIN_GRADIENT_STOPS = 2;
export const MAX_GRADIENT_STOPS = 6;

export const BUILTIN_THEME_COLORS: Record<ThemeMode, ThemeColors> = {
  dark: {
    bg: "rgb(24 24 27 / 0.92)",
    surface: "rgb(39 39 42 / 0.6)",
    surfaceHover: "rgb(63 63 70 / 0.5)",
    border: "rgb(255 255 255 / 0.1)",
    text: "rgb(244 244 245)",
    muted: "rgb(161 161 170)",
    accent: "rgb(139 92 246)",
  },
  light: {
    bg: "rgb(255 255 255 / 0.92)",
    surface: "rgb(244 244 245 / 0.8)",
    surfaceHover: "rgb(228 228 231 / 0.8)",
    border: "rgb(0 0 0 / 0.08)",
    text: "rgb(24 24 27)",
    muted: "rgb(113 113 122)",
    accent: "rgb(124 58 237)",
  },
};

/** Solid hex defaults for color pickers (approximates glass tokens). */
export const BUILTIN_THEME_PICKER_HEX: Record<ThemeMode, ThemeColors> = {
  dark: {
    bg: "#18181b",
    surface: "#27272a",
    surfaceHover: "#3f3f46",
    border: "#3f3f46",
    text: "#f4f4f5",
    muted: "#a1a1aa",
    accent: "#8b5cf6",
  },
  light: {
    bg: "#ffffff",
    surface: "#f4f4f5",
    surfaceHover: "#e4e4e7",
    border: "#e4e4e7",
    text: "#18181b",
    muted: "#71717a",
    accent: "#7c3aed",
  },
};

export const DEFAULT_THEME_GRADIENT: ThemeGradient = {
  angle: 180,
  colors: ["#ff006e", "#8338ec", "#3a86ff"],
};

export const THEME_COLOR_LABELS: Record<keyof ThemeColors, string> = {
  bg: "Фон панели",
  surface: "Поверхность",
  surfaceHover: "Поверхность (hover)",
  border: "Граница",
  text: "Текст",
  muted: "Приглушённый текст",
  accent: "Акцент",
};

export function isBuiltinThemeId(id: ThemeId): id is ThemeMode {
  return id === "dark" || id === "light";
}

export function createThemeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `custom-${crypto.randomUUID()}`;
  }
  return `custom-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function clampGradientColors(colors: string[]): string[] {
  const fill = DEFAULT_THEME_GRADIENT.colors;
  const cleaned = colors
    .filter((c): c is string => typeof c === "string" && c.length > 0)
    .map((c, i) => sanitizeCssColor(c, fill[i % fill.length] ?? "#8b5cf6"));

  if (cleaned.length < MIN_GRADIENT_STOPS) {
    while (cleaned.length < MIN_GRADIENT_STOPS) {
      cleaned.push(fill[cleaned.length % fill.length] ?? "#8b5cf6");
    }
  }
  return cleaned.slice(0, MAX_GRADIENT_STOPS);
}

export function normalizeThemeGradient(
  gradient: Partial<ThemeGradient> | undefined,
  fallback: ThemeGradient = DEFAULT_THEME_GRADIENT,
): ThemeGradient {
  return {
    angle: typeof gradient?.angle === "number" ? gradient.angle : fallback.angle,
    colors: clampGradientColors(gradient?.colors ?? fallback.colors),
  };
}

export function normalizeCustomTheme(
  raw: Partial<CustomTheme> & { id?: string },
): CustomTheme | null {
  if (!raw.id || typeof raw.id !== "string") return null;
  if (isBuiltinThemeId(raw.id)) return null;

  const baseMode: ThemeMode =
    raw.baseMode === "light" || raw.baseMode === "dark"
      ? raw.baseMode
      : DEFAULT_THEME;

  const picker = BUILTIN_THEME_PICKER_HEX[baseMode];
  const colors: ThemeColors = {
    bg: sanitizeCssColor(raw.colors?.bg ?? picker.bg, picker.bg),
    surface: sanitizeCssColor(raw.colors?.surface ?? picker.surface, picker.surface),
    surfaceHover: sanitizeCssColor(
      raw.colors?.surfaceHover ?? picker.surfaceHover,
      picker.surfaceHover,
    ),
    border: sanitizeCssColor(raw.colors?.border ?? picker.border, picker.border),
    text: sanitizeCssColor(raw.colors?.text ?? picker.text, picker.text),
    muted: sanitizeCssColor(raw.colors?.muted ?? picker.muted, picker.muted),
    accent: sanitizeCssColor(raw.colors?.accent ?? picker.accent, picker.accent),
  };

  return {
    id: raw.id,
    name: (raw.name?.trim() || "Без названия").slice(0, 48),
    baseMode,
    colors,
    gradient: normalizeThemeGradient(raw.gradient),
  };
}
