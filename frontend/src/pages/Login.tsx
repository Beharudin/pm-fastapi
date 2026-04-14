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
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isRegister ? 'Create Account' : 'Sign in to your account'}
          </h2>
        </div>
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={toFormikValidationSchema(loginSchema)}
          onSubmit={handleSubmit}
        >
          {({ errors, touched }) => (
            <Form className="mt-8 space-y-6">
              <div>
                <Field
                  name="email"
                  type="email"
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Email address"
                />
                {errors.email && touched.email && (
                  <p className="text-red-500 text-sm">{errors.email}</p>
                )}
              </div>
              <div>
                <Field
                  name="password"
                  type="password"
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Password"
                />
                {errors.password && touched.password && (
                  <p className="text-red-500 text-sm">{errors.password}</p>
                )}
              </div>
              <div>
                <button
                  type="submit"
                  disabled={loginMutation.isPending || registerMutation.isPending}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isRegister ? 'Register' : 'Sign in'}
                </button>
              </div>
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-indigo-600 hover:text-indigo-500"
                >
                  {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  )
}

export default Login