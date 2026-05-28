"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Shield,
  LayoutDashboard,
  AlertTriangle,
  Bell,
  BookOpen,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUiStore } from "@/lib/store/uiStore";
import { useAuthStore } from "@/lib/store/authStore";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/incidents", label: "Incidents", icon: AlertTriangle },
  { href: "/alerts", label: "Alerts", icon: Bell, badge: true },
  { href: "/policies", label: "Policies", icon: BookOpen },
  { href: "/audit", label: "Audit Trail", icon: FileText },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { sidebarCollapsed, toggleSidebar, liveAlertCount } = useUiStore();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    document.cookie = "sentinel-token=; path=/; max-age=0";
    router.push("/login");
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-[#111827] border-r border-[#2D3748] transition-all duration-300 ease-in-out relative z-20",
        sidebarCollapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className={cn(
        "flex items-center h-16 px-4 border-b border-[#2D3748] flex-shrink-0",
        sidebarCollapsed ? "justify-center" : "gap-3"
      )}>
        <div className="flex-shrink-0 w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
          <Shield className="w-4 h-4 text-white" />
        </div>
        {!sidebarCollapsed && (
          <span className="font-bold text-white text-lg tracking-tight">Sentinel</span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon, badge }) => {
          const isActive = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group relative",
                isActive
                  ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20"
                  : "text-gray-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("w-4 h-4 flex-shrink-0", isActive ? "text-indigo-400" : "")} />
              {!sidebarCollapsed && <span className="flex-1">{label}</span>}

              {/* Alert badge */}
              {badge && liveAlertCount > 0 && (
                <span className={cn(
                  "flex-shrink-0 rounded-full text-xs font-bold text-white gradient-primary",
                  sidebarCollapsed
                    ? "absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center text-[9px]"
                    : "w-5 h-5 flex items-center justify-center"
                )}>
                  {liveAlertCount > 9 ? "9+" : liveAlertCount}
                </span>
              )}

              {/* Tooltip on collapsed */}
              {sidebarCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-[#1C2333] text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-[#2D3748] z-50">
                  {label}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Live indicator */}
      {!sidebarCollapsed && (
        <div className="px-4 py-2 border-t border-[#2D3748]">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Activity className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400">Live</span>
            <span>monitoring active</span>
          </div>
        </div>
      )}

      {/* User + Logout */}
      <div className={cn(
        "flex items-center border-t border-[#2D3748] p-3 gap-3",
        sidebarCollapsed ? "justify-center flex-col" : ""
      )}>
        {!sidebarCollapsed && user && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          title="Logout"
          className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-[#1C2333] border border-[#2D3748] flex items-center justify-center text-gray-400 hover:text-white hover:bg-indigo-500/20 transition-all z-30"
      >
        {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
