import { useObjectives } from "@/hooks/useObjectives"
import { useProjects } from "@/hooks/useProjects"
import { useTasks } from "@/hooks/useTasks"
import { useNotes } from "@/hooks/useNotes"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, FolderKanban, CheckSquare, FileText } from "lucide-react"

export function DashboardPage() {
  const { data: objectives = [] } = useObjectives()
  const { data: projects = [] } = useProjects()
  const { data: tasks = [] } = useTasks()
  const { data: notes = [] } = useNotes()

  const stats = [
    { label: "Objetivos activos", value: objectives.filter((o) => o.status === "active").length, total: objectives.length, icon: Target, color: "text-blue-500" },
    { label: "Proyectos en curso", value: projects.filter((p) => p.status === "in_progress").length, total: projects.length, icon: FolderKanban, color: "text-purple-500" },
    { label: "Tareas pendientes", value: tasks.filter((t) => t.status !== "completed").length, total: tasks.length, icon: CheckSquare, color: "text-orange-500" },
    { label: "Notas", value: notes.length, total: notes.length, icon: FileText, color: "text-green-500" },
  ]

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{s.label}</CardTitle>
              <s.icon className={`h-5 w-5 ${s.color}`} />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{s.value}</p>
              {s.total !== s.value && <p className="text-xs text-muted-foreground mt-1">de {s.total} total</p>}
            </CardContent>
          </Card>
        ))}
      </div>
      {tasks.filter((t) => t.status === "blocked").length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3 text-destructive">Tareas bloqueadas</h2>
          <div className="space-y-2">
            {tasks.filter((t) => t.status === "blocked").map((t) => (
              <Card key={t.id} className="border-destructive/40">
                <CardContent className="py-3 px-4"><p className="font-medium">{t.title}</p></CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


