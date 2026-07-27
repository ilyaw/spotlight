import { useState } from "react";
import type {
  ThemeColors,
  ThemeGradient,
  ThemeMode,
} from "../../../../types/theme";
import {
  BUILTIN_THEME_PICKER_HEX,
  THEME_COLOR_LABELS,
} from "../../../../types/theme";
import { ColorField } from "./ColorField";
import { GradientStopsEditor } from "./GradientStopsEditor";

export type ThemeEditorDraft = {
  name: string;
  baseMode: ThemeMode;
  colors: ThemeColors;
  gradient: ThemeGradient;
};

type ThemeEditorFormProps = {
  title: string;
  draft: ThemeEditorDraft;
  onChange: (draft: ThemeEditorDraft) => void;
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  saveLabel?: string;
};

const COLOR_KEYS = Object.keys(THEME_COLOR_LABELS) as (keyof ThemeColors)[];

export function ThemeEditorForm({
  title,
  draft,
  onChange,
  onSave,
  onCancel,
  onDelete,
  saveLabel = "Сохранить",
}: ThemeEditorFormProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  const setColors = (key: keyof ThemeColors, value: string) => {
    onChange({ ...draft, colors: { ...draft.colors, [key]: value } });
  };

  const setBaseMode = (mode: ThemeMode) => {
    const prevDefaults = BUILTIN_THEME_PICKER_HEX[draft.baseMode];
    const stillDefault = COLOR_KEYS.every(
      (key) => draft.colors[key] === prevDefaults[key],
    );
    onChange({
      ...draft,
      baseMode: mode,
      colors: stillDefault
        ? { ...BUILTIN_THEME_PICKER_HEX[mode] }
        : draft.colors,
    });
  };

  return (
    <div className="space-y-4 rounded-lg border deck-border p-3">
      <h4 className="text-xs font-semibold text-[var(--color-deck-text)]">
        {title}
      </h4>

      <div className="space-y-1">
        <label
          htmlFor="theme-name"
          className="block text-[10px] font-medium tracking-wide text-[var(--color-deck-muted)] uppercase"
        >
          Название
        </label>
        <input
          id="theme-name"
          type="text"
          value={draft.name}
          maxLength={48}
          onChange={(e) => onChange({ ...draft, name: e.target.value })}
          className="w-full rounded-md border deck-border bg-transparent px-2.5 py-1.5 text-sm outline-none transition-colors duration-200 focus:ring-1 focus:ring-[var(--color-deck-accent)]/50"
        />
      </div>

      <div className="space-y-1.5">
        <span
          id="theme-base-mode-label"
          className="block text-[10px] font-medium tracking-wide text-[var(--color-deck-muted)] uppercase"
        >
          Базовый режим
        </span>
        <div
          className="deck-segmented"
          role="radiogroup"
          aria-labelledby="theme-base-mode-label"
        >
          {(["dark", "light"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              role="radio"
              aria-checked={draft.baseMode === mode}
              onClick={() => setBaseMode(mode)}
              className={`deck-segmented-option cursor-pointer ${
                draft.baseMode === mode ? "deck-segmented-option--active" : ""
              }`}
            >
              {mode === "dark" ? "Тёмная" : "Светлая"}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <span className="block text-[10px] font-medium tracking-wide text-[var(--color-deck-muted)] uppercase">
          Цвета панели
        </span>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {COLOR_KEYS.map((key) => (
            <ColorField
              key={key}
              id={`theme-color-${key}`}
              label={THEME_COLOR_LABELS[key]}
              value={draft.colors[key]}
              onChange={(v) => setColors(key, v)}
            />
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <span className="block text-[10px] font-medium tracking-wide text-[var(--color-deck-muted)] uppercase">
          Градиент рамки
        </span>
        <GradientStopsEditor
          colors={draft.gradient.colors}
          angle={draft.gradient.angle}
          onColorsChange={(colors) =>
            onChange({ ...draft, gradient: { ...draft.gradient, colors } })
          }
          onAngleChange={(angle) =>
            onChange({ ...draft, gradient: { ...draft.gradient, angle } })
          }
        />
      </div>

      <div
        className="overflow-hidden rounded-lg border deck-border"
        style={{ background: draft.colors.bg }}
        aria-label="Предпросмотр темы"
      >
        <div
          className="h-1.5 w-full"
          style={{
            background: `linear-gradient(90deg, ${draft.gradient.colors.join(", ")})`,
          }}
          aria-hidden
        />
        <div className="space-y-1.5 p-3">
          <p
            className="text-sm font-medium"
            style={{ color: draft.colors.text }}
          >
            Предпросмотр
          </p>
          <p className="text-[11px]" style={{ color: draft.colors.muted }}>
            Вторичный текст и акцент
          </p>
          <div
            className="inline-flex rounded-md px-2.5 py-1 text-[11px] font-medium text-white"
            style={{ background: draft.colors.accent }}
          >
            Акцент
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onSave}
          className="cursor-pointer rounded-lg bg-[var(--color-deck-accent)] px-3 py-1.5 text-xs font-medium text-white transition-opacity duration-200 hover:opacity-90"
        >
          {saveLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="cursor-pointer rounded-lg px-3 py-1.5 text-xs text-[var(--color-deck-muted)] transition-colors duration-200 hover:bg-[var(--color-deck-surface-hover)] hover:text-[var(--color-deck-text)]"
        >
          Отмена
        </button>
        {onDelete && (
          <div className="ml-auto flex items-center gap-2">
            {confirmDelete ? (
              <>
                <span className="text-[10px] text-[var(--color-deck-muted)]">
                  Удалить тему?
                </span>
                <button
                  type="button"
                  onClick={onDelete}
                  className="cursor-pointer rounded-lg bg-red-500/20 px-2.5 py-1.5 text-xs text-red-400 transition-colors duration-200 hover:bg-red-500/30"
                >
                  Да, удалить
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="cursor-pointer rounded-lg px-2.5 py-1.5 text-xs text-[var(--color-deck-muted)] hover:text-[var(--color-deck-text)]"
                >
                  Нет
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="cursor-pointer rounded-lg px-2.5 py-1.5 text-xs text-red-400/80 transition-colors duration-200 hover:bg-red-500/15 hover:text-red-400"
              >
                Удалить
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
