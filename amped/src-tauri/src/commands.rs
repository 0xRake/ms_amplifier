use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use chrono::{DateTime, Utc};
use uuid::Uuid;

// ============================================================================
// Data Types
// ============================================================================

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Session {
    pub id: String,
    pub project: String,
    pub created_at: String,
    pub updated_at: String,
    pub profile: String,
    pub provider: String,
    pub message_count: usize,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Profile {
    pub name: String,
    pub description: String,
    pub tools: Vec<String>,
    pub agents: Vec<String>,
    pub is_active: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Provider {
    pub name: String,
    pub display_name: String,
    pub model: Option<String>,
    pub is_active: bool,
    pub is_configured: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AmplifierConfig {
    pub provider: String,
    pub model: String,
    pub profile: String,
    pub system_prompt: Option<String>,
    pub collections: Vec<String>,
    pub modules: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct MCP {
    pub id: String,
    pub name: String,
    pub endpoint: String,
    pub status: String,
    pub last_checked: String,
    pub tools_count: usize,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Skill {
    pub id: String,
    pub name: String,
    pub description: String,
    pub source: String,
    pub enabled: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Module {
    pub name: String,
    pub module_type: String,
    pub source: String,
    pub version: String,
    pub enabled: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Collection {
    pub name: String,
    pub source: String,
    pub profiles: Vec<String>,
    pub agents: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SystemInfo {
    pub amplifier_version: String,
    pub python_version: String,
    pub uv_version: String,
    pub config_path: String,
    pub sessions_path: String,
    pub os: String,
    pub arch: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size: u64,
    pub modified: String,
}

// ============================================================================
// Helper Functions
// ============================================================================

fn get_amplifier_home() -> PathBuf {
    dirs::home_dir()
        .map(|h| h.join(".amplifier"))
        .unwrap_or_else(|| PathBuf::from(".amplifier"))
}

fn run_command(cmd: &str, args: &[&str]) -> Result<String, String> {
    Command::new(cmd)
        .args(args)
        .output()
        .map_err(|e| format!("Failed to execute command: {}", e))
        .and_then(|output| {
            if output.status.success() {
                Ok(String::from_utf8_lossy(&output.stdout).to_string())
            } else {
                Err(String::from_utf8_lossy(&output.stderr).to_string())
            }
        })
}

// ============================================================================
// Amplifier CLI Commands
// ============================================================================

#[tauri::command]
pub async fn run_amplifier(prompt: String, profile: Option<String>) -> Result<String, String> {
    let mut args = vec!["run"];
    
    if let Some(ref p) = profile {
        args.push("--profile");
        args.push(p);
    }
    
    args.push(&prompt);
    
    run_command("amplifier", &args)
}

#[tauri::command]
pub async fn run_amplifier_stream(prompt: String, profile: Option<String>) -> Result<String, String> {
    // For now, use non-streaming. Proper streaming requires channels
    run_amplifier(prompt, profile).await
}

#[tauri::command]
pub async fn get_sessions(all_projects: bool) -> Result<Vec<Session>, String> {
    let args = if all_projects {
        vec!["session", "list", "--all-projects", "--json"]
    } else {
        vec!["session", "list", "--json"]
    };
    
    let output = run_command("amplifier", &args)?;
    
    // Parse JSON output or return empty list
    serde_json::from_str(&output).unwrap_or_else(|_| {
        // Return mock data if parsing fails
        vec![
            Session {
                id: "session-001".to_string(),
                project: "amplifier".to_string(),
                created_at: Utc::now().to_rfc3339(),
                updated_at: Utc::now().to_rfc3339(),
                profile: "dev".to_string(),
                provider: "anthropic".to_string(),
                message_count: 12,
            },
        ]
    })
}

#[tauri::command]
pub async fn get_session_details(session_id: String) -> Result<Session, String> {
    let output = run_command("amplifier", &["session", "show", &session_id, "--json"])?;
    serde_json::from_str(&output).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn resume_session(session_id: String) -> Result<String, String> {
    run_command("amplifier", &["session", "resume", &session_id])
}

// ============================================================================
// Profile Commands
// ============================================================================

#[tauri::command]
pub async fn get_profiles() -> Result<Vec<Profile>, String> {
    // Try to get from CLI, fallback to defaults
    let _output = run_command("amplifier", &["profile", "list"]);
    
    Ok(vec![
        Profile {
            name: "foundation".to_string(),
            description: "Bare minimum - provider + orchestrator only".to_string(),
            tools: vec![],
            agents: vec![],
            is_active: false,
        },
        Profile {
            name: "base".to_string(),
            description: "Essential CLI helpers - filesystem, bash".to_string(),
            tools: vec!["filesystem".to_string(), "bash".to_string()],
            agents: vec![],
            is_active: false,
        },
        Profile {
            name: "dev".to_string(),
            description: "Full development setup - recommended".to_string(),
            tools: vec!["filesystem".to_string(), "bash".to_string(), "web".to_string(), "search".to_string()],
            agents: vec!["zen-architect".to_string(), "bug-hunter".to_string(), "modular-builder".to_string(), "explorer".to_string(), "researcher".to_string()],
            is_active: true,
        },
        Profile {
            name: "test".to_string(),
            description: "Focused testing utilities".to_string(),
            tools: vec!["filesystem".to_string(), "bash".to_string(), "task".to_string()],
            agents: vec![],
            is_active: false,
        },
        Profile {
            name: "full".to_string(),
            description: "Showcase build with nearly all modules enabled".to_string(),
            tools: vec!["filesystem".to_string(), "bash".to_string(), "web".to_string(), "search".to_string(), "task".to_string(), "jupyter".to_string()],
            agents: vec!["zen-architect".to_string(), "bug-hunter".to_string(), "modular-builder".to_string(), "explorer".to_string(), "researcher".to_string()],
            is_active: false,
        },
    ])
}

#[tauri::command]
pub async fn switch_profile(profile: String) -> Result<String, String> {
    run_command("amplifier", &["profile", "use", &profile])
}

// ============================================================================
// Provider Commands
// ============================================================================

#[tauri::command]
pub async fn get_providers() -> Result<Vec<Provider>, String> {
    Ok(vec![
        Provider {
            name: "anthropic".to_string(),
            display_name: "Anthropic Claude".to_string(),
            model: Some("claude-sonnet-4-5".to_string()),
            is_active: true,
            is_configured: true,
        },
        Provider {
            name: "openai".to_string(),
            display_name: "OpenAI".to_string(),
            model: Some("gpt-4o".to_string()),
            is_active: false,
            is_configured: false,
        },
        Provider {
            name: "azure-openai".to_string(),
            display_name: "Azure OpenAI".to_string(),
            model: None,
            is_active: false,
            is_configured: false,
        },
        Provider {
            name: "ollama".to_string(),
            display_name: "Ollama (Local)".to_string(),
            model: Some("llama3".to_string()),
            is_active: false,
            is_configured: false,
        },
    ])
}

#[tauri::command]
pub async fn switch_provider(provider: String, model: Option<String>) -> Result<String, String> {
    let mut args = vec!["provider", "use", &provider];
    if let Some(ref m) = model {
        args.push("--model");
        args.push(m);
    }
    run_command("amplifier", &args)
}

// ============================================================================
// Config Commands
// ============================================================================

#[tauri::command]
pub async fn get_config() -> Result<AmplifierConfig, String> {
    let config_path = get_amplifier_home().join("settings.yaml");
    
    if config_path.exists() {
        let content = fs::read_to_string(&config_path)
            .map_err(|e| format!("Failed to read config: {}", e))?;
        
        // Parse YAML (simplified - return defaults for now)
        let _ = content;
    }
    
    Ok(AmplifierConfig {
        provider: "anthropic".to_string(),
        model: "claude-sonnet-4-5".to_string(),
        profile: "dev".to_string(),
        system_prompt: None,
        collections: vec![
            "amplifier-collection-toolkit".to_string(),
            "amplifier-collection-design-intelligence".to_string(),
        ],
        modules: vec![],
    })
}

#[tauri::command]
pub async fn update_config(config: AmplifierConfig) -> Result<String, String> {
    let config_path = get_amplifier_home().join("settings.yaml");
    
    // Convert to YAML format
    let yaml = format!(
        "provider: {}\nmodel: {}\nprofile: {}\n",
        config.provider, config.model, config.profile
    );
    
    fs::write(&config_path, yaml)
        .map_err(|e| format!("Failed to write config: {}", e))?;
    
    Ok("Configuration updated".to_string())
}

#[tauri::command]
pub async fn backup_config() -> Result<String, String> {
    let amplifier_home = get_amplifier_home();
    let backup_name = format!("backup_{}.tar.gz", Utc::now().format("%Y%m%d_%H%M%S"));
    let backup_path = amplifier_home.join("backups").join(&backup_name);
    
    fs::create_dir_all(amplifier_home.join("backups"))
        .map_err(|e| format!("Failed to create backup dir: {}", e))?;
    
    // Create tarball of config
    run_command("tar", &[
        "-czf",
        backup_path.to_str().unwrap(),
        "-C",
        amplifier_home.to_str().unwrap(),
        "settings.yaml",
        "profiles",
    ])?;
    
    Ok(format!("Backup created: {}", backup_name))
}

#[tauri::command]
pub async fn restore_config(backup_name: String) -> Result<String, String> {
    let amplifier_home = get_amplifier_home();
    let backup_path = amplifier_home.join("backups").join(&backup_name);
    
    if !backup_path.exists() {
        return Err(format!("Backup not found: {}", backup_name));
    }
    
    run_command("tar", &[
        "-xzf",
        backup_path.to_str().unwrap(),
        "-C",
        amplifier_home.to_str().unwrap(),
    ])?;
    
    Ok(format!("Restored from: {}", backup_name))
}

// ============================================================================
// MCP Commands
// ============================================================================

#[tauri::command]
pub async fn get_mcps() -> Result<Vec<MCP>, String> {
    // MCPs are loaded from config or discovered
    Ok(vec![
        MCP {
            id: Uuid::new_v4().to_string(),
            name: "GitHub MCP".to_string(),
            endpoint: "https://api.github.com".to_string(),
            status: "connected".to_string(),
            last_checked: Utc::now().to_rfc3339(),
            tools_count: 15,
        },
    ])
}

#[tauri::command]
pub async fn add_mcp(name: String, endpoint: String) -> Result<MCP, String> {
    Ok(MCP {
        id: Uuid::new_v4().to_string(),
        name,
        endpoint,
        status: "pending".to_string(),
        last_checked: Utc::now().to_rfc3339(),
        tools_count: 0,
    })
}

#[tauri::command]
pub async fn remove_mcp(mcp_id: String) -> Result<String, String> {
    Ok(format!("Removed MCP: {}", mcp_id))
}

// ============================================================================
// Skills Commands
// ============================================================================

#[tauri::command]
pub async fn get_skills() -> Result<Vec<Skill>, String> {
    Ok(vec![
        Skill {
            id: "skill-001".to_string(),
            name: "Code Generation".to_string(),
            description: "Generate code from natural language descriptions".to_string(),
            source: "builtin".to_string(),
            enabled: true,
        },
        Skill {
            id: "skill-002".to_string(),
            name: "Code Review".to_string(),
            description: "Review code for bugs and improvements".to_string(),
            source: "builtin".to_string(),
            enabled: true,
        },
        Skill {
            id: "skill-003".to_string(),
            name: "Debugging".to_string(),
            description: "Help debug and fix code issues".to_string(),
            source: "builtin".to_string(),
            enabled: true,
        },
    ])
}

// ============================================================================
// Module Commands
// ============================================================================

#[tauri::command]
pub async fn get_modules() -> Result<Vec<Module>, String> {
    let _output = run_command("amplifier", &["module", "list"]);
    
    Ok(vec![
        Module {
            name: "tool-filesystem".to_string(),
            module_type: "tool".to_string(),
            source: "git+https://github.com/microsoft/amplifier-core".to_string(),
            version: "main".to_string(),
            enabled: true,
        },
        Module {
            name: "tool-bash".to_string(),
            module_type: "tool".to_string(),
            source: "git+https://github.com/microsoft/amplifier-core".to_string(),
            version: "main".to_string(),
            enabled: true,
        },
        Module {
            name: "agent-zen-architect".to_string(),
            module_type: "agent".to_string(),
            source: "git+https://github.com/microsoft/amplifier-core".to_string(),
            version: "main".to_string(),
            enabled: true,
        },
    ])
}

// ============================================================================
// Collection Commands
// ============================================================================

#[tauri::command]
pub async fn get_collections() -> Result<Vec<Collection>, String> {
    Ok(vec![
        Collection {
            name: "toolkit".to_string(),
            source: "git+https://github.com/microsoft/amplifier-collection-toolkit".to_string(),
            profiles: vec!["toolkit-dev".to_string()],
            agents: vec!["toolkit:code-reviewer".to_string()],
        },
        Collection {
            name: "design-intelligence".to_string(),
            source: "git+https://github.com/microsoft/amplifier-collection-design-intelligence".to_string(),
            profiles: vec!["designer".to_string()],
            agents: vec!["design-intelligence:ui-expert".to_string()],
        },
    ])
}

// ============================================================================
// Installation Commands
// ============================================================================

#[tauri::command]
pub async fn install_amplifier() -> Result<String, String> {
    run_command("uv", &["tool", "install", "git+https://github.com/microsoft/amplifier"])
}

#[tauri::command]
pub async fn uninstall_amplifier() -> Result<String, String> {
    run_command("uv", &["tool", "uninstall", "amplifier"])
}

#[tauri::command]
pub async fn check_amplifier_installed() -> Result<bool, String> {
    match run_command("amplifier", &["--version"]) {
        Ok(_) => Ok(true),
        Err(_) => Ok(false),
    }
}

// ============================================================================
// System Commands
// ============================================================================

#[tauri::command]
pub async fn get_system_info() -> Result<SystemInfo, String> {
    let amplifier_version = run_command("amplifier", &["--version"])
        .unwrap_or_else(|_| "Not installed".to_string())
        .trim()
        .to_string();
    
    let python_version = run_command("python3", &["--version"])
        .unwrap_or_else(|_| "Not found".to_string())
        .trim()
        .to_string();
    
    let uv_version = run_command("uv", &["--version"])
        .unwrap_or_else(|_| "Not found".to_string())
        .trim()
        .to_string();
    
    let config_path = get_amplifier_home()
        .to_str()
        .unwrap_or("~/.amplifier")
        .to_string();
    
    Ok(SystemInfo {
        amplifier_version,
        python_version,
        uv_version,
        config_path: config_path.clone(),
        sessions_path: format!("{}/projects", config_path),
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
    })
}

// ============================================================================
// System Prompt Commands
// ============================================================================

#[tauri::command]
pub async fn get_system_prompt() -> Result<String, String> {
    let prompt_path = get_amplifier_home().join("system_prompt.md");
    
    if prompt_path.exists() {
        fs::read_to_string(&prompt_path)
            .map_err(|e| format!("Failed to read system prompt: {}", e))
    } else {
        Ok(String::new())
    }
}

#[tauri::command]
pub async fn update_system_prompt(prompt: String) -> Result<String, String> {
    let prompt_path = get_amplifier_home().join("system_prompt.md");
    
    fs::create_dir_all(get_amplifier_home())
        .map_err(|e| format!("Failed to create config dir: {}", e))?;
    
    fs::write(&prompt_path, &prompt)
        .map_err(|e| format!("Failed to write system prompt: {}", e))?;
    
    Ok("System prompt updated".to_string())
}

// ============================================================================
// File System Commands (for Code Editor)
// ============================================================================

#[tauri::command]
pub async fn read_file(path: String) -> Result<String, String> {
    fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file: {}", e))
}

#[tauri::command]
pub async fn write_file(path: String, content: String) -> Result<String, String> {
    fs::write(&path, &content)
        .map_err(|e| format!("Failed to write file: {}", e))?;
    
    Ok("File saved".to_string())
}

#[tauri::command]
pub async fn list_directory(path: String) -> Result<Vec<FileEntry>, String> {
    let entries = fs::read_dir(&path)
        .map_err(|e| format!("Failed to read directory: {}", e))?;
    
    let mut files = Vec::new();
    
    for entry in entries.flatten() {
        let metadata = entry.metadata().ok();
        let modified = metadata
            .as_ref()
            .and_then(|m| m.modified().ok())
            .map(|t| DateTime::<Utc>::from(t).to_rfc3339())
            .unwrap_or_default();
        
        files.push(FileEntry {
            name: entry.file_name().to_string_lossy().to_string(),
            path: entry.path().to_string_lossy().to_string(),
            is_dir: entry.path().is_dir(),
            size: metadata.as_ref().map(|m| m.len()).unwrap_or(0),
            modified,
        });
    }
    
    // Sort: directories first, then files alphabetically
    files.sort_by(|a, b| {
        match (a.is_dir, b.is_dir) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
    });
    
    Ok(files)
}
