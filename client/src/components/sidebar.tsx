import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bot, Plus, Trash2, Settings, X, Menu } from "lucide-react";
import type { Conversation } from "@shared/schema";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  currentConversationId?: string;
}

export default function Sidebar({ isOpen, onClose, currentConversationId }: SidebarProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [location, setLocation] = useLocation();

  // Fetch conversations
  const { data: conversations = [], isLoading } = useQuery<Conversation[]>({
    queryKey: ['/api/conversations'],
  });

  // Create new conversation
  const createConversationMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/conversations', {
        title: 'New Chat',
        aiMode: 'fast',
        isPrivate: false,
      });
      return response.json();
    },
    onSuccess: (conversation: Conversation) => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      setLocation(`/chat/${conversation.id}`);
      onClose();
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
        description: "Failed to create new conversation",
        variant: "destructive",
      });
    },
  });

  // Delete conversation
  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      await apiRequest('DELETE', `/api/conversations/${conversationId}`);
    },
    onSuccess: (_, deletedId) => {
      queryClient.invalidateQueries({ queryKey: ['/api/conversations'] });
      if (currentConversationId === deletedId) {
        setLocation('/');
      }
      toast({
        title: "Success",
        description: "Conversation deleted",
      });
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
        description: "Failed to delete conversation",
        variant: "destructive",
      });
    },
  });

  const handleDeleteConversation = (e: React.MouseEvent, conversationId: string) => {
    e.preventDefault();
    e.stopPropagation();
    deleteConversationMutation.mutate(conversationId);
  };

  return (
    <>
      <div className={cn(
        "w-80 bg-grok-sidebar border-r border-gray-700 flex flex-col transition-all duration-300 ease-in-out",
        "lg:translate-x-0 fixed lg:relative z-30 h-full",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-grok-blue rounded-lg flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold text-lg">Grok</span>
            </div>
            <button className="lg:hidden" onClick={onClose}>
              <X className="w-5 h-5 text-gray-400 hover:text-white" />
            </button>
          </div>
          
          {/* New Chat Button */}
          <Button 
            className="w-full bg-grok-blue hover:bg-blue-600 text-white"
            onClick={() => createConversationMutation.mutate()}
            disabled={createConversationMutation.isPending}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-12 bg-gray-700 rounded-lg"></div>
                  </div>
                ))}
              </div>
            ) : conversations.length > 0 ? (
              conversations.map((conversation) => (
                <div key={conversation.id} className="group relative">
                  <Link href={`/chat/${conversation.id}`}>
                    <button className={cn(
                      "w-full text-left p-3 rounded-lg hover:bg-gray-700 transition-colors",
                      currentConversationId === conversation.id && "bg-gray-700"
                    )}>
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {conversation.title}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-xs text-gray-400 capitalize">
                              {conversation.aiMode}
                            </span>
                            {conversation.isPrivate && (
                              <span className="text-xs text-purple-400">Private</span>
                            )}
                          </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            className="p-1 hover:bg-gray-600 rounded"
                            onClick={(e) => handleDeleteConversation(e, conversation.id)}
                            disabled={deleteConversationMutation.isPending}
                          >
                            <Trash2 className="w-3 h-3 text-gray-400" />
                          </button>
                        </div>
                      </div>
                    </button>
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400 text-sm">No conversations yet</p>
                <p className="text-gray-500 text-xs mt-1">Create a new chat to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-700">
          <div className="flex items-center space-x-3 mb-3">
            <img 
              src={user?.profileImageUrl || `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face`}
              alt="User profile" 
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email || 'User'
                }
              </p>
              <p className="text-xs text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
            <button 
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
              onClick={() => window.location.href = '/api/logout'}
            >
              <Settings className="w-4 h-4 text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
