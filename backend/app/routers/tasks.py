from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.auth.clerk import get_current_user_id
from app.db.connection import get_client
from app.models.task import Task, TaskCreate, TaskUpdate, TaskStatusUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])


def _row_to_task(row) -> dict:
    return {
        "id": row[0], "project_id": row[1], "title": row[2],
        "description": row[3], "duration_hours": row[4],
        "deadline": row[5], "difficulty": row[6], "status": row[7],
        "created_at": row[8], "updated_at": row[9],
    }


def _get_task_or_404(db, task_id: int, user_id: str) -> dict:
    rows = db.execute(
        "SELECT t.id, t.project_id, t.title, t.description, t.duration_hours, "
        "t.deadline, t.difficulty, t.status, t.created_at, t.updated_at "
        "FROM tasks t "
        "JOIN projects p ON p.id = t.project_id "
        "JOIN objectives o ON o.id = p.objective_id "
        "WHERE t.id = ? AND o.user_id = ?",
        [task_id, user_id],
    ).rows
    if not rows:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    return _row_to_task(rows[0])


@router.get("", response_model=List[Task])
def list_tasks(
    project_id: Optional[int] = Query(None),
    user_id: str = Depends(get_current_user_id),
):
    db = get_client()
    base = (
        "SELECT t.id, t.project_id, t.title, t.description, t.duration_hours, "
        "t.deadline, t.difficulty, t.status, t.created_at, t.updated_at "
        "FROM tasks t "
        "JOIN projects p ON p.id = t.project_id "
        "JOIN objectives o ON o.id = p.objective_id "
        "WHERE o.user_id = ?"
    )
    if project_id:
        rows = db.execute(base + " AND t.project_id = ? ORDER BY t.created_at DESC", [user_id, project_id]).rows
    else:
        rows = db.execute(base + " ORDER BY t.created_at DESC", [user_id]).rows
    return [_row_to_task(r) for r in rows]


@router.post("", response_model=Task, status_code=status.HTTP_201_CREATED)
def create_task(data: TaskCreate, user_id: str = Depends(get_current_user_id)):
    db = get_client()
    proj = db.execute(
        "SELECT p.id FROM projects p JOIN objectives o ON o.id = p.objective_id "
        "WHERE p.id = ? AND o.user_id = ?",
        [data.project_id, user_id],
    ).rows
    if not proj:
        raise HTTPException(status_code=404, detail="Proyecto no encontrado")
    result = db.execute(
        "INSERT INTO tasks (project_id, title, description, duration_hours, deadline, difficulty) "
        "VALUES (?, ?, ?, ?, ?, ?) "
        "RETURNING id, project_id, title, description, duration_hours, deadline, difficulty, status, created_at, updated_at",
        [data.project_id, data.title, data.description, data.duration_hours,
         str(data.deadline) if data.deadline else None, data.difficulty],
    )
    return _row_to_task(result.rows[0])


@router.get("/{task_id}", response_model=Task)
def get_task(task_id: int, user_id: str = Depends(get_current_user_id)):
    return _get_task_or_404(get_client(), task_id, user_id)


@router.put("/{task_id}", response_model=Task)
def update_task(task_id: int, data: TaskUpdate, user_id: str = Depends(get_current_user_id)):
    db = get_client()
    _get_task_or_404(db, task_id, user_id)
    fields, values = [], []
    if data.title is not None:
        fields.append("title = ?"); values.append(data.title)
    if data.description is not None:
        fields.append("description = ?"); values.append(data.description)
    if data.duration_hours is not None:
        fields.append("duration_hours = ?"); values.append(data.duration_hours)
    if data.deadline is not None:
        fields.append("deadline = ?"); values.append(str(data.deadline))
    if data.difficulty is not None:
        fields.append("difficulty = ?"); values.append(data.difficulty)
    if data.project_id is not None:
        fields.append("project_id = ?"); values.append(data.project_id)
    fields.append("updated_at = datetime('now')")
    db.execute(f"UPDATE tasks SET {', '.join(fields)} WHERE id = ?", [*values, task_id])
    return _get_task_or_404(db, task_id, user_id)


@router.patch("/{task_id}/status", response_model=Task)
def update_task_status(
    task_id: int,
    data: TaskStatusUpdate,
    user_id: str = Depends(get_current_user_id),
):
    db = get_client()
    _get_task_or_404(db, task_id, user_id)
    db.execute(
        "UPDATE tasks SET status = ?, updated_at = datetime('now') WHERE id = ?",
        [data.status, task_id],
    )
    return _get_task_or_404(db, task_id, user_id)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, user_id: str = Depends(get_current_user_id)):
    db = get_client()
    _get_task_or_404(db, task_id, user_id)
    db.execute("DELETE FROM tasks WHERE id = ?", [task_id])
