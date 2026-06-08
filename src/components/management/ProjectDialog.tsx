"use client";

import { useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Dialog, DialogContent, DialogTitle, MenuItem, Stack, TextField } from "@mui/material";
import type { Project } from "@/lib/types";
import { LoadingButton } from "@/components/ui/Loaders";

const projectSchema = z.object({
  name: z.string().min(2, "Project name is required"),
  description: z.string().min(5, "Description is required"),
  status: z.enum(["Active", "On Hold", "Completed"]),
});

export function ProjectDialog({
  open,
  onClose,
  onSubmit,
  initialValue,
  loading = false,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: z.infer<typeof projectSchema>) => Promise<void> | void;
  initialValue?: Partial<Project> | null;
  loading?: boolean;
}) {
  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      status: "Active",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      name: initialValue?.name ?? "",
      description: initialValue?.description ?? "",
      status: initialValue?.status ?? "Active",
    });
  }, [open, initialValue, form]);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{initialValue ? "Edit Project" : "Create Project"}</DialogTitle>
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
            <TextField label="Project Name" {...form.register("name")} error={!!form.formState.errors.name} helperText={form.formState.errors.name?.message} />
            <TextField
              label="Description"
              multiline
              minRows={4}
              {...form.register("description")}
              error={!!form.formState.errors.description}
              helperText={form.formState.errors.description?.message}
            />
            <TextField
              select
              label="Status"
              defaultValue="Active"
              {...form.register("status")}
              error={!!form.formState.errors.status}
              helperText={form.formState.errors.status?.message}>
              {["Active", "On Hold", "Completed"].map((status) => (
                <MenuItem value={status} key={status}>
                  {status}
                </MenuItem>
              ))}
            </TextField>
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button type="button" onClick={onClose}>
                Cancel
              </Button>
              <LoadingButton type="submit" variant="contained" loading={loading} loadingLabel="Saving project...">
                Save
              </LoadingButton>
            </Stack>
          </Stack>
        </form>
      </DialogContent>
    </Dialog>
  );
}
