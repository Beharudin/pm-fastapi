from fastapi import APIRouter, WebSocket, Query, Depends
from core.websocket_manager import manager
from core.security import decode_token
from sqlalchemy.orm import Session
from core.database import get_db
from models.user import User

router = APIRouter(prefix="/ws", tags=["WebSocket"])

@router.websocket("/tasks")
async def websocket_endpoint(websocket: WebSocket, token: str = Query(...), db: Session = Depends(get_db)):
    try:
        payload = decode_token(token)
        user = db.query(User).filter(User.id == payload["sub"]).first()
        if not user:
            await websocket.close(code=1008)  # Policy violation
            return
    except:
        await websocket.close(code=1008)
        return
    
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo or handle messages
            await websocket.send_text(f"User {user.email}: {data}")
    except Exception:
        manager.disconnect(websocket)