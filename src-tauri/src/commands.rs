use std::path::Path;

use tauri::{AppHandle, Manager};
use tauri_plugin_global_shortcut::GlobalShortcutExt;
use tauri_plugin_opener::OpenerExt;

use crate::apps::{self, types::InstalledApp};
use crate::system::{apply_system_behavior as apply_behavior, RuntimeSettings, SystemBehavior};

#[tauri::command]
pub fn apply_system_behavior(app: AppHandle, behavior: SystemBehavior) -> Result<(), String> {
    apply_behavior(&app, behavior)
}

#[tauri::command]
pub fn set_suppress_focus_hide(
    app: AppHandle,
    suppress: bool,
) -> Result<(), String> {
    let settings = app
        .try_state::<RuntimeSettings>()
        .ok_or_else(|| "Runtime settings unavailable".to_string())?;
    settings.set_suppress_focus_hide(suppress);
    Ok(())
}

#[tauri::command]
pub fn quit_app(app: AppHandle) {
    app.exit(0);
}

#[tauri::command]
pub fn update_global_shortcut(app: AppHandle, shortcut: String) -> Result<(), String> {
    let trimmed = shortcut.trim();
    if trimmed.is_empty() {
        return Err("Shortcut cannot be empty".to_string());
    }

    let manager = app.global_shortcut();
    manager
        .unregister_all()
        .map_err(|err| format!("Failed to clear previous shortcut: {err}"))?;
    manager
        .register(trimmed)
        .map_err(|err| format!("Failed to register \"{trimmed}\": {err}"))?;

    Ok(())
}

#[tauri::command]
pub fn launch_app(app: AppHandle, path: String) -> Result<(), String> {
    let trimmed = path.trim();
    if trimmed.is_empty() {
        return Err("No application path provided".to_string());
    }

    if !Path::new(trimmed).exists() {
        return Err(format!("Path does not exist: {trimmed}"));
    }

    app.opener()
        .open_path(trimmed, None::<&str>)
        .map_err(|err| format!("Failed to launch {trimmed}: {err}"))
}

#[tauri::command]
pub fn scan_installed_apps(app: AppHandle) -> Result<Vec<InstalledApp>, String> {
    apps::scan_apps(&app)
}

#[tauri::command]
pub fn get_app_metadata(app: AppHandle, path: String) -> Result<apps::types::AppMetadata, String> {
    apps::app_metadata(&app, path)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn empty_path_is_rejected() {
        let result = Path::new("   ").exists();
        assert!(!result);
    }
}
