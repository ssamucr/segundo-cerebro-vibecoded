from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from app.auth.clerk import get_current_user_id
from app.db.connection import get_client
from app.models.note import Note, NoteCreate, NoteUpdate

router = APIRouter(prefix="/notes", tags=["notes"])


def _row_to_note(row) -> dict:
    return {"id": row[0], "title": row[1], "content": row[2], "created_at": row[3], "updated_at": row[4]}


def _get_note_or_404(db, note_id: int, user_id: str) -> dict:
    rows = db.execute(
        "SELECT id, title, content, created_at, updated_at FROM notes WHERE id = ? AND user_id = ?",
        [note_id, user_id],
    ).rows
    if not rows:
        raise HTTPException(status_code=404, detail="Nota no encontrada")
    return _row_to_note(rows[0])


@router.get("", response_model=List[Note])
def list_notes(user_id: str = Depends(get_current_user_id)):
    db = get_client()
    rows = db.execute(
        "SELECT id, title, content, created_at, updated_at FROM notes WHERE user_id = ? ORDER BY created_at DESC",
        [user_id],
    ).rows
    return [_row_to_note(r) for r in rows]


@router.post("", response_model=Note, status_code=status.HTTP_201_CREATED)
def create_note(data: NoteCreate, user_id: str = Depends(get_current_user_id)):
    db = get_client()
    result = db.execute(
        "INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?) "
        "RETURNING id, title, content, created_at, updated_at",
        [user_id, data.title, data.content],
    )
    return _row_to_note(result.rows[0])


@router.get("/{note_id}", response_model=Note)
def get_note(note_id: int, user_id: str = Depends(get_current_user_id)):
    return _get_note_or_404(get_client(), note_id, user_id)


@router.put("/{note_id}", response_model=Note)
def update_note(note_id: int, data: NoteUpdate, user_id: str = Depends(get_current_user_id)):
    db = get_client()
    _get_note_or_404(db, note_id, user_id)
    fields, values = [], []
    if data.title is not None:
        fields.append("title = ?"); values.append(data.title)
    if data.content is not None:
        fields.append("content = ?"); values.append(data.content)
    fields.append("updated_at = datetime('now')")
    db.execute(f"UPDATE notes SET {', '.join(fields)} WHERE id = ?", [*values, note_id])
    return _get_note_or_404(db, note_id, user_id)


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: int, user_id: str = Depends(get_current_user_id)):
    db = get_client()
    _get_note_or_404(db, note_id, user_id)
    db.execute("DELETE FROM notes WHERE id = ?", [note_id])
