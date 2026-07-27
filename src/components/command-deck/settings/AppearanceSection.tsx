import { useState, type CSSProperties } from "react";
import { Plus } from "lucide-react";
import { useRgbEffect } from "../../../context/RgbEffectContext";
import {
  createEmptyDraft,
  useTheme,
} from "../../../context/ThemeContext";
import {
  clampGradientColors,
  type CustomTheme,
} from "../../../types/theme";
import {
  isPresetAnimated,
  RGB_PRESET_LIST,
  RGB_PRESETS,
  type RgbGradientDirection,
} from "../../../types/rgbEffect";
import {
  ThemeEditorForm,
  type ThemeEditorDraft,
} from "./theme/ThemeEditorForm";
import { ThemeLibraryGrid } from "./theme/ThemeLibraryGrid";

const DIRECTIONS: { id: RgbGradientDirection; label: string }[] = [
  { id: "clockwise", label: "По часовой стрелке" },
  { id: "counter-clockwise", label: "Против часовой" },
];

type EditorState =
  | { mode: "closed" }
  | { mode: "create"; draft: ThemeEditorDraft }
  | { mode: "edit"; id: string; draft: ThemeEditorDraft };

function themeToDraft(theme: CustomTheme): ThemeEditorDraft {
  return {
    name: theme.name,
    baseMode: theme.baseMode,
    colors: { ...theme.colors },
    gradient: {
      angle: theme.gradient.angle,
      colors: [...theme.gradient.colors],
    },
  };
}

