import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notesApi } from '@/services/notes'
import type { NoteCreate, NoteUpdate } from '@/types'

export const NOTES_KEY = ['notes'] as const

export function useNotes() {
  return useQuery({ queryKey: NOTES_KEY, queryFn: notesApi.list })
}

export function useNote(id: number) {
  return useQuery({
    queryKey: [...NOTES_KEY, id],
    queryFn: () => notesApi.get(id),
    enabled: !!id,
  })
}

export function useCreateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: NoteCreate) => notesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: NOTES_KEY }),
  })
}

export function useUpdateNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: NoteUpdate }) => notesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: NOTES_KEY }),
  })
}

export function useDeleteNote() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => notesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: NOTES_KEY }),
  })
}
