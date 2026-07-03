import { type CSSProperties, type ReactNode, useMemo } from "react";
import { motion } from "framer-motion";
import { useRgbEffect } from "../context/RgbEffectContext";
import { getBaseDuration, type RgbEffectTarget } from "../types/rgbEffect";

type RgbBorderWrapperProps = {
  children: ReactNode;
  variant: RgbEffectTarget;
  className?: string;
  fallbackClassName?: string;
};

export function RgbBorderWrapper({
  children,
  variant,
  className = "",
  fallbackClassName = "",
}: RgbBorderWrapperProps) {
  const { settings } = useRgbEffect();
  const { enabled, target, preset, speed, thickness, gradient } = settings;

  const isActive = enabled && target === variant;

  const cssVars = useMemo(
    () =>
      ({
        "--rgb-thickness": `${thickness}px`,
        "--rgb-duration": `${getBaseDuration(preset) / speed}s`,
        "--rgb-color-1": gradient.colors[0],
        "--rgb-color-2": gradient.colors[1],
        "--rgb-color-3": gradient.colors[2],
        "--gradient-angle": `${gradient.angle}deg`,
      }) as CSSProperties,
    [thickness, preset, speed, gradient],
  );

  if (!isActive) {
    return <div className={fallbackClassName || className}>{children}</div>;
  }

  const wrapperClass =
    variant === "full-panel"
      ? "rgb-border-wrapper rgb-border-wrapper--full-panel"
      : "rgb-border-wrapper rgb-border-wrapper--search-row";

  const glowDuration = getBaseDuration(preset) / speed;

  return (
    <div
      className={`${wrapperClass} rgb-preset-${preset} ${className}`}
      style={cssVars}
    >
      <div className="rgb-border-gradient" aria-hidden="true" />

      {preset === "neon-pulse" && (
        <motion.div
          className="rgb-border-glow"
          aria-hidden="true"
          animate={{
            opacity: [0.25, 0.65, 0.25],
            boxShadow: [
              `0 0 ${thickness * 4}px ${gradient.colors[0]}40, 0 0 ${thickness * 8}px ${gradient.colors[1]}30`,
              `0 0 ${thickness * 8}px ${gradient.colors[0]}70, 0 0 ${thickness * 16}px ${gradient.colors[2]}50`,
              `0 0 ${thickness * 4}px ${gradient.colors[0]}40, 0 0 ${thickness * 8}px ${gradient.colors[1]}30`,
            ],
          }}
          transition={{
            duration: glowDuration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      <div className="rgb-border-inner">{children}</div>
    </div>
  );
}
