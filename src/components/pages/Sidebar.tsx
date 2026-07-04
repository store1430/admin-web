import React from "react";
import { 
  LayoutDashboard,
  Stethoscope,
  Users,
  Tags,
  MapPin,
  ImageIcon,
  Scissors,
  Lock,
  LucideIcon
} from "lucide-react";

interface NavigationItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavigationItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "banners", label: "Banners", icon: ImageIcon },
  { id: "doctors", label: "Doctors", icon: Stethoscope },
  { id: "staff", label: "Grooming Staff", icon: Scissors },
  { id: "users", label: "Users", icon: Users },
  { id: "categories", label: "Service Categories", icon: Tags },
  { id: "branches", label: "Branches", icon: MapPin }
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isBranchDashboard: boolean;
  handleBranchLogout: () => void;
}

export function Sidebar({
  activeTab,
  setActiveTab,
  isBranchDashboard,
  handleBranchLogout
}: SidebarProps) {
  
  const visibleNavItems = React.useMemo(() => {
    return isBranchDashboard ? navItems.filter((item) => item.id !== "branches") : navItems;
  }, [isBranchDashboard]);

  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-72 border-r border-teal-950/60 bg-[#091b17] px-5 py-6 shadow-2xl lg:block">
      {/* Brand Header */}
      <div className="mb-10 flex items-center gap-4 bg-teal-950/40 p-3.5 rounded-2xl border border-teal-900/40">
        <div className="relative shrink-0">
          <img
            src="https://ik.imagekit.io/zua3mzlzy/maruthi-pet-clinic/brand/maruthi-pet-clinic-logo_CqLq9YHOE.webp"
            alt="Maruthi Pet Clinic Logo"
            className="h-14 w-14 rounded-full object-cover shadow-lg border-2 border-clinic-mint/80"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              const fallback = document.getElementById("brand-fallback");
              if (fallback) fallback.style.display = "grid";
            }}
          />
          <div
            id="brand-fallback"
            className="hidden h-14 w-14 place-items-center rounded-full bg-clinic-teal text-lg font-bold text-white border-2 border-clinic-mint"
          >
            M
          </div>
          {/* Pulsing online indicator */}
          <span className="absolute bottom-0.5 right-0.5 block h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-[#091b17] animate-pulse"></span>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-clinic-mint">Maruthi</p>
          <h1 className="text-base font-black text-white leading-tight">Pet Clinic</h1>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="space-y-2.5">
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`group relative flex w-full items-center gap-3 rounded-xl px-4.5 py-3.5 text-left text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? "bg-gradient-to-r from-teal-900/60 to-emerald-900/60 text-clinic-mint border border-teal-500/25 shadow-md shadow-teal-950/20 translate-x-1"
                  : "text-slate-400 hover:text-white hover:bg-teal-950/30 hover:translate-x-1"
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-3 bottom-3 w-1.5 rounded-r-full bg-clinic-mint shadow-md shadow-clinic-mint/60"></span>
              )}
              <Icon size={19} className={`transition-transform duration-300 group-hover:scale-110 ${isActive ? "text-clinic-mint" : "text-slate-400 group-hover:text-white"}`} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Lock Dashboard Button at the bottom */}
      {isBranchDashboard && (
        <div className="absolute bottom-6 left-5 right-5">
          <button
            onClick={handleBranchLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-900/40 bg-rose-500/10 hover:bg-rose-500 px-4 py-3 text-xs font-bold text-rose-300 hover:text-white transition-all duration-300 shadow-sm"
          >
            <Lock size={13} className="shrink-0" />
            Lock Dashboard
          </button>
        </div>
      )}
    </aside>
  );
}
