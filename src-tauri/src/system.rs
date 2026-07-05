use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

use tauri::{AppHandle, Manager, WebviewWindow};

const FOCUS_HIDE_GRACE: Duration = Duration::from_millis(250);

#[derive(Debug, Clone, serde::Deserialize, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct SystemBehavior {
    pub show_window_on_launch: bool,
    pub run_in_background: bool,
    pub hide_from_taskbar: bool,
    pub hide_on_focus_loss: bool,
}

impl Default for SystemBehavior {
    fn default() -> Self {
        Self {
            show_window_on_launch: false,
            run_in_background: true,
            hide_from_taskbar: true,
            hide_on_focus_loss: true,
        }
    }
}

pub struct RuntimeSettings {
    pub inner: Arc<Mutex<SystemBehavior>>,
    opened_at: Arc<Mutex<Option<Instant>>>,
}

impl RuntimeSettings {
    pub fn new(behavior: SystemBehavior) -> Self {
        Self {
            inner: Arc::new(Mutex::new(behavior)),
            opened_at: Arc::new(Mutex::new(None)),
        }
    }

    pub fn mark_recently_opened(&self) {
        if let Ok(mut guard) = self.opened_at.lock() {
            *guard = Some(Instant::now());
        }
    }

    pub fn opened_at_handle(&self) -> Arc<Mutex<Option<Instant>>> {
        self.opened_at.clone()
    }
}

fn should_suppress_focus_hide(opened_at: &Arc<Mutex<Option<Instant>>>) -> bool {
    let Ok(guard) = opened_at.lock() else {
        return false;
    };

    guard
        .map(|opened| opened.elapsed() < FOCUS_HIDE_GRACE)
        .unwrap_or(false)
}

pub fn apply_system_behavior(app: &AppHandle, behavior: SystemBehavior) -> Result<(), String> {
    if let Some(state) = app.try_state::<RuntimeSettings>() {
        let mut guard = state
            .inner
            .lock()
            .map_err(|_| "Failed to lock runtime settings".to_string())?;
        *guard = behavior.clone();
    }

    if let Some(window) = app.get_webview_window("main") {
        apply_window_visibility_policy(app, &window, behavior.hide_from_taskbar)?;
    }

    Ok(())
}

pub fn apply_window_visibility_policy(
    app: &AppHandle,
    window: &WebviewWindow,
    hide_from_taskbar: bool,
) -> Result<(), String> {
    #[cfg(target_os = "windows")]
    {
        window
            .set_skip_taskbar(hide_from_taskbar)
            .map_err(|err| format!("Failed to set skip taskbar: {err}"))?;
        let _ = app;
    }

    #[cfg(target_os = "macos")]
    {
        let policy = if hide_from_taskbar {
            tauri::ActivationPolicy::Accessory
        } else {
            tauri::ActivationPolicy::Regular
        };

        app.set_activation_policy(policy)
            .map_err(|err| format!("Failed to set activation policy: {err}"))?;
        let _ = window;
    }

    #[cfg(not(any(target_os = "windows", target_os = "macos")))]
    {
        let _ = (app, window, hide_from_taskbar);
    }

    Ok(())
}

pub fn attach_window_handlers(
    window: &WebviewWindow,
    settings: Arc<Mutex<SystemBehavior>>,
    opened_at: Arc<Mutex<Option<Instant>>>,
) {
    let window_for_close = window.clone();
    let window_for_focus = window.clone();
    let opened_at_for_focus = opened_at;

    window.on_window_event(move |event| {
        let behavior = match settings.lock() {
            Ok(guard) => guard.clone(),
            Err(_) => return,
        };

        match event {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                if behavior.run_in_background {
                    api.prevent_close();
                    if let Err(err) = window_for_close.hide() {
                        eprintln!("Failed to hide window on close request: {err}");
                    }
                }
            }
            tauri::WindowEvent::Focused(false) => {
                if behavior.hide_on_focus_loss && !should_suppress_focus_hide(&opened_at_for_focus) {
                    if let Err(err) = window_for_focus.hide() {
                        eprintln!("Failed to hide window on focus loss: {err}");
                    }
                }
            }
            _ => {}
        }
    });
}
