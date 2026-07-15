use std::path::{Path, PathBuf};

use plist::Value;

use crate::apps::icon;
use crate::apps::types::AppMetadata;

pub fn metadata_for_path(path: &str, cache_dir: &Path) -> Result<AppMetadata, String> {
    let name = display_name_for_path(path)?;
    let icon = icon::icon_data_url(path, cache_dir)?;
    Ok(AppMetadata { name, icon })
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
