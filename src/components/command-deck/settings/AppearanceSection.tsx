import { useRgbEffect } from "../../../context/RgbEffectContext";
import { useTheme } from "../../../context/ThemeContext";
import {
  RGB_PRESET_GRADIENTS,
  type RgbGradientDirection,
  type RgbPreset,
} from "../../../types/rgbEffect";

const PRESETS: { id: RgbPreset; label: string }[] = [
  { id: "static", label: "Статичный" },
  { id: "two-color", label: "Двухцветный" },
  { id: "rainbow", label: "Радуга" },
];

const DIRECTIONS: { id: RgbGradientDirection; label: string }[] = [
  { id: "clockwise", label: "По часовой стрелке" },
  { id: "counter-clockwise", label: "Против часовой" },
];

export function AppearanceSection() {
  const { theme, setTheme } = useTheme();
  const {
    settings,
    setEnabled,
    setPreset,
    setDirection,
    setSpeed,
    setThickness,
    setGlowIntensity,
  } = useRgbEffect();

  const {
    enabled,
    preset,
    direction,
    speed,
    thickness,
    glowIntensity,
  } = settings;

  return (
    <section className="space-y-4">
      <h3 className="text-[11px] font-semibold tracking-wider text-[var(--color-deck-muted)] uppercase">
        Тема оформления
      </h3>

      <div className="flex gap-1 rounded-lg deck-surface p-1">
        {(["dark", "light"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => setTheme(mode)}
            className={`flex-1 rounded-md py-1.5 text-xs transition-colors ${
              theme === mode
                ? "bg-[var(--color-deck-surface-hover)] text-[var(--color-deck-text)]"
                : "text-[var(--color-deck-muted)] hover:text-[var(--color-deck-text)]"
            }`}
          >
            {mode === "dark" ? "Тёмная" : "Светлая"}
          </button>
        ))}
      </div>

      <h3 className="text-[11px] font-semibold tracking-wider text-[var(--color-deck-muted)] uppercase">
        Подсветка по контуру
      </h3>

      <label className="flex items-center justify-between">
        <div>
          <span className="text-sm">RGB-подсветка</span>
          <p className="text-[11px] text-[var(--color-deck-muted)]">
            Включить светящуюся рамку окна
          </p>
        </div>
        <Toggle checked={enabled} onChange={setEnabled} />
      </label>

      <div className="space-y-2">
        <span className="text-xs text-[var(--color-deck-muted)]">
          Стиль градиента
        </span>
        <div className="flex gap-1 rounded-lg deck-surface p-1">
          {PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setPreset(p.id)}
              className={`flex-1 rounded-md py-1.5 text-[10px] transition-colors ${
                preset === p.id
                  ? "bg-[var(--color-deck-surface-hover)] text-[var(--color-deck-text)]"
                  : "text-[var(--color-deck-muted)]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <span className="text-xs text-[var(--color-deck-muted)]">
          Направление движения
        </span>
        <select
          value={direction}
          onChange={(e) =>
            setDirection(e.target.value as RgbGradientDirection)
          }
          disabled={preset === "static"}
          className="w-full rounded-lg deck-surface px-3 py-2 text-sm text-[var(--color-deck-text)] outline-none disabled:opacity-50"
        >
          {DIRECTIONS.map((d) => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>
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
        disabled={preset === "static"}
      />

      <div
        className="h-2 overflow-hidden rounded-full"
        style={{
          background: `linear-gradient(90deg, ${RGB_PRESET_GRADIENTS[preset].colors.join(", ")})`,
        }}
        aria-hidden
      />
    </section>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 rounded-full transition-colors ${
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
  return (
    <div className={`space-y-1.5 ${disabled ? "opacity-50" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--color-deck-muted)]">{label}</span>
        <span className="font-mono-deck text-xs text-[var(--color-deck-muted)]">
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
        className="h-1 w-full cursor-pointer appearance-none rounded-full deck-surface accent-[var(--color-deck-accent)] disabled:cursor-not-allowed"
      />
    </div>
  );
}
