import { describe, expect, it } from "vitest";
import { isSafeCssColor, sanitizeCssColor } from "../lib/cssColor";
import {
  clampGradientColors,
  normalizeCustomTheme,
} from "./theme";

describe("cssColor sanitize", () => {
  it("accepts hex and modern rgb/hsl", () => {
    expect(isSafeCssColor("#8b5cf6")).toBe(true);
    expect(isSafeCssColor("#abc")).toBe(true);
    expect(isSafeCssColor("rgb(24 24 27 / 0.92)")).toBe(true);
    expect(isSafeCssColor("rgba(255, 0, 0, 0.5)")).toBe(true);
    expect(isSafeCssColor("hsl(270 50% 40%)")).toBe(true);
  });

  it("rejects url/expression and injection attempts", () => {
    expect(isSafeCssColor("url(https://evil)")).toBe(false);
    expect(isSafeCssColor("red; background: #000")).toBe(false);
    expect(isSafeCssColor("expression(alert(1))")).toBe(false);
    expect(sanitizeCssColor("url(x)", "#ffffff")).toBe("#ffffff");
  });
});

describe("clampGradientColors", () => {
  it("clamps to 2–6 sanitized stops", () => {
    expect(clampGradientColors(["#111", "#222"]).length).toBe(2);
    expect(
      clampGradientColors([
        "#1",
        "#2",
        "#3",
        "#4",
        "#5",
        "#6",
        "#7",
        "#8",
      ]).length,
    ).toBeLessThanOrEqual(6);
  });

  it("replaces unsafe colors with fallbacks", () => {
    const colors = clampGradientColors(["#ff0000", "url(bad)"]);
    expect(colors[0]).toBe("#ff0000");
    expect(isSafeCssColor(colors[1]!)).toBe(true);
  });
});

describe("normalizeCustomTheme", () => {
  it("returns null for builtin ids and missing id", () => {
    expect(normalizeCustomTheme({ id: "dark" })).toBeNull();
    expect(normalizeCustomTheme({})).toBeNull();
  });

  it("sanitizes colors and keeps a valid custom theme", () => {
    const theme = normalizeCustomTheme({
      id: "custom-1",
      name: "  Neon  ",
      baseMode: "dark",
      colors: {
        bg: "#18181b",
        surface: "url(bad)",
        surfaceHover: "#3f3f46",
        border: "#3f3f46",
        text: "#f4f4f5",
        muted: "#a1a1aa",
        accent: "#8b5cf6",
      },
      gradient: {
        angle: 90,
        colors: ["#00ff00", "#0000ff"],
      },
    });

    expect(theme).not.toBeNull();
    expect(theme!.name).toBe("Neon");
    expect(theme!.colors.bg).toBe("#18181b");
    expect(theme!.colors.surface).toBe("#27272a");
    expect(theme!.gradient.colors).toEqual(["#00ff00", "#0000ff"]);
  });

  it("sanitizes unsafe gradient stops on save-equivalent normalize", () => {
    const theme = normalizeCustomTheme({
      id: "custom-save",
      name: "Save",
      baseMode: "light",
      colors: {
        bg: "red); background: url(x",
        surface: "#f4f4f5",
        surfaceHover: "#e4e4e7",
        border: "#e4e4e7",
        text: "#18181b",
        muted: "#71717a",
        accent: "#7c3aed",
      },
      gradient: {
        angle: 45,
        colors: ["#111111", "url(evil)", "#222222"],
      },
    });

    expect(theme).not.toBeNull();
    expect(theme!.colors.bg).toBe("#ffffff");
    expect(theme!.gradient.colors).toEqual([
      "#111111",
      "#8338ec",
      "#222222",
    ]);
    expect(theme!.gradient.colors.every((c) => isSafeCssColor(c))).toBe(true);
  });
});
