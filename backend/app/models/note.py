from typing import Optional
from pydantic import BaseModel


class NoteBase(BaseModel):
    title: str
    content: str = ""


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None


class Note(NoteBase):
    id: int
    created_at: str
    updated_at: str
