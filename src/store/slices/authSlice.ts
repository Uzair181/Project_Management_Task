import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { AppUser } from "@/lib/types";
import { authStorage } from "@/lib/storage";
import { fetchSession, forgotPasswordRequest, loginRequest, logoutRequest, registerRequest } from "@/lib/mock-api";

type AuthState = {
  user: AppUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  message: string | null;
  hydrated: boolean;
};

function normalizeUser(user: AppUser | null | undefined): AppUser | null {
  if (!user) return null;
  const { id, name, email, role } = user;
  return { id, name, email, role };
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "response" in error) {
    const e = error as { response?: { data?: { message?: string } } };
    return e.response?.data?.message ?? fallback;
  }
  return fallback;
}

const initialState: AuthState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  message: null,
  hydrated: false,
};

export const hydrateAuth = createAsyncThunk("auth/hydrate", async () => {
  try {
    return await fetchSession();
  } catch {
    return null;
  }
});

export const login = createAsyncThunk("auth/login", async ({ email, password }: { email: string; password: string }, thunkApi) => {
  try {
    return await loginRequest(email, password);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(getErrorMessage(error, "Unable to login"));
  }
});

export const register = createAsyncThunk(
  "auth/register",
  async ({ name, email, password }: { name: string; email: string; password: string }, thunkApi) => {
    try {
      return await registerRequest(name, email, password);
    } catch (error: unknown) {
      return thunkApi.rejectWithValue(getErrorMessage(error, "Unable to register"));
    }
  }
);

export const forgotPassword = createAsyncThunk("auth/forgotPassword", async ({ email }: { email: string }, thunkApi) => {
  try {
    return await forgotPasswordRequest(email);
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(getErrorMessage(error, "Unable to send reset instructions"));
  }
});

export const signOut = createAsyncThunk("auth/signOut", async (_, thunkApi) => {
  try {
    return await logoutRequest();
  } catch (error: unknown) {
    return thunkApi.rejectWithValue(getErrorMessage(error, "Unable to sign out"));
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuthMessages(state) {
      state.error = null;
      state.message = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(hydrateAuth.fulfilled, (state, action) => {
        state.hydrated = true;
        if (action.payload) {
          state.user = normalizeUser(action.payload.user);
          state.token = action.payload.token;
        } else {
          const cached = authStorage.read();
          state.user = normalizeUser(cached?.user as AppUser | null);
          state.token = cached?.token ?? null;
        }
      })
      .addCase(hydrateAuth.rejected, (state) => {
        state.hydrated = true;
      })
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = normalizeUser(action.payload.user);
        state.token = action.payload.token;
        state.message = "Logged in successfully";
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Unable to login";
      })
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(register.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.message = "Account created successfully. Please log in.";
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Unable to register";
      })
      .addCase(forgotPassword.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.loading = false;
        state.message = action.payload.message;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Unable to send reset instructions";
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.loading = false;
        state.message = "Signed out";
      })
      .addCase(signOut.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = null;
      })
      .addCase(signOut.rejected, (state, action) => {
        state.loading = false;
        state.error = (action.payload as string) ?? "Unable to sign out";
      });
  },
});

export const { clearAuthMessages } = authSlice.actions;
export default authSlice.reducer;
