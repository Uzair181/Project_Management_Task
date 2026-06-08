import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import notificationsReducer from "./notificationsSlice";
import projectsReducer from "./slices/projectsSlice";
import usersReducer from "./slices/usersSlice";
import tasksReducer from "./slices/tasksSlice";
import { appListenerMiddleware } from "./listeners";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    notifications: notificationsReducer,
    projects: projectsReducer,
    users: usersReducer,
    tasks: tasksReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().prepend(appListenerMiddleware.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
