import { Link } from "react-router-dom"
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, useDroppable, useDraggable,
} from "@dnd-kit/core"
import { useState } from "react"
import { useTasks, useUpdateTaskStatus } from "@/hooks/useTasks"
import { useProjects } from "@/hooks/useProjects"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { taskStatusLabel, taskStatusVariant, difficultyVariant, difficultyLabel } from "@/lib/labels"
import type { Task, TaskStatus } from "@/types"

const STATUSES: TaskStatus[] = ["backlog", "in_progress", "blocked", "completed"]

function DroppableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-45 rounded-lg border-2 transition-colors p-2 min-h-50 ${isOver ? "border-primary bg-primary/5" : "border-border bg-muted/30"}`}
    >
      {children}
    </div>
  )
}

function DraggableTaskCard({ task, projectName }: { task: Task; projectName?: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: task.id })
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className={`cursor-grab active:cursor-grabbing ${isDragging ? "opacity-40" : ""}`}>
      <Card className="mb-2 hover:shadow-sm transition-shadow">
        <CardContent className="py-2 px-3 space-y-1">
          <Link to={`/tasks/${task.id}`} className="font-medium text-sm hover:underline block" onClick={e => e.stopPropagation()}>
            {task.title}
          </Link>
          {projectName && <p className="text-xs text-muted-foreground truncate">{projectName}</p>}
          {task.difficulty && (
            <Badge variant={difficultyVariant[task.difficulty]} className="text-xs">{difficultyLabel[task.difficulty]}</Badge>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function TasksBoardPage() {
  const { data: tasks = [] } = useTasks()
  const { data: projects = [] } = useProjects()
  const updateStatus = useUpdateTaskStatus()
  const [activeId, setActiveId] = useState<number | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as number)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over) return
    const task = tasks.find(t => t.id === active.id)
    if (!task) return
    const newStatus = over.id as TaskStatus
    if (newStatus === task.status) return
    updateStatus.mutate({ id: task.id, data: { status: newStatus } })
  }

  const activeTask = tasks.find(t => t.id === activeId)

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Board de Tareas</h1>
      <p className="text-sm text-muted-foreground">Arrastra las tareas entre columnas para cambiar su estado.</p>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUSES.map(status => (
            <div key={status} className="flex flex-col gap-2 min-w-50">
              <div className="flex items-center gap-2 px-1">
                <Badge variant={taskStatusVariant[status]}>{taskStatusLabel[status]}</Badge>
                <span className="text-xs text-muted-foreground">
                  ({tasks.filter(t => t.status === status).length})
                </span>
              </div>
              <DroppableColumn id={status}>
                {tasks
                  .filter(t => t.status === status)
                  .map(t => (
                    <DraggableTaskCard
                      key={t.id}
                      task={t}
                      projectName={projects.find(p => p.id === t.project_id)?.title}
                    />
                  ))}
              </DroppableColumn>
            </div>
          ))}
        </div>
        <DragOverlay>
          {activeTask && (
            <Card className="shadow-xl opacity-90 w-48">
              <CardContent className="py-2 px-3">
                <p className="font-medium text-sm">{activeTask.title}</p>
              </CardContent>
            </Card>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
