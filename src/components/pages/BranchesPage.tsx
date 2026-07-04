import React, { useState } from "react";
import { Copy, ExternalLink, Edit, Trash2, X } from "lucide-react";
import { Branch, createBranch, updateBranch, deleteBranch } from "../../lib/api";

interface BranchesPageProps {
  branches: Branch[];
  onBranchesUpdated: (updatedBranches: Branch[]) => void;
  getBranchDashboardUrl: (id: string) => string;
  copyBranchDashboardUrl: (id: string) => void;
}

export function BranchesPage({
  branches,
  onBranchesUpdated,
  getBranchDashboardUrl,
  copyBranchDashboardUrl
}: BranchesPageProps) {
  const [branchForm, setBranchForm] = useState<{
    name: string;
    city: string;
    address: string;
    phone: string;
  }>({ name: "", city: "", address: "", phone: "" });
  const [branchSubmitting, setBranchSubmitting] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function startEditBranch(branch: Branch) {
    setEditingBranchId(branch._id);
    setBranchForm({
      name: branch.name,
      city: branch.city,
      address: branch.address || "",
      phone: branch.phone || ""
    });
  }

  function cancelEditBranch() {
    setEditingBranchId(null);
    setBranchForm({ name: "", city: "", address: "", phone: "" });
  }

  async function handleBranchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!branchForm.name || !branchForm.city) return;
    setError("");
    setBranchSubmitting(true);
    try {
      if (editingBranchId) {
        const saved = await updateBranch(editingBranchId, branchForm);
        const updated = branches.map((b) => (b._id === editingBranchId ? saved : b));
        onBranchesUpdated(updated);
        setNotice("Branch updated successfully!");
        cancelEditBranch();
      } else {
        const saved = await createBranch(branchForm);
        const updated = [...branches, saved];
        onBranchesUpdated(updated);
        setNotice("Branch registered successfully!");
        cancelEditBranch();
      }
    } catch (err: any) {
      setError(err.message || "Failed to save branch");
    } finally {
      setBranchSubmitting(false);
    }
  }

  async function handleBranchDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this branch? Any doctors/appointments linked to it will need to be re-assigned.")) return;
    setError("");
    try {
      await deleteBranch(id);
      const updated = branches.filter((b) => b._id !== id);
      onBranchesUpdated(updated);
      setNotice("Branch deleted successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to delete branch");
    }
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError("")}>
            <X size={16} />
          </button>
        </div>
      )}

      {notice && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex justify-between items-center">
          <span>{notice}</span>
          <button onClick={() => setNotice("")}>
            <X size={16} />
          </button>
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        {/* Branch Form */}
        <form onSubmit={handleBranchSubmit} className="rounded-2xl border border-teal-100 bg-white p-5 shadow-soft h-fit">
          <h3 className="mb-5 text-lg font-bold text-clinic-ink">
            {editingBranchId ? "Edit Branch Info" : "Register New Branch"}
          </h3>

          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-semibold text-slate-600">Branch Name</span>
            <input
              required
              value={branchForm.name}
              onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
              placeholder="Maruthi Pet Clinic - Hyderabad"
              className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm"
            />
          </label>

          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-semibold text-slate-600">City</span>
            <input
              required
              value={branchForm.city}
              onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
              placeholder="Hyderabad"
              className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm"
            />
          </label>

          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-semibold text-slate-600">Address</span>
            <input
              value={branchForm.address}
              onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
              placeholder="Banjara Hills, Road No. 12"
              className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm"
            />
          </label>

          <label className="mb-6 block">
            <span className="mb-2 block text-sm font-semibold text-slate-600">Phone Number</span>
            <input
              value={branchForm.phone}
              onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
              placeholder="+91 40 12345678"
              className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm"
            />
          </label>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={branchSubmitting}
              className="flex-1 rounded bg-clinic-teal py-3 font-bold text-white shadow-soft transition hover:bg-teal-700 disabled:opacity-50 text-sm"
            >
              {branchSubmitting
                ? "Saving..."
                : editingBranchId
                ? "Update Branch"
                : "Create Branch"}
            </button>
            {editingBranchId && (
              <button
                type="button"
                onClick={cancelEditBranch}
                className="rounded border border-slate-200 px-4 text-sm font-semibold text-slate-500 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Branch List */}
        <div className="rounded-2xl border border-teal-100 bg-white shadow-soft overflow-hidden h-fit">
          <div className="border-b border-teal-100 px-5 py-4">
            <h3 className="text-lg font-bold text-clinic-ink">Active Clinic Locations</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-teal-50 text-xs uppercase tracking-[0.14em] text-teal-700">
                <tr>
                  <th className="px-5 py-4">Branch Name</th>
                  <th className="px-5 py-4">City</th>
                  <th className="px-5 py-4">Address</th>
                  <th className="px-5 py-4">Phone</th>
                  <th className="px-5 py-4">Dashboard URL</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {branches.map((b) => (
                  <tr key={b._id} className="transition hover:bg-slate-50 text-sm">
                    <td className="px-5 py-4 font-bold text-clinic-ink">{b.name}</td>
                    <td className="px-5 py-4 text-slate-600 font-semibold">{b.city}</td>
                    <td className="px-5 py-4 text-slate-500">{b.address || "—"}</td>
                    <td className="px-5 py-4 text-slate-500">{b.phone || "—"}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <code className="max-w-[220px] truncate rounded bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-500">
                          {getBranchDashboardUrl(b._id)}
                        </code>
                        <button
                          type="button"
                          onClick={() => copyBranchDashboardUrl(b._id)}
                          className="rounded bg-slate-100 p-2 text-slate-500 transition hover:bg-clinic-teal hover:text-white"
                          title="Copy branch dashboard URL"
                        >
                          <Copy size={14} />
                        </button>
                        <a
                          href={getBranchDashboardUrl(b._id)}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded bg-teal-50 p-2 text-clinic-teal transition hover:bg-clinic-teal hover:text-white"
                          title="Open branch dashboard"
                        >
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => startEditBranch(b)}
                        className="rounded bg-teal-50 text-clinic-teal hover:bg-clinic-teal hover:text-white p-2 text-xs font-bold transition"
                        title="Edit Branch"
                      >
                        <Edit size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBranchDelete(b._id)}
                        className="rounded bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white p-2 text-xs font-bold transition"
                        title="Delete Branch"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {branches.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-10 text-center text-slate-400 font-semibold">
                      No active clinic locations setup yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
