import React, { useState, useEffect } from "react";
import { Settings, Calendar, Plus, Trash2, Save, Sparkles, CheckCircle2 } from "lucide-react";
import { Branch, updateBranch } from "../../lib/api";

interface BranchSettingsPageProps {
  selectedBranchId: string;
  branches: Branch[];
  onBranchesUpdated: (updated: Branch[]) => void;
}

export function BranchSettingsPage({
  selectedBranchId,
  branches,
  onBranchesUpdated
}: BranchSettingsPageProps) {
  const currentBranch = branches.find((b) => b._id === selectedBranchId) || null;

  const [price, setPrice] = useState<number>(500);
  const [availableDates, setAvailableDates] = useState<string[]>([]);
  const [newDate, setNewDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentBranch) {
      setPrice(currentBranch.videoCallPrice ?? 500);
      setAvailableDates(currentBranch.availableDates ?? []);
    }
  }, [currentBranch]);

  if (!currentBranch) {
    return (
      <div className="rounded-2xl bg-rose-50 border border-rose-100 p-8 text-center text-rose-700 font-bold">
        ⚠️ Branch not found or you don't have access to this page.
      </div>
    );
  }

  function handleAddDate() {
    if (!newDate) return;
    if (availableDates.includes(newDate)) {
      setError("This date is already added.");
      return;
    }
    setError("");
    const sorted = [...availableDates, newDate].sort();
    setAvailableDates(sorted);
    setNewDate("");
  }

  function handleRemoveDate(dateStr: string) {
    setAvailableDates(availableDates.filter((d) => d !== dateStr));
  }

  async function handleSaveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!currentBranch) return;
    setSubmitting(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();
      formData.append("videoCallPrice", String(price));
      formData.append("availableDates", JSON.stringify(availableDates));

      const updated = await updateBranch(currentBranch._id, formData);
      
      // Update branches array in parent state
      const updatedList = branches.map((b) => (b._id === updated._id ? updated : b));
      onBranchesUpdated(updatedList);

      setMessage("Settings saved successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to update branch settings.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-scaleUp">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-3xl p-8 shadow-xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md rounded-full px-3.5 py-1 text-xs font-bold uppercase tracking-wider">
            <Settings size={12} />
            <span>Branch Configuration</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight">Location Settings</h1>
          <p className="text-sm text-teal-50 font-medium">
            Configure dynamic video consultation prices and appointment date availability for <span className="font-bold text-white underline">{currentBranch.name}</span>
          </p>
        </div>
        <div className="bg-white/10 rounded-full p-4 shrink-0">
          <Sparkles className="h-8 w-8 text-teal-100" />
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-emerald-800 font-bold shadow-sm">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-800 font-bold shadow-sm">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSaveSettings} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Card: Price Setup */}
        <div className="bg-white border border-teal-100/50 rounded-3xl p-6 sm:p-8 shadow-soft flex flex-col justify-between">
          <div className="space-y-6">
            <h2 className="text-lg font-black text-clinic-ink flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-teal-50 text-clinic-teal text-sm font-bold">₹</span>
              Video Consultation Price
            </h2>
            <p className="text-xs text-slate-400 font-semibold leading-relaxed">
              Set the price users will have to pay before they can book and join a live video consultation. This price is specific to your branch.
            </p>
            
            <div className="space-y-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">Price (in Rupees)</label>
              <div className="relative flex items-center">
                <span className="absolute left-4 text-sm font-bold text-slate-400">₹</span>
                <input
                  type="number"
                  required
                  min="0"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  placeholder="500"
                  className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-50 text-sm font-bold text-slate-700"
                />
              </div>
            </div>
          </div>
          
          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-8 rounded-xl bg-clinic-teal hover:bg-teal-800 text-white font-bold py-3.5 px-5 shadow-lg shadow-teal-100 transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-sm"
          >
            <Save size={16} />
            {submitting ? "Saving..." : "Save Settings"}
          </button>
        </div>

        {/* Right Card: Available Calendar Dates */}
        <div className="bg-white border border-teal-100/50 rounded-3xl p-6 sm:p-8 shadow-soft space-y-6">
          <h2 className="text-lg font-black text-clinic-ink flex items-center gap-2 pb-3 border-b border-slate-100">
            <Calendar className="h-5 w-5 text-clinic-teal" />
            Appointment Date Availability
          </h2>
          <p className="text-xs text-slate-400 font-semibold leading-relaxed">
            Select the specific dates on which users can book appointments. Only these dates will be active/enabled in the User App calendar.
          </p>

          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="date"
                value={newDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={(e) => setNewDate(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 outline-none transition focus:border-clinic-teal text-sm font-semibold text-slate-700"
              />
              <button
                type="button"
                onClick={handleAddDate}
                className="bg-clinic-teal hover:bg-teal-800 text-white font-bold px-4 py-2.5 rounded-xl text-sm transition flex items-center gap-1 shrink-0 shadow-md shadow-teal-100"
              >
                <Plus size={16} />
                Add Date
              </button>
            </div>

            {/* Dates List */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {availableDates.length > 0 ? (
                availableDates.map((dateStr) => {
                  const dateObj = new Date(dateStr);
                  const formatted = dateObj.toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric"
                  });
                  return (
                    <div
                      key={dateStr}
                      className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 hover:bg-slate-100/75 transition"
                    >
                      <span className="text-xs font-bold text-slate-700">{formatted}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDate(dateStr)}
                        className="text-slate-400 hover:text-rose-500 transition p-1"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-2xl">
                  <Calendar className="mx-auto h-8 w-8 text-slate-300 mb-2" />
                  <p className="text-xs text-slate-400 font-semibold">No dates set. All calendar dates will be enabled by default.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </form>
    </div>
  );
}
