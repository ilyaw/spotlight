export type QuickLaunchKey =
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9";

export type QuickLaunchSlot = {
  key: QuickLaunchKey;
  path: string;
  label: string;
};

export type QuickLaunchSettings = {
  slots: Record<QuickLaunchKey, QuickLaunchSlot>;
};

export const QUICK_LAUNCH_KEYS: QuickLaunchKey[] = [
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
];

function emptySlot(key: QuickLaunchKey): QuickLaunchSlot {
  return { key, path: "", label: "" };
}

export const DEFAULT_QUICK_LAUNCH_SETTINGS: QuickLaunchSettings = {
  slots: Object.fromEntries(
    QUICK_LAUNCH_KEYS.map((key) => [key, emptySlot(key)]),
  ) as Record<QuickLaunchKey, QuickLaunchSlot>,
};

export const QUICK_LAUNCH_STORAGE_KEY = "spotlight-quick-launch-settings";

export function basenameFromPath(path: string): string {
  const trimmed = path.replace(/[/\\]+$/, "");
  const segments = trimmed.split(/[/\\]/);
  return segments[segments.length - 1] || trimmed;
}
