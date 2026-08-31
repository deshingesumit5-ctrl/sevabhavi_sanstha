import { getAdminHeaders, getApiBaseUrl } from "./api";

const getGalleryApiBase = () => `${getApiBaseUrl()}/gallery`;

export interface GalleryImage {
  id: number;
  title?: string;
  description?: string;
  imageUrl: string;
  category: string;
  sectionKey?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
}

export async function fetchAllImages(): Promise<GalleryImage[]> {
  try {
    const res = await fetch(getGalleryApiBase());
    if (!res.ok) throw new Error("गॅलरी लोड करता आली नाही");
    return await res.json();
  } catch (err) {
    console.warn("Gallery API offline:", err);
    return [];
  }
}

export async function fetchByCategory(category: string): Promise<GalleryImage[]> {
  try {
    const res = await fetch(`${getGalleryApiBase()}/category/${category}`);
    if (!res.ok) throw new Error("फोटो लोड करता आले नाहीत");
    return await res.json();
  } catch (err) {
    console.warn(`Gallery API offline for category ${category}:`, err);
    return [];
  }
}

export async function uploadImage(params: {
  file: File;
  title?: string;
  description?: string;
  category: string;
  sectionKey?: string;
  uploadedBy?: string;
}): Promise<GalleryImage> {
  const formData = new FormData();
  formData.append("file", params.file);
  if (params.title) formData.append("title", params.title);
  if (params.description) formData.append("description", params.description);
  formData.append("category", params.category);
  if (params.sectionKey) formData.append("sectionKey", params.sectionKey);
  if (params.uploadedBy) formData.append("uploadedBy", params.uploadedBy);

  const res = await fetch(`${getGalleryApiBase()}/upload`, {
    method: "POST",
    headers: {
      ...getAdminHeaders(),
    },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "अपलोड अयशस्वी");
  }
  return res.json();
}

export async function updateImage(
  id: number,
  params: { title?: string; description?: string; date?: string }
): Promise<GalleryImage> {
  const formData = new FormData();
  if (params.title !== undefined) formData.append("title", params.title);
  if (params.description !== undefined) formData.append("description", params.description);
  if (params.date !== undefined) formData.append("sectionKey", params.date); // store date in sectionKey for updates

  const res = await fetch(`${getGalleryApiBase()}/${id}`, {
    method: "PUT",
    headers: {
      ...getAdminHeaders(),
    },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "अपडेट अयशस्वी");
  }
  return res.json();
}

export async function updateImageWithFile(
  id: number,
  params: { file: File; title?: string; description?: string; category: string; sectionKey?: string }
): Promise<GalleryImage> {
  try {
    const formData = new FormData();
    formData.append("file", params.file);
    if (params.title !== undefined) formData.append("title", params.title);
    if (params.description !== undefined) formData.append("description", params.description);
    if (params.sectionKey !== undefined) formData.append("sectionKey", params.sectionKey);

    const res = await fetch(`${getGalleryApiBase()}/${id}`, {
      method: "PUT",
      headers: {
        ...getAdminHeaders(),
      },
      body: formData,
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.warn("Direct update failed, using fallback:", e);
  }
  // Fallback: Delete old, upload new
  await deleteImage(id);
  return uploadImage(params);
}

export async function deleteImage(id: number): Promise<void> {
  const res = await fetch(`${getGalleryApiBase()}/${id}`, {
    method: "DELETE",
    headers: {
      ...getAdminHeaders(),
    },
  });
  if (!res.ok) throw new Error("फोटो हटवता आला नाही");
}

// backend serves files at /uploads/... — this builds the full URL for <img src>
export function imageUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  const host = typeof window !== 'undefined' && window.location?.hostname ? window.location.hostname : 'localhost';
  if (host === 'localhost' || host === '127.0.0.1') {
    const envServer = (import.meta as any).env?.VITE_SERVER_URL;
    const serverBase = envServer || 'http://localhost:8080';
    return `${serverBase}${path.startsWith('/') ? '' : '/'}${path}`;
  }
  return path.startsWith('/') ? path : `/${path}`;
}