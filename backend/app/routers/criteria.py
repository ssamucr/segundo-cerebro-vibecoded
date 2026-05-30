from fastapi import APIRouter, Depends, HTTPException, status
from app.auth.clerk import get_current_user_id
from app.db.connection import get_client
from app.models.objective import AcceptanceCriteria, AcceptanceCriteriaUpdate

router = APIRouter(prefix="/criteria", tags=["criteria"])


@router.put("/{criteria_id}", response_model=AcceptanceCriteria)
def update_criteria(
    criteria_id: int,
    data: AcceptanceCriteriaUpdate,
    user_id: str = Depends(get_current_user_id),
):
    db = get_client()
    # Verify ownership via objective
    rows = db.execute(
        "SELECT ac.id, ac.objective_id FROM acceptance_criteria ac "
        "JOIN objectives o ON o.id = ac.objective_id "
        "WHERE ac.id = ? AND o.user_id = ?",
        [criteria_id, user_id],
    ).rows
    if not rows:
        raise HTTPException(status_code=404, detail="Criterio no encontrado")

    fields, values = [], []
    if data.description is not None:
        fields.append("description = ?"); values.append(data.description)
    if data.is_met is not None:
        fields.append("is_met = ?"); values.append(1 if data.is_met else 0)

    if fields:
        db.execute(
            f"UPDATE acceptance_criteria SET {', '.join(fields)} WHERE id = ?",
            [*values, criteria_id],
        )

    row = db.execute(
        "SELECT id, objective_id, description, is_met, created_at "
        "FROM acceptance_criteria WHERE id = ?",
        [criteria_id],
    ).rows[0]
    return {"id": row[0], "objective_id": row[1], "description": row[2], "is_met": bool(row[3]), "created_at": row[4]}


@router.delete("/{criteria_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_criteria(criteria_id: int, user_id: str = Depends(get_current_user_id)):
    db = get_client()
    rows = db.execute(
        "SELECT ac.id FROM acceptance_criteria ac "
        "JOIN objectives o ON o.id = ac.objective_id "
        "WHERE ac.id = ? AND o.user_id = ?",
        [criteria_id, user_id],
    ).rows
    if not rows:
        raise HTTPException(status_code=404, detail="Criterio no encontrado")
    db.execute("DELETE FROM acceptance_criteria WHERE id = ?", [criteria_id])
