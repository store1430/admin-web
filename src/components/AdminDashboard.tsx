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
                  className="space-y-8"
                >
                  {/* Stats Cards */}
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-2xl border border-teal-100 bg-white p-6 shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-teal-50 rounded-xl text-clinic-teal">
                        <Calendar size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-400">Total Bookings</p>
                        <h4 className="text-2xl font-bold text-clinic-ink">{stats.totalBookings}</h4>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-teal-100 bg-white p-6 shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
                        <CheckCircle size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-400">Today's Bookings</p>
                        <h4 className="text-2xl font-bold text-clinic-ink">{stats.todayBookings}</h4>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-teal-100 bg-white p-6 shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-rose-50 rounded-xl text-rose-600">
                        <IndianRupee size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-400">Estimated Revenue</p>
                        <h4 className="text-2xl font-bold text-clinic-ink">Rs. {stats.totalRevenue}</h4>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-teal-100 bg-white p-6 shadow-sm flex items-center gap-4">
                      <div className="p-3 bg-clinic-mint rounded-xl text-teal-800">
                        <Layers size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-400">Categories / Doctors</p>
                        <h4 className="text-2xl font-bold text-clinic-ink">
                          {stats.categoriesCount} / {stats.doctorsCount}
                        </h4>
                      </div>
                    </div>
                  </div>

                  {/* Appointments Table */}
                  <div className="rounded-2xl border border-teal-100 bg-white shadow-soft overflow-hidden">
                    <div className="border-b border-teal-100 px-6 py-4 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-clinic-ink">Recent Bookings Log</h3>
                      <span className="text-xs bg-clinic-mint text-clinic-teal px-3 py-1 rounded-full font-bold">
                        Live Feeds
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[800px] text-left">
                        <thead className="bg-teal-50/55 text-xs uppercase tracking-[0.14em] text-teal-700">
                          <tr>
                            <th className="px-6 py-4">Pet / Owner</th>
                            <th className="px-6 py-4">Service category</th>
                            <th className="px-6 py-4">Date & Slot</th>
                            <th className="px-6 py-4">Mode</th>
                            <th className="px-6 py-4">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {filteredAppointments.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-semibold">
                                No appointments booked yet.
                              </td>
                            </tr>
                          ) : (
                            filteredAppointments.map((appt) => (
                              <tr key={appt._id} className="transition hover:bg-slate-50">
                                <td className="px-6 py-4 font-bold text-clinic-ink">
                                  <div>{appt.petName}</div>
                                  <div className="text-xs text-slate-400 font-medium">
                                    🏢 {branchMap[appt.branchId || ""] || "No Branch"}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-slate-600 font-semibold">{appt.serviceType}</td>
                                <td className="px-6 py-4">
                                  <p className="text-sm text-slate-600 font-semibold">
                                    {new Date(appt.appointmentDate).toLocaleDateString()}
                                  </p>
                                  <p className="text-xs text-slate-400">{appt.timeSlot}</p>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex items-center gap-1 text-xs font-bold rounded-full px-3 py-1 ${
                                    appt.appointmentType === "Video"
                                      ? "bg-blue-50 text-blue-700"
                                      : "bg-orange-50 text-orange-700"
                                  }`}>
                                    {appt.appointmentType}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`text-xs font-bold rounded px-2.5 py-1 ${
                                    appt.status === "Booked"
                                      ? "bg-teal-50 text-clinic-teal"
                                      : appt.status === "Completed"
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-slate-100 text-slate-500"
                                  }`}>
                                    {appt.status}
                                  </span>
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

              {/* TAB: BANNERS */}
              {activeTab === "banners" && (
                <motion.div
                  key="banners"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="grid gap-6 xl:grid-cols-[380px_1fr]"
                >
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
                </motion.div>
              )}

              {/* TAB: DOCTORS */}
              {activeTab === "doctors" && (
                <motion.div
                  key="doctors"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="grid gap-6 xl:grid-cols-[380px_1fr]"
                >
                  {/* Doctor Form */}
                  <form onSubmit={handleDoctorSubmit} className="rounded-2xl border border-teal-100 bg-white p-5 shadow-soft h-fit">
                    <h3 className="mb-5 text-lg font-bold text-clinic-ink">
                      {editingDoctor ? "Edit Doctor Profile" : "Onboard New Doctor"}
                    </h3>

                    <label className="mb-4 block">
                      <span className="mb-2 block text-sm font-semibold text-slate-600">Full Name</span>
                      <input
                        required
                        value={docForm.name}
                        onChange={(e) => setDocForm({ ...docForm, name: e.target.value })}
                        placeholder="Dr. Rajesh Patel"
                        className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100"
                      />
                    </label>

                    <label className="mb-4 block">
                      <span className="mb-2 block text-sm font-semibold text-slate-600">Specialty</span>
                      <input
                        required
                        value={docForm.specialty}
                        onChange={(e) => setDocForm({ ...docForm, specialty: e.target.value })}
                        placeholder="Veterinary Surgeon"
                        className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100"
                      />
                    </label>

                    <label className="mb-4 block">
                      <span className="mb-2 block text-sm font-semibold text-slate-600">Assigned Branch</span>
                      <select
                        required
                        value={docForm.branchId}
                        onChange={(e) => setDocForm({ ...docForm, branchId: e.target.value })}
                        className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 bg-white"
                      >
                        <option value="">Select Branch</option>
                        {branches.map((b) => (
                          <option key={b._id} value={b._id}>
                            {b.name} ({b.city})
                          </option>
                        ))}
                      </select>
                    </label>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-600">Experience (Years)</span>
                        <input
                          required
                          type="number"
                          min="0"
                          value={docForm.experience}
                          onChange={(e) => setDocForm({ ...docForm, experience: e.target.value })}
                          placeholder="10"
                          className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-600">Education</span>
                        <input
                          required
                          value={docForm.education}
                          onChange={(e) => setDocForm({ ...docForm, education: e.target.value })}
                          placeholder="Graduated"
                          className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100"
                        />
                      </label>
                    </div>

                    <label className="mb-4 block">
                      <span className="mb-2 block text-sm font-semibold text-slate-600">Bio</span>
                      <textarea
                        value={docForm.bio}
                        onChange={(e) => setDocForm({ ...docForm, bio: e.target.value })}
                        placeholder="Friendly and passionate veterinarian..."
                        rows={3}
                        className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm"
                      />
                    </label>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-600">Languages</span>
                        <input
                          value={docForm.languages}
                          onChange={(e) => setDocForm({ ...docForm, languages: e.target.value })}
                          placeholder="English, Hindi"
                          className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-600">Expertise</span>
                        <input
                          value={docForm.expertise}
                          onChange={(e) => setDocForm({ ...docForm, expertise: e.target.value })}
                          placeholder="Dog, Cat"
                          className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-600">Jobs Completed</span>
                        <input
                          type="number"
                          min="0"
                          value={docForm.jobsCompleted}
                          onChange={(e) => setDocForm({ ...docForm, jobsCompleted: e.target.value })}
                          placeholder="6037"
                          className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100"
                        />
                      </label>

                      <label className="block">
                        <span className="mb-2 block text-sm font-semibold text-slate-600">Rating (1.0 - 5.0)</span>
                        <input
                          type="number"
                          step="0.01"
                          min="1"
                          max="5"
                          value={docForm.rating}
                          onChange={(e) => setDocForm({ ...docForm, rating: e.target.value })}
                          placeholder="4.25"
                          className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4">
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

                    <label className="mb-4 block">
                      <span className="mb-2 block text-sm font-semibold text-slate-600">Status</span>
                      <select
                        value={docForm.status}
                        onChange={(e) => setDocForm({ ...docForm, status: e.target.value as "Active" | "Inactive" })}
                        className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100"
                      >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </label>

                    <label className="mb-5 block cursor-pointer rounded border-2 border-dashed border-teal-200 bg-teal-50/60 p-4 text-center transition hover:border-clinic-teal">
                      {docPreviewUrl ? (
                        <img src={docPreviewUrl} alt="Doctor preview" className="mx-auto h-24 w-24 rounded-full object-cover" />
                      ) : (
                        <div className="grid place-items-center gap-1.5 py-3 text-teal-700">
                          <UploadCloud size={24} />
                          <span className="text-xs font-semibold">Choose doctor photo</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => setDocForm({ ...docForm, image: e.target.files?.[0] || null })}
                      />
                    </label>

                    {/* Reviews Sub-Form */}
                    <div className="mb-6 border-t border-slate-100 pt-4">
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

                    <div className="flex gap-3">
                      {editingDoctor && (
                        <button
                          type="button"
                          onClick={cancelEditDoctor}
                          className="flex-1 rounded border border-slate-200 bg-white px-4 py-3 font-bold text-slate-500 transition hover:bg-slate-50 text-sm"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        disabled={docSubmitting}
                        className="flex-1 rounded bg-clinic-teal px-4 py-3 font-bold text-white shadow-lg shadow-teal-200 transition hover:bg-teal-800 disabled:opacity-60 text-sm"
                      >
                        {docSubmitting ? "Saving..." : editingDoctor ? "Update Profile" : "Save Doctor Profile"}
                      </button>
                    </div>
                  </form>

                  {/* Doctor List */}
                  <div className="rounded-2xl border border-teal-100 bg-white shadow-soft overflow-hidden h-fit">
                    <div className="border-b border-teal-100 px-5 py-4">
                      <h3 className="text-lg font-bold text-clinic-ink">Active Doctor Panel</h3>
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
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB: STAFF */}
              {activeTab === "staff" && (
                <motion.div
                  key="staff"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="grid gap-6 xl:grid-cols-[380px_1fr]"
                >
                  {/* Staff Form */}
                  <form
                    onSubmit={async (e) => {
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
                          setEditingStaff(null);
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
                        setStaffForm({ name: "", phone: "", about: "", experience: "", status: "Active", image: null, branchId: "" });
                      } catch (err: any) {
                        setError(err.message || "Failed to save staff member");
                      } finally {
                        setStaffSubmitting(false);
                      }
                    }}
                    className="rounded-2xl border border-teal-100 bg-white p-5 shadow-soft h-fit"
                  >
                    <h3 className="mb-5 text-lg font-bold text-clinic-ink">
                      {editingStaff ? "Edit Staff Member" : "Add Grooming Staff"}
                    </h3>

                    {/* Staff Photo Upload */}
                    <div className="mb-4">
                      <span className="mb-2 block text-sm font-semibold text-slate-600">Staff Photo</span>
                      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-teal-200 bg-teal-50/40 p-4 transition hover:border-clinic-teal hover:bg-teal-50">
                        {staffPreviewUrl ? (
                          <img src={staffPreviewUrl} alt="Preview" className="h-24 w-24 rounded-full object-cover border-2 border-teal-200" />
                        ) : (
                          <>
                            <User size={32} className="text-teal-400" />
                            <span className="text-xs text-slate-500 font-medium">Click to upload photo</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => setStaffForm({ ...staffForm, image: e.target.files?.[0] || null })}
                        />
                      </label>
                    </div>

                    <label className="mb-4 block">
                      <span className="mb-2 block text-sm font-semibold text-slate-600">Full Name *</span>
                      <input
                        required
                        value={staffForm.name}
                        onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
                        placeholder="e.g. Ravi Kumar"
                        className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm"
                      />
                    </label>

                    <label className="mb-4 block">
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

                    <label className="mb-4 block">
                      <span className="mb-2 block text-sm font-semibold text-slate-600">Experience (Years) *</span>
                      <input
                        required
                        type="number"
                        min="0"
                        value={staffForm.experience}
                        onChange={(e) => setStaffForm({ ...staffForm, experience: e.target.value })}
                        placeholder="e.g. 3"
                        className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm"
                      />
                    </label>

                    <label className="mb-4 block">
                      <span className="mb-2 block text-sm font-semibold text-slate-600">About</span>
                      <textarea
                        rows={3}
                        value={staffForm.about}
                        onChange={(e) => setStaffForm({ ...staffForm, about: e.target.value })}
                        placeholder="Brief description about the staff member..."
                        className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm resize-none"
                      />
                    </label>

                    <label className="mb-4 block">
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

                    <label className="mb-5 block">
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

                    <div className="flex gap-3">
                      {editingStaff && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingStaff(null);
                            setStaffForm({ name: "", phone: "", about: "", experience: "", status: "Active", image: null, branchId: "" });
                          }}
                          className="flex-1 rounded border border-slate-200 bg-white px-4 py-3 font-bold text-slate-500 transition hover:bg-slate-50 text-sm"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        disabled={staffSubmitting}
                        className="flex-1 rounded bg-clinic-teal px-4 py-3 font-bold text-white shadow-lg shadow-teal-200 transition hover:bg-teal-800 disabled:opacity-60 text-sm"
                      >
                        {staffSubmitting ? "Saving..." : editingStaff ? "Update Staff" : "Add Staff Member"}
                      </button>
                    </div>
                  </form>

                  {/* Staff List */}
                  <div className="rounded-2xl border border-teal-100 bg-white shadow-soft overflow-hidden h-fit">
                    <div className="border-b border-teal-100 px-5 py-4 flex items-center justify-between">
                      <h3 className="text-lg font-bold text-clinic-ink flex items-center gap-2">
                        <Scissors size={18} className="text-clinic-teal" />
                        Grooming Staff Panel
                      </h3>
                      <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-clinic-teal">
                        {staffList.length} member{staffList.length !== 1 ? "s" : ""}
                      </span>
                    </div>

                    {staffList.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
                        <Scissors size={40} />
                        <p className="font-semibold">No grooming staff added yet</p>
                        <p className="text-xs">Use the form to add your first staff member</p>
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
                                    setError(err.message || "Failed to delete");
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
                </motion.div>
              )}

              {/* TAB: BRANCHES */}
              {activeTab === "branches" && (
                <motion.div
                  key="branches"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="grid gap-6 xl:grid-cols-[380px_1fr]"
                >
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
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB: USERS */}
              {activeTab === "users" && (
                <motion.div
                  key="users"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="rounded-2xl border border-teal-100 bg-white shadow-soft overflow-hidden"
                >
                  <div className="border-b border-teal-100 px-5 py-4">
                    <h3 className="text-lg font-bold text-clinic-ink">Client List</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-teal-50 text-xs uppercase tracking-[0.14em] text-teal-700">
                        <tr>
                          <th className="px-5 py-4">Owner Name</th>
                          <th className="px-5 py-4">Email</th>
                          <th className="px-5 py-4">Registered Pets</th>
                          <th className="px-5 py-4">Account Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {users.map((usr) => (
                          <tr key={usr.id} className="transition hover:bg-slate-50">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-slate-600 font-bold">
                                  {usr.name.substring(0, 1)}
                                </div>
                                <p className="font-bold text-clinic-ink">{usr.name}</p>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-sm text-slate-600">{usr.email}</td>
                            <td className="px-5 py-4 text-sm text-slate-600 font-bold">{usr.petName}</td>
                            <td className="px-5 py-4">
                              <span className={`rounded px-3 py-1 text-xs font-bold ${
                                usr.status === "Active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"
                              }`}>
                                {usr.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {/* TAB: SERVICE CATEGORIES & SUB-CATEGORIES */}
              {activeTab === "categories" && (
                <motion.div
                  key="categories"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  className="space-y-6"
                >
                  <div className="grid gap-6 xl:grid-cols-[400px_1fr]">
                    {/* Add/Edit Category Form */}
                    <form onSubmit={handleCategorySubmit} className="rounded-2xl border border-teal-100 bg-white p-5 shadow-soft h-fit">
                      <h3 className="mb-5 text-lg font-bold text-clinic-ink">
                        {editingCategory ? "Edit Service Category" : "Add Service Category"}
                      </h3>

                      <label className="mb-4 block">
                        <span className="mb-2 block text-sm font-semibold text-slate-600">Category Name</span>
                        <input
                          required
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          placeholder="Grooming"
                          className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100"
                        />
                      </label>



                      <label className="mb-4 block">
                        <span className="mb-2 block text-sm font-semibold text-slate-600">Status</span>
                        <select
                          value={form.status}
                          onChange={(e) => setForm({ ...form, status: e.target.value as CategoryStatus })}
                          className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </label>

                      <label className="mb-5 block cursor-pointer rounded border-2 border-dashed border-teal-200 bg-teal-50/60 p-5 text-center transition hover:border-clinic-teal">
                        {previewUrl ? (
                          <img src={previewUrl} alt="Category preview" className="mx-auto h-36 w-full rounded object-cover" />
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

                      <div className="flex gap-3">
                        {editingCategory && (
                          <button
                            type="button"
                            onClick={cancelEditCategory}
                            className="flex-1 rounded border border-slate-200 bg-white px-5 py-3 font-bold text-slate-500 transition hover:bg-slate-50"
                          >
                            Cancel
                          </button>
                        )}
                        <button
                          disabled={submitting}
                          className="flex-1 rounded bg-clinic-teal px-5 py-3 font-bold text-white shadow-lg shadow-teal-200 transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {submitting ? "Saving..." : editingCategory ? "Update Category" : "Save Category"}
                        </button>
                      </div>
                    </form>

                    {/* Category Library */}
                    <div className="rounded-2xl border border-teal-100 bg-white shadow-soft overflow-hidden h-fit">
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
                                  No categories yet.
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
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </section>
      </main>
    </div>
  );
}
