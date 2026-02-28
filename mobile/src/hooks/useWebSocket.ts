import { useEffect, useRef, useCallback } from 'react';
import { WS_URL } from '../constants';

export type WsEvent =
    | { type: 'item_added'; item: any }
    | { type: 'item_updated'; item: any }
    | { type: 'item_deleted'; item_id: string }
    | { type: 'item_reserved'; item_id: string; reserver_name: string }
    | { type: 'item_unreserved'; item_id: string }
    | { type: 'contribution_added'; item_id: string; total_contributed: number; contributors_count: number; contributor_name: string };

interface UseWebSocketOptions {
    slug: string | null;
    onEvent: (event: WsEvent) => void;
}

export function useWebSocket({ slug, onEvent }: UseWebSocketOptions) {
    const wsRef = useRef<WebSocket | null>(null);
    const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const onEventRef = useRef(onEvent);
    onEventRef.current = onEvent;

    const connect = useCallback(() => {
        if (!slug) return;
        if (wsRef.current) {
            wsRef.current.close();
        }

        const ws = new WebSocket(`${WS_URL}/ws/${slug}`);
        wsRef.current = ws;

        ws.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                onEventRef.current(data as WsEvent);
            } catch {
                // ignore malformed messages
            }
        };

        ws.onclose = () => {
            // Reconnect after 3s
            reconnectTimer.current = setTimeout(connect, 3000);
        };

        ws.onerror = () => {
            ws.close();
        };
    }, [slug]);

    useEffect(() => {
        connect();
        return () => {
            if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
            if (wsRef.current) wsRef.current.close();
        };
    }, [connect]);
}
