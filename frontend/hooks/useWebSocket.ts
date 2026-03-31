/**
 * Hook personalizado para WebSocket con reconexión automática
 */
import { useEffect, useRef, useCallback, useState } from "react";
import { AgentEvent } from "@/types";

interface UseWebSocketOptions {
  url: string;
  onMessage?: (event: AgentEvent) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket({
  url,
  onMessage,
  onConnect,
  onDisconnect,
  onError,
  reconnectInterval = 3000,
  maxReconnectAttempts = 10,
}: UseWebSocketOptions) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectCountRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected" | "error">(
    "disconnected"
  );

  const connect = useCallback(() => {
    // Evitar múltiples conexiones simultáneas
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    setStatus("connecting");

    try {
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log("✅ WebSocket conectado:", url);
        setStatus("connected");
        reconnectCountRef.current = 0;
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as AgentEvent;
          onMessage?.(data);
        } catch (error) {
          console.error("Error parseando mensaje WebSocket:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("❌ Error en WebSocket:", error);
        setStatus("error");
        onError?.(error);
      };

      ws.onclose = () => {
        console.log("🔌 WebSocket desconectado");
        setStatus("disconnected");
        onDisconnect?.();

        // Intentar reconectar
        if (reconnectCountRef.current < maxReconnectAttempts) {
          reconnectCountRef.current++;
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(
              `🔄 Reconectando... intento ${reconnectCountRef.current}/${maxReconnectAttempts}`
            );
            connect();
          }, reconnectInterval);
        } else {
          console.error("❌ Máximos intentos de reconexión alcanzados");
        }
      };

      wsRef.current = ws;
    } catch (error) {
      console.error("Error creando WebSocket:", error);
      setStatus("error");
      onError?.(error as Event);
    }
  }, [url, onMessage, onConnect, onDisconnect, onError, reconnectInterval, maxReconnectAttempts]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }

    setStatus("disconnected");
  }, []);

  const send = useCallback((data: unknown) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(data));
    } else {
      console.warn("WebSocket no está conectado");
    }
  }, []);

  // Conectar al montar, desconectar al desmontar
  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { status, send, disconnect, isConnected: status === "connected" };
}
