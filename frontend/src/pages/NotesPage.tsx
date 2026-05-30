import { useState } from "react"
import { Link } from "react-router-dom"
import { useNotes, useCreateNote, useDeleteNote } from "@/hooks/useNotes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Trash2, FileText } from "lucide-react"
import type { NoteCreate } from "@/types"

export function NotesPage() {
  const { data: notes = [], isLoading } = useNotes()
  const createNote = useCreateNote()
  const deleteNote = useDeleteNote()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<NoteCreate>({ title: "", content: "" })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createNote.mutate(form, { onSuccess: () => { setOpen(false); setForm({ title: "", content: "" }) } })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Notas</h1>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" />Nueva nota</Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Cargando...</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {notes.map((note) => (
          <Card key={note.id} className="hover:shadow-md transition-shadow group">
            <CardHeader className="pb-2">
              <div className="flex items-start gap-2">
                <FileText className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                <CardTitle className="text-sm font-semibold line-clamp-2">{note.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground line-clamp-3">{note.content || "(Sin contenido)"}</p>
              <p className="text-xs text-muted-foreground">{new Date(note.created_at).toLocaleDateString("es")}</p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1 text-xs">
                  <Link to={`/notes/${note.id}`}>Abrir</Link>
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => deleteNote.mutate(note.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {notes.length === 0 && !isLoading && (
          <p className="text-muted-foreground text-sm col-span-full">Sin notas aún.</p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nueva nota</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Título</Label><Input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Contenido</Label><Textarea rows={6} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createNote.isPending}>Crear</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
