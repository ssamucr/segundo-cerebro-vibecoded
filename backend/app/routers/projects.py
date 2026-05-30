from typing import Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.auth.clerk import get_current_user_id
from app.db.connection import get_client
from app.models.project import Project, ProjectCreate, ProjectUpdate, ProjectStatusUpdate

router = APIRouter(prefix="/projects", tags=["projects"])

# Valid state machine transitions
VALID_TRANSITIONS: Dict[str, List[str]] = {
    "backlog": ["in_progress"],
    "in_progress": ["stopped", "completed"],
    "stopped": ["in_progress", "completed"],
    "completed": [],
}


def _row_to_project(row) -> dict:
    return {
        "id": row[0], "objective_id": row[1], "title": row[2],
        "description": row[3], "status": row[4],
        "start_date": row[5], "estimated_end_date": row[6],
        "actual_end_date": row[7], "stop_reason": row[8],
        "resolution": row[9], "created_at": row[10], "updated_at": row[11],
    }


def _get_project_or_404(db, project_id: int, user_id: str) -> dict:
    rows = db.execute(
        "SELECT p.id, p.objective_id, p.title, p.description, p.status, "
        "p.start_date, p.estimated_end_date, p.actual_end_date, p.stop_reason, "
        "p.resolution, p.created_at, p.updated_at "
        "FROM projects p JOIN objectives o ON o.id = p.objective_id "
        "WHERE p.id = ? AND o.user_id = ?",
        [project_id, user_id],
    ).rows
    if not rows:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    return _row_to_project(rows[0])


@router.get("", response_model=List[Project])
def list_projects(
    objective_id: Optional[int] = Query(None),
    user_id: str = Depends(get_current_user_id),
):
    db = get_client()
    if objective_id:
        rows = db.execute(
            "SELECT p.id, p.objective_id, p.title, p.description, p.status, "
            "p.start_date, p.estimated_end_date, p.actual_end_date, p.stop_reason, "
            "p.resolution, p.created_at, p.updated_at "
            "FROM projects p JOIN objectives o ON o.id = p.objective_id "
            "WHERE p.objective_id = ? AND o.user_id = ? ORDER BY p.created_at DESC",
            [objective_id, user_id],
        ).rows
    else:
        rows = db.execute(
            "SELECT p.id, p.objective_id, p.title, p.description, p.status, "
            "p.start_date, p.estimated_end_date, p.actual_end_date, p.stop_reason, "
            "p.resolution, p.created_at, p.updated_at "
            "FROM projects p JOIN objectives o ON o.id = p.objective_id "
            "WHERE o.user_id = ? ORDER BY p.created_at DESC",
            [user_id],
        ).rows
    return [_row_to_project(r) for r in rows]


@router.post("", response_model=Project, status_code=status.HTTP_201_CREATED)
def create_project(data: ProjectCreate, user_id: str = Depends(get_current_user_id)):
    db = get_client()
    obj = db.execute(
        "SELECT id FROM objectives WHERE id = ? AND user_id = ?",
        [data.objective_id, user_id],
    ).rows
    if not obj:
        raise HTTPException(status_code=404, detail="Objetivo no encontrado")
    result = db.execute(
        "INSERT INTO projects (objective_id, title, description) VALUES (?, ?, ?) "
        "RETURNING id, objective_id, title, description, status, start_date, "
        "estimated_end_date, actual_end_date, stop_reason, resolution, created_at, updated_at",
        [data.objective_id, data.title, data.description],
    )
    return _row_to_project(result.rows[0])


@router.get("/{project_id}", response_model=Project)
def get_project(project_id: int, user_id: str = Depends(get_current_user_id)):
    return _get_project_or_404(get_client(), project_id, user_id)


@router.put("/{project_id}", response_model=Project)
def update_project(
    project_id: int,
    data: ProjectUpdate,
    user_id: str = Depends(get_current_user_id),
):
    db = get_client()
    _get_project_or_404(db, project_id, user_id)
    fields, values = [], []
    if data.title is not None:
        fields.append("title = ?"); values.append(data.title)
    if data.description is not None:
        fields.append("description = ?"); values.append(data.description)
    if data.objective_id is not None:
        fields.append("objective_id = ?"); values.append(data.objective_id)
    fields.append("updated_at = datetime('now')")
    db.execute(f"UPDATE projects SET {', '.join(fields)} WHERE id = ?", [*values, project_id])
    return _get_project_or_404(db, project_id, user_id)


@router.patch("/{project_id}/status", response_model=Project)
def update_project_status(
    project_id: int,
    data: ProjectStatusUpdate,
    user_id: str = Depends(get_current_user_id),
):
    db = get_client()
    project = _get_project_or_404(db, project_id, user_id)
    current = project["status"]
    new_status = data.status

    if new_status not in VALID_TRANSITIONS.get(current, []):
        raise HTTPException(
            status_code=422,
            detail=f"Transición inválida: {current} → {new_status}",
        )

    fields = ["status = ?", "updated_at = datetime('now')"]
    values: list = [new_status]

    if new_status == "in_progress":
        fields += ["start_date = ?", "estimated_end_date = ?", "stop_reason = NULL"]
        values += [str(data.start_date), str(data.estimated_end_date)]
    elif new_status == "stopped":
        fields += ["stop_reason = ?"]
        values.append(data.stop_reason)
    elif new_status == "completed":
        fields += ["actual_end_date = ?", "resolution = ?"]
        values += [str(data.actual_end_date), data.resolution]

    db.execute(f"UPDATE projects SET {', '.join(fields)} WHERE id = ?", [*values, project_id])
    return _get_project_or_404(db, project_id, user_id)


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: int, user_id: str = Depends(get_current_user_id)):
    db = get_client()
    _get_project_or_404(db, project_id, user_id)
    db.execute("DELETE FROM projects WHERE id = ?", [project_id])
