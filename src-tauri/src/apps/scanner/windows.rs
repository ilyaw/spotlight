use std::collections::HashMap;
use std::ffi::OsStr;
use std::os::windows::ffi::OsStrExt;
use std::path::{Path, PathBuf};

use walkdir::WalkDir;
use windows::core::PCWSTR;
use windows::Win32::System::Com::{
    CoCreateInstance, CoInitializeEx, CLSCTX_INPROC_SERVER, COINIT_APARTMENTTHREADED,
};
use windows::Win32::UI::Shell::{IPersistFile, IShellLinkW, ShellLink};

use crate::apps::icon;
use crate::apps::types::{AppMetadata, InstalledApp};

pub fn scan(cache_dir: &Path) -> Result<Vec<InstalledApp>, String> {
    let mut entries: HashMap<String, InstalledApp> = HashMap::new();
    collect_apps(&mut entries, cache_dir)?;

    let mut apps: Vec<InstalledApp> = entries.into_values().collect();
    apps.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    Ok(apps)
}

pub fn metadata_for_path(path: &str, cache_dir: &Path) -> Result<AppMetadata, String> {
    let name = display_name_for_path(path);
    let icon = icon::icon_data_url(path, cache_dir)?;
    Ok(AppMetadata { name, icon })
}

fn collect_apps(
    entries: &mut HashMap<String, InstalledApp>,
    cache_dir: &Path,
) -> Result<(), String> {
    for dir in start_menu_dirs() {
        if !dir.exists() {
            continue;
        }
        for entry in WalkDir::new(&dir).into_iter().filter_map(|e| e.ok()) {
            let path = entry.path();
            let ext = path.extension().and_then(|e| e.to_str()).unwrap_or("");
            match ext.to_lowercase().as_str() {
                "exe" => insert_exe(path, entries, cache_dir),
                "lnk" => {
                    if let Some(target) = resolve_lnk(path) {
                        insert_exe(Path::new(&target), entries, cache_dir);
                    }
                }
                _ => {}
            }
        }
    }
    Ok(())
}

fn display_name_for_path(path: &str) -> String {
    Path::new(path)
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("Application")
        .to_string()
}

fn start_menu_dirs() -> Vec<PathBuf> {
    let mut dirs = Vec::new();
    if let Some(program_data) = std::env::var_os("ProgramData") {
        dirs.push(
            PathBuf::from(program_data)
                .join("Microsoft")
                .join("Windows")
                .join("Start Menu")
                .join("Programs"),
        );
    }
    if let Some(app_data) = std::env::var_os("APPDATA") {
        dirs.push(
            PathBuf::from(app_data)
                .join("Microsoft")
                .join("Windows")
                .join("Start Menu")
                .join("Programs"),
        );
    }
    dirs
}

fn insert_exe(path: &Path, entries: &mut HashMap<String, InstalledApp>, cache_dir: &Path) {
    if !path.is_file() {
        return;
    }
    let path_str = path.to_string_lossy().to_string();
    if entries.contains_key(&path_str) {
        return;
    }

    let name = path
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("Application")
        .to_string();

    let icon = icon::icon_data_url(&path_str, cache_dir).unwrap_or_default();

    entries.insert(
        path_str.clone(),
        InstalledApp {
            id: path_str.clone(),
            name,
            path: path_str,
            icon,
        },
    );
}

fn resolve_lnk(lnk_path: &Path) -> Option<String> {
    unsafe {
        let _ = CoInitializeEx(None, COINIT_APARTMENTTHREADED);

        let shell_link: IShellLinkW =
            CoCreateInstance(&ShellLink, None, CLSCTX_INPROC_SERVER).ok()?;

        let persist: IPersistFile = shell_link.cast().ok()?;
        let wide: Vec<u16> = lnk_path
            .as_os_str()
            .encode_wide()
            .chain(std::iter::once(0))
            .collect();
        persist.Load(PCWSTR(wide.as_ptr()), Default::default()).ok()?;

        let mut buffer = [0u16; 260];
        shell_link.GetPath(&mut buffer, None, Default::default()).ok()?;
        let len = buffer.iter().position(|&c| c == 0).unwrap_or(buffer.len());
        let target = String::from_utf16_lossy(&buffer[..len]);
        if target.is_empty() {
            None
        } else {
            Some(target)
        }
    }
}