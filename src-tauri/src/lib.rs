use std::path::PathBuf;

use tauri::{
    menu::{MenuBuilder, MenuItemBuilder, SubmenuBuilder},
    Manager, Runtime,
};

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

fn build_app_menu<R: Runtime>(
    handle: &tauri::AppHandle<R>,
) -> tauri::Result<tauri::menu::Menu<R>> {
    let export_summary = MenuItemBuilder::with_id("export-summary", "Export Lesson Summary")
        .accelerator("CmdOrCtrl+E")
        .build(handle)?;

    let go_to_dashboard = MenuItemBuilder::with_id("go-to-dashboard", "Return to Dashboard")
        .accelerator("CmdOrCtrl+Shift+D")
        .build(handle)?;

    let file_menu = SubmenuBuilder::new(handle, "File")
        .item(&export_summary)
        .separator()
        .close_window()
        .build()?;

    let edit_menu = SubmenuBuilder::new(handle, "Edit")
        .undo()
        .redo()
        .separator()
        .cut()
        .copy()
        .paste()
        .select_all()
        .build()?;

    let view_menu = SubmenuBuilder::new(handle, "View")
        .item(&go_to_dashboard)
        .separator()
        .fullscreen()
        .build()?;

    MenuBuilder::new(handle)
        .items(&[&file_menu, &edit_menu, &view_menu])
        .build()
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let menu = build_app_menu(&app.handle().clone())?;
            app.set_menu(menu)?;
            Ok(())
        })
        .on_menu_event(|app, event| match event.id().as_ref() {
            "go-to-dashboard" => {
                let _ = app.emit("menu:go-to-dashboard", ());
            }
            "export-summary" => {
                let _ = app.emit("menu:export-summary", ());
            }
            _ => {}
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
