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
  X
} from "lucide-react";
import {
  Branch,
  fetchBranches
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

  if (loading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#f7fbfa] text-teal-700">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clinic-teal mr-3"></div>
        <span className="font-bold">Syncing location portal...</span>
      </div>
    );
  }

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
