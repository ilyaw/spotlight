import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";

/**
 * Starts a window drag while suppressing hide-on-focus-loss.
 * On Windows, caption-style dragging can emit a transient Focused(false).
 */
export async function startWindowDrag(): Promise<void> {
  await invoke("set_suppress_focus_hide", { suppress: true });
  try {
    await getCurrentWindow().startDragging();
  } finally {
    await invoke("set_suppress_focus_hide", { suppress: false });
  }
}
