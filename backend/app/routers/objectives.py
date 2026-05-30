from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.auth.clerk import get_current_user_id
from app.db.connection import get_client
from app.models.objective import (
    Objective, ObjectiveCreate, ObjectiveUpdate,
    AcceptanceCriteria, AcceptanceCriteriaCreate, AcceptanceCriteriaUpdate,
    ObjectiveProgress,
)

router = APIRouter(prefix="/objectives", tags=["objectives"])


def _row_to_objective(row) -> dict:
    return {
        "id": row[0], "title": row[1], "description": row[2],
        "deadline": row[3], "status": row[4],
        "created_at": row[5], "updated_at": row[6],
        "criteria": [],
    }


def _row_to_criteria(row) -> dict:
    return {
        "id": row[0], "objective_id": row[1],
        "description": row[2], "is_met": bool(row[3]), "created_at": row[4],
    }


@router.get("", response_model=List[Objective])
def list_objectives(user_id: str = Depends(get_current_user_id)):
    db = get_client()
    rows = db.execute(
        "SELECT id, title, description, deadline, status, created_at, updated_at "
        "FROM objectives WHERE user_id = ? ORDER BY deadline ASC",
        [user_id],
    ).rows
    objectives = [_row_to_objective(r) for r in rows]
    # Attach criteria
    for obj in objectives:
        crows = db.execute(
            "SELECT id, objective_id, description, is_met, created_at "
            "FROM acceptance_criteria WHERE objective_id = ?",
            [obj["id"]],
        ).rows
        obj["criteria"] = [_row_to_criteria(r) for r in crows]
    return objectives


@router.post("", response_model=Objective, status_code=status.HTTP_201_CREATED)
def create_objective(data: ObjectiveCreate, user_id: str = Depends(get_current_user_id)):
    db = get_client()
    result = db.execute(
        "INSERT INTO objectives (user_id, title, description, deadline, status) "
        "VALUES (?, ?, ?, ?, ?) RETURNING id, title, description, deadline, status, created_at, updated_at",
        [user_id, data.title, data.description, str(data.deadline), data.status],
    )
    return {**_row_to_objective(result.rows[0]), "criteria": []}


@router.get("/{objective_id}", response_model=Objective)
def get_objective(objective_id: int, user_id: str = Depends(get_current_user_id)):
    db = get_client()
    rows = db.execute(
        "SELECT id, title, description, deadline, status, created_at, updated_at "
        "FROM objectives WHERE id = ? AND user_id = ?",
        [objective_id, user_id],
    ).rows
    if not rows:
        raise HTTPException(status_code=404, detail="Objetivo no encontrado")
    obj = _row_to_objective(rows[0])
    crows = db.execute(
        "SELECT id, objective_id, description, is_met, created_at "
        "FROM acceptance_criteria WHERE objective_id = ?",
        [objective_id],
    ).rows
    obj["criteria"] = [_row_to_criteria(r) for r in crows]
    return obj


@router.put("/{objective_id}", response_model=Objective)
def update_objective(
    objective_id: int,
    data: ObjectiveUpdate,
    user_id: str = Depends(get_current_user_id),
):
    db = get_client()
    existing = db.execute(
        "SELECT id FROM objectives WHERE id = ? AND user_id = ?", [objective_id, user_id]
    ).rows
    if not existing:
        raise HTTPException(status_code=404, detail="Objetivo no encontrado")

    fields, values = [], []
    if data.title is not None:
        fields.append("title = ?"); values.append(data.title)
    if data.description is not None:
        fields.append("description = ?"); values.append(data.description)
    if data.deadline is not None:
        fields.append("deadline = ?"); values.append(str(data.deadline))
    if data.status is not None:
        fields.append("status = ?"); values.append(data.status)
    fields.append("updated_at = datetime('now')")

    db.execute(
        f"UPDATE objectives SET {', '.join(fields)} WHERE id = ?",
        [*values, objective_id],
    )
    return get_objective(objective_id, user_id)


@router.delete("/{objective_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_objective(objective_id: int, user_id: str = Depends(get_current_user_id)):
    db = get_client()
    existing = db.execute(
        "SELECT id FROM objectives WHERE id = ? AND user_id = ?", [objective_id, user_id]
    ).rows
    if not existing:
        raise HTTPException(status_code=404, detail="Objetivo no encontrado")
    db.execute("DELETE FROM objectives WHERE id = ?", [objective_id])


@router.get("/{objective_id}/progress", response_model=ObjectiveProgress)
def get_progress(objective_id: int, user_id: str = Depends(get_current_user_id)):
    db = get_client()
    existing = db.execute(
        "SELECT id FROM objectives WHERE id = ? AND user_id = ?", [objective_id, user_id]
    ).rows
    if not existing:
        raise HTTPException(status_code=404, detail="Objetivo no encontrado")

    crit_rows = db.execute(
        "SELECT is_met FROM acceptance_criteria WHERE objective_id = ?", [objective_id]
    ).rows
    total_criteria = len(crit_rows)
    met_criteria = sum(1 for r in crit_rows if r[0])

    proj_rows = db.execute(
        "SELECT status FROM projects WHERE objective_id = ?", [objective_id]
    ).rows
    total_projects = len(proj_rows)
    completed_projects = sum(1 for r in proj_rows if r[0] == "completed")

    # Fórmula ponderada: 40% criterios + 60% proyectos
    if total_criteria > 0 and total_projects > 0:
        progress = 0.4 * (met_criteria / total_criteria) + 0.6 * (completed_projects / total_projects)
    elif total_criteria > 0:
        progress = met_criteria / total_criteria
    elif total_projects > 0:
        progress = completed_projects / total_projects
    else:
        progress = 0.0

    return ObjectiveProgress(
        objective_id=objective_id,
        progress=round(progress * 100, 1),
        total_criteria=total_criteria,
        met_criteria=met_criteria,
        total_projects=total_projects,
        completed_projects=completed_projects,
    )


# ─── Criteria routes ──────────────────────────────────────────────────────────

@router.post("/{objective_id}/criteria", response_model=AcceptanceCriteria, status_code=201)
def add_criteria(
    objective_id: int,
    data: AcceptanceCriteriaCreate,
    user_id: str = Depends(get_current_user_id),
):
    db = get_client()
    existing = db.execute(
        "SELECT id FROM objectives WHERE id = ? AND user_id = ?", [objective_id, user_id]
    ).rows
    if not existing:
        raise HTTPException(status_code=404, detail="Objetivo no encontrado")
    result = db.execute(
        "INSERT INTO acceptance_criteria (objective_id, description) VALUES (?, ?) "
        "RETURNING id, objective_id, description, is_met, created_at",
        [objective_id, data.description],
    )
    return _row_to_criteria(result.rows[0])
