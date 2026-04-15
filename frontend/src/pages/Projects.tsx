import { useState } from 'react'
import { Formik, Form, Field } from 'formik'
import { z } from 'zod'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import { useProjects, useCreateProject } from '../hooks/useProjects'
import { Link } from 'react-router-dom'

const projectSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
})

const Projects = () => {
  const [showCreate, setShowCreate] = useState(false)
  const { data: projects, isLoading } = useProjects()
  const createProject = useCreateProject()

  const handleSubmit = (values: any, { resetForm }: any) => {
    createProject.mutate(values, {
      onSuccess: () => {
        resetForm()
        setShowCreate(false)
      },
    })
  }

  if (isLoading) return <div className="text-center py-10">Loading...</div>

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-white/80 border-b border-slate-200 py-6 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Projects</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">Manage your project portfolio</h1>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/tasks"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Task board
            </Link>
            <button
              onClick={() => setShowCreate((prev) => !prev)}
              className="rounded-2xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500"
            >
              {showCreate ? 'Hide form' : 'Create project'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {showCreate && (
          <section className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200 mb-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-slate-900">Create a new project</h2>
                <p className="mt-2 text-sm text-slate-600">Give your next initiative a home and organize tasks around it.</p>
              </div>
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-indigo-700">
                New
              </span>
            </div>
            <div className="mt-6">
              <Formik
                initialValues={{ name: '' }}
                validationSchema={toFormikValidationSchema(projectSchema)}
                onSubmit={handleSubmit}
              >
                {({ errors, touched }) => (
                  <Form className="grid gap-4 sm:grid-cols-[1fr_auto]">
                    <div>
                      <Field
                        name="name"
                        type="text"
                        className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                        placeholder="Project name"
                      />
                      {errors.name && touched.name && (
                        <p className="mt-2 text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={createProject.isPending}
                      className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500"
                    >
                      {createProject.isPending ? 'Creating...' : 'Create'}
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
          </section>
        )}

        <section className="grid gap-6 lg:grid-cols-3">
          {projects?.length ? (
            projects.map((project: any) => (
              <article key={project.id} className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200 transition hover:-translate-y-1 hover:shadow-2xl">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium uppercase tracking-[0.24em] text-indigo-600">Project</p>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900">{project.name}</h3>
                  </div>
                  <div className="rounded-2xl bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-700">
                    Active
                  </div>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">Owner ID: {project.owner_id}</p>
              </article>
            ))
          ) : (
            <div className="rounded-[2rem] bg-white p-8 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">No projects yet</p>
              <h2 className="mt-4 text-2xl font-semibold text-slate-900">Start by creating your first project.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">Projects give context to your work and keep your tasks organized.</p>
              <button
                onClick={() => setShowCreate(true)}
                className="mt-6 inline-flex rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500"
              >
                Create a project
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default Projects