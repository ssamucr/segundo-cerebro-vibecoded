import { useState } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { useNote, useUpdateNote, useDeleteNote } from "@/hooks/useNotes"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Pencil, Check, X, Trash2 } from "lucide-react"
import type { NoteUpdate } from "@/types"

export function NoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const noteId = Number(id)
  const navigate = useNavigate()
  const { data: note, isLoading } = useNote(noteId)
  const updateNote = useUpdateNote()
  const deleteNote = useDeleteNote()

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<NoteUpdate>({})

  if (isLoading) return <div className="p-6">Cargando...</div>
  if (!note) return <div className="p-6">Nota no encontrada.</div>

  function handleSave() {
    updateNote.mutate({ id: noteId, data: form }, { onSuccess: () => setEditing(false) })
  }

  function handleDelete() {
    deleteNote.mutate(noteId, { onSuccess: () => navigate("/notes") })
  }

  return (
    <div className="p-6 space-y-4 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/notes"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        {editing ? (
          <Input
            className="flex-1 text-xl font-bold"
            value={form.title ?? note.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />
        ) : (
          <h1 className="text-2xl font-bold flex-1">{note.title}</h1>
        )}
        {editing ? (
          <>
            <Button size="icon" onClick={handleSave} disabled={updateNote.isPending}><Check className="h-4 w-4" /></Button>
            <Button size="icon" variant="outline" onClick={() => { setEditing(false); setForm({}) }}><X className="h-4 w-4" /></Button>
          </>
        ) : (
          <>
            <Button size="icon" variant="ghost" onClick={() => { setEditing(true); setForm({}) }}><Pencil className="h-4 w-4" /></Button>
            <Button size="icon" variant="ghost" className="text-destructive hover:text-destructive" onClick={handleDelete}><Trash2 className="h-4 w-4" /></Button>
          </>
        )}
      </div>

      <div className="flex gap-4 text-xs text-muted-foreground">
        <span>Creado: {new Date(note.created_at).toLocaleDateString("es")}</span>
        <span>Actualizado: {new Date(note.updated_at).toLocaleDateString("es")}</span>
      </div>

      <Separator />

      {editing ? (
        <Textarea
          rows={20}
          className="font-mono text-sm"
          value={form.content ?? note.content}
          onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
        />
      ) : (
        <div className="text-sm whitespace-pre-wrap leading-relaxed">
          {note.content || <span className="text-muted-foreground">(Sin contenido)</span>}
        </div>
      )}
    </div>
  )
}
