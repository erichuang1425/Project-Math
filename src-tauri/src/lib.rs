use std::path::PathBuf;

use tauri::menu::{MenuBuilder, MenuItemBuilder, PredefinedMenuItem, SubmenuBuilder};
use tauri::{Emitter, Manager};

const MENU_EVENT_CHANNEL: &str = "menu";

#[tauri::command]
fn load_learner_state(
    app: tauri::AppHandle,
    studybook_id: String,
) -> Result<Option<String>, String> {
    let path = learner_state_path(&app, &studybook_id)?;

    if !path.exists() {
        return Ok(None);
    }

    std::fs::read_to_string(path)
        .map(Some)
        .map_err(|error| format!("Could not read learner state: {error}"))
}

#[tauri::command]
fn save_learner_state(
    app: tauri::AppHandle,
    studybook_id: String,
    json: String,
) -> Result<(), String> {
    let path = learner_state_path(&app, &studybook_id)?;

    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)
            .map_err(|error| format!("Could not create learner state directory: {error}"))?;
    }

    std::fs::write(path, json).map_err(|error| format!("Could not write learner state: {error}"))
}

#[tauri::command]
fn app_version(app: tauri::AppHandle) -> String {
    app.package_info().version.to_string()
}

#[tauri::command]
fn export_markdown_file(
    app: tauri::AppHandle,
    filename: String,
    content: String,
) -> Result<String, String> {
    if filename.contains('/') || filename.contains('\\') || filename.contains("..") {
        return Err("Filename must not contain path separators.".to_string());
    }

    let mut path = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Could not resolve app data directory: {error}"))?;
    path.push("exports");

    std::fs::create_dir_all(&path)
        .map_err(|error| format!("Could not create export directory: {error}"))?;

    path.push(&filename);

    std::fs::write(&path, content)
        .map_err(|error| format!("Could not write export file: {error}"))?;

    Ok(path.to_string_lossy().to_string())
}

fn learner_state_path(app: &tauri::AppHandle, studybook_id: &str) -> Result<PathBuf, String> {
    if !is_safe_studybook_id(studybook_id) {
        return Err("Studybook id must be lowercase kebab-case.".to_string());
    }

    let mut path = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Could not resolve app data directory: {error}"))?;
    path.push("learner-state");
    path.push(format!("{studybook_id}.json"));
    Ok(path)
}

fn is_safe_studybook_id(input: &str) -> bool {
    !input.is_empty()
        && input.chars().all(|character| {
            character.is_ascii_lowercase() || character.is_ascii_digit() || character == '-'
        })
        && !input.starts_with('-')
        && !input.ends_with('-')
        && !input.contains("--")
}

fn build_app_menu(app: &tauri::AppHandle) -> tauri::Result<()> {
    let export_summary =
        MenuItemBuilder::with_id("menu:export-summary", "Export Lesson Summary")
            .accelerator("CmdOrCtrl+E")
            .build(app)?;
    let go_to_dashboard =
        MenuItemBuilder::with_id("menu:go-to-dashboard", "Return to Dashboard")
            .accelerator("CmdOrCtrl+Shift+D")
            .build(app)?;
    let quit = PredefinedMenuItem::quit(app, Some("Quit Project Math"))?;
    let file_menu = SubmenuBuilder::new(app, "File")
        .item(&export_summary)
        .item(&go_to_dashboard)
        .separator()
        .item(&quit)
        .build()?;

    let edit_menu = SubmenuBuilder::new(app, "Edit")
        .undo()
        .redo()
        .separator()
        .cut()
        .copy()
        .paste()
        .select_all()
        .build()?;

    let toggle_mode = MenuItemBuilder::with_id("menu:toggle-mode", "Toggle Display Mode")
        .accelerator("CmdOrCtrl+M")
        .build(app)?;

    let text_standard =
        MenuItemBuilder::with_id("menu:text-size:standard", "Standard").build(app)?;
    let text_large = MenuItemBuilder::with_id("menu:text-size:large", "Large").build(app)?;
    let text_extra_large =
        MenuItemBuilder::with_id("menu:text-size:extra-large", "Extra Large").build(app)?;
    let text_size_menu = SubmenuBuilder::new(app, "Reader Text Size")
        .item(&text_standard)
        .item(&text_large)
        .item(&text_extra_large)
        .build()?;

    let line_standard =
        MenuItemBuilder::with_id("menu:line-spacing:standard", "Standard").build(app)?;
    let line_comfortable =
        MenuItemBuilder::with_id("menu:line-spacing:comfortable", "Comfortable").build(app)?;
    let line_wide = MenuItemBuilder::with_id("menu:line-spacing:wide", "Wide").build(app)?;
    let line_spacing_menu = SubmenuBuilder::new(app, "Reader Line Spacing")
        .item(&line_standard)
        .item(&line_comfortable)
        .item(&line_wide)
        .build()?;

    let font_sans = MenuItemBuilder::with_id("menu:font:sans", "System Sans").build(app)?;
    let font_serif = MenuItemBuilder::with_id("menu:font:serif", "System Serif").build(app)?;
    let font_menu = SubmenuBuilder::new(app, "Reader Font")
        .item(&font_sans)
        .item(&font_serif)
        .build()?;

    let toggle_low_glare =
        MenuItemBuilder::with_id("menu:toggle-low-glare", "Toggle Low-Glare Mode")
            .accelerator("CmdOrCtrl+G")
            .build(app)?;

    let view_menu = SubmenuBuilder::new(app, "View")
        .item(&toggle_mode)
        .separator()
        .item(&text_size_menu)
        .item(&line_spacing_menu)
        .item(&font_menu)
        .separator()
        .item(&toggle_low_glare)
        .separator()
        .fullscreen()
        .build()?;

    let shortcuts = MenuItemBuilder::with_id("menu:shortcuts", "Keyboard Shortcuts")
        .accelerator("CmdOrCtrl+/")
        .build(app)?;
    let help_menu = SubmenuBuilder::new(app, "Help").item(&shortcuts).build()?;

    let menu = MenuBuilder::new(app)
        .item(&file_menu)
        .item(&edit_menu)
        .item(&view_menu)
        .item(&help_menu)
        .build()?;

    app.set_menu(menu)?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            build_app_menu(app.handle())?;
            Ok(())
        })
        .on_menu_event(|app, event| {
            let id = event.id().as_ref().to_string();
            if id.starts_with("menu:") {
                let _ = app.emit(MENU_EVENT_CHANNEL, id);
            }
        })
        .invoke_handler(tauri::generate_handler![
            load_learner_state,
            save_learner_state,
            export_markdown_file,
            app_version,
        ])
        .run(tauri::generate_context!())
        .expect("error while running Project Math");
}
