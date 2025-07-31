import { useEffect, useState, useRef } from "react";
import { useAuth } from "./useAuth";

export function useWebSocket(conversationId?: string) {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (!user) return;

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      
      // Join conversation room
      if (conversationId) {
        ws.send(JSON.stringify({
          type: 'join',
          userId: user.id,
          conversationId,
        }));
      }
    };

    ws.onclose = () => {
      setConnected(false);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnected(false);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        
        switch (message.type) {
          case 'typing':
            // Handle typing indicator from other users
            console.log('User typing:', message.userId, message.isTyping);
            break;
            
          case 'ai_typing':
            // Handle AI typing indicator
            console.log('AI typing:', message.isTyping);
            break;
            
          case 'new_message':
            // Handle new message received
            console.log('New message:', message.message);
            break;
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    return () => {
      ws.close();
    };
  }, [user, conversationId]);

  const sendTyping = (isTyping: boolean) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'typing',
        isTyping,
      }));
    }
  };

  return {
    connected,
    sendTyping,
  };
}
