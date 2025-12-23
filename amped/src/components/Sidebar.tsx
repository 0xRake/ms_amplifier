"use client";

import { useState, useEffect } from "react";
import { 
  MessageSquare, 
  FolderOpen, 
  Server, 
  ChevronRight,
  Clock,
  User,
  Plus,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger 
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const { 
    sidebarTab, 
    setSidebarTab, 
    sessions, 
    mcps,
    activeProfile,
    currentSessionId,
    setCurrentSessionId,
    clearMessages
  } = useAppStore();
  
  const [searchQuery, setSearchQuery] = useState("");

  // Filter sessions based on search
  const filteredSessions = sessions.filter(
    (s) =>
      s.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (collapsed) {
    return (
      <div className="w-12 border-r border-border bg-sidebar flex flex-col items-center py-2 gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={sidebarTab === "sessions" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9"
              onClick={() => { setSidebarTab("sessions"); onToggle(); }}
            >
              <MessageSquare className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Sessions</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={sidebarTab === "files" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9"
              onClick={() => { setSidebarTab("files"); onToggle(); }}
            >
              <FolderOpen className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Files</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={sidebarTab === "mcps" ? "secondary" : "ghost"}
              size="icon"
              className="h-9 w-9"
              onClick={() => { setSidebarTab("mcps"); onToggle(); }}
            >
              <Server className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">MCPs</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="w-64 border-r border-border bg-sidebar flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Button
            variant={sidebarTab === "sessions" ? "secondary" : "ghost"}
            size="sm"
            className="flex-1 justify-start"
            onClick={() => setSidebarTab("sessions")}
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Sessions
          </Button>
          <Button
            variant={sidebarTab === "files" ? "secondary" : "ghost"}
            size="sm"
            className="flex-1 justify-start"
            onClick={() => setSidebarTab("files")}
          >
            <FolderOpen className="h-4 w-4 mr-2" />
            Files
          </Button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        {sidebarTab === "sessions" && (
          <div className="p-2">
            {/* New Chat Button */}
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start mb-2"
              onClick={() => {
                setCurrentSessionId(null);
                clearMessages();
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>

            {/* Sessions List */}
            <div className="space-y-1">
              {filteredSessions.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No sessions yet
                </p>
              ) : (
                filteredSessions.map((session) => (
                  <button
                    key={session.id}
                    className={cn(
                      "w-full text-left p-2 rounded-md text-sm hover:bg-accent transition-colors",
                      currentSessionId === session.id && "bg-accent"
                    )}
                    onClick={() => setCurrentSessionId(session.id)}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium truncate flex-1">
                        {session.project}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(session.updated_at).toLocaleDateString()}</span>
                      <span className="ml-auto">{session.message_count} msgs</span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}

        {sidebarTab === "files" && (
          <div className="p-2">
            <p className="text-sm text-muted-foreground text-center py-4">
              Open a folder to browse files
            </p>
          </div>
        )}

        {sidebarTab === "mcps" && (
          <div className="p-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start mb-2"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add MCP
            </Button>

            <div className="space-y-1">
              {mcps.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No MCPs configured
                </p>
              ) : (
                mcps.map((mcp) => (
                  <div
                    key={mcp.id}
                    className="p-2 rounded-md text-sm hover:bg-accent transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Server className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium truncate flex-1">
                        {mcp.name}
                      </span>
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        mcp.status === "connected" ? "bg-green-500" : "bg-yellow-500"
                      )} />
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {mcp.tools_count} tools
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <User className="h-3.5 w-3.5" />
          <span>Profile: {activeProfile}</span>
        </div>
      </div>
    </div>
  );
}
