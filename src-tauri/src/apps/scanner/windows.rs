use std::path::Path;

use crate::apps::icon;
use crate::apps::types::AppMetadata;

pub fn metadata_for_path(path: &str, cache_dir: &Path) -> Result<AppMetadata, String> {
    let name = display_name_for_path(path);
    let icon = icon::icon_data_url(path, cache_dir)?;
    Ok(AppMetadata { name, icon })
}

fn display_name_for_path(path: &str) -> String {
    Path::new(path)
        .file_stem()
        .and_then(|s| s.to_str())
        .unwrap_or("Application")
        .to_string()
}
