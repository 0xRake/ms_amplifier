import { create } from "zustand";
import type { Session, Profile, Provider, MCP, Skill, Module, AmplifierConfig } from "./amplifier";

// ============================================================================
// Message Types
// ============================================================================

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

// ============================================================================
// App Store
// ============================================================================

interface AppState {
  // Chat state
  messages: Message[];
  isLoading: boolean;
  currentSessionId: string | null;
  
  // Sessions
  sessions: Session[];
  
  // Profiles
  profiles: Profile[];
  activeProfile: string;
  
  // Providers
  providers: Provider[];
  activeProvider: string;
  
  // MCPs
  mcps: MCP[];
  
  // Skills
  skills: Skill[];
  
  // Modules
  modules: Module[];
  
  // Config
  config: AmplifierConfig | null;
  systemPrompt: string;
  
  // Editor state
  openFiles: { path: string; content: string; modified: boolean }[];
  activeFile: string | null;
  
  // UI state
  sidebarTab: "sessions" | "files" | "mcps";
  
  // Actions
  addMessage: (message: Omit<Message, "id" | "timestamp">) => void;
  updateMessage: (id: string, content: string) => void;
  setMessages: (messages: Message[]) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setCurrentSessionId: (id: string | null) => void;
  setSessions: (sessions: Session[]) => void;
  setProfiles: (profiles: Profile[]) => void;
  setActiveProfile: (profile: string) => void;
  setProviders: (providers: Provider[]) => void;
  setActiveProvider: (provider: string) => void;
  setMcps: (mcps: MCP[]) => void;
  addMcp: (mcp: MCP) => void;
  removeMcp: (id: string) => void;
  setSkills: (skills: Skill[]) => void;
  setModules: (modules: Module[]) => void;
  setConfig: (config: AmplifierConfig) => void;
  setSystemPrompt: (prompt: string) => void;
  openFile: (path: string, content: string) => void;
  closeFile: (path: string) => void;
  setActiveFile: (path: string | null) => void;
  updateFileContent: (path: string, content: string) => void;
  setSidebarTab: (tab: "sessions" | "files" | "mcps") => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  messages: [],
  isLoading: false,
  currentSessionId: null,
  sessions: [],
  profiles: [],
  activeProfile: "dev",
  providers: [],
  activeProvider: "anthropic",
  mcps: [],
  skills: [],
  modules: [],
  config: null,
  systemPrompt: "",
  openFiles: [],
  activeFile: null,
  sidebarTab: "sessions",

  // Actions
  addMessage: (message) =>
    set((state) => ({
      messages: [
        ...state.messages,
        {
          ...message,
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          timestamp: new Date(),
        },
      ],
    })),

  updateMessage: (id, content) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === id ? { ...msg, content, isStreaming: false } : msg
      ),
    })),

  setMessages: (messages) => set({ messages }),

  clearMessages: () => set({ messages: [] }),

  setLoading: (isLoading) => set({ isLoading }),

  setCurrentSessionId: (currentSessionId) => set({ currentSessionId }),

  setSessions: (sessions) => set({ sessions }),

  setProfiles: (profiles) => set({ profiles }),

  setActiveProfile: (activeProfile) => set({ activeProfile }),

  setProviders: (providers) => set({ providers }),

  setActiveProvider: (activeProvider) => set({ activeProvider }),

  setMcps: (mcps) => set({ mcps }),

  addMcp: (mcp) => set((state) => ({ mcps: [...state.mcps, mcp] })),

  removeMcp: (id) =>
    set((state) => ({
      mcps: state.mcps.filter((mcp) => mcp.id !== id),
    })),

  setSkills: (skills) => set({ skills }),

  setModules: (modules) => set({ modules }),

  setConfig: (config) => set({ config }),

  setSystemPrompt: (systemPrompt) => set({ systemPrompt }),

  openFile: (path, content) =>
    set((state) => {
      const exists = state.openFiles.find((f) => f.path === path);
      if (exists) {
        return { activeFile: path };
      }
      return {
        openFiles: [...state.openFiles, { path, content, modified: false }],
        activeFile: path,
      };
    }),

  closeFile: (path) =>
    set((state) => ({
      openFiles: state.openFiles.filter((f) => f.path !== path),
      activeFile:
        state.activeFile === path
          ? state.openFiles[0]?.path ?? null
          : state.activeFile,
    })),

  setActiveFile: (activeFile) => set({ activeFile }),

  updateFileContent: (path, content) =>
    set((state) => ({
      openFiles: state.openFiles.map((f) =>
        f.path === path ? { ...f, content, modified: true } : f
      ),
    })),

  setSidebarTab: (sidebarTab) => set({ sidebarTab }),
}));
