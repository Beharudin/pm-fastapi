import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export const useTasks = (projectId?: string) => {
  const token = useAuthStore((state) => state.accessToken)

  return useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const params = projectId ? { project_id: projectId } : {}
      const response = await axios.get(`${API_BASE}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      })
      return response.data.data
    },
    enabled: !!token,
  })
}

export const useCreateTask = () => {
  const queryClient = useQueryClient()
  const token = useAuthStore((state) => state.accessToken)

  return useMutation({
    mutationFn: async (data: any) => {
      if (!token) {
        throw new Error('Missing authentication token')
      }

      const response = await axios.post(`${API_BASE}/tasks`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export const useUpdateTask = () => {
  const queryClient = useQueryClient()
  const token = useAuthStore((state) => state.accessToken)

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      if (!token) {
        throw new Error('Missing authentication token')
      }

      const response = await axios.put(`${API_BASE}/tasks/${id}`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export const useDeleteTask = () => {
  const queryClient = useQueryClient()
  const token = useAuthStore((state) => state.accessToken)

  return useMutation({
    mutationFn: async (id: string) => {
      if (!token) {
        throw new Error('Missing authentication token')
      }

      await axios.delete(`${API_BASE}/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

export const useUploadFile = () => {
  const queryClient = useQueryClient()
  const token = useAuthStore((state) => state.accessToken)

  return useMutation({
    mutationFn: async ({ taskId, file }: { taskId: string; file: File }) => {
      if (!token) {
        throw new Error('Missing authentication token')
      }

      const formData = new FormData()
      formData.append('file', file)
      const response = await axios.post(`${API_BASE}/tasks/${taskId}/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}