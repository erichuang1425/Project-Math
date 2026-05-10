use std::path::PathBuf;

use tauri::Manager;

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
        .invoke_handler(tauri::generate_handler![
            load_learner_state,
            save_learner_state
        ])
        .run(tauri::generate_context!())
        .expect("error while running Project Math");
}
