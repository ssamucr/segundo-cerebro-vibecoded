import type { ObjectiveStatus, ProjectStatus, TaskStatus, Difficulty } from "@/types"
import type { BadgeProps } from "@/components/ui/badge"

// ─── Objective ───────────────────────────────────────────────────────────────
export const objectiveStatusLabel: Record<ObjectiveStatus, string> = {
  active: "Activo",
  completed: "Completado",
  abandoned: "Abandonado",
}

export const objectiveStatusVariant: Record<ObjectiveStatus, BadgeProps["variant"]> = {
  active: "info",
  completed: "success",
  abandoned: "secondary",
}

// ─── Project ─────────────────────────────────────────────────────────────────
export const projectStatusLabel: Record<ProjectStatus, string> = {
  backlog: "Backlog",
  in_progress: "En curso",
  stopped: "Detenido",
  completed: "Completado",
}

export const projectStatusVariant: Record<ProjectStatus, BadgeProps["variant"]> = {
  backlog: "secondary",
  in_progress: "info",
  stopped: "warning",
  completed: "success",
}

// ─── Task ─────────────────────────────────────────────────────────────────────
export const taskStatusLabel: Record<TaskStatus, string> = {
  backlog: "Backlog",
  in_progress: "En curso",
  blocked: "Bloqueada",
  completed: "Completada",
}

export const taskStatusVariant: Record<TaskStatus, BadgeProps["variant"]> = {
  backlog: "secondary",
  in_progress: "info",
  blocked: "destructive",
  completed: "success",
}

// ─── Difficulty ───────────────────────────────────────────────────────────────
export const difficultyLabel: Record<Difficulty, string> = {
  high: "Alta",
  medium: "Media",
  low: "Baja",
}

export const difficultyVariant: Record<Difficulty, BadgeProps["variant"]> = {
  high: "destructive",
  medium: "warning",
  low: "success",
}
