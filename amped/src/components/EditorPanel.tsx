"use client";

import { useState, useEffect } from "react";
import { 
  FileCode, 
  FolderOpen, 
  Save, 
  X,
  ChevronRight,
  ChevronDown,
  File,
  Folder
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";
import { readFile, writeFile, listDirectory, type FileEntry } from "@/lib/amplifier";
import { useToast } from "@/components/ui/use-toast";

export function EditorPanel() {
  const { 
    openFiles, 
    activeFile, 
    setActiveFile, 
    closeFile, 
    openFile,
    updateFileContent
  } = useAppStore();
  
  const [fileTree, setFileTree] = useState<FileEntry[]>([]);
  const [expandedDirs, setExpandedDirs] = useState<Set<string>>(new Set());
  const [currentDir, setCurrentDir] = useState<string | null>(null);
  const { toast } = useToast();

  const activeFileData = openFiles.find(f => f.path === activeFile);

  // Load directory on mount
  useEffect(() => {
    const loadDir = async () => {
      try {
        // Try to load home directory
        const homeDir = process.env.HOME || "/Users";
        const files = await listDirectory(homeDir);
        setFileTree(files);
        setCurrentDir(homeDir);
      } catch (error) {
        console.error("Failed to load directory:", error);
      }
    };
    
    // Only run in Tauri context
    if (typeof window !== "undefined" && "__TAURI__" in window) {
      loadDir();
    }
  }, []);

  const handleOpenFile = async (path: string) => {
    try {
      const content = await readFile(path);
      openFile(path, content);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to open file",
        variant: "destructive",
      });
    }
  };

  const handleSaveFile = async () => {
    if (!activeFile || !activeFileData) return;
    
    try {
      await writeFile(activeFile, activeFileData.content);
      toast({
        title: "Saved",
        description: "File saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save file",
        variant: "destructive",
      });
    }
  };

  const toggleDir = async (path: string) => {
    const newExpanded = new Set(expandedDirs);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
      // Load directory contents
      try {
        const files = await listDirectory(path);
        // Merge into file tree (simplified - would need proper tree structure)
      } catch (error) {
        console.error("Failed to load directory:", error);
      }
    }
    setExpandedDirs(newExpanded);
  };

  const getFileIcon = (name: string, isDir: boolean) => {
    if (isDir) return <Folder className="h-4 w-4 text-blue-500" />;
    
    const ext = name.split(".").pop()?.toLowerCase();
    const iconColors: Record<string, string> = {
      ts: "text-blue-500",
      tsx: "text-blue-500",
      js: "text-yellow-500",
      jsx: "text-yellow-500",
      py: "text-green-500",
      rs: "text-orange-500",
      md: "text-gray-500",
      json: "text-yellow-600",
      css: "text-pink-500",
      html: "text-orange-500",
    };
    
    return <FileCode className={cn("h-4 w-4", iconColors[ext || ""] || "text-muted-foreground")} />;
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Tabs Bar */}
      <div className="flex items-center border-b border-border bg-muted/30">
        <ScrollArea className="flex-1" orientation="horizontal">
          <div className="flex">
            {openFiles.map((file) => {
              const fileName = file.path.split("/").pop() || file.path;
              return (
                <button
                  key={file.path}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 text-sm border-r border-border hover:bg-muted transition-colors",
                    activeFile === file.path && "bg-background"
                  )}
                  onClick={() => setActiveFile(file.path)}
                >
                  {getFileIcon(fileName, false)}
                  <span className={cn(file.modified && "italic")}>{fileName}</span>
                  {file.modified && <span className="text-xs text-muted-foreground">•</span>}
                  <button
                    className="ml-1 p-0.5 rounded hover:bg-muted-foreground/20"
                    onClick={(e) => {
                      e.stopPropagation();
                      closeFile(file.path);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </button>
              );
            })}
          </div>
        </ScrollArea>

        {activeFile && (
          <div className="flex items-center gap-1 px-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={handleSaveFile}
              disabled={!activeFileData?.modified}
            >
              <Save className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* File Tree (simplified) */}
        <div className="w-48 border-r border-border bg-sidebar overflow-hidden">
          <div className="p-2 border-b border-border">
            <Button variant="ghost" size="sm" className="w-full justify-start text-xs">
              <FolderOpen className="h-3.5 w-3.5 mr-2" />
              Open Folder
            </Button>
          </div>
          <ScrollArea className="h-full">
            <div className="p-2">
              {fileTree.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  No folder open
                </p>
              ) : (
                <div className="space-y-0.5">
                  {fileTree.map((entry) => (
                    <button
                      key={entry.path}
                      className="w-full flex items-center gap-1.5 px-2 py-1 text-xs rounded hover:bg-accent transition-colors"
                      onClick={() => entry.is_dir ? toggleDir(entry.path) : handleOpenFile(entry.path)}
                    >
                      {entry.is_dir && (
                        expandedDirs.has(entry.path) 
                          ? <ChevronDown className="h-3 w-3" />
                          : <ChevronRight className="h-3 w-3" />
                      )}
                      {getFileIcon(entry.name, entry.is_dir)}
                      <span className="truncate">{entry.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Code Editor */}
        <div className="flex-1 overflow-hidden">
          {activeFileData ? (
            <div className="h-full flex flex-col">
              {/* Simple code editor - would use Monaco in production */}
              <div className="flex-1 overflow-auto">
                <pre className="code-editor p-4 h-full">
                  <code>
                    <textarea
                      value={activeFileData.content}
                      onChange={(e) => updateFileContent(activeFile!, e.target.value)}
                      className="w-full h-full bg-transparent resize-none outline-none font-mono text-sm"
                      spellCheck={false}
                    />
                  </code>
                </pre>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <FileCode className="h-12 w-12 mb-4" />
              <p className="text-sm">No file open</p>
              <p className="text-xs">Select a file from the sidebar or open a folder</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
