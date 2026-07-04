import React from "react";
import { X, Stethoscope, UploadCloud, Plus, Trash2, Edit } from "lucide-react";
import { Doctor, Branch, Review } from "../../lib/api";

interface DoctorsTabProps {
  showDoctorModal: boolean;
  setShowDoctorModal: (show: boolean) => void;
  editingDoctor: Doctor | null;
  docForm: {
    name: string;
    specialty: string;
    experience: string;
    status: "Active" | "Inactive";
    image: File | null;
    education: string;
    bio: string;
    languages: string;
    expertise: string;
    jobsCompleted: string;
    rating: string;
    reviews: Review[];
    username: string;
    password: string;
    branchId: string;
  };
  setDocForm: React.Dispatch<React.SetStateAction<any>>;
  docPreviewUrl: string | null;
  docSubmitting: boolean;
  handleDoctorSubmit: (e: React.FormEvent) => void;
  cancelEditDoctor: () => void;
  branches: Branch[];
  newReviewerName: string;
  setNewReviewerName: (name: string) => void;
  newReviewRating: string;
  setNewReviewRating: (rating: string) => void;
  newReviewComment: string;
  setNewReviewComment: (comment: string) => void;
  handleAddReview: () => void;
  handleDeleteReview: (idx: number, e: React.MouseEvent) => void;
  filteredDoctors: Doctor[];
  branchMap: Record<string, string>;
  startEditDoctor: (doc: Doctor) => void;
  handleDoctorDelete: (id: string) => void;
}

