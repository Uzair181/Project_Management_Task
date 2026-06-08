"use client";

import { useEffect } from "react";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Dialog, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material";
import type { Task } from "@/lib/types";
import type { AppUser, Project } from "@/lib/types";
import { LoadingButton } from "@/components/ui/Loaders";

const taskSchema = z.object({
  title: z.string().min(2, "Task title is required"),
  description: z.string().min(5, "Description is required"),
  priority: z.enum(["Low", "Medium", "High"]),
  dueDate: z.string().min(1, "Due date is required"),
  assignedUserId: z.string().min(1, "Assign to a user"),
  status: z.enum(["Todo", "In Progress", "Completed"]),
  projectId: z.string().optional(),
});

export function TaskDialog({
  open,
  onClose,
  onSubmit,
  initialValue,
  users,
  projects,
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: z.infer<typeof taskSchema>) => Promise<void> | void;
  initialValue?: Partial<Task> | null;
  users: AppUser[];
  projects: Project[];
  loading?: boolean;
}) {
  const form = useForm<z.infer<typeof taskSchema>>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "Medium",
      dueDate: "",
      assignedUserId: "",
      status: "Todo",
      projectId: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      title: initialValue?.title ?? "",
      description: initialValue?.description ?? "",
      priority: initialValue?.priority ?? "Medium",
      dueDate: initialValue?.dueDate ?? "",
      assignedUserId: initialValue?.assignedUserId ?? "",
      status: initialValue?.status ?? "Todo",
      projectId: initialValue?.projectId ?? "",
    });
  }, [open, initialValue, form]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialValue ? "Edit Task" : "Add Task"}</DialogTitle>
      <DialogContent>
        <form
          className="pt-2"
          onSubmit={form.handleSubmit(async (values) => {
            try {
              await onSubmit(values);
              onClose();
            } catch {
              return;
            }
          })}>
          <Stack spacing={2}>
            <TextField label="Task Title" {...form.register("title")} error={!!form.formState.errors.title} helperText={form.formState.errors.title?.message} />
            <TextField
              label="Description"
              multiline
              minRows={4}
              {...form.register("description")}
              error={!!form.formState.errors.description}
              helperText={form.formState.errors.description?.message}
            />
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <TextField
                    select
                    fullWidth
                    label="Priority"
                    {...field}
                    error={!!form.formState.errors.priority}
                    helperText={form.formState.errors.priority?.message}>
                    {["Low", "Medium", "High"].map((priority) => (
                      <MenuItem key={priority} value={priority}>
                        {priority}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                InputLabelProps={{ shrink: true }}
                {...form.register("dueDate")}
                error={!!form.formState.errors.dueDate}
                helperText={form.formState.errors.dueDate?.message}
              />
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
              <Controller
                control={form.control}
                name="assignedUserId"
                render={({ field }) => (
                  <TextField
                    select
                    fullWidth
                    label="Assigned User"
                    {...field}
                    error={!!form.formState.errors.assignedUserId}
                    helperText={form.formState.errors.assignedUserId?.message}>
                    {users.map((user) => (
                      <MenuItem key={user.id} value={user.id}>
                        {user.name}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
              <Controller
                control={form.control}
                name="status"
                render={({ field }) => (
                  <TextField
                    select
                    fullWidth
                    label="Status"
                    {...field}
                    error={!!form.formState.errors.status}
                    helperText={form.formState.errors.status?.message}>
                    {["Todo", "In Progress", "Completed"].map((status) => (
                      <MenuItem key={status} value={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Stack>
            <Controller
              control={form.control}
              name="projectId"
              render={({ field }) => (
                <TextField select fullWidth label="Project" {...field}>
                  <MenuItem value="">No project</MenuItem>
                  {projects.map((project) => (
                    <MenuItem key={project.id} value={project.id}>
                      {project.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button type="button" onClick={onClose}>
                Cancel
              </Button>
              <LoadingButton type="submit" variant="contained" loading={loading} loadingLabel="Saving task...">
                Save
              </LoadingButton>
            </Stack>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}
