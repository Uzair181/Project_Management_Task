import axios, { AxiosError, type AxiosRequestConfig, type AxiosResponse } from "axios";
import { mockUsers, seedProjects, seedTasks } from "./mock-data";
import { authStorage, projectStorage, taskStorage } from "./storage";
import type { AppUser, AuthPayload, Project, Task } from "./types";

type DbShape = {
  projects: Project[];
  tasks: Task[];
};

const defaultDb: DbShape = {
  projects: seedProjects,
  tasks: seedTasks,
};

function getDb(): DbShape {
  if (typeof window === "undefined") return defaultDb;
  const projects = projectStorage.read<Project[]>(seedProjects);
  const tasks = taskStorage.read<Task[]>(seedTasks);
  return { projects, tasks };
}

function setDb(db: DbShape) {
  projectStorage.write(db.projects);
  taskStorage.write(db.tasks);
}

function makeResponse<T>(config: AxiosRequestConfig, data: T, status = 200): AxiosResponse<T> {
  return {
    data,
    status,
    statusText: "OK",
    headers: {},
    config: config as AxiosResponse<T>["config"],
  };
}

function delay<T>(value: T, ms = 350) {
  return new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));
}

function toError(message: string, status = 400) {
  const error = new AxiosError(message);
  (error as AxiosError & { response?: AxiosResponse }).response = {
    data: { message },
    status,
    statusText: message,
    headers: {},
    config: {} as AxiosResponse["config"],
  };
  return error;
}

function getToken() {
  return authStorage.read()?.token ?? null;
}

function requireAuth() {
  if (!getToken()) throw toError("Unauthorized", 401);
}

function parseBody<T>(config?: AxiosRequestConfig): T {
  if (!config?.data) return {} as T;
  if (typeof config.data === "string") {
    return JSON.parse(config.data) as T;
  }
  return config.data as T;
}

function sanitizeUser(user: AppUser): AppUser {
  const { id, name, email, role } = user;
  return { id, name, email, role };
}

function seedIfNeeded() {
  if (typeof window === "undefined") return;
  if (!projectStorage.read<Project[] | null>(null)) projectStorage.write(seedProjects);
  if (!taskStorage.read<Task[] | null>(null)) taskStorage.write(seedTasks);
}

export const api = axios.create({
  baseURL: "/api",
});

api.interceptors.request.use((config) => {
  seedIfNeeded();
  return config;
});

api.interceptors.response.use(undefined, (error) => Promise.reject(error));

