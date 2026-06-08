import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";
import { enqueueToast } from "./notificationsSlice";
import {
  forgotPassword,
  login,
  register,
  signOut,
} from "./slices/authSlice";
import { addProject, editProject, loadProjects, removeProject } from "./slices/projectsSlice";
import { addTask, editTask, loadTasks, removeTask } from "./slices/tasksSlice";

export const appListenerMiddleware = createListenerMiddleware();

appListenerMiddleware.startListening({
  matcher: isAnyOf(
    login.fulfilled,
    register.fulfilled,
    forgotPassword.fulfilled,
    signOut.fulfilled,
    addProject.fulfilled,
    editProject.fulfilled,
    removeProject.fulfilled,
    addTask.fulfilled,
    editTask.fulfilled,
    removeTask.fulfilled,
    loadProjects.fulfilled,
    loadTasks.fulfilled
  ),
  effect: (action: any, api) => {
    if (login.fulfilled.match(action)) {
      api.dispatch(enqueueToast({ severity: "success", message: "Logged in successfully." }));
      return;
    }
    if (register.fulfilled.match(action)) {
      api.dispatch(enqueueToast({ severity: "success", message: "Account created. Please log in." }));
      return;
    }
    if (forgotPassword.fulfilled.match(action)) {
      api.dispatch(enqueueToast({ severity: "success", message: action.payload.message }));
      return;
    }
    if (signOut.fulfilled.match(action)) {
      api.dispatch(enqueueToast({ severity: "success", message: "Signed out successfully." }));
      return;
    }
    if (addProject.fulfilled.match(action)) {
      api.dispatch(enqueueToast({ severity: "success", message: "Project created successfully." }));
      return;
    }
    if (editProject.fulfilled.match(action)) {
      api.dispatch(enqueueToast({ severity: "success", message: "Project updated successfully." }));
      return;
    }
    if (removeProject.fulfilled.match(action)) {
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
    if (loadProjects.fulfilled.match(action)) {
      api.dispatch(enqueueToast({ severity: "info", message: "Projects loaded." }));
      return;
    }
    if (loadTasks.fulfilled.match(action)) {
      api.dispatch(enqueueToast({ severity: "info", message: "Tasks loaded." }));
    }
  },
});

appListenerMiddleware.startListening({
  matcher: isAnyOf(
    login.rejected,
    register.rejected,
    forgotPassword.rejected,
    signOut.rejected,
    addProject.rejected,
    editProject.rejected,
    removeProject.rejected,
    addTask.rejected,
    editTask.rejected,
    removeTask.rejected,
    loadProjects.rejected,
    loadTasks.rejected
  ),
  effect: (action: any, api) => {
    const message =
      action.payload && typeof action.payload === "string"
        ? action.payload
        : action.error.message || "Something went wrong";
    api.dispatch(enqueueToast({ severity: "error", message }));
  },
});
