import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_RGB_SETTINGS,
  getPresetGradient,
  RGB_PRESETS,
  RGB_STORAGE_KEY,
  type RgbEffectSettings,
  type RgbGradient,
  type RgbGradientDirection,
  type RgbPreset,
} from "../types/rgbEffect";

type RgbEffectContextValue = {
  settings: RgbEffectSettings;
  setEnabled: (enabled: boolean) => void;
  setPreset: (preset: RgbPreset) => void;
  setDirection: (direction: RgbGradientDirection) => void;
  setSpeed: (speed: number) => void;
  setThickness: (thickness: number) => void;
  setGlowIntensity: (glowIntensity: number) => void;
  setAmbientBackground: (ambientBackground: boolean) => void;
  setGradient: (gradient: RgbGradient) => void;
  resetGradientToPreset: () => void;
  updateSettings: (partial: Partial<RgbEffectSettings>) => void;
};

const RgbEffectContext = createContext<RgbEffectContextValue | null>(null);

function migrateSettings(parsed: Partial<RgbEffectSettings>): RgbEffectSettings {
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
      colors: parsed.gradient?.colors ?? getPresetGradient(preset).colors,
    },
  };
}

function loadSettings(): RgbEffectSettings {
  try {
    const raw = localStorage.getItem(RGB_STORAGE_KEY);
    if (!raw) return DEFAULT_RGB_SETTINGS;

    const parsed = JSON.parse(raw) as Partial<RgbEffectSettings>;
    return migrateSettings(parsed);
  } catch {
    return DEFAULT_RGB_SETTINGS;
  }
}

function persistSettings(settings: RgbEffectSettings) {
  try {
    localStorage.setItem(RGB_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore storage errors
  }
}

export function RgbEffectProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<RgbEffectSettings>(loadSettings);

  useEffect(() => {
    persistSettings(settings);
  }, [settings]);

  const updateSettings = useCallback((partial: Partial<RgbEffectSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  const setEnabled = useCallback(
    (enabled: boolean) => updateSettings({ enabled }),
    [updateSettings],
  );

  const setPreset = useCallback((preset: RgbPreset) => {
    setSettings((prev) => ({
      ...prev,
      preset,
      gradient: getPresetGradient(preset),
    }));
  }, []);

  const setDirection = useCallback(
    (direction: RgbGradientDirection) => updateSettings({ direction }),
    [updateSettings],
  );

  const setSpeed = useCallback(
    (speed: number) => updateSettings({ speed }),
    [updateSettings],
  );

  const setThickness = useCallback(
    (thickness: number) => updateSettings({ thickness }),
    [updateSettings],
  );

  const setGlowIntensity = useCallback(
    (glowIntensity: number) => updateSettings({ glowIntensity }),
    [updateSettings],
  );

  const setAmbientBackground = useCallback(
    (ambientBackground: boolean) => updateSettings({ ambientBackground }),
    [updateSettings],
  );

  const setGradient = useCallback(
    (gradient: RgbGradient) => updateSettings({ gradient }),
    [updateSettings],
  );

  const resetGradientToPreset = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      gradient: getPresetGradient(prev.preset),
    }));
  }, []);

  const value = useMemo<RgbEffectContextValue>(
    () => ({
      settings,
      setEnabled,
      setPreset,
      setDirection,
      setSpeed,
      setThickness,
      setGlowIntensity,
      setAmbientBackground,
      setGradient,
      resetGradientToPreset,
      updateSettings,
    }),
    [
      settings,
      setEnabled,
      setPreset,
      setDirection,
      setSpeed,
      setThickness,
      setGlowIntensity,
      setAmbientBackground,
      setGradient,
      resetGradientToPreset,
      updateSettings,
    ],
  );

  return (
    <RgbEffectContext.Provider value={value}>
      {children}
    </RgbEffectContext.Provider>
  );
}

export function useRgbEffect(): RgbEffectContextValue {
  const context = useContext(RgbEffectContext);
  if (!context) {
    throw new Error("useRgbEffect must be used within RgbEffectProvider");
  }
  return context;
}
