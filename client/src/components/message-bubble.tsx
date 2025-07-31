import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bot, Copy, ThumbsUp, ThumbsDown, Share2, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { Message, User } from "@shared/schema";
import ReactMarkdown from 'react-markdown';

interface MessageBubbleProps {
  message: Message;
  isUser: boolean;
  user?: User;
}

export default function MessageBubble({ message, isUser, user }: MessageBubbleProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: "Copied",
        description: "Message copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to copy message",
        variant: "destructive",
      });
    }
  };

  const formatTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (isUser) {
    return (
      <div className="flex justify-end">
        <div className="max-w-3xl">
          <div className="bg-grok-blue text-white rounded-2xl rounded-br-sm px-4 py-3">
            <ReactMarkdown>
              {message.content}
            </ReactMarkdown>
          </div>
          <div className="flex items-center justify-end mt-1 space-x-2">
            <span className="text-xs text-gray-500">
              {formatTime(message.createdAt!)}
            </span>
            <Check className="w-3 h-3 text-green-400" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 bg-grok-blue rounded-full flex items-center justify-center flex-shrink-0 mt-1">
        <Bot className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 max-w-3xl">
        <div className="bg-grok-bubble text-white rounded-2xl rounded-bl-sm px-4 py-3">
          <ReactMarkdown 
            components={{
              code: ({ inline, className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '');
                const language = match ? match[1] : '';
                
                if (inline) {
                  return (
                    <code className="bg-gray-800 px-1 py-0.5 rounded text-sm font-mono">
                      {children}
                    </code>
                  );
                }
                
                return (
                  <div className="bg-gray-800 rounded-lg p-3 my-3 font-mono text-sm relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-400 text-xs">{language || 'code'}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCopy(String(children))}
                        className="text-gray-400 hover:text-white p-1 h-auto"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                    <pre className="text-green-400 overflow-x-auto">
                      <code>{children}</code>
                    </pre>
                  </div>
                );
              },
              ul: ({ children }) => (
                <ul className="list-disc list-inside space-y-1 text-gray-300 my-3">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside space-y-1 text-gray-300 my-3">
                  {children}
                </ol>
              ),
              p: ({ children }) => (
                <p className="mb-3 last:mb-0">{children}</p>
              ),
              strong: ({ children }) => (
                <strong className="font-semibold text-white">{children}</strong>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-grok-blue pl-4 italic text-gray-300 my-3">
                  {children}
                </blockquote>
              ),
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
        <div className="flex items-center mt-1 space-x-2">
          <span className="text-xs text-gray-500">
            {formatTime(message.createdAt!)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white p-1 h-auto"
            title="Like"
          >
            <ThumbsUp className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white p-1 h-auto"
            title="Dislike"
          >
            <ThumbsDown className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white p-1 h-auto"
            onClick={() => handleCopy(message.content)}
            title="Copy"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white p-1 h-auto"
            title="Share"
          >
            <Share2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
