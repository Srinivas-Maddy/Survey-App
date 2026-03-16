import axios from "axios";
import * as SecureStore from "expo-secure-store";

// Change this to your server URL
const API_BASE_URL = "http://10.0.2.2:3000"; // Android emulator localhost

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// Attach Bearer token to every request
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function login(email: string, password: string) {
  const res = await api.post("/api/auth/mobile", { email, password });
  await SecureStore.setItemAsync("token", res.data.token);
  return res.data.user;
}

export async function logout() {
  await SecureStore.deleteItemAsync("token");
}

export async function getMe() {
  const res = await api.get("/api/auth/me");
  return res.data.user;
}

export async function getAssignedSurveys() {
  const res = await api.get("/api/employee/surveys");
  return res.data.surveys;
}

export async function submitResponse(surveyId: string, answers: Record<string, string | string[]>) {
  const res = await api.post("/api/employee/responses", { surveyId, answers });
  return res.data;
}

export async function hasToken() {
  const token = await SecureStore.getItemAsync("token");
  return !!token;
}

export default api;
