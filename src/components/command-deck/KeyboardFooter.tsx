export function KeyboardFooter() {
  return (
    <div className="flex items-center justify-center gap-4 border-t deck-border px-4 py-2.5">
      <Hint keys="↑↓" label="навигация" />
      <Hint keys="↵" label="запуск" />
      <Hint keys="esc" label="закрыть" />
    </div>
  );
}

function Hint({ keys, label }: { keys: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-[11px] text-[var(--color-deck-muted)]">
      <kbd className="font-mono-deck rounded deck-surface px-1.5 py-0.5 text-[10px]">
        {keys}
      </kbd>
      {label}
    </span>
  );
}
