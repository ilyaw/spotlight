import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { invoke } from "@tauri-apps/api/core";
import { disable, enable, isEnabled } from "@tauri-apps/plugin-autostart";
import {
  DEFAULT_SYSTEM_BEHAVIOR,
  SYSTEM_BEHAVIOR_STORAGE_KEY,
  type SystemBehaviorSettings,
} from "../types/systemBehavior";

type SystemBehaviorContextValue = {
  settings: SystemBehaviorSettings;
  setLaunchAtStartup: (enabled: boolean) => void;
  setShowWindowOnLaunch: (enabled: boolean) => void;
  setRunInBackground: (enabled: boolean) => void;
  setHideFromTaskbar: (enabled: boolean) => void;
  setHideOnFocusLoss: (enabled: boolean) => void;
  quitApp: () => void;
  error: string | null;
};

const SystemBehaviorContext = createContext<SystemBehaviorContextValue | null>(
  null,
);

function loadSettings(): SystemBehaviorSettings {
  try {
    const raw = localStorage.getItem(SYSTEM_BEHAVIOR_STORAGE_KEY);
    if (!raw) return DEFAULT_SYSTEM_BEHAVIOR;

    const parsed = JSON.parse(raw) as Partial<SystemBehaviorSettings>;
    return {
      ...DEFAULT_SYSTEM_BEHAVIOR,
      ...parsed,
    };
  } catch {
    return DEFAULT_SYSTEM_BEHAVIOR;
  }
}

function persistSettings(settings: SystemBehaviorSettings) {
  try {
    localStorage.setItem(SYSTEM_BEHAVIOR_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore storage errors
  }
}

function toRustBehavior(settings: SystemBehaviorSettings) {
  return {
    showWindowOnLaunch: settings.showWindowOnLaunch,
    runInBackground: settings.runInBackground,
    hideFromTaskbar: settings.hideFromTaskbar,
    hideOnFocusLoss: settings.hideOnFocusLoss,
  };
}

async function syncAutostart(enabled: boolean) {
  const active = await isEnabled();
  if (enabled && !active) {
    await enable();
  } else if (!enabled && active) {
    await disable();
  }
}

export function SystemBehaviorProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<SystemBehaviorSettings>(loadSettings);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    persistSettings(settings);

    let cancelled = false;

    void (async () => {
      try {
        await invoke("apply_system_behavior", {
          behavior: toRustBehavior(settings),
        });
        await syncAutostart(settings.launchAtStartup);
        if (!cancelled) setError(null);
      } catch (err: unknown) {
        if (!cancelled) setError(String(err));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [settings]);

  const update = useCallback(
    (partial: Partial<SystemBehaviorSettings>) => {
      setSettings((prev) => ({ ...prev, ...partial }));
    },
    [],
  );

  const setLaunchAtStartup = useCallback(
    (launchAtStartup: boolean) => update({ launchAtStartup }),
    [update],
  );

  const setShowWindowOnLaunch = useCallback(
    (showWindowOnLaunch: boolean) => update({ showWindowOnLaunch }),
    [update],
  );

  const setRunInBackground = useCallback(
    (runInBackground: boolean) => update({ runInBackground }),
    [update],
  );

  const setHideFromTaskbar = useCallback(
    (hideFromTaskbar: boolean) => update({ hideFromTaskbar }),
    [update],
  );

  const setHideOnFocusLoss = useCallback(
    (hideOnFocusLoss: boolean) => update({ hideOnFocusLoss }),
    [update],
  );

  const quitApp = useCallback(() => {
    void invoke("quit_app");
  }, []);

  const value = useMemo<SystemBehaviorContextValue>(
    () => ({
      settings,
      setLaunchAtStartup,
      setShowWindowOnLaunch,
      setRunInBackground,
      setHideFromTaskbar,
      setHideOnFocusLoss,
      quitApp,
      error,
    }),
    [
      settings,
      setLaunchAtStartup,
      setShowWindowOnLaunch,
      setRunInBackground,
      setHideFromTaskbar,
      setHideOnFocusLoss,
      quitApp,
      error,
    ],
  );

  return (
    <SystemBehaviorContext.Provider value={value}>
      {children}
    </SystemBehaviorContext.Provider>
  );
}

export function useSystemBehavior(): SystemBehaviorContextValue {
  const context = useContext(SystemBehaviorContext);
  if (!context) {
    throw new Error(
      "useSystemBehavior must be used within SystemBehaviorProvider",
    );
  }
  return context;
}