export function DoctorsTab({
  showDoctorModal,
  setShowDoctorModal,
  editingDoctor,
  docForm,
  setDocForm,
  docPreviewUrl,
  docSubmitting,
  handleDoctorSubmit,
  cancelEditDoctor,
  branches,
  newReviewerName,
  setNewReviewerName,
  newReviewRating,
  setNewReviewRating,
  newReviewComment,
  setNewReviewComment,
  handleAddReview,
  handleDeleteReview,
  filteredDoctors,
  branchMap,
  startEditDoctor,
  handleDoctorDelete
}: DoctorsTabProps) {
  return (
    <div className="w-full space-y-6">
      {/* Doctor Form Modal Overlay */}
      {showDoctorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-teal-100 bg-white p-6 shadow-2xl animate-scaleUp">
            {/* Close Button */}
            <button
              type="button"
              onClick={cancelEditDoctor}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 transition p-1 rounded-full hover:bg-slate-50"
            >
              <X size={20} />
            </button>

            <form onSubmit={handleDoctorSubmit} className="space-y-6">
              <h3 className="text-xl font-extrabold text-clinic-ink flex items-center gap-2 border-b border-slate-100 pb-3">
                <Stethoscope className="text-clinic-teal" size={22} />
                {editingDoctor ? "Edit Doctor Profile" : "Onboard New Doctor"}
              </h3>

              {/* Photo Upload at Top of Form */}
              <div className="flex items-center gap-5 bg-teal-50/40 border border-teal-100/60 p-4 rounded-2xl">
                <label className="relative cursor-pointer shrink-0">
                  {docPreviewUrl ? (
                    <img src={docPreviewUrl} alt="Doctor preview" className="h-20 w-20 rounded-full object-cover border-2 border-clinic-teal shadow-md" />
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
                    onChange={(e) => setDocForm({ ...docForm, image: e.target.files?.[0] || null })}
                  />
                </label>
                <div>
                  <p className="font-bold text-sm text-clinic-ink">Doctor Profile Photo</p>
                  <p className="text-xs text-slate-400">Upload a professional headshot for the clinic portal (JPEG or PNG)</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-600">Full Name *</span>
                  <input
                    required
                    value={docForm.name}
                    onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
                    placeholder="Dr. Rajesh Patel"
                    className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-600">Specialty *</span>
                  <input
                    required
                    value={docForm.specialty}
                    onChange={(e) => setDocForm({ ...docForm, specialty: e.target.value })}
                    placeholder="Veterinary Surgeon"
                    className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm"
                  />
                </label>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-600">Assigned Branch *</span>
                  <select
                    required
                    value={docForm.branchId}
                    onChange={(e) => setDocForm({ ...docForm, branchId: e.target.value })}
                    className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm bg-white"
                  >
                    <option value="">Select Branch</option>
                    {branches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-600">Experience (Years) *</span>
                  <input
                    required
                    type="number"
                    min="0"
                    value={docForm.experience}
                    onChange={(e) => setDocForm({ ...docForm, experience: e.target.value })}
                    placeholder="10"
                    className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-600">Education *</span>
                  <input
                    required
                    value={docForm.education}
                    onChange={(e) => setDocForm({ ...docForm, education: e.target.value })}
                    placeholder="Graduated"
                    className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm"
                  />
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-600">Bio</span>
                <textarea
                  value={docForm.bio}
                  onChange={(e) => setDocForm({ ...docForm, bio: e.target.value })}
                  placeholder="Friendly and passionate veterinarian..."
                  rows={3}
                  className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm resize-none"
                />
              </label>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-600">Languages</span>
                  <input
                    value={docForm.languages}
                    onChange={(e) => setDocForm({ ...docForm, languages: e.target.value })}
                    placeholder="English, Hindi"
                    className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-600">Expertise</span>
                  <input
                    value={docForm.expertise}
                    onChange={(e) => setDocForm({ ...docForm, expertise: e.target.value })}
                    placeholder="Dog, Cat"
                    className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm"
                  />
                </label>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-600">Jobs Completed</span>
                  <input
                    type="number"
                    min="0"
                    value={docForm.jobsCompleted}
                    onChange={(e) => setDocForm({ ...docForm, jobsCompleted: e.target.value })}
                    placeholder="60"
                    className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-600">Rating (1.0 - 5.0)</span>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="5"
                    value={docForm.rating}
                    onChange={(e) => setDocForm({ ...docForm, rating: e.target.value })}
                    placeholder="5.0"
                    className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-600">Status</span>
                  <select
                    value={docForm.status}
                    onChange={(e) => setDocForm({ ...docForm, status: e.target.value as "Active" | "Inactive" })}
                    className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm bg-white"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-600">Login Username</span>
                  <input
                    value={docForm.username}
                    onChange={(e) => setDocForm({ ...docForm, username: e.target.value })}
                    placeholder="priya_vet"
                    className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-600">
                    {editingDoctor ? "New Password" : "Login Password"}
                  </span>
                  <input
                    type="password"
                    value={docForm.password}
                    onChange={(e) => setDocForm({ ...docForm, password: e.target.value })}
                    placeholder={editingDoctor ? "••••••••" : "password123"}
                    required={!editingDoctor}
                    className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm"
                  />
                </label>
              </div>

              {/* Reviews Sub-Form */}
              <div className="border-t border-slate-100 pt-4">
                <h4 className="text-sm font-bold text-clinic-ink mb-2">Reviews ({docForm.reviews.length})</h4>
                <div className="max-h-36 overflow-y-auto space-y-2 mb-3 pr-1">
                  {docForm.reviews.map((rev, idx) => (
                    <div key={idx} className="flex justify-between items-start bg-slate-50 p-2.5 rounded border border-slate-100 text-xs">
                      <div className="flex-1 min-w-0 pr-2">
                        <p className="font-bold text-slate-700 truncate">{rev.reviewerName} (⭐{rev.rating})</p>
                        <p className="text-slate-500 italic line-clamp-2 mt-0.5">{rev.comment}</p>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteReview(idx, e)}
                        className="text-rose-500 hover:text-rose-700 font-bold px-1"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {docForm.reviews.length === 0 && (
                    <p className="text-slate-400 text-[11px] italic">No reviews added yet.</p>
                  )}
                </div>

                <div className="bg-teal-50/40 border border-teal-100/60 p-3 rounded-xl space-y-2">
                  <p className="text-[11px] font-bold text-teal-800">Add Mock Review</p>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Name"
                      value={newReviewerName}
                      onChange={(e) => setNewReviewerName(e.target.value)}
                      className="w-full rounded border border-slate-200 px-2 py-1 text-xs outline-none bg-white"
                    />
                    <select
                      value={newReviewRating}
                      onChange={(e) => setNewReviewRating(e.target.value)}
                      className="w-full rounded border border-slate-200 px-2 py-1 text-xs outline-none bg-white"
                    >
                      <option value="5">5 Stars</option>
                      <option value="4">4 Stars</option>
                      <option value="3">3 Stars</option>
                      <option value="2">2 Stars</option>
                      <option value="1">1 Star</option>
                    </select>
                  </div>
                  <textarea
                    placeholder="Comment..."
                    value={newReviewComment}
                    onChange={(e) => setNewReviewComment(e.target.value)}
                    rows={2}
                    className="w-full rounded border border-slate-200 px-2 py-1 text-xs outline-none bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddReview}
                    className="w-full rounded bg-teal-600 hover:bg-teal-700 py-1 text-xs font-bold text-white transition"
                  >
                    Add Review
                  </button>
                </div>
              </div>

              <div className="flex gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={cancelEditDoctor}
                  className="flex-1 rounded border border-slate-200 bg-white px-4 py-3 font-bold text-slate-500 transition hover:bg-slate-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  disabled={docSubmitting}
                  className="flex-1 rounded bg-clinic-teal px-4 py-3 font-bold text-white shadow-lg shadow-teal-200 transition hover:bg-teal-800 disabled:opacity-60 text-sm"
                >
                  {docSubmitting ? "Saving..." : editingDoctor ? "Update Profile" : "Save Doctor Profile"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctor List */}
      <div className="rounded-2xl border border-teal-100 bg-white shadow-soft overflow-hidden w-full">
        <div className="border-b border-teal-100 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-clinic-ink">Active Doctor Panel</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Manage and onboard veterinary medical staff</p>
          </div>
          <button
            onClick={() => {
              cancelEditDoctor();
              setShowDoctorModal(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-clinic-teal px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-100 transition hover:bg-teal-800"
          >
            <Plus size={16} />
            Add New Doctor
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-teal-50 text-xs uppercase tracking-[0.14em] text-teal-700">
              <tr>
                <th className="px-5 py-4">Doctor</th>
                <th className="px-5 py-4">Specialty</th>
                <th className="px-5 py-4">Experience</th>
                <th className="px-5 py-4">Status</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDoctors.map((doc) => (
                <tr key={doc._id} className="transition hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {doc.imageUrl ? (
                        <img src={doc.imageUrl} alt={doc.name} className="h-10 w-10 rounded-full object-cover border border-slate-100" />
                      ) : (
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-clinic-mint text-clinic-teal font-bold">
                          {doc.name.replace("Dr. ", "").substring(0, 1)}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-clinic-ink">{doc.name}</p>
                        <p className="text-xs text-slate-400 font-medium">
                          🏢 {branchMap[doc.branchId || ""] || "No Branch"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-sm text-slate-600 font-semibold">{doc.specialty}</td>
                  <td className="px-5 py-4 text-sm text-slate-500 font-medium">{doc.experience} Years</td>
                  <td className="px-5 py-4">
                    <span className={`rounded px-3 py-1 text-xs font-bold ${
                      doc.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                    }`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => startEditDoctor(doc)}
                      className="rounded bg-teal-50 text-clinic-teal hover:bg-clinic-teal hover:text-white p-2 text-xs font-bold transition"
                      title="Edit Doctor Profile"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDoctorDelete(doc._id)}
                      className="rounded bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white p-2 text-xs font-bold transition"
                      title="Delete Doctor"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {filteredDoctors.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-slate-400 font-semibold">
                    No doctors onboarded for this branch yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
