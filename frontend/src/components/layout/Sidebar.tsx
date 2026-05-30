import { NavLink } from 'react-router-dom'
import {
  Target,
  FolderKanban,
  CheckSquare,
  StickyNote,
  LayoutDashboard,
  Columns2,
  Brain,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/objectives', label: 'Objetivos', icon: Target },
  { to: '/projects', label: 'Proyectos', icon: FolderKanban },
  { to: '/tasks', label: 'Tareas', icon: CheckSquare },
  { to: '/notes', label: 'Notas', icon: StickyNote },
  { to: '/board/projects', label: 'Board Proyectos', icon: Columns2 },
  { to: '/board/tasks', label: 'Board Tareas', icon: Columns2 },
]

export function Sidebar() {
  return (
    <aside className="flex h-screen w-60 flex-col border-r border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <Brain className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold">Segundo Cerebro</span>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
