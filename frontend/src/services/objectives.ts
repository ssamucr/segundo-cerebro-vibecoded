import api from './api'
import type {
  Objective,
  ObjectiveCreate,
  ObjectiveUpdate,
  ObjectiveProgress,
  AcceptanceCriteria,
  AcceptanceCriteriaCreate,
  AcceptanceCriteriaUpdate,
} from '@/types'

export const objectivesApi = {
  list: () => api.get<Objective[]>('/objectives').then((r) => r.data),
  get: (id: number) => api.get<Objective>(`/objectives/${id}`).then((r) => r.data),
  create: (data: ObjectiveCreate) => api.post<Objective>('/objectives', data).then((r) => r.data),
  update: (id: number, data: ObjectiveUpdate) =>
    api.put<Objective>(`/objectives/${id}`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/objectives/${id}`),
  getProgress: (id: number) =>
    api.get<ObjectiveProgress>(`/objectives/${id}/progress`).then((r) => r.data),

  // Criteria
  addCriteria: (objectiveId: number, data: AcceptanceCriteriaCreate) =>
    api.post<AcceptanceCriteria>(`/objectives/${objectiveId}/criteria`, data).then((r) => r.data),
  updateCriteria: (criteriaId: number, data: AcceptanceCriteriaUpdate) =>
    api.put<AcceptanceCriteria>(`/criteria/${criteriaId}`, data).then((r) => r.data),
  deleteCriteria: (criteriaId: number) => api.delete(`/criteria/${criteriaId}`),
}
