"use client";

import { useState, useEffect } from "react";
import { 
  Settings, 
  User, 
  Cpu, 
  Server, 
  Sparkles, 
  Puzzle,
  Archive,
  Trash2,
  Download,
  Upload,
  RefreshCw,
  Check,
  Plus,
  X,
  AlertTriangle,
  Terminal,
  FileText,
  Sliders
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import {
  getProfiles,
  getProviders,
  getMcps,
  getSkills,
  getModules,
  getCollections,
  getSystemInfo,
  getSystemPrompt,
  updateSystemPrompt,
  backupConfig,
  restoreConfig,
  installAmplifier,
  uninstallAmplifier,
  checkAmplifierInstalled,
  switchProfile,
  switchProvider,
  addMcp,
  removeMcp,
  type SystemInfo,
} from "@/lib/amplifier";
import { useToast } from "@/components/ui/use-toast";

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState("general");
  const { toast } = useToast();
  
  const {
    profiles,
    setProfiles,
    activeProfile,
    setActiveProfile,
    providers,
    setProviders,
    activeProvider,
    setActiveProvider,
    mcps,
    setMcps,
    skills,
    setSkills,
    modules,
    setModules,
    systemPrompt,
    setSystemPrompt: setStoreSystemPrompt,
  } = useAppStore();

  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [localSystemPrompt, setLocalSystemPrompt] = useState(systemPrompt);
  const [isInstalled, setIsInstalled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [newMcpName, setNewMcpName] = useState("");
  const [newMcpEndpoint, setNewMcpEndpoint] = useState("");

  // Load data when dialog opens
  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [
        profilesData,
        providersData,
        mcpsData,
        skillsData,
        modulesData,
        sysInfo,
        sysPrompt,
        installed,
      ] = await Promise.all([
        getProfiles().catch(() => []),
        getProviders().catch(() => []),
        getMcps().catch(() => []),
        getSkills().catch(() => []),
        getModules().catch(() => []),
        getSystemInfo().catch(() => null),
        getSystemPrompt().catch(() => ""),
        checkAmplifierInstalled().catch(() => false),
      ]);

      setProfiles(profilesData);
      setProviders(providersData);
      setMcps(mcpsData);
      setSkills(skillsData);
      setModules(modulesData);
      setSystemInfo(sysInfo);
      setLocalSystemPrompt(sysPrompt);
      setIsInstalled(installed);
    } catch (error) {
      console.error("Failed to load settings data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = async (profile: string) => {
    try {
      await switchProfile(profile);
      setActiveProfile(profile);
      toast({ title: "Profile Changed", description: `Now using ${profile} profile` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to switch profile", variant: "destructive" });
    }
  };

  const handleProviderChange = async (provider: string) => {
    try {
      await switchProvider(provider);
      setActiveProvider(provider);
      toast({ title: "Provider Changed", description: `Now using ${provider}` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to switch provider", variant: "destructive" });
    }
  };

  const handleSaveSystemPrompt = async () => {
    try {
      await updateSystemPrompt(localSystemPrompt);
      setStoreSystemPrompt(localSystemPrompt);
      toast({ title: "Saved", description: "System prompt updated" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to save system prompt", variant: "destructive" });
    }
  };

  const handleBackup = async () => {
    try {
      const result = await backupConfig();
      toast({ title: "Backup Created", description: result });
    } catch (error) {
      toast({ title: "Error", description: "Failed to create backup", variant: "destructive" });
    }
  };

  const handleInstall = async () => {
    setLoading(true);
    try {
      await installAmplifier();
      setIsInstalled(true);
      toast({ title: "Installed", description: "Amplifier installed successfully" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to install Amplifier", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUninstall = async () => {
    setLoading(true);
    try {
      await uninstallAmplifier();
      setIsInstalled(false);
      toast({ title: "Uninstalled", description: "Amplifier has been removed" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to uninstall Amplifier", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMcp = async () => {
    if (!newMcpName || !newMcpEndpoint) return;
    try {
      const mcp = await addMcp(newMcpName, newMcpEndpoint);
      setMcps([...mcps, mcp]);
      setNewMcpName("");
      setNewMcpEndpoint("");
      toast({ title: "MCP Added", description: `${newMcpName} has been added` });
    } catch (error) {
      toast({ title: "Error", description: "Failed to add MCP", variant: "destructive" });
    }
  };

  const handleRemoveMcp = async (mcpId: string) => {
    try {
      await removeMcp(mcpId);
      setMcps(mcps.filter(m => m.id !== mcpId));
      toast({ title: "MCP Removed" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to remove MCP", variant: "destructive" });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Configure Amped and Amplifier settings
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 flex-1 overflow-hidden -mx-6 px-6">
          {/* Sidebar */}
          <div className="w-48 space-y-1">
            {[
              { id: "general", icon: Sliders, label: "General" },
              { id: "profiles", icon: User, label: "Profiles" },
              { id: "providers", icon: Cpu, label: "Providers" },
              { id: "system-prompt", icon: FileText, label: "System Prompt" },
              { id: "mcps", icon: Server, label: "MCPs" },
              { id: "skills", icon: Sparkles, label: "Skills" },
              { id: "modules", icon: Puzzle, label: "Modules" },
              { id: "advanced", icon: Terminal, label: "Advanced" },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors",
                  activeTab === id
                    ? "bg-accent text-accent-foreground"
                    : "hover:bg-muted"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>

          {/* Content */}
          <ScrollArea className="flex-1 pr-4">
            {/* General Tab */}
            {activeTab === "general" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">General Settings</h3>
                  
                  {/* System Info */}
                  {systemInfo && (
                    <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg mb-6">
                      <div>
                        <Label className="text-muted-foreground text-xs">Amplifier Version</Label>
                        <p className="font-mono text-sm">{systemInfo.amplifier_version}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">Python Version</Label>
                        <p className="font-mono text-sm">{systemInfo.python_version}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">UV Version</Label>
                        <p className="font-mono text-sm">{systemInfo.uv_version}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground text-xs">System</Label>
                        <p className="font-mono text-sm">{systemInfo.os} ({systemInfo.arch})</p>
                      </div>
                      <div className="col-span-2">
                        <Label className="text-muted-foreground text-xs">Config Path</Label>
                        <p className="font-mono text-sm truncate">{systemInfo.config_path}</p>
                      </div>
                    </div>
                  )}

                  {/* Backup/Restore */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Backup & Restore</h4>
                    <div className="flex gap-2">
                      <Button variant="outline" onClick={handleBackup}>
                        <Download className="h-4 w-4 mr-2" />
                        Backup Config
                      </Button>
                      <Button variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Restore Config
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Profiles Tab */}
            {activeTab === "profiles" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Profiles</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Switch between pre-configured capability sets
                  </p>

                  <div className="space-y-2">
                    {profiles.map((profile) => (
                      <div
                        key={profile.name}
                        className={cn(
                          "p-4 rounded-lg border transition-colors cursor-pointer",
                          activeProfile === profile.name
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted"
                        )}
                        onClick={() => handleProfileChange(profile.name)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{profile.name}</span>
                          {activeProfile === profile.name && (
                            <Check className="h-4 w-4 text-primary" />
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {profile.description}
                        </p>
                        {profile.tools.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {profile.tools.map((tool) => (
                              <span
                                key={tool}
                                className="px-2 py-0.5 text-xs bg-muted rounded"
                              >
                                {tool}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Providers Tab */}
            {activeTab === "providers" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">AI Providers</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Configure and switch between AI providers
                  </p>

                  <div className="space-y-2">
                    {providers.map((provider) => (
                      <div
                        key={provider.name}
                        className={cn(
                          "p-4 rounded-lg border transition-colors cursor-pointer",
                          activeProvider === provider.name
                            ? "border-primary bg-primary/5"
                            : "hover:bg-muted"
                        )}
                        onClick={() => handleProviderChange(provider.name)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{provider.display_name}</span>
                          <div className="flex items-center gap-2">
                            {provider.is_configured ? (
                              <span className="text-xs text-green-500">Configured</span>
                            ) : (
                              <span className="text-xs text-yellow-500">Not configured</span>
                            )}
                            {activeProvider === provider.name && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </div>
                        </div>
                        {provider.model && (
                          <p className="text-sm text-muted-foreground">
                            Model: {provider.model}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* System Prompt Tab */}
            {activeTab === "system-prompt" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">System Prompt</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Customize the system prompt used for all conversations
                  </p>

                  <Textarea
                    value={localSystemPrompt}
                    onChange={(e) => setLocalSystemPrompt(e.target.value)}
                    className="min-h-[300px] font-mono text-sm"
                    placeholder="Enter your custom system prompt..."
                  />

                  <div className="flex justify-end mt-4">
                    <Button onClick={handleSaveSystemPrompt}>
                      Save System Prompt
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* MCPs Tab */}
            {activeTab === "mcps" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Model Context Protocol Servers</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Manage MCP connections to extend Amplifier capabilities
                  </p>

                  {/* Add new MCP */}
                  <div className="p-4 border rounded-lg mb-4">
                    <h4 className="font-medium mb-3">Add New MCP</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <Label>Name</Label>
                        <Input
                          value={newMcpName}
                          onChange={(e) => setNewMcpName(e.target.value)}
                          placeholder="e.g., GitHub MCP"
                        />
                      </div>
                      <div>
                        <Label>Endpoint</Label>
                        <Input
                          value={newMcpEndpoint}
                          onChange={(e) => setNewMcpEndpoint(e.target.value)}
                          placeholder="e.g., http://localhost:3000"
                        />
                      </div>
                    </div>
                    <Button onClick={handleAddMcp} disabled={!newMcpName || !newMcpEndpoint}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add MCP
                    </Button>
                  </div>

                  {/* MCP List */}
                  <div className="space-y-2">
                    {mcps.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No MCPs configured
                      </p>
                    ) : (
                      mcps.map((mcp) => (
                        <div
                          key={mcp.id}
                          className="flex items-center justify-between p-4 rounded-lg border"
                        >
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Server className="h-4 w-4" />
                              <span className="font-medium">{mcp.name}</span>
                              <span className={cn(
                                "px-2 py-0.5 text-xs rounded",
                                mcp.status === "connected"
                                  ? "bg-green-500/10 text-green-500"
                                  : "bg-yellow-500/10 text-yellow-500"
                              )}>
                                {mcp.status}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{mcp.endpoint}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {mcp.tools_count} tools available
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleRemoveMcp(mcp.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === "skills" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Skills</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Enable or disable Amplifier skills
                  </p>

                  <div className="space-y-2">
                    {skills.map((skill) => (
                      <div
                        key={skill.id}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Sparkles className="h-4 w-4" />
                            <span className="font-medium">{skill.name}</span>
                            <span className="px-2 py-0.5 text-xs bg-muted rounded">
                              {skill.source}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {skill.description}
                          </p>
                        </div>
                        <Switch checked={skill.enabled} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Modules Tab */}
            {activeTab === "modules" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Modules</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    View and manage loaded modules
                  </p>

                  <div className="space-y-2">
                    {modules.map((module) => (
                      <div
                        key={module.name}
                        className="flex items-center justify-between p-4 rounded-lg border"
                      >
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Puzzle className="h-4 w-4" />
                            <span className="font-medium">{module.name}</span>
                            <span className="px-2 py-0.5 text-xs bg-muted rounded">
                              {module.module_type}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground font-mono truncate">
                            {module.source}
                          </p>
                        </div>
                        <Switch checked={module.enabled} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Advanced Tab */}
            {activeTab === "advanced" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Advanced Settings</h3>
                  
                  {/* Installation Management */}
                  <div className="p-4 border rounded-lg mb-6">
                    <h4 className="font-medium mb-3">Amplifier Installation</h4>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "w-2 h-2 rounded-full",
                          isInstalled ? "bg-green-500" : "bg-red-500"
                        )} />
                        <span className="text-sm">
                          {isInstalled ? "Installed" : "Not installed"}
                        </span>
                      </div>
                      
                      {isInstalled ? (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleUninstall}
                          disabled={loading}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Uninstall
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={handleInstall}
                          disabled={loading}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Install
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={loadData}
                        disabled={loading}
                      >
                        <RefreshCw className={cn("h-4 w-4 mr-2", loading && "animate-spin")} />
                        Refresh
                      </Button>
                    </div>
                  </div>

                  {/* Internal Tweaks */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Internal Tweaks</h4>
                    <p className="text-sm text-muted-foreground">
                      These settings are for advanced users only
                    </p>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Debug Mode</Label>
                          <p className="text-xs text-muted-foreground">
                            Enable verbose logging
                          </p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Experimental Features</Label>
                          <p className="text-xs text-muted-foreground">
                            Enable unstable features
                          </p>
                        </div>
                        <Switch />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <Label>Performance Mode</Label>
                          <p className="text-xs text-muted-foreground">
                            Optimize for speed over memory
                          </p>
                        </div>
                        <Switch />
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="mt-8 p-4 border border-destructive/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-3 text-destructive">
                      <AlertTriangle className="h-4 w-4" />
                      <h4 className="font-medium">Danger Zone</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      These actions are destructive and cannot be undone
                    </p>
                    <div className="flex gap-2">
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Clear All Sessions
                      </Button>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Reset Configuration
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}
