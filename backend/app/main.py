from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.db.migrations import run_migrations
from app.routers import objectives, criteria, projects, tasks, notes

app = FastAPI(title="Segundo Cerebro API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup():
    run_migrations()


app.include_router(objectives.router)
app.include_router(criteria.router)
app.include_router(projects.router)
app.include_router(tasks.router)
app.include_router(notes.router)


@app.get("/health")
def health():
    return {"status": "ok"}
