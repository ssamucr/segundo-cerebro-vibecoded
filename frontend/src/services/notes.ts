import api from './api'
import type { Note, NoteCreate, NoteUpdate } from '@/types'

export const notesApi = {
  list: () => api.get<Note[]>('/notes').then((r) => r.data),
  get: (id: number) => api.get<Note>(`/notes/${id}`).then((r) => r.data),
  create: (data: NoteCreate) => api.post<Note>('/notes', data).then((r) => r.data),
  update: (id: number, data: NoteUpdate) =>
    api.put<Note>(`/notes/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/notes/${id}`),
}
