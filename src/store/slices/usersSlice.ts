import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AppUser } from "@/lib/types";
import { fetchUsers } from "@/lib/mock-api";

type UsersState = {
  items: AppUser[];
  loading: boolean;
  error: string | null;
};

const initialState: UsersState = {
  items: [],
  loading: false,
  error: null,
};

export const loadUsers = createAsyncThunk("users/load", async (_, thunkApi) => {
  try {
    return await fetchUsers();
  } catch (error: any) {
    return thunkApi.rejectWithValue(error?.response?.data?.message ?? "Unable to load users");
  }
});

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUsersError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Unable to load users";
      });
  },
});

export const { clearUsersError } = usersSlice.actions;
export default usersSlice.reducer;
