"use client";
import { useEffect, useRef, useCallback } from "react";

const WS_BASE = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8000";

export type WSEvent =
  | { type: "item_reserved"; item_id: string; reserver_name: string }
  | { type: "item_unreserved"; item_id: string }
  | { type: "contribution_added"; item_id: string; total_contributed: number; contributors_count: number; contributor_name: string }
  | { type: "item_added"; item: unknown }
  | { type: "item_updated"; item: unknown }
  | { type: "item_deleted"; item_id: string };

export function useWishlistWS(slug: string, onEvent: (event: WSEvent) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const onEventRef = useRef(onEvent);
  onEventRef.current = onEvent;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(`${WS_BASE}/ws/${slug}`);
    wsRef.current = ws;

    ws.onmessage = (e) => {
      try {
        const event = JSON.parse(e.data) as WSEvent;
        onEventRef.current(event);
      } catch {}
    };

    ws.onclose = () => {
      // Reconnect after 3s
      setTimeout(connect, 3000);
    };

    ws.onerror = () => {
      ws.close();
    };
  }, [slug]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);
}
