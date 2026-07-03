use std::path::Path;
use std::process::Command;

use tauri::AppHandle;
use tauri_plugin_global_shortcut::GlobalShortcutExt;

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
pub fn launch_app(path: String) -> Result<(), String> {
    let trimmed = path.trim();
    if trimmed.is_empty() {
        return Err("No application path provided".to_string());
    }

    if !Path::new(trimmed).exists() {
        return Err(format!("Path does not exist: {trimmed}"));
    }

    spawn(trimmed).map_err(|err| format!("Failed to launch {trimmed}: {err}"))
}

#[cfg(target_os = "macos")]
fn spawn(path: &str) -> std::io::Result<()> {
    Command::new("open").arg(path).spawn()?;
    Ok(())
}

#[cfg(not(target_os = "macos"))]
fn spawn(path: &str) -> std::io::Result<()> {
    Command::new(path).spawn()?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn empty_path_is_rejected() {
        assert!(launch_app("   ".to_string()).is_err());
    }

    #[test]
    fn nonexistent_path_is_rejected() {
        assert!(launch_app("/definitely/not/a/real/path".to_string()).is_err());
    }
}
