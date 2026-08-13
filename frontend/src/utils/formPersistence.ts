const STORAGE_KEY = "member_reg_draft";
const DRAFT_EXPIRY_HOURS = 168; // 7 days matching the backend

export function saveDraft<T>(state: T): void {
  try {
    const payload = { ...state, savedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.error("Failed to save form draft to localStorage:", err);
  }
}

export function loadDraft<T>(): T | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && parsed.savedAt) {
      const ageHours = (Date.now() - parsed.savedAt) / (1000 * 60 * 60);
      if (ageHours > DRAFT_EXPIRY_HOURS) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }
    }
    return parsed as T;
  } catch (err) {
    console.error("Failed to load form draft from localStorage:", err);
    return null;
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.error("Failed to clear form draft from localStorage:", err);
  }
}

