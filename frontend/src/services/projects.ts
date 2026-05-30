import api from './api'
import type { Project, ProjectCreate, ProjectUpdate, ProjectStatusUpdate } from '@/types'

export const projectsApi = {
  list: (objectiveId?: number) =>
    api
      .get<Project[]>('/projects', { params: objectiveId ? { objective_id: objectiveId } : {} })
      .then((r) => r.data),
  get: (id: number) => api.get<Project>(`/projects/${id}`).then((r) => r.data),
  create: (data: ProjectCreate) => api.post<Project>('/projects', data).then((r) => r.data),
  update: (id: number, data: ProjectUpdate) =>
    api.put<Project>(`/projects/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/projects/${id}`),
  updateStatus: (id: number, data: ProjectStatusUpdate) =>
    api.patch<Project>(`/projects/${id}/status`, data).then((r) => r.data),
}
