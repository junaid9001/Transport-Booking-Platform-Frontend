import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Manage WebSocket connection for flight booking flow.
 */
export function useFlightSocket(userId, onMessage) {
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    if (!userId) return;

    const wsUrl = `ws://localhost:8080/api/flights/ws?userId=${userId}`;
    let socket;
    let reconnectTimeout;

    const connect = () => {
      console.log(`[WS] Connecting to ${wsUrl}...`);
      socket = new WebSocket(wsUrl);
      socketRef.current = socket;

      socket.onopen = () => {
        console.log('[WS] Connection established');
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('[WS RECV]', data);
          if (onMessageRef.current) {
            onMessageRef.current(data);
          }
        } catch (err) {
          console.error('[WS] Parse Error:', err);
        }
      };

      socket.onerror = (error) => {
        console.error('[WS] Error:', error);
      };

      socket.onclose = (event) => {
        console.warn(`[WS] Connection closed (code: ${event.code}). Retrying in 3s...`);
        setIsConnected(false);
        reconnectTimeout = setTimeout(connect, 3000);
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectTimeout);
      if (socket) {
        // Remove onclose handler to prevent infinite retry when unmounting
        socket.onclose = null;
        socket.close();
      }
    };
  }, [userId]);

  const sendMessage = useCallback((msg) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msg));
    }
  }, []);

  return { isConnected, sendMessage };
}
