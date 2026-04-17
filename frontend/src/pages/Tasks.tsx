import { useState, useEffect } from 'react'
import { Formik, Form, Field } from 'formik'
import { z } from 'zod'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import { useTasks, useCreateTask, useUpdateTask, useDeleteTask, useUploadFile } from '../hooks/useTasks'
import { useProjects } from '../hooks/useProjects'
import { useAuthStore } from '../store/authStore'
import { Link } from 'react-router-dom'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface SortableTaskProps {
  task: any
  onEdit: (task: any) => void
  onDelete: (id: string) => void
}

const SortableTask = ({ task, onEdit, onDelete }: SortableTaskProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-lg shadow-slate-900/5 transition hover:-translate-y-1"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-slate-900">{task.title}</h3>
          <p className="text-sm leading-6 text-slate-600">{task.description || 'No description provided.'}</p>
          <div className="flex flex-wrap gap-2 text-sm">
            <span className={`rounded-full px-3 py-1 font-semibold ${
              task.status === 'todo' ? 'bg-slate-100 text-slate-800' :
              task.status === 'in_progress' ? 'bg-amber-100 text-amber-800' :
              'bg-emerald-100 text-emerald-800'
            }`}>
              {task.status.replace('_', ' ')}
            </span>
            {task.due_date && <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">Due {new Date(task.due_date).toLocaleDateString()}</span>}
            {task.estimated_hours && <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-600">{task.estimated_hours}h estimate</span>}
          </div>
        </div>
        <div className="flex items-start gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit(task)
            }}
            className="rounded-2xl border border-slate-200 px-3 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-slate-50"
          >
            Edit
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete(task.id)
            }}
            className="rounded-2xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const { data: tasks, isLoading, refetch } = useTasks()
  const { data: projects } = useProjects()
  const token = useAuthStore((state) => state.accessToken)
  const createTask = useCreateTask()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const uploadFile = useUploadFile()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: any) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      console.log(`Dragged ${active.id} over ${over?.id}`)
    }
  }

  useEffect(() => {
    if (token) {
      const websocket = new WebSocket(`ws://localhost:8000/ws/tasks?token=${token}`)

      websocket.onopen = () => {
        console.log('WebSocket connected')
      }

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (['task_created', 'task_updated', 'task_deleted'].includes(data.type)) {
          refetch()
        }
      }

      websocket.onclose = () => {
        console.log('WebSocket disconnected')
      }

      setWs(websocket)
      return () => websocket.close()
    }
  }, [token, refetch])

  const handleSubmit = (values: any, { resetForm }: any) => {
    if (editingTask) {
      updateTask.mutate({ id: editingTask.id, data: values }, {
        onSuccess: (data) => {
          setEditingTask(null)
          if (selectedFile) {
            uploadFile.mutate({ taskId: data.data.id, file: selectedFile }, {
              onSuccess: () => setSelectedFile(null),
            })
          }
        },
      })
    } else {
      createTask.mutate(values, {
        onSuccess: (data) => {
          resetForm()
          setShowCreate(false)
          if (selectedFile) {
            uploadFile.mutate({ taskId: data.data.id, file: selectedFile }, {
              onSuccess: () => setSelectedFile(null),
            })
          }
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
    <div className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-white/90 border-b border-slate-200 py-6 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Tasks</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Organize work the smart way</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                setShowCreate((prev) => !prev)
                setEditingTask(null)
              }}
              className="rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500"
            >
              {showCreate ? 'Close form' : editingTask ? 'Edit task' : 'Create task'}
            </button>
            <Link
              to="/projects"
              className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Projects
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 xl:grid-cols-[380px_1fr]">
          <section className="space-y-6">
            <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Workspace</p>
                  <h2 className="mt-3 text-2xl font-semibold text-slate-900">Task controls</h2>
                </div>
                <div className="rounded-2xl bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
                  Live sync
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-slate-600">Drag tasks to reorder them, or use the form to create and edit items instantly. Upload attachments as needed.</p>
            </div>

            {showCreate && (
              <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-slate-900/5 ring-1 ring-slate-200">
                <h3 className="text-xl font-semibold text-slate-900">{editingTask ? 'Edit Task' : 'New Task'}</h3>
                <p className="mt-2 text-sm text-slate-600">Fill in task details and optionally attach a file.</p>
                <div className="mt-6">
                  <Formik
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
                      <Form className="space-y-4">
                        <div>
                          <label className="block text-sm font-semibold text-slate-700">Title</label>
                          <Field
                            name="title"
                            type="text"
                            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                            placeholder="Task title"
                          />
                          {typeof errors.title === 'string' && touched.title && <p className="mt-2 text-sm text-red-600">{errors.title}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700">Description</label>
                          <Field
                            name="description"
                            as="textarea"
                            className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                            rows={4}
                            placeholder="Describe this task"
                          />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700">Project</label>
                            <Field
                              name="project_id"
                              as="select"
                              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                            >
                              <option value="">Select project</option>
                              {projects?.map((project: any) => (
                                <option key={project.id} value={project.id}>{project.name}</option>
                              ))}
                            </Field>
                            {typeof errors.project_id === 'string' && touched.project_id && <p className="mt-2 text-sm text-red-600">{errors.project_id}</p>}
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700">Due date</label>
                            <Field
                              name="due_date"
                              type="date"
                              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                            />
                          </div>
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <label className="block text-sm font-semibold text-slate-700">Assignee ID</label>
                            <Field
                              name="assigned_to"
                              type="text"
                              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                              placeholder="User id"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-slate-700">Est. hours</label>
                            <Field
                              name="estimated_hours"
                              type="number"
                              className="mt-2 w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                              placeholder="e.g. 3"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-slate-700">Attachment</label>
                          <input
                            type="file"
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            className="mt-2 w-full text-sm text-slate-700"
                          />
                          {selectedFile && <p className="mt-2 text-sm text-slate-500">Selected file: {selectedFile.name}</p>}
                        </div>
                        <button
                          type="submit"
                          disabled={createTask.isPending || updateTask.isPending || uploadFile.isPending}
                          className="w-full rounded-2xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-500"
                        >
                          {editingTask ? 'Update Task' : 'Create Task'}
                        </button>
                      </Form>
                    )}
                  </Formik>
                </div>
              </div>
            )}
          </section>

          <section className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Task board</p>
                  <h2 className="mt-2 text-2xl font-semibold text-slate-900">Live tasks</h2>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
                  {tasks?.length ?? 0} tasks
                </span>
              </div>
              <div className="mt-6 space-y-4">
                {tasks?.length ? (
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={tasks.map((task: any) => task.id)} strategy={verticalListSortingStrategy}>
                      <div className="space-y-4">
                        {tasks.map((task: any) => (
                          <SortableTask key={task.id} task={task} onEdit={handleEdit} onDelete={handleDelete} />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                ) : (
                  <div className="rounded-[2rem] border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-slate-500">
                    <p className="text-lg font-semibold text-slate-900">No tasks yet</p>
                    <p className="mt-2 text-sm leading-6">Create your first task to see it appear here with drag-and-drop ordering.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default Tasks