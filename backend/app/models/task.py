from datetime import date
from typing import Literal, Optional
from pydantic import BaseModel


TaskStatus = Literal["backlog", "in_progress", "blocked", "completed"]
Difficulty = Literal["high", "medium", "low"]


class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    duration_hours: Optional[float] = None
    deadline: Optional[date] = None
    difficulty: Optional[Difficulty] = None


class TaskCreate(TaskBase):
    project_id: int


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    duration_hours: Optional[float] = None
    deadline: Optional[date] = None
    difficulty: Optional[Difficulty] = None
    project_id: Optional[int] = None


class TaskStatusUpdate(BaseModel):
    status: TaskStatus


class Task(TaskBase):
    id: int
    project_id: int
    status: TaskStatus
    created_at: str
    updated_at: str
