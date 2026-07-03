import { AnimatePresence, motion } from "framer-motion";
import { RotateCcw } from "lucide-react";
import { useRgbEffect } from "../context/RgbEffectContext";
import {
  RGB_PRESET_GRADIENTS,
  type RgbEffectTarget,
  type RgbPreset,
} from "../types/rgbEffect";

const PRESETS: { id: RgbPreset; label: string }[] = [
  { id: "cyberpunk", label: "Cyberpunk" },
  { id: "rainbow-wave", label: "Rainbow Wave" },
  { id: "neon-pulse", label: "Neon Pulse" },
];

const TARGETS: { id: RgbEffectTarget; label: string }[] = [
  { id: "search-row", label: "Search row" },
  { id: "full-panel", label: "Full panel" },
];

type RgbSettingsPanelProps = {
  open: boolean;
};

export function RgbSettingsPanel({ open }: RgbSettingsPanelProps) {
  const {
    settings,
    setEnabled,
    setPreset,
    setTarget,
    setSpeed,
    setThickness,
    setGradient,
    resetGradientToPreset,
  } = useRgbEffect();

  const { enabled, preset, target, speed, thickness, gradient } = settings;

  return (
    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          key="rgb-settings"
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="border-t border-white/10"
        >
          <div className="space-y-4 px-5 py-4">
            {/* Enable toggle */}
            <label className="flex cursor-pointer items-center justify-between">
              <span className="text-sm text-zinc-300">RGB Effect</span>
              <button
                type="button"
                role="switch"
                aria-checked={enabled}
                onClick={() => setEnabled(!enabled)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  enabled ? "bg-violet-600" : "bg-white/10"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    enabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </label>

            {/* Target */}
            <div className="space-y-2">
              <span className="text-xs text-zinc-500">Apply to</span>
              <div className="flex gap-2">
                {TARGETS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTarget(t.id)}
                    className={`flex-1 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                      target === t.id
                        ? "bg-white/15 text-zinc-100"
                        : "bg-white/5 text-zinc-400 hover:bg-white/10"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-2">
              <span className="text-xs text-zinc-500">Preset</span>
              <div className="grid grid-cols-3 gap-2">
                {PRESETS.map((p) => {
                  const colors = RGB_PRESET_GRADIENTS[p.id].colors;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPreset(p.id)}
                      className={`overflow-hidden rounded-lg border transition-colors ${
                        preset === p.id
                          ? "border-white/30 bg-white/10"
                          : "border-white/5 bg-white/5 hover:border-white/15"
                      }`}
                    >
                      <div
                        className="h-6 w-full"
                        style={{
                          background: `linear-gradient(90deg, ${colors.join(", ")})`,
                        }}
                      />
                      <span className="block px-2 py-1.5 text-[10px] text-zinc-400">
                        {p.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Speed */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Speed</span>
                <span className="text-xs text-zinc-400">{speed.toFixed(1)}×</span>
              </div>
              <input
                type="range"
                min={0.5}
                max={5}
                step={0.1}
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-violet-500"
              />
              <div className="flex justify-between text-[10px] text-zinc-600">
                <span>Slow</span>
                <span>Fast</span>
              </div>
            </div>

            {/* Thickness */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Thickness</span>
                <span className="text-xs text-zinc-400">{thickness}px</span>
              </div>
              <input
                type="range"
                min={1}
                max={6}
                step={1}
                value={thickness}
                onChange={(e) => setThickness(Number(e.target.value))}
                className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-violet-500"
              />
            </div>

            {/* Gradient */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-500">Gradient</span>
                <button
                  type="button"
                  onClick={resetGradientToPreset}
                  className="flex items-center gap-1 text-[10px] text-zinc-500 transition-colors hover:text-zinc-300"
                >
                  <RotateCcw className="h-3 w-3" />
                  Reset to preset
                </button>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-600">Angle</span>
                  <span className="text-[10px] text-zinc-400">
                    {gradient.angle}°
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={360}
                  step={1}
                  value={gradient.angle}
                  onChange={(e) =>
                    setGradient({
                      ...gradient,
                      angle: Number(e.target.value),
                    })
                  }
                  className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/10 accent-violet-500"
                />
              </div>

              <div className="flex gap-2">
                {gradient.colors.map((color, index) => (
                  <label
                    key={index}
                    className="flex flex-1 flex-col items-center gap-1"
                  >
                    <input
                      type="color"
                      value={color}
                      onChange={(e) => {
                        const colors = [...gradient.colors] as [
                          string,
                          string,
                          string,
                        ];
                        colors[index] = e.target.value;
                        setGradient({ ...gradient, colors });
                      }}
                      className="h-8 w-full cursor-pointer rounded border border-white/10 bg-transparent"
                    />
                    <span className="text-[10px] text-zinc-600">
                      Stop {index + 1}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
