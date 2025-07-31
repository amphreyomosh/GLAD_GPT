import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Sidebar from "@/components/sidebar";
import ChatInterface from "@/components/chat-interface";
import { useWebSocket } from "@/hooks/useWebSocket";

export default function Chat() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const params = useParams();
  const conversationId = params.id;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize WebSocket connection
  const { connected } = useWebSocket(conversationId);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="h-screen bg-grok-dark flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-grok-blue rounded-lg flex items-center justify-center animate-pulse">
            <i className="fas fa-robot text-white text-sm"></i>
          </div>
          <span className="text-white">Loading...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  return (
    <div className="flex h-screen bg-grok-dark text-white">
      {/* Sidebar */}
      <Sidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)}
        currentConversationId={conversationId}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <ChatInterface 
          conversationId={conversationId}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          wsConnected={connected}
        />
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
