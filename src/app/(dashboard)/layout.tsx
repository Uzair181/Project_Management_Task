"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/AppShell";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loadProjects } from "@/store/slices/projectsSlice";
import { loadTasks } from "@/store/slices/tasksSlice";
import { loadUsers } from "@/store/slices/usersSlice";
import { BrandLoader } from "@/components/ui/Loaders";

export default function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { token, hydrated } = useAppSelector((state) => state.auth);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    if (!token) {
      setBooting(false);
      router.replace("/login");
      return;
    }
    let active = true;
    setBooting(true);

    Promise.all([dispatch(loadProjects()), dispatch(loadTasks()), dispatch(loadUsers())]).finally(() => {
      if (active) setBooting(false);
    });

    return () => {
      active = false;
    };
  }, [dispatch, hydrated, router, token]);

  if (!hydrated || !token || booting) {
    return <BrandLoader title="Loading dashboard" subtitle="Fetching projects and tasks before you jump back in." />;
  }

  return <AppShell>{children}</AppShell>;
}
