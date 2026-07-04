import React, { useEffect, useState, useMemo } from "react";
import { 
  Calendar, 
  CheckCircle, 
  IndianRupee, 
  Layers, 
  TrendingUp, 
  Sparkles, 
  Clock, 
  User, 
  ChevronRight, 
  MapPin,
  Activity,
  Plus
} from "lucide-react";
import { Appointment, ServiceCategory, Doctor, fetchAppointments, fetchCategories, fetchDoctors } from "../../lib/api";

interface DashboardPageProps {
  selectedBranchId: string;
  branchMap: Record<string, string>;
}

export function DashboardPage({ selectedBranchId, branchMap }: DashboardPageProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const timeGreeting = useMemo(() => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good Morning";
    if (hr < 17) return "Good Afternoon";
    return "Good Evening";
  }, []);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [cats, appts, docs] = await Promise.all([
          fetchCategories(),
          fetchAppointments(),
          fetchDoctors()
        ]);
        setCategories(cats);
        setAppointments(appts);
        setDoctors(docs);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const filteredAppointments = useMemo(() => {
    if (selectedBranchId === "all") return appointments;
    return appointments.filter((a) => a.branchId === selectedBranchId);
  }, [appointments, selectedBranchId]);

  const filteredDoctors = useMemo(() => {
    if (selectedBranchId === "all") return doctors;
    return doctors.filter((d) => d.branchId === selectedBranchId);
  }, [doctors, selectedBranchId]);

  const stats = useMemo(() => {
    const totalBookings = filteredAppointments.length;
    const today = new Date().toDateString();
    const todayBookings = filteredAppointments.filter(
      (a) => new Date(a.appointmentDate).toDateString() === today
    ).length;
    
    // Calculate total revenue from appointments (mock checkup = 1200, surgery = 4500, grooming = 1800)
    const totalRevenue = filteredAppointments.reduce((sum, appt) => {
      const type = appt.serviceType.toLowerCase();
      if (type.includes("surgery") || type.includes("operation")) return sum + 4500;
      if (type.includes("grooming") || type.includes("bath")) return sum + 1800;
      return sum + 1200;
    }, 0);
    
    return {
      totalBookings,
      todayBookings,
      totalRevenue,
      categoriesCount: categories.length,
      doctorsCount: filteredDoctors.length
    };
  }, [filteredAppointments, categories, filteredDoctors]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-teal-700">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-clinic-teal mb-4"></div>
        <span className="font-bold text-sm tracking-wider text-slate-500 uppercase">Generating Portal Metrics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 px-6 py-5 text-sm text-rose-700 font-semibold shadow-sm">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Premium Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-950 p-6 md:p-8 text-white shadow-xl">
        <div className="absolute right-0 top-0 -mr-16 -mt-16 h-64 w-64 rounded-full bg-teal-700/20 blur-3xl"></div>
        <div className="absolute left-1/3 bottom-0 -mb-20 h-48 w-48 rounded-full bg-emerald-500/10 blur-2xl"></div>

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/25 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-clinic-mint border border-teal-400/30">
              <Sparkles size={12} className="animate-pulse" />
              Live Workspace
            </span>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">{timeGreeting}, Administrator</h2>
            <p className="text-teal-100/80 text-sm font-semibold max-w-xl">
              Manage appointments, verify active vet clinics data feeds, and monitor operations metrics across branches in real-time.
            </p>
          </div>
          
          <div className="shrink-0 flex items-center gap-4 bg-white/10 backdrop-blur-md border border-white/10 p-4 rounded-2xl">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-clinic-mint text-teal-900 shadow-md">
              <Calendar size={22} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-wider text-teal-200">System Date</p>
              <p className="font-extrabold text-sm text-white">
                {new Date().toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Grid: Vibrant Metrics Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1 */}
        <div className="group relative overflow-hidden rounded-2xl border border-teal-100/85 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-clinic-teal/40">
          <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-teal-50/50 group-hover:scale-125 transition-transform duration-500"></div>
          <div className="flex items-center gap-4 relative">
            <div className="p-3 bg-teal-50 rounded-2xl text-clinic-teal shadow-inner group-hover:bg-clinic-teal group-hover:text-white transition-all duration-300">
              <Calendar size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Bookings</p>
              <h4 className="text-3xl font-black text-clinic-ink mt-0.5">{stats.totalBookings}</h4>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="group relative overflow-hidden rounded-2xl border border-teal-100/85 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-emerald-500/40">
          <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-emerald-50/50 group-hover:scale-125 transition-transform duration-500"></div>
          <div className="flex items-center gap-4 relative">
            <div className="p-3 bg-emerald-50 rounded-2xl text-emerald-700 shadow-inner group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
              <CheckCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Bookings</p>
              <h4 className="text-3xl font-black text-clinic-ink mt-0.5">{stats.todayBookings}</h4>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="group relative overflow-hidden rounded-2xl border border-teal-100/85 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-rose-500/40">
          <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-rose-50/50 group-hover:scale-125 transition-transform duration-500"></div>
          <div className="flex items-center gap-4 relative">
            <div className="p-3 bg-rose-50 rounded-2xl text-rose-600 shadow-inner group-hover:bg-rose-600 group-hover:text-white transition-all duration-300">
              <IndianRupee size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Estimated Revenue</p>
              <h4 className="text-3xl font-black text-clinic-ink mt-0.5">₹{stats.totalRevenue.toLocaleString()}</h4>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="group relative overflow-hidden rounded-2xl border border-teal-100/85 bg-white p-6 shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:border-sky-500/40">
          <div className="absolute top-0 right-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-sky-50/50 group-hover:scale-125 transition-transform duration-500"></div>
          <div className="flex items-center gap-4 relative">
            <div className="p-3 bg-sky-50 rounded-2xl text-sky-700 shadow-inner group-hover:bg-sky-600 group-hover:text-white transition-all duration-300">
              <Layers size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Categories / Doctors</p>
              <h4 className="text-3xl font-black text-clinic-ink mt-0.5">
                {stats.categoriesCount} <span className="text-slate-300 font-light">/</span> {stats.doctorsCount}
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Charts & Graphs Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Curvy Area Chart Card */}
        <div className="lg:col-span-2 rounded-3xl border border-teal-100/80 bg-white p-6 shadow-soft space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-lg font-black text-clinic-ink">Booking Activity Chart</h3>
              <p className="text-xs text-slate-400 font-semibold">Weekly load and performance analysis</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full">
              <TrendingUp size={14} />
              <span>+18.4% growth</span>
            </div>
          </div>

          {/* SVG Curvy Chart */}
          <div className="relative h-64 w-full">
            <svg viewBox="0 0 500 200" className="w-full h-full">
              <defs>
                <linearGradient id="chart-grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d9488" stopOpacity="0.32" />
                  <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="line-grad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#0f766e" />
                  <stop offset="50%" stopColor="#0d9488" />
                  <stop offset="100%" stopColor="#10b981" />
                </linearGradient>
              </defs>
              {/* Grid Lines */}
              <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="90" x2="500" y2="90" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="140" x2="500" y2="140" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="180" x2="500" y2="180" stroke="#e2e8f0" strokeWidth="1" />

              {/* Area path */}
              <path
                d="M 0 160 C 50 140, 70 80, 120 90 C 170 100, 200 40, 250 50 C 300 60, 330 130, 380 120 C 430 110, 450 60, 500 40 L 500 180 L 0 180 Z"
                fill="url(#chart-grad)"
              />

              {/* Line path */}
              <path
                d="M 0 160 C 50 140, 70 80, 120 90 C 170 100, 200 40, 250 50 C 300 60, 330 130, 380 120 C 430 110, 450 60, 500 40"
                fill="none"
                stroke="url(#line-grad)"
                strokeWidth="4"
                strokeLinecap="round"
              />

              {/* Hover Circles */}
              <circle cx="120" cy="90" r="5" fill="#0d9488" stroke="#ffffff" strokeWidth="2" />
              <circle cx="250" cy="50" r="5" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
              <circle cx="380" cy="120" r="5" fill="#0f766e" stroke="#ffffff" strokeWidth="2" />
            </svg>
            <div className="absolute inset-x-0 bottom-0 flex justify-between px-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest pt-2">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        {/* Circular Distribution Donut Card */}
        <div className="rounded-3xl border border-teal-100/80 bg-white p-6 shadow-soft flex flex-col justify-between">
          <div className="space-y-0.5">
            <h3 className="text-lg font-black text-clinic-ink">Services Distribution</h3>
            <p className="text-xs text-slate-400 font-semibold">Popular booking categories</p>
          </div>

          <div className="relative flex justify-center py-6">
            {/* SVG Donut Chart */}
            <svg width="140" height="140" viewBox="0 0 36 36" className="transform -rotate-90">
              <circle cx="18" cy="18" r="15.91" fill="none" stroke="#f1f5f9" strokeWidth="4" />
              <circle cx="18" cy="18" r="15.91" fill="none" stroke="#0d9488" strokeWidth="4.2" strokeDasharray="45 100" strokeDashoffset="0" />
              <circle cx="18" cy="18" r="15.91" fill="none" stroke="#10b981" strokeWidth="4.2" strokeDasharray="25 100" strokeDashoffset="-45" />
              <circle cx="18" cy="18" r="15.91" fill="none" stroke="#3b82f6" strokeWidth="4.2" strokeDasharray="15 100" strokeDashoffset="-70" />
              <circle cx="18" cy="18" r="15.91" fill="none" stroke="#f97316" strokeWidth="4.2" strokeDasharray="15 100" strokeDashoffset="-85" />
            </svg>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <p className="text-2xl font-black text-clinic-ink">85%</p>
              <p className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400">Target</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-bold text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-clinic-teal"></span>
              <span>General (45%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              <span>Grooming (25%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500"></span>
              <span>Surgery (15%)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-orange-500"></span>
              <span>Vaccine (15%)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Bottom Section: Bookings & Quick Actions */}
      <div className="grid gap-6 xl:grid-cols-3">
        {/* Bookings log table (Takes 2 cols) */}
        <div className="xl:col-span-2 rounded-3xl border border-teal-100/80 bg-white shadow-soft overflow-hidden">
          <div className="border-b border-teal-50 px-6 py-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-50 rounded-lg text-clinic-teal animate-pulse">
                <Activity size={18} />
              </div>
              <div>
                <h3 className="text-lg font-black text-clinic-ink">Recent Bookings Log</h3>
                <p className="text-xs text-slate-400 font-semibold mt-0.5">Real-time appointments streaming feeds</p>
              </div>
            </div>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full font-black uppercase tracking-wider border border-emerald-200/50">
              Live Feeds
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left">
              <thead className="bg-slate-50/75 text-[10px] font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">Pet / Owner</th>
                  <th className="px-6 py-4">Service Category</th>
                  <th className="px-6 py-4">Date & Slot</th>
                  <th className="px-6 py-4">Type</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAppointments.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400 font-bold italic text-sm">
                      No appointments booked yet for this branch.
                    </td>
                  </tr>
                ) : (
                  filteredAppointments.slice(0, 5).map((appt) => (
                    <tr key={appt._id} className="transition hover:bg-teal-50/20 group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="grid h-9 w-9 place-items-center rounded-xl bg-teal-50 text-clinic-teal font-extrabold text-sm border border-teal-100/50 group-hover:scale-105 transition-transform">
                            {appt.petName.substring(0, 1)}
                          </div>
                          <div>
                            <p className="font-bold text-clinic-ink text-sm">{appt.petName}</p>
                            <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
                              <MapPin size={10} />
                              {branchMap[appt.branchId || ""] || "No Location"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-slate-700">{appt.serviceType}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5 text-xs text-slate-600 font-semibold">
                          <Clock size={12} className="text-slate-400" />
                          <span>{new Date(appt.appointmentDate).toLocaleDateString()}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold mt-0.5 pl-3.5">{appt.timeSlot}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider rounded-full px-2.5 py-1 ${
                          appt.appointmentType === "Video"
                            ? "bg-blue-50 text-blue-700 border border-blue-100/50"
                            : "bg-orange-50 text-orange-700 border border-orange-100/50"
                        }`}>
                          {appt.appointmentType}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 text-[11px] font-black rounded px-2.5 py-1 ${
                          appt.status === "Booked"
                            ? "bg-teal-50 text-clinic-teal border border-teal-100"
                            : appt.status === "Completed"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
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

        {/* Shortcuts / Quick Actions Card */}
        <div className="rounded-3xl border border-teal-100/80 bg-white p-6 shadow-soft flex flex-col justify-between space-y-6">
          <div className="space-y-0.5">
            <h3 className="text-lg font-black text-clinic-ink">Quick Launch Shortcuts</h3>
            <p className="text-xs text-slate-400 font-semibold">Frequently used actions panel</p>
          </div>

          <div className="space-y-3.5 flex-1 py-2">
            <button className="flex w-full items-center justify-between rounded-2xl bg-teal-50/40 border border-teal-100/50 p-4 text-left transition hover:-translate-x-1.5 hover:bg-teal-50 group">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-clinic-mint text-teal-900 rounded-xl group-hover:scale-105 transition-transform">
                  <User size={18} />
                </div>
                <div>
                  <p className="font-extrabold text-sm text-clinic-ink">Onboard Doctor</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Register new medical specialist</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button className="flex w-full items-center justify-between rounded-2xl bg-emerald-50/30 border border-emerald-100/30 p-4 text-left transition hover:-translate-x-1.5 hover:bg-emerald-50/60 group">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl group-hover:scale-105 transition-transform">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="font-extrabold text-sm text-clinic-ink">Add Location Branch</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Set up a new hospital branch</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>

            <button className="flex w-full items-center justify-between rounded-2xl bg-blue-50/30 border border-blue-100/30 p-4 text-left transition hover:-translate-x-1.5 hover:bg-blue-50/60 group">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-100 text-blue-800 rounded-xl group-hover:scale-105 transition-transform">
                  <Layers size={18} />
                </div>
                <div>
                  <p className="font-extrabold text-sm text-clinic-ink">Manage Categories</p>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Modify clinic service options</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-400 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 p-4 text-white text-center space-y-2 relative overflow-hidden shadow-md">
            <div className="absolute -right-6 -bottom-6 h-20 w-20 rounded-full bg-white/10"></div>
            <p className="text-xs font-bold uppercase tracking-wider">Need Technical Assistance?</p>
            <p className="text-[10px] text-teal-50 font-semibold leading-relaxed">
              Contact our clinic developer desk or read instructions guide.
            </p>
            <button className="w-full rounded-lg bg-white py-2 text-xs font-black text-teal-800 hover:bg-teal-50 transition shadow mt-1">
              Developer Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
