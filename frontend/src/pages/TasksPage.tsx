import { useState } from "react"
import { Link } from "react-router-dom"
import { useTasks } from "@/hooks/useTasks"
import { useProjects } from "@/hooks/useProjects"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { taskStatusLabel, taskStatusVariant, difficultyLabel, difficultyVariant } from "@/lib/labels"
import { Eye } from "lucide-react"
import type { TaskStatus, Difficulty } from "@/types"

export function TasksPage() {
  const { data: tasks = [], isLoading } = useTasks()
  const { data: projects = [] } = useProjects()
  const [filterStatus, setFilterStatus] = useState<TaskStatus | "all">("all")
  const [filterDifficulty, setFilterDifficulty] = useState<Difficulty | "all">("all")
  const [search, setSearch] = useState("")

  const filtered = tasks.filter((t) => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false
    if (filterDifficulty !== "all" && t.difficulty !== filterDifficulty) return false
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Tareas</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Input placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} className="w-48" />
        <Select value={filterStatus} onValueChange={v => setFilterStatus(v as typeof filterStatus)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Estado" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            <SelectItem value="backlog">Backlog</SelectItem>
            <SelectItem value="in_progress">En curso</SelectItem>
            <SelectItem value="blocked">Bloqueada</SelectItem>
            <SelectItem value="completed">Completada</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterDifficulty} onValueChange={v => setFilterDifficulty(v as typeof filterDifficulty)}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Dificultad" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toda dificultad</SelectItem>
            <SelectItem value="low">Baja</SelectItem>
            <SelectItem value="medium">Media</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading && <p className="text-muted-foreground">Cargando...</p>}

      <div className="space-y-2">
        {filtered.map((t) => {
          const project = projects.find(p => p.id === t.project_id)
          return (
            <Card key={t.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="py-3 px-4 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{t.title}</p>
                  {project && <p className="text-xs text-muted-foreground">Proyecto: {project.title || "(Sin título)"}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {t.difficulty && <Badge variant={difficultyVariant[t.difficulty]}>{difficultyLabel[t.difficulty]}</Badge>}
                  <Badge variant={taskStatusVariant[t.status]}>{taskStatusLabel[t.status]}</Badge>
                  {t.deadline && <span className="text-xs text-muted-foreground hidden sm:block">{new Date(t.deadline).toLocaleDateString("es")}</span>}
                  <Button variant="ghost" size="icon" asChild className="h-7 w-7">
                    <Link to={`/tasks/${t.id}`}><Eye className="h-3.5 w-3.5" /></Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
        {filtered.length === 0 && !isLoading && <p className="text-muted-foreground text-sm">Sin tareas.</p>}
      </div>
    </div>
  )
}
