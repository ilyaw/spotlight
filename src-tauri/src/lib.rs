mod apps;
mod commands;
mod system;

use tauri::Manager;
use tauri_plugin_global_shortcut::{GlobalShortcutExt, ShortcutState};

use crate::system::{attach_window_handlers, apply_system_behavior, RuntimeSettings, SystemBehavior};

/// Matches the frontend's `DEFAULT_HOTKEY` in `src/types/hotkey.ts`.
const DEFAULT_SHORTCUT: &str = "Alt+Space";
const TOGGLE_DEBOUNCE: std::time::Duration = std::time::Duration::from_millis(300);

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

fn show_spotlight_panel(
    app: &tauri::AppHandle,
    window: &tauri::WebviewWindow,
) -> tauri::Result<()> {
    if let Some(settings) = app.try_state::<RuntimeSettings>() {
        settings.mark_recently_opened();
    }

    #[cfg(target_os = "macos")]
    {
        use std::sync::mpsc;

        use objc2::MainThreadMarker;
        use objc2_app_kit::{NSApplication, NSWindow};

        // Temporarily become a regular app so macOS lets us take focus
        // from a global hotkey (Accessory + set_focus alone is unreliable).
        let _ = app.set_activation_policy(tauri::ActivationPolicy::Regular);

        let window = window.clone();
        let (tx, rx) = mpsc::channel();

        app.run_on_main_thread(move || {
            let result = (|| -> tauri::Result<()> {
                if let Some(mtm) = MainThreadMarker::new() {
                    #[allow(deprecated)]
                    NSApplication::sharedApplication(mtm).activateIgnoringOtherApps(true);
                }

                window.unminimize()?;
                window.show()?;
                window.set_focus()?;

                if let Ok(ns_window_ptr) = window.ns_window() {
                    // SAFETY: live NSWindow* from Tauri for this window's lifetime.
                    let ns_window = unsafe { &*(ns_window_ptr as *mut NSWindow) };
                    ns_window.makeKeyAndOrderFront(None);
                    ns_window.orderFrontRegardless();
                }

                Ok(())
            })();
            let _ = tx.send(result);
        })?;

        return rx
            .recv()
            .map_err(|_| tauri::Error::FailedToReceiveMessage)?;
    }

    #[cfg(not(target_os = "macos"))]
    {
        let _ = app;
        window.unminimize()?;
        window.show()?;
        window.set_focus()?;
        Ok(())
    }
}

fn hide_spotlight_panel(
    app: &tauri::AppHandle,
    window: &tauri::WebviewWindow,
) -> tauri::Result<()> {
    window.hide()?;

    #[cfg(target_os = "macos")]
    {
        let hide_from_taskbar = app
            .try_state::<RuntimeSettings>()
            .and_then(|settings| {
                settings
                    .inner
                    .lock()
                    .ok()
                    .map(|behavior| behavior.hide_from_taskbar)
            })
            .unwrap_or(true);

        if hide_from_taskbar {
            let _ = app.set_activation_policy(tauri::ActivationPolicy::Accessory);
        }
    }

    #[cfg(not(target_os = "macos"))]
    {
        let _ = app;
    }

    Ok(())
}

fn toggle_window_visibility(
    app: &tauri::AppHandle,
    window: &tauri::WebviewWindow,
) -> tauri::Result<()> {
    if window.is_visible()? {
        hide_spotlight_panel(app, window)
    } else {
        show_spotlight_panel(app, window)
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let default_behavior = SystemBehavior::default();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec![]),
        ))
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, shortcut, event| {
                    if event.state() != ShortcutState::Pressed {
                        return;
                    }

                    if let Some(settings) = app.try_state::<RuntimeSettings>() {
                        if !settings.try_begin_toggle(TOGGLE_DEBOUNCE) {
                            return;
                        }
                    }

                    eprintln!("Global shortcut pressed: {shortcut:?}");

                    if let Some(window) = app.get_webview_window("main") {
                        if let Err(err) = toggle_window_visibility(app, &window) {
                            eprintln!("Failed to toggle window visibility: {err}");
                        }
                    } else {
                        eprintln!("Global shortcut: main window not found");
                    }
                })
                .build(),
        )
        .manage(RuntimeSettings::new(default_behavior.clone()))
        .setup(move |app| {
            if let Err(err) = app.global_shortcut().register(DEFAULT_SHORTCUT) {
                eprintln!("Failed to register default global shortcut: {err}");
            }

            if let Some(window) = app.get_webview_window("main") {
                configure_transparent_window(&window);

                if let Err(err) =
                    apply_system_behavior(app.handle(), default_behavior.clone())
                {
                    eprintln!("Failed to apply default system behavior: {err}");
                }

                let settings = app.state::<RuntimeSettings>();
                attach_window_handlers(
                    &window,
                    settings.inner.clone(),
                    settings.opened_at_handle(),
                    settings.suppress_focus_hide_handle(),
                );

                if default_behavior.show_window_on_launch {
                    if let Err(err) = window.show() {
                        eprintln!("Failed to show main window: {err}");
                    }
                    if let Err(err) = window.set_focus() {
                        eprintln!("Failed to focus main window: {err}");
                    }
                    settings.mark_recently_opened();
                }
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::launch_app,
            commands::update_global_shortcut,
            commands::get_app_metadata,
            commands::apply_system_behavior,
            commands::set_suppress_focus_hide,
            commands::quit_app,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
