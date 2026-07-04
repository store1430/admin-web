import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  Tags,
  UploadCloud,
  IndianRupee,
  Plus,
  Trash2,
  X,
  Briefcase,
  Layers,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  ImageIcon,
  MapPin,
  Scissors,
  Phone,
  User,
  ExternalLink,
  Copy
} from "lucide-react";
import {
  CategoryStatus,
  ServiceCategory,
  Appointment,
  Doctor,
  Banner,
  createCategory,
  fetchCategories,
  fetchAppointments,
  addSubCategory,
  deleteSubCategory,
  deleteCategory,
  updateCategory,
  fetchDoctors,
  createDoctor,
  deleteDoctor,
  updateDoctor,
  Review,
  fetchBanners,
  createBanner,
  deleteBanner,
  Branch,
  fetchBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  StaffMember,
  fetchStaff,
  createStaff,
  updateStaff,
  deleteStaff
} from "../lib/api";

import { DashboardTab } from "./tabs/DashboardTab";
import { BannersTab } from "./tabs/BannersTab";
import { DoctorsTab } from "./tabs/DoctorsTab";
import { GroomingStaffTab } from "./tabs/GroomingStaffTab";
import { UsersTab } from "./tabs/UsersTab";
import { ServiceCategoriesTab } from "./tabs/ServiceCategoriesTab";
import { BranchesTab } from "./tabs/BranchesTab";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "banners", label: "Banners", icon: ImageIcon },
  { id: "doctors", label: "Doctors", icon: Stethoscope },
  { id: "staff", label: "Grooming Staff", icon: Scissors },
  { id: "users", label: "Users", icon: Users },
  { id: "categories", label: "Service Categories", icon: Tags },
  { id: "branches", label: "Branches", icon: MapPin }
];

interface CategoryFormState {
  name: string;
  status: CategoryStatus;
  image: File | null;
}

const initialForm: CategoryFormState = {
  name: "",
  status: "Active",
  image: null
};

// Initial mock doctors


// Initial mock users
interface User {
  id: string;
  name: string;
  email: string;
  petName: string;
  status: "Active" | "Inactive";
}

const mockUsers: User[] = [
  { id: "user-1", name: "Aarav", email: "aarav.patel@example.com", petName: "Bruno (Golden Retriever)", status: "Active" },
  { id: "user-2", name: "Priya Singh", email: "priya.singh@example.com", petName: "Luna (Persian Cat)", status: "Active" },
  { id: "user-3", name: "Rohan Das", email: "rohan.das@example.com", petName: "Rocky (German Shepherd)", status: "Inactive" },
  { id: "user-4", name: "Ananya Iyer", email: "ananya.iyer@example.com", petName: "Milo (Beagle)", status: "Active" }
];

