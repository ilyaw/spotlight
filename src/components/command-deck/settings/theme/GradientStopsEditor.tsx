import { type CSSProperties } from "react";
import { ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import {
  MAX_GRADIENT_STOPS,
  MIN_GRADIENT_STOPS,
} from "../../../../types/theme";
import { ColorField } from "./ColorField";

type GradientStopsEditorProps = {
  colors: string[];
  angle: number;
  onColorsChange: (colors: string[]) => void;
  onAngleChange: (angle: number) => void;
};

export function GradientStopsEditor({
  colors,
  angle,
  onColorsChange,
  onAngleChange,
}: GradientStopsEditorProps) {
  const canRemove = colors.length > MIN_GRADIENT_STOPS;
  const canAdd = colors.length < MAX_GRADIENT_STOPS;

  const updateAt = (index: number, value: string) => {
    onColorsChange(colors.map((c, i) => (i === index ? value : c)));
  };

  const removeAt = (index: number) => {
    if (!canRemove) return;
    onColorsChange(colors.filter((_, i) => i !== index));
  };

  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir;
    if (next < 0 || next >= colors.length) return;
    const copy = [...colors];
    const tmp = copy[index];
    copy[index] = copy[next];
    copy[next] = tmp;
    onColorsChange(copy);
  };

  const addStop = () => {
    if (!canAdd) return;
    const last = colors[colors.length - 1] ?? "#8b5cf6";
    onColorsChange([...colors, last]);
  };

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <label
          htmlFor="theme-gradient-angle"
          className="block text-[10px] font-medium tracking-wide text-[var(--color-deck-muted)] uppercase"
        >
          Угол градиента
        </label>
        <div className="flex items-center gap-2">
          <input
            id="theme-gradient-angle"
            type="range"
            min={0}
            max={360}
            step={1}
            value={angle}
            onChange={(e) => onAngleChange(Number(e.target.value))}
            className="deck-range flex-1"
            style={
              {
                "--range-pct": `${(angle / 360) * 100}%`,
              } as CSSProperties
            }
          />
          <span className="font-mono-deck w-10 text-right text-[11px] text-[var(--color-deck-text)]">
            {angle}°
          </span>
        </div>
      </div>

      <div
        className="h-2 overflow-hidden rounded-full"
        style={{
          background: `linear-gradient(90deg, ${colors.join(", ")})`,
        }}
        aria-hidden
      />

      <ul className="space-y-2" aria-label="Цвета градиента">
        {colors.map((color, index) => (
          <li key={index} className="flex items-end gap-1.5">
            <div className="min-w-0 flex-1">
              <ColorField
                id={`gradient-stop-${index}`}
                label={`Стоп ${index + 1}`}
                value={color}
                onChange={(v) => updateAt(index, v)}
              />
            </div>
            <div className="flex shrink-0 gap-0.5 pb-0.5">
              <button
                type="button"
                onClick={() => move(index, -1)}
                disabled={index === 0}
                className="rounded-md p-1.5 text-[var(--color-deck-muted)] transition-colors hover:bg-[var(--color-deck-surface-hover)] hover:text-[var(--color-deck-text)] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`Переместить стоп ${index + 1} вверх`}
              >
                <ChevronUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => move(index, 1)}
                disabled={index === colors.length - 1}
                className="rounded-md p-1.5 text-[var(--color-deck-muted)] transition-colors hover:bg-[var(--color-deck-surface-hover)] hover:text-[var(--color-deck-text)] disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`Переместить стоп ${index + 1} вниз`}
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => removeAt(index)}
                disabled={!canRemove}
                className="rounded-md p-1.5 text-[var(--color-deck-muted)] transition-colors hover:bg-red-500/15 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={`Удалить стоп ${index + 1}`}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={addStop}
        disabled={!canAdd}
        className="flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-dashed deck-border py-2 text-xs text-[var(--color-deck-muted)] transition-colors duration-200 hover:border-[var(--color-deck-accent)]/50 hover:bg-[var(--color-deck-surface-hover)] hover:text-[var(--color-deck-text)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Plus className="h-3.5 w-3.5" />
        Добавить цвет ({colors.length}/{MAX_GRADIENT_STOPS})
      </button>
    </div>
  );
}
