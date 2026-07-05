import type { HotkeyCombo } from "./hotkey";

export type AppCategory =
  | "design"
  | "development"
  | "system"
  | "productivity";

export type FilterTag = "all" | AppCategory;

export type LauncherLayoutMode = "auto" | "list" | "grid";

export type LauncherApp = {
  id: string;
  name: string;
  initials: string;
  color: string;
  category: AppCategory;
  path?: string;
  shortcut?: HotkeyCombo | null;
};

export type AppLauncherSettings = {
  apps: LauncherApp[];
  layoutMode: LauncherLayoutMode;
};

export const APP_LAUNCHER_STORAGE_KEY = "spotlight-app-launcher-settings";

export const DEFAULT_APP_LAUNCHER_SETTINGS: AppLauncherSettings = {
  apps: [],
  layoutMode: "auto",
};

export const FILTER_TAG_LABELS: Record<FilterTag, string> = {
  all: "Все",
  design: "Дизайн",
  development: "Разработка",
  system: "Система",
  productivity: "Продуктивность",
};

export const FILTER_TAGS: FilterTag[] = [
  "all",
  "design",
  "development",
  "system",
  "productivity",
];

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

export function initialsFromName(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}
