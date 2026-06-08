"use client";

import { useAppSelector } from "@/store/hooks";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { AnalyticsSection } from "@/components/dashboard/AnalyticsSection";

export default function DashboardPage() {
  const projects = useAppSelector((state) => state.projects.items);
  const tasks = useAppSelector((state) => state.tasks.items);
  const stats = {
    totalProjects: projects.length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter((task) => task.status === "Completed").length,
    pendingTasks: tasks.filter((task) => task.status !== "Completed").length,
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
        <p className="text-slate-600 dark:text-slate-300">Track project progress, task completion, and workload at a glance.</p>
      </div>
      <DashboardStats stats={stats} />
      <AnalyticsSection projects={projects} tasks={tasks} />
    </div>
  );
}
