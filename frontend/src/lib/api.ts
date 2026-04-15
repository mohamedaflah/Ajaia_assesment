import { useAuthStore } from "../stores/authStore";
import axios, { AxiosError } from "axios";

const API_URL = import.meta.env.VITE_API_URL ?? "https://ajaia-assesment.onrender.com";

type ApiEnvelope<T> =
  | { success: true; message: string; data: T }
  | { success: false; message: string };

export class ApiClientError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers = {
      ...(config.headers as any),
      Authorization: `Bearer ${token}`,
    } as any;
  }
  return config;
});

function getErrorMessage(err: unknown, fallback: string) {
  if (axios.isAxiosError(err)) {
    const ax = err as AxiosError<any>;
    const msg = ax.response?.data?.message;
    if (typeof msg === "string" && msg.trim()) return msg;
    if (ax.message) return ax.message;
    if (ax.response?.status) return `${fallback} (${ax.response.status})`;
  }
  return fallback;
}

export async function apiFetch<T>(path: string, init?: { method?: string; body?: any; auth?: boolean }) {
  try {
    const method = (init?.method ?? "GET").toUpperCase();
    const authDisabled = init?.auth === false;

    if (authDisabled) {
      const token = useAuthStore.getState().token;
      // temporarily disable auth header for this request
      const headers: any = token ? { Authorization: undefined } : undefined;
      const res = await api.request<ApiEnvelope<T>>({
        url: path,
        method,
        data: init?.body,
        headers,
      });
      if (!res.data || res.data.success !== true) throw new ApiClientError(res.status, "Unexpected response");
      return res.data.data;
    }

    const res = await api.request<ApiEnvelope<T>>({
      url: path,
      method,
      data: init?.body,
    });
    if (!res.data || res.data.success !== true) throw new ApiClientError(res.status, "Unexpected response");
    return res.data.data;
  } catch (err) {
    const status = axios.isAxiosError(err) ? err.response?.status ?? 500 : 500;
    throw new ApiClientError(status, getErrorMessage(err, "Request failed"));
  }
}

export type LoginResponse = { token: string };

export function login(email: string, password: string) {
  return apiFetch<LoginResponse>("/api/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
}

export function signup(email: string, password: string) {
  return apiFetch<LoginResponse>("/api/auth/signup", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
}

export type DocPermission = "read" | "write";
export type DocumentSummary = {
  _id: string;
  title: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
};

export type DocumentEntity = {
  _id: string;
  title: string;
  content: any;
  owner: string;
  collaborators: { user: string; permission: DocPermission }[];
  shareToken?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ListDocsResponse = { owned: DocumentSummary[] };

export function listDocs() {
  return apiFetch<ListDocsResponse>("/api/docs", { method: "GET" });
}

export function createDoc(title: string, content: any) {
  return apiFetch<DocumentEntity>("/api/docs", {
    method: "POST",
    body: { title, content },
  });
}

export function getDoc(id: string) {
  return apiFetch<DocumentEntity>(`/api/docs/${id}`, { method: "GET" });
}

export function updateDoc(id: string, input: { title?: string; content?: any }) {
  return apiFetch<DocumentEntity>(`/api/docs/${id}`, {
    method: "PUT",
    body: input,
  });
}

export function deleteDoc(id: string) {
  return apiFetch<{ id: string }>(`/api/docs/${id}`, { method: "DELETE" });
}

export function toggleShare(id: string) {
  return apiFetch<{ shareToken: string | null; shared: boolean }>(`/api/docs/${id}/share`, {
    method: "POST",
  });
}

export function getSharedDoc(token: string) {
  return apiFetch<DocumentEntity>(`/api/docs/shared/${token}`, {
    method: "GET",
    auth: false,
  });
}

export async function uploadFileToDoc(file: File, title?: string) {
  const form = new FormData();
  form.append("file", file);

  const qs = title ? `?title=${encodeURIComponent(title)}` : "";
  try {
    const res = await api.post<ApiEnvelope<DocumentEntity>>(`/api/upload${qs}`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (!res.data || res.data.success !== true) throw new ApiClientError(res.status, "Unexpected response");
    return res.data.data;
  } catch (err) {
    const status = axios.isAxiosError(err) ? err.response?.status ?? 500 : 500;
    throw new ApiClientError(status, getErrorMessage(err, "Upload failed"));
  }
}

