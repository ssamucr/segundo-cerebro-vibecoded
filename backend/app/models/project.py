from datetime import date
from typing import List, Literal, Optional
from pydantic import BaseModel, model_validator


ProjectStatus = Literal["backlog", "in_progress", "stopped", "completed"]


class ProjectBase(BaseModel):
    title: str = ""
    description: Optional[str] = None


class ProjectCreate(ProjectBase):
    objective_id: int


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    objective_id: Optional[int] = None


class ProjectStatusUpdate(BaseModel):
    status: ProjectStatus
    # Para transición a in_progress
    start_date: Optional[date] = None
    estimated_end_date: Optional[date] = None
    # Para transición a stopped
    stop_reason: Optional[str] = None
    # Para transición a completed
    actual_end_date: Optional[date] = None
    resolution: Optional[str] = None

    @model_validator(mode="after")
    def validate_transitions(self) -> "ProjectStatusUpdate":
        if self.status == "in_progress":
            if not self.start_date or not self.estimated_end_date:
                raise ValueError(
                    "Para pasar a 'en curso' se requieren start_date y estimated_end_date"
                )
        if self.status == "stopped" and not self.stop_reason:
            raise ValueError("Para detener el proyecto se requiere stop_reason")
        if self.status == "completed":
            if not self.actual_end_date or not self.resolution:
                raise ValueError(
                    "Para finalizar el proyecto se requieren actual_end_date y resolution"
                )
        return self


class Project(ProjectBase):
    id: int
    objective_id: int
    status: ProjectStatus
    start_date: Optional[str]
    estimated_end_date: Optional[str]
    actual_end_date: Optional[str]
    stop_reason: Optional[str]
    resolution: Optional[str]
    created_at: str
    updated_at: str
