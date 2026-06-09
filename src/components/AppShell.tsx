"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  ListChecks,
  LogOut,
  Moon,
  Sun,
  LayoutGrid,
  Menu,
  X,
} from "lucide-react";
import { Avatar, Drawer, IconButton, Tooltip, useMediaQuery } from "@mui/material";
import { useTheme } from "@/contexts/ThemeContext";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { signOut } from "@/store/slices/authSlice";
import { LoadingButton } from "@/components/ui/Loaders";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/projects", label: "Projects", icon: FolderKanban },
  { to: "/tasks", label: "Tasks", icon: ListChecks },
] as const;

interface SidebarProps {
  mobile: boolean;
  pathname: string;
  userName?: string;
  userEmail?: string;
  theme: "light" | "dark";
  signOutLoading: boolean;
  onClose: () => void;
  onToggleTheme: () => void;
  onSignOut: () => void;
}

function Sidebar({ mobile, pathname, userName, userEmail, theme, signOutLoading, onClose, onToggleTheme, onSignOut }: SidebarProps) {
  const base = mobile
    ? "bg-slate-950 text-white"
    : "bg-white dark:bg-slate-950 text-slate-900 dark:text-white";

  return (
    <div className={`flex h-full flex-col ${base}`}>

      {/* Logo / Brand section */}
      <div className={`flex items-center justify-between px-3 py-3 shrink-0 border-b ${mobile ? "border-white/8" : "border-slate-200/70 dark:border-slate-700/60"}`}>
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-400 shadow-lg shadow-blue-500/30">
            <LayoutGrid className="h-4.5 w-4.5 text-white" />
          </div>
          <div className="min-w-0">
            <p className={`text-sm font-extrabold tracking-tight truncate leading-tight ${mobile ? "text-white" : "text-slate-900 dark:text-white"}`}>
              Flowboard
            </p>
            <p className={`text-[10px] truncate leading-tight font-medium ${mobile ? "text-white/45" : "text-slate-400 dark:text-slate-500"}`}>
              Project management
            </p>
          </div>
        </div>
        {mobile && (
          <IconButton size="small" onClick={onClose} className="!text-white/50 hover:!text-white">
            <X className="h-4 w-4" />
          </IconButton>
        )}
      </div>

      {/* Nav — no scroll, just static list */}
      <nav className="flex flex-col gap-0.5 px-2 pt-1 flex-1">
        {nav.map(({ to, label, icon: Icon }) => {
          const active = pathname === to || pathname?.startsWith(`${to}/`);
          return (
            <Link
              key={to}
              href={to}
              onClick={onClose}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${active
                ? "bg-blue-600 text-white"
                : mobile
                  ? "text-white/65 hover:bg-white/8 hover:text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50"
                }`}
            >
              <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-md ${active ? "bg-white/20" : mobile ? "bg-white/8" : "bg-slate-100 dark:bg-slate-800"
                }`}>
                <Icon className="h-3.5 w-3.5" />
              </span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom — mobile gets user info + theme; both get sign out */}
      <div className="px-2 pb-3 pt-2 space-y-0.5 shrink-0">
        {mobile && (
          <div className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 mb-1 bg-white/6">
            <Avatar sx={{ width: 30, height: 30, bgcolor: "rgba(255,255,255,0.15)", color: "#fff", fontSize: 12, fontWeight: 700 }}>
              {userName?.[0]?.toUpperCase() ?? "U"}
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-tight">{userName ?? "User"}</p>
              <p className="text-xs text-white/50 truncate leading-tight">{userEmail}</p>
            </div>
          </div>
        )}
        <LoadingButton
          variant="text" size="small" fullWidth
          loading={signOutLoading} loadingLabel="Signing out…"
          onClick={onSignOut}
          className={mobile
            ? "!justify-start !gap-3 !rounded-lg !px-3 !py-2.5 !text-sm !font-medium !text-red-400 hover:!bg-red-500/10 hover:!text-red-300 !normal-case"
            : "!justify-start !gap-3 !rounded-lg !px-3 !py-2.5 !text-sm !font-medium !text-red-500 dark:!text-red-400 hover:!bg-red-50 dark:hover:!bg-red-500/10 hover:!text-red-600 dark:hover:!text-red-300 !normal-case"
          }
        >
          <LogOut className="h-3.5 w-3.5 shrink-0" />
          <span>Sign out</span>
        </LoadingButton>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const signOutLoading = useAppSelector((s) => s.auth.loading);
  const { theme, toggle } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const isDesktop = useMediaQuery("(min-width:768px)", { noSsr: true });

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => { if (isDesktop) setMobileOpen(false); }, [isDesktop]);

  const handleSignOut = async () => {
    try { await dispatch(signOut()).unwrap(); }
    finally { router.replace("/login"); }
  };

  const sidebarProps: Omit<SidebarProps, "mobile"> = {
    pathname: pathname ?? "",
    userName: user?.name,
    userEmail: user?.email,
    theme,
    signOutLoading,
    onClose: () => setMobileOpen(false),
    onToggleTheme: toggle,
    onSignOut: handleSignOut,
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_38%),linear-gradient(180deg,_rgba(248,250,252,1),_rgba(241,245,249,1))] dark:bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_42%),linear-gradient(180deg,_rgba(15,23,42,1),_rgba(2,6,23,1))]">

      {/* Sticky Topbar */}
      <header className="shrink-0 z-30 flex items-center justify-between gap-4 px-4 md:px-6 h-14 bg-white/80 dark:bg-slate-950/75 backdrop-blur-xl border-b border-slate-200/70 dark:border-slate-700/60">
        {/* Left: hamburger on mobile only */}
        <div className="flex items-center gap-2">
          {mounted && !isDesktop && (
            <IconButton onClick={() => setMobileOpen(true)} className="!text-slate-700 dark:!text-slate-200 !-ml-1">
              <Menu className="h-5 w-5" />
            </IconButton>
          )}
        </div>

        {/* Right: theme toggle + user card */}
        <div className="flex items-center gap-2">
          <Tooltip title={theme === "light" ? "Dark mode" : "Light mode"}>
            <IconButton onClick={toggle} size="small" className="!text-slate-600 dark:!text-slate-300">
              {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </IconButton>
          </Tooltip>
          <div className="hidden md:flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-700/60 bg-slate-50 dark:bg-slate-900/60 px-2.5 py-1.5">
            <Avatar sx={{ width: 26, height: 26, bgcolor: "rgba(37,99,235,0.12)", color: "#1e3a8a", fontSize: 11, fontWeight: 700 }}>
              {user?.name?.[0]?.toUpperCase() ?? "U"}
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-900 dark:text-white truncate leading-tight">{user?.name ?? "User"}</p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate leading-tight">{user?.email}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Body — fills remaining height, no overflow */}
      <div className="flex flex-1 min-h-0 mx-auto w-full max-w-[1600px]">

        {/* Mobile drawer */}
        {mounted && !isDesktop && (
          <Drawer
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            variant="temporary"
            anchor="left"
            ModalProps={{ keepMounted: true }}
            slotProps={{ paper: { sx: { width: 240, background: "transparent", border: "none", boxShadow: "12px 0 40px rgba(0,0,0,0.35)" } } }}
          >
            <Sidebar mobile {...sidebarProps} />
          </Drawer>
        )}

        {/* Sticky Desktop sidebar */}
        <aside className="hidden md:flex w-56 shrink-0 border-r border-slate-200/70 dark:border-slate-700/60 flex-col overflow-y-auto">
          <Sidebar mobile={false} {...sidebarProps} />
        </aside>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
