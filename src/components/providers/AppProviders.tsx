"use client";

import type { ReactNode } from "react";
import { CssBaseline, ThemeProvider as MuiThemeProvider, createTheme } from "@mui/material";
import { Provider } from "react-redux";
import { store } from "@/store";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import { useEffect } from "react";
import { hydrateAuth } from "@/store/slices/authSlice";
import { useAppDispatch } from "@/store/hooks";
import { ToastHost } from "@/components/ui/ToastHost";

function Bootstraper({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  return <>{children}</>;
}

function MuiLayer({ children }: { children: ReactNode }) {
  const { theme } = useTheme();

  const muiTheme = createTheme({
    palette: {
      mode: theme,
      primary: {
        main: theme === "dark" ? "#60a5fa" : "#2563eb",
      },
      background: {
        default: theme === "dark" ? "#020617" : "#f8fafc",
        paper: theme === "dark" ? "#0f172a" : "#ffffff",
      },
    },
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
    },
  });

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <MuiLayer>
          <Bootstraper>{children}</Bootstraper>
          <ToastHost />
        </MuiLayer>
      </ThemeProvider>
    </Provider>
  );
}
