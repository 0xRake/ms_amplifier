import { invoke } from "@tauri-apps/api/core";

// ============================================================================
// Types
// ============================================================================

export interface Session {
  id: string;
  project: string;
  created_at: string;
  updated_at: string;
  profile: string;
  provider: string;
  message_count: number;
}

export interface Profile {
  name: string;
  description: string;
  tools: string[];
  agents: string[];
  is_active: boolean;
}

export interface Provider {
  name: string;
  display_name: string;
  model: string | null;
  is_active: boolean;
  is_configured: boolean;
}

export interface AmplifierConfig {
  provider: string;
  model: string;
  profile: string;
  system_prompt: string | null;
  collections: string[];
  modules: string[];
}

export interface MCP {
  id: string;
  name: string;
  endpoint: string;
  status: string;
  last_checked: string;
  tools_count: number;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  source: string;
  enabled: boolean;
}

export interface Module {
  name: string;
  module_type: string;
  source: string;
  version: string;
  enabled: boolean;
}

export interface Collection {
  name: string;
  source: string;
  profiles: string[];
  agents: string[];
}

export interface SystemInfo {
  amplifier_version: string;
  python_version: string;
  uv_version: string;
  config_path: string;
  sessions_path: string;
  os: string;
  arch: string;
}

export interface FileEntry {
  name: string;
  path: string;
  is_dir: boolean;
  size: number;
  modified: string;
}

// ============================================================================
// Amplifier API
// ============================================================================

export async function runAmplifier(prompt: string, profile?: string): Promise<string> {
  return invoke<string>("run_amplifier", { prompt, profile });
}

export async function runAmplifierStream(prompt: string, profile?: string): Promise<string> {
  return invoke<string>("run_amplifier_stream", { prompt, profile });
}

// ============================================================================
// Session API
// ============================================================================

export async function getSessions(allProjects = false): Promise<Session[]> {
  return invoke<Session[]>("get_sessions", { allProjects });
}

export async function getSessionDetails(sessionId: string): Promise<Session> {
  return invoke<Session>("get_session_details", { sessionId });
}

export async function resumeSession(sessionId: string): Promise<string> {
  return invoke<string>("resume_session", { sessionId });
}

// ============================================================================
// Profile API
// ============================================================================

export async function getProfiles(): Promise<Profile[]> {
  return invoke<Profile[]>("get_profiles");
}

export async function switchProfile(profile: string): Promise<string> {
  return invoke<string>("switch_profile", { profile });
}

// ============================================================================
// Provider API
// ============================================================================

export async function getProviders(): Promise<Provider[]> {
  return invoke<Provider[]>("get_providers");
}

export async function switchProvider(provider: string, model?: string): Promise<string> {
  return invoke<string>("switch_provider", { provider, model });
}

// ============================================================================
// Config API
// ============================================================================

export async function getConfig(): Promise<AmplifierConfig> {
  return invoke<AmplifierConfig>("get_config");
}

export async function updateConfig(config: AmplifierConfig): Promise<string> {
  return invoke<string>("update_config", { config });
}

export async function backupConfig(): Promise<string> {
  return invoke<string>("backup_config");
}

export async function restoreConfig(backupName: string): Promise<string> {
  return invoke<string>("restore_config", { backupName });
}

// ============================================================================
// MCP API
// ============================================================================

export async function getMcps(): Promise<MCP[]> {
  return invoke<MCP[]>("get_mcps");
}

export async function addMcp(name: string, endpoint: string): Promise<MCP> {
  return invoke<MCP>("add_mcp", { name, endpoint });
}

export async function removeMcp(mcpId: string): Promise<string> {
  return invoke<string>("remove_mcp", { mcpId });
}

// ============================================================================
// Skills API
// ============================================================================

export async function getSkills(): Promise<Skill[]> {
  return invoke<Skill[]>("get_skills");
}

// ============================================================================
// Module API
// ============================================================================

export async function getModules(): Promise<Module[]> {
  return invoke<Module[]>("get_modules");
}

// ============================================================================
// Collection API
// ============================================================================

export async function getCollections(): Promise<Collection[]> {
  return invoke<Collection[]>("get_collections");
}

// ============================================================================
// Installation API
// ============================================================================

export async function installAmplifier(): Promise<string> {
  return invoke<string>("install_amplifier");
}

export async function uninstallAmplifier(): Promise<string> {
  return invoke<string>("uninstall_amplifier");
}

export async function checkAmplifierInstalled(): Promise<boolean> {
  return invoke<boolean>("check_amplifier_installed");
}

// ============================================================================
// System API
// ============================================================================

export async function getSystemInfo(): Promise<SystemInfo> {
  return invoke<SystemInfo>("get_system_info");
}

// ============================================================================
// System Prompt API
// ============================================================================

export async function getSystemPrompt(): Promise<string> {
  return invoke<string>("get_system_prompt");
}

export async function updateSystemPrompt(prompt: string): Promise<string> {
  return invoke<string>("update_system_prompt", { prompt });
}

// ============================================================================
// File System API (for Code Editor)
// ============================================================================

export async function readFile(path: string): Promise<string> {
  return invoke<string>("read_file", { path });
}

export async function writeFile(path: string, content: string): Promise<string> {
  return invoke<string>("write_file", { path, content });
}

export async function listDirectory(path: string): Promise<FileEntry[]> {
  return invoke<FileEntry[]>("list_directory", { path });
}
