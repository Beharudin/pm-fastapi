from fastapi import FastAPI
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from core.database import Base, engine
from routes import auth, projects, tasks, websocket, users

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="SaaS Project Management API")

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(websocket.router)
app.include_router(users.router)

@app.get("/")
def root():
    return {"message": "SaaS API running"}