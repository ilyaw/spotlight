---
name: spotlight-architecture
description: Guides Tauri v2 system integration (Rust 2021) and React 19 + Tailwind v4 UI patterns for the Spotlight app. Use when working on window lifecycle, focus hiding, tauri-plugin-opener, @theme styling in src/index.css, Framer Motion animations, or Spotlight performance.
---

# Роль и Архитектурные Требования проекта Spotlight

Ты — Senior Fullstack Engineer. Мы разрабатываем быстрый аналог macOS Spotlight для Windows/macOS на базе Tauri v2.

## 🛠️ Скилл 1: Системная интеграция Tauri v2 (Rust 2021)

- Всегда используй API Tauri v2 (никакого синтаксиса v1).
- Для управления жизненным циклом окон используй AppHandle и структуру tauri::WebviewWindow.
- Обрабатывай системные события фокуса (`on_window_event` -> `Focused(false)`) для автоматического скрытия окна приложения.
- Используй `tauri-plugin-opener` для открытия файлов и URL.
- Пиши безопасный Rust код без паник: никаких явных `.unwrap()`, всегда возвращай `Result` и используй оператор `?`.

## 🎨 Скилл 2: Анимации и Стили (React 19 + Tailwind v4)

- Конфигурируй темы, шрифты и кастомные стили ТОЛЬКО внутри `src/index.css` через директиву `@theme` (в Tailwind v4 нет файла tailwind.config.js).
- Для интеграции стилей используй современный плагин `@tailwindcss/vite` в Vite 7.
- Для анимаций появления поисковой строки и выпадающих списков результатов используй Framer Motion и `<AnimatePresence>`.
- Гарантируй высокую производительность интерфейса (60+ FPS) без лишних ререндеров во время ввода текста.

---

## Workflow: Tauri v2

**Перед изменением backend проверь:**

- [ ] Используется `tauri::Builder` v2 и `#[tauri::command]`
- [ ] Плагин opener: `.plugin(tauri_plugin_opener::init())`
- [ ] Скрытие окна — через `AppHandle` / `WebviewWindow`, не v1 `WindowBuilder`
- [ ] Focus loss → `hide()` в `on_window_event`
- [ ] Нет `.unwrap()` — только `Result` + `?` или явная обработка ошибок

**Паттерн скрытия при потере фокуса:**

```rust
.setup(|app| {
    let handle = app.handle().clone();
    if let Some(window) = app.get_webview_window("main") {
        window.on_window_event(move |event| {
            if let tauri::WindowEvent::Focused(false) = event {
                let _ = handle.hide();
            }
        });
    }
    Ok(())
})
```

**Открытие файлов/URL:** только через `tauri-plugin-opener`, не через shell v1.

**Ключевые файлы проекта:** `src-tauri/src/lib.rs`, `src-tauri/tauri.conf.json` (`decorations: false`, `transparent: true`).

---

## Workflow: Frontend (React 19 + Tailwind v4)

**Стили:**

- [ ] `@import "tailwindcss"` в `src/index.css`
- [ ] Кастомные токены — только через `@theme { ... }` в `src/index.css`
- [ ] Не создавать `tailwind.config.js`
- [ ] Vite: плагин `@tailwindcss/vite` в `vite.config.ts`, порт **1420**

**Анимации:**

- [ ] Панель поиска — `motion.div` с spring-переходом
- [ ] Список результатов — `<AnimatePresence>` для mount/unmount
- [ ] Анимируй `transform` / `opacity`, не `height`/`width` layout-свойства

**Производительность при вводе:**

- [ ] Debounce/throttle поиска — в хуке или на Rust-стороне
- [ ] Мемоизация списка (`React.memo`, стабильные колбэки)
- [ ] Не поднимать state выше, чем нужно для `SearchInput`
- [ ] Тяжёлая фильтрация/индексация — в Rust, не во frontend

**Ключевые файлы:** `src/index.css`, `src/components/SpotlightPanel.tsx`, `src/hooks/useSpotlightSearch.ts`.

---

## Анти-паттерны

| ❌ Не делать | ✅ Делать |
|-------------|----------|
| `tauri::WindowBuilder`, `tauri::api::shell` (v1) | `AppHandle`, `WebviewWindow`, `tauri-plugin-opener` |
| `tailwind.config.js` | `@theme` в `src/index.css` |
| `.unwrap()` в Rust | `Result` + `?` |
| Анимация layout при каждом keystroke | CSS transform + debounced search |
| Фильтрация тысяч файлов в React | `#[tauri::command]` на Rust |

---

## Связь с project rule

Always-applied rule `.cursor/rules/Tauri-v2-Tailwind-v4-Specialist.mdc` дополняет этот skill: frameless окно, blur, `lucide-react`, React 19 typing. При конфликте — приоритет у project rule и этого skill.
