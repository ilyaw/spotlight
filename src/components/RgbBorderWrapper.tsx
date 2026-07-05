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
    ambientBackground,
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
      "--ambient-opacity": glow.ambientOpacity,
    } as CSSProperties;
  }, [thickness, preset, speed, glowIntensity, gradient]);

  const directionClass =
    direction === "counter-clockwise" ? "rgb-border-wrapper--reverse" : "";

  const outerClassName = isActive
    ? `rgb-border-wrapper rgb-border-wrapper--full-panel rgb-preset-${preset} ${directionClass} ${className}`
    : fallbackClassName ||
      `deck-panel overflow-hidden rounded-[var(--radius-deck)] border deck-border ${className}`;

  return (
    <div className={outerClassName} style={isActive ? cssVars : undefined}>
      {isActive && (
        <>
          <div className="rgb-border-backdrop-glow" aria-hidden="true" />
          <div className="rgb-border-gradient" aria-hidden="true" />
        </>
      )}
      <div className={isActive ? "rgb-border-inner" : undefined}>
        {isActive && ambientBackground && (
          <div
            className={`deck-ambient-bg rgb-preset-${preset} ${directionClass}`}
            aria-hidden="true"
          />
        )}
        <div
          className={
            isActive ? "relative z-[1] flex min-h-0 flex-col" : undefined
          }
        >
          {children}
        </div>
      </div>
    </div>
  );
}
