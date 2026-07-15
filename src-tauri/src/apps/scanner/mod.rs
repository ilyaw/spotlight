#[cfg(target_os = "macos")]
mod macos;
#[cfg(target_os = "windows")]
mod windows;

use std::path::Path;

use super::types::AppMetadata;

pub fn metadata_for_path(path: &str, cache_dir: &Path) -> Result<AppMetadata, String> {
    #[cfg(target_os = "macos")]
    return macos::metadata_for_path(path, cache_dir);

    #[cfg(target_os = "windows")]
    return windows::metadata_for_path(path, cache_dir);

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        let _ = (path, cache_dir);
        Err("App metadata is not supported on this platform".to_string())
    }
}
