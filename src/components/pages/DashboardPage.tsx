import React, { useEffect, useState, useMemo } from "react";
import { Calendar, CheckCircle, IndianRupee, Layers } from "lucide-react";
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
    const totalRevenue = filteredAppointments.reduce((sum) => sum + 1200, 0); // Mock average price Rs. 1200
    
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
      <div className="flex items-center justify-center py-24 text-teal-700">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-clinic-teal mr-3"></div>
        <span className="font-bold">Loading dashboard metrics...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm text-rose-700 font-semibold">
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
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
    </div>
  );
}
