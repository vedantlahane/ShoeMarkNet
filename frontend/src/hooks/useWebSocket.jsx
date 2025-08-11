import { useState, useEffect, useRef, useCallback } from 'react';

const useWebSocket = (url, options = {}) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState('unknown');
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);
  
  const {
    maxReconnectAttempts = 5,
    reconnectInterval = 3000,
    pingInterval = 30000,
    enabled = true,
    onConnect,
    onDisconnect,
    onMessage,
    onError
  } = options;

  const connect = useCallback(() => {
    if (!enabled || !url) return;

    try {
      const wsUrl = url.startsWith('/') 
        ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}${url}`
        : url;
        
      const ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        setIsConnected(true);
        setError(null);
        setReconnectAttempts(0);
        setConnectionQuality('good');
        onConnect?.();
        
        // Start ping interval
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, pingInterval);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
          onMessage?.(data);
          
          // Handle pong response for connection quality
          if (data.type === 'pong') {
            setConnectionQuality('excellent');
          }
        } catch (error) {
          console.warn('Failed to parse WebSocket message:', error);
        }
      };
      
      ws.onclose = (event) => {
        setIsConnected(false);
        setSocket(null);
        onDisconnect?.(event);
        
        // Clear ping interval
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
        
        // Attempt reconnection
        if (reconnectAttempts < maxReconnectAttempts && enabled) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, reconnectInterval);
        }
      };
      
      ws.onerror = (error) => {
        setError(error);
        setConnectionQuality('poor');
        onError?.(error);
      };
      
      setSocket(ws);
    } catch (error) {
      setError(error);
      onError?.(error);
    }
  }, [url, enabled, maxReconnectAttempts, reconnectInterval, pingInterval, reconnectAttempts, onConnect, onDisconnect, onMessage, onError]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    
    if (socket) {
      socket.close();
    }
  }, [socket]);

  const sendMessage = useCallback((message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(typeof message === 'string' ? message : JSON.stringify(message));
      return true;
    }
    return false;
  }, [socket]);

  useEffect(() => {
    if (enabled) {
      connect();
    }
    
    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  return {
    socket,
    isConnected,
    connectionQuality,
    lastMessage,
    error,
    reconnectAttempts,
    sendMessage,
    connect,
    disconnect
  };
};

export default useWebSocket;
