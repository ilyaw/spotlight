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

export function hasModifier(combo: HotkeyCombo): boolean {
  return combo.ctrlKey || combo.metaKey || combo.altKey || combo.shiftKey;
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
  return {
    ctrlKey: event.ctrlKey,
    metaKey: event.metaKey,
    altKey: event.altKey,
    shiftKey: event.shiftKey,
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
