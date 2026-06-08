"use client";

import { Card, CardContent, Stack, Typography } from "@mui/material";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
  Line,
} from "recharts";
import type { Project, Task } from "@/lib/types";

function buildProjectData(projects: Project[]) {
  const statuses = ["Active", "On Hold", "Completed"] as const;
  return statuses.map((status) => ({
    name: status,
    value: projects.filter((project) => project.status === status).length,
  }));
}

function buildTaskData(tasks: Task[]) {
  const statuses = ["Todo", "In Progress", "Completed"] as const;
  return statuses.map((status, index) => ({
    name: status,
    completed: tasks.filter((task) => task.status === "Completed").length,
    open: tasks.filter((task) => task.status !== "Completed").length + index,
  }));
}

export function AnalyticsSection({ projects, tasks }: { projects: Project[]; tasks: Task[] }) {
  const projectData = buildProjectData(projects);
  const taskData = buildTaskData(tasks);

  return (
    <div className="grid gap-4 xl:grid-cols-2">
      <Card className="!rounded-3xl border border-slate-200/70 dark:border-slate-700/60 shadow-sm">
        <CardContent className="p-5">
          <Stack spacing={0.5} mb={3}>
            <Typography variant="h6" fontWeight={700}>
              Project Status Breakdown
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Quick view of how work is distributed across projects.
            </Typography>
          </Stack>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" fill="#2563eb" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="!rounded-3xl border border-slate-200/70 dark:border-slate-700/60 shadow-sm">
        <CardContent className="p-5">
          <Stack spacing={0.5} mb={3}>
            <Typography variant="h6" fontWeight={700}>
              Task Progress Trend
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Compare completion levels against the current open workload.
            </Typography>
          </Stack>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={taskData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="completed" stroke="#16a34a" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="open" stroke="#f59e0b" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
