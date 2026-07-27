import { describe, expect, it } from "vitest";
import {
  buildRgbGradientCss,
  migrateRgbSettings,
  normalizeRgbGradientColors,
} from "./rgbEffect";

describe("buildRgbGradientCss", () => {
  const gradient = {
    angle: 135,
    colors: ["#00f0ff", "#ff00aa", "#ffe600"],
  };

  it("uses numeric angle for linear gradients", () => {
    expect(buildRgbGradientCss(gradient, "linear")).toBe(
      "linear-gradient(135deg, #00f0ff, #ff00aa, #ffe600)",
    );
  });

  it("closes the loop for linear-loop", () => {
    expect(buildRgbGradientCss(gradient, "linear-loop")).toBe(
      "linear-gradient(135deg, #00f0ff, #ff00aa, #ffe600, #00f0ff)",
    );
  });

  it("uses var(--gradient-angle) for conic so rgb-spin can rotate", () => {
    expect(buildRgbGradientCss(gradient, "conic")).toBe(
      "conic-gradient(from var(--gradient-angle), #00f0ff, #ff00aa, #ffe600)",
    );
    expect(buildRgbGradientCss(gradient, "conic-loop")).toBe(
      "conic-gradient(from var(--gradient-angle), #00f0ff, #ff00aa, #ffe600, #00f0ff)",
    );
  });
});

describe("normalizeRgbGradientColors", () => {
  it("sanitizes unsafe stops", () => {
    expect(
      normalizeRgbGradientColors(["#ff0000", "url(evil)", "#00ff00"]),
    ).toEqual(["#ff0000", "#8338ec", "#00ff00"]);
  });

  it("pads a single color to two stops", () => {
    expect(normalizeRgbGradientColors(["#abc"])).toEqual(["#abc", "#abc"]);
  });
});

describe("migrateRgbSettings", () => {
  it("keeps a 3-color tuple from legacy storage", () => {
    const migrated = migrateRgbSettings({
      preset: "cyberpunk",
      gradient: {
        angle: 90,
        colors: ["#00f0ff", "#ff00aa", "#ffe600"],
      },
    });
    expect(migrated.preset).toBe("cyberpunk");
    expect(migrated.gradient.colors).toEqual([
      "#00f0ff",
      "#ff00aa",
      "#ffe600",
    ]);
    expect(migrated.gradient.angle).toBe(90);
  });

  it("maps unknown preset to rainbow", () => {
    const migrated = migrateRgbSettings({
      preset: "not-a-real-preset" as never,
    });
    expect(migrated.preset).toBe("rainbow");
  });

  it("maps rainbow-wave legacy id and fills missing gradient", () => {
    const migrated = migrateRgbSettings({
      preset: "rainbow-wave" as never,
    });
    expect(migrated.preset).toBe("rainbow");
    expect(migrated.gradient.colors.length).toBeGreaterThanOrEqual(2);
  });

  it("rejects unsafe gradient colors during migrate", () => {
    const migrated = migrateRgbSettings({
      gradient: {
        angle: 10,
        colors: ["#111111", "red); background: url(x"],
      },
    });
    expect(migrated.gradient.colors[0]).toBe("#111111");
    expect(migrated.gradient.colors[1]).not.toContain("url");
    expect(migrated.gradient.colors[1]).toMatch(/^#/);
  });
});
