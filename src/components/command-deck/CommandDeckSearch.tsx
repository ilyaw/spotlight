import { forwardRef } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { useHotkey } from "../../context/HotkeyContext";
import { comboToDisplay } from "../../types/hotkey";
import { isMacPlatform } from "../../lib/platform";

type CommandDeckSearchProps = {
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onOpenSettings: () => void;
};

export const CommandDeckSearch = forwardRef<
  HTMLInputElement,
  CommandDeckSearchProps
>(function CommandDeckSearch(
  { value, onChange, onKeyDown, onOpenSettings },
  ref,
) {
  const { hotkey } = useHotkey();
  const isMac = isMacPlatform();

  const handleMouseDown = (event: React.MouseEvent<HTMLInputElement>) => {
    if (event.button !== 0) return;
    void getCurrentWindow().startDragging();
  };

  return (
    <div className="flex items-center gap-3 border-b deck-border px-4 py-3.5">
      <Search
        className="h-5 w-5 shrink-0 text-[var(--color-deck-muted)]"
        strokeWidth={2}
      />
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        onMouseDown={handleMouseDown}
        placeholder="Введите команду..."
        className="min-w-0 flex-1 bg-[var(--color-deck-input-bg)] text-base text-[var(--color-deck-text)] placeholder:text-[var(--color-deck-muted)] outline-none"
        autoComplete="off"
        spellCheck={false}
      />
      <button
        type="button"
        onClick={onOpenSettings}
        className="rounded-md p-1.5 text-[var(--color-deck-muted)] transition-colors hover:bg-[var(--color-deck-surface-hover)] hover:text-[var(--color-deck-text)]"
        aria-label="Настройки"
      >
        <SlidersHorizontal className="h-4 w-4" />
      </button>
      <kbd className="font-mono-deck shrink-0 rounded-md deck-surface px-2 py-1 text-[10px] text-[var(--color-deck-muted)]">
        {comboToDisplay(hotkey, isMac)}
      </kbd>
    </div>
  );
});
