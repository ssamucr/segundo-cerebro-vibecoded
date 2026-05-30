import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useProject, useUpdateProjectStatus, useDeleteProject } from "@/hooks/useProjects"
import { useTasks, useCreateTask, useDeleteTask } from "@/hooks/useTasks"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { projectStatusLabel, projectStatusVariant, taskStatusLabel, taskStatusVariant, difficultyLabel, difficultyVariant } from "@/lib/labels"
import { ArrowLeft, Plus, Trash2, Eye } from "lucide-react"
import type { ProjectStatusUpdate, TaskCreate } from "@/types"

type TransitionModal = "to_in_progress" | "to_stopped" | "to_completed" | null

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const projectId = Number(id)
  const { data: project, isLoading } = useProject(projectId)
  const { data: tasks = [] } = useTasks(projectId)
  const updateStatus = useUpdateProjectStatus()
  const deleteProject = useDeleteProject()
  const createTask = useCreateTask()
  const deleteTask = useDeleteTask()

  const [transitionModal, setTransitionModal] = useState<TransitionModal>(null)
  const [transitionForm, setTransitionForm] = useState<Partial<ProjectStatusUpdate>>({})
  const [taskOpen, setTaskOpen] = useState(false)
  const [taskForm, setTaskForm] = useState<TaskCreate>({ title: "", project_id: projectId })

  if (isLoading) return <div className="p-6">Cargando...</div>
  if (!project) return <div className="p-6">Proyecto no encontrado.</div>

  function submitTransition(status: ProjectStatusUpdate["status"]) {
    updateStatus.mutate({ id: projectId, data: { ...transitionForm, status } as ProjectStatusUpdate }, {
      onSuccess: () => { setTransitionModal(null); setTransitionForm({}) },
    })
  }

  function handleCreateTask(e: React.FormEvent) {
    e.preventDefault()
    createTask.mutate(taskForm, { onSuccess: () => { setTaskOpen(false); setTaskForm({ title: "", project_id: projectId }) } })
  }

  const canStart = project.status === "backlog"
  const canStop = project.status === "in_progress"
  const canResume = project.status === "stopped"
  const canComplete = project.status === "in_progress" || project.status === "stopped"

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/projects"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold flex-1">{project.title || "(Sin título)"}</h1>
        <Badge variant={projectStatusVariant[project.status]}>{projectStatusLabel[project.status]}</Badge>
      </div>

      {project.description && <p className="text-muted-foreground">{project.description}</p>}

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
        {project.start_date && <span>Inicio: <strong className="text-foreground">{new Date(project.start_date).toLocaleDateString("es")}</strong></span>}
        {project.estimated_end_date && <span>Estimado: <strong className="text-foreground">{new Date(project.estimated_end_date).toLocaleDateString("es")}</strong></span>}
        {project.actual_end_date && <span>Finalizado: <strong className="text-foreground">{new Date(project.actual_end_date).toLocaleDateString("es")}</strong></span>}
        {project.stop_reason && <span>Motivo de detención: <strong className="text-foreground">{project.stop_reason}</strong></span>}
        {project.resolution && <span>Resolución: <strong className="text-foreground">{project.resolution}</strong></span>}
      </div>

      {/* State machine buttons */}
      <div className="flex flex-wrap gap-2">
        {canStart && <Button size="sm" onClick={() => setTransitionModal("to_in_progress")}>Iniciar proyecto</Button>}
        {canStop && <Button size="sm" variant="secondary" onClick={() => setTransitionModal("to_stopped")}>Detener</Button>}
        {canResume && <Button size="sm" variant="outline" onClick={() => setTransitionModal("to_in_progress")}>Retomar</Button>}
        {canComplete && <Button size="sm" variant="outline" onClick={() => setTransitionModal("to_completed")}>Completar</Button>}
        <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive ml-auto" onClick={() => deleteProject.mutate(projectId)}>
          <Trash2 className="h-4 w-4 mr-1" />Eliminar
        </Button>
      </div>

      <Separator />

      {/* Tasks */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Tareas</h2>
          <Button size="sm" onClick={() => setTaskOpen(true)}><Plus className="h-3 w-3 mr-1" />Nueva tarea</Button>
        </div>
        <div className="space-y-2">
          {tasks.map((t) => (
            <Card key={t.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <div className="flex-1">
                  <Link to={`/tasks/${t.id}`} className="font-medium hover:underline text-sm">{t.title}</Link>
                  {t.difficulty && <span className="ml-2"><Badge variant={difficultyVariant[t.difficulty]}>{difficultyLabel[t.difficulty]}</Badge></span>}
                </div>
                <Badge variant={taskStatusVariant[t.status]}>{taskStatusLabel[t.status]}</Badge>
                <Button variant="ghost" size="icon" asChild className="h-7 w-7">
                  <Link to={`/tasks/${t.id}`}><Eye className="h-3.5 w-3.5" /></Link>
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => deleteTask.mutate(t.id)}>
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </CardContent>
            </Card>
          ))}
          {tasks.length === 0 && <p className="text-sm text-muted-foreground">Sin tareas aún.</p>}
        </div>
      </div>

      {/* Transition modals */}
      <Dialog open={transitionModal === "to_in_progress"} onOpenChange={() => setTransitionModal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Iniciar / retomar proyecto</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Fecha de inicio</Label><Input type="date" onChange={e => setTransitionForm(f => ({ ...f, start_date: e.target.value as unknown as Date }))} /></div>
            <div><Label>Fecha estimada de fin</Label><Input type="date" onChange={e => setTransitionForm(f => ({ ...f, estimated_end_date: e.target.value as unknown as Date }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransitionModal(null)}>Cancelar</Button>
            <Button onClick={() => submitTransition("in_progress")} disabled={updateStatus.isPending}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={transitionModal === "to_stopped"} onOpenChange={() => setTransitionModal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Detener proyecto</DialogTitle></DialogHeader>
          <div><Label>Motivo</Label><Textarea rows={3} onChange={e => setTransitionForm(f => ({ ...f, stop_reason: e.target.value }))} /></div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransitionModal(null)}>Cancelar</Button>
            <Button onClick={() => submitTransition("stopped")} disabled={updateStatus.isPending}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={transitionModal === "to_completed"} onOpenChange={() => setTransitionModal(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Completar proyecto</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Fecha de finalización</Label><Input type="date" onChange={e => setTransitionForm(f => ({ ...f, actual_end_date: e.target.value as unknown as Date }))} /></div>
            <div><Label>Resolución / notas finales</Label><Textarea rows={3} onChange={e => setTransitionForm(f => ({ ...f, resolution: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTransitionModal(null)}>Cancelar</Button>
            <Button onClick={() => submitTransition("completed")} disabled={updateStatus.isPending}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New task modal */}
      <Dialog open={taskOpen} onOpenChange={setTaskOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nueva tarea</DialogTitle></DialogHeader>
          <form onSubmit={handleCreateTask} className="space-y-4">
            <div><Label>Título</Label><Input required value={taskForm.title} onChange={e => setTaskForm(f => ({ ...f, title: e.target.value }))} /></div>
            <div><Label>Descripción</Label><Textarea rows={2} onChange={e => setTaskForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div><Label>Dificultad</Label>
              <Select onValueChange={v => setTaskForm(f => ({ ...f, difficulty: v as typeof f.difficulty }))}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Fecha límite</Label><Input type="date" onChange={e => setTaskForm(f => ({ ...f, deadline: e.target.value as unknown as Date }))} /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setTaskOpen(false)}>Cancelar</Button>
              <Button type="submit" disabled={createTask.isPending}>Crear</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
