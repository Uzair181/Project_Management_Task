"use client";

import { useMemo, useState } from "react";
import { Alert, Button, Card, CardContent, Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addTask, editTask, removeTask } from "@/store/slices/tasksSlice";
import { TaskDialog } from "@/components/management/TaskDialog";
import type { Task } from "@/lib/types";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function TasksPage() {
  const dispatch = useAppDispatch();
  const projects = useAppSelector((state) => state.projects.items);
  const users = useAppSelector((state) => state.users.items);
  const tasks = useAppSelector((state) => state.tasks.items);
  const error = useAppSelector((state) => state.tasks.error);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Task | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const sorted = useMemo(
    () => [...tasks].sort((a, b) => (a.dueDate ?? "").localeCompare(b.dueDate ?? "")),
    [tasks]
  );

  const getUserName = (id: string) => users.find((user) => user.id === id)?.name ?? "Unassigned";
  const getProjectName = (id?: string) => projects.find((project) => project.id === id)?.name ?? "No project";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Tasks</h1>
          <p className="text-slate-600 dark:text-slate-300">Add tasks, assign users, change status, and keep delivery on track.</p>
        </div>
        <Button variant="contained" onClick={() => { setEditing(null); setDialogOpen(true); }}>
          Add Task
        </Button>
      </div>

      {error && <Alert severity="error">{error}</Alert>}

      <Card className="!rounded-3xl border border-slate-200/70 dark:border-slate-700/60">
        <CardContent className="p-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Task Title</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Assigned User</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Project</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((task) => (
                <TableRow key={task.id} hover>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>{task.description}</TableCell>
                  <TableCell>
                    <Chip size="small" label={task.priority} color={task.priority === "High" ? "error" : task.priority === "Medium" ? "warning" : "default"} />
                  </TableCell>
                  <TableCell>{task.dueDate}</TableCell>
                  <TableCell>{getUserName(task.assignedUserId)}</TableCell>
                  <TableCell>
                    <Chip size="small" label={task.status} color={task.status === "Completed" ? "success" : task.status === "In Progress" ? "primary" : "default"} />
                  </TableCell>
                  <TableCell>{getProjectName(task.projectId)}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" onClick={() => { setEditing(task); setDialogOpen(true); }}>
                        Edit
                      </Button>
                      <Button size="small" color="error" onClick={() => setDeleteTarget(task)}>
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!sorted.length && <div className="p-8 text-center text-slate-500">No tasks yet. Add one to get started.</div>}
        </CardContent>
      </Card>

      <TaskDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        initialValue={editing}
        users={users}
        projects={projects}
        loading={dialogLoading}
        onSubmit={async (values) => {
          setDialogLoading(true);
          try {
            const payload = {
              ...values,
              projectId: values.projectId || undefined,
            };
            if (editing) {
              await dispatch(editTask({ id: editing.id, input: payload })).unwrap();
            } else {
              await dispatch(addTask(payload)).unwrap();
            }
          } finally {
            setDialogLoading(false);
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete task?"
        description={`This will permanently delete ${deleteTarget?.title ?? "this task"}. This action cannot be undone.`}
        confirmLabel="Delete task"
        loading={deleteLoading}
        onCancel={() => {
          setDeleteLoading(false);
          setDeleteTarget(null);
        }}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setDeleteLoading(true);
          try {
            await dispatch(removeTask(deleteTarget.id)).unwrap();
            setDeleteTarget(null);
          } finally {
            setDeleteLoading(false);
          }
        }}
      />
    </div>
  );
}
