import { getAdminHeaders } from "./api";

const API_BASE = `http://192.168.1.7:8080/api/categories`;

export interface Category {
  id: number;
  categoryKey: string;
  title: string;
  description?: string;
  imageUrl?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export async function fetchCategories(): Promise<Category[]> {
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error("श्रेण्या लोड करता आल्या नाहीत");
  return res.json();
}

export async function createCategory(params: {
  file: File;
  title: string;
  description?: string;
  categoryKey?: string;
}): Promise<Category> {
  const formData = new FormData();
  formData.append("file", params.file);
  formData.append("title", params.title);
  if (params.description) formData.append("description", params.description);
  if (params.categoryKey) formData.append("categoryKey", params.categoryKey);

  const res = await fetch(API_BASE, {
    method: "POST",
    headers: {
      ...getAdminHeaders(),
    },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "श्रेणी जतन करणे अयशस्वी");
  }
  return res.json();
}

export async function updateCategory(
  id: number,
  params: { file?: File | null; title: string; description?: string }
): Promise<Category> {
  const formData = new FormData();
  if (params.file) formData.append("file", params.file);
  formData.append("title", params.title);
  if (params.description !== undefined) formData.append("description", params.description);

  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: {
      ...getAdminHeaders(),
    },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "श्रेणी अपडेट अयशस्वी");
  }
  return res.json();
}

export async function deleteCategory(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "DELETE",
    headers: {
      ...getAdminHeaders(),
    },
  });
  if (!res.ok) throw new Error("श्रेणी हटवता आली नाही");
}
