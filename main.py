from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from slowapi.middleware import SlowAPIMiddleware
from core.database import Base, engine
from core.response import format_response
from routes import auth, projects, tasks, websocket, users

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(title="SaaS Project Management API")

origins = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
app.add_middleware(SlowAPIMiddleware)

Base.metadata.create_all(bind=engine)

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"message": exc.detail, "status": "error", "data": None},
    )

app.include_router(auth.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(websocket.router)
app.include_router(users.router)

@app.get("/")
def root():
    return format_response(message="SaaS API running", data=None)