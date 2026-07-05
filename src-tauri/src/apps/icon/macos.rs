use image::imageops::FilterType;
use objc2_app_kit::NSWorkspace;
use objc2_foundation::NSString;

pub fn extract_png(path: &str, size: u32) -> Result<Vec<u8>, String> {
    let ns_path = NSString::from_str(path);
    let workspace = NSWorkspace::sharedWorkspace();
    let icon = workspace.iconForFile(&ns_path);

    icon.setSize(objc2_foundation::NSSize::new(size as f64, size as f64));

    let tiff_data = icon
        .TIFFRepresentation()
        .ok_or_else(|| format!("No TIFF representation for icon: {path}"))?;

    let bytes = tiff_data.to_vec();

    let img = image::load_from_memory(&bytes)
        .map_err(|err| format!("Failed to decode icon TIFF: {err}"))?;

    let resized = if img.width() != size || img.height() != size {
        img.resize(size, size, FilterType::Lanczos3)
    } else {
        img
    };

    let mut png_bytes = Vec::new();
    let mut cursor = std::io::Cursor::new(&mut png_bytes);
    resized
        .write_to(&mut cursor, image::ImageFormat::Png)
        .map_err(|err| format!("Failed to encode icon PNG: {err}"))?;

    Ok(png_bytes)
}
