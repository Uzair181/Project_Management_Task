"use client";

import { Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography, Button } from "@mui/material";
import { LoadingButton } from "@/components/ui/Loaders";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  loading?: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}) {
  return (
    <Dialog open={open} onClose={loading ? undefined : onCancel} fullWidth maxWidth="xs">
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} className="pt-1">
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onCancel} disabled={loading}>
          {cancelLabel}
        </Button>
        <LoadingButton variant="contained" color="error" loading={loading} loadingLabel="Deleting..." onClick={onConfirm}>
          {confirmLabel}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}
