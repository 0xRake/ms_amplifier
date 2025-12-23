"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { ChatPanel } from "@/components/ChatPanel";
import { EditorPanel } from "@/components/EditorPanel";
import { SettingsDialog } from "@/components/SettingsDialog";
import { TitleBar } from "@/components/TitleBar";
import { Toaster } from "@/components/ui/toaster";

export default function Home() {
  const [activeView, setActiveView] = useState<"chat" | "editor" | "split">("chat");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Title Bar - macOS style */}
      <TitleBar 
        onSettingsClick={() => setSettingsOpen(true)}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar 
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        {/* Main Panel */}
        <main className="flex-1 flex overflow-hidden">
          {activeView === "chat" && <ChatPanel />}
          {activeView === "editor" && <EditorPanel />}
          {activeView === "split" && (
            <>
              <div className="flex-1 border-r border-border">
                <EditorPanel />
              </div>
              <div className="flex-1">
                <ChatPanel />
              </div>
            </>
          )}
        </main>
      </div>

      {/* Settings Dialog */}
      <SettingsDialog 
        open={settingsOpen} 
        onOpenChange={setSettingsOpen} 
      />
      
      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
