import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Task } from "@/lib/types";
import { createTaskRequest, deleteTaskRequest, fetchTasks, updateTaskRequest } from "@/lib/mock-api";

type TasksState = {
  items: Task[];
  loading: boolean;
  error: string | null;
};

const initialState: TasksState = {
  items: [],
  loading: false,
  error: null,
};

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "response" in error) {
    const e = error as { response?: { data?: { message?: string } } };
    return e.response?.data?.message ?? fallback;
  }
  return fallback;
}

export const loadTasks = createAsyncThunk("tasks/load", async (_, thunkApi) => {
  try {
    return await fetchTasks();
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(getErrorMessage(error, "Unable to load tasks"));
  }
});

export const addTask = createAsyncThunk("tasks/add", async (input: Pick<Task, "title" | "description" | "priority" | "dueDate" | "assignedUserId" | "status" | "projectId">, thunkApi) => {
  try {
    return await createTaskRequest(input);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(getErrorMessage(error, "Unable to create task"));
  }
});

export const editTask = createAsyncThunk("tasks/edit", async ({ id, input }: { id: string; input: Partial<Task> }, thunkApi) => {
  try {
    return await updateTaskRequest(id, input);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(getErrorMessage(error, "Unable to update task"));
  }
});

export const removeTask = createAsyncThunk("tasks/remove", async (id: string, thunkApi) => {
  try {
    await deleteTaskRequest(id);
    return id;
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(getErrorMessage(error, "Unable to delete task"));
  }
});

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearTasksError(state) {
      state.error = null;
    },
    removeTasksByProjectId(state, action: PayloadAction<string>) {
      state.items = state.items.filter((task) => task.projectId !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(loadTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Unable to load tasks";
      })
      .addCase(addTask.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.error = null;
      })
      .addCase(editTask.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item));
        state.error = null;
      })
      .addCase(removeTask.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.error = null;
      });
  },
});

export const { clearTasksError, removeTasksByProjectId } = tasksSlice.actions;
export default tasksSlice.reducer;
