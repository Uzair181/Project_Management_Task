import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Project } from "@/lib/types";
import { createProjectRequest, deleteProjectRequest, fetchProjects, updateProjectRequest } from "@/lib/mock-api";

type ProjectsState = {
  items: Project[];
  loading: boolean;
  error: string | null;
};

const initialState: ProjectsState = {
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

export const loadProjects = createAsyncThunk("projects/load", async (_, thunkApi) => {
  try {
    return await fetchProjects();
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(getErrorMessage(error, "Unable to load projects"));
  }
});

export const addProject = createAsyncThunk("projects/add", async (input: Pick<Project, "name" | "description" | "status">, thunkApi) => {
  try {
    return await createProjectRequest(input);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(getErrorMessage(error, "Unable to create project"));
  }
});

export const editProject = createAsyncThunk("projects/edit", async ({ id, input }: { id: string; input: Partial<Project> }, thunkApi) => {
  try {
    return await updateProjectRequest(id, input);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(getErrorMessage(error, "Unable to update project"));
  }
});

export const removeProject = createAsyncThunk("projects/remove", async (id: string, thunkApi) => {
  try {
    await deleteProjectRequest(id);
    return id;
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(getErrorMessage(error, "Unable to delete project"));
  }
});

const projectsSlice = createSlice({
  name: "projects",
  initialState,
  reducers: {
    clearProjectsError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.error = null;
      })
      .addCase(loadProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Unable to load projects";
      })
      .addCase(addProject.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
        state.error = null;
      })
      .addCase(editProject.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item));
        state.error = null;
      })
      .addCase(removeProject.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
        state.error = null;
      });
  },
});

export const { clearProjectsError } = projectsSlice.actions;
export default projectsSlice.reducer;
