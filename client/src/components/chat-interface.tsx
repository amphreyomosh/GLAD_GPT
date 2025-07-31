import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { 
  Menu, Ghost, History, Search, Paperclip, Mic, Send, 
  Bot, Zap, Brain, Users, Crown 
} from "lucide-react";
import MessageBubble from "@/components/message-bubble";
import FileUploadModal from "@/components/file-upload-modal";
import TypingIndicator from "@/components/typing-indicator";
import type { ConversationWithMessages, Message } from "@shared/schema";

interface ChatInterfaceProps {
  conversationId?: string;
  onToggleSidebar: () => void;
  wsConnected: boolean;
}

type AIMode = "fast" | "auto" | "expert" | "heavy";

const AI_MODES = [
  { id: "fast" as AIMode, label: "Fast", icon: Zap, description: "Quick responses" },
  { id: "auto" as AIMode, label: "Auto", icon: Bot, description: "Chooses best mode" },
  { id: "expert" as AIMode, label: "Expert", icon: Brain, description: "Thinks hard" },
  { id: "heavy" as AIMode, label: "Heavy", icon: Crown, description: "Team of experts" },
];

export default function ChatInterface({ conversationId, onToggleSidebar, wsConnected }: ChatInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [message, setMessage] = useState("");
  const [aiMode, setAiMode] = useState<AIMode>("fast");
  const [isPrivate, setIsPrivate] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [aiTyping, setAiTyping] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversation if ID provided
  const { data: conversation, isLoading } = useQuery<ConversationWithMessages>({
    queryKey: ['/api/conversations', conversationId],
    enabled: !!conversationId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ content, fileAnalyses }: { content: string; fileAnalyses?: any[] }) => {
      if (!conversationId) {
        // Create new conversation first
        const convResponse = await apiRequest('POST', '/api/conversations', {
          title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
          aiMode,
          isPrivate,
        });
        const newConversation = await convResponse.json();
        
        // Send message to new conversation
        const msgResponse = await apiRequest('POST', `/api/conversations/${newConversation.id}/messages`, {
          content,
          fileAnalyses,
        });
        
        return {
          conversation: newConversation,
          messages: await msgResponse.json(),
        };
      } else {
        // Send message to existing conversation
        const response = await apiRequest('POST', `/api/conversations/${conversationId}/messages`, {
          content,
          fileAnalyses,
        });
        return {
          conversation: null,
          messages: await response.json(),
        };
      }
    },
    onSuccess: (data) => {
      if (data.conversation) {
        // Redirect to new conversation
        window.location.href = `/chat/${data.conversation.id}`;
      } else {
        // Refresh current conversation
        queryClient.invalidateQueries({ queryKey: ['/api/conversations', conversationId] });
      }
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      setMessage("");
      setAiTyping(true);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Handle textarea auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 128) + 'px';
    }
  }, [message]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  // Handle WebSocket typing events
  useEffect(() => {
    if (wsConnected) {
      // Listen for typing events (would be handled by WebSocket hook)
      const handleTyping = (event: any) => {
        if (event.type === 'ai_typing') {
          setAiTyping(event.isTyping);
        }
      };
      
      // This would be connected to WebSocket events
      // For now, we'll simulate AI typing ending after message is sent
      if (aiTyping) {
        const timeout = setTimeout(() => setAiTyping(false), 3000);
        return () => clearTimeout(timeout);
      }
    }
  }, [wsConnected, aiTyping]);

  const handleSendMessage = () => {
    if (!message.trim() || sendMessageMutation.isPending) return;
    
    sendMessageMutation.mutate({ content: message.trim() });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileUpload = (fileAnalyses: any[]) => {
    if (!message.trim()) {
      setMessage("I've uploaded some files for analysis. Please help me understand them.");
    }
    sendMessageMutation.mutate({ 
      content: message.trim() || "Please analyze these uploaded files.", 
      fileAnalyses 
    });
    setShowFileModal(false);
  };

  return (
    <>
      {/* Chat Header */}
      <div className="bg-grok-dark border-b border-gray-700 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              className="lg:hidden p-2 hover:bg-gray-700 rounded-lg transition-colors"
              onClick={onToggleSidebar}
            >
              <Menu className="w-5 h-5 text-gray-400" />
            </button>
            
            {/* AI Mode Selector */}
            <div className="flex items-center space-x-1 bg-grok-bubble rounded-lg p-1">
              {AI_MODES.map((mode) => {
                const Icon = mode.icon;
                return (
                  <button
                    key={mode.id}
                    onClick={() => setAiMode(mode.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center space-x-1",
                      aiMode === mode.id 
                        ? "bg-grok-blue text-white" 
                        : "text-gray-300 hover:text-white"
                    )}
                    title={mode.description}
                  >
                    <Icon className="w-3 h-3" />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Privacy Toggle */}
            <button 
              className={cn(
                "p-2 rounded-lg transition-colors",
                isPrivate 
                  ? "bg-purple-600 text-white" 
                  : "text-gray-400 hover:text-white hover:bg-gray-700"
              )}
              onClick={() => setIsPrivate(!isPrivate)}
              title="Private Chat"
            >
              <Ghost className="w-4 h-4" />
            </button>
            
            {/* Chat History Button */}
            <button 
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors" 
              title="Chat History"
            >
              <History className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>

            {/* Search Button */}
            <button 
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors" 
              title="Search Messages"
            >
              <Search className="w-4 h-4 text-gray-400 hover:text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!conversationId || (conversation?.messages?.length === 0) ? (
          /* Welcome Message */
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-grok-blue rounded-xl flex items-center justify-center mx-auto mb-4">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2">What do you want to know?</h2>
            <p className="text-gray-400">Ask me anything - I'm here to help with coding, analysis, creative writing, and more.</p>
          </div>
        ) : (
          /* Messages */
          conversation?.messages?.map((msg: Message) => (
            <MessageBubble 
              key={msg.id} 
              message={msg} 
              isUser={msg.role === 'user'}
              user={user}
            />
          ))
        )}

        {/* Typing Indicator */}
        {aiTyping && <TypingIndicator />}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-700 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="flex items-end space-x-3 bg-grok-bubble rounded-2xl p-4">
              
              {/* File Attachment */}
              <button 
                className="p-2 text-gray-400 hover:text-white transition-colors"
                onClick={() => setShowFileModal(true)}
                title="Attach File"
              >
                <Paperclip className="w-4 h-4" />
              </button>
              
              {/* Message Input */}
              <div className="flex-1">
                <Textarea
                  ref={textareaRef}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask anything..."
                  className="w-full bg-transparent text-white placeholder-gray-400 resize-none outline-none border-none min-h-[24px] max-h-32"
                  rows={1}
                />
              </div>
              
              {/* Voice Input */}
              <button 
                className="p-2 text-gray-400 hover:text-white transition-colors" 
                title="Voice Input"
              >
                <Mic className="w-4 h-4" />
              </button>
              
              {/* Send Button */}
              <Button
                onClick={handleSendMessage}
                disabled={!message.trim() || sendMessageMutation.isPending}
                className="p-2 bg-grok-blue text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Character Counter & Status */}
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <div className="flex items-center space-x-2">
                <span>{message.length}/4000</span>
                <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                <span className="capitalize">{aiMode} Mode</span>
                {isPrivate && (
                  <>
                    <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                    <span className="text-purple-400">Private</span>
                  </>
                )}
                {wsConnected && (
                  <>
                    <span className="w-1 h-1 bg-gray-500 rounded-full"></span>
                    <span className="text-green-400">Connected</span>
                  </>
                )}
              </div>
              <div className="text-xs">
                By messaging Grok, you agree to our{" "}
                <a href="#" className="text-grok-blue hover:underline">Terms</a>
                {" "}and{" "}
                <a href="#" className="text-grok-blue hover:underline">Privacy Policy</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Upload Modal */}
      <FileUploadModal 
        isOpen={showFileModal}
        onClose={() => setShowFileModal(false)}
        onUpload={handleFileUpload}
      />
    </>
  );
}
