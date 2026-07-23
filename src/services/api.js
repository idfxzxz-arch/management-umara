import axios from "axios";
import { supabase } from "./supabase";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("umara_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function syncAxiosTokenFromSupabase() {
  if (!supabase) return;
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) localStorage.setItem("umara_token", token);
}

export const endpoints = {
  auth: "/auth",
  users: "/users",
  staff: "/staff",
  clients: "/clients",
  tasks: "/tasks",
  attendance: "/attendance",
  points: "/points",
  tax: "/tax",
  reports: "/reports",
  dashboard: "/dashboard",
  settings: "/settings",
  notifications: "/notifications",
};
