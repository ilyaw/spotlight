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
  RGB_STORAGE_KEY,
  type RgbEffectSettings,
  type RgbEffectTarget,
  type RgbGradient,
  type RgbPreset,
} from "../types/rgbEffect";

type RgbEffectContextValue = {
  settings: RgbEffectSettings;
  setEnabled: (enabled: boolean) => void;
  setPreset: (preset: RgbPreset) => void;
  setTarget: (target: RgbEffectTarget) => void;
  setSpeed: (speed: number) => void;
  setThickness: (thickness: number) => void;
  setGradient: (gradient: RgbGradient) => void;
  resetGradientToPreset: () => void;
  updateSettings: (partial: Partial<RgbEffectSettings>) => void;
};

const RgbEffectContext = createContext<RgbEffectContextValue | null>(null);

function loadSettings(): RgbEffectSettings {
  try {
    const raw = localStorage.getItem(RGB_STORAGE_KEY);
    if (!raw) return DEFAULT_RGB_SETTINGS;

    const parsed = JSON.parse(raw) as Partial<RgbEffectSettings>;
    return {
      ...DEFAULT_RGB_SETTINGS,
      ...parsed,
      gradient: {
        ...DEFAULT_RGB_SETTINGS.gradient,
        ...parsed.gradient,
        colors: parsed.gradient?.colors ?? DEFAULT_RGB_SETTINGS.gradient.colors,
      },
    };
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

  const setPreset = useCallback(
    (preset: RgbPreset) => {
      setSettings((prev) => ({
        ...prev,
        preset,
        gradient: getPresetGradient(preset),
      }));
    },
    [],
  );

  const setTarget = useCallback(
    (target: RgbEffectTarget) => updateSettings({ target }),
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
      setTarget,
      setSpeed,
      setThickness,
      setGradient,
      resetGradientToPreset,
      updateSettings,
    }),
    [
      settings,
      setEnabled,
      setPreset,
      setTarget,
      setSpeed,
      setThickness,
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
