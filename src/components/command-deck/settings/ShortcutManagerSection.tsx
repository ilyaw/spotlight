import { useEffect, useState } from "react";
import { RotateCcw } from "lucide-react";
import { useAppLauncher } from "../../../context/AppLauncherContext";
import { useHotkey } from "../../../context/HotkeyContext";
import {
  comboFromEvent,
  comboToDisplay,
  DEFAULT_HOTKEY,
  hasModifier,
  isModifierCode,
} from "../../../types/hotkey";
import { isMacPlatform } from "../../../lib/platform";

export function ShortcutManagerSection() {
  const { apps, setAppShortcut, clearAppShortcut } = useAppLauncher();
  const { hotkey, setHotkey, resetHotkey, error } = useHotkey();
  const [recordingAppId, setRecordingAppId] = useState<string | null>(null);
  const [recordingToggle, setRecordingToggle] = useState(false);
  const isMac = isMacPlatform();

  useEffect(() => {
    if (!recordingAppId && !recordingToggle) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (event.code === "Escape") {
        setRecordingAppId(null);
        setRecordingToggle(false);
        return;
      }

      if (isModifierCode(event.code)) return;

      const combo = comboFromEvent(event);
      if (!hasModifier(combo)) return;

      if (recordingToggle) {
        setHotkey(combo);
        setRecordingToggle(false);
      } else if (recordingAppId) {
        setAppShortcut(recordingAppId, combo);
        setRecordingAppId(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [recordingAppId, recordingToggle, setAppShortcut, setHotkey]);

  return (
    <section className="space-y-3">
      <h3 className="text-[11px] font-semibold tracking-wider text-[var(--color-deck-muted)] uppercase">
        Диспетчер шорткатов
      </h3>

      <div className="space-y-1.5">
        <p className="text-xs text-[var(--color-deck-muted)]">
          Глобальный шорткат (показать / скрыть)
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setRecordingAppId(null);
              setRecordingToggle(true);
            }}
            className={`font-mono-deck flex h-9 flex-1 items-center justify-center rounded-lg px-3 text-xs transition-colors ${
              recordingToggle
                ? "bg-[var(--color-deck-accent)]/20 text-[var(--color-deck-accent)] ring-1 ring-[var(--color-deck-accent)]/40"
                : "deck-surface hover:bg-[var(--color-deck-surface-hover)]"
            }`}
          >
            {recordingToggle
              ? "Нажмите комбинацию…"
              : comboToDisplay(hotkey, isMac)}
          </button>
          <button
            type="button"
            onClick={resetHotkey}
            className="rounded p-1.5 text-[var(--color-deck-muted)] hover:bg-[var(--color-deck-surface-hover)]"
            aria-label="Сбросить"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>
        {error && (
          <p className="text-[10px] text-red-400">
            Ошибка регистрации: {error}
          </p>
        )}
        <p className="text-[10px] text-[var(--color-deck-muted)]">
          По умолчанию: {comboToDisplay(DEFAULT_HOTKEY, isMac)}
        </p>
      </div>

      <div className="space-y-1.5">
        <p className="text-xs text-[var(--color-deck-muted)]">
          Шорткаты приложений (внутри окна)
        </p>
        {apps.map((app) => {
          const isRecording = recordingAppId === app.id;
          return (
            <div key={app.id} className="flex items-center gap-2">
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded text-[10px] font-medium text-white"
                style={{ backgroundColor: app.color }}
              >
                {app.initials}
              </span>
              <span className="min-w-0 flex-1 truncate text-sm">
                {app.name}
              </span>
              <button
                type="button"
                onClick={() => {
                  setRecordingToggle(false);
                  setRecordingAppId(app.id);
                }}
                className={`font-mono-deck rounded-lg px-2.5 py-1.5 text-[10px] transition-colors ${
                  isRecording
                    ? "bg-[var(--color-deck-accent)]/20 text-[var(--color-deck-accent)] ring-1 ring-[var(--color-deck-accent)]/40"
                    : "deck-surface hover:bg-[var(--color-deck-surface-hover)]"
                }`}
              >
                {isRecording
                  ? "…"
                  : app.shortcut
                    ? comboToDisplay(app.shortcut, isMac)
                    : "Назначить"}
              </button>
              {app.shortcut && (
                <button
                  type="button"
                  onClick={() => clearAppShortcut(app.id)}
                  className="rounded p-1 text-[var(--color-deck-muted)] hover:bg-[var(--color-deck-surface-hover)]"
                  aria-label="Очистить"
                >
                  <RotateCcw className="h-3 w-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
