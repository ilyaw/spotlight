import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { fetchInstalledApps } from "../lib/tauriApps";
import {
  APP_LAUNCHER_STORAGE_KEY,
  DEFAULT_APP_LAUNCHER_SETTINGS,
  mergeApps,
  type AppLauncherSettings,
  type FilterSettings,
  type LauncherApp,
  type LauncherLayoutMode,
  type ManualAppEntry,
} from "../types/appLauncher";
import type { HotkeyCombo } from "../types/hotkey";

type AppLauncherContextValue = {
  apps: LauncherApp[];
  layoutMode: LauncherLayoutMode;
  filterSettings: FilterSettings;
  isLoading: boolean;
  scanError: string | null;
  setLayoutMode: (mode: LauncherLayoutMode) => void;
  refreshApps: () => Promise<void>;
  addManualApp: (entry: ManualAppEntry) => void;
  removeApp: (path: string) => void;
  setAppShortcut: (path: string, shortcut: HotkeyCombo | null) => void;
  clearAppShortcut: (path: string) => void;
  setAppCategories: (path: string, categoryIds: string[]) => void;
  setFilterSettings: (settings: FilterSettings) => void;
  addFilter: (label: string) => void;
  updateFilter: (id: string, label: string) => void;
  removeFilter: (id: string) => void;
  setFiltersEnabled: (enabled: boolean) => void;
};

const AppLauncherContext = createContext<AppLauncherContextValue | null>(null);

function loadPersistedSettings(): AppLauncherSettings {
  try {
    const raw = localStorage.getItem(APP_LAUNCHER_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_APP_LAUNCHER_SETTINGS };

    const parsed = JSON.parse(raw) as Partial<AppLauncherSettings>;
    return {
      layoutMode: parsed.layoutMode ?? DEFAULT_APP_LAUNCHER_SETTINGS.layoutMode,
      manualApps: parsed.manualApps ?? [],
      overrides: parsed.overrides ?? [],
      filterSettings: {
        ...DEFAULT_APP_LAUNCHER_SETTINGS.filterSettings,
        ...parsed.filterSettings,
        filters: parsed.filterSettings?.filters ?? [],
      },
      hasIndexedApps: parsed.hasIndexedApps ?? false,
      indexedApps: parsed.indexedApps ?? [],
    };
  } catch {
    return { ...DEFAULT_APP_LAUNCHER_SETTINGS };
  }
}

