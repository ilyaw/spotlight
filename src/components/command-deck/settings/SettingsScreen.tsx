import { ChevronLeft } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { AppearanceSection } from "./AppearanceSection";
import { CategoriesSection } from "./CategoriesSection";
import { LauncherModeSection } from "./LauncherModeSection";
import { ShortcutManagerSection } from "./ShortcutManagerSection";

type SettingsScreenProps = {
  onBack: () => void;
};

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const handleDragMouseDown = (event: React.MouseEvent) => {
    if (event.button !== 0) return;
    void getCurrentWindow().startDragging();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <header
        className="flex shrink-0 items-center gap-2 border-b deck-border px-4 py-3"
        onMouseDown={handleDragMouseDown}
      >
        <button
          type="button"
          onClick={onBack}
          onMouseDown={(event) => event.stopPropagation()}
          className="flex items-center gap-1 rounded-md px-2 py-1 text-sm text-[var(--color-deck-muted)] transition-colors hover:bg-[var(--color-deck-surface-hover)] hover:text-[var(--color-deck-text)]"
        >
          <ChevronLeft className="h-4 w-4" />
          Назад
        </button>
        <div className="min-h-px flex-1" aria-hidden="true" />
      </header>

      <div className="deck-scroll-area min-h-0 flex-1 space-y-6 overflow-y-auto px-4 pt-4 pb-4">
        <LauncherModeSection />
        <CategoriesSection />
        <ShortcutManagerSection />
        <AppearanceSection />
      </div>
    </div>
  );
}
