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
  source: "manual";
};

export type AppLauncherSettings = {
  layoutMode: LauncherLayoutMode;
  manualApps: ManualAppEntry[];
  overrides: AppOverride[];
  filterSettings: FilterSettings;
  showShortcutBar: boolean;
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
  showShortcutBar: false,
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

/** Build launcher apps from manually added entries only. */
export function mergeApps(settings: AppLauncherSettings): LauncherApp[] {
  const overrideByPath = new Map(
    settings.overrides.map((o) => [o.path, o]),
  );

  const apps: LauncherApp[] = settings.manualApps.map((manual) => {
    const override = overrideByPath.get(manual.path);
    return {
      id: manual.path,
      name: manual.name,
      path: manual.path,
      icon: manual.icon,
      categoryIds: manual.categoryIds,
      shortcut: override?.shortcut ?? null,
      source: "manual" as const,
    };
  });

  return apps.sort((a, b) =>
    a.name.toLowerCase().localeCompare(b.name.toLowerCase()),
  );
}

export function shouldShowFilters(settings: FilterSettings): boolean {
  return settings.enabled && settings.filters.length > 0;
}

export function shouldShowShortcutBar(
  enabled: boolean,
  apps: LauncherApp[],
): boolean {
  return enabled && apps.some((a) => a.shortcut);
}
