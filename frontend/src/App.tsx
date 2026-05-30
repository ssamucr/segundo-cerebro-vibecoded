import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { ClerkProvider, SignedIn, SignedOut, RedirectToSignIn, useAuth } from '@clerk/clerk-react'
import { useEffect } from 'react'
import { setTokenGetter } from '@/services/api'
import { AppLayout } from '@/components/layout/AppLayout'
import { DashboardPage } from '@/pages/DashboardPage'
import { ObjectivesPage } from '@/pages/ObjectivesPage'
import { ObjectiveDetailPage } from '@/pages/ObjectiveDetailPage'
import { ProjectsPage } from '@/pages/ProjectsPage'
import { ProjectDetailPage } from '@/pages/ProjectDetailPage'
import { TasksPage } from '@/pages/TasksPage'
import { TaskDetailPage } from '@/pages/TaskDetailPage'
import { NotesPage } from '@/pages/NotesPage'
import { NoteDetailPage } from '@/pages/NoteDetailPage'
import { ProjectsBoardPage } from '@/pages/ProjectsBoardPage'
import { TasksBoardPage } from '@/pages/TasksBoardPage'

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1000 * 60, retry: 1 } },
})

const CLERK_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string

function TokenSync() {
  const { getToken } = useAuth()
  useEffect(() => {
    setTokenGetter(() => getToken())
  }, [getToken])
  return null
}

function AppRoutes() {
  return (
    <>
      <TokenSync />
      <SignedIn>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/objectives" element={<ObjectivesPage />} />
            <Route path="/objectives/:id" element={<ObjectiveDetailPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/tasks" element={<TasksPage />} />
            <Route path="/tasks/:id" element={<TaskDetailPage />} />
            <Route path="/notes" element={<NotesPage />} />
            <Route path="/notes/:id" element={<NoteDetailPage />} />
            <Route path="/board/projects" element={<ProjectsBoardPage />} />
            <Route path="/board/tasks" element={<TasksBoardPage />} />
          </Route>
        </Routes>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

export default function App() {
  return (
    <ClerkProvider publishableKey={CLERK_KEY}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ClerkProvider>
  )
}

