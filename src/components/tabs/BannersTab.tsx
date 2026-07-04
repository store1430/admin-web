import React from "react";
import { UploadCloud, Trash2, ImageIcon } from "lucide-react";
import { Banner } from "../../lib/api";

interface BannersTabProps {
  banners: Banner[];
  bannerForm: {
    title: string;
    image: File | null;
  };
  setBannerForm: React.Dispatch<React.SetStateAction<{ title: string; image: File | null }>>;
  bannerPreviewUrl: string | null;
  bannerSubmitting: boolean;
  handleBannerSubmit: (e: React.FormEvent) => void;
  handleBannerDelete: (id: string) => void;
}

export function BannersTab({
  banners,
  bannerForm,
  setBannerForm,
  bannerPreviewUrl,
  bannerSubmitting,
  handleBannerSubmit,
  handleBannerDelete
}: BannersTabProps) {
  return (
    <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
      {/* Banner Upload Form */}
      <form onSubmit={handleBannerSubmit} className="rounded-2xl border border-teal-100 bg-white p-5 shadow-soft h-fit">
        <h3 className="mb-1 text-lg font-bold text-clinic-ink">Upload Banner</h3>
        <p className="mb-5 text-xs text-slate-400 font-semibold">Max 3 banners. These appear as a carousel on the home screen.</p>

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
          {bannerSubmitting ? "Uploading..." : banners.length >= 3 ? "Max 3 Banners Reached" : "Upload Banner"}
        </button>
      </form>

      {/* Banner Slots */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-clinic-ink">Home Screen Banners</h3>
          <span className="text-sm font-bold text-slate-400">{banners.length}/3 used</span>
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
            💡 Upload up to 3 banners. They'll auto-rotate on the app home screen as a carousel.
          </div>
        )}
      </div>
    </div>
  );
}
