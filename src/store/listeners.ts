import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { enqueueToast } from "./notificationsSlice";
import { addProject, editProject, removeProject } from "./slices/projectsSlice";
import { addTask, editTask, removeTask, removeTasksByProjectId } from "./slices/tasksSlice";

export const appListenerMiddleware = createListenerMiddleware();

// Success toasts — mutations only (no load/fetch, no auth)
appListenerMiddleware.startListening({
  matcher: isAnyOf(
    addProject.fulfilled,
    editProject.fulfilled,
    removeProject.fulfilled,
    addTask.fulfilled,
    editTask.fulfilled,
    removeTask.fulfilled,
  ),
  effect: (action: any, api) => {
    if (addProject.fulfilled.match(action)) {
      api.dispatch(enqueueToast({ severity: "success", message: "Project created successfully." }));
      return;
    }
    if (editProject.fulfilled.match(action)) {
      api.dispatch(enqueueToast({ severity: "success", message: "Project updated successfully." }));
      return;
    }
    if (removeProject.fulfilled.match(action)) {
      api.dispatch(removeTasksByProjectId(action.payload));
      api.dispatch(enqueueToast({ severity: "success", message: "Project deleted successfully." }));
      return;
    }
    if (addTask.fulfilled.match(action)) {
      api.dispatch(enqueueToast({ severity: "success", message: "Task created successfully." }));
      return;
    }
    if (editTask.fulfilled.match(action)) {
      api.dispatch(enqueueToast({ severity: "success", message: "Task updated successfully." }));
      return;
    }
    if (removeTask.fulfilled.match(action)) {
      api.dispatch(enqueueToast({ severity: "success", message: "Task deleted successfully." }));
      return;
    }
  },
});

// Error toasts — mutations only (load errors are shown inline via slice state)
appListenerMiddleware.startListening({
  matcher: isAnyOf(
    addProject.rejected,
    editProject.rejected,
    removeProject.rejected,
    addTask.rejected,
    editTask.rejected,
    removeTask.rejected,
  ),
  effect: (action: any, api) => {
    const message =
      action.payload && typeof action.payload === "string"
        ? action.payload
        : action.error?.message || "Something went wrong";
    api.dispatch(enqueueToast({ severity: "error", message }));
  },
});
