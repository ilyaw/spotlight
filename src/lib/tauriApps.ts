import { invoke } from "@tauri-apps/api/core";
import type { AppMetadata } from "../types/appLauncher";

export async function fetchAppMetadata(path: string): Promise<AppMetadata> {
  return invoke<AppMetadata>("get_app_metadata", { path });
}
