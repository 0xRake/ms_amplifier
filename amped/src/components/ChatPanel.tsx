"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Send, 
  StopCircle, 
  Sparkles,
  User,
  Bot,
  Copy,
  Check
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useAppStore, type Message } from "@/lib/store";
import { runAmplifier } from "@/lib/amplifier";
import { useToast } from "@/components/ui/use-toast";

export function ChatPanel() {
  const { 
    messages, 
    addMessage, 
    updateMessage,
    isLoading, 
    setLoading,
    activeProfile 
  } = useAppStore();
  
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    
    // Add user message
    addMessage({
      role: "user",
      content: userMessage,
    });

    // Add placeholder for assistant
    const assistantMsgId = `msg-${Date.now()}-assistant`;
    addMessage({
      role: "assistant",
      content: "",
      isStreaming: true,
    });

    setLoading(true);

    try {
      const response = await runAmplifier(userMessage, activeProfile);
      updateMessage(assistantMsgId, response);
    } catch (error) {
      updateMessage(
        assistantMsgId, 
        `Error: ${error instanceof Error ? error.message : "Failed to get response"}`
      );
      toast({
        title: "Error",
        description: "Failed to get response from Amplifier",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <WelcomeMessage />
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onCopy={() => copyToClipboard(message.content, message.id)}
                isCopied={copiedId === message.id}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* Input Area */}
      <div className="border-t border-border p-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-end gap-2">
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Message Amped..."
                className="min-h-[52px] max-h-[200px] pr-12 resize-none"
                disabled={isLoading}
                rows={1}
              />
              <Button
                size="icon"
                className="absolute right-2 bottom-2 h-8 w-8"
                onClick={handleSubmit}
                disabled={!input.trim() || isLoading}
              >
                {isLoading ? (
                  <StopCircle className="h-4 w-4" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Powered by Amplifier • Profile: {activeProfile}
          </p>
        </div>
      </div>
    </div>
  );
}

function WelcomeMessage() {
  return (
    <div className="flex flex-col items-center justify-center h-full py-12">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center mb-6">
        <Sparkles className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-2xl font-semibold mb-2">Welcome to Amped</h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        AI-powered development assistant. Ask me anything about code, 
        architecture, debugging, or let me help you build something new.
      </p>
      
      <div className="grid grid-cols-2 gap-3 max-w-lg">
        {[
          "Explain async/await in Python",
          "Design a REST API for a todo app",
          "Debug a TypeScript type error",
          "Create a React component",
        ].map((suggestion) => (
          <button
            key={suggestion}
            className="p-3 text-left text-sm rounded-lg border border-border hover:bg-accent transition-colors"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}

interface MessageBubbleProps {
  message: Message;
  onCopy: () => void;
  isCopied: boolean;
}

function MessageBubble({ message, onCopy, isCopied }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
        isUser 
          ? "bg-primary text-primary-foreground" 
          : "bg-gradient-to-br from-violet-500 to-purple-600 text-white"
      )}>
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4" />
        )}
      </div>

      {/* Message Content */}
      <div className={cn(
        "flex-1 group",
        isUser && "text-right"
      )}>
        <div className={cn(
          "inline-block text-left rounded-2xl px-4 py-2.5 max-w-full",
          isUser 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted",
          message.isStreaming && "animate-pulse-subtle"
        )}>
          {message.isStreaming && !message.content ? (
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Copy button */}
        {!isUser && message.content && !message.isStreaming && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
            onClick={onCopy}
          >
            {isCopied ? (
              <Check className="h-3 w-3 text-green-500" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        )}

        {/* Timestamp */}
        <p className="text-xs text-muted-foreground mt-1">
          {message.timestamp.toLocaleTimeString()}
        </p>
      </div>
    </div>
  );
}
