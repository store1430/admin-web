/// <reference types="vite/client" />
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export type CategoryStatus = "Active" | "Inactive";

export interface SubCategory {
  _id: string;
  name: string;
  price: number;
  status: CategoryStatus;
  imageUrl: string;
  imageFileId: string;
}

export interface ServiceCategory {
  _id: string;
  name: string;
  basePrice?: number;
  status: CategoryStatus;
  imageUrl: string;
  subCategories: SubCategory[];
  createdAt: string;
}

export interface CreateCategoryPayload {
  name: string;
  status: CategoryStatus;
  image: File;
}

export interface Appointment {
  _id: string;
  petName: string;
  serviceType: string;
  appointmentDate: string;
  timeSlot: string;
  appointmentType: "Clinic" | "Video";
  status: "Booked" | "Completed" | "Cancelled";
  roomId?: string;
  branchId?: string;
  createdAt: string;
}

export interface Review {
  _id?: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date?: string;
}

export interface Doctor {
  _id: string;
  name: string;
  specialty: string;
  experience: number;
  status: "Active" | "Inactive";
  imageUrl?: string;
  imageFileId?: string;
  education?: string;
  bio?: string;
  languages?: string[];
  expertise?: string[];
  jobsCompleted?: number;
  rating?: number;
  reviews?: Review[];
  username?: string;
  password?: string;
  branchId?: string;
  createdAt?: string;
}

export async function fetchCategories(): Promise<ServiceCategory[]> {
  const response = await fetch(`${API_URL}/service-categories`);
  if (!response.ok) throw new Error("Unable to load categories");
  return response.json();
}

export async function createCategory(payload: CreateCategoryPayload): Promise<ServiceCategory> {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("status", payload.status);
  formData.append("image", payload.image);

  const response = await fetch(`${API_URL}/service-categories`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Unable to create category");
  }

  return response.json();
}

export async function fetchAppointments(): Promise<Appointment[]> {
  const response = await fetch(`${API_URL}/appointments`);
  if (!response.ok) throw new Error("Unable to load appointments");
  return response.json();
}

export async function addSubCategory(
  categoryId: string,
  formData: FormData
): Promise<ServiceCategory> {
  const response = await fetch(`${API_URL}/service-categories/${categoryId}/subcategories`, {
    method: "POST",
    body: formData
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Unable to add subcategory");
  }
  return response.json();
}

export async function deleteSubCategory(categoryId: string, subId: string): Promise<ServiceCategory> {
  const response = await fetch(`${API_URL}/service-categories/${categoryId}/subcategories/${subId}`, {
    method: "DELETE"
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Unable to delete subcategory");
  }
  return response.json();
}

export async function deleteCategory(categoryId: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_URL}/service-categories/${categoryId}`, {
    method: "DELETE"
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Unable to delete category");
  }
  return response.json();
}

export async function updateCategory(
  categoryId: string,
  payload: { name?: string; status?: string; image?: File | null }
): Promise<ServiceCategory> {
  const formData = new FormData();
  if (payload.name) formData.append("name", payload.name);
  if (payload.status) formData.append("status", payload.status);
  if (payload.image) formData.append("image", payload.image);

  const response = await fetch(`${API_URL}/service-categories/${categoryId}`, {
    method: "PUT",
    body: formData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Unable to update category");
  }

  return response.json();
}

export async function fetchDoctors(): Promise<Doctor[]> {
  const response = await fetch(`${API_URL}/doctors`);
  if (!response.ok) throw new Error("Unable to load doctors");
  return response.json();
}

export async function createDoctor(formData: FormData): Promise<Doctor> {
  const response = await fetch(`${API_URL}/doctors`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Unable to create doctor");
  }

  return response.json();
}

export async function updateDoctor(id: string, formData: FormData): Promise<Doctor> {
  const response = await fetch(`${API_URL}/doctors/${id}`, {
    method: "PUT",
    body: formData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Unable to update doctor");
  }

  return response.json();
}

export async function deleteDoctor(id: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_URL}/doctors/${id}`, {
    method: "DELETE"
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Unable to delete doctor");
  }
  return response.json();
}

// ─── Banners ────────────────────────────────────────────────────────────────

export interface Banner {
  _id: string;
  title?: string;
  imageUrl: string;
  order: number;
  status: "Active" | "Inactive";
  createdAt?: string;
}

export async function fetchBanners(): Promise<Banner[]> {
  const response = await fetch(`${API_URL}/banners/all`);
  if (!response.ok) throw new Error("Unable to load banners");
  return response.json();
}

export async function createBanner(payload: {
  title?: string;
  image: File;
  status?: string;
}): Promise<Banner> {
  const formData = new FormData();
  if (payload.title) formData.append("title", payload.title);
  formData.append("image", payload.image);
  formData.append("status", payload.status || "Active");

  const response = await fetch(`${API_URL}/banners`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Unable to create banner");
  }
  return response.json();
}

export async function deleteBanner(id: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_URL}/banners/${id}`, {
    method: "DELETE"
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Unable to delete banner");
  }
  return response.json();
}

// ─── Branches ───────────────────────────────────────────────────────────────

export interface Branch {
  _id: string;
  name: string;
  city: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  createdAt?: string;
}

export async function fetchBranches(): Promise<Branch[]> {
  const response = await fetch(`${API_URL}/branches`);
  if (!response.ok) throw new Error("Unable to load branches");
  return response.json();
}

export async function createBranch(payload: {
  name: string;
  city: string;
  address?: string;
  phone?: string;
}): Promise<Branch> {
  const response = await fetch(`${API_URL}/branches`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Unable to create branch");
  }
  return response.json();
}

export async function updateBranch(
  id: string,
  payload: Partial<Omit<Branch, "_id">>
): Promise<Branch> {
  const response = await fetch(`${API_URL}/branches/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Unable to update branch");
  }
  return response.json();
}

