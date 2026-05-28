"use client";

import { usePathname } from "next/navigation";
import { Bell, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/store/authStore";
import { useUiStore } from "@/lib/store/uiStore";

const pageTitles: Record<string, { title: string; description: string }> = {
  "/": { title: "Dashboard", description: "Real-time observability overview" },
  "/incidents": { title: "Incidents", description: "Manage and track security incidents" },
  "/alerts": { title: "Alerts", description: "Monitor and acknowledge active alerts" },
  "/policies": { title: "Knowledge Policies", description: "AI firewall sanitization rules" },
  "/audit": { title: "Audit Trail", description: "Compliance log of all system events" },
  "/settings": { title: "Settings", description: "Profile, team, and preferences" },
};

export function Header() {
  const pathname = usePathname();
  const { user } = useAuthStore();
  const { liveAlertCount, resetAlertCount } = useUiStore();

  // Match nested routes too
  const matchedKey = Object.keys(pageTitles)
    .filter((k) => (k === "/" ? pathname === "/" : pathname.startsWith(k)))
    .sort((a, b) => b.length - a.length)[0];

  const page = pageTitles[matchedKey] ?? { title: "Sentinel", description: "" };

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-[#111827]/80 backdrop-blur-sm border-b border-[#2D3748] flex-shrink-0 sticky top-0 z-10">
      {/* Page title */}
      <div>
        <h1 className="text-lg font-semibold text-white leading-tight">{page.title}</h1>
        {page.description && (
          <p className="text-xs text-gray-500 leading-none mt-0.5">{page.description}</p>
        )}
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {/* Alert bell */}
        <button
          onClick={resetAlertCount}
          className={cn(
            "relative p-2 rounded-lg transition-all",
            liveAlertCount > 0
              ? "text-red-400 bg-red-500/10 hover:bg-red-500/20"
              : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
          )}
          title="Live alerts"
        >
          <Bell className="w-4 h-4" />
          {liveAlertCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-500 text-[9px] font-bold text-white flex items-center justify-center">
              {liveAlertCount > 9 ? "9+" : liveAlertCount}
            </span>
          )}
        </button>

        {/* Refresh indicator */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <RefreshCw className="w-3 h-3 animate-pulse text-emerald-400" />
          <span className="hidden sm:inline">Live</span>
        </div>

        {/* User avatar */}
        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">
          {user?.name?.charAt(0).toUpperCase() ?? "U"}
        </div>
      </div>
    </header>
  );
}
