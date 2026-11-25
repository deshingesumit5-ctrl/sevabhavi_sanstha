const DEFAULT_STORAGE_KEY = "member_reg_draft";
const DRAFT_EXPIRY_HOURS = 168; // 7 days matching the backend

export function saveDraft<T>(state: T, key: string = DEFAULT_STORAGE_KEY): void {
  try {
    const payload = { ...state, savedAt: Date.now() };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch (err) {
    console.error(`Failed to save form draft (${key}) to localStorage:`, err);
  }
}

export function loadDraft<T>(key: string = DEFAULT_STORAGE_KEY): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.savedAt) {
      const ageHours = (Date.now() - parsed.savedAt) / (1000 * 60 * 60);
      if (ageHours > DRAFT_EXPIRY_HOURS) {
        localStorage.removeItem(key);
        return null;
      }
    }
    return parsed as T;
  } catch (err) {
    console.error(`Failed to load form draft (${key}) from localStorage:`, err);
    return null;
  }
}

export function clearDraft(key: string = DEFAULT_STORAGE_KEY): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error(`Failed to clear form draft (${key}) from localStorage:`, err);
  }
}

export function dataUrlToFile(dataUrl: string, baseName: string = "screenshot"): File | null {
  try {
    if (!dataUrl || !dataUrl.startsWith("data:")) return null;
    const [header, base64] = dataUrl.split(",");
    if (!base64) return null;
    const mimeMatch = header.match(/data:([^;]+);/);
    const mime = mimeMatch ? mimeMatch[1] : "image/jpeg";
    const ext = mime.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new File([bytes], `${baseName}.${ext}`, { type: mime });
  } catch (err) {
    console.error("Failed to convert data URL to File:", err);
    return null;
  }
}