api.defaults.adapter = async (config) => {
  const method = (config.method ?? "get").toLowerCase();
  const url = (config.url ?? "").replace(/^\/api/, "");
  const db = getDb();

  const route = async () => {
    if (url === "/auth/login" && method === "post") {
      const body = parseBody<{ email: string; password: string }>(config);
      const found = mockUsers.find((user) => user.email.toLowerCase() === body.email.toLowerCase());
      if (!found || found.password !== body.password) throw toError("Invalid email or password", 401);
      const payload: AuthPayload = {
        token: `token-${found.id}-${Date.now()}`,
        user: sanitizeUser(found),
      };
      authStorage.write(payload);
      return makeResponse(config, payload);
    }

    if (url === "/auth/register" && method === "post") {
      const body = parseBody<{ name: string; email: string; password: string }>(config);
      if (mockUsers.some((user) => user.email.toLowerCase() === body.email.toLowerCase())) {
        throw toError("Email already exists", 409);
      }
      const user: AppUser = {
        id: `u${mockUsers.length + 1}`,
        name: body.name,
        email: body.email,
        role: "member",
      };
      const payload: AuthPayload = {
        token: `token-${user.id}-${Date.now()}`,
        user,
      };
      return makeResponse(config, payload, 201);
    }

    if (url === "/auth/forgot-password" && method === "post") {
      const body = parseBody<{ email: string }>(config);
      const exists = mockUsers.some((user) => user.email.toLowerCase() === body.email.toLowerCase());
      if (!exists) throw toError("Email not found", 404);
      return makeResponse(config, { message: "Password reset instructions sent." });
    }

    if (url === "/auth/me" && method === "get") {
      const stored = authStorage.read();
      if (!stored?.token) throw toError("Unauthorized", 401);
      return makeResponse(config, stored);
    }

    if (url === "/auth/logout" && method === "post") {
      authStorage.clear();
      return makeResponse(config, { message: "Logged out" });
    }

    requireAuth();

    if (url === "/projects" && method === "get") {
      return makeResponse(config, db.projects);
    }

    if (url === "/projects" && method === "post") {
      const body = parseBody<Pick<Project, "name" | "description" | "status">>(config);
      const project: Project = {
        id: `p${Date.now()}`,
        name: body.name,
        description: body.description,
        status: body.status,
        createdAt: new Date().toISOString().slice(0, 10),
      };
      const nextDb = { ...db, projects: [project, ...db.projects] };
      setDb(nextDb);
      return makeResponse(config, project, 201);
    }

    if (url.startsWith("/projects/") && method === "put") {
      const id = url.split("/")[2];
      const body = parseBody<Partial<Project>>(config);
      const nextProjects = db.projects.map((project) => (project.id === id ? { ...project, ...body, id } : project));
      setDb({ ...db, projects: nextProjects });
      const updated = nextProjects.find((project) => project.id === id);
      if (!updated) throw toError("Project not found", 404);
      return makeResponse(config, updated);
    }

    if (url.startsWith("/projects/") && method === "delete") {
      const id = url.split("/")[2];
      const nextProjects = db.projects.filter((project) => project.id !== id);
      const nextTasks = db.tasks.filter((task) => task.projectId !== id);
      setDb({ projects: nextProjects, tasks: nextTasks });
      return makeResponse(config, { message: "Project deleted" });
    }

    if (url === "/tasks" && method === "get") {
      return makeResponse(config, db.tasks);
    }

    if (url === "/tasks" && method === "post") {
      const body = parseBody<Pick<Task, "title" | "description" | "priority" | "dueDate" | "assignedUserId" | "status" | "projectId">>(config);
      const task: Task = {
        id: `t${Date.now()}`,
        ...body,
      };
      setDb({ ...db, tasks: [task, ...db.tasks] });
      return makeResponse(config, task, 201);
    }

    if (url.startsWith("/tasks/") && method === "put") {
      const id = url.split("/")[2];
      const body = parseBody<Partial<Task>>(config);
      const nextTasks = db.tasks.map((task) => (task.id === id ? { ...task, ...body, id } : task));
      setDb({ ...db, tasks: nextTasks });
      const updated = nextTasks.find((task) => task.id === id);
      if (!updated) throw toError("Task not found", 404);
      return makeResponse(config, updated);
    }

    if (url.startsWith("/tasks/") && method === "delete") {
      const id = url.split("/")[2];
      const nextTasks = db.tasks.filter((task) => task.id !== id);
      setDb({ ...db, tasks: nextTasks });
      return makeResponse(config, { message: "Task deleted" });
    }

    if (url === "/dashboard/stats" && method === "get") {
      const totalProjects = db.projects.length;
      const totalTasks = db.tasks.length;
      const completedTasks = db.tasks.filter((task) => task.status === "Completed").length;
      const pendingTasks = totalTasks - completedTasks;
      return makeResponse(config, { totalProjects, totalTasks, completedTasks, pendingTasks });
    }

    throw toError(`Unknown endpoint: ${method.toUpperCase()} ${url}`, 404);
  };

  try {
    const response = await delay(await route());
    return response;
  } catch (error) {
    throw error;
  }
};

export async function loginRequest(email: string, password: string) {
  const { data } = await api.post<AuthPayload>("/auth/login", { email, password });
  return data;
}

export async function registerRequest(name: string, email: string, password: string) {
  const { data } = await api.post<AuthPayload>("/auth/register", { name, email, password });
  return data;
}

export async function forgotPasswordRequest(email: string) {
  const { data } = await api.post<{ message: string }>("/auth/forgot-password", { email });
  return data;
}

export async function logoutRequest() {
  const { data } = await api.post<{ message: string }>("/auth/logout");
  return data;
}

export async function fetchSession() {
  const { data } = await api.get<AuthPayload>("/auth/me");
  return data;
}

export async function fetchProjects() {
  const { data } = await api.get<Project[]>("/projects");
  return data;
}

export async function createProjectRequest(input: Pick<Project, "name" | "description" | "status">) {
  const { data } = await api.post<Project>("/projects", input);
  return data;
}

export async function updateProjectRequest(id: string, input: Partial<Project>) {
  const { data } = await api.put<Project>(`/projects/${id}`, input);
  return data;
}

export async function deleteProjectRequest(id: string) {
  const { data } = await api.delete<{ message: string }>(`/projects/${id}`);
  return data;
}

export async function fetchTasks() {
  const { data } = await api.get<Task[]>("/tasks");
  return data;
}

export async function createTaskRequest(input: Pick<Task, "title" | "description" | "priority" | "dueDate" | "assignedUserId" | "status" | "projectId">) {
  const { data } = await api.post<Task>("/tasks", input);
  return data;
}

export async function updateTaskRequest(id: string, input: Partial<Task>) {
  const { data } = await api.put<Task>(`/tasks/${id}`, input);
  return data;
}

export async function deleteTaskRequest(id: string) {
  const { data } = await api.delete<{ message: string }>(`/tasks/${id}`);
  return data;
}

export async function fetchDashboardStats() {
  const { data } = await api.get<{
    totalProjects: number;
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
  }>("/dashboard/stats");
  return data;
}
