import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Formik, Form, Field } from 'formik'
import { z } from 'zod'
import { toFormikValidationSchema } from 'zod-formik-adapter'
import { useLogin, useRegister } from '../hooks/useAuth'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

const Login = () => {
  const [isRegister, setIsRegister] = useState(false)
  const navigate = useNavigate()
  const loginMutation = useLogin()
  const registerMutation = useRegister()

  const handleSubmit = (values: any) => {
    if (isRegister) {
      registerMutation.mutate(values, {
        onSuccess: () => {
          setIsRegister(false)
        },
      })
    } else {
      loginMutation.mutate(values, {
        onSuccess: () => {
          navigate('/')
        },
      })
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-900">
      <div className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-r from-slate-900 via-indigo-800 to-violet-700 opacity-90 blur-3xl"></div>
        <div className="relative mx-auto flex min-h-screen max-w-4xl items-center px-6 py-16 lg:px-8">
          <div className="w-full rounded-[2rem] bg-white/95 shadow-2xl ring-1 ring-slate-900/5 backdrop-blur-xl">
            <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <div className="space-y-6 px-8 py-10 sm:px-12 sm:py-12">
                <div>
                  <p className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-sm font-semibold text-indigo-700 ring-1 ring-indigo-200">
                    SaaS Project Management
                  </p>
                  <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                    {isRegister ? 'Create your account' : 'Welcome back'}
                  </h1>
                  <p className="mt-4 text-base leading-7 text-slate-600">
                    Manage projects, tasks and collaboration from one centralized dashboard.
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-950 p-6 text-white ring-1 ring-slate-900/10">
                  <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-300">Quick tips</p>
                  <ul className="mt-4 space-y-3 text-sm leading-6 text-slate-300">
                    <li>• Use Login to access your workspace.</li>
                    <li>• Register and then start creating projects and tasks.</li>
                    <li>• Drag tasks to quickly reorder and track status.</li>
                  </ul>
                </div>
              </div>
              <div className="px-8 py-10 sm:px-12 sm:py-12">
                <div className="mb-8 flex items-center justify-between">
                  <div>
                    <p className="text-lg font-semibold text-slate-900">{isRegister ? 'Sign up' : 'Sign in'}</p>
                    <p className="text-sm text-slate-500">Secure access to your projects and tasks.</p>
                  </div>
                  <div className="rounded-2xl bg-slate-100 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                    {isRegister ? 'Register' : 'Login'}
                  </div>
                </div>
                <Formik
                  initialValues={{ email: '', password: '' }}
                  validationSchema={toFormikValidationSchema(loginSchema)}
                  onSubmit={handleSubmit}
                >
                  {({ errors, touched }) => (
                    <Form className="space-y-6">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700">Email address</label>
                        <Field
                          name="email"
                          type="email"
                          className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                          placeholder="you@example.com"
                        />
                        {typeof errors.email === 'string' && touched.email && (
                          <p className="mt-2 text-sm text-red-600">{errors.email}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700">Password</label>
                        <Field
                          name="password"
                          type="password"
                          className="mt-2 block w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                          placeholder="********"
                        />
                        {typeof errors.password === 'string' && touched.password && (
                          <p className="mt-2 text-sm text-red-600">{errors.password}</p>
                        )}
                      </div>
                      <button
                        type="submit"
                        className="w-full rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:opacity-95"
                      >
                        {isRegister ? 'Create Account' : 'Sign in'}
                      </button>
                      <div className="text-center text-sm text-slate-500">
                        <button
                          type="button"
                          onClick={() => setIsRegister((prev) => !prev)}
                          className="font-semibold text-indigo-600 hover:text-indigo-500"
                        >
                          {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
                        </button>
                      </div>
                      {(loginMutation.error || registerMutation.error) && (
                        <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">
                          {loginMutation.error?.message || registerMutation.error?.message || 'Something went wrong.'}
                        </p>
                      )}
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login