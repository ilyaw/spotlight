import { useState } from "react";
import { ChevronLeft } from "lucide-react";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { AppearanceSection } from "./AppearanceSection";
import { CategoriesSection } from "./CategoriesSection";
import { LauncherModeSection } from "./LauncherModeSection";
import { SettingsNav, type SettingsTab } from "./SettingsNav";
import { ShortcutManagerSection } from "./ShortcutManagerSection";

type SettingsScreenProps = {
  onBack: () => void;
};

function SettingsContent({ tab }: { tab: SettingsTab }) {
  switch (tab) {
    case "launcher":
      return <LauncherModeSection />;
    case "categories":
      return <CategoriesSection />;
    case "shortcuts":
      return <ShortcutManagerSection />;
    case "appearance":
      return <AppearanceSection />;
  }
}

export function SettingsScreen({ onBack }: SettingsScreenProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("launcher");

  const handleDragMouseDown = (event: React.MouseEvent) => {
    if (event.button !== 0) return;
    void getCurrentWindow().startDragging();
  };

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden">
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
        <h1 className="text-base font-semibold">Настройки</h1>
        <div className="min-h-px flex-1" aria-hidden="true" />
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <SettingsNav active={activeTab} onChange={setActiveTab} />
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-6 py-5">
          <SettingsContent tab={activeTab} />
        </div>
      </div>
    </div>
  );
}
