import { useHotkey } from "../../../context/HotkeyContext";
import { useSystemBehavior } from "../../../context/SystemBehaviorContext";
import { comboToDisplay, DEFAULT_HOTKEY } from "../../../types/hotkey";
import { isMacPlatform } from "../../../lib/platform";

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed ${
        checked ? "bg-[var(--color-deck-accent)]" : "deck-surface"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
          checked ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

function SettingRow({
  title,
  description,
  checked,
  onChange,
  disabled,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-4 ${disabled ? "opacity-50" : ""}`}
    >
      <div className="min-w-0">
        <span className="text-sm">{title}</span>
        <p className="text-[11px] text-[var(--color-deck-muted)]">{description}</p>
      </div>
      <Toggle checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

export function SystemSection() {
  const { hotkey } = useHotkey();
  const {
    settings,
    setLaunchAtStartup,
    setShowWindowOnLaunch,
    setRunInBackground,
    setHideFromTaskbar,
    setHideOnFocusLoss,
    quitApp,
    error,
  } = useSystemBehavior();
  const isMac = isMacPlatform();

  return (
    <section className="space-y-5">
      <div className="space-y-1">
        <h3 className="text-[11px] font-semibold tracking-wider text-[var(--color-deck-muted)] uppercase">
          Запуск
        </h3>
        <p className="text-[11px] text-[var(--color-deck-muted)]">
          Spotlight работает в фоне и открывается глобальным шорткатом.
        </p>
      </div>

      <div className="space-y-4 rounded-lg deck-surface p-4">
        <SettingRow
          title="Запускать при входе в систему"
          description="Приложение стартует в фоне вместе с системой"
          checked={settings.launchAtStartup}
          onChange={setLaunchAtStartup}
        />

        <SettingRow
          title="Показывать окно при запуске"
          description="Иначе панель остаётся скрытой до шортката"
          checked={settings.showWindowOnLaunch}
          onChange={setShowWindowOnLaunch}
        />
      </div>

      <div className="space-y-1">
        <h3 className="text-[11px] font-semibold tracking-wider text-[var(--color-deck-muted)] uppercase">
          Закрытие и фон
        </h3>
      </div>

      <div className="space-y-4 rounded-lg deck-surface p-4">
        <SettingRow
          title="Сворачивать в фон при закрытии"
          description="Закрытие не завершает процесс — приложение остаётся в памяти"
          checked={settings.runInBackground}
          onChange={setRunInBackground}
        />

        <SettingRow
          title={isMac ? "Скрывать из Dock" : "Скрывать из панели задач"}
          description="Иконка не появляется внизу экрана, пока работает в фоне"
          checked={settings.hideFromTaskbar}
          onChange={setHideFromTaskbar}
        />

        <SettingRow
          title="Скрывать при потере фокуса"
          description="Панель исчезает, если кликнуть вне окна"
          checked={settings.hideOnFocusLoss}
          onChange={setHideOnFocusLoss}
        />
      </div>

      <div className="space-y-1">
        <h3 className="text-[11px] font-semibold tracking-wider text-[var(--color-deck-muted)] uppercase">
          Горячая клавиша
        </h3>
        <p className="text-[11px] text-[var(--color-deck-muted)]">
          Текущий шорткат:{" "}
          <span className="font-mono-deck text-[var(--color-deck-text)]">
            {comboToDisplay(hotkey, isMac)}
          </span>
          . Изменить можно в разделе «Горячие клавиши».
        </p>
        <p className="text-[10px] text-[var(--color-deck-muted)]">
          По умолчанию: {comboToDisplay(DEFAULT_HOTKEY, isMac)}
        </p>
      </div>

      {error && <p className="text-[10px] text-red-400">{error}</p>}

      <div className="border-t deck-border pt-4">
        <button
          type="button"
          onClick={quitApp}
          className="rounded-lg border border-red-500/30 px-4 py-2 text-sm text-red-300 transition-colors hover:bg-red-500/10"
        >
          Полностью выйти
        </button>
        <p className="mt-1.5 text-[10px] text-[var(--color-deck-muted)]">
          Завершить процесс Spotlight. Для повторного запуска откройте приложение
          вручную или включите автозапуск.
        </p>
      </div>
    </section>
  );
}
