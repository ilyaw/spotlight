use std::collections::HashMap;
use std::fs;
use std::path::{Path, PathBuf};

use plist::Value;

use crate::apps::icon;
use crate::apps::types::{AppMetadata, InstalledApp};

const APP_DIRS: &[&str] = &["/Applications", "/System/Applications"];

pub fn scan(cache_dir: &Path) -> Result<Vec<InstalledApp>, String> {
    let mut entries: HashMap<String, InstalledApp> = HashMap::new();
    collect_apps(&mut entries, cache_dir)?;

    let mut apps: Vec<InstalledApp> = entries.into_values().collect();
    apps.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    Ok(apps)
}

pub fn metadata_for_path(path: &str, cache_dir: &Path) -> Result<AppMetadata, String> {
    let name = display_name_for_path(path)?;
    let icon = icon::icon_data_url(path, cache_dir)?;
    Ok(AppMetadata { name, icon })
}

fn collect_apps(
    entries: &mut HashMap<String, InstalledApp>,
    cache_dir: &Path,
) -> Result<(), String> {
    for dir in APP_DIRS {
        scan_dir(Path::new(dir), entries, cache_dir);
    }

    if let Some(home) = dirs::home_dir() {
        scan_dir(&home.join("Applications"), entries, cache_dir);
    }

    Ok(())
}

fn scan_dir(dir: &Path, entries: &mut HashMap<String, InstalledApp>, cache_dir: &Path) {
    let read_dir = match fs::read_dir(dir) {
        Ok(rd) => rd,
        Err(_) => return,
    };

    for entry in read_dir.flatten() {
        let path = entry.path();
        if !path.is_dir() {
            continue;
        }
        if path.extension().and_then(|e| e.to_str()) != Some("app") {
            continue;
        }

        if let Some(app) = app_from_bundle(&path, cache_dir) {
            entries.entry(app.path.clone()).or_insert(app);
        }
    }
}

fn app_from_bundle(bundle_path: &Path, cache_dir: &Path) -> Option<InstalledApp> {
    let plist_path = bundle_path.join("Contents/Info.plist");
    let plist: plist::Dictionary = plist::from_file(&plist_path).ok()?;

    let name = bundle_display_name(&plist, bundle_path);
    let id = plist
        .get("CFBundleIdentifier")
        .and_then(|v| v.as_string())
        .map(|s| s.to_string())
        .unwrap_or_else(|| bundle_path.to_string_lossy().to_string());

    let path_str = bundle_path.to_string_lossy().to_string();
    let icon = icon::icon_data_url(&path_str, cache_dir).unwrap_or_default();

    Some(InstalledApp {
        id,
        name,
        path: path_str,
        icon,
    })
}

fn display_name_for_path(path: &str) -> Result<String, String> {
    let bundle_path = PathBuf::from(path);
    if bundle_path.extension().and_then(|e| e.to_str()) == Some("app") {
        let plist_path = bundle_path.join("Contents/Info.plist");
        if let Ok(plist) = plist::from_file(&plist_path) {
            return Ok(bundle_display_name(&plist, &bundle_path));
        }
    }

    Ok(file_stem_name(&bundle_path))
}

fn bundle_display_name(plist: &plist::Dictionary, bundle_path: &Path) -> String {
    for key in ["CFBundleDisplayName", "CFBundleName"] {
        if let Some(Value::String(name)) = plist.get(key) {
            if !name.is_empty() {
                return name.clone();
            }
        }
    }
    file_stem_name(bundle_path)
}

fn file_stem_name(path: &Path) -> String {
    path.file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("Application")
        .to_string()
}
