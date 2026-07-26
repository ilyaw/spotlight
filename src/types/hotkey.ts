export type HotkeyCombo = {
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  /** `KeyboardEvent.code` physical key, e.g. "Space", "KeyK", "Digit1". */
  code: string;
};

type KeyboardEventLike = {
  ctrlKey: boolean;
  metaKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  code: string;
  getModifierState?: unknown;
};

export const DEFAULT_HOTKEY: HotkeyCombo = {
  ctrlKey: false,
  metaKey: false,
  altKey: true,
  shiftKey: false,
  code: "Space",
};

export const HOTKEY_STORAGE_KEY = "spotlight-toggle-hotkey";

const MODIFIER_CODES = new Set([
  "ControlLeft",
  "ControlRight",
  "AltLeft",
  "AltRight",
  "ShiftLeft",
  "ShiftRight",
  "MetaLeft",
  "MetaRight",
]);

export function isModifierCode(code: string): boolean {
  return MODIFIER_CODES.has(code);
}

const RESERVED_APP_SHORTCUT_CODES = new Set([
  "Escape",
  "Enter",
  "Tab",
  "Space",
  "Backspace",
  "ArrowUp",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
]);

/** Keys reserved for navigation / system — cannot be assigned as app shortcuts. */
export function isReservedAppShortcutCode(code: string): boolean {
  return isModifierCode(code) || RESERVED_APP_SHORTCUT_CODES.has(code);
}

export function hasModifier(combo: HotkeyCombo): boolean {
  return combo.ctrlKey || combo.metaKey || combo.altKey || combo.shiftKey;
}

/** Ctrl/Meta/Alt — Shift alone conflicts with typing capitals in search. */
export function hasChordModifier(combo: HotkeyCombo): boolean {
  return combo.ctrlKey || combo.metaKey || combo.altKey;
}

/** Single key with no modifiers (e.g. Digit1). */
export function isBareAppShortcut(combo: HotkeyCombo): boolean {
  return (
    !combo.ctrlKey &&
    !combo.metaKey &&
    !combo.altKey &&
    !combo.shiftKey
  );
}

/**
 * Bare letter keys would steal search typing; only digits / numpad / F-keys
 * are allowed without Ctrl/Meta/Alt.
 */
export function isAllowedBareAppShortcutCode(code: string): boolean {
  return /^(Digit\d|Numpad\d|F\d{1,2})$/.test(code);
}

/**
 * App shortcuts may be a chord (Ctrl/Meta/Alt + key) or a bare digit/F-key.
 * Letters, Shift-only, and reserved navigation keys are rejected.
 */
export function isValidAppShortcutCombo(combo: HotkeyCombo): boolean {
  if (isReservedAppShortcutCode(combo.code)) return false;
  if (hasChordModifier(combo)) return true;
  return isBareAppShortcut(combo) && isAllowedBareAppShortcutCode(combo.code);
}

/** Why a combo cannot be an app shortcut, or null if valid. */
export function appShortcutRejectReason(combo: HotkeyCombo): string | null {
  if (isValidAppShortcutCombo(combo)) return null;
  if (isReservedAppShortcutCode(combo.code)) {
    return "Клавиша зарезервирована";
  }
  if (combo.shiftKey && !hasChordModifier(combo)) {
    return "Shift+клавиша недоступна";
  }
  if (isBareAppShortcut(combo)) {
    return "Нужна цифра, F-клавиша или Ctrl/⌘/Alt + клавиша";
  }
  return "Недопустимая комбинация";
}

/** Drop invalid combos from persisted shortcuts. */
export function sanitizeAppShortcut(
  shortcut: HotkeyCombo | null | undefined,
): HotkeyCombo | null {
  if (!shortcut) return null;
  return isValidAppShortcutCombo(shortcut) ? shortcut : null;
}

const NAMED_KEY_LABELS: Record<string, string> = {
  Space: "Space",
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
  Enter: "Enter",
  Escape: "Esc",
  Tab: "Tab",
  Backquote: "`",
  Minus: "-",
  Equal: "=",
  BracketLeft: "[",
  BracketRight: "]",
  Backslash: "\\",
  Semicolon: ";",
  Quote: "'",
  Comma: ",",
  Period: ".",
  Slash: "/",
};

function keyLabel(code: string): string {
  if (code.startsWith("Key")) return code.slice(3);
  if (code.startsWith("Digit")) return code.slice(5);
  return NAMED_KEY_LABELS[code] ?? code;
}

/** Builds a string the Rust `global-shortcut` accelerator parser accepts. */
export function comboToAccelerator(combo: HotkeyCombo): string {
  const parts: string[] = [];
  if (combo.ctrlKey) parts.push("Control");
  if (combo.altKey) parts.push("Alt");
  if (combo.shiftKey) parts.push("Shift");
  if (combo.metaKey) parts.push("Super");
  parts.push(combo.code);
  return parts.join("+");
}

export function comboToDisplay(combo: HotkeyCombo, isMac: boolean): string {
  const parts: string[] = [];
  if (combo.ctrlKey) parts.push(isMac ? "⌃" : "Ctrl");
  if (combo.altKey) parts.push(isMac ? "⌥" : "Alt");
  if (combo.shiftKey) parts.push(isMac ? "⇧" : "Shift");
  if (combo.metaKey) parts.push(isMac ? "⌘" : "Win");
  parts.push(keyLabel(combo.code));
  return parts.join(isMac ? "" : "+");
}

export function comboFromEvent(event: KeyboardEventLike): HotkeyCombo {
  const readModifier = (name: string) => {
    if (typeof event.getModifierState !== "function") return false;
    return Boolean(
      (event.getModifierState as (key: string) => boolean)(name),
    );
  };
  const mod = (name: string, flag: boolean) => flag || readModifier(name);

  return {
    ctrlKey: mod("Control", event.ctrlKey),
    metaKey: mod("Meta", event.metaKey),
    altKey: mod("Alt", event.altKey),
    shiftKey: mod("Shift", event.shiftKey),
    code: event.code,
  };
}

export function combosEqual(a: HotkeyCombo, b: HotkeyCombo): boolean {
  return (
    a.ctrlKey === b.ctrlKey &&
    a.metaKey === b.metaKey &&
    a.altKey === b.altKey &&
    a.shiftKey === b.shiftKey &&
    a.code === b.code
  );
}
