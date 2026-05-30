import { useState } from "react"
import { Link } from "react-router-dom"
import { useObjectives, useCreateObjective, useDeleteObjective } from "@/hooks/useObjectives"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { objectiveStatusLabel, objectiveStatusVariant } from "@/lib/labels"
import { Plus, Trash2, Eye } from "lucide-react"
import type { ObjectiveCreate } from "@/types"

export function ObjectivesPage() {
  const { data: objectives = [], isLoading } = useObjectives()
  const createObjective = useCreateObjective()
  const deleteObjective = useDeleteObjective()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<ObjectiveCreate>({ title: "", description: "", deadline: "", status: "active" } as unknown as ObjectiveCreate)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createObjective.mutate(form, { onSuccess: () => { setOpen(false); setForm({ title: "", description: "", deadline: "", status: "active" } as unknown as ObjectiveCreate) } })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Objetivos</h1>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" />Nuevo objetivo</Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Cargando...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {objectives.map((obj) => (
          <Card key={obj.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{obj.title}</CardTitle>
                <Badge variant={objectiveStatusVariant[obj.status]}>{objectiveStatusLabel[obj.status]}</Badge>
              </div>
              {obj.description && <p className="text-sm text-muted-foreground line-clamp-2">{obj.description}</p>}
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Criterios: {obj.criteria.filter(c => c.is_met).length}/{obj.criteria.length}</span>
                  <span>Vence: {new Date(obj.deadline).toLocaleDateString("es")}</span>
                </div>
                <Progress value={obj.criteria.length ? (obj.criteria.filter(c => c.is_met).length / obj.criteria.length) * 100 : 0} />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild className="flex-1">
                  <Link to={`/objectives/${obj.id}`}><Eye className="h-3 w-3 mr-1" />Ver</Link>
                </Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteObjective.mutate(obj.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo objetivo</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><Label>Título</Label><Input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Descripción</Label><Textarea rows={3} value={form.description ?? ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div><Label>Fecha límite</Label><Input required type="date" value={form.deadline as unknown as string} onChange={e => setForm(f => ({ ...f, deadline: e.target.value as unknown as typeof f.deadline }))} /></div>
            <div><Label>Estado</Label>
              <Select value={form.status} onValueChange={v => setForm(f => ({ ...f, status: v as typeof f.status }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Activo</SelectItem>
                  <SelectItem value="completed">Completado</SelectItem>
                  <SelectItem value="abandoned">Abandonado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createObjective.isPending}>Crear</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
