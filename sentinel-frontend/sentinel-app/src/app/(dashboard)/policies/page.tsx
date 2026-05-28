"use client";

import { useState } from "react";
import { Plus, Edit2, Trash2, Shield, BookOpen, X } from "lucide-react";
import { usePolicies, useCreatePolicy, useUpdatePolicy, useDeletePolicy } from "@/lib/hooks/usePolicies";
import { useWebSocket } from "@/lib/hooks/useWebSocket";
import { PageLoader } from "@/components/common/LoadingSpinner";
import { EmptyState } from "@/components/common/EmptyState";
import { toast } from "@/components/toaster";
import { formatRelativeTime } from "@/lib/utils/formatters";
import { cn } from "@/lib/utils";
import type { Policy, CreatePolicyDto } from "@/lib/types/policy";

export default function PoliciesPage() {
  const { data, isLoading } = usePolicies();
  const createPolicy = useCreatePolicy();
  const updatePolicy = useUpdatePolicy();
  const deletePolicy = useDeletePolicy();
  const [showModal, setShowModal] = useState(false);
  const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);

  useWebSocket({
    subscriptions: ["policies"],
    onPolicyViolation: (d) => {
      const payload = d as { violations?: Array<{ policy_name?: string }> };
      toast.warning("Policy Violation Detected", payload.violations?.[0]?.policy_name ?? "Unknown policy");
    },
  });

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this policy?")) return;
    try {
      await deletePolicy.mutateAsync(id);
      toast.success("Policy deleted");
    } catch {
      toast.error("Failed to delete policy");
    }
  };

  const handleSave = async (dto: CreatePolicyDto, id?: string) => {
    try {
      if (id) {
        await updatePolicy.mutateAsync({ id, dto });
        toast.success("Policy updated");
      } else {
        await createPolicy.mutateAsync(dto);
        toast.success("Policy created");
      }
      setShowModal(false);
      setEditingPolicy(null);
    } catch {
      toast.error("Failed to save policy");
    }
  };

  const policies = data?.data ?? [];

  return (
    <div className="space-y-5 max-w-[1200px]">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">{policies.length} policies active</p>
        <button
          onClick={() => { setEditingPolicy(null); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 gradient-primary rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all"
        >
          <Plus className="w-4 h-4" /> New Policy
        </button>
      </div>

      {isLoading ? (
        <PageLoader />
      ) : policies.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No policies yet"
          description="Create knowledge policies to define what the AI firewall should block or allow."
          action={
            <button onClick={() => setShowModal(true)}
              className="px-4 py-2 gradient-primary rounded-lg text-sm font-semibold text-white hover:opacity-90 transition-all">
              Create first policy
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {policies.map((policy) => (
            <div key={policy.id} className="bg-[#111827] border border-[#2D3748] rounded-xl p-5 hover:border-indigo-500/20 transition-all group">
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                    <Shield className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{policy.name}</h3>
                    <p className="text-[10px] text-gray-600">{formatRelativeTime(policy.created_at)}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setEditingPolicy(policy); setShowModal(true); }}
                    className="p-1.5 rounded-md text-gray-500 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(policy.id)}
                    className="p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {policy.description && (
                <p className="text-xs text-gray-500 mb-3">{policy.description}</p>
              )}

              {/* Blocked keywords */}
              {policy.blocked_keywords?.length > 0 && (
                <div className="mb-2">
                  <p className="text-[10px] text-gray-600 uppercase tracking-wide mb-1.5">Blocked Keywords</p>
                  <div className="flex flex-wrap gap-1">
                    {policy.blocked_keywords.slice(0, 6).map((kw) => (
                      <span key={kw} className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/10 text-red-400 border border-red-500/15 font-mono">
                        {kw}
                      </span>
                    ))}
                    {policy.blocked_keywords.length > 6 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-500/10 text-gray-500">
                        +{policy.blocked_keywords.length - 6} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Allowed domains */}
              {policy.allowed_domains?.length > 0 && (
                <div>
                  <p className="text-[10px] text-gray-600 uppercase tracking-wide mb-1.5">Allowed Domains</p>
                  <div className="flex flex-wrap gap-1">
                    {policy.allowed_domains.slice(0, 4).map((d) => (
                      <span key={d} className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 font-mono">
                        {d}
                      </span>
                    ))}
                    {policy.allowed_domains.length > 4 && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-gray-500/10 text-gray-500">
                        +{policy.allowed_domains.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <PolicyModal
          policy={editingPolicy}
          onClose={() => { setShowModal(false); setEditingPolicy(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function PolicyModal({
  policy,
  onClose,
  onSave,
}: {
  policy: Policy | null;
  onClose: () => void;
  onSave: (dto: CreatePolicyDto, id?: string) => Promise<void>;
}) {
  const [name, setName] = useState(policy?.name ?? "");
  const [description, setDescription] = useState(policy?.description ?? "");
  const [blockedInput, setBlockedInput] = useState("");
  const [blocked, setBlocked] = useState<string[]>(policy?.blocked_keywords ?? []);
  const [domainInput, setDomainInput] = useState("");
  const [domains, setDomains] = useState<string[]>(policy?.allowed_domains ?? []);
  const [loading, setLoading] = useState(false);

  const addChip = (
    input: string,
    setInput: (v: string) => void,
    list: string[],
    setList: (v: string[]) => void
  ) => {
    const val = input.trim();
    if (val && !list.includes(val)) setList([...list, val]);
    setInput("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    setLoading(true);
    await onSave({ name, description, blocked_keywords: blocked, allowed_domains: domains }, policy?.id);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#111827] border border-[#2D3748] rounded-2xl w-full max-w-lg p-6 animate-slide-in-top max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-white mb-5">{policy ? "Edit Policy" : "Create Policy"}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Policy Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 placeholder-gray-600"
              placeholder="e.g. PII Data Protection" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-indigo-500/50 placeholder-gray-600"
              placeholder="Brief description of what this policy does" />
          </div>

          {/* Blocked keywords chip input */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Blocked Keywords</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {blocked.map((kw) => (
                <span key={kw} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-red-500/10 text-red-400 border border-red-500/15">
                  {kw}
                  <button type="button" onClick={() => setBlocked(blocked.filter((k) => k !== kw))} className="hover:text-red-300">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
            <input
              value={blockedInput}
              onChange={(e) => setBlockedInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addChip(blockedInput, setBlockedInput, blocked, setBlocked); }}}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-red-500/30 placeholder-gray-600 font-mono"
              placeholder="Type keyword + Enter to add" />
          </div>

          {/* Allowed domains chip input */}
          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Allowed Domains</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {domains.map((d) => (
                <span key={d} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/15">
                  {d}
                  <button type="button" onClick={() => setDomains(domains.filter((x) => x !== d))} className="hover:text-emerald-300">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              ))}
            </div>
            <input
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addChip(domainInput, setDomainInput, domains, setDomains); }}}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/30 placeholder-gray-600 font-mono"
              placeholder="Type domain + Enter to add (e.g. example.com)" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2 rounded-lg border border-[#2D3748] text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className={cn("flex-1 py-2 rounded-lg text-sm font-semibold text-white gradient-primary hover:opacity-90 transition-all disabled:opacity-60")}>
              {loading ? "Saving…" : policy ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
