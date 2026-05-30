import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { objectivesApi } from '@/services/objectives'
import type { ObjectiveCreate, ObjectiveUpdate, AcceptanceCriteriaCreate, AcceptanceCriteriaUpdate } from '@/types'

export const OBJECTIVES_KEY = ['objectives'] as const

export function useObjectives() {
  return useQuery({ queryKey: OBJECTIVES_KEY, queryFn: objectivesApi.list })
}

export function useObjective(id: number) {
  return useQuery({
    queryKey: [...OBJECTIVES_KEY, id],
    queryFn: () => objectivesApi.get(id),
    enabled: !!id,
  })
}

export function useObjectiveProgress(id: number) {
  return useQuery({
    queryKey: [...OBJECTIVES_KEY, id, 'progress'],
    queryFn: () => objectivesApi.getProgress(id),
    enabled: !!id,
  })
}

export function useCreateObjective() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: ObjectiveCreate) => objectivesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: OBJECTIVES_KEY }),
  })
}

export function useUpdateObjective() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ObjectiveUpdate }) =>
      objectivesApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: OBJECTIVES_KEY }),
  })
}

export function useDeleteObjective() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => objectivesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: OBJECTIVES_KEY }),
  })
}

export function useAddCriteria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ objectiveId, data }: { objectiveId: number; data: AcceptanceCriteriaCreate }) =>
      objectivesApi.addCriteria(objectiveId, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: OBJECTIVES_KEY }),
  })
}

export function useUpdateCriteria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: AcceptanceCriteriaUpdate }) =>
      objectivesApi.updateCriteria(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: OBJECTIVES_KEY }),
  })
}

export function useDeleteCriteria() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => objectivesApi.deleteCriteria(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: OBJECTIVES_KEY }),
  })
}
