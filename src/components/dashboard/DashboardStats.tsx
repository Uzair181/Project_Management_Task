"use client";

import { Card, CardContent, Stack, Typography } from "@mui/material";
import { FolderKanban, ListChecks, CircleCheckBig, Clock3 } from "lucide-react";

const statMeta = [
  { key: "totalProjects", label: "Total Projects", icon: FolderKanban, accent: "from-blue-500 to-cyan-400" },
  { key: "totalTasks", label: "Total Tasks", icon: ListChecks, accent: "from-violet-500 to-fuchsia-400" },
  { key: "completedTasks", label: "Completed Tasks", icon: CircleCheckBig, accent: "from-emerald-500 to-teal-400" },
  { key: "pendingTasks", label: "Pending Tasks", icon: Clock3, accent: "from-amber-500 to-orange-400" },
] as const;

export function DashboardStats({
  stats,
}: {
  stats: Record<(typeof statMeta)[number]["key"], number>;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {statMeta.map(({ key, label, icon: Icon, accent }) => (
        <Card key={key} className="!rounded-3xl border border-slate-200/70 dark:border-slate-700/60 shadow-sm">
          <CardContent className="p-5">
            <Stack direction="row" justifyContent="space-between" alignItems="start" spacing={2}>
              <div>
                <Typography variant="body2" color="text.secondary">
                  {label}
                </Typography>
                <Typography variant="h4" fontWeight={800} mt={1}>
                  {stats[key]}
                </Typography>
              </div>
              <div className={`rounded-2xl p-3 text-white bg-gradient-to-br ${accent} shadow-lg`}>
                <Icon className="h-5 w-5" />
              </div>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
