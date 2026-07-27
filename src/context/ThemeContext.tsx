import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRgbEffect } from "./RgbEffectContext";
import { sanitizeCssColor } from "../lib/cssColor";
import {
  BUILTIN_THEME_PICKER_HEX,
  createThemeId,
  DEFAULT_THEME,
  DEFAULT_THEME_GRADIENT,
  isBuiltinThemeId,
  normalizeCustomTheme,
  THEME_LIBRARY_STORAGE_KEY,
  THEME_STORAGE_KEY,
  type CustomTheme,
  type ThemeColors,
  type ThemeGradient,
  type ThemeId,
  type ThemeLibraryState,
  type ThemeMode,
} from "../types/theme";

type ThemeDraft = {
  name: string;
  baseMode: ThemeMode;
  colors: ThemeColors;
  gradient: ThemeGradient;
};

type ThemeContextValue = {
  theme: ThemeMode;
  activeId: ThemeId;
  customThemes: CustomTheme[];
  activeCustomTheme: CustomTheme | null;
  setTheme: (theme: ThemeMode) => void;
  setActiveTheme: (id: ThemeId) => void;
  toggleTheme: () => void;
  createTheme: (draft: ThemeDraft) => CustomTheme;
  updateTheme: (id: string, draft: ThemeDraft) => void;
  renameTheme: (id: string, name: string) => void;
  deleteTheme: (id: string) => void;
  getBuiltinPickerColors: (mode: ThemeMode) => ThemeColors;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

const PANEL_COLOR_VARS: Record<keyof ThemeColors, string> = {
  bg: "--color-deck-bg",
  surface: "--color-deck-surface",
  surfaceHover: "--color-deck-surface-hover",
  border: "--color-deck-border",
  text: "--color-deck-text",
  muted: "--color-deck-muted",
  accent: "--color-deck-accent",
};

function clearCustomColorVars(root: HTMLElement) {
  for (const cssVar of Object.values(PANEL_COLOR_VARS)) {
    root.style.removeProperty(cssVar);
  }
  root.style.removeProperty("--color-deck-input-bg");
  root.style.removeProperty("--color-deck-range-track");
  root.style.removeProperty("--color-deck-range-thumb");
  root.style.removeProperty("--color-deck-range-thumb-ring");
  root.style.removeProperty("--color-deck-control-bg");
  root.style.removeProperty("--color-deck-control-border");
}

function applyCustomColorVars(
  root: HTMLElement,
  colors: ThemeColors,
  baseMode: ThemeMode,
) {
  const picker = BUILTIN_THEME_PICKER_HEX[baseMode];
  const bg = sanitizeCssColor(colors.bg, picker.bg);
  const surface = sanitizeCssColor(colors.surface, picker.surface);
  const surfaceHover = sanitizeCssColor(colors.surfaceHover, picker.surfaceHover);
  const border = sanitizeCssColor(colors.border, picker.border);
  const text = sanitizeCssColor(colors.text, picker.text);
  const muted = sanitizeCssColor(colors.muted, picker.muted);
  const accent = sanitizeCssColor(colors.accent, picker.accent);

  root.style.setProperty(PANEL_COLOR_VARS.bg, bg);
  root.style.setProperty(PANEL_COLOR_VARS.surface, surface);
  root.style.setProperty(PANEL_COLOR_VARS.surfaceHover, surfaceHover);
  root.style.setProperty(PANEL_COLOR_VARS.border, border);
  root.style.setProperty(PANEL_COLOR_VARS.text, text);
  root.style.setProperty(PANEL_COLOR_VARS.muted, muted);
  root.style.setProperty(PANEL_COLOR_VARS.accent, accent);

  root.style.setProperty("--color-deck-input-bg", "transparent");
  root.style.setProperty("--color-deck-range-track", border);
  root.style.setProperty("--color-deck-range-thumb", "#ffffff");
  root.style.setProperty(
    "--color-deck-range-thumb-ring",
    `color-mix(in srgb, ${accent} 45%, transparent)`,
  );
  root.style.setProperty("--color-deck-control-bg", surface);
  root.style.setProperty("--color-deck-control-border", border);
}

function applyThemeToDocument(
  baseMode: ThemeMode,
  customColors: ThemeColors | null,
) {
  const root = document.documentElement;
  root.dataset.theme = baseMode;
  root.classList.toggle("dark", baseMode === "dark");

  if (customColors) {
    applyCustomColorVars(root, customColors, baseMode);
  } else {
    clearCustomColorVars(root);
  }
}

function loadLibrary(): ThemeLibraryState {
  try {
    const rawLibrary = localStorage.getItem(THEME_LIBRARY_STORAGE_KEY);
    if (rawLibrary) {
      const parsed = JSON.parse(rawLibrary) as Partial<ThemeLibraryState>;
      const customThemes = Array.isArray(parsed.customThemes)
        ? parsed.customThemes
            .map((t) => normalizeCustomTheme(t as Partial<CustomTheme>))
            .filter((t): t is CustomTheme => t !== null)
        : [];

      let activeId: ThemeId =
        typeof parsed.activeId === "string" ? parsed.activeId : DEFAULT_THEME;

      if (
        !isBuiltinThemeId(activeId) &&
        !customThemes.some((t) => t.id === activeId)
      ) {
        activeId = DEFAULT_THEME;
      }

      return { activeId, customThemes };
    }

    const legacy = localStorage.getItem(THEME_STORAGE_KEY);
    if (legacy === "light" || legacy === "dark") {
      return { activeId: legacy, customThemes: [] };
    }
  } catch {
    // ignore
  }

  return { activeId: DEFAULT_THEME, customThemes: [] };
}

function persistLibrary(state: ThemeLibraryState) {
  try {
    localStorage.setItem(THEME_LIBRARY_STORAGE_KEY, JSON.stringify(state));
    if (isBuiltinThemeId(state.activeId)) {
      localStorage.setItem(THEME_STORAGE_KEY, state.activeId);
    }
  } catch {
    // ignore storage errors
  }
}

function resolveBaseMode(
  activeId: ThemeId,
  customThemes: CustomTheme[],
): ThemeMode {
  if (isBuiltinThemeId(activeId)) return activeId;
  return (
    customThemes.find((t) => t.id === activeId)?.baseMode ?? DEFAULT_THEME
  );
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { setGradient } = useRgbEffect();
  const [library, setLibrary] = useState<ThemeLibraryState>(loadLibrary);
  const libraryRef = useRef(library);
  libraryRef.current = library;

  const activeCustomTheme = useMemo(() => {
    if (isBuiltinThemeId(library.activeId)) return null;
    return library.customThemes.find((t) => t.id === library.activeId) ?? null;
  }, [library.activeId, library.customThemes]);

  const theme = resolveBaseMode(library.activeId, library.customThemes);

  useEffect(() => {
    applyThemeToDocument(theme, activeCustomTheme?.colors ?? null);
    persistLibrary(library);
  }, [theme, activeCustomTheme, library]);

  const setActiveTheme = useCallback(
    (id: ThemeId) => {
      if (isBuiltinThemeId(id)) {
        setLibrary((prev) => ({ ...prev, activeId: id }));
        return;
      }

      const custom = libraryRef.current.customThemes.find((t) => t.id === id);
      if (!custom) return;

      setLibrary((prev) => ({ ...prev, activeId: id }));
      setGradient({
        angle: custom.gradient.angle,
        colors: [...custom.gradient.colors],
      });
    },
    [setGradient],
  );

  const setTheme = useCallback(
    (next: ThemeMode) => {
      setActiveTheme(next);
    },
    [setActiveTheme],
  );

  const toggleTheme = useCallback(() => {
    setLibrary((prev) => {
      const current = resolveBaseMode(prev.activeId, prev.customThemes);
      return {
        ...prev,
        activeId: current === "dark" ? "light" : "dark",
      };
    });
  }, []);

  const createTheme = useCallback(
    (draft: ThemeDraft) => {
      const themeRecord = normalizeCustomTheme({
        id: createThemeId(),
        name: draft.name,
        baseMode: draft.baseMode,
        colors: draft.colors,
        gradient: draft.gradient,
      });
      if (!themeRecord) {
        throw new Error("Failed to create theme: invalid draft");
      }

      setLibrary((prev) => ({
        activeId: themeRecord.id,
        customThemes: [...prev.customThemes, themeRecord],
      }));

      setGradient({
        angle: themeRecord.gradient.angle,
        colors: [...themeRecord.gradient.colors],
      });

      return themeRecord;
    },
    [setGradient],
  );

  const updateTheme = useCallback(
    (id: string, draft: ThemeDraft) => {
      const sanitized = normalizeCustomTheme({
        id,
        name: draft.name,
        baseMode: draft.baseMode,
        colors: draft.colors,
        gradient: draft.gradient,
      });
      if (!sanitized) return;

      setLibrary((prev) => {
        if (!prev.customThemes.some((t) => t.id === id)) return prev;

        return {
          activeId: id,
          customThemes: prev.customThemes.map((t) =>
            t.id === id ? sanitized : t,
          ),
        };
      });

      setGradient({
        angle: sanitized.gradient.angle,
        colors: [...sanitized.gradient.colors],
      });
    },
    [setGradient],
  );

  const renameTheme = useCallback((id: string, name: string) => {
    const trimmed = name.trim().slice(0, 48);
    if (!trimmed) return;
    setLibrary((prev) => ({
      ...prev,
      customThemes: prev.customThemes.map((t) =>
        t.id === id ? { ...t, name: trimmed } : t,
      ),
    }));
  }, []);

  const deleteTheme = useCallback((id: string) => {
    setLibrary((prev) => {
      const target = prev.customThemes.find((t) => t.id === id);
      if (!target) return prev;

      const customThemes = prev.customThemes.filter((t) => t.id !== id);
      const activeId =
        prev.activeId === id ? target.baseMode : prev.activeId;

      return { activeId, customThemes };
    });
  }, []);

  const getBuiltinPickerColors = useCallback(
    (mode: ThemeMode) => ({ ...BUILTIN_THEME_PICKER_HEX[mode] }),
    [],
  );

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      activeId: library.activeId,
      customThemes: library.customThemes,
      activeCustomTheme,
      setTheme,
      setActiveTheme,
      toggleTheme,
      createTheme,
      updateTheme,
      renameTheme,
      deleteTheme,
      getBuiltinPickerColors,
    }),
    [
      theme,
      library.activeId,
      library.customThemes,
      activeCustomTheme,
      setTheme,
      setActiveTheme,
      toggleTheme,
      createTheme,
      updateTheme,
      renameTheme,
      deleteTheme,
      getBuiltinPickerColors,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}

export function createEmptyDraft(
  baseMode: ThemeMode,
  gradient: ThemeGradient = DEFAULT_THEME_GRADIENT,
): ThemeDraft {
  return {
    name: "Моя тема",
    baseMode,
    colors: { ...BUILTIN_THEME_PICKER_HEX[baseMode] },
    gradient: {
      angle: gradient.angle,
      colors: [...gradient.colors],
    },
  };
}