export async function deleteBranch(id: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_URL}/branches/${id}`, {
    method: "DELETE"
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Unable to delete branch");
  }
  return response.json();
}

// ─── Staff ─────────────────────────────────────────────────────────────────────

export interface StaffMember {
  _id: string;
  name: string;
  phone?: string;
  about?: string;
  experience: number;
  status: "Active" | "Inactive";
  imageUrl?: string;
  imageFileId?: string;
  branchId?: string;
  createdAt?: string;
}

export async function fetchStaff(): Promise<StaffMember[]> {
  const response = await fetch(`${API_URL}/staff`);
  if (!response.ok) throw new Error("Unable to load staff");
  return response.json();
}

export async function createStaff(payload: {
  name: string;
  phone?: string;
  about?: string;
  experience: number;
  status?: string;
  branchId?: string;
  image?: File | null;
}): Promise<StaffMember> {
  const formData = new FormData();
  formData.append("name", payload.name);
  if (payload.phone) formData.append("phone", payload.phone);
  if (payload.about) formData.append("about", payload.about);
  formData.append("experience", String(payload.experience));
  formData.append("status", payload.status || "Active");
  if (payload.branchId) formData.append("branchId", payload.branchId);
  if (payload.image) formData.append("image", payload.image);

  const response = await fetch(`${API_URL}/staff`, {
    method: "POST",
    body: formData
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Unable to create staff member");
  }
  return response.json();
}

export async function updateStaff(
  id: string,
  payload: {
    name?: string;
    phone?: string;
    about?: string;
    experience?: number;
    status?: string;
    branchId?: string;
    image?: File | null;
  }
): Promise<StaffMember> {
  const formData = new FormData();
  if (payload.name) formData.append("name", payload.name);
  if (payload.phone !== undefined) formData.append("phone", payload.phone);
  if (payload.about !== undefined) formData.append("about", payload.about);
  if (payload.experience !== undefined) formData.append("experience", String(payload.experience));
  if (payload.status) formData.append("status", payload.status);
  if (payload.branchId !== undefined) formData.append("branchId", payload.branchId);
  if (payload.image) formData.append("image", payload.image);

  const response = await fetch(`${API_URL}/staff/${id}`, {
    method: "PUT",
    body: formData
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Unable to update staff member");
  }
  return response.json();
}

export async function deleteStaff(id: string): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${API_URL}/staff/${id}`, {
    method: "DELETE"
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || "Unable to delete staff member");
  }
  return response.json();
}
