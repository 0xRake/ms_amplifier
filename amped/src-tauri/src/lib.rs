mod commands;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::run_amplifier,
            commands::run_amplifier_stream,
            commands::get_sessions,
            commands::get_session_details,
            commands::resume_session,
            commands::get_profiles,
            commands::switch_profile,
            commands::get_providers,
            commands::switch_provider,
            commands::get_config,
            commands::update_config,
            commands::backup_config,
            commands::restore_config,
            commands::get_mcps,
            commands::add_mcp,
            commands::remove_mcp,
            commands::get_skills,
            commands::get_modules,
            commands::get_collections,
            commands::install_amplifier,
            commands::uninstall_amplifier,
            commands::check_amplifier_installed,
            commands::get_system_info,
            commands::update_system_prompt,
            commands::get_system_prompt,
            commands::read_file,
            commands::write_file,
            commands::list_directory,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
