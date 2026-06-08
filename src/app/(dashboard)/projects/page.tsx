"use client";

import { useMemo, useState } from "react";
import { Alert, Button, Card, CardContent, Chip, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { addProject, editProject, removeProject } from "@/store/slices/projectsSlice";
import { ProjectDialog } from "@/components/management/ProjectDialog";
import type { Project } from "@/lib/types";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export default function ProjectsPage() {
  const dispatch = useAppDispatch();
  const { items, error } = useAppSelector((state) => state.projects);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const sorted = useMemo(() => [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [items]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Projects</h1>
          <p className="text-slate-600 dark:text-slate-300">Create, edit, delete, and review projects from one responsive view.</p>
        </div>
        <Button variant="contained" onClick={() => { setEditing(null); setDialogOpen(true); }}>
          Create Project
        </Button>
      </div>

      {error && <Alert severity="error">{error}</Alert>}

      <Card className="!rounded-3xl border border-slate-200/70 dark:border-slate-700/60">
        <CardContent className="p-0">
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Project Name</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sorted.map((project) => (
                <TableRow key={project.id} hover>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.description}</TableCell>
                  <TableCell>
                    <Chip size="small" color={project.status === "Active" ? "success" : project.status === "Completed" ? "primary" : "warning"} label={project.status} />
                  </TableCell>
                  <TableCell>{project.createdAt}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button size="small" onClick={() => { setEditing(project); setDialogOpen(true); }}>
                        Edit
                      </Button>
                      <Button size="small" color="error" onClick={() => setDeleteTarget(project)}>
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {!sorted.length && (
            <div className="p-8 text-center text-slate-500">
              No projects yet. Create one to get started.
            </div>
          )}
        </CardContent>
      </Card>

      <ProjectDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        initialValue={editing}
        loading={dialogLoading}
        onSubmit={async (values) => {
          setDialogLoading(true);
          try {
            if (editing) {
              await dispatch(editProject({ id: editing.id, input: values })).unwrap();
            } else {
              await dispatch(addProject(values)).unwrap();
            }
          } finally {
            setDialogLoading(false);
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete project?"
        description={`This will permanently delete ${deleteTarget?.name ?? "this project"} and any related tasks. This action cannot be undone.`}
        confirmLabel="Delete project"
        loading={deleteLoading}
        onCancel={() => {
          setDeleteLoading(false);
          setDeleteTarget(null);
        }}
        onConfirm={async () => {
          if (!deleteTarget) return;
          setDeleteLoading(true);
          try {
            await dispatch(removeProject(deleteTarget.id)).unwrap();
            setDeleteTarget(null);
          } finally {
            setDeleteLoading(false);
          }
        }}
      />
    </div>
  );
}
