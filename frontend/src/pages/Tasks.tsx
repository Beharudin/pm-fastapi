import { useState, useEffect } from 'react'
import { Formik, Form, Field } from 'formik'
import { z } from 'zod'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask } from '../hooks/useTasks'
import { useProjects } from '../hooks/useProjects'
import { useAuthStore } from '../store/authStore'

interface TaskFormValues {
  title: string
  description: string
  project_id: string
  assigned_to: string
  due_date: string
  estimated_hours: number | string
}

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  project_id: z.string().uuid('Select a project'),
  assigned_to: z.string().uuid().optional(),
  due_date: z.string().optional(),
  estimated_hours: z.number().optional(),
})

const Tasks = () => {
  const [showCreate, setShowCreate] = useState(false)
  const [editingTask, setEditingTask] = useState<any>(null)
  const [ws, setWs] = useState<WebSocket | null>(null)
  const { data: tasks, isLoading, refetch } = useTasks()
  const { data: projects } = useProjects()
  const token = useAuthStore((state) => state.token)
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  useEffect(() => {
    if (token) {
      const websocket = new WebSocket(`ws://localhost:8000/ws/tasks?token=${token}`)
      
      websocket.onopen = () => {
        console.log('WebSocket connected')
      }
      
      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        console.log('WebSocket message:', data)
        // Refetch tasks on updates
        if (data.type === 'task_created' || data.type === 'task_updated' || data.type === 'task_deleted') {
          refetch()
        }
      }
      
      websocket.onclose = () => {
        console.log('WebSocket disconnected')
      }
      
      setWs(websocket)
      
      return () => {
        websocket.close()
      }
    }
  }, [token, refetch])

  const handleSubmit = (values: any, { resetForm }: any) => {
    if (editingTask) {
      updateTask.mutate({ id: editingTask.id, data: values }, {
        onSuccess: () => {
          setEditingTask(null)
        },
      })
    } else {
      createTask.mutate(values, {
        onSuccess: () => {
          resetForm()
          setShowCreate(false)
        },
      })
    }
  }

  const handleEdit = (task: any) => {
    setEditingTask(task)
    setShowCreate(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure?')) {
      deleteTask.mutate(id)
    }
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
                  className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                >
                  Projects
                </a>
                <a
                  href="/tasks"
                  className="border-indigo-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
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
            <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
            <button
              onClick={() => {
                setShowCreate(!showCreate)
                setEditingTask(null)
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              {showCreate ? 'Cancel' : 'Create Task'}
            </button>
          </div>

          {showCreate && (
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <Formik<TaskFormValues>
                initialValues={{
                  title: editingTask?.title || '',
                  description: editingTask?.description || '',
                  project_id: editingTask?.project_id || '',
                  assigned_to: editingTask?.assigned_to || '',
                  due_date: editingTask?.due_date || '',
                  estimated_hours: editingTask?.estimated_hours || '',
                }}
                validationSchema={toFormikValidationSchema(taskSchema)}
                onSubmit={handleSubmit}
              >
                {({ errors, touched }) => (
                  <Form>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Field
                          name="title"
                          type="text"
                          className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Task title"
                        />
                        {typeof errors.title === 'string' && touched.title && (
                          <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                        )}
                      </div>
                      <div>
                        <Field
                          name="project_id"
                          as="select"
                          className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        >
                          <option value="">Select Project</option>
                          {projects?.map((project: any) => (
                            <option key={project.id} value={project.id}>{project.name}</option>
                          ))}
                        </Field>
                        {typeof errors.project_id === 'string' && touched.project_id && (
                          <p className="text-red-500 text-sm mt-1">{errors.project_id}</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <Field
                          name="description"
                          as="textarea"
                          className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Description"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Field
                          name="due_date"
                          type="date"
                          className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <Field
                          name="estimated_hours"
                          type="number"
                          className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          placeholder="Estimated hours"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <button
                        type="submit"
                        disabled={createTask.isPending || updateTask.isPending}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                      >
                        {editingTask ? 'Update' : 'Create'}
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          )}

          <div className="space-y-4">
            {tasks?.map((task: any) => (
              <div key={task.id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    <div className="flex items-center mt-2 space-x-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        task.status === 'todo' ? 'bg-gray-100 text-gray-800' :
                        task.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.status}
                      </span>
                      {task.due_date && (
                        <span className="text-sm text-gray-500">Due: {new Date(task.due_date).toLocaleDateString()}</span>
                      )}
                      {task.estimated_hours && (
                        <span className="text-sm text-gray-500">Est: {task.estimated_hours}h</span>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(task)}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}

export default Tasks