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
import {
  comboToAccelerator,
  DEFAULT_HOTKEY,
  HOTKEY_STORAGE_KEY,
  type HotkeyCombo,
} from "../types/hotkey";

type HotkeyContextValue = {
  hotkey: HotkeyCombo;
  setHotkey: (combo: HotkeyCombo) => void;
  resetHotkey: () => void;
  error: string | null;
  isRecording: boolean;
  setHotkeyRecording: (active: boolean) => void;
};

const HotkeyContext = createContext<HotkeyContextValue | null>(null);

function loadHotkey(): HotkeyCombo {
  try {
    const raw = localStorage.getItem(HOTKEY_STORAGE_KEY);
    if (!raw) return DEFAULT_HOTKEY;

    const parsed = JSON.parse(raw) as Partial<HotkeyCombo>;
    if (typeof parsed.code !== "string") return DEFAULT_HOTKEY;

    return {
      ctrlKey: Boolean(parsed.ctrlKey),
      metaKey: Boolean(parsed.metaKey),
      altKey: Boolean(parsed.altKey),
      shiftKey: Boolean(parsed.shiftKey),
      code: parsed.code,
    };
  } catch {
    return DEFAULT_HOTKEY;
  }
}

function persistHotkey(combo: HotkeyCombo) {
  try {
    localStorage.setItem(HOTKEY_STORAGE_KEY, JSON.stringify(combo));
  } catch {
    // ignore storage errors
  }
}

export function HotkeyProvider({ children }: { children: ReactNode }) {
  const [hotkey, setHotkeyState] = useState<HotkeyCombo>(loadHotkey);
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setHotkeyRecording] = useState(false);

  useEffect(() => {
    persistHotkey(hotkey);

    let cancelled = false;
    void invoke("update_global_shortcut", {
      shortcut: comboToAccelerator(hotkey),
    })
      .then(() => {
        if (!cancelled) setError(null);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(String(err));
      });

    return () => {
      cancelled = true;
    };
  }, [hotkey]);

  const setHotkey = useCallback((combo: HotkeyCombo) => {
    setHotkeyState(combo);
  }, []);

  const resetHotkey = useCallback(() => {
    setHotkeyState(DEFAULT_HOTKEY);
  }, []);

  const value = useMemo<HotkeyContextValue>(
    () => ({
      hotkey,
      setHotkey,
      resetHotkey,
      error,
      isRecording,
      setHotkeyRecording,
    }),
    [hotkey, setHotkey, resetHotkey, error, isRecording],
  );

  return (
    <HotkeyContext.Provider value={value}>{children}</HotkeyContext.Provider>
  );
}

export function useHotkey(): HotkeyContextValue {
  const context = useContext(HotkeyContext);
  if (!context) {
    throw new Error("useHotkey must be used within HotkeyProvider");
  }
  return context;
}