export function AppearanceSection() {
  const {
    theme,
    activeId,
    customThemes,
    setActiveTheme,
    createTheme,
    updateTheme,
    deleteTheme,
  } = useTheme();
  const {
    settings,
    setEnabled,
    setAmbientBackground,
    setPreset,
    setDirection,
    setSpeed,
    setThickness,
    setGlowIntensity,
  } = useRgbEffect();

  const [editor, setEditor] = useState<EditorState>({ mode: "closed" });

  const {
    enabled,
    ambientBackground,
    preset,
    direction,
    speed,
    thickness,
    glowIntensity,
    gradient,
  } = settings;

  const animated = isPresetAnimated(preset);
  const previewColors = gradient.colors;

  const openCreate = () => {
    setEditor({
      mode: "create",
      draft: createEmptyDraft(theme, {
        angle: gradient.angle,
        colors: clampGradientColors(gradient.colors),
      }),
    });
  };

  const openEdit = (custom: CustomTheme) => {
    setEditor({
      mode: "edit",
      id: custom.id,
      draft: themeToDraft(custom),
    });
  };

  const handleSave = () => {
    if (editor.mode === "closed") return;
    const draft = {
      ...editor.draft,
      name: editor.draft.name.trim() || "Без названия",
      gradient: {
        angle: editor.draft.gradient.angle,
        colors: clampGradientColors(editor.draft.gradient.colors),
      },
    };
    if (editor.mode === "create") {
      createTheme(draft);
    } else {
      updateTheme(editor.id, draft);
    }
    setEditor({ mode: "closed" });
  };

  const handleDelete = () => {
    if (editor.mode !== "edit") return;
    deleteTheme(editor.id);
    setEditor({ mode: "closed" });
  };

  return (
    <section className="space-y-4 overflow-y-auto">
      <h3 className="text-[11px] font-semibold tracking-wider text-[var(--color-deck-muted)] uppercase">
        Тема оформления
      </h3>

      <ThemeLibraryGrid
        activeId={activeId}
        customThemes={customThemes}
        onSelect={setActiveTheme}
        onEdit={openEdit}
      />

      {editor.mode === "closed" ? (
        <button
          type="button"
          onClick={openCreate}
          className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed deck-border py-2 text-xs text-[var(--color-deck-muted)] transition-colors duration-200 hover:border-[var(--color-deck-accent)]/50 hover:bg-[var(--color-deck-surface-hover)] hover:text-[var(--color-deck-text)]"
        >
          <Plus className="h-3.5 w-3.5" />
          Создать тему
        </button>
      ) : (
        <ThemeEditorForm
          title={
            editor.mode === "create" ? "Новая тема" : "Редактирование темы"
          }
          draft={editor.draft}
          onChange={(draft) => setEditor({ ...editor, draft })}
          onSave={handleSave}
          onCancel={() => setEditor({ mode: "closed" })}
          onDelete={editor.mode === "edit" ? handleDelete : undefined}
          saveLabel={editor.mode === "create" ? "Создать" : "Сохранить"}
        />
      )}

      <h3 className="text-[11px] font-semibold tracking-wider text-[var(--color-deck-muted)] uppercase">
        Подсветка по контуру
      </h3>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-sm">RGB-подсветка</span>
          <p className="text-[11px] text-[var(--color-deck-muted)]">
            Включить светящуюся рамку окна
          </p>
        </div>
        <Toggle checked={enabled} onChange={setEnabled} />
      </div>

      <div
        className={`flex items-center justify-between ${!enabled ? "opacity-50" : ""}`}
      >
        <div>
          <span className="text-sm">Анимированный фон</span>
          <p className="text-[11px] text-[var(--color-deck-muted)]">
            Мягкое цветное свечение внутри панели
          </p>
        </div>
        <Toggle
          checked={ambientBackground}
          onChange={setAmbientBackground}
          disabled={!enabled}
        />
      </div>

      <div className="space-y-2">
        <span className="text-xs text-[var(--color-deck-muted)]">
          Стиль градиента
        </span>
        <div className="grid grid-cols-3 gap-1.5 rounded-lg deck-surface p-1.5">
          {RGB_PRESET_LIST.map((p) => {
            const colors = RGB_PRESETS[p.id].gradient.colors;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPreset(p.id)}
                className={`overflow-hidden rounded-md border transition-colors ${
                  preset === p.id
                    ? "border-[var(--color-deck-accent)] bg-[var(--color-deck-surface-hover)]"
                    : "border-transparent hover:border-[var(--color-deck-border)]"
                }`}
              >
                <div
                  className="h-5 w-full"
                  style={{
                    background: `linear-gradient(90deg, ${colors.join(", ")})`,
                  }}
                  aria-hidden
                />
                <span
                  className={`block px-1 py-1 text-center text-[9px] leading-tight ${
                    preset === p.id
                      ? "text-[var(--color-deck-text)]"
                      : "text-[var(--color-deck-muted)]"
                  }`}
                >
                  {p.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-1.5">
        <span className="text-xs text-[var(--color-deck-muted)]">
          Направление движения
        </span>
        <div
          className={`deck-segmented ${!animated ? "opacity-50" : ""}`}
          role="radiogroup"
          aria-label="Направление движения"
        >
          {DIRECTIONS.map((d) => (
            <button
              key={d.id}
              type="button"
              role="radio"
              aria-checked={direction === d.id}
              disabled={!animated}
              onClick={() => setDirection(d.id)}
              className={`deck-segmented-option ${
                direction === d.id ? "deck-segmented-option--active" : ""
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <Slider
        label="Толщина рамки"
        value={thickness}
        min={1}
        max={5}
        step={1}
        display={`${thickness}px`}
        onChange={setThickness}
      />

      <Slider
        label="Интенсивность свечения"
        value={glowIntensity}
        min={0}
        max={100}
        step={1}
        display={`${glowIntensity}%`}
        onChange={setGlowIntensity}
      />

      <Slider
        label="Скорость анимации"
        value={speed}
        min={1}
        max={10}
        step={1}
        display={String(speed)}
        onChange={setSpeed}
        disabled={!animated}
      />

      <div
        className="h-2 overflow-hidden rounded-full"
        style={{
          background: `linear-gradient(90deg, ${previewColors.join(", ")})`,
        }}
        aria-hidden
      />
    </section>
  );
}

function Toggle({
  checked,
  onChange,
  disabled,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors disabled:cursor-not-allowed ${
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

function Slider({
  label,
  value,
  min,
  max,
  step,
  display,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
  disabled?: boolean;
}) {
  const progress =
    max === min ? "0%" : `${((value - min) / (max - min)) * 100}%`;

  return (
    <div className={`space-y-2 ${disabled ? "opacity-50" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--color-deck-muted)]">{label}</span>
        <span className="font-mono-deck text-xs text-[var(--color-deck-text)]">
          {display}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        className="deck-range"
        style={{ "--range-pct": progress } as CSSProperties}
      />
    </div>
  );
}
