import api from './api'
import type { Task, TaskCreate, TaskUpdate, TaskStatusUpdate } from '@/types'

export const tasksApi = {
  list: (projectId?: number) =>
    api
      .get<Task[]>('/tasks', { params: projectId ? { project_id: projectId } : {} })
      .then((r) => r.data),
  get: (id: number) => api.get<Task>(`/tasks/${id}`).then((r) => r.data),
  create: (data: TaskCreate) => api.post<Task>('/tasks', data).then((r) => r.data),
  update: (id: number, data: TaskUpdate) =>
    api.put<Task>(`/tasks/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/tasks/${id}`),
  updateStatus: (id: number, data: TaskStatusUpdate) =>
    api.patch<Task>(`/tasks/${id}/status`, data).then((r) => r.data),
}
