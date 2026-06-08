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

export const loadProjects = createAsyncThunk("projects/load", async (_, thunkApi) => {
  try {
    return await fetchProjects();
  } catch (error: any) {
    return thunkApi.rejectWithValue(error?.response?.data?.message ?? "Unable to load projects");
  }
});

export const addProject = createAsyncThunk("projects/add", async (input: Pick<Project, "name" | "description" | "status">, thunkApi) => {
  try {
    return await createProjectRequest(input);
  } catch (error: any) {
    return thunkApi.rejectWithValue(error?.response?.data?.message ?? "Unable to create project");
  }
});

export const editProject = createAsyncThunk("projects/edit", async ({ id, input }: { id: string; input: Partial<Project> }, thunkApi) => {
  try {
    return await updateProjectRequest(id, input);
  } catch (error: any) {
    return thunkApi.rejectWithValue(error?.response?.data?.message ?? "Unable to update project");
  }
});

export const removeProject = createAsyncThunk("projects/remove", async (id: string, thunkApi) => {
  try {
    await deleteProjectRequest(id);
    return id;
  } catch (error: any) {
    return thunkApi.rejectWithValue(error?.response?.data?.message ?? "Unable to delete project");
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
      })
      .addCase(loadProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Unable to load projects";
      })
      .addCase(addProject.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(editProject.fulfilled, (state, action) => {
        state.items = state.items.map((item) => (item.id === action.payload.id ? action.payload : item));
      })
      .addCase(removeProject.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const { clearProjectsError } = projectsSlice.actions;
export default projectsSlice.reducer;
