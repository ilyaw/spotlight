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
  showShortcutBar: boolean;
  setLayoutMode: (mode: LauncherLayoutMode) => void;
  addManualApp: (entry: ManualAppEntry) => void;
  removeApp: (path: string) => void;
  setAppShortcut: (path: string, shortcut: HotkeyCombo | null) => void;
  clearAppShortcut: (path: string) => void;
  updateAppCategories: (path: string, categoryIds: string[]) => void;
  addAppToCategory: (path: string, categoryId: string) => void;
  removeAppFromCategory: (path: string, categoryId: string) => void;
  setFilterSettings: (settings: FilterSettings) => void;
  addFilter: (label: string) => void;
  updateFilter: (id: string, label: string) => void;
  removeFilter: (id: string) => void;
  setFiltersEnabled: (enabled: boolean) => void;
  setShowShortcutBar: (enabled: boolean) => void;
};

const AppLauncherContext = createContext<AppLauncherContextValue | null>(null);

type LegacyPersistedSettings = Partial<AppLauncherSettings> & {
  hasIndexedApps?: boolean;
  indexedApps?: unknown;
  hiddenAppPaths?: unknown;
};

function loadPersistedSettings(): AppLauncherSettings {
  try {
    const raw = localStorage.getItem(APP_LAUNCHER_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_APP_LAUNCHER_SETTINGS };

    const parsed = JSON.parse(raw) as LegacyPersistedSettings;
    const manualPaths = new Set(
      (parsed.manualApps ?? []).map((a) => a.path),
    );

    // Drop legacy system-scan fields; keep overrides only for manual apps.
    return {
      layoutMode: parsed.layoutMode ?? DEFAULT_APP_LAUNCHER_SETTINGS.layoutMode,
      manualApps: parsed.manualApps ?? [],
      overrides: (parsed.overrides ?? []).filter((o) => manualPaths.has(o.path)),
      filterSettings: {
        ...DEFAULT_APP_LAUNCHER_SETTINGS.filterSettings,
        ...parsed.filterSettings,
        filters: parsed.filterSettings?.filters ?? [],
      },
      showShortcutBar:
        parsed.showShortcutBar ?? DEFAULT_APP_LAUNCHER_SETTINGS.showShortcutBar,
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

function applyCategoryUpdate(
  prev: AppLauncherSettings,
  path: string,
  categoryIds: string[],
): AppLauncherSettings {
  const isManual = prev.manualApps.some((a) => a.path === path);
  if (!isManual) return prev;

  return {
    ...prev,
    manualApps: prev.manualApps.map((a) =>
      a.path === path ? { ...a, categoryIds } : a,
    ),
  };
}

export function AppLauncherProvider({ children }: { children: ReactNode }) {
  const [persisted, setPersisted] = useState<AppLauncherSettings>(
    loadPersistedSettings,
  );

  useEffect(() => {
    persistSettings(persisted);
  }, [persisted]);

  const apps = useMemo(() => mergeApps(persisted), [persisted]);

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

  const updateAppCategories = useCallback(
    (path: string, categoryIds: string[]) => {
      setPersisted((prev) => applyCategoryUpdate(prev, path, categoryIds));
    },
    [],
  );

  const addAppToCategory = useCallback((path: string, categoryId: string) => {
    setPersisted((prev) => {
      const app = mergeApps(prev).find((a) => a.path === path);
      if (!app || app.categoryIds.includes(categoryId)) return prev;
      return applyCategoryUpdate(prev, path, [...app.categoryIds, categoryId]);
    });
  }, []);

  const removeAppFromCategory = useCallback(
    (path: string, categoryId: string) => {
      setPersisted((prev) => {
        const app = mergeApps(prev).find((a) => a.path === path);
        if (!app) return prev;
        return applyCategoryUpdate(
          prev,
          path,
          app.categoryIds.filter((id) => id !== categoryId),
        );
      });
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

  const setShowShortcutBar = useCallback((enabled: boolean) => {
    setPersisted((prev) => ({ ...prev, showShortcutBar: enabled }));
  }, []);

  const value = useMemo<AppLauncherContextValue>(
    () => ({
      apps,
      layoutMode: persisted.layoutMode,
      filterSettings: persisted.filterSettings,
      showShortcutBar: persisted.showShortcutBar,
      setLayoutMode,
      addManualApp,
      removeApp,
      setAppShortcut,
      clearAppShortcut,
      updateAppCategories,
      addAppToCategory,
      removeAppFromCategory,
      setFilterSettings,
      addFilter,
      updateFilter,
      removeFilter,
      setFiltersEnabled,
      setShowShortcutBar,
    }),
    [
      apps,
      persisted.layoutMode,
      persisted.filterSettings,
      persisted.showShortcutBar,
      setLayoutMode,
      addManualApp,
      removeApp,
      setAppShortcut,
      clearAppShortcut,
      updateAppCategories,
      addAppToCategory,
      removeAppFromCategory,
      setFilterSettings,
      addFilter,
      updateFilter,
      removeFilter,
      setFiltersEnabled,
      setShowShortcutBar,
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
