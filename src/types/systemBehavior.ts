export type SystemBehaviorSettings = {
  /** Запускать Spotlight при входе в систему. */
  launchAtStartup: boolean;
  /** Показывать окно сразу после запуска приложения. */
  showWindowOnLaunch: boolean;
  /** При закрытии сворачивать в фон, а не завершать процесс. */
  runInBackground: boolean;
  /** Не показывать иконку в Dock / панели задач. */
  hideFromTaskbar: boolean;
  /** Скрывать окно при клике вне панели. */
  hideOnFocusLoss: boolean;
};

export const DEFAULT_SYSTEM_BEHAVIOR: SystemBehaviorSettings = {
  launchAtStartup: false,
  showWindowOnLaunch: false,
  runInBackground: true,
  hideFromTaskbar: true,
  hideOnFocusLoss: true,
};

export const SYSTEM_BEHAVIOR_STORAGE_KEY = "spotlight-system-behavior";
