import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { useAuthStore } from "../store/authStore";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export const useLogin = () => {
  const login = useAuthStore((state) => state.login);

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await axios.post(`${API_BASE}/auth/login`, data);
      return response.data.data;
    },
    onSuccess: (data) => {
      login(null, data?.access_token ?? "");
    },
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await axios.post(`${API_BASE}/auth/register`, data, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data.data;
    },
  });
};

export const useCurrentUser = () => {
  const token = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      const response = await axios.get(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data.data;
    },
    enabled: !!token,
  });
};
