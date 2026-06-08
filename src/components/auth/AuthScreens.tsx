"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert, Box, Card, CardContent, Divider, Stack, TextField, Typography } from "@mui/material";
import { LayoutGrid } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { clearAuthMessages, forgotPassword, login, register } from "@/store/slices/authSlice";
import { BrandLoader, LoadingButton } from "@/components/ui/Loaders";

export function AuthFrame({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  const hydrated = useAppSelector((state) => state.auth.hydrated);

  if (!hydrated) {
    return <BrandLoader title="Loading your workspace" subtitle="Bringing your session and theme back into place." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-[radial-gradient(circle_at_top,_rgba(37,99,235,0.15),_transparent_40%),linear-gradient(180deg,_rgba(248,250,252,1),_rgba(226,232,240,1))] dark:bg-[radial-gradient(circle_at_top,_rgba(96,165,250,0.18),_transparent_40%),linear-gradient(180deg,_rgba(15,23,42,1),_rgba(2,6,23,1))]">
      <Card className="w-full max-w-lg !rounded-3xl !shadow-2xl border border-slate-200/70 dark:border-slate-700/60">
        <CardContent className="p-6 sm:p-8">
          <Stack spacing={1.5} mb={3}>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-blue-200/80 bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
              <LayoutGrid className="h-3.5 w-3.5" />
              Flowboard
            </div>
            <Typography variant="h4" fontWeight={800}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          </Stack>
          {children}
        </CardContent>
      </Card>
    </div>
  );
}

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = loginSchema.extend({
  name: z.string().min(2, "Name is required"),
});

const forgotSchema = z.object({
  email: z.string().email("Enter a valid email"),
});

export function LoginForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token, loading, error, message } = useAppSelector((state) => state.auth);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "ayesha@example.com", password: "password123" },
  });

  useEffect(() => {
    if (token) router.replace("/dashboard");
  }, [token, router]);

  useEffect(() => {
    return () => {
      dispatch(clearAuthMessages());
    };
  }, [dispatch]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await dispatch(login(values)).unwrap();
      dispatch(clearAuthMessages());
      router.replace("/dashboard");
    } catch {
      return;
    }
  });

  return (
    <AuthFrame title="Welcome back" subtitle="Sign in to manage projects, tasks, and analytics in one place.">
      <form onSubmit={onSubmit}>
        <Stack spacing={2}>
          {(error || message) && <Alert severity={error ? "error" : "success"}>{error ?? message}</Alert>}
          <TextField label="Email" type="email" {...form.register("email")} error={!!form.formState.errors.email} helperText={form.formState.errors.email?.message} />
          <TextField
            label="Password"
            type="password"
            {...form.register("password")}
            error={!!form.formState.errors.password}
            helperText={form.formState.errors.password?.message}
          />
          <LoadingButton type="submit" variant="contained" size="large" loading={loading} loadingLabel="Signing in...">
            Login
          </LoadingButton>
          <Box display="flex" justifyContent="space-between" flexWrap="wrap" gap={1}>
            <Link className="text-sm text-blue-600 dark:text-blue-300" href="/forgot-password">
              Forgot password?
            </Link>
            <Link className="text-sm text-blue-600 dark:text-blue-300" href="/register">
              Create account
            </Link>
          </Box>
          <Divider />
          <Typography variant="caption" color="text.secondary">
            Demo login: ayesha@example.com / password123
          </Typography>
        </Stack>
      </form>
    </AuthFrame>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token, loading, error, message } = useAppSelector((state) => state.auth);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  useEffect(() => {
    if (token) router.replace("/dashboard");
  }, [token, router]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await dispatch(register(values)).unwrap();
      dispatch(clearAuthMessages());
      router.replace("/login");
    } catch {
      return;
    }
  });

  return (
    <AuthFrame title="Create account" subtitle="Set up your workspace and start tracking projects and tasks.">
      <form onSubmit={onSubmit}>
        <Stack spacing={2}>
          {(error || message) && <Alert severity={error ? "error" : "success"}>{error ?? message}</Alert>}
          <TextField label="Full name" {...form.register("name")} error={!!form.formState.errors.name} helperText={form.formState.errors.name?.message} />
          <TextField label="Email" type="email" {...form.register("email")} error={!!form.formState.errors.email} helperText={form.formState.errors.email?.message} />
          <TextField
            label="Password"
            type="password"
            {...form.register("password")}
            error={!!form.formState.errors.password}
            helperText={form.formState.errors.password?.message}
          />
          <LoadingButton type="submit" variant="contained" size="large" loading={loading} loadingLabel="Creating account...">
            Register
          </LoadingButton>
          <Link className="text-sm text-blue-600 dark:text-blue-300" href="/login">
            Already have an account? Log in
          </Link>
        </Stack>
      </form>
    </AuthFrame>
  );
}

export function ForgotPasswordForm() {
  const dispatch = useAppDispatch();
  const { loading, error, message } = useAppSelector((state) => state.auth);
  const form = useForm<z.infer<typeof forgotSchema>>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    return () => {
      dispatch(clearAuthMessages());
    };
  }, [dispatch]);

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await dispatch(forgotPassword(values)).unwrap();
    } catch {
      return;
    }
  });

  return (
    <AuthFrame title="Reset password" subtitle="Enter your email and we will send password reset instructions.">
      <form onSubmit={onSubmit}>
        <Stack spacing={2}>
          {(error || message) && <Alert severity={error ? "error" : "success"}>{error ?? message}</Alert>}
          <TextField label="Email" type="email" {...form.register("email")} error={!!form.formState.errors.email} helperText={form.formState.errors.email?.message} />
          <LoadingButton type="submit" variant="contained" size="large" loading={loading} loadingLabel="Sending reset link...">
            Send reset link
          </LoadingButton>
          <Link className="text-sm text-blue-600 dark:text-blue-300" href="/login">
            Back to login
          </Link>
        </Stack>
      </form>
    </AuthFrame>
  );
}