function persistSettings(settings: AppLauncherSettings) {
  try {
    localStorage.setItem(APP_LAUNCHER_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // ignore storage errors
  }
}

function upsertOverride(
  overrides: AppLauncherSettings["overrides"],
  path: string,
  patch: Partial<AppLauncherSettings["overrides"][number]>,
): AppLauncherSettings["overrides"] {
  const index = overrides.findIndex((o) => o.path === path);
  if (index === -1) {
    return [
      ...overrides,
      {
        path,
        categoryIds: patch.categoryIds ?? [],
        shortcut: patch.shortcut ?? null,
      },
    ];
  }
  const next = [...overrides];
  next[index] = { ...next[index], ...patch, path };
  return next;
}

export function AppLauncherProvider({ children }: { children: ReactNode }) {
  const [persisted, setPersisted] = useState<AppLauncherSettings>(
    loadPersistedSettings,
  );
  const [isLoading, setIsLoading] = useState(!persisted.hasIndexedApps);
  const [scanError, setScanError] = useState<string | null>(null);

  useEffect(() => {
    persistSettings(persisted);
  }, [persisted]);

  const refreshApps = useCallback(async () => {
    setIsLoading(true);
    setScanError(null);
    try {
      const installed = await fetchInstalledApps();
      setPersisted((prev) => ({
        ...prev,
        hasIndexedApps: true,
        indexedApps: installed,
      }));
    } catch (err) {
      setScanError(
        err instanceof Error ? err.message : "Failed to scan installed apps",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (persisted.hasIndexedApps) return;

    let cancelled = false;

    const runInitialScan = async () => {
      setIsLoading(true);
      setScanError(null);
      try {
        const installed = await fetchInstalledApps();
        if (cancelled) return;
        setPersisted((prev) => ({
          ...prev,
          hasIndexedApps: true,
          indexedApps: installed,
        }));
      } catch (err) {
        if (cancelled) return;
        setScanError(
          err instanceof Error ? err.message : "Failed to scan installed apps",
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    void runInitialScan();

    return () => {
      cancelled = true;
    };
  }, [persisted.hasIndexedApps]);

  const apps = useMemo(
    () => mergeApps(persisted.indexedApps, persisted),
    [persisted],
  );

  const setLayoutMode = useCallback((layoutMode: LauncherLayoutMode) => {
    setPersisted((prev) => ({ ...prev, layoutMode }));
  }, []);

  const addManualApp = useCallback((entry: ManualAppEntry) => {
    setPersisted((prev) => {
      const without = prev.manualApps.filter((a) => a.path !== entry.path);
      return {
        ...prev,
        manualApps: [...without, entry],
      };
    });
  }, []);

  const removeApp = useCallback((path: string) => {
    setPersisted((prev) => ({
      ...prev,
      manualApps: prev.manualApps.filter((a) => a.path !== path),
      overrides: prev.overrides.filter((o) => o.path !== path),
    }));
  }, []);

  const setAppShortcut = useCallback(
    (path: string, shortcut: HotkeyCombo | null) => {
      setPersisted((prev) => ({
        ...prev,
        overrides: upsertOverride(prev.overrides, path, { shortcut }),
      }));
    },
    [],
  );

  const clearAppShortcut = useCallback((path: string) => {
    setPersisted((prev) => ({
      ...prev,
      overrides: upsertOverride(prev.overrides, path, { shortcut: null }),
    }));
  }, []);

  const setAppCategories = useCallback(
    (path: string, categoryIds: string[]) => {
      setPersisted((prev) => ({
        ...prev,
        overrides: upsertOverride(prev.overrides, path, { categoryIds }),
      }));
    },
    [],
  );

  const setFilterSettings = useCallback((filterSettings: FilterSettings) => {
    setPersisted((prev) => ({ ...prev, filterSettings }));
  }, []);

  const addFilter = useCallback((label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    setPersisted((prev) => ({
      ...prev,
      filterSettings: {
        ...prev.filterSettings,
        filters: [
          ...prev.filterSettings.filters,
          { id: crypto.randomUUID(), label: trimmed },
        ],
      },
    }));
  }, []);

  const updateFilter = useCallback((id: string, label: string) => {
    const trimmed = label.trim();
    if (!trimmed) return;
    setPersisted((prev) => ({
      ...prev,
      filterSettings: {
        ...prev.filterSettings,
        filters: prev.filterSettings.filters.map((f) =>
          f.id === id ? { ...f, label: trimmed } : f,
        ),
      },
    }));
  }, []);

  const removeFilter = useCallback((id: string) => {
    setPersisted((prev) => ({
      ...prev,
      filterSettings: {
        ...prev.filterSettings,
        filters: prev.filterSettings.filters.filter((f) => f.id !== id),
      },
      manualApps: prev.manualApps.map((a) => ({
        ...a,
        categoryIds: a.categoryIds.filter((cid) => cid !== id),
      })),
      overrides: prev.overrides.map((o) => ({
        ...o,
        categoryIds: o.categoryIds.filter((cid) => cid !== id),
      })),
    }));
  }, []);

  const setFiltersEnabled = useCallback((enabled: boolean) => {
    setPersisted((prev) => ({
      ...prev,
      filterSettings: { ...prev.filterSettings, enabled },
    }));
  }, []);

  const value = useMemo<AppLauncherContextValue>(
    () => ({
      apps,
      layoutMode: persisted.layoutMode,
      filterSettings: persisted.filterSettings,
      isLoading,
      scanError,
      setLayoutMode,
      refreshApps,
      addManualApp,
      removeApp,
      setAppShortcut,
      clearAppShortcut,
      setAppCategories,
      setFilterSettings,
      addFilter,
      updateFilter,
      removeFilter,
      setFiltersEnabled,
    }),
    [
      apps,
      persisted.layoutMode,
      persisted.filterSettings,
      isLoading,
      scanError,
      setLayoutMode,
      refreshApps,
      addManualApp,
      removeApp,
      setAppShortcut,
      clearAppShortcut,
      setAppCategories,
      setFilterSettings,
      addFilter,
      updateFilter,
      removeFilter,
      setFiltersEnabled,
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