export function AdminDashboard() {
  const branchIdFromUrl = useMemo(() => {
    const match = window.location.pathname.match(/^\/branch\/([^/]+)/);
    return match ? decodeURIComponent(match[1]) : "";
  }, []);
  const isBranchDashboard = Boolean(branchIdFromUrl);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(branchIdFromUrl || "all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Category tab state
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [editingCategory, setEditingCategory] = useState<ServiceCategory | null>(null);

  // Subcategory form state
  const [subForm, setSubForm] = useState<{
    name: string;
    price: string;
    status: CategoryStatus;
    image: File | null;
  }>({ name: "", price: "", status: "Active", image: null });
  const [subSubmitting, setSubSubmitting] = useState(false);

  // Doctor tab state
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [docForm, setDocForm] = useState<{
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
  }>({
    name: "",
    specialty: "",
    experience: "",
    status: "Active",
    image: null,
    education: "Graduated",
    bio: "",
    languages: "English, Hindi",
    expertise: "Dog, Cat",
    jobsCompleted: "0",
    rating: "5.0",
    reviews: [],
    username: "",
    password: "",
    branchId: ""
  });
  const [docSubmitting, setDocSubmitting] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);

  // New review sub-form state
  const [newReviewerName, setNewReviewerName] = useState("");
  const [newReviewRating, setNewReviewRating] = useState("5");
  const [newReviewComment, setNewReviewComment] = useState("");

  // Banner tab state
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bannerForm, setBannerForm] = useState<{ title: string; image: File | null }>({
    title: "",
    image: null
  });
  const [bannerSubmitting, setBannerSubmitting] = useState(false);

  // Branch tab state
  const [branchForm, setBranchForm] = useState<{
    name: string;
    city: string;
    address: string;
    phone: string;
  }>({ name: "", city: "", address: "", phone: "" });
  const [branchSubmitting, setBranchSubmitting] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  const bannerPreviewUrl = useMemo(() => {
    if (bannerForm.image) return URL.createObjectURL(bannerForm.image);
    return "";
  }, [bannerForm.image]);

  // Staff tab state
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [staffForm, setStaffForm] = useState<{
    name: string;
    phone: string;
    about: string;
    experience: string;
    status: "Active" | "Inactive";
    image: File | null;
    branchId: string;
  }>({
    name: "",
    phone: "",
    about: "",
    experience: "",
    status: "Active",
    image: null,
    branchId: ""
  });
  const [staffSubmitting, setStaffSubmitting] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const staffPreviewUrl = useMemo(() => {
    if (staffForm.image) return URL.createObjectURL(staffForm.image);
    if (editingStaff) return editingStaff.imageUrl || "";
    return "";
  }, [staffForm.image, editingStaff]);

  // Users state
  const [users] = useState<User[]>(mockUsers);

  const previewUrl = useMemo(() => {
    if (form.image) return URL.createObjectURL(form.image);
    if (editingCategory) return editingCategory.imageUrl;
    return "";
  }, [form.image, editingCategory]);

  const subPreviewUrl = useMemo(() => {
    if (subForm.image) return URL.createObjectURL(subForm.image);
    return "";
  }, [subForm.image]);

  const docPreviewUrl = useMemo(() => {
    if (docForm.image) return URL.createObjectURL(docForm.image);
    if (editingDoctor) return editingDoctor.imageUrl || "";
    return "";
  }, [docForm.image, editingDoctor]);

  async function loadData() {
    try {
      const [cats, appts, docs, bans, brs, stf] = await Promise.all([
        fetchCategories(),
        fetchAppointments(),
        fetchDoctors(),
        fetchBanners(),
        fetchBranches(),
        fetchStaff()
      ]);
      setCategories(cats);
      setAppointments(appts);
      setDoctors(docs);
      setBanners(bans);
      setBranches(brs);
      setStaffList(stf);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (isBranchDashboard) {
      setSelectedBranchId(branchIdFromUrl);
    }
  }, [branchIdFromUrl, isBranchDashboard]);

  const selectedBranch = useMemo(() => {
    return branches.find((branch) => branch._id === selectedBranchId) || null;
  }, [branches, selectedBranchId]);

  const visibleNavItems = useMemo(() => {
    return isBranchDashboard ? navItems.filter((item) => item.id !== "branches") : navItems;
  }, [isBranchDashboard]);

  function getBranchDashboardUrl(branchId: string) {
    return `${window.location.origin}/branch/${encodeURIComponent(branchId)}`;
  }

  async function copyBranchDashboardUrl(branchId: string) {
    const url = getBranchDashboardUrl(branchId);
    await navigator.clipboard.writeText(url);
    setNotice(`Copied branch dashboard URL: ${url}`);
  }

  function startEditCategory(category: ServiceCategory) {
    setEditingCategory(category);
    setForm({
      name: category.name,
      status: category.status,
      image: null
    });
  }

  function cancelEditCategory() {
    setEditingCategory(null);
    setForm(initialForm);
  }

  async function handleCategoryDelete(categoryId: string) {
    if (!window.confirm("Are you sure you want to delete this category?")) return;
    setError("");
    try {
      await deleteCategory(categoryId);
      setCategories((current) => current.filter((c) => c._id !== categoryId));
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

  // Category submission
  async function handleCategorySubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      if (editingCategory) {
        const updated = await updateCategory(editingCategory._id, {
          name: form.name,
          status: form.status,
          image: form.image
        });
        setCategories((current) => current.map((c) => (c._id === editingCategory._id ? updated : c)));
        cancelEditCategory();
      } else {
        if (!form.image) {
          throw new Error("Please choose a category image");
        }
        const saved = await createCategory({ name: form.name, status: form.status, image: form.image });
        setCategories((current) => [saved, ...current]);
        setForm(initialForm);
      }
    } catch (err: any) {
      setError(err.message || "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  }

  // Subcategory submission
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
      
      // Update local state
      setCategories((current) => current.map((c) => (c._id === updated._id ? updated : c)));
      setSelectedCategory(updated);
      setSubForm({ name: "", price: "", status: "Active", image: null });
    } catch (err: any) {
      setError(err.message || "Failed to add subcategory");
    } finally {
      setSubSubmitting(false);
    }
  }

  // Subcategory delete
  async function handleSubCategoryDelete(subId: string) {
    if (!selectedCategory) return;
    try {
      const updated = await deleteSubCategory(selectedCategory._id, subId);
      setCategories((current) => current.map((c) => (c._id === updated._id ? updated : c)));
      setSelectedCategory(updated);
    } catch (err: any) {
      setError(err.message || "Failed to delete subcategory");
    }
  }

  function startEditDoctor(doctor: Doctor) {
    setEditingDoctor(doctor);
    setDocForm({
      name: doctor.name,
      specialty: doctor.specialty,
      experience: String(doctor.experience),
      status: doctor.status,
      image: null,
      education: doctor.education || "Graduated",
      bio: doctor.bio || "",
      languages: doctor.languages ? doctor.languages.join(", ") : "English, Hindi",
      expertise: doctor.expertise ? doctor.expertise.join(", ") : "Dog, Cat",
      jobsCompleted: String(doctor.jobsCompleted || 0),
      rating: String(doctor.rating || 5.0),
      reviews: doctor.reviews || [],
      username: doctor.username || "",
      password: "",
      branchId: doctor.branchId || ""
    });
    setShowDoctorModal(true);
  }

  function cancelEditDoctor() {
    setEditingDoctor(null);
    setDocForm({
      name: "",
      specialty: "",
      experience: "",
      status: "Active",
      image: null,
      education: "Graduated",
      bio: "",
      languages: "English, Hindi",
      expertise: "Dog, Cat",
      jobsCompleted: "0",
      rating: "5.0",
      reviews: [],
      username: "",
      password: "",
      branchId: ""
    });
    setShowDoctorModal(false);
  }

  // Doctor submission
  async function handleDoctorSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!docForm.name || !docForm.specialty || !docForm.experience) return;
    setError("");
    setDocSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", docForm.name);
      formData.append("specialty", docForm.specialty);
      formData.append("experience", docForm.experience);
      formData.append("status", docForm.status);
      formData.append("education", docForm.education);
      formData.append("bio", docForm.bio);
      
      const langs = docForm.languages.split(",").map((l) => l.trim()).filter(Boolean);
      formData.append("languages", JSON.stringify(langs));

      const exps = docForm.expertise.split(",").map((e) => e.trim()).filter(Boolean);
      formData.append("expertise", JSON.stringify(exps));

      formData.append("jobsCompleted", docForm.jobsCompleted);
      formData.append("rating", docForm.rating);
      formData.append("reviews", JSON.stringify(docForm.reviews));

      if (docForm.username) {
        formData.append("username", docForm.username.trim());
      }
      if (docForm.password) {
        formData.append("password", docForm.password);
      }
      if (docForm.branchId) {
        formData.append("branchId", docForm.branchId);
      }

      if (docForm.image) {
        formData.append("image", docForm.image);
      }

      if (editingDoctor) {
        const saved = await updateDoctor(editingDoctor._id, formData);
        setDoctors((current) => current.map((d) => (d._id === editingDoctor._id ? saved : d)));
        cancelEditDoctor();
      } else {
        const saved = await createDoctor(formData);
        setDoctors((current) => [saved, ...current]);
        cancelEditDoctor();
      }
    } catch (err: any) {
      setError(err.message || "Failed to save doctor profile");
    } finally {
      setDocSubmitting(false);
    }
  }

  async function handleDoctorDelete(id: string) {
    if (!window.confirm("Are you sure you want to delete this doctor?")) return;
    setError("");
    try {
      await deleteDoctor(id);
      setDoctors((current) => current.filter((d) => d._id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete doctor");
    }
  }

  function handleAddReview(e: React.MouseEvent) {
    e.preventDefault();
    if (!newReviewerName || !newReviewComment) {
      alert("Please enter reviewer name and comment");
      return;
    }
    const newRev: Review = {
      reviewerName: newReviewerName,
      rating: Number(newReviewRating),
      comment: newReviewComment,
      date: new Date().toISOString()
    };
    setDocForm((prev) => ({
      ...prev,
      reviews: [...prev.reviews, newRev]
    }));
    setNewReviewerName("");
    setNewReviewComment("");
    setNewReviewRating("5");
  }

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
        setBranches((current) => current.map((b) => (b._id === editingBranchId ? saved : b)));
        cancelEditBranch();
      } else {
        const saved = await createBranch(branchForm);
        setBranches((current) => [...current, saved]);
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
      setBranches((current) => current.filter((b) => b._id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to delete branch");
    }
  }

  const branchMap = useMemo(() => {
    const map: Record<string, string> = {};
    branches.forEach((b) => {
      map[b._id] = b.name;
    });
    return map;
  }, [branches]);

  function handleDeleteReview(index: number, e: React.MouseEvent) {
    e.preventDefault();
    setDocForm((prev) => ({
      ...prev,
      reviews: prev.reviews.filter((_, idx) => idx !== index)
    }));
  }

  // Banner handlers
  async function handleBannerSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!bannerForm.image) {
      setError("Please choose a banner image");
      return;
    }
    if (banners.length >= 3) {
      setError("Maximum 3 banners allowed. Delete one first.");
      return;
    }
    setError("");
    setBannerSubmitting(true);
    try {
      const saved = await createBanner({ title: bannerForm.title, image: bannerForm.image });
      setBanners((current) => [...current, saved]);
      setBannerForm({ title: "", image: null });
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
    } catch (err: any) {
      setError(err.message || "Failed to delete banner");
    }
  }

  const filteredAppointments = useMemo(() => {
    if (selectedBranchId === "all") return appointments;
    return appointments.filter((a) => a.branchId === selectedBranchId);
  }, [appointments, selectedBranchId]);

  const filteredDoctors = useMemo(() => {
    if (selectedBranchId === "all") return doctors;
    return doctors.filter((d) => d.branchId === selectedBranchId);
  }, [doctors, selectedBranchId]);

  // Compute stats
  const stats = useMemo(() => {
    const totalBookings = filteredAppointments.length;
    const today = new Date().toDateString();
    const todayBookings = filteredAppointments.filter(
      (a) => new Date(a.appointmentDate).toDateString() === today
    ).length;
    const totalRevenue = filteredAppointments.reduce((sum, item) => sum + 1200, 0); // Mock average price Rs. 1200
    
    return {
      totalBookings,
      todayBookings,
      totalRevenue,
      categoriesCount: categories.length,
      doctorsCount: filteredDoctors.length
    };
  }, [filteredAppointments, categories, filteredDoctors]);

  return (
    <div className="min-h-screen bg-[#f7fbfa] flex">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-teal-100 bg-white/95 px-5 py-6 shadow-soft lg:block">
        <div className="mb-10 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded bg-clinic-teal text-lg font-bold text-white">M</div>
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-600">Maruthi</p>
            <h1 className="text-lg font-bold text-clinic-ink">Pet Clinic</h1>
          </div>
        </div>

        <nav className="space-y-2">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setSelectedCategory(null);
                  setError("");
                  setNotice("");
                }}
                className={`flex w-full items-center gap-3 rounded px-4 py-3 text-left text-sm font-semibold transition ${
                  isActive
                    ? "bg-teal-50 text-clinic-teal shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-clinic-ink"
                }`}
              >
                <Icon size={19} />
                {item.label}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main Area */}
      <main className="flex-1 lg:pl-72 min-h-screen flex flex-col">
        <section className="mx-auto w-full max-w-none px-5 py-6 sm:px-8 flex-1">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 border-b border-teal-100 pb-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-teal-600">
                {isBranchDashboard ? "Branch Dashboard" : "Admin Dashboard"}
              </p>
              <h2 className="mt-2 text-3xl font-bold text-clinic-ink">
                {isBranchDashboard && selectedBranch
                  ? `${selectedBranch.name} - ${visibleNavItems.find((n) => n.id === activeTab)?.label || "Dashboard"}`
                  : visibleNavItems.find((n) => n.id === activeTab)?.label || "Dashboard"}
              </h2>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {/* Branch Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Branch:</span>
                {isBranchDashboard ? (
                  <span className="rounded-lg border border-teal-100 bg-white px-3 py-2 text-sm font-bold text-clinic-teal">
                    {selectedBranch ? `${selectedBranch.name} (${selectedBranch.city})` : "Branch loading..."}
                  </span>
                ) : (
                  <select
                    value={selectedBranchId}
                    onChange={(e) => setSelectedBranchId(e.target.value)}
                    className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold outline-none transition focus:border-clinic-teal"
                  >
                    <option value="all">All Branches</option>
                    {branches.map((b) => (
                      <option key={b._id} value={b._id}>
                        {b.name} ({b.city})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="rounded bg-white px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm border border-teal-50">
                {activeTab === "categories"
                  ? `${categories.length} categories managed`
                  : activeTab === "doctors"
                  ? `${filteredDoctors.length} doctors onboarded`
                  : activeTab === "banners"
                  ? `${banners.length}/3 banners active`
                  : activeTab === "users"
                  ? `${users.length} clients registered`
                  : activeTab === "branches"
                  ? `${branches.length} branches setup`
                  : `${filteredAppointments.length} bookings recorded`}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex justify-between items-center">
              <span>{error}</span>
              <button onClick={() => setError("")}>
                <X size={16} />
              </button>
            </div>
          )}

          {notice && (
            <div className="mb-5 rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex justify-between items-center">
              <span>{notice}</span>
              <button onClick={() => setNotice("")}>
                <X size={16} />
              </button>
            </div>
          )}

          {loading ? (
            <div className="flex items-center justify-center py-24 text-teal-700">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clinic-teal mr-3"></div>
              <span className="font-bold">Syncing data from clinic server...</span>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {/* TAB: DASHBOARD */}
              {activeTab === "dashboard" && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <DashboardTab
                    stats={stats}
                    filteredAppointments={filteredAppointments}
                    branchMap={branchMap}
                  />
                </motion.div>
              )}

              {/* TAB: BANNERS */}
              {activeTab === "banners" && (
                <motion.div
                  key="banners"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <BannersTab
                    banners={banners}
                    bannerForm={bannerForm}
                    setBannerForm={setBannerForm}
                    bannerPreviewUrl={bannerPreviewUrl}
                    bannerSubmitting={bannerSubmitting}
                    handleBannerSubmit={handleBannerSubmit}
                    handleBannerDelete={handleBannerDelete}
                  />
                </motion.div>
              )}

              {/* TAB: DOCTORS */}
              {activeTab === "doctors" && (
                <motion.div
                  key="doctors"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <DoctorsTab
                    showDoctorModal={showDoctorModal}
                    setShowDoctorModal={setShowDoctorModal}
                    editingDoctor={editingDoctor}
                    docForm={docForm}
                    setDocForm={setDocForm}
                    docPreviewUrl={docPreviewUrl}
                    docSubmitting={docSubmitting}
                    handleDoctorSubmit={handleDoctorSubmit}
                    cancelEditDoctor={cancelEditDoctor}
                    branches={branches}
                    newReviewerName={newReviewerName}
                    setNewReviewerName={setNewReviewerName}
                    newReviewRating={newReviewRating}
                    setNewReviewRating={setNewReviewRating}
                    newReviewComment={newReviewComment}
                    setNewReviewComment={setNewReviewComment}
                    handleAddReview={handleAddReview}
                    handleDeleteReview={handleDeleteReview}
                    filteredDoctors={filteredDoctors}
                    branchMap={branchMap}
                    startEditDoctor={startEditDoctor}
                    handleDoctorDelete={handleDoctorDelete}
                  />
                </motion.div>
              )}

              {/* TAB: STAFF */}
              {activeTab === "staff" && (
                <motion.div
                  key="staff"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <GroomingStaffTab
                    showStaffModal={showStaffModal}
                    setShowStaffModal={setShowStaffModal}
                    editingStaff={editingStaff}
                    setEditingStaff={setEditingStaff}
                    staffForm={staffForm}
                    setStaffForm={setStaffForm}
                    staffSubmitting={staffSubmitting}
                    setStaffSubmitting={setStaffSubmitting}
                    staffPreviewUrl={staffPreviewUrl}
                    staffList={staffList}
                    setStaffList={setStaffList}
                    branches={branches}
                    branchMap={branchMap}
                    setError={setError}
                  />
                </motion.div>
              )}

              {/* TAB: BRANCHES */}
              {activeTab === "branches" && (
                <motion.div
                  key="branches"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <BranchesTab
                    branches={branches}
                    branchForm={branchForm}
                    setBranchForm={setBranchForm}
                    branchSubmitting={branchSubmitting}
                    handleBranchSubmit={handleBranchSubmit}
                    editingBranchId={editingBranchId}
                    cancelEditBranch={cancelEditBranch}
                    startEditBranch={startEditBranch}
                    handleBranchDelete={handleBranchDelete}
                    getBranchDashboardUrl={getBranchDashboardUrl}
                    copyBranchDashboardUrl={copyBranchDashboardUrl}
                  />
                </motion.div>
              )}

              {/* TAB: USERS */}
              {activeTab === "users" && (
                <motion.div
                  key="users"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <UsersTab users={users} />
                </motion.div>
              )}

              {/* TAB: SERVICE CATEGORIES & SUB-CATEGORIES */}
              {activeTab === "categories" && (
                <motion.div
                  key="categories"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                >
                  <ServiceCategoriesTab
                    categories={categories}
                    form={form}
                    setForm={setForm}
                    previewUrl={previewUrl}
                    submitting={submitting}
                    handleCategorySubmit={handleCategorySubmit}
                    editingCategory={editingCategory}
                    cancelEditCategory={cancelEditCategory}
                    startEditCategory={startEditCategory}
                    handleCategoryDelete={handleCategoryDelete}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    subForm={subForm}
                    setSubForm={setSubForm}
                    subPreviewUrl={subPreviewUrl}
                    subSubmitting={subSubmitting}
                    handleSubCategorySubmit={handleSubCategorySubmit}
                    handleSubCategoryDelete={handleSubCategoryDelete}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </section>
      </main>
    </div>
  );
}
