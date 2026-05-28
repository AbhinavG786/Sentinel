"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/store/authStore";
import { usersApi } from "@/lib/api/users";
import { toast } from "@/components/toaster";
import { User, Users, Bell, Key, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

type Tab = "profile" | "team" | "notifications" | "api";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const mockApiKey = `sk-sentinel-${(user?.id ?? "demo").slice(0, 8)}-xxxxxxxxxxxx`;

  const handleCopy = () => {
    navigator.clipboard.writeText(mockApiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    try {
      const dto: Record<string, string> = { name, email };
      if (password) dto.password = password;
      const updated = await usersApi.update(user.id, dto);
      updateUser(updated);
      toast.success("Profile updated");
      setPassword("");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "profile" as Tab, label: "Profile", icon: User },
    { id: "team" as Tab, label: "Team", icon: Users },
    { id: "notifications" as Tab, label: "Notifications", icon: Bell },
    { id: "api" as Tab, label: "API Keys", icon: Key },
  ];

  return (
    <div className="max-w-3xl space-y-6">
      {/* Tabs */}
      <div className="flex gap-1 bg-[#111827] rounded-lg p-1 border border-[#2D3748] w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all",
              activeTab === id
                ? "bg-indigo-500/15 text-indigo-400 border border-indigo-500/20"
                : "text-gray-500 hover:text-gray-300"
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-[#111827] border border-[#2D3748] rounded-xl p-6">
          <h3 className="text-base font-semibold text-white mb-5">Profile Settings</h3>
          <form onSubmit={handleSaveProfile} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5">New Password <span className="text-gray-600">(leave blank to keep current)</span></label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                className="w-full px-3 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50" />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white font-bold flex-shrink-0">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
            <button type="submit" disabled={saving}
              className="px-5 py-2 gradient-primary rounded-lg text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-all">
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </div>
      )}

      {/* Team Tab */}
      {activeTab === "team" && (
        <div className="bg-[#111827] border border-[#2D3748] rounded-xl p-6">
          <h3 className="text-base font-semibold text-white mb-5">Team Members</h3>
          <div className="space-y-3">
            {[user].filter(Boolean).map((member) => (
              <div key={member!.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/3 border border-white/5">
                <div className="w-9 h-9 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  {member!.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{member!.name}</p>
                  <p className="text-xs text-gray-500">{member!.email}</p>
                </div>
                <span className="px-2 py-0.5 rounded-md text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 capitalize">
                  {member!.role}
                </span>
              </div>
            ))}
            <p className="text-xs text-gray-600 text-center pt-2">Use the admin panel to invite additional team members.</p>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="bg-[#111827] border border-[#2D3748] rounded-xl p-6 space-y-4">
          <h3 className="text-base font-semibold text-white mb-2">Notification Preferences</h3>
          {[
            { label: "Slack alerts for critical incidents", enabled: true },
            { label: "Email digest (daily summary)", enabled: false },
            { label: "Browser push notifications", enabled: true },
            { label: "Policy violation alerts", enabled: true },
          ].map(({ label, enabled }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-[#1C2333] last:border-0">
              <span className="text-sm text-gray-300">{label}</span>
              <div className={cn(
                "w-9 h-5 rounded-full transition-all relative cursor-pointer",
                enabled ? "bg-indigo-500" : "bg-[#2D3748]"
              )}>
                <div className={cn(
                  "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all",
                  enabled ? "left-4" : "left-0.5"
                )} />
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-600 pt-2">
            Actual Slack/Email configuration is managed via backend environment variables.
          </p>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === "api" && (
        <div className="bg-[#111827] border border-[#2D3748] rounded-xl p-6">
          <h3 className="text-base font-semibold text-white mb-2">API Keys</h3>
          <p className="text-xs text-gray-500 mb-5">
            Use this key to authenticate SDK integrations with the Sentinel firewall ingest API.
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 px-3 py-2.5 bg-[#0A0E1A] border border-[#2D3748] rounded-lg text-xs font-mono text-gray-300 truncate">
              {mockApiKey}
            </code>
            <button onClick={handleCopy}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-all border",
                copied
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
              )}>
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="mt-4 bg-yellow-500/5 border border-yellow-500/15 rounded-lg p-3">
            <p className="text-xs text-yellow-400">
              ⚠️ Never share your API key publicly. Rotate it immediately if compromised.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
