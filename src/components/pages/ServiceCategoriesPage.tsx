import React, { useEffect, useState, useMemo } from "react";
import { UploadCloud, Edit, Trash2, X, IndianRupee, MapPin, Plus } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ServiceCategory,
  CategoryStatus,
  Branch,
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  addSubCategory,
  deleteSubCategory
} from "../../lib/api";

interface CategoryFormState {
  name: string;
  status: CategoryStatus;
  image: File | null;
  basePrice: string;
}

const initialForm: CategoryFormState = {
  name: "",
  status: "Active",
  image: null,
  basePrice: ""
};

interface ServiceCategoriesPageProps {
  selectedBranchId: string;
  branches: Branch[];
}

export function ServiceCategoriesPage({ selectedBranchId, branches }: ServiceCategoriesPageProps) {
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [form, setForm] = useState<CategoryFormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  // Subcategory form state
  const [subForm, setSubForm] = useState<{
    name: string;
    price: string;
    status: CategoryStatus;
    image: File | null;
  }>({ name: "", price: "", status: "Active", image: null });
  const [subSubmitting, setSubSubmitting] = useState(false);

  const selectedBranchName = useMemo(() => {
    if (selectedBranchId === "all") return "All Branches";
    const found = branches.find((b) => b._id === selectedBranchId);
    return found ? found.name : "Selected Branch";
  }, [selectedBranchId, branches]);

  useEffect(() => {
    async function loadCategoriesData() {
      if (selectedBranchId === "all") {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await fetchCategories(selectedBranchId);
        setCategories(data);
      } catch (err: any) {
        setError(err.message || "Failed to load service categories");
      } finally {
        setLoading(false);
      }
    }
    loadCategoriesData();
  }, [selectedBranchId]);

  const previewUrl = useMemo(() => {
    if (form.image) return URL.createObjectURL(form.image);
    if (editingCategory) return editingCategory.imageUrl;
    return "";
  }, [form.image, editingCategory]);

  const subPreviewUrl = useMemo(() => {
    if (subForm.image) return URL.createObjectURL(subForm.image);
    return "";
  }, [subForm.image]);

  function startEditCategory(category: ServiceCategory) {
    setEditingCategory(category);
    setForm({
      name: category.name,
      status: category.status,
      image: null,
      basePrice: category.basePrice !== undefined ? String(category.basePrice) : ""
    });
    setShowCategoryModal(true);
  }

  function cancelEditCategory() {
    setEditingCategory(null);
    setForm(initialForm);
    setShowCategoryModal(false);
  }

  async function handleCategoryDelete(categoryId: string) {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    setError("");
    try {
      await deleteCategory(categoryId);
      setCategories((current) => current.filter((c) => c._id !== categoryId));
      setNotice("Category deleted successfully!");
      if (selectedCategory?._id === categoryId) {
        setSelectedCategory(null);
      }
      if (editingCategory?._id === categoryId) {
        cancelEditCategory();
      }
    } catch (err: any) {
      setError(err.message || "Failed to delete category");
    }
  }

  async function handleCategorySubmit(event: React.FormEvent) {
    event.preventDefault();
    if (selectedBranchId === "all") {
      setError("Please select a specific branch from the top-right header first.");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      if (editingCategory) {
        const updated = await updateCategory(editingCategory._id, {
          name: form.name,
          status: form.status,
          image: form.image,
          branchId: selectedBranchId,
          basePrice: form.basePrice ? Number(form.basePrice) : 0
        });
        setCategories((current) => current.map((c) => (c._id === editingCategory._id ? updated : c)));
        setNotice("Category updated successfully!");
        cancelEditCategory();
      } else {
        if (!form.image) {
          throw new Error("Please choose a category image");
        }
        const saved = await createCategory({
          name: form.name,
          status: form.status,
          image: form.image,
          branchId: selectedBranchId,
          basePrice: form.basePrice ? Number(form.basePrice) : 0
        });
        setCategories((current) => [saved, ...current]);
        setNotice("New category created successfully!");
        setForm(initialForm);
        setShowCategoryModal(false);
      }
    } catch (err: any) {
      setError(err.message || "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubCategorySubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!selectedCategory) return;
    if (!subForm.image) {
      setError("Please choose a sub-category image");
      return;
    }
    setError("");
    setSubSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("name", subForm.name);
      formData.append("price", subForm.price);
      formData.append("status", subForm.status);
      formData.append("image", subForm.image);

      const updated = await addSubCategory(selectedCategory._id, formData);
      
      setCategories((current) => current.map((c) => (c._id === updated._id ? updated : c)));
      setSelectedCategory(updated);
      setNotice("Sub-category added successfully!");
      setSubForm({ name: "", price: "", status: "Active", image: null });
    } catch (err: any) {
      setError(err.message || "Failed to add subcategory");
    } finally {
      setSubSubmitting(false);
    }
  }

  async function handleSubCategoryDelete(subId: string) {
    if (!selectedCategory) return;
    if (!window.confirm("Are you sure you want to delete this sub-category?")) return;
    try {
      const updated = await deleteSubCategory(selectedCategory._id, subId);
      setCategories((current) => current.map((c) => (c._id === updated._id ? updated : c)));
      setSelectedCategory(updated);
      setNotice("Sub-category deleted successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to delete subcategory");
    }
  }

  if (selectedBranchId === "all") {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-4 bg-white border border-teal-100 rounded-3xl p-8 shadow-soft">
        <div className="p-4 bg-teal-50 rounded-full text-clinic-teal">
          <MapPin size={42} />
        </div>
        <div className="text-center max-w-sm space-y-1">
          <h4 className="font-extrabold text-clinic-ink text-base">Select Branch to Manage Services</h4>
          <p className="text-xs font-semibold text-slate-400">
            Each branch has its own separate services listing and rates. Please select a specific branch location from the top-right header selector.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-teal-700">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clinic-teal mr-3"></div>
        <span className="font-bold">Loading categories for {selectedBranchName}...</span>
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

      {/* Top Header Card */}
      <div className="rounded-2xl border border-teal-100 bg-white shadow-soft">
        <div className="border-b border-teal-100 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-clinic-ink">Active Service Categories</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Manage service categories and rates for {selectedBranchName}</p>
          </div>
          <button
            onClick={() => {
              cancelEditCategory();
              setShowCategoryModal(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-clinic-teal px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-100 transition hover:bg-teal-800"
          >
            <Plus size={16} />
            Add Service Category
          </button>
        </div>
      </div>

      {/* Category Form Modal Overlay */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl border border-teal-100 bg-white p-6 shadow-2xl animate-scaleUp">
            {/* Close Button */}
            <button
              type="button"
              onClick={cancelEditCategory}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 transition p-1 rounded-full hover:bg-slate-50"
            >
              <X size={20} />
            </button>

            <form onSubmit={handleCategorySubmit} className="space-y-6">
              <h3 className="text-xl font-extrabold text-clinic-ink flex items-center gap-2 border-b border-slate-100 pb-3">
                {editingCategory ? "Edit Service Category" : "Add Service Category"}
              </h3>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-600">Category Name *</span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Grooming"
                  className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm"
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-600">Status *</span>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as CategoryStatus })}
                  className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm bg-white"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-600">Price (₹)</span>
                <input
                  type="number"
                  min="0"
                  value={form.basePrice}
                  onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                  placeholder="e.g. 500"
                  className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm"
                />
                <p className="mt-1.5 text-[10px] text-slate-400 font-semibold leading-relaxed">
                  Note: This price is used directly if the service does not have sub-categories (like Video Consultations).
                </p>
              </label>

              <label className="block cursor-pointer rounded border-2 border-dashed border-teal-200 bg-teal-50/60 p-5 text-center transition hover:border-clinic-teal">
                {previewUrl ? (
                  <img src={previewUrl} alt="Category preview" className="mx-auto h-36 w-full rounded object-cover shadow-sm" />
                ) : (
                  <div className="grid place-items-center gap-2 py-6 text-teal-700">
                    <UploadCloud size={32} />
                    <span className="text-sm font-semibold">Choose category image</span>
                  </div>
                )}
                <input
                  required={!editingCategory}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setForm({ ...form, image: e.target.files?.[0] || null })}
                />
              </label>

              <div className="flex gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={cancelEditCategory}
                  className="flex-1 rounded border border-slate-200 bg-white px-5 py-3 font-bold text-slate-500 transition hover:bg-slate-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  disabled={submitting}
                  className="flex-1 rounded bg-clinic-teal px-5 py-3 font-bold text-white shadow-lg shadow-teal-200 transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60 text-sm"
                >
                  {submitting ? "Saving..." : editingCategory ? "Update Category" : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Library */}
      <div className="rounded-2xl border border-teal-100 bg-white shadow-soft overflow-hidden h-fit w-full">
        <div className="border-b border-teal-100 px-5 py-4">
          <h3 className="text-lg font-bold text-clinic-ink">Category Library</h3>
        </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead className="bg-teal-50 text-xs uppercase tracking-[0.14em] text-teal-700">
                <tr>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Sub Categories</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-slate-400 font-semibold">
                      No categories added for this branch yet.
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category._id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <img src={category.imageUrl} alt={category.name} className="h-12 w-14 rounded object-cover border border-slate-100" />
                          <div>
                            <p className="font-bold text-clinic-ink">{category.name}</p>
                            <p className="text-[10px] text-slate-400">
                              Created {new Date(category.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs font-bold text-clinic-teal">
                        {category.subCategories?.length || 0} sub-items
                      </td>
                      <td className="px-5 py-4">
                        <span className={`rounded px-3 py-1 text-xs font-bold ${
                          category.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                        }`}>
                          {category.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right flex items-center justify-end gap-2">
                        <button
                          onClick={() => startEditCategory(category)}
                          className="rounded bg-teal-50 text-clinic-teal hover:bg-clinic-teal hover:text-white p-2 text-xs font-bold transition"
                          title="Edit Category"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => handleCategoryDelete(category._id)}
                          className="rounded bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white p-2 text-xs font-bold transition"
                          title="Delete Category"
                        >
                          <Trash2 size={14} />
                        </button>
                        <button
                          onClick={() => setSelectedCategory(category)}
                          className={`rounded px-3.5 py-2 text-xs font-bold transition shadow-sm ${
                            selectedCategory?._id === category._id
                              ? "bg-clinic-teal text-white"
                              : "bg-clinic-mint text-clinic-teal hover:bg-clinic-teal hover:text-white"
                          }`}
                        >
                          Manage Subs
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      {/* Inline Subcategory Drawer */}
      <AnimatePresence>
        {selectedCategory && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="rounded-2xl border-2 border-teal-200 bg-teal-50/25 p-6 shadow-soft grid gap-6 xl:grid-cols-[380px_1fr]"
          >
            {/* Sub Form */}
            <form onSubmit={handleSubCategorySubmit} className="rounded-xl border border-teal-100 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4 border-b border-teal-50 pb-3">
                <h4 className="text-sm font-bold text-clinic-ink uppercase tracking-wider">
                  Add Sub-category to {selectedCategory.name}
                </h4>
                <button type="button" onClick={() => setSelectedCategory(null)} className="text-slate-400 hover:text-rose-600">
                  <X size={18} />
                </button>
              </div>

              <label className="mb-4 block">
                <span className="mb-2 block text-sm font-semibold text-slate-600">Sub-category Name</span>
                <input
                  required
                  value={subForm.name}
                  onChange={(e) => setSubForm({ ...subForm, name: e.target.value })}
                  placeholder="Bath & Brush"
                  className="w-full rounded border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100"
                />
              </label>

              <label className="mb-4 block">
                <span className="mb-2 block text-sm font-semibold text-slate-600">Price (Rs.)</span>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 text-slate-400" size={16} />
                  <input
                    required
                    min="0"
                    type="number"
                    value={subForm.price}
                    onChange={(e) => setSubForm({ ...subForm, price: e.target.value })}
                    placeholder="500"
                    className="w-full rounded border border-slate-200 py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100"
                  />
                </div>
              </label>

              <label className="mb-5 block cursor-pointer rounded border-2 border-dashed border-teal-200 bg-teal-50/60 p-4 text-center transition hover:border-clinic-teal">
                {subPreviewUrl ? (
                  <img src={subPreviewUrl} alt="Subcategory preview" className="mx-auto h-24 w-full rounded object-cover" />
                ) : (
                  <div className="grid place-items-center gap-1.5 py-3 text-teal-700">
                    <UploadCloud size={24} />
                    <span className="text-xs font-semibold">Choose sub-category image</span>
                  </div>
                )}
                <input
                  required
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setSubForm({ ...subForm, image: e.target.files?.[0] || null })}
                />
              </label>

              <button
                disabled={subSubmitting}
                className="w-full rounded bg-clinic-teal px-5 py-2.5 text-sm font-bold text-white shadow-md shadow-teal-100 transition hover:bg-teal-800 disabled:opacity-60"
              >
                {subSubmitting ? "Saving..." : "Add Sub-item"}
              </button>
            </form>

            {/* Subs List */}
            <div className="rounded-xl border border-teal-100 bg-white shadow-sm overflow-hidden flex flex-col justify-between">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-teal-50/50 text-xs uppercase tracking-[0.14em] text-teal-700">
                    <tr>
                      <th className="px-5 py-3">Image</th>
                      <th className="px-5 py-3">Sub Category</th>
                      <th className="px-5 py-3">Price</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3 text-right">Delete</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {!selectedCategory.subCategories || selectedCategory.subCategories.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-5 py-8 text-center text-slate-400 font-semibold">
                          No subcategories defined for {selectedCategory.name}.
                        </td>
                      </tr>
                    ) : (
                      selectedCategory.subCategories.map((sub) => (
                        <tr key={sub._id} className="transition hover:bg-slate-50/50">
                          <td className="px-5 py-3">
                            {sub.imageUrl ? (
                              <img src={sub.imageUrl} alt={sub.name} className="h-10 w-12 rounded object-cover border border-slate-100" />
                            ) : (
                              <div className="h-10 w-12 rounded bg-slate-100 flex items-center justify-center text-slate-400 text-[10px] font-bold">No image</div>
                            )}
                          </td>
                          <td className="px-5 py-3 font-bold text-clinic-ink text-sm">{sub.name}</td>
                          <td className="px-5 py-3 font-semibold text-slate-700 text-sm">Rs. {sub.price}</td>
                          <td className="px-5 py-3">
                            <span className="bg-emerald-50 text-emerald-700 rounded px-2.5 py-0.5 text-[11px] font-bold">
                              {sub.status}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <button
                              type="button"
                              onClick={() => handleSubCategoryDelete(sub._id)}
                              className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition hover:bg-rose-50"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
