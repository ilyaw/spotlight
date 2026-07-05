import { type CSSProperties, type ReactNode, useMemo } from "react";
import { useRgbEffect } from "../context/RgbEffectContext";
import {
  glowVars,
  speedToDuration,
  type RgbEffectTarget,
} from "../types/rgbEffect";

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
  const {
    enabled,
    target,
    preset,
    direction,
    speed,
    thickness,
    glowIntensity,
    gradient,
  } = settings;

  const isActive = enabled && target === variant;

  const cssVars = useMemo(() => {
    const glow = glowVars(glowIntensity);
    return {
      "--rgb-thickness": `${thickness}px`,
      "--rgb-duration": speedToDuration(speed, preset),
      "--rgb-color-1": gradient.colors[0],
      "--rgb-color-2": gradient.colors[1],
      "--rgb-color-3": gradient.colors[2],
      "--gradient-angle": `${gradient.angle}deg`,
      "--rgb-glow-blur": glow.blur,
      "--rgb-glow-opacity": glow.opacity,
      "--rgb-glow-near-alpha": glow.nearAlpha,
      "--rgb-glow-far-alpha": glow.farAlpha,
    } as CSSProperties;
  }, [thickness, preset, speed, glowIntensity, gradient]);

  if (!isActive) {
    return (
      <div
        className={
          fallbackClassName ||
          `deck-panel overflow-hidden rounded-[var(--radius-deck)] border deck-border ${className}`
        }
      >
        {children}
      </div>
    );
  }

  const directionClass =
    direction === "counter-clockwise" ? "rgb-border-wrapper--reverse" : "";

  return (
    <div
      className={`rgb-border-wrapper rgb-border-wrapper--full-panel rgb-preset-${preset} ${directionClass} ${className}`}
      style={cssVars}
    >
      <div className="rgb-border-backdrop-glow" aria-hidden="true" />
      <div className="rgb-border-gradient" aria-hidden="true" />
      <div className="rgb-border-inner">{children}</div>
    </div>
  );
}
