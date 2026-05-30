import { useState } from "react"
import { useParams, Link } from "react-router-dom"
import {
  useObjective, useObjectiveProgress, useUpdateObjective,
  useAddCriteria, useUpdateCriteria, useDeleteCriteria,
} from "@/hooks/useObjectives"
import { useProjects } from "@/hooks/useProjects"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { objectiveStatusLabel, objectiveStatusVariant, projectStatusLabel, projectStatusVariant } from "@/lib/labels"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"

export function ObjectiveDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: obj, isLoading } = useObjective(Number(id))
  const { data: progress } = useObjectiveProgress(Number(id))
  const { data: projects = [] } = useProjects(Number(id))
  const updateObjective = useUpdateObjective()
  const addCriteria = useAddCriteria()
  const updateCriteria = useUpdateCriteria()
  const deleteCriteria = useDeleteCriteria()

  const [newCriteria, setNewCriteria] = useState("")

  if (isLoading) return <div className="p-6">Cargando...</div>
  if (!obj) return <div className="p-6">Objetivo no encontrado.</div>

  function handleAddCriteria(e: React.FormEvent) {
    e.preventDefault()
    if (!newCriteria.trim()) return
    addCriteria.mutate({ objectiveId: Number(id), data: { description: newCriteria } }, {
      onSuccess: () => setNewCriteria(""),
    })
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/objectives"><ArrowLeft className="h-4 w-4" /></Link>
        </Button>
        <h1 className="text-2xl font-bold flex-1">{obj.title}</h1>
        <Badge variant={objectiveStatusVariant[obj.status]}>{objectiveStatusLabel[obj.status]}</Badge>
      </div>

      {obj.description && <p className="text-muted-foreground">{obj.description}</p>}

      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span>Vence: <strong className="text-foreground">{new Date(obj.deadline).toLocaleDateString("es")}</strong></span>
        {progress && <span>Progreso: <strong className="text-foreground">{progress.progress}%</strong></span>}
      </div>

      {progress && <Progress value={progress.progress} className="h-3" />}

      <Separator />

      {/* Criteria */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Criterios de aceptación</h2>
        <div className="space-y-2">
          {obj.criteria.map((c) => (
            <div key={c.id} className="flex items-center gap-3 group">
              <Checkbox
                checked={c.is_met}
                onCheckedChange={(checked) =>
                  updateCriteria.mutate({ criteriaId: c.id, data: { is_met: !!checked } })
                }
              />
              <span className={`flex-1 text-sm ${c.is_met ? "line-through text-muted-foreground" : ""}`}>
                {c.description}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive h-7 w-7"
                onClick={() => deleteCriteria.mutate(c.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddCriteria} className="flex gap-2">
          <Input
            placeholder="Agregar criterio..."
            value={newCriteria}
            onChange={(e) => setNewCriteria(e.target.value)}
            className="flex-1"
          />
          <Button type="submit" size="sm" disabled={addCriteria.isPending}>
            <Plus className="h-4 w-4" />
          </Button>
        </form>
      </div>

      <Separator />

      {/* Related Projects */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Proyectos</h2>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/projects?objectiveId=${id}`}><Plus className="h-3 w-3 mr-1" />Ver todos</Link>
          </Button>
        </div>
        <div className="space-y-2">
          {projects.map((p) => (
            <Card key={p.id} className="hover:shadow-sm transition-shadow">
              <CardHeader className="py-3 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium">
                    <Link to={`/projects/${p.id}`} className="hover:underline">{p.title || "(Sin título)"}</Link>
                  </CardTitle>
                  <Badge variant={projectStatusVariant[p.status]}>{projectStatusLabel[p.status]}</Badge>
                </div>
              </CardHeader>
            </Card>
          ))}
          {projects.length === 0 && <p className="text-sm text-muted-foreground">Sin proyectos aún.</p>}
        </div>
      </div>
    </div>
  )
}
