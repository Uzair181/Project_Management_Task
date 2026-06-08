"use client";

import { Snackbar, Alert } from "@mui/material";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { dequeueToast } from "@/store/notificationsSlice";

export function ToastHost() {
  const dispatch = useAppDispatch();
  const current = useAppSelector((state) => state.notifications.items[0]);

  return (
    <Snackbar
      open={Boolean(current)}
      autoHideDuration={current?.duration ?? 4000}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      onClose={(_, reason) => {
        if (reason === "clickaway") return;
        if (current) dispatch(dequeueToast(current.id));
      }}
    >
      <Alert
        onClose={() => current && dispatch(dequeueToast(current.id))}
        severity={current?.severity ?? "info"}
        variant="filled"
        sx={{ width: "100%" }}
      >
        {current?.message}
      </Alert>
    </Snackbar>
  );
}
