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
  const { hotkey, setHotkey, resetHotkey, error, setHotkeyRecording } =
    useHotkey();
  const [recordingPath, setRecordingPath] = useState<string | null>(null);
  const [recordingToggle, setRecordingToggle] = useState(false);
  const isMac = isMacPlatform();

  useEffect(() => {
    if (!recordingPath && !recordingToggle) return;

    const stopRecording = () => {
      setRecordingPath(null);
      setRecordingToggle(false);
      setHotkeyRecording(false);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      event.stopPropagation();

      if (event.code === "Escape") {
        stopRecording();
        return;
      }

      if (isModifierCode(event.code)) return;

      const combo = comboFromEvent(event);
      if (!hasModifier(combo)) return;

      if (recordingToggle) {
        setHotkey(combo);
        stopRecording();
      } else if (recordingPath) {
        setAppShortcut(recordingPath, combo);
        stopRecording();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [
    recordingPath,
    recordingToggle,
    setAppShortcut,
    setHotkey,
    setHotkeyRecording,
  ]);

  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <h3 className="shrink-0 text-[11px] font-semibold tracking-wider text-[var(--color-deck-muted)] uppercase">
        Диспетчер шорткатов
      </h3>

      <div className="shrink-0 space-y-1.5">
        <p className="text-xs text-[var(--color-deck-muted)]">
          Глобальный шорткат (показать / скрыть)
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setHotkeyRecording(true);
              setRecordingPath(null);
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

      <div className="flex min-h-0 flex-1 flex-col gap-1.5 overflow-hidden">
        <p className="shrink-0 text-xs text-[var(--color-deck-muted)]">
          Шорткаты приложений (внутри окна)
        </p>
        {apps.length === 0 ? (
          <p className="text-[10px] text-[var(--color-deck-muted)]">
            Нет приложений для назначения
          </p>
        ) : (
          <div className="deck-scroll-area min-h-0 flex-1 space-y-1 overflow-y-auto pr-1">
            {apps.map((app) => {
              const isRecording = recordingPath === app.path;
              return (
                <div key={app.path} className="flex items-center gap-2">
                  {app.icon ? (
                    <img
                      src={app.icon}
                      alt=""
                      className="h-7 w-7 shrink-0 rounded object-contain"
                    />
                  ) : (
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded deck-surface text-[10px] text-[var(--color-deck-muted)]">
                      ?
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {app.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setHotkeyRecording(true);
                      setRecordingToggle(false);
                      setRecordingPath(app.path);
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
                      onClick={() => clearAppShortcut(app.path)}
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
        )}
      </div>
    </section>
  );
}
