"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FolderKanban, ListChecks, LogOut, Moon, Sun, LayoutGrid } from "lucide-react";
import { Button } from "@mui/material";
import { useTheme } from "@/contexts/ThemeContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { signOut } from "@/store/slices/authSlice";
import { LoadingButton } from "@/components/ui/Loaders";

const nav = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/projects", label: "Projects", icon: FolderKanban },
    { to: "/tasks", label: "Tasks", icon: ListChecks },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const dispatch = useAppDispatch();
    const user = useAppSelector((state) => state.auth.user);
    const signOutLoading = useAppSelector((state) => state.auth.loading);
    const { theme, toggle } = useTheme();

    return (
        <div className="min-h-screen flex flex-col md:flex-row bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_38%),linear-gradient(180deg,_rgba(248,250,252,1),_rgba(241,245,249,1))] dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_42%),linear-gradient(180deg,_rgba(15,23,42,1),_rgba(2,6,23,1))]">
            <aside className="md:w-72 md:min-h-screen border-b md:border-b-0 md:border-r border-slate-200/70 dark:border-slate-700/60 bg-white/80 dark:bg-slate-950/70 backdrop-blur-xl flex md:flex-col shadow-sm">
                <div className="p-5 flex items-center gap-3 font-semibold border-b border-slate-200/70 dark:border-slate-700/60">
                    <span className="grid h-9 w-9 place-items-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-400 text-white shadow-lg shadow-blue-500/30">
                        <LayoutGrid className="h-5 w-5" />
                    </span>
                    <span>Flowboard</span>
                </div>
                <nav className="flex md:flex-col gap-1 p-3 flex-1 overflow-x-auto">
                    {nav.map(({ to, label, icon: Icon }) => {
                        const active = pathname === to || pathname?.startsWith(`${to}/`);
                        return (
                            <Link
                                key={to}
                                href={to}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition ${active ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900 shadow-glow" : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                                    }`}>
                                <Icon className="h-4 w-4" /> {label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-4 border-t border-slate-200/70 dark:border-slate-700/60 hidden md:block space-y-3">
                    <div className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email}</div>
                    <div className="flex gap-2">
                        <Button variant="outlined" size="small" fullWidth onClick={toggle}>
                            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                        </Button>
                        <LoadingButton
                            variant="outlined"
                            size="small"
                            fullWidth
                            loading={signOutLoading}
                            loadingLabel={null}
                            onClick={async () => {
                                try {
                                    await dispatch(signOut()).unwrap();
                                } finally {
                                    router.replace("/login");
                                }
                            }}>
                            <LogOut className="h-4 w-4" />
                        </LoadingButton>
                    </div>
                </div>
                <div className="md:hidden flex items-center gap-2 p-3 ml-auto">
                    <Button variant="text" size="small" onClick={toggle}>{theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}</Button>
                    <LoadingButton
                        variant="text"
                        size="small"
                        loading={signOutLoading}
                        loadingLabel={null}
                        onClick={async () => {
                            try {
                                await dispatch(signOut()).unwrap();
                            } finally {
                                router.replace("/login");
                            }
                        }}>
                        <LogOut className="h-4 w-4" />
                    </LoadingButton>
                </div>
            </aside>
            <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
                {children}
            </main>
        </div>
    );
}
