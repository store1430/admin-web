import React, { useState, useMemo } from "react";
import { Copy, ExternalLink, Edit, Trash2, X, Plus, MapPin, UploadCloud, Globe } from "lucide-react";
import { Branch, createBranch, updateBranch, deleteBranch } from "../../lib/api";

interface BranchesPageProps {
  branches: Branch[];
  onBranchesUpdated: (updatedBranches: Branch[]) => void;
  getBranchDashboardUrl: (id: string) => string;
  copyBranchDashboardUrl: (id: string) => void;
}

// Comprehensive State & City Database of India
const STATE_CITY_DB: Record<string, string[]> = {
  "Andhra Pradesh": [
    "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", 
    "Tirupati", "Rajahmundry", "Kakinada", "Kadapa", "Anantapur", 
    "Eluru", "Vizianagaram", "Ongole", "Chittoor", "Machilipatnam"
  ],
  "Arunachal Pradesh": ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro"],
  "Assam": ["Guwahati", "Dibrugarh", "Silchar", "Jorhat", "Nagaon", "Tinsukia", "Tezpur", "Bongaigaon"],
  "Bihar": [
    "Patna", "Gaya", "Bhagalpur", "Muzaffarpur", "Purnia", "Darbhanga", 
    "Arrah", "Bihar Sharif", "Sasaram", "Munger", "Begusarai", "Katihar"
  ],
  "Chhattisgarh": ["Raipur", "Bhilai", "Bilaspur", "Korba", "Rajnandgaon", "Jagdalpur", "Ambikapur"],
  "Delhi": ["New Delhi", "Delhi Cantt", "Dwarka", "Rohini", "South Delhi", "North Delhi", "East Delhi", "West Delhi"],
  "Goa": ["Panaji", "Margao", "Vasco da Gama", "Mapusa", "Ponda"],
  "Gujarat": [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", 
    "Junagadh", "Gandhinagar", "Anand", "Nadiad", "Morbi", "Mehsana", "Bharuch"
  ],
  "Haryana": [
    "Faridabad", "Gurugram", "Panipat", "Ambala", "Yamunanagar", "Rohtak", 
    "Hisar", "Karnal", "Sonipat", "Panchkula", "Sirsa", "Bahadurgarh"
  ],
  "Himachal Pradesh": ["Shimla", "Dharamshala", "Solan", "Mandi", "Bilaspur", "Una", "Hamirpur"],
  "Jammu & Kashmir": ["Srinagar", "Jammu", "Anantnag", "Baramulla", "Kathua", "Sopore", "Udhampur"],
  "Jharkhand": ["Jamshedpur", "Dhanbad", "Ranchi", "Bokaro Steel City", "Deoghar", "Hazaribagh", "Giridih", "Phusro"],
  "Karnataka": [
    "Bangalore", "Hubli-Dharwad", "Mysore", "Gulbarga", "Belgaum", "Mangalore", 
    "Davanagere", "Bellary", "Shimoga", "Tumkur", "Bijapur", "Udupi", "Bidar", "Hospet"
  ],
  "Kerala": [
    "Kochi", "Thiruvananthapuram", "Kozhikode", "Kollam", "Thrissur", "Alappuzha", 
    "Palakkad", "Kannur", "Kottayam", "Kattappana", "Idukki", "Kasaragod", "Malappuram", "Thalassery"
  ],
  "Madhya Pradesh": [
    "Indore", "Bhopal", "Jabalpur", "Gwalior", "Ujjain", "Sagar", "Dewas", 
    "Satna", "Ratlam", "Rewa", "Katni", "Singrauli", "Burhanpur", "Khandwa"
  ],
  "Maharashtra": [
    "Mumbai", "Pune", "Nagpur", "Thane", "Pimpri-Chinchwad", "Nashik", 
    "Kalyan-Dombivli", "Vasai-Virar", "Aurangabad", "Navi Mumbai", "Solapur", 
    "Mira-Bhayandar", "Kolhapur", "Amravati", "Nanded", "Sangli", "Jalgaon", "Akola"
  ],
  "Manipur": ["Imphal", "Thoubal", "Kakching"],
  "Meghalaya": ["Shillong", "Tura", "Jowai"],
  "Mizoram": ["Aizawl", "Lunglei", "Champhai"],
  "Nagaland": ["Dimapur", "Kohima", "Mokokchung"],
  "Odisha": ["Bhubaneswar", "Cuttack", "Rourkela", "Brahmapur", "Sambalpur", "Puri", "Balasore", "Bhadrak", "Baripada"],
  "Puducherry": ["Puducherry", "Karaikal", "Ozhukarai"],
  "Punjab": [
    "Ludhiana", "Amritsar", "Jalandhar", "Patiala", "Bathinda", "Mohali", 
    "Hoshiarpur", "Pathankot", "Moga", "Abohar", "Phagwara"
  ],
  "Rajasthan": [
    "Jaipur", "Jodhpur", "Kota", "Bikaner", "Ajmer", "Udaipur", "Bhilwara", 
    "Alwar", "Sikar", "Sri Ganganagar", "Bharatpur", "Pali", "Barmer", "Sujangarh"
  ],
  "Sikkim": ["Gangtok", "Namchi", "Gyalshing"],
  "Tamil Nadu": [
    "Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem", "Tiruppur", 
    "Erode", "Vellore", "Thoothukudi", "Tirunelveli", "Theni", "Cumbum", "Bodi", 
    "Uthamapalayam", "Nagercoil", "Thanjavur", "Dindigul", "Kanchipuram", "Karur", "Hosur", "Ambur"
  ],
  "Telangana": [
    "Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar", "Ramagundam", 
    "Mahbubnagar", "Nalgonda", "Adilabad", "Suryapet", "Miryalaguda"
  ],
  "Tripura": ["Agartala", "Dharmanagar", "Udaipur", "Kailasahar"],
  "Uttar Pradesh": [
    "Lucknow", "Kanpur", "Ghaziabad", "Agra", "Meerut", "Varanasi", "Prayagraj", 
    "Bareilly", "Aligarh", "Moradabad", "Saharanpur", "Gorakhpur", "Noida", 
    "Greater Noida", "Jhansi", "Firozabad", "Muzaffarnagar", "Mathura", "Lalitpur"
  ],
  "Uttarakhand": ["Dehradun", "Haridwar", "Haldwani", "Roorkee", "Rudrapur", "Kashipur", "Rishikesh"],
  "West Bengal": [
    "Kolkata", "Howrah", "Siliguri", "Asansol", "Durgapur", "Bardhaman", 
    "Malda", "Baharampur", "Kharagpur", "Jalpaiguri", "Kharagpur", "Darjeeling"
  ]
};

