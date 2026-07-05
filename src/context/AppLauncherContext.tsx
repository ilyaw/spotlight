import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { MOCK_APPS } from "../data/mockApps";
import {
  APP_LAUNCHER_STORAGE_KEY,
  DEFAULT_APP_LAUNCHER_SETTINGS,
  basenameFromPath,
  initialsFromName,
  type AppLauncherSettings,
  type LauncherApp,
  type LauncherLayoutMode,
} from "../types/appLauncher";
import type { HotkeyCombo } from "../types/hotkey";

type AppLauncherContextValue = {
  apps: LauncherApp[];
  layoutMode: LauncherLayoutMode;
  setLayoutMode: (mode: LauncherLayoutMode) => void;
  addApp: (path: string, name?: string) => void;
  removeApp: (id: string) => void;
  setAppShortcut: (id: string, shortcut: HotkeyCombo | null) => void;
  clearAppShortcut: (id: string) => void;
};

const AppLauncherContext = createContext<AppLauncherContextValue | null>(null);

function loadSettings(): AppLauncherSettings {
  try {
    const raw = localStorage.getItem(APP_LAUNCHER_STORAGE_KEY);
    if (!raw) {
      return { ...DEFAULT_APP_LAUNCHER_SETTINGS, apps: MOCK_APPS };
    }

    const parsed = JSON.parse(raw) as Partial<AppLauncherSettings>;
    return {
      layoutMode: parsed.layoutMode ?? DEFAULT_APP_LAUNCHER_SETTINGS.layoutMode,
      apps:
        parsed.apps && parsed.apps.length > 0 ? parsed.apps : MOCK_APPS,
    };
  } catch {
    return { ...DEFAULT_APP_LAUNCHER_SETTINGS, apps: MOCK_APPS };
  }
}

function persistSettings(settings: AppLauncherSettings) {
  try {
    localStorage.setItem(APP_LAUNCHER_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore storage errors
  }
}

function randomColor(): string {
  const colors = [
    "#8B5CF6",
    "#06B6D4",
    "#22C55E",
    "#EAB308",
    "#F97316",
    "#EF4444",
    "#EC4899",
    "#3B82F6",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

export function AppLauncherProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppLauncherSettings>(loadSettings);

  useEffect(() => {
    persistSettings(settings);
  }, [settings]);

  const setLayoutMode = useCallback((layoutMode: LauncherLayoutMode) => {
    setSettings((prev) => ({ ...prev, layoutMode }));
  }, []);

  const addApp = useCallback((path: string, name?: string) => {
    const label = name ?? basenameFromPath(path);
    const app: LauncherApp = {
      id: crypto.randomUUID(),
      name: label,
      initials: initialsFromName(label),
      color: randomColor(),
      category: "system",
      path,
    };
    setSettings((prev) => ({ ...prev, apps: [...prev.apps, app] }));
  }, []);

  const removeApp = useCallback((id: string) => {
    setSettings((prev) => ({
      ...prev,
      apps: prev.apps.filter((a) => a.id !== id),
    }));
  }, []);

  const setAppShortcut = useCallback(
    (id: string, shortcut: HotkeyCombo | null) => {
      setSettings((prev) => ({
        ...prev,
        apps: prev.apps.map((a) =>
          a.id === id ? { ...a, shortcut } : a,
        ),
      }));
    },
    [],
  );

  const clearAppShortcut = useCallback((id: string) => {
    setSettings((prev) => ({
      ...prev,
      apps: prev.apps.map((a) =>
        a.id === id ? { ...a, shortcut: null } : a,
      ),
    }));
  }, []);

  const value = useMemo<AppLauncherContextValue>(
    () => ({
      apps: settings.apps,
      layoutMode: settings.layoutMode,
      setLayoutMode,
      addApp,
      removeApp,
      setAppShortcut,
      clearAppShortcut,
    }),
    [
      settings,
      setLayoutMode,
      addApp,
      removeApp,
      setAppShortcut,
      clearAppShortcut,
    ],
  );

  return (
    <AppLauncherContext.Provider value={value}>
      {children}
    </AppLauncherContext.Provider>
  );
}

export function useAppLauncher(): AppLauncherContextValue {
  const context = useContext(AppLauncherContext);
  if (!context) {
    throw new Error("useAppLauncher must be used within AppLauncherProvider");
  }
  return context;
}
