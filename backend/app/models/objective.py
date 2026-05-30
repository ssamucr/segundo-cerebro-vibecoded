from datetime import date, datetime
from typing import List, Literal, Optional
from pydantic import BaseModel


ObjectiveStatus = Literal["active", "completed", "abandoned"]


class AcceptanceCriteriaBase(BaseModel):
    description: str


class AcceptanceCriteriaCreate(AcceptanceCriteriaBase):
    pass


class AcceptanceCriteriaUpdate(BaseModel):
    description: Optional[str] = None
    is_met: Optional[bool] = None


class AcceptanceCriteria(AcceptanceCriteriaBase):
    id: int
    objective_id: int
    is_met: bool
    created_at: str


class ObjectiveBase(BaseModel):
    title: str
    description: Optional[str] = None
    deadline: date
    status: ObjectiveStatus = "active"


class ObjectiveCreate(ObjectiveBase):
    pass


class ObjectiveUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    deadline: Optional[date] = None
    status: Optional[ObjectiveStatus] = None


class Objective(ObjectiveBase):
    id: int
    created_at: str
    updated_at: str
    criteria: List[AcceptanceCriteria] = []


class ObjectiveProgress(BaseModel):
    objective_id: int
    progress: float
    total_criteria: int
    met_criteria: int
    total_projects: int
    completed_projects: int
