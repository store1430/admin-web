import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Stethoscope,
  Users,
  Tags,
  MapPin,
  ImageIcon,
  Scissors,
  X,
  Lock,
  Globe,
  KeyRound
} from "lucide-react";
import {
  Branch,
  fetchBranches,
  loginBranch
} from "../lib/api";

import { DashboardPage } from "./pages/DashboardPage";
import { BannersPage } from "./pages/BannersPage";
import { DoctorsPage } from "./pages/DoctorsPage";
import { GroomingStaffPage } from "./pages/GroomingStaffPage";
import { UsersPage } from "./pages/UsersPage";
import { ServiceCategoriesPage } from "./pages/ServiceCategoriesPage";
import { BranchesPage } from "./pages/BranchesPage";

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "banners", label: "Banners", icon: ImageIcon },
  { id: "doctors", label: "Doctors", icon: Stethoscope },
  { id: "staff", label: "Grooming Staff", icon: Scissors },
  { id: "users", label: "Users", icon: Users },
  { id: "categories", label: "Service Categories", icon: Tags },
  { id: "branches", label: "Branches", icon: MapPin }
];

export function AdminDashboard() {
  const branchIdFromUrl = useMemo(() => {
    const match = window.location.pathname.match(/^\/branch\/([^/]+)/);
    return match ? decodeURIComponent(match[1]) : "";
  }, []);
  const isBranchDashboard = Boolean(branchIdFromUrl);

  const [activeTab, setActiveTab] = useState("dashboard");
  const [branches, setBranches] = useState<Branch[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(branchIdFromUrl || "all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Branch login states
  const [isBranchAuthenticated, setIsBranchAuthenticated] = useState(false);
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  async function loadBranchesData() {
    try {
      setLoading(true);
      const data = await fetchBranches();
      setBranches(data);
    } catch (err: any) {
      setError(err.message || "Failed to load branches");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBranchesData();
  }, []);

  useEffect(() => {
    if (isBranchDashboard) {
      setSelectedBranchId(branchIdFromUrl);
      const auth = localStorage.getItem(`authenticated_branch_${branchIdFromUrl}`) === "true";
      setIsBranchAuthenticated(auth);
    }
  }, [branchIdFromUrl, isBranchDashboard]);

  const selectedBranch = useMemo(() => {
    return branches.find((branch) => branch._id === selectedBranchId) || null;
  }, [branches, selectedBranchId]);

  const visibleNavItems = useMemo(() => {
    return isBranchDashboard ? navItems.filter((item) => item.id !== "branches") : navItems;
  }, [isBranchDashboard]);

  const branchMap = useMemo(() => {
    const map: Record<string, string> = {};
    branches.forEach((b) => {
      map[b._id] = b.name;
    });
    return map;
  }, [branches]);

  function getBranchDashboardUrl(branchId: string) {
    return `${window.location.origin}/branch/${encodeURIComponent(branchId)}`;
  }

  async function copyBranchDashboardUrl(branchId: string) {
    const url = getBranchDashboardUrl(branchId);
    await navigator.clipboard.writeText(url);
    setNotice(`Copied branch dashboard URL: ${url}`);
  }

  async function handleBranchLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!loginUser || !loginPass) return;
    setLoginError("");
    setLoginSubmitting(true);
    try {
      const res = await loginBranch(loginUser, loginPass);
      if (res.success && res.branch._id === branchIdFromUrl) {
        localStorage.setItem(`authenticated_branch_${branchIdFromUrl}`, "true");
        setIsBranchAuthenticated(true);
      } else {
        throw new Error("Logged in branch does not match URL");
      }
    } catch (err: any) {
      setLoginError(err.message || "Invalid username or password");
    } finally {
      setLoginSubmitting(false);
    }
  }

  function handleBranchLogout() {
    localStorage.removeItem(`authenticated_branch_${branchIdFromUrl}`);
    setIsBranchAuthenticated(false);
    setLoginUser("");
    setLoginPass("");
    setLoginError("");
  }

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#f7fbfa] text-teal-700">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clinic-teal mr-3"></div>
        <span className="font-bold">Syncing location portal...</span>
      </div>
    );
  }

  // Scoped Auth Check: require login if branch dashboard and not yet authenticated
  if (isBranchDashboard && !isBranchAuthenticated) {
    const currentBranchName = branchMap[branchIdFromUrl] || "Location Portal";
    return (
      <div className="flex min-h-screen w-screen items-center justify-center bg-gradient-to-tr from-teal-50 via-white to-clinic-mint/30 p-4">
        <div className="w-full max-w-md rounded-3xl border border-teal-100 bg-white/95 p-8 shadow-2xl backdrop-blur-md animate-scaleUp">
          <div className="text-center mb-8">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-clinic-teal text-white shadow-lg shadow-teal-200/50 mb-4">
              <KeyRound size={28} />
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-teal-600">Location Access Portal</p>
            <h2 className="text-2xl font-black text-clinic-ink mt-1.5">{currentBranchName}</h2>
            <p className="text-xs text-slate-400 font-semibold mt-1">Please enter branch login credentials to proceed</p>
          </div>

          {loginError && (
            <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700 font-bold text-center">
              ⚠️ {loginError}
            </div>
          )}

          <form onSubmit={handleBranchLogin} className="space-y-5">
            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Username</span>
              <input
                required
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                placeholder="theni_admin"
                className="w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-50 text-sm"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-500">Password</span>
              <input
                required
                type="password"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 px-4 py-3.5 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-50 text-sm"
              />
            </label>

            <button
              type="submit"
              disabled={loginSubmitting}
              className="w-full rounded-xl bg-clinic-teal px-5 py-3.5 font-bold text-white shadow-lg shadow-teal-200 transition hover:bg-teal-800 disabled:opacity-60 text-sm"
            >
              {loginSubmitting ? "Authenticating..." : "Access Location Portal"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7fbfa] flex">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-teal-100 bg-white/95 px-5 py-6 shadow-soft lg:block">
        <div className="mb-10 flex items-center gap-4">
          <img
            src="https://ik.imagekit.io/zua3mzlzy/maruthi-pet-clinic/brand/maruthi-pet-clinic-logo_CqLq9YHOE.webp"
            alt="Maruthi Pet Clinic Logo"
            className="h-16 w-16 rounded-full object-cover shadow-md border border-teal-50"
            onError={(e) => {
              // Fallback if image fails to load
              e.currentTarget.style.display = "none";
              const fallback = document.getElementById("brand-fallback");
              if (fallback) fallback.style.display = "grid";
            }}
          />
          <div
            id="brand-fallback"
            className="hidden h-16 w-16 place-items-center rounded-full bg-clinic-teal text-lg font-bold text-white"
          >
            M
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-teal-600">Maruthi</p>
            <h1 className="text-lg font-black text-clinic-ink">Pet Clinic</h1>
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

        {isBranchDashboard && (
          <div className="absolute bottom-6 left-5 right-5">
            <button
              onClick={handleBranchLogout}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 bg-rose-50/45 hover:bg-rose-50 px-4 py-2.5 text-xs font-bold text-rose-600 transition"
            >
              <Lock size={13} />
              Lock Dashboard
            </button>
          </div>
        )}
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

          <AnimatePresence mode="wait">
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <DashboardPage
                  selectedBranchId={selectedBranchId}
                  branchMap={branchMap}
                />
              </motion.div>
            )}

            {activeTab === "banners" && (
              <motion.div
                key="banners"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <BannersPage
                  selectedBranchId={selectedBranchId}
                  branches={branches}
                />
              </motion.div>
            )}

            {activeTab === "doctors" && (
              <motion.div
                key="doctors"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <DoctorsPage
                  selectedBranchId={selectedBranchId}
                  branches={branches}
                  branchMap={branchMap}
                />
              </motion.div>
            )}

            {activeTab === "staff" && (
              <motion.div
                key="staff"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <GroomingStaffPage
                  selectedBranchId={selectedBranchId}
                  branches={branches}
                  branchMap={branchMap}
                />
              </motion.div>
            )}

            {activeTab === "branches" && (
              <motion.div
                key="branches"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <BranchesPage
                  branches={branches}
                  onBranchesUpdated={setBranches}
                  getBranchDashboardUrl={getBranchDashboardUrl}
                  copyBranchDashboardUrl={copyBranchDashboardUrl}
                />
              </motion.div>
            )}

            {activeTab === "users" && (
              <motion.div
                key="users"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <UsersPage />
              </motion.div>
            )}

            {activeTab === "categories" && (
              <motion.div
                key="categories"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
              >
                <ServiceCategoriesPage
                  selectedBranchId={selectedBranchId}
                  branches={branches}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </main>
    </div>
  );
}
