import { ChevronLeft } from "lucide-react";
import { AppearanceSection } from "./AppearanceSection";
import { LauncherModeSection } from "./LauncherModeSection";
import { ShortcutManagerSection } from "./ShortcutManagerSection";

type SettingsScreenProps = {
  onBack: () => void;
};

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  return (
    <div className="flex max-h-[480px] flex-col">
      <header className="flex items-center gap-2 border-b deck-border px-4 py-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-[var(--color-deck-muted)] transition-colors hover:bg-[var(--color-deck-surface-hover)] hover:text-[var(--color-deck-text)]"
        >
          <ChevronLeft className="h-4 w-4" />
          Назад
        </button>
        <h1 className="text-base font-semibold">Настройки</h1>
      </header>

      <div className="flex-1 space-y-6 overflow-y-auto px-4 py-4">
        <LauncherModeSection />
        <ShortcutManagerSection />
        <AppearanceSection />
      </div>
    </div>
  );
}
