import { Link } from "react-router-dom"
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  PointerSensor, useSensor, useSensors, useDroppable, useDraggable,
} from "@dnd-kit/core"
import { useState } from "react"
import { useProjects, useUpdateProjectStatus } from "@/hooks/useProjects"
import { useObjectives } from "@/hooks/useObjectives"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { projectStatusLabel, projectStatusVariant } from "@/lib/labels"
import type { Project, ProjectStatus } from "@/types"

const STATUSES: ProjectStatus[] = ["backlog", "in_progress", "stopped", "completed"]

function DroppableColumn({ status, children }: { status: ProjectStatus; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  return (
    <div
      ref={setNodeRef}
      className={`flex-1 min-w-45 rounded-lg border-2 transition-colors p-2 min-h-50 ${isOver ? "border-primary bg-primary/5" : "border-border bg-muted/30"}`}
    >
      {children}
    </div>
  )
}

function DraggableCard({ project, objectiveName }: { project: Project; objectiveName?: string }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: project.id })
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className={`cursor-grab active:cursor-grabbing ${isDragging ? "opacity-40" : ""}`}>
      <Card className="mb-2 hover:shadow-sm transition-shadow">
        <CardContent className="py-2 px-3">
          <Link to={`/projects/${project.id}`} className="font-medium text-sm hover:underline block" onClick={e => e.stopPropagation()}>
            {project.title || "(Sin título)"}
          </Link>
          {objectiveName && <p className="text-xs text-muted-foreground mt-0.5 truncate">{objectiveName}</p>}
        </CardContent>
      </Card>
    </div>
  )
}

export function ProjectsBoardPage() {
  const { data: projects = [] } = useProjects()
  const { data: objectives = [] } = useObjectives()
  const updateStatus = useUpdateProjectStatus()
  const [activeId, setActiveId] = useState<number | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as number)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over) return
    const project = projects.find(p => p.id === active.id)
    if (!project) return
    const newStatus = over.id as ProjectStatus
    if (newStatus === project.status) return

    // Only allow valid transitions
    const validFrom: Record<ProjectStatus, ProjectStatus[]> = {
      backlog: ["in_progress"],
      in_progress: ["stopped", "completed"],
      stopped: ["in_progress", "completed"],
      completed: [],
    }
    if (!validFrom[project.status]?.includes(newStatus)) return

    // Simplified: pass minimal required fields; backend will validate
    const payload: Record<string, unknown> = { status: newStatus }
    if (newStatus === "in_progress") {
      payload.start_date = project.start_date ?? new Date().toISOString().slice(0, 10)
      payload.estimated_end_date = project.estimated_end_date ?? new Date().toISOString().slice(0, 10)
    }
    if (newStatus === "stopped") payload.stop_reason = "Movido desde el board"
    if (newStatus === "completed") {
      payload.actual_end_date = new Date().toISOString().slice(0, 10)
      payload.resolution = "Completado desde el board"
    }
    updateStatus.mutate({ id: project.id, data: payload as Parameters<typeof updateStatus.mutate>[0]["data"] })
  }

  const activeProject = projects.find(p => p.id === activeId)

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Board de Proyectos</h1>
      <p className="text-sm text-muted-foreground">Arrastra los proyectos entre columnas para cambiar su estado.</p>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUSES.map(status => (
            <div key={status} className="flex flex-col gap-2 min-w-50">
              <div className="flex items-center gap-2 px-1">
                <Badge variant={projectStatusVariant[status]}>{projectStatusLabel[status]}</Badge>
                <span className="text-xs text-muted-foreground">
                  ({projects.filter(p => p.status === status).length})
                </span>
              </div>
              <DroppableColumn status={status}>
                {projects
                  .filter(p => p.status === status)
                  .map(p => (
                    <DraggableCard
                      key={p.id}
                      project={p}
                      objectiveName={objectives.find(o => o.id === p.objective_id)?.title}
                    />
                  ))}
              </DroppableColumn>
            </div>
          ))}
        </div>
        <DragOverlay>
          {activeProject && (
            <Card className="shadow-xl opacity-90 w-48">
              <CardContent className="py-2 px-3">
                <p className="font-medium text-sm">{activeProject.title || "(Sin título)"}</p>
              </CardContent>
            </Card>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
