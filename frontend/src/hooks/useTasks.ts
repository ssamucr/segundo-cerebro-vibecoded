import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi } from '@/services/tasks'
import type { TaskCreate, TaskUpdate, TaskStatusUpdate } from '@/types'

export const TASKS_KEY = ['tasks'] as const

export function useTasks(projectId?: number) {
  return useQuery({
    queryKey: projectId ? [...TASKS_KEY, { projectId }] : TASKS_KEY,
    queryFn: () => tasksApi.list(projectId),
  })
}

export function useTask(id: number) {
  return useQuery({
    queryKey: [...TASKS_KEY, id],
    queryFn: () => tasksApi.get(id),
    enabled: !!id,
  })
}

export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: TaskCreate) => tasksApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  })
}

export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskUpdate }) => tasksApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  })
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: TaskStatusUpdate }) =>
      tasksApi.updateStatus(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  })
}

export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => tasksApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: TASKS_KEY }),
  })
}
