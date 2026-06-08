import axios, { AxiosError } from "axios";
import type { AppUser, AuthPayload, Project, Task } from "./types";
import { authStorage } from "./storage";
import { mockUsers } from "./mock-data";

const MOCK_API_BASE_URL = "https://6a26986fa84f9d39e90783a2.mockapi.io/api/v1";

const remoteApi = axios.create({
  baseURL: MOCK_API_BASE_URL,
  timeout: 10000,
});

const authUsers: Array<AppUser & { password: string }> = [...mockUsers];

type RemoteProject = {
  id: string;
  CreatedAt?: number | string;
  createdAt?: number | string;
  Name?: string;
  name?: string;
  Description?: string;
  description?: string;
  Status?: string;
  status?: string;
};

type RemoteTask = {
  id: string;
  due_date?: number | string;
  dueDate?: number | string;
  title?: string;
  description?: string;
  priority?: string;
  assigned_user?: string | { id?: string; name?: string; email?: string; role?: string } | null;
  assignedUserId?: string;
  status?: string;
  project?: string | { id?: string; name?: string; description?: string; status?: string } | null;
  projectId?: string;
};

function delay<T>(value: T, ms = 350) {
  return new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));
}

function toError(message: string, status = 400) {
  const error = new AxiosError(message);
  (error as AxiosError & { response?: unknown }).response = {
    data: { message },
    status,
    statusText: message,
    headers: {},
    config: { headers: {} } as never,
  };
  return error;
}

function sanitizeUser(user: AppUser & { password?: string }): AppUser {
  const { id, name, email, role } = user;
  return { id, name, email, role };
}

function toDateString(value: number | string | undefined): string {
  if (value == null || value === "") return "";
  const asNumber = typeof value === "string" ? Number(value) : value;
  const time = Number.isNaN(asNumber) ? Number(value) : asNumber;
  const date = new Date(time > 1_000_000_000_000 ? time : time * 1000);
  return Number.isNaN(date.getTime()) ? String(value).slice(0, 10) : date.toISOString().slice(0, 10);
}

function getNestedId(value: RemoteTask["assigned_user"] | RemoteTask["project"] | undefined) {
  if (!value || typeof value !== "object") return "";
  return value.id ?? "";
}

function normalizeProject(project: RemoteProject): Project {
  const createdAt = project.CreatedAt ?? project.createdAt;
  return {
    id: project.id,
    name: project.Name ?? project.name ?? "",
    description: project.Description ?? project.description ?? "",
    status: (project.Status ?? project.status ?? "Active") as Project["status"],
    createdAt: toDateString(createdAt),
  };
}

function serializeProjectCreate(input: Pick<Project, "name" | "description" | "status">) {
  return {
    Name: input.name,
    Description: input.description,
    Status: input.status,
  };
}

function serializeProjectUpdate(input: Partial<Project>) {
  const payload: Record<string, unknown> = {};
  if (input.name !== undefined) payload.Name = input.name;
  if (input.description !== undefined) payload.Description = input.description;
  if (input.status !== undefined) payload.Status = input.status;
  if (input.createdAt !== undefined) {
    const time = new Date(input.createdAt).getTime();
    payload.CreatedAt = Number.isNaN(time) ? undefined : Math.floor(time / 1000);
  }
  return payload;
}

function normalizeTask(task: RemoteTask): Task {
  const assignedUserId =
    typeof task.assigned_user === "string"
      ? task.assigned_user
      : getNestedId(task.assigned_user) || task.assignedUserId || "";
  const projectId =
    typeof task.project === "string"
      ? task.project
      : getNestedId(task.project) || task.projectId || "";

  return {
    id: task.id,
    title: task.title ?? "",
    description: task.description ?? "",
    priority: (task.priority ?? "Medium") as Task["priority"],
    dueDate: toDateString(task.due_date ?? task.dueDate),
    assignedUserId,
    status: (task.status ?? "Todo") as Task["status"],
    projectId: projectId || undefined,
  };
}

function serializeTask(input: Pick<Task, "title" | "description" | "priority" | "dueDate" | "assignedUserId" | "status" | "projectId"> | Partial<Task>) {
  const payload: Record<string, unknown> = {};
  if (input.title !== undefined) payload.title = input.title;
  if (input.description !== undefined) payload.description = input.description;
  if (input.priority !== undefined) payload.priority = input.priority;
  if (input.dueDate !== undefined) {
    const time = new Date(input.dueDate).getTime();
    payload.due_date = Number.isNaN(time) ? undefined : Math.floor(time / 1000);
  }
  if (input.assignedUserId !== undefined) {
    payload.assigned_user = input.assignedUserId ? { id: input.assignedUserId } : null;
  }
  if (input.status !== undefined) payload.status = input.status;
  if (input.projectId !== undefined) {
    payload.project = input.projectId ? { id: input.projectId } : null;
  }
  return payload;
}

async function withDelay<T>(promise: Promise<T>, ms = 350) {
  const result = await promise;
  return delay(result, ms);
}

function requireAuth() {
  if (!authStorage.read()?.token) throw toError("Unauthorized", 401);
}

export async function loginRequest(email: string, password: string) {
  const found = authUsers.find((user) => user.email.toLowerCase() === email.toLowerCase());
  if (!found || found.password !== password) throw toError("Invalid email or password", 401);

  const payload: AuthPayload = {
    token: `token-${found.id}-${Date.now()}`,
    user: sanitizeUser(found),
  };
  authStorage.write(payload);
  return delay(payload);
}

export async function registerRequest(name: string, email: string, password: string) {
  if (authUsers.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
    throw toError("Email already exists", 409);
  }

  const user: AppUser & { password: string } = {
    id: `u${authUsers.length + 1}`,
    name,
    email,
    role: "member",
    password,
  };

  authUsers.push(user);

  const payload: AuthPayload = {
    token: `token-${user.id}-${Date.now()}`,
    user: sanitizeUser(user),
  };

  return delay(payload);
}

export async function forgotPasswordRequest(email: string) {
  if (!authUsers.some((user) => user.email.toLowerCase() === email.toLowerCase())) {
    throw toError("Email not found", 404);
  }

  return delay({ message: "Password reset instructions sent." });
}

export async function logoutRequest() {
  authStorage.clear();
  return delay({ message: "Logged out" });
}

export async function fetchSession() {
  const stored = authStorage.read();
  if (!stored?.token) throw toError("Unauthorized", 401);
  return delay(stored as AuthPayload);
}

export async function fetchUsers() {
  return delay(authUsers.map(sanitizeUser));
}

export async function fetchProjects() {
  requireAuth();
  const response = await remoteApi.get<RemoteProject[]>("/Projects");
  return withDelay(Promise.resolve(response.data.map(normalizeProject)));
}

export async function createProjectRequest(input: Pick<Project, "name" | "description" | "status">) {
  requireAuth();
  const response = await remoteApi.post<RemoteProject>("/Projects", {
    ...serializeProjectCreate(input),
    CreatedAt: Math.floor(Date.now() / 1000),
  });
  return withDelay(Promise.resolve(normalizeProject(response.data)));
}

export async function updateProjectRequest(id: string, input: Partial<Project>) {
  requireAuth();
  const response = await remoteApi.put<RemoteProject>(`/Projects/${id}`, serializeProjectUpdate(input));
  return withDelay(Promise.resolve(normalizeProject(response.data)));
}

export async function deleteProjectRequest(id: string) {
  requireAuth();
  const tasks = await fetchTasks();
  const relatedTasks = tasks.filter((task) => task.projectId === id);

  await Promise.all(relatedTasks.map((task) => remoteApi.delete(`/Tasks/${task.id}`)));
  await remoteApi.delete(`/Projects/${id}`);
  return delay({ message: "Project deleted" });
}

export async function fetchTasks() {
  requireAuth();
  const response = await remoteApi.get<RemoteTask[]>("/Tasks");
  return withDelay(Promise.resolve(response.data.map(normalizeTask)));
}

export async function createTaskRequest(input: Pick<Task, "title" | "description" | "priority" | "dueDate" | "assignedUserId" | "status" | "projectId">) {
  requireAuth();
  const response = await remoteApi.post<RemoteTask>("/Tasks", serializeTask(input));
  return withDelay(Promise.resolve(normalizeTask(response.data)));
}

export async function updateTaskRequest(id: string, input: Partial<Task>) {
  requireAuth();
  const response = await remoteApi.put<RemoteTask>(`/Tasks/${id}`, serializeTask(input));
  return withDelay(Promise.resolve(normalizeTask(response.data)));
}

export async function deleteTaskRequest(id: string) {
  requireAuth();
  await remoteApi.delete(`/Tasks/${id}`);
  return delay({ message: "Task deleted" });
}

export async function fetchDashboardStats() {
  const [projects, tasks] = await Promise.all([fetchProjects(), fetchTasks()]);
  const totalProjects = projects.length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.status === "Completed").length;
  const pendingTasks = totalTasks - completedTasks;

  return { totalProjects, totalTasks, completedTasks, pendingTasks };
}
