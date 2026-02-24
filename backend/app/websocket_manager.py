import json
from typing import Dict, Set
from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        # wishlist_slug -> set of websockets
        self.connections: Dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, slug: str):
        await websocket.accept()
        if slug not in self.connections:
            self.connections[slug] = set()
        self.connections[slug].add(websocket)

    def disconnect(self, websocket: WebSocket, slug: str):
        if slug in self.connections:
            self.connections[slug].discard(websocket)
            if not self.connections[slug]:
                del self.connections[slug]

    async def broadcast(self, slug: str, event: dict):
        if slug not in self.connections:
            return
        dead = set()
        for ws in self.connections[slug]:
            try:
                await ws.send_text(json.dumps(event))
            except Exception:
                dead.add(ws)
        for ws in dead:
            self.connections[slug].discard(ws)


manager = ConnectionManager()
