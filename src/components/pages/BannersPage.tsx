import React, { useEffect, useState, useMemo } from "react";
import { UploadCloud, Trash2, ImageIcon, X, MapPin } from "lucide-react";
import { Banner, Branch, fetchBanners, createBanner, deleteBanner } from "../../lib/api";

interface BannersPageProps {
  selectedBranchId: string;
  branches: Branch[];
}

export function BannersPage({ selectedBranchId, branches }: BannersPageProps) {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannerForm, setBannerForm] = useState<{ title: string; image: File | null }>({
    title: "",
    image: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [bannerSubmitting, setBannerSubmitting] = useState(false);

  const selectedBranchName = useMemo(() => {
    if (selectedBranchId === "all") return "All Branches";
    const found = branches.find((b) => b._id === selectedBranchId);
    return found ? found.name : "Selected Branch";
  }, [selectedBranchId, branches]);

  useEffect(() => {
    async function loadBanners() {
      if (selectedBranchId === "all") {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await fetchBanners(selectedBranchId);
        setBanners(data);
      } catch (err: any) {
        setError(err.message || "Failed to load banners");
      } finally {
        setLoading(false);
      }
    }
    loadBanners();
  }, [selectedBranchId]);

  const bannerPreviewUrl = useMemo(() => {
    if (bannerForm.image) return URL.createObjectURL(bannerForm.image);
    return "";
  }, [bannerForm.image]);

  async function handleBannerSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (selectedBranchId === "all") {
      setError("Please select a specific branch from the top-right header first.");
      return;
    }
    if (!bannerForm.image) {
      setError("Please choose a banner image");
      return;
    }
    if (banners.length >= 3) {
      setError("Maximum 3 banners allowed for this branch. Delete one first.");
      return;
    }
    setError("");
    setBannerSubmitting(true);
    try {
      const saved = await createBanner({
        title: bannerForm.title,
        image: bannerForm.image,
        branchId: selectedBranchId
      });
      setBanners((current) => [...current, saved]);
      setBannerForm({ title: "", image: null });
      setNotice("Banner uploaded successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to upload banner");
    } finally {
      setBannerSubmitting(false);
    }
  }

  async function handleBannerDelete(id: string) {
    if (!window.confirm("Delete this banner?")) return;
    setError("");
    try {
      await deleteBanner(id);
      setBanners((current) => current.filter((b) => b._id !== id));
      setNotice("Banner deleted successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to delete banner");
    }
  }

  if (selectedBranchId === "all") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4 bg-white border border-teal-100 rounded-3xl p-8 shadow-soft">
        <div className="p-4 bg-teal-50 rounded-full text-clinic-teal">
          <MapPin size={42} />
        </div>
        <div className="text-center max-w-sm space-y-1">
          <h4 className="font-extrabold text-clinic-ink text-base">Select Branch to Manage Banners</h4>
          <p className="text-xs font-semibold text-slate-400">
            Each branch has its own separate carousel banners. Please select a specific branch location from the top-right header selector.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-teal-700">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clinic-teal mr-3"></div>
        <span className="font-bold">Loading banners for {selectedBranchName}...</span>
      </div>
    );
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
        {/* Banner Upload Form */}
        <form onSubmit={handleBannerSubmit} className="rounded-2xl border border-teal-100 bg-white p-5 shadow-soft h-fit">
          <h3 className="mb-1 text-lg font-bold text-clinic-ink">Upload Banner</h3>
          <p className="mb-5 text-xs text-slate-400 font-semibold">
            Max 3 banners for <strong>{selectedBranchName}</strong>. These appear as a carousel on the home screen.
          </p>

          <label className="mb-4 block">
            <span className="mb-2 block text-sm font-semibold text-slate-600">Banner Title (optional)</span>
            <input
              value={bannerForm.title}
              onChange={(e) => setBannerForm({ ...bannerForm, title: e.target.value })}
              placeholder="Summer Pet Care Offer"
              className="w-full rounded border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100"
            />
          </label>

          <label className="mb-5 block cursor-pointer rounded-xl border-2 border-dashed border-teal-200 bg-teal-50/60 p-4 text-center transition hover:border-clinic-teal">
            {bannerPreviewUrl ? (
              <img src={bannerPreviewUrl} alt="Banner preview" className="mx-auto h-32 w-full rounded-lg object-cover" />
            ) : (
              <div className="grid place-items-center gap-2 py-6 text-teal-700">
                <UploadCloud size={28} />
                <span className="text-sm font-semibold">Click to choose banner image</span>
                <span className="text-xs text-slate-400">Recommended: 1200×450px, JPG/PNG</span>
              </div>
            )}
            <input
              required
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => setBannerForm({ ...bannerForm, image: e.target.files?.[0] || null })}
            />
          </label>

          <button
            disabled={bannerSubmitting || banners.length >= 3}
            className="w-full rounded-xl bg-clinic-teal px-5 py-3 font-bold text-white shadow-lg shadow-teal-200 transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {bannerSubmitting ? "Uploading..." : banners.length >= 3 ? "Max 3 Banners Reached" : `Upload for ${selectedBranchName}`}
          </button>
        </form>

        {/* Banner Slots */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-clinic-ink">Active Banners</h3>
            <span className="text-sm font-bold text-slate-400">{banners.length}/3 used in this branch</span>
          </div>

          {/* Slot indicators */}
          <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-3">
            {[0, 1, 2].map((slot) => {
              const banner = banners[slot];
              return (
                <div
                  key={slot}
                  className={`relative rounded-2xl overflow-hidden border-2 transition ${
                    banner ? "border-teal-200 shadow-md" : "border-dashed border-slate-200 bg-slate-50"
                  }`}
                >
                  {banner ? (
                    <>
                      <img
                        src={banner.imageUrl}
                        alt={banner.title || `Banner ${slot + 1}`}
                        className="h-36 w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white font-bold text-sm truncate">{banner.title || `Banner ${slot + 1}`}</p>
                        <p className="text-white/70 text-[10px] font-semibold">Slot {slot + 1}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleBannerDelete(banner._id)}
                        className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 text-rose-500 hover:bg-rose-50 shadow transition"
                        title="Delete banner"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="absolute top-2 left-2 rounded bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white">
                        Active
                      </div>
                    </>
                  ) : (
                    <div className="flex h-36 items-center justify-center gap-2 text-slate-300">
                      <ImageIcon size={28} />
                      <span className="text-sm font-semibold">Slot {slot + 1} — Empty</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {banners.length === 0 && (
            <div className="rounded-xl border border-teal-50 bg-teal-50/30 px-5 py-4 text-sm text-teal-700 font-semibold">
              💡 Upload up to 3 banners for {selectedBranchName}. Banners uploaded here will only rotate inside the home screen carousel of this branch.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
