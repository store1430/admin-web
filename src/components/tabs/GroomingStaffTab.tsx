import React from "react";
import { X, User, UploadCloud, Plus, Scissors, Trash2, Edit, Phone } from "lucide-react";
import { StaffMember, Branch, createStaff, updateStaff, deleteStaff } from "../../lib/api";

interface GroomingStaffTabProps {
  showStaffModal: boolean;
  setShowStaffModal: (show: boolean) => void;
  editingStaff: StaffMember | null;
  setEditingStaff: (staff: StaffMember | null) => void;
  staffForm: {
    name: string;
    phone: string;
    about: string;
    experience: string;
    status: "Active" | "Inactive";
    image: File | null;
    branchId: string;
  };
  setStaffForm: React.Dispatch<React.SetStateAction<any>>;
  staffSubmitting: boolean;
  setStaffSubmitting: (submitting: boolean) => void;
  staffPreviewUrl: string | null;
  staffList: StaffMember[];
  setStaffList: React.Dispatch<React.SetStateAction<StaffMember[]>>;
  branches: Branch[];
  branchMap: Record<string, string>;
  setError: (error: string) => void;
}

export function GroomingStaffTab({
  showStaffModal,
  setShowStaffModal,
  editingStaff,
  setEditingStaff,
  staffForm,
  setStaffForm,
  staffSubmitting,
  setStaffSubmitting,
  staffPreviewUrl,
  staffList,
  setStaffList,
  branches,
  branchMap,
  setError
}: GroomingStaffTabProps) {

  const resetForm = () => {
    setEditingStaff(null);
    setStaffForm({
      name: "",
      phone: "",
      about: "",
      experience: "",
      status: "Active",
      image: null,
      branchId: ""
    });
    setShowStaffModal(false);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStaffSubmitting(true);
    try {
      if (editingStaff) {
        const updated = await updateStaff(editingStaff._id, {
          name: staffForm.name,
          phone: staffForm.phone,
          about: staffForm.about,
          experience: Number(staffForm.experience),
          status: staffForm.status,
          branchId: staffForm.branchId || undefined,
          image: staffForm.image
        });
        setStaffList((prev) => prev.map((s) => s._id === updated._id ? updated : s));
      } else {
        const created = await createStaff({
          name: staffForm.name,
          phone: staffForm.phone,
          about: staffForm.about,
          experience: Number(staffForm.experience),
          status: staffForm.status,
          branchId: staffForm.branchId || undefined,
          image: staffForm.image
        });
        setStaffList((prev) => [created, ...prev]);
      }
      resetForm();
    } catch (err: any) {
      setError(err.message || "Failed to save staff member");
    } finally {
      setStaffSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Staff Form Modal Overlay */}
      {showStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-teal-100 bg-white p-6 shadow-2xl animate-scaleUp">
            {/* Close Button */}
            <button
              type="button"
              onClick={resetForm}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 transition p-1 rounded-full hover:bg-slate-50"
            >
              <X size={20} />
            </button>

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <h3 className="text-xl font-extrabold text-clinic-ink flex items-center gap-2 border-b border-slate-100 pb-3">
                <Scissors className="text-clinic-teal" size={20} />
                {editingStaff ? "Edit Staff Member" : "Add Grooming Staff"}
              </h3>

              {/* Staff Photo Upload */}
              <div className="flex items-center gap-5 bg-teal-50/40 border border-teal-100/60 p-4 rounded-2xl">
                <label className="relative cursor-pointer shrink-0">
                  {staffPreviewUrl ? (
                    <img src={staffPreviewUrl} alt="Preview" className="h-20 w-20 rounded-full object-cover border-2 border-clinic-teal shadow-md" />
                  ) : (
                    <div className="grid place-items-center h-20 w-20 rounded-full bg-teal-50 border-2 border-dashed border-teal-200 text-teal-600">
                      <UploadCloud size={20} />
                      <span className="text-[10px] font-bold mt-1">Photo</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setStaffForm({ ...staffForm, image: e.target.files?.[0] || null })}
                  />
                </label>
                <div>
                  <p className="font-bold text-sm text-clinic-ink">Staff Profile Photo</p>
                  <p className="text-xs text-slate-400">Upload photo for grooming staff directory (JPEG or PNG)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-600">Full Name *</span>
                  <input
                    required
                    value={staffForm.name}
                    onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                    placeholder="e.g. Ravi Kumar"
                    className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-600">Phone Number</span>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      value={staffForm.phone}
                      onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className="w-full rounded border border-slate-200 pl-9 pr-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm"
                    />
                  </div>
                </label>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-600">Experience (Years) *</span>
                  <input
                    required
                    type="number"
                    min="0"
                    value={staffForm.experience}
                    onChange={(e) => setDocForm ? setStaffForm({ ...staffForm, experience: e.target.value }) : setStaffForm({ ...staffForm, experience: e.target.value })}
                    placeholder="e.g. 3"
                    className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-600">Assigned Branch</span>
                  <select
                    value={staffForm.branchId}
                    onChange={(e) => setStaffForm({ ...staffForm, branchId: e.target.value })}
                    className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm bg-white"
                  >
                    <option value="">— All Branches —</option>
                    {branches.map((b) => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-600">Status</span>
                  <select
                    value={staffForm.status}
                    onChange={(e) => setStaffForm({ ...staffForm, status: e.target.value as "Active" | "Inactive" })}
                    className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-600">About</span>
                <textarea
                  rows={3}
                  value={staffForm.about}
                  onChange={(e) => setStaffForm({ ...staffForm, about: e.target.value })}
                  placeholder="Brief description about the staff member..."
                  className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm resize-none"
                />
              </label>

              <div className="flex gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 rounded border border-slate-200 bg-white px-4 py-3 font-bold text-slate-500 transition hover:bg-slate-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  disabled={staffSubmitting}
                  className="flex-1 rounded bg-clinic-teal px-4 py-3 font-bold text-white shadow-lg shadow-teal-200 transition hover:bg-teal-800 disabled:opacity-60 text-sm"
                >
                  {staffSubmitting ? "Saving..." : editingStaff ? "Update Staff" : "Add Staff Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Staff List */}
      <div className="rounded-2xl border border-teal-100 bg-white shadow-soft overflow-hidden w-full">
        <div className="border-b border-teal-100 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-clinic-ink flex items-center gap-2">
              <Scissors size={18} className="text-clinic-teal" />
              Grooming Staff Panel
            </h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Manage and onboard pet grooming specialists</p>
          </div>
          <button
            onClick={() => {
              setEditingStaff(null);
              setStaffForm({ name: "", phone: "", about: "", experience: "", status: "Active", image: null, branchId: "" });
              setShowStaffModal(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-clinic-teal px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-100 transition hover:bg-teal-800"
          >
            <Plus size={16} />
            Add Grooming Staff
          </button>
        </div>

        {staffList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
            <Scissors size={40} />
            <p className="font-semibold">No grooming staff added yet</p>
            <p className="text-xs">Use the button above to onboard your first staff member</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {staffList.map((s) => (
              <div key={s._id} className="flex items-center gap-4 px-5 py-4 transition hover:bg-slate-50">
                {/* Avatar */}
                {s.imageUrl ? (
                  <img src={s.imageUrl} alt={s.name} className="h-14 w-14 rounded-full object-cover border-2 border-teal-100 shrink-0" />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-teal-50 border-2 border-teal-100 flex items-center justify-center shrink-0">
                    <User size={24} className="text-clinic-teal" />
                  </div>
                )}

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-clinic-ink text-sm truncate">{s.name}</p>
                  {s.phone && (
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone size={11} /> {s.phone}
                    </p>
                  )}
                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                    <span className="text-xs text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-full">
                      {s.experience} yr{s.experience !== 1 ? "s" : ""} exp
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      🏢 {branchMap[s.branchId || ""] || "All Branches"}
                    </span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      s.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {s.status}
                    </span>
                  </div>
                  {s.about && (
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{s.about}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingStaff(s);
                      setStaffForm({
                        name: s.name,
                        phone: s.phone || "",
                        about: s.about || "",
                        experience: String(s.experience),
                        status: s.status,
                        image: null,
                        branchId: s.branchId || ""
                      });
                      setShowStaffModal(true);
                    }}
                    className="rounded bg-teal-50 text-clinic-teal hover:bg-clinic-teal hover:text-white p-2 text-xs font-bold transition"
                    title="Edit Staff"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm(`Remove ${s.name} from staff?`)) return;
                      try {
                        await deleteStaff(s._id);
                        setStaffList((prev) => prev.filter((x) => x._id !== s._id));
                      } catch (err: any) {
                        setError(err.message || "Failed to delete staff member");
                      }
                    }}
                    className="rounded bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white p-2 text-xs font-bold transition"
                    title="Remove Staff"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
