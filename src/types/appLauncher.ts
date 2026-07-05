import type { HotkeyCombo } from "./hotkey";

export type InstalledApp = {
  id: string;
  name: string;
  path: string;
  icon: string;
};

export type AppMetadata = {
  name: string;
  icon: string;
};

export type CustomFilter = {
  id: string;
  label: string;
};

export type FilterSettings = {
  enabled: boolean;
  filters: CustomFilter[];
};

export type AppOverride = {
  path: string;
  categoryIds: string[];
  shortcut?: HotkeyCombo | null;
};

export type ManualAppEntry = {
  path: string;
  name: string;
  icon: string;
  categoryIds: string[];
};

export type LauncherLayoutMode = "auto" | "list" | "grid";

export type LauncherApp = InstalledApp & {
  categoryIds: string[];
  shortcut?: HotkeyCombo | null;
  source: "system" | "manual";
};

export type AppLauncherSettings = {
  layoutMode: LauncherLayoutMode;
  manualApps: ManualAppEntry[];
  overrides: AppOverride[];
  filterSettings: FilterSettings;
  /** System apps indexed on the very first launch; not re-scanned afterwards. */
  hasIndexedApps: boolean;
  indexedApps: InstalledApp[];
};

export const APP_LAUNCHER_STORAGE_KEY = "spotlight-app-launcher-settings";
export const FILTER_SETTINGS_STORAGE_KEY = "spotlight-filter-settings";

export const DEFAULT_FILTER_SETTINGS: FilterSettings = {
  enabled: false,
  filters: [],
};

export const DEFAULT_APP_LAUNCHER_SETTINGS: AppLauncherSettings = {
  layoutMode: "auto",
  manualApps: [],
  overrides: [],
  filterSettings: DEFAULT_FILTER_SETTINGS,
  hasIndexedApps: false,
  indexedApps: [],
};

export function resolveLayout(
  mode: LauncherLayoutMode,
  count: number,
): "list" | "grid" {
  if (mode === "list") return "list";
  if (mode === "grid") return "grid";
  return count <= 9 ? "list" : "grid";
}

export function basenameFromPath(path: string): string {
  const trimmed = path.replace(/[/\\]+$/, "");
  const segments = trimmed.split(/[/\\]/);
  const base = segments[segments.length - 1] || trimmed;
  return base.replace(/\.(app|exe)$/i, "");
}

export function mergeApps(
  scanned: InstalledApp[],
  settings: AppLauncherSettings,
): LauncherApp[] {
  const overrideByPath = new Map(
    settings.overrides.map((o) => [o.path, o]),
  );
  const byPath = new Map<string, LauncherApp>();

  for (const app of scanned) {
    const override = overrideByPath.get(app.path);
    byPath.set(app.path, {
      ...app,
      categoryIds: override?.categoryIds ?? [],
      shortcut: override?.shortcut ?? null,
      source: "system",
    });
  }

  for (const manual of settings.manualApps) {
    const override = overrideByPath.get(manual.path);
    const existing = byPath.get(manual.path);
    if (existing) {
      byPath.set(manual.path, {
        ...existing,
        name: manual.name,
        icon: manual.icon || existing.icon,
        categoryIds: manual.categoryIds,
        shortcut: override?.shortcut ?? existing.shortcut ?? null,
        source: "manual",
      });
    } else {
      byPath.set(manual.path, {
        id: manual.path,
        name: manual.name,
        path: manual.path,
        icon: manual.icon,
        categoryIds: manual.categoryIds,
        shortcut: override?.shortcut ?? null,
        source: "manual",
      });
    }
  }

  return Array.from(byPath.values()).sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
  );
}

export function shouldShowFilters(settings: FilterSettings): boolean {
  return settings.enabled && settings.filters.length > 0;
}
