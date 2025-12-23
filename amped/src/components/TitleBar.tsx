"use client";

import { useTheme } from "next-themes";
import { 
  Settings, 
  MessageSquare, 
  Code2, 
  PanelLeftClose, 
  Moon, 
  Sun, 
  Zap
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface TitleBarProps {
  onSettingsClick: () => void;
  activeView: "chat" | "editor" | "split";
  onViewChange: (view: "chat" | "editor" | "split") => void;
}

export function TitleBar({ onSettingsClick, activeView, onViewChange }: TitleBarProps) {
  const { theme, setTheme } = useTheme();

  return (
    <div className="titlebar flex items-center justify-between h-12 px-4 border-b border-border bg-sidebar">
      {/* Left: Traffic lights space + Logo */}
      <div className="flex items-center gap-3">
        {/* Space for macOS traffic lights */}
        <div className="w-16" />
        
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-sm">Amped</span>
        </div>
      </div>

      {/* Center: View Switcher */}
      <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeView === "chat" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-3"
              onClick={() => onViewChange("chat")}
            >
              <MessageSquare className="w-4 h-4 mr-1.5" />
              Chat
            </Button>
          </TooltipTrigger>
          <TooltipContent>Chat with Amplifier</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeView === "editor" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-3"
              onClick={() => onViewChange("editor")}
            >
              <Code2 className="w-4 h-4 mr-1.5" />
              Editor
            </Button>
          </TooltipTrigger>
          <TooltipContent>Code Editor</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={activeView === "split" ? "secondary" : "ghost"}
              size="sm"
              className="h-7 px-3"
              onClick={() => onViewChange("split")}
            >
              <PanelLeftClose className="w-4 h-4 mr-1.5" />
              Split
            </Button>
          </TooltipTrigger>
          <TooltipContent>Split View</TooltipContent>
        </Tooltip>
      </div>

      {/* Right: Theme toggle + Settings */}
      <div className="flex items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Toggle theme</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onSettingsClick}
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Settings</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
