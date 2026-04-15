import { useAuthStore } from '../store/authStore'
import { useCurrentUser } from '../hooks/useAuth'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const logout = useAuthStore((state) => state.logout)
  const { data: user } = useCurrentUser()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-700 py-8 shadow-lg shadow-slate-500/10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-slate-300">Project Manager</p>
              <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Welcome back, {user?.email?.split('@')[0] ?? 'User'}
              </h1>
              <p className="mt-3 max-w-2xl text-base text-slate-200 sm:text-lg">
                View your stats, manage projects, and organize tasks all from one modern dashboard.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                to="/projects"
                className="inline-flex items-center justify-center rounded-2xl bg-white/95 px-5 py-3 text-sm font-semibold text-slate-900 shadow-lg shadow-slate-900/10 transition hover:bg-white"
              >
                Browse Projects
              </Link>
              <Link
                to="/tasks"
                className="inline-flex items-center justify-center rounded-2xl bg-indigo-500 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400"
              >
                View Tasks
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="grid gap-6 md:grid-cols-3">
          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Projects</p>
            <p className="mt-4 text-4xl font-semibold text-slate-900">0</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">Create your first project to start organizing work.</p>
          </div>
          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Tasks</p>
            <p className="mt-4 text-4xl font-semibold text-slate-900">0</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">Track progress across all active projects.</p>
          </div>
          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">In Progress</p>
            <p className="mt-4 text-4xl font-semibold text-slate-900">0</p>
            <p className="mt-2 text-sm leading-6 text-slate-500">Quickly identify what needs attention.</p>
          </div>
        </section>

        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200">
            <h2 className="text-xl font-semibold text-slate-900">Getting started</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              Build your first project, create tasks, and invite your team. Everything you need to keep work moving.
            </p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <Link
                to="/projects"
                className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-900 transition hover:bg-slate-50"
              >
                Create project
              </Link>
              <Link
                to="/tasks"
                className="rounded-2xl bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-500"
              >
                Add new task
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] bg-gradient-to-br from-slate-900 via-indigo-900 to-violet-700 p-6 text-white shadow-xl shadow-slate-900/10 ring-1 ring-white/10">
            <h2 className="text-xl font-semibold">Productivity tips</h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-200">
              <li>• Group tasks by project to reduce context switching.</li>
              <li>• Use due dates and statuses to keep priorities clear.</li>
              <li>• Refresh your board after updates to keep everything synced.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Dashboard