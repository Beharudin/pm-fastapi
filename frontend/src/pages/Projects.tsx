import { useState } from 'react'
import { Formik, Form, Field } from 'formik'
import { z } from 'zod'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import { useProjects, useCreateProject } from '../hooks/useProjects'

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
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">Project Manager</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                <a
                  href="/"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Dashboard
                </a>
                <a
                  href="/projects"
                  className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Projects
                </a>
                <a
                  href="/tasks"
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Tasks
                </a>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
            <button
              onClick={() => setShowCreate(!showCreate)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {showCreate ? 'Cancel' : 'Create Project'}
            </button>
          </div>

          {showCreate && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <Formik
                initialValues={{ name: '' }}
                validationSchema={toFormikValidationSchema(projectSchema)}
                onSubmit={handleSubmit}
              >
                {({ errors, touched }) => (
                  <Form>
                    <div className="mb-4">
                      <Field
                        name="name"
                        type="text"
                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder="Project name"
                      />
                      {errors.name && touched.name && (
                        <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                      )}
                    </div>
                    <button
                      type="submit"
                      disabled={createProject.isPending}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      {createProject.isPending ? 'Creating...' : 'Create'}
                    </button>
                  </Form>
                )}
              </Formik>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects?.map((project: any) => (
              <div key={project.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <h3 className="text-lg font-medium text-gray-900">{project.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">Owner: {project.owner_id}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Projects