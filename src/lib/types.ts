export type AuthRole = "admin" | "manager" | "member";

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
}

export type ProjectStatus = "Active" | "On Hold" | "Completed";
export type TaskStatus = "Todo" | "In Progress" | "Completed";
export type TaskPriority = "Low" | "Medium" | "High";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  createdAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  assignedUserId: string;
  status: TaskStatus;
  projectId?: string;
}

export interface AuthPayload {
  token: string;
  user: AppUser;
}
