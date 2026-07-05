use std::fs;
use std::path::{Path, PathBuf};

use base64::{engine::general_purpose::STANDARD, Engine as _};
use sha2::{Digest, Sha256};

#[cfg(target_os = "macos")]
mod macos;
#[cfg(target_os = "windows")]
mod windows;

const ICON_SIZE: u32 = 32;

pub fn icon_data_url(path: &str, cache_dir: &Path) -> Result<String, String> {
    let cache_key = cache_key(path);
    let cache_file = cache_dir.join(format!("{cache_key}.png"));

    if cache_file.exists() {
        let bytes = fs::read(&cache_file)
            .map_err(|err| format!("Failed to read icon cache: {err}"))?;
        return Ok(to_data_url(&bytes));
    }

    let png_bytes = extract_png(path)?;
    if let Err(err) = fs::create_dir_all(cache_dir) {
        eprintln!("Failed to create icon cache dir: {err}");
    } else if let Err(err) = fs::write(&cache_file, &png_bytes) {
        eprintln!("Failed to write icon cache: {err}");
    }

    Ok(to_data_url(&png_bytes))
}

fn extract_png(path: &str) -> Result<Vec<u8>, String> {
    #[cfg(target_os = "macos")]
    return macos::extract_png(path, ICON_SIZE);

    #[cfg(target_os = "windows")]
    return windows::extract_png(path, ICON_SIZE);

    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        let _ = path;
        Err("Icon extraction is not supported on this platform".to_string())
    }
}

fn cache_key(path: &str) -> String {
    let hash = Sha256::digest(path.as_bytes());
    format!("{:x}", hash)
}

fn to_data_url(png_bytes: &[u8]) -> String {
    format!("data:image/png;base64,{}", STANDARD.encode(png_bytes))
}

pub fn cache_dir(base: &Path) -> PathBuf {
    base.join("icons")
}
