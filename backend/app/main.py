from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .database import Base, engine
from .routers import auth, wishlists, items, reservations, contributions, scraper
from .websocket_manager import manager

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="WishList API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.FRONTEND_URL,
        "http://localhost:3000",
        "https://wishbox-flame.vercel.app",
        # React Native Metro / emulator origins
        "http://localhost:8081",
        "http://10.0.2.2:3000",
        "http://10.0.2.2:8081",
        "*",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(wishlists.router)
app.include_router(items.router)
app.include_router(reservations.router)
app.include_router(contributions.router)
app.include_router(scraper.router)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.websocket("/ws/{slug}")
async def websocket_endpoint(websocket: WebSocket, slug: str):
    await manager.connect(websocket, slug)
    try:
        while True:
            # Keep connection alive, ignore incoming messages
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, slug)
