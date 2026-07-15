import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { open } from "@tauri-apps/plugin-dialog";
import { isMacPlatform } from "./platform";

async function withFocusHideSuppressed<T>(fn: () => Promise<T>): Promise<T> {
  await invoke("set_suppress_focus_hide", { suppress: true });
  try {
    return await fn();
  } finally {
    const window = getCurrentWindow();
    try {
      await window.show();
      await window.setFocus();
    } catch {
      // Window may already be focused after the dialog closes.
    }
    await invoke("set_suppress_focus_hide", { suppress: false });
  }
}

/** Opens a native file/app picker without dismissing the Spotlight window. */
export async function pickAppPath(): Promise<string | null> {
  return withFocusHideSuppressed(async () => {
    const isMac = isMacPlatform();
    const selected = await open({
      multiple: false,
      directory: false,
      defaultPath: isMac ? "/Applications" : undefined,
      filters: [
        {
          name: "Applications",
          extensions: isMac
            ? ["app"]
            : ["exe", "bat", "cmd", "lnk", "msi"],
        },
      ],
    });

    return typeof selected === "string" ? selected : null;
  });
}
