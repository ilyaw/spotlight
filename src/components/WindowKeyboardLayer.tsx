import { useEffect, useRef } from "react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useHotkey } from "../context/HotkeyContext";
import {
  comboFromEvent,
  combosEqual,
  isModifierCode,
  type HotkeyCombo,
} from "../types/hotkey";

function isTextField(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(
    target.closest('input, textarea, select, [contenteditable="true"]'),
  );
}

function matchesHotkey(event: KeyboardEvent, hotkey: HotkeyCombo): boolean {
  if (isModifierCode(event.code)) return false;
  return combosEqual(comboFromEvent(event), hotkey);
}

function shouldHandleHide(event: KeyboardEvent, hotkey: HotkeyCombo): boolean {
  if (event.key === "Escape") return true;
  return matchesHotkey(event, hotkey);
}

/**
 * Keeps keyboard routing predictable inside the Tauri webview:
 * after UI clicks, focus returns to a sentinel so global shortcuts work
 * outside text fields (macOS often drops modifier flags on buttons/sliders).
 */
export function WindowKeyboardLayer() {
  const { hotkey, isRecording } = useHotkey();
  const hotkeyRef = useRef(hotkey);
  const isRecordingRef = useRef(isRecording);
  const sentinelRef = useRef<HTMLDivElement>(null);

  hotkeyRef.current = hotkey;
  isRecordingRef.current = isRecording;

  useEffect(() => {
    const hidePanel = () => {
      void getCurrentWindow().hide();
    };

    const refocusSentinel = () => {
      if (isTextField(document.activeElement)) return;
      sentinelRef.current?.focus({ preventScroll: true });
    };

    const handleKey = (event: KeyboardEvent) => {
      if (isRecordingRef.current) return;
      if (!shouldHandleHide(event, hotkeyRef.current)) return;

      event.preventDefault();
      event.stopPropagation();
      hidePanel();
    };

    const handleMouseUp = (event: MouseEvent) => {
      if (isRecordingRef.current) return;
      if (isTextField(event.target)) return;
      requestAnimationFrame(refocusSentinel);
    };

    const handleWindowFocus = () => {
      requestAnimationFrame(refocusSentinel);
    };

    let unlistenFocus: (() => void) | undefined;

    document.addEventListener("keydown", handleKey, true);
    document.addEventListener("keyup", handleKey, true);
    document.addEventListener("mouseup", handleMouseUp, true);
    void getCurrentWindow()
      .onFocusChanged(({ payload: focused }) => {
        if (focused) handleWindowFocus();
      })
      .then((unlisten) => {
        unlistenFocus = unlisten;
        handleWindowFocus();
      });

    return () => {
      document.removeEventListener("keydown", handleKey, true);
      document.removeEventListener("keyup", handleKey, true);
      document.removeEventListener("mouseup", handleMouseUp, true);
      unlistenFocus?.();
    };
  }, []);

  return (
    <div
      ref={sentinelRef}
      tabIndex={-1}
      aria-hidden="true"
      className="pointer-events-none fixed size-0 overflow-hidden opacity-0"
    />
  );
}
