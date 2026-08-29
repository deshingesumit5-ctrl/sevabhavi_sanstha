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

