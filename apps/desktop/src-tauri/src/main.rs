// Prevents an additional console window from appearing in release builds on Windows.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::fs;
use std::path::{Path, PathBuf};

// ---------------------------------------------------------------------------
// Security helper
// ---------------------------------------------------------------------------

/// Ensure `target` is a direct child of `base_dir` and contains no traversal
/// sequences. Returns an error string on failure.
fn validate_write_path(base_dir: &str, target: &str) -> Result<PathBuf, String> {
    let base = Path::new(base_dir)
        .canonicalize()
        .map_err(|e| format!("Cannot resolve output folder: {e}"))?;

    let full = Path::new(target);

    // Resolve symlinks; if the file doesn't exist yet, canonicalize the parent
    let canonical = if full.exists() {
        full.canonicalize()
            .map_err(|e| format!("Cannot resolve target path: {e}"))?
    } else {
        let parent = full
            .parent()
            .ok_or_else(|| "Target path has no parent directory.".to_string())?;
        let canonical_parent = parent
            .canonicalize()
            .map_err(|e| format!("Cannot resolve parent directory: {e}"))?;
        canonical_parent.join(
            full.file_name()
                .ok_or_else(|| "Target path has no file name.".to_string())?,
        )
    };

    if !canonical.starts_with(&base) {
        return Err(format!(
            "Security: target path '{}' is outside the selected output folder.",
            target
        ));
    }

    Ok(canonical)
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

/// Read the entire contents of a UTF-8 text file.
#[tauri::command]
fn read_text_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path).map_err(|e| format!("Failed to read file '{path}': {e}"))
}

/// Write UTF-8 content to a file inside `base_dir`.
/// Validates the target path to prevent traversal outside `base_dir`.
#[tauri::command]
fn write_text_file(base_dir: String, path: String, content: String) -> Result<(), String> {
    let target = validate_write_path(&base_dir, &path)?;

    // Ensure the parent directory exists
    if let Some(parent) = target.parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directory '{}': {e}", parent.display()))?;
    }

    fs::write(&target, content.as_bytes())
        .map_err(|e| format!("Failed to write file '{}': {e}", target.display()))
}

/// Check whether a file or directory exists at the given path.
#[tauri::command]
fn path_exists(path: String) -> bool {
    Path::new(&path).exists()
}

/// Create a directory and all necessary parent directories.
#[tauri::command]
fn create_dir_all(path: String) -> Result<(), String> {
    fs::create_dir_all(&path)
        .map_err(|e| format!("Failed to create directory '{path}': {e}"))
}

/// List the file names (not full paths) inside a directory.
#[tauri::command]
fn list_dir(path: String) -> Result<Vec<String>, String> {
    let entries =
        fs::read_dir(&path).map_err(|e| format!("Failed to read directory '{path}': {e}"))?;

    let names: Vec<String> = entries
        .filter_map(|e| e.ok())
        .filter_map(|e| e.file_name().into_string().ok())
        .collect();

    Ok(names)
}

/// Return the file name component of a path, or an error if there is none.
#[tauri::command]
fn get_file_name(path: String) -> Result<String, String> {
    Path::new(&path)
        .file_name()
        .and_then(|n| n.to_str())
        .map(|s| s.to_string())
        .ok_or_else(|| format!("No file name component in path: {path}"))
}

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            read_text_file,
            write_text_file,
            path_exists,
            create_dir_all,
            list_dir,
            get_file_name,
        ])
        .run(tauri::generate_context!())
        .expect("Error while running SplitForge Local");
}
