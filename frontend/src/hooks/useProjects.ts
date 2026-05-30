import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { projectsApi } from '@/services/projects'
import type { ProjectCreate, ProjectUpdate, ProjectStatusUpdate } from '@/types'

export const PROJECTS_KEY = ['projects'] as const

export function useProjects(objectiveId?: number) {
  return useQuery({
    queryKey: objectiveId ? [...PROJECTS_KEY, { objectiveId }] : PROJECTS_KEY,
    queryFn: () => projectsApi.list(objectiveId),
  })
}

export function useProject(id: number) {
  return useQuery({
    queryKey: [...PROJECTS_KEY, id],
    queryFn: () => projectsApi.get(id),
    enabled: !!id,
  })
}

export function useCreateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ProjectCreate) => projectsApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  })
}

export function useUpdateProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProjectUpdate }) =>
      projectsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  })
}

export function useUpdateProjectStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProjectStatusUpdate }) =>
      projectsApi.updateStatus(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  })
}

export function useDeleteProject() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => projectsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROJECTS_KEY }),
  })
}
