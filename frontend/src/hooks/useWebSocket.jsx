import { useState, useEffect, useRef, useCallback, useMemo } from 'react';

const toWebSocketOrigin = (value) => {
  if (!value) return null;

  try {
    const parsed = new URL(value, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    if (parsed.protocol === 'http:') {
      parsed.protocol = 'ws:';
    } else if (parsed.protocol === 'https:') {
      parsed.protocol = 'wss:';
    }
    parsed.pathname = '';
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString().replace(/\/$/, '');
  } catch (error) {
    if (import.meta.env?.DEV) {
      console.warn('[useWebSocket] Unable to derive WebSocket origin from value:', value, error);
    }
    return null;
  }
};

const normalizeUrl = (rawUrl, baseOrigin) => {
  if (!rawUrl || typeof rawUrl !== 'string') return null;

  if (/^wss?:\/\//i.test(rawUrl)) {
    return rawUrl;
  }

  if (/^https?:\/\//i.test(rawUrl)) {
    return rawUrl.replace(/^http/i, rawUrl.startsWith('https') ? 'wss' : 'ws');
  }

  const origin = baseOrigin || (typeof window !== 'undefined' ? toWebSocketOrigin(window.location.origin) : null);
  if (!origin) {
    return null;
  }

  if (rawUrl.startsWith('/')) {
    return `${origin}${rawUrl}`;
  }

  return `${origin}/${rawUrl}`.replace(/([^:]\/)\/+/g, '$1');
};

const deriveDefaultConfig = () => {
  const envEnabled = import.meta.env?.VITE_WS_ENABLED ?? import.meta.env?.VITE_ENABLE_WEBSOCKETS;

  const explicitBase = import.meta.env?.VITE_WS_BASE_URL || import.meta.env?.VITE_WS_URL;
  const explicitOrigin = toWebSocketOrigin(explicitBase);
  const fallbackOrigin = explicitOrigin || toWebSocketOrigin(import.meta.env?.VITE_API_URL);

  const enabled = envEnabled === undefined ? Boolean(explicitOrigin) : envEnabled !== 'false';

  return { enabled, baseOrigin: fallbackOrigin };
};

const baseDefaults = deriveDefaultConfig();

const useWebSocket = (input, overrides = {}) => {
  const config = typeof input === 'string' ? { url: input, ...overrides } : { ...(input || {}), ...overrides };

  const {
    url: rawUrl,
    maxReconnectAttempts = 5,
    reconnectInterval = 3000,
    pingInterval = 30000,
    enabled = baseDefaults.enabled,
    onConnect,
    onDisconnect,
    onMessage,
    onError
  } = config;

  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionQuality, setConnectionQuality] = useState('unknown');
  const [connectionStatus, setConnectionStatus] = useState('idle');
  const [lastMessage, setLastMessage] = useState(null);
  const [error, setError] = useState(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);

  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const hasWarnedRef = useRef(false);

  const baseOrigin = useMemo(() => baseDefaults.baseOrigin, []);
  const resolvedUrl = useMemo(() => normalizeUrl(rawUrl, baseOrigin), [rawUrl, baseOrigin]);
  const effectiveEnabled = useMemo(() => enabled && Boolean(resolvedUrl), [enabled, resolvedUrl]);

  const clearTimers = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
  }, []);

  const disconnect = useCallback(() => {
    clearTimers();

    if (socket) {
      try {
        socket.close();
      } catch (closeError) {
        if (import.meta.env?.DEV) {
          console.warn('[useWebSocket] Error closing socket:', closeError);
        }
      }
    }

    setSocket(null);
    setIsConnected(false);
    setConnectionStatus('disconnected');
  }, [clearTimers, socket]);

  const connect = useCallback(() => {
    if (!effectiveEnabled) {
      return;
    }

    clearTimers();
    setConnectionStatus('connecting');

    try {
      const ws = new WebSocket(resolvedUrl);

      ws.onopen = () => {
        reconnectAttemptsRef.current = 0;
        setReconnectAttempts(0);
        setIsConnected(true);
        setConnectionStatus('connected');
        setError(null);
        setConnectionQuality('good');
        hasWarnedRef.current = false;
        onConnect?.();

        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, pingInterval);
      };

      ws.onmessage = (event) => {
        let parsedData = null;

        try {
          parsedData = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        } catch (parseError) {
          if (import.meta.env?.DEV) {
            console.warn('[useWebSocket] Failed to parse message payload:', parseError);
          }
        }

        if (parsedData) {
          setLastMessage(parsedData);

          if (parsedData.type === 'pong') {
            setConnectionQuality('excellent');
          }

          onMessage?.(parsedData, event);
        } else {
          onMessage?.(null, event);
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        setSocket(null);
        setConnectionStatus('disconnected');
        onDisconnect?.(event);

        clearTimers();

        if (!effectiveEnabled) {
          return;
        }

        reconnectAttemptsRef.current += 1;
        setReconnectAttempts(reconnectAttemptsRef.current);

        if (reconnectAttemptsRef.current <= maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, reconnectInterval * Math.min(reconnectAttemptsRef.current, 5));
        } else if (!hasWarnedRef.current && import.meta.env?.DEV) {
          console.warn('[useWebSocket] Max reconnect attempts exceeded for', resolvedUrl);
          hasWarnedRef.current = true;
        }
      };

      ws.onerror = (socketError) => {
        setError(socketError);
        setConnectionQuality('poor');
        setConnectionStatus('error');
        onError?.(socketError);
      };

      setSocket(ws);
    } catch (connectionError) {
      setError(connectionError);
      setConnectionStatus('error');
      onError?.(connectionError);
    }
  }, [clearTimers, effectiveEnabled, maxReconnectAttempts, onConnect, onDisconnect, onError, onMessage, pingInterval, reconnectInterval, resolvedUrl]);

  useEffect(() => {
    if (!effectiveEnabled) {
      if (!hasWarnedRef.current && enabled && rawUrl && import.meta.env?.DEV) {
        console.info('[useWebSocket] Skipping WebSocket connection. Provide VITE_WS_BASE_URL to enable real-time updates for', rawUrl);
        hasWarnedRef.current = true;
      }
      return undefined;
    }

    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect, effectiveEnabled, enabled, rawUrl]);

  const sendMessage = useCallback((message) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(typeof message === 'string' ? message : JSON.stringify(message));
      return true;
    }
    return false;
  }, [socket]);

  return {
    socket,
    isConnected,
    connectionQuality,
    connectionStatus,
    lastMessage,
    error,
    reconnectAttempts,
    sendMessage,
    connect,
    disconnect
  };
};

export default useWebSocket;
