import type { AppUser, Project, Task } from "./types";

export const mockUsers: Array<AppUser & { password: string }> = [
  {
    id: "u1",
    name: "Ayesha Khan",
    email: "ayesha@example.com",
    role: "admin",
    password: "password123",
  },
  {
    id: "u2",
    name: "Bilal Ahmed",
    email: "bilal@example.com",
    role: "manager",
    password: "password123",
  },
  {
    id: "u3",
    name: "Sara Malik",
    email: "sara@example.com",
    role: "member",
    password: "password123",
  },
];

export const seedProjects: Project[] = [
  {
    id: "p1",
    name: "Flowboard Redesign",
    description: "Revamp the dashboard with a more modern analytics-first layout.",
    status: "Active",
    createdAt: "2026-05-22",
  },
  {
    id: "p2",
    name: "Mobile Task Sync",
    description: "Build responsive task management views for tablet and mobile.",
    status: "On Hold",
    createdAt: "2026-05-18",
  },
  {
    id: "p3",
    name: "Client Reporting",
    description: "Generate exportable project and task reports for stakeholders.",
    status: "Completed",
    createdAt: "2026-04-29",
  },
];

export const seedTasks: Task[] = [
  {
    id: "t1",
    title: "Design login flow",
    description: "Polish form states, validation messaging, and error handling.",
    priority: "High",
    dueDate: "2026-06-11",
    assignedUserId: "u1",
    status: "In Progress",
    projectId: "p1",
  },
  {
    id: "t2",
    title: "Create analytics cards",
    description: "Add KPI cards for projects, tasks, completed, and pending counts.",
    priority: "Medium",
    dueDate: "2026-06-12",
    assignedUserId: "u2",
    status: "Todo",
    projectId: "p1",
  },
  {
    id: "t3",
    title: "Review project statuses",
    description: "Audit project progress and update status labels.",
    priority: "Low",
    dueDate: "2026-06-15",
    assignedUserId: "u3",
    status: "Completed",
    projectId: "p3",
  },
];
