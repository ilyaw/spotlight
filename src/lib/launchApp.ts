import { invoke } from "@tauri-apps/api/core";
import type { LauncherApp } from "../types/appLauncher";

export async function launchApp(app: LauncherApp): Promise<void> {
  if (!app.path) {
    console.warn(`No path configured for app: ${app.name}`);
    return;
  }

  await invoke("launch_app", { path: app.path });
}
