import { describe, expect, it } from "vitest";
import { migrateRgbSettings } from "../types/rgbEffect";

describe("migrateRgbSettings (context migration)", () => {
  it("defaults target to full-panel", () => {
    const migrated = migrateRgbSettings({
      enabled: false,
    });
    expect(migrated.target).toBe("full-panel");
    expect(migrated.enabled).toBe(false);
  });

  it("preserves ambientBackground when provided", () => {
    expect(
      migrateRgbSettings({ ambientBackground: false }).ambientBackground,
    ).toBe(false);
  });
});
