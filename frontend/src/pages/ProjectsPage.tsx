import { useState } from "react"
import { Link, useSearchParams } from "react-router-dom"
import { useProjects, useCreateProject, useDeleteProject } from "@/hooks/useProjects"
import { useObjectives } from "@/hooks/useObjectives"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { projectStatusLabel, projectStatusVariant } from "@/lib/labels"
import { Plus, Trash2, Eye } from "lucide-react"
import type { ProjectCreate } from "@/types"

export function ProjectsPage() {
  const [searchParams] = useSearchParams()
  const objectiveIdParam = searchParams.get("objectiveId") ? Number(searchParams.get("objectiveId")) : undefined
  const { data: projects = [], isLoading } = useProjects(objectiveIdParam)
  const { data: objectives = [] } = useObjectives()
  const createProject = useCreateProject()
  const deleteProject = useDeleteProject()
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<ProjectCreate>({ title: "", description: "", objective_id: objectiveIdParam ?? 0 })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    createProject.mutate(form, { onSuccess: () => { setOpen(false); setForm({ title: "", description: "", objective_id: 0 }) } })
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Proyectos</h1>
        <Button onClick={() => setOpen(true)}><Plus className="h-4 w-4 mr-1" />Nuevo proyecto</Button>
      </div>

      {isLoading && <p className="text-muted-foreground">Cargando...</p>}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects.map((p) => {
          const obj = objectives.find(o => o.id === p.objective_id)
          return (
            <Card key={p.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="text-base">{p.title || "(Sin título)"}</CardTitle>
                  <Badge variant={projectStatusVariant[p.status]}>{projectStatusLabel[p.status]}</Badge>
                </div>
                {obj && <p className="text-xs text-muted-foreground">Objetivo: {obj.title}</p>}
                {p.description && <p className="text-sm text-muted-foreground line-clamp-2">{p.description}</p>}
              </CardHeader>
              <CardContent className="space-y-2">
                {p.estimated_end_date && (
                  <p className="text-xs text-muted-foreground">Estimado: {new Date(p.estimated_end_date).toLocaleDateString("es")}</p>
                )}
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild className="flex-1">
                    <Link to={`/projects/${p.id}`}><Eye className="h-3 w-3 mr-1" />Ver</Link>
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => deleteProject.mutate(p.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nuevo proyecto</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Objetivo</Label>
              <Select required value={String(form.objective_id || "")} onValueChange={v => setForm(f => ({ ...f, objective_id: Number(v) }))}>
                <SelectTrigger><SelectValue placeholder="Selecciona un objetivo" /></SelectTrigger>
                <SelectContent>
                  {objectives.map(o => <SelectItem key={o.id} value={String(o.id)}>{o.title}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Título</Label><Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Descripción</Label><Textarea rows={3} value={form.description ?? ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createProject.isPending || !form.objective_id}>Crear</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
