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
  DEFAULT_QUICK_LAUNCH_SETTINGS,
  QUICK_LAUNCH_STORAGE_KEY,
  type QuickLaunchKey,
  type QuickLaunchSettings,
  type QuickLaunchSlot,
} from "../types/quickLaunch";

type QuickLaunchContextValue = {
  settings: QuickLaunchSettings;
  getSlot: (key: QuickLaunchKey) => QuickLaunchSlot;
  setSlot: (key: QuickLaunchKey, path: string, label: string) => void;
  clearSlot: (key: QuickLaunchKey) => void;
};

const QuickLaunchContext = createContext<QuickLaunchContextValue | null>(
  null,
);

function loadSettings(): QuickLaunchSettings {
  try {
    const raw = localStorage.getItem(QUICK_LAUNCH_STORAGE_KEY);
    if (!raw) return DEFAULT_QUICK_LAUNCH_SETTINGS;

    const parsed = JSON.parse(raw) as Partial<QuickLaunchSettings>;
    return {
      slots: {
        ...DEFAULT_QUICK_LAUNCH_SETTINGS.slots,
        ...parsed.slots,
      },
    };
  } catch {
    return DEFAULT_QUICK_LAUNCH_SETTINGS;
  }
}

function persistSettings(settings: QuickLaunchSettings) {
  try {
    localStorage.setItem(QUICK_LAUNCH_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore storage errors
  }
}

export function QuickLaunchProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<QuickLaunchSettings>(loadSettings);

  useEffect(() => {
    persistSettings(settings);
  }, [settings]);

  const getSlot = useCallback(
    (key: QuickLaunchKey) => settings.slots[key],
    [settings],
  );

  const setSlot = useCallback(
    (key: QuickLaunchKey, path: string, label: string) => {
      setSettings((prev) => ({
        slots: {
          ...prev.slots,
          [key]: { key, path, label },
        },
      }));
    },
    [],
  );

  const clearSlot = useCallback((key: QuickLaunchKey) => {
    setSettings((prev) => ({
      slots: {
        ...prev.slots,
        [key]: { key, path: "", label: "" },
      },
    }));
  }, []);

  const value = useMemo<QuickLaunchContextValue>(
    () => ({ settings, getSlot, setSlot, clearSlot }),
    [settings, getSlot, setSlot, clearSlot],
  );

  return (
    <QuickLaunchContext.Provider value={value}>
      {children}
    </QuickLaunchContext.Provider>
  );
}

export function useQuickLaunch(): QuickLaunchContextValue {
  const context = useContext(QuickLaunchContext);
  if (!context) {
    throw new Error("useQuickLaunch must be used within QuickLaunchProvider");
  }
  return context;
}
