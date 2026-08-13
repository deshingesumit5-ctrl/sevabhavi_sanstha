const API_BASE = `http://${window.location.hostname}:8080/api/gallery`;

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
  const res = await fetch(API_BASE);
  if (!res.ok) throw new Error("गॅलरी लोड करता आली नाही");
  return res.json();
}

export async function fetchByCategory(category: string): Promise<GalleryImage[]> {
  const res = await fetch(`${API_BASE}/category/${category}`);
  if (!res.ok) throw new Error("फोटो लोड करता आले नाहीत");
  return res.json();
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

  const res = await fetch(`${API_BASE}/upload`, {
    method: "POST",
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

  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
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

    const res = await fetch(`${API_BASE}/${id}`, {
      method: "PUT",
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
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("फोटो हटवता आला नाही");
}

// backend serves files at /uploads/... — this builds the full URL for <img src>
export function imageUrl(path: string): string {
  return path.startsWith("http") ? path : `http://${window.location.hostname}:8080${path}`;
}