use std::ffi::OsStr;
use std::os::windows::ffi::OsStrExt;

use image::imageops::FilterType;
use image::RgbaImage;
use windows::core::PCWSTR;
use windows::Win32::Graphics::Gdi::{
    CreateCompatibleDC, DeleteDC, DeleteObject, GetDIBits, GetObjectW, BITMAP,
    BITMAPINFO, BITMAPINFOHEADER, BI_RGB, DIB_RGB_COLORS,
};
use windows::Win32::UI::Shell::{SHGetFileInfoW, SHGFI_ICON, SHGFI_LARGEICON, SHFILEINFOW};
use windows::Win32::UI::WindowsAndMessaging::{DestroyIcon, GetIconInfo, ICONINFO};

pub fn extract_png(path: &str, size: u32) -> Result<Vec<u8>, String> {
    let wide: Vec<u16> = OsStr::new(path)
        .encode_wide()
        .chain(std::iter::once(0))
        .collect();

    let mut file_info = SHFILEINFOW::default();
    unsafe {
        SHGetFileInfoW(
            PCWSTR(wide.as_ptr()),
            Default::default(),
            Some(&mut file_info),
            std::mem::size_of::<SHFILEINFOW>() as u32,
            SHGFI_ICON | SHGFI_LARGEICON,
        );
    }

    if file_info.hIcon.is_invalid() {
        return Err(format!("Failed to get icon for: {path}"));
    }

    let result = icon_handle_to_png(file_info.hIcon, size);
    unsafe {
        let _ = DestroyIcon(file_info.hIcon);
    }
    result
}

fn icon_handle_to_png(icon: windows::Win32::UI::WindowsAndMessaging::HICON, size: u32) -> Result<Vec<u8>, String> {
    unsafe {
        let mut icon_info = ICONINFO::default();
        GetIconInfo(icon, &mut icon_info)
            .map_err(|err| format!("GetIconInfo failed: {err}"))?;

        let mut bitmap = BITMAP::default();
        GetObjectW(
            icon_info.hbmColor,
            std::mem::size_of::<BITMAP>() as i32,
            Some(&mut bitmap as *mut _ as *mut _),
        );

        let width = bitmap.bmWidth.unsigned_abs();
        let height = bitmap.bmHeight.unsigned_abs();

        let hdc = CreateCompatibleDC(None);
        if hdc.is_invalid() {
            cleanup_icon_info(&icon_info);
            return Err("CreateCompatibleDC failed".to_string());
        }

        let mut bmi = BITMAPINFO {
            bmiHeader: BITMAPINFOHEADER {
                biSize: std::mem::size_of::<BITMAPINFOHEADER>() as u32,
                biWidth: width as i32,
                biHeight: -(height as i32),
                biPlanes: 1,
                biBitCount: 32,
                biCompression: BI_RGB.0,
                ..Default::default()
            },
            ..Default::default()
        };

        let mut pixels = vec![0u8; (width * height * 4) as usize];
        GetDIBits(
            hdc,
            icon_info.hbmColor,
            0,
            height,
            Some(pixels.as_mut_ptr() as *mut _),
            &mut bmi,
            DIB_RGB_COLORS,
        );

        let _ = DeleteDC(hdc);
        cleanup_icon_info(&icon_info);

        // BGRA -> RGBA
        for chunk in pixels.chunks_exact_mut(4) {
            chunk.swap(0, 2);
        }

        let img = RgbaImage::from_raw(width, height, pixels)
            .ok_or_else(|| "Failed to build RGBA image from icon".to_string())?;

        let dynamic = image::DynamicImage::ImageRgba8(img);
        let resized = if width != size || height != size {
            dynamic.resize(size, size, FilterType::Lanczos3)
        } else {
            dynamic
        };

        let mut png_bytes = Vec::new();
        let mut cursor = std::io::Cursor::new(&mut png_bytes);
        resized
            .write_to(&mut cursor, image::ImageFormat::Png)
            .map_err(|err| format!("Failed to encode icon PNG: {err}"))?;

        Ok(png_bytes)
    }
}

unsafe fn cleanup_icon_info(icon_info: &ICONINFO) {
    if !icon_info.hbmColor.is_invalid() {
        let _ = DeleteObject(icon_info.hbmColor);
    }
    if !icon_info.hbmMask.is_invalid() {
        let _ = DeleteObject(icon_info.hbmMask);
    }
}
