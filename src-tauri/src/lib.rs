mod apps;
mod commands;

use tauri::Manager;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

/// Matches the frontend's `DEFAULT_HOTKEY` in `src/types/hotkey.ts`.
const DEFAULT_SHORTCUT: &str = "Alt+Space";

/// Frameless + rounded UI needs platform-specific transparency setup.
/// `transparent: true` alone is not enough: macOS still paints an opaque
/// `NSWindow` layer in the corners, and Windows draws a rectangular native
/// shadow that shows up as grey artifacts around rounded CSS corners.
fn configure_transparent_window(window: &tauri::WebviewWindow) {
    #[cfg(target_os = "macos")]
    {
        use objc2_app_kit::{NSColor, NSWindow};

        let Ok(ns_window_ptr) = window.ns_window() else {
            return;
        };

        // SAFETY: `ns_window_ptr` is a valid, live `NSWindow*` handed to us by Tauri
        // for the lifetime of the window.
        let ns_window = unsafe { &*(ns_window_ptr as *mut NSWindow) };
        ns_window.setOpaque(false);
        ns_window.setBackgroundColor(Some(&NSColor::clearColor()));
    }

    #[cfg(target_os = "windows")]
    if let Err(err) = window.set_shadow(false) {
        eprintln!("Failed to disable window shadow on Windows: {err}");
    }
}

fn toggle_window_visibility(window: &tauri::WebviewWindow) -> tauri::Result<()> {
    if window.is_visible()? {
        window.hide()
    } else {
        window.show()?;
        window.set_focus()
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, _shortcut, event| {
                    if event.state() != ShortcutState::Pressed {
                        return;
                    }

                    if let Some(window) = app.get_webview_window("main") {
                        if let Err(err) = toggle_window_visibility(&window) {
                            eprintln!("Failed to toggle window visibility: {err}");
                        }
                    }
                })
                .build(),
        )
        .setup(|app| {
            if let Err(err) = app.global_shortcut().register(DEFAULT_SHORTCUT) {
                eprintln!("Failed to register default global shortcut: {err}");
            }

            if let Some(window) = app.get_webview_window("main") {
                configure_transparent_window(&window);

                if let Err(err) = window.show() {
                    eprintln!("Failed to show main window: {err}");
                }
                if let Err(err) = window.set_focus() {
                    eprintln!("Failed to focus main window: {err}");
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::launch_app,
            commands::update_global_shortcut,
            commands::scan_installed_apps,
            commands::get_app_metadata,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