const STATES = Object.keys(STATE_CITY_DB).sort();

export function BranchesPage({
  branches,
  onBranchesUpdated,
  getBranchDashboardUrl,
  copyBranchDashboardUrl
}: BranchesPageProps) {
  const [showBranchModal, setShowBranchModal] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<string | null>(null);
  
  // Default values
  const [branchForm, setBranchForm] = useState<{
    name: string;
    city: string;
    address: string;
    phone: string;
    image: File | null;
    state: string;
  }>({
    name: "",
    state: "Telangana",
    city: STATE_CITY_DB["Telangana"][0],
    address: "",
    phone: "",
    image: null
  });

  const [customCity, setCustomCity] = useState("");
  const [branchSubmitting, setBranchSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Get active cities list based on chosen state
  const activeCities = useMemo(() => {
    return STATE_CITY_DB[branchForm.state] || [];
  }, [branchForm.state]);

  const branchPreviewUrl = useMemo(() => {
    if (branchForm.image) return URL.createObjectURL(branchForm.image);
    if (editingBranchId) {
      const active = branches.find((b) => b._id === editingBranchId);
      return active?.imageUrl || "";
    }
    return "";
  }, [branchForm.image, editingBranchId, branches]);

  function startEditBranch(branch: Branch) {
    setEditingBranchId(branch._id);
    const branchState = branch.state || "Telangana";
    const stateCities = STATE_CITY_DB[branchState] || [];
    const isPredefined = stateCities.includes(branch.city);
    
    setBranchForm({
      name: branch.name,
      state: branchState,
      city: isPredefined ? branch.city : "Other",
      address: branch.address || "",
      phone: branch.phone || "",
      image: null
    });
    setCustomCity(isPredefined ? "" : branch.city);
    setShowBranchModal(true);
  }

  function cancelEditBranch() {
    setEditingBranchId(null);
    setBranchForm({
      name: "",
      state: "Telangana",
      city: STATE_CITY_DB["Telangana"][0],
      address: "",
      phone: "",
      image: null
    });
    setCustomCity("");
    setShowBranchModal(false);
  }

  async function handleBranchSubmit(e: React.FormEvent) {
    e.preventDefault();
    const finalCity = branchForm.city === "Other" ? customCity.trim() : branchForm.city;
    if (!branchForm.name || !finalCity) {
      setError("Please enter branch name and city.");
      return;
    }
    setError("");
    setBranchSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", branchForm.name);
      formData.append("city", finalCity);
      formData.append("address", branchForm.address);
      formData.append("phone", branchForm.phone);
      formData.append("state", branchForm.state);
      if (branchForm.image) {
        formData.append("image", branchForm.image);
      }

      if (editingBranchId) {
        const saved = await updateBranch(editingBranchId, formData);
        const updated = branches.map((b) => (b._id === editingBranchId ? saved : b));
        onBranchesUpdated(updated);
        setNotice("Branch updated successfully!");
        cancelEditBranch();
      } else {
        const saved = await createBranch(formData);
        const updated = [...branches, saved];
        onBranchesUpdated(updated);
        setNotice("Branch registered successfully!");
        cancelEditBranch();
      }
    } catch (err: any) {
      setError(err.message || "Failed to save branch");
    } finally {
      setBranchSubmitting(false);
    }
  }

  async function handleBranchDelete(id: string, name: string) {
    if (!window.confirm(`Are you sure you want to delete ${name}? Any doctors/appointments linked to it will need to be re-assigned.`)) return;
    setError("");
    try {
      await deleteBranch(id);
      const updated = branches.filter((b) => b._id !== id);
      onBranchesUpdated(updated);
      setNotice("Branch deleted successfully!");
    } catch (err: any) {
      setError(err.message || "Failed to delete branch");
    }
  }

  const handleStateChange = (selectedState: string) => {
    const defaultCity = STATE_CITY_DB[selectedState]?.[0] || "";
    setBranchForm((prev) => ({
      ...prev,
      state: selectedState,
      city: defaultCity
    }));
    setCustomCity("");
  };

  return (
    <div className="w-full space-y-6">
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

      {/* Branch Form Modal Overlay */}
      {showBranchModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-teal-100 bg-white p-6 shadow-2xl animate-scaleUp">
            {/* Close Button */}
            <button
              type="button"
              onClick={cancelEditBranch}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-600 transition p-1 rounded-full hover:bg-slate-50"
            >
              <X size={20} />
            </button>

            <form onSubmit={handleBranchSubmit} className="space-y-6">
              <h3 className="text-xl font-extrabold text-clinic-ink flex items-center gap-2 border-b border-slate-100 pb-3">
                <MapPin className="text-clinic-teal" size={22} />
                {editingBranchId ? "Edit Branch Location" : "Register New Branch"}
              </h3>

              {/* Image Upload Input */}
              <div className="flex items-center gap-5 bg-teal-50/40 border border-teal-100/60 p-4 rounded-2xl">
                <label className="relative cursor-pointer shrink-0">
                  {branchPreviewUrl ? (
                    <img src={branchPreviewUrl} alt="Branch preview" className="h-20 w-32 rounded-xl object-cover border-2 border-clinic-teal shadow-md" />
                  ) : (
                    <div className="grid place-items-center h-20 w-32 rounded-xl bg-teal-50 border-2 border-dashed border-teal-200 text-teal-600">
                      <UploadCloud size={20} />
                      <span className="text-[10px] font-bold mt-1">Branch Photo</span>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setBranchForm({ ...branchForm, image: e.target.files?.[0] || null })}
                  />
                </label>
                <div>
                  <p className="font-bold text-sm text-clinic-ink">Clinic Location Photo</p>
                  <p className="text-xs text-slate-400">Upload a nice photo of this branch. This will appear to users in the app.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-600">Branch Name *</span>
                  <input
                    required
                    value={branchForm.name}
                    onChange={(e) => setBranchForm({ ...branchForm, name: e.target.value })}
                    placeholder="Theni Maruthi Pet Clinic"
                    className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-600">State *</span>
                  <select
                    required
                    value={branchForm.state}
                    onChange={(e) => handleStateChange(e.target.value)}
                    className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm bg-white"
                  >
                    {STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-600">City / Town *</span>
                  <select
                    required
                    value={branchForm.city}
                    onChange={(e) => setBranchForm({ ...branchForm, city: e.target.value })}
                    className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm bg-white"
                  >
                    {activeCities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                    <option value="Other">Other (Type custom city/town)</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-600">Phone Number</span>
                  <input
                    value={branchForm.phone}
                    onChange={(e) => setBranchForm({ ...branchForm, phone: e.target.value })}
                    placeholder="+91 40 12345678"
                    className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm"
                  />
                </label>
              </div>

              {/* Show text input only if 'Other' is selected */}
              {branchForm.city === "Other" && (
                <label className="block animate-scaleUp">
                  <span className="mb-2 block text-sm font-semibold text-slate-600">Custom City/Town Name *</span>
                  <input
                    required
                    value={customCity}
                    onChange={(e) => setCustomCity(e.target.value)}
                    placeholder="Enter city or town (e.g. Kattappana)"
                    className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm"
                  />
                </label>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-600">Address</span>
                <input
                  value={branchForm.address}
                  onChange={(e) => setBranchForm({ ...branchForm, address: e.target.value })}
                  placeholder="Banjara Hills, Road No. 12"
                  className="w-full rounded border border-slate-200 px-4 py-3 outline-none transition focus:border-clinic-teal focus:ring-4 focus:ring-teal-100 text-sm"
                />
              </label>

              <div className="flex gap-3 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={cancelEditBranch}
                  className="flex-1 rounded border border-slate-200 bg-white px-4 py-3 font-bold text-slate-500 transition hover:bg-slate-50 text-sm"
                >
                  Cancel
                </button>
                <button
                  disabled={branchSubmitting}
                  className="flex-1 rounded bg-clinic-teal px-4 py-3 font-bold text-white shadow-lg shadow-teal-200 transition hover:bg-teal-800 disabled:opacity-60 text-sm"
                >
                  {branchSubmitting ? "Saving..." : editingBranchId ? "Update Branch" : "Create Branch"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Branch List */}
      <div className="rounded-2xl border border-teal-100 bg-white shadow-soft overflow-hidden w-full">
        <div className="border-b border-teal-100 px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-clinic-ink">Active Clinic Locations</h3>
            <p className="text-xs text-slate-400 font-medium mt-0.5">Manage and configure clinic locations</p>
          </div>
          <button
            onClick={() => {
              cancelEditBranch();
              setShowBranchModal(true);
            }}
            className="flex items-center gap-2 rounded-lg bg-clinic-teal px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-100 transition hover:bg-teal-800"
          >
            <Plus size={16} />
            Add New Branch
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-teal-50 text-xs uppercase tracking-[0.14em] text-teal-700">
              <tr>
                <th className="px-5 py-4">Branch</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Address</th>
                <th className="px-5 py-4">Phone</th>
                <th className="px-5 py-4">Dashboard URL</th>
                <th className="px-5 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {branches.map((b) => (
                <tr key={b._id} className="transition hover:bg-slate-50 text-sm">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {b.imageUrl ? (
                        <img src={b.imageUrl} alt={b.name} className="h-10 w-16 rounded object-cover border border-slate-100" />
                      ) : (
                        <div className="grid h-10 w-16 place-items-center rounded bg-slate-100 text-slate-400 font-bold text-[10px]">
                          No image
                        </div>
                      )}
                      <span className="font-bold text-clinic-ink">{b.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-600 font-semibold">
                    <div className="flex items-center gap-1.5">
                      <Globe size={13} className="text-slate-400" />
                      <span>{b.city}, {b.state || "Telangana"}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-slate-500">{b.address || "—"}</td>
                  <td className="px-5 py-4 text-slate-500">{b.phone || "—"}</td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <code className="max-w-[180px] truncate rounded bg-slate-50 px-2 py-1 text-xs font-semibold text-slate-500">
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
                      onClick={() => handleBranchDelete(b._id, b.name)}
                      className="rounded bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white p-2 text-xs font-bold transition"
                      title="Delete Branch"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
              {branches.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400 font-semibold">
                    No active clinic locations setup yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
