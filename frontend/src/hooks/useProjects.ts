import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_BASE = 'http://localhost:8000'

export const useProjects = () => {
  const token = useAuthStore((state) => state.token)

  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    },
    enabled: !!token,
  })
}

export const useCreateProject = () => {
  const queryClient = useQueryClient()
  const token = useAuthStore((state) => state.token)

  return useMutation({
    mutationFn: async (data: { name: string }) => {
      const response = await axios.post(`${API_BASE}/projects`, data, {
        headers: { Authorization: `Bearer ${token}` },
      })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}