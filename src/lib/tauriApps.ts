import { invoke } from "@tauri-apps/api/core";
import type { AppMetadata, InstalledApp } from "../types/appLauncher";

export async function fetchInstalledApps(): Promise<InstalledApp[]> {
  return invoke<InstalledApp[]>("scan_installed_apps");
}

export async function fetchAppMetadata(path: string): Promise<AppMetadata> {
  return invoke<AppMetadata>("get_app_metadata", { path });
}
