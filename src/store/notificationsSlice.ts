import { createSlice, nanoid, type PayloadAction } from "@reduxjs/toolkit";

export type ToastSeverity = "success" | "error" | "info" | "warning";

export type ToastItem = {
  id: string;
  message: string;
  severity: ToastSeverity;
  duration?: number;
};

type NotificationsState = {
  items: ToastItem[];
};

const initialState: NotificationsState = {
  items: [],
};

const notificationsSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    enqueueToast: {
      reducer(state, action: PayloadAction<ToastItem>) {
        state.items.push(action.payload);
      },
      prepare(input: Omit<ToastItem, "id">) {
        return {
          payload: {
            id: nanoid(),
            duration: 4000,
            ...input,
          } satisfies ToastItem,
        };
      },
    },
    dequeueToast(state, action: PayloadAction<string>) {
      state.items = state.items.filter((item) => item.id !== action.payload);
    },
  },
});

export const { enqueueToast, dequeueToast } = notificationsSlice.actions;
export default notificationsSlice.reducer;
