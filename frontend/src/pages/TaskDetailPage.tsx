import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import { useTask, useUpdateTask, useUpdateTaskStatus, useDeleteTask } from "@/hooks/useTasks"
import { useProject } from "@/hooks/useProjects"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { taskStatusLabel, taskStatusVariant, difficultyLabel, difficultyVariant } from "@/lib/labels"
import { ArrowLeft, Pencil, Check, X } from "lucide-react"
import type { TaskUpdate, TaskStatus, Difficulty } from "@/types"

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const taskId = Number(id)
  const { data: task, isLoading } = useTask(taskId)
  const { data: project } = useProject(task?.project_id ?? 0)
  const updateTask = useUpdateTask()
  const updateStatus = useUpdateTaskStatus()
  const deleteTask = useDeleteTask()

  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<TaskUpdate>({})

  if (isLoading) return <div className="p-6">Cargando...</div>
  if (!task) return <div className="p-6">Tarea no encontrada.</div>

  function handleSave() {
    updateTask.mutate({ id: taskId, data: form }, { onSuccess: () => setEditing(false) })
  }

  return (
    <div className="p-6 space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/tasks"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        {editing ? (
          <Input
            className="flex-1 text-xl font-bold"
            value={form.title ?? task.title}
            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          />
        ) : (
          <h1 className="text-2xl font-bold flex-1">{task.title}</h1>
        )}
        {editing ? (
          <>
            <Button size="icon" onClick={handleSave} disabled={updateTask.isPending}><Check className="h-4 w-4" /></Button>
            <Button size="icon" variant="outline" onClick={() => { setEditing(false); setForm({}) }}><X className="h-4 w-4" /></Button>
          </>
        ) : (
          <Button size="icon" variant="ghost" onClick={() => { setEditing(true); setForm({}) }}><Pencil className="h-4 w-4" /></Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Badge variant={taskStatusVariant[task.status]}>{taskStatusLabel[task.status]}</Badge>
        {task.difficulty && <Badge variant={difficultyVariant[task.difficulty]}>{difficultyLabel[task.difficulty]}</Badge>}
      </div>

      {/* Status change */}
      <div className="flex items-center gap-3">
        <Label className="text-sm shrink-0">Cambiar estado:</Label>
        <Select value={task.status} onValueChange={v => updateStatus.mutate({ id: taskId, data: { status: v as TaskStatus } })}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="backlog">Backlog</SelectItem>
            <SelectItem value="in_progress">En curso</SelectItem>
            <SelectItem value="blocked">Bloqueada</SelectItem>
            <SelectItem value="completed">Completada</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Separator />

      <div className="space-y-4">
        {project && (
          <div>
            <Label className="text-muted-foreground text-xs">Proyecto</Label>
            <p><Link to={`/projects/${project.id}`} className="hover:underline text-sm font-medium">{project.title || "(Sin título)"}</Link></p>
          </div>
        )}

        <div>
          <Label className="text-muted-foreground text-xs">Descripción</Label>
          {editing ? (
            <Textarea rows={4} value={form.description ?? task.description ?? ""} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          ) : (
            <p className="text-sm mt-1">{task.description || <span className="text-muted-foreground">Sin descripción</span>}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground text-xs">Dificultad</Label>
            {editing ? (
              <Select value={form.difficulty ?? task.difficulty ?? ""} onValueChange={v => setForm(f => ({ ...f, difficulty: v as Difficulty }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baja</SelectItem>
                  <SelectItem value="medium">Media</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm mt-1">{task.difficulty ? difficultyLabel[task.difficulty] : <span className="text-muted-foreground">—</span>}</p>
            )}
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Horas estimadas</Label>
            {editing ? (
              <Input type="number" step="0.5" value={form.duration_hours ?? task.duration_hours ?? ""} onChange={e => setForm(f => ({ ...f, duration_hours: Number(e.target.value) }))} />
            ) : (
              <p className="text-sm mt-1">{task.duration_hours ?? <span className="text-muted-foreground">—</span>}</p>
            )}
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Fecha límite</Label>
            {editing ? (
              <Input type="date" value={form.deadline as unknown as string ?? (task.deadline ? String(task.deadline) : "")} onChange={e => setForm(f => ({ ...f, deadline: e.target.value as unknown as Date }))} />
            ) : (
              <p className="text-sm mt-1">{task.deadline ? new Date(task.deadline).toLocaleDateString("es") : <span className="text-muted-foreground">—</span>}</p>
            )}
          </div>
        </div>

        <div className="flex gap-4 text-xs text-muted-foreground pt-2">
          <span>Creado: {new Date(task.created_at).toLocaleDateString("es")}</span>
          <span>Actualizado: {new Date(task.updated_at).toLocaleDateString("es")}</span>
        </div>
      </div>
    </div>
  )
}
