pub mod icon;
pub mod scanner;
pub mod types;

use tauri::AppHandle;
use tauri::Manager;

use self::icon::cache_dir;
use self::types::{AppMetadata, InstalledApp};

pub fn scan_apps(app: &AppHandle) -> Result<Vec<InstalledApp>, String> {
    let cache = app_cache_dir(app)?;
    scanner::scan_installed_apps(&cache)
}

pub fn app_metadata(app: &AppHandle, path: String) -> Result<AppMetadata, String> {
    let trimmed = path.trim();
    if trimmed.is_empty() {
        return Err("No path provided".to_string());
    }
    let cache = app_cache_dir(app)?;
    scanner::metadata_for_path(trimmed, &cache)
}

fn app_cache_dir(app: &AppHandle) -> Result<std::path::PathBuf, String> {
    let base = app
        .path()
        .app_data_dir()
        .map_err(|err| format!("Failed to resolve app data dir: {err}"))?;
    Ok(cache_dir(&base))
}
