// ─── Enums ────────────────────────────────────────────────────────────────────

export type ObjectiveStatus = 'active' | 'completed' | 'abandoned'

export type ProjectStatus = 'backlog' | 'in_progress' | 'stopped' | 'completed'

export type TaskStatus = 'backlog' | 'in_progress' | 'blocked' | 'completed'

export type Difficulty = 'high' | 'medium' | 'low'

// ─── Acceptance Criteria ──────────────────────────────────────────────────────

export interface AcceptanceCriteria {
  id: number
  objective_id: number
  description: string
  is_met: boolean
  created_at: string
}

export interface AcceptanceCriteriaCreate {
  description: string
}

export interface AcceptanceCriteriaUpdate {
  description?: string
  is_met?: boolean
}

// ─── Objective ────────────────────────────────────────────────────────────────

export interface Objective {
  id: number
  title: string
  description: string | null
  deadline: string
  status: ObjectiveStatus
  created_at: string
  updated_at: string
  criteria?: AcceptanceCriteria[]
  progress?: number
}

export interface ObjectiveCreate {
  title: string
  description?: string
  deadline: string
  status?: ObjectiveStatus
}

export interface ObjectiveUpdate {
  title?: string
  description?: string
  deadline?: string
  status?: ObjectiveStatus
}

export interface ObjectiveProgress {
  objective_id: number
  progress: number
  total_criteria: number
  met_criteria: number
  total_projects: number
  completed_projects: number
}

// ─── Project ──────────────────────────────────────────────────────────────────

export interface Project {
  id: number
  objective_id: number
  title: string
  description: string | null
  status: ProjectStatus
  start_date: string | null
  estimated_end_date: string | null
  actual_end_date: string | null
  stop_reason: string | null
  resolution: string | null
  created_at: string
  updated_at: string
  objective?: Pick<Objective, 'id' | 'title'>
  tasks?: Task[]
}

export interface ProjectCreate {
  objective_id: number
  title?: string
  description?: string
}

export interface ProjectUpdate {
  title?: string
  description?: string
  objective_id?: number
}

export interface ProjectStatusUpdate {
  status: ProjectStatus
  // Required for in_progress
  start_date?: string
  estimated_end_date?: string
  // Required for stopped
  stop_reason?: string
  // Required for completed
  actual_end_date?: string
  resolution?: string
}

// ─── Task ─────────────────────────────────────────────────────────────────────

export interface Task {
  id: number
  project_id: number
  title: string
  description: string | null
  duration_hours: number | null
  deadline: string | null
  difficulty: Difficulty | null
  status: TaskStatus
  created_at: string
  updated_at: string
  project?: Pick<Project, 'id' | 'title' | 'objective_id'>
}

export interface TaskCreate {
  project_id: number
  title: string
  description?: string
  duration_hours?: number
  deadline?: string
  difficulty?: Difficulty
}

export interface TaskUpdate {
  title?: string
  description?: string
  duration_hours?: number
  deadline?: string
  difficulty?: Difficulty
  project_id?: number
}

export interface TaskStatusUpdate {
  status: TaskStatus
}

// ─── Note ─────────────────────────────────────────────────────────────────────

export interface Note {
  id: number
  title: string
  content: string
  created_at: string
  updated_at: string
}

export interface NoteCreate {
  title: string
  content: string
}

export interface NoteUpdate {
  title?: string
  content?: string
}

// ─── API ──────────────────────────────────────────────────────────────────────

export interface ApiError {
  detail: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
}
