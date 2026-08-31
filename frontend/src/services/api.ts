const getHost = (): string => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    return window.location.hostname;
  }
  return 'localhost';
};

export const getApiBaseUrl = (): string => {
  const envUrl = (import.meta as any).env?.VITE_API_URL;
  if (envUrl) return envUrl;
  const host = getHost();
  if (host === 'localhost' || host === '127.0.0.1') {
    return 'http://localhost:8080/api';
  }
  return '/api';
};

export const BASE_URL = getApiBaseUrl();

export const getAdminHeaders = (): Record<string, string> => {
  try {
    const stored = localStorage.getItem('sevabhavi_admin_session');
    if (stored) {
      const parsed = JSON.parse(stored);
      const headers: Record<string, string> = {};
      if (parsed.token) {
        headers['Authorization'] = `Bearer ${parsed.token}`;
      }
      return headers;
    }
  } catch { }
  return {};
};


export interface State {
  id: number;
  nameMr: string;
  nameEn: string;
}

export interface District {
  id: number;
  state?: State;
  nameMr: string;
  nameEn: string;
}

export interface Taluka {
  id: number;
  district?: District;
  nameMr: string;
  nameEn: string;
}

export interface City {
  id: number;
  district?: District;
  nameEn: string;
  nameMr: string;
}

export interface BloodGroup {
  id: number;
  code: string;
  labelMr: string;
}

export interface MaritalStatus {
  id: number;
  code: string;
  labelMr: string;
}

export interface Gender {
  id: number;
  code: string;
  labelMr: string;
}

export interface MemberRegistrationData {
  id: number;
  fullName: string;
  birthDate: string;
  gender: string;
  bloodGroup?: string;
  maritalStatus: string;
  mobile: string;
  email: string | null;
  occupation: string;
  education: string;
  idUploaded: boolean;
  currentAddress: string;
  permanentAddress: string;
  state: State;
  district: District;
  taluka: Taluka;
  pincode: string;
  memberType: string;
  idProofNumber: string | null;
  expectations: string | null;
  message: string | null;
  declaration: boolean;
  approvalStatus: string;
  createdAt: string;
}

export interface MarriageRegistrationData {
  id: number;
  profileType: string;
  fullName: string;
  birthDate: string;
  height: string;
  bloodGroup: string;
  maritalStatus: string;
  religion: string;
  caste: string;
  gotra: string | null;
  manglik: string;
  city: string;
  district: District;
  state: State;
  mobile: string;
  email: string | null;
  parentMobile: string;
  aboutSelf: string;
  expectations: string;
  educationLevel: string;
  degreeName: string;
  schoolCollege: string | null;
  passingYear: string;
  occupationType: string;
  designation: string | null;
  companyName: string | null;
  annualIncome: string;
  fatherName: string;
  fatherOccupation: string;
  motherName: string;
  brothers: number;
  sisters: number;
  familyBackground: string | null;
  mainPhotoUploaded: boolean;
  fullPhotoUploaded: boolean;
  declaration: boolean;
  approvalStatus: string;
  createdAt: string;
}

export interface DonationType {
  id: number;
  code: string;
  nameEn: string;
  nameMr: string;
  isActive?: boolean;
}

export interface DonationPurpose {
  id: number;
  code: string;
  nameEn: string;
  nameMr: string;
  descriptionMr?: string;
  isActive?: boolean;
}

export interface DonationRegistrationData {
  id: number;
  receiptNumber: string;
  fullName: string;
  mobile: string;
  email?: string;
  birthDate?: string;
  gender?: string;
  address: string;
  city: string;
  taluka?: Taluka;
  district?: District;
  state?: State;
  pincode?: string;
  donationType: DonationType;
  donationPurpose: DonationPurpose;
  inMemoryOfToggle?: boolean;
  inMemoryOfName?: string;
  isAnonymous?: boolean;
  message?: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentStatus: string;
  transactionId?: string;
  gatewayReference?: string;
  paymentDate?: string;
  draftStep?: number;
  approvalStatus?: string;
  createdAt?: string;
}


export interface ShibirMaster {
  id: number;
  shibirName: string;
  shibirDate?: string;
  shibirLocation?: string;
  isActive?: boolean;
}

export interface ShibirRegistrationData {
  id: number;
  shibirName: string;
  shibirDate?: string;
  shibirLocation?: string;
  fullName: string;
  fullAddress: string;
  state: State;
  district: District;
  taluka: Taluka;
  cityVillage: string;
  occupation?: string;
  education?: string;
  birthDate: string;
  age?: number;
  mobile: string;
  relativeMobile?: string;
  participatedEarlier?: boolean;
  previousEventName?: string;
  specialInfo?: string;
  passportPhotoUrl?: string;
  paymentMode?: string;
  amountPaid?: number;
  upiTxnId?: string;
  screenshotUrl?: string;
  paymentStatus?: string;
  approvalStatus: string;
  createdAt: string;
}

export interface Religion {
  religionId: number;
  religionName: string;
}

export interface Height {
  heightId: number;
  heightText: string;
}

export interface InquiryData {
  id: number;
  name: string;
  mobile: string;
  email: string | null;
  message: string;
  status: string;
  createdAt: string;
}

export interface NewsData {
  id: number;
  title: string;
  content: string;
  category: string;
  status: string;
  createdAt: string;
}

export interface MembershipPlan {
  id: number;
  planCode: string;
  planNameMr: string;
  amount: number;
  updatedBy: string | null;
  updatedAt: string | null;
}

export interface PaymentSettingResponse {
  upiId: string;
  payeeName: string | null;
  qrImageUrl: string | null;
  updatedBy: string | null;
  updatedAt: string | null;
}

export interface PaymentData {
  id: number;
  memberId?: number;
  registrationType?: string;
  registrationId?: number;
  memberName?: string;
  memberMobile?: string;
  amount: number;
  membershipType: string;
  paymentMode: string;
  upiTxnId: string;
  screenshotUrl: string;
  paymentDate: string;
  status: string;
  verifiedBy: string | null;
  verifiedAt: string | null;
  rejectionReason: string | null;
}


export interface DashboardStatsData {
  todayRegistrationsCount: number;
  memberTotalCount: number;
  memberAnnualCount: number;
  memberLifetimeCount: number;
  marriageTotalCount: number;
  galleryTotalCount: number;
  newsTotalCount: number;
}

export interface TodayRegistrationData {
  id: string;
  name: string;
  type: string;
  mobile: string;
  createdAt: string;
  status: string;
}
const SEED_NAMES = ['अमित देशपांडे', 'सुनील पाटील', 'प्रिया कदम'];

const getLocalInquiries = (): InquiryData[] => {
  try {
    const data = localStorage.getItem('sevabhavi_inquiries');
    if (!data) {
      return [];
    }
    const parsed: InquiryData[] = JSON.parse(data);
    const filtered = parsed.filter((item) => !SEED_NAMES.includes(item.name));
    if (filtered.length !== parsed.length) {
      saveLocalInquiries(filtered);
    }
    return filtered;
  } catch {
    return [];
  }
};

const saveLocalInquiries = (inquiries: InquiryData[]) => {
  try {
    localStorage.setItem('sevabhavi_inquiries', JSON.stringify(inquiries));
  } catch (err) {
    console.error('Error saving inquiries to localStorage:', err);
  }
};

// Cache Store & In-Flight Request Deduplication
const cacheStore = new Map<string, any>();
const inFlightRequests = new Map<string, Promise<any>>();

export const getCachedData = <T>(key: string): T | undefined => cacheStore.get(key);
export const setCachedData = <T>(key: string, data: T): void => { cacheStore.set(key, data); };
export const invalidateCache = (key?: string): void => {
  if (key) cacheStore.delete(key);
  else cacheStore.clear();
};

async function cachedFetch<T>(key: string, fetchFn: () => Promise<T>, forceRefresh = false): Promise<T> {
  if (!forceRefresh && cacheStore.has(key)) {
    // Return cached data immediately, revalidate silently in background
    fetchFn().then(fresh => cacheStore.set(key, fresh)).catch(() => {});
    return cacheStore.get(key) as T;
  }

  if (inFlightRequests.has(key) && !forceRefresh) {
    return inFlightRequests.get(key) as Promise<T>;
  }

  const promise = fetchFn()
    .then(data => {
      cacheStore.set(key, data);
      return data;
    })
    .finally(() => {
      inFlightRequests.delete(key);
    });

  inFlightRequests.set(key, promise);
  return promise;
}

export const api = {
  // Synchronous cache getters for instantaneous initial renders
  getCachedMarriages: (): MarriageRegistrationData[] | undefined => getCachedData<MarriageRegistrationData[]>('all_marriages'),
  getCachedMembers: (): MemberRegistrationData[] | undefined => getCachedData<MemberRegistrationData[]>('all_members'),
  getCachedShibirs: (): ShibirRegistrationData[] | undefined => getCachedData<ShibirRegistrationData[]>('all_shibirs'),
  getCachedInquiries: (): InquiryData[] | undefined => getCachedData<InquiryData[]>('all_inquiries'),
  getCachedPayments: (): PaymentData[] | undefined => getCachedData<PaymentData[]>('all_payments'),
  getCachedDashboardStats: (): DashboardStatsData | undefined => getCachedData<DashboardStatsData>('dashboard_stats'),

  // Admin Prefetch All Data in Parallel
  prefetchAllAdminData: async (): Promise<void> => {
    try {
      await Promise.allSettled([
        api.getAllMarriages(),
        api.getAllMembers(),
        api.getAllShibirs(),
        api.getAllInquiries(),
        api.getAllPayments(),
        api.getMaritalStatuses(),
        api.getBloodGroups(),
        api.getGenders(),
        api.getStates(),
        api.getDashboardStats(),
        api.getTodayRegistrations(),
      ]);
    } catch (e) {
      console.error('Prefetch error:', e);
    }
  },

  // Auth APIs
  login: async (email: string, password: string): Promise<any> => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'लॉगिन अयशस्वी झाले.');
    return data;
  },

  resetPassword: async (email: string, newPassword: string): Promise<any> => {
    const res = await fetch(`${BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'पासवर्ड बदल अयशस्वी.');
    return data;
  },

  // Lookups
  getStates: async (): Promise<State[]> => {
    return cachedFetch('states', async () => {
      const res = await fetch(`${BASE_URL}/lookups/states`);
      if (!res.ok) throw new Error('Failed to fetch states');
      return res.json();
    });
  },

  getDistricts: async (stateId: number): Promise<District[]> => {
    return cachedFetch(`districts_${stateId}`, async () => {
      const res = await fetch(`${BASE_URL}/lookups/districts?stateId=${stateId}`);
      if (!res.ok) throw new Error('Failed to fetch districts');
      return res.json();
    });
  },

  getTalukas: async (districtId: number): Promise<Taluka[]> => {
    return cachedFetch(`talukas_${districtId}`, async () => {
      const res = await fetch(`${BASE_URL}/lookups/talukas?districtId=${districtId}`);
      if (!res.ok) throw new Error('Failed to fetch talukas');
      return res.json();
    });
  },

  getCities: async (districtId?: number): Promise<City[]> => {
    const key = districtId ? `cities_${districtId}` : 'cities_all';
    return cachedFetch(key, async () => {
      const url = districtId ? `${BASE_URL}/lookups/cities?districtId=${districtId}` : `${BASE_URL}/lookups/cities`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch cities');
      return res.json();
    });
  },

  getBloodGroups: async (): Promise<BloodGroup[]> => {
    return cachedFetch('blood_groups', async () => {
      const res = await fetch(`${BASE_URL}/lookups/blood-groups`);
      if (!res.ok) throw new Error('Failed to fetch blood groups');
      return res.json();
    });
  },

  getMaritalStatuses: async (): Promise<MaritalStatus[]> => {
    return cachedFetch('marital_statuses', async () => {
      const res = await fetch(`${BASE_URL}/lookups/marital-statuses`);
      if (!res.ok) throw new Error('Failed to fetch marital statuses');
      return res.json();
    });
  },

  getGenders: async (): Promise<Gender[]> => {
    return cachedFetch('genders', async () => {
      const res = await fetch(`${BASE_URL}/lookups/genders`);
      if (!res.ok) throw new Error('Failed to fetch genders');
      return res.json();
    });
  },

  // Transactions
  registerMember: async (data: any): Promise<any> => {
    const res = await fetch(`${BASE_URL}/member-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('सदस्य नोंदणी अयशस्वी झाली.');
    invalidateCache('all_members');
    invalidateCache('dashboard_stats');
    return res.json();
  },

  registerMarriage: async (data: any): Promise<any> => {
    const res = await fetch(`${BASE_URL}/marriage-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('विवाह नोंदणी अयशस्वी झाली.');
    invalidateCache('all_marriages');
    invalidateCache('dashboard_stats');
    return res.json();
  },

  // Admin - Get all registrations
  getAllMembers: async (): Promise<MemberRegistrationData[]> => {
    return cachedFetch('all_members', async () => {
      const res = await fetch(`${BASE_URL}/member-registration`, {
        headers: { ...getAdminHeaders() },
      });
      if (!res.ok) throw new Error('Failed to fetch member registrations');
      return res.json();
    });
  },

  getAllMarriages: async (): Promise<MarriageRegistrationData[]> => {
    return cachedFetch('all_marriages', async () => {
      const res = await fetch(`${BASE_URL}/marriage-registration`, {
        headers: { ...getAdminHeaders() },
      });
      if (!res.ok) throw new Error('Failed to fetch marriage registrations');
      return res.json();
    });
  },

  // Admin - Update approval status
  updateMemberStatus: async (id: number, status: string, reason?: string): Promise<MemberRegistrationData> => {
    let url = `${BASE_URL}/member-registration/${id}/status?status=${status}`;
    if (reason) url += `&reason=${encodeURIComponent(reason)}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { ...getAdminHeaders() },
    });
    if (!res.ok) throw new Error('Failed to update member status');
    const updated = await res.json();
    
    // Mutate cache directly
    const cached = getCachedData<MemberRegistrationData[]>('all_members');
    if (cached) {
      setCachedData('all_members', cached.map(m => m.id === id ? { ...m, approvalStatus: status } : m));
    }
    return updated;
  },

  updateMarriageStatus: async (id: number, status: string, reason?: string): Promise<MarriageRegistrationData> => {
    let url = `${BASE_URL}/marriage-registration/${id}/status?status=${status}`;
    if (reason) url += `&reason=${encodeURIComponent(reason)}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: { ...getAdminHeaders() },
    });
    if (!res.ok) throw new Error('Failed to update marriage status');
    const updated = await res.json();

    // Mutate cache directly
    const cached = getCachedData<MarriageRegistrationData[]>('all_marriages');
    if (cached) {
      setCachedData('all_marriages', cached.map(m => m.id === id ? { ...m, approvalStatus: status } : m));
    }
    return updated;
  },

  getReligions: async (): Promise<Religion[]> => {
    return cachedFetch('religions', async () => {
      const res = await fetch(`${BASE_URL}/religions`);
      if (!res.ok) throw new Error('Failed to fetch religions');
      return res.json();
    });
  },

  getHeights: async (): Promise<Height[]> => {
    return cachedFetch('heights', async () => {
      const res = await fetch(`${BASE_URL}/heights`);
      if (!res.ok) throw new Error('Failed to fetch heights');
      return res.json();
    });
  },

  // Dashboard Stats & Today's Registrations
  getDashboardStats: async (): Promise<DashboardStatsData> => {
    return cachedFetch('dashboard_stats', async () => {
      const res = await fetch(`${BASE_URL}/dashboard/stats`, {
        headers: { ...getAdminHeaders() },
      });
      if (!res.ok) throw new Error('Failed to fetch dashboard stats');
      return res.json();
    });
  },

  getTodayRegistrations: async (): Promise<TodayRegistrationData[]> => {
    return cachedFetch('today_registrations', async () => {
      const res = await fetch(`${BASE_URL}/dashboard/today`, {
        headers: { ...getAdminHeaders() },
      });
      if (!res.ok) throw new Error('Failed to fetch today registrations');
      return res.json();
    });
  },

  // News API
  getAllNews: async (): Promise<NewsData[]> => {
    return cachedFetch('all_news', async () => {
      const res = await fetch(`${BASE_URL}/news`);
      if (!res.ok) throw new Error('Failed to fetch news');
      return res.json();
    });
  },

  createNews: async (data: { title: string; content: string; category?: string }): Promise<NewsData> => {
    const res = await fetch(`${BASE_URL}/news`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        ...getAdminHeaders()
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save news');
    invalidateCache('all_news');
    invalidateCache('dashboard_stats');
    return res.json();
  },

  deleteNews: async (id: number): Promise<void> => {
    const res = await fetch(`${BASE_URL}/news/${id}`, { 
      method: 'DELETE',
      headers: {
        ...getAdminHeaders()
      }
    });
    if (!res.ok) throw new Error('Failed to delete news');
    invalidateCache('all_news');
    invalidateCache('dashboard_stats');
  },

  // Inquiries
  submitInquiry: async (data: { name: string; mobile: string; email?: string; message: string }): Promise<InquiryData> => {
    let saved: InquiryData | null = null;
    try {
      const res = await fetch(`${BASE_URL}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json: InquiryData = await res.json();
        saved = json;
        const local = getLocalInquiries();
        saveLocalInquiries([json, ...local]);
      }
    } catch (err) {
      console.warn('Backend unavailable, saving inquiry locally:', err);
    }
    if (!saved) {
      const local = getLocalInquiries();
      saved = {
        id: Date.now(),
        name: data.name,
        mobile: data.mobile,
        email: data.email || null,
        message: data.message,
        status: 'NEW',
        createdAt: new Date().toISOString(),
      };
      saveLocalInquiries([saved, ...local]);
    }
    invalidateCache('all_inquiries');
    return saved;
  },

  getAllInquiries: async (): Promise<InquiryData[]> => {
    return cachedFetch('all_inquiries', async () => {
      try {
        const res = await fetch(`${BASE_URL}/inquiries`, {
          headers: { ...getAdminHeaders() },
        });
        if (res.ok) {
          const remoteData: InquiryData[] = await res.json();
          const local = getLocalInquiries();
          const remoteIds = new Set(remoteData.map((i) => i.id));
          const offlineLocal = local.filter((i) => !remoteIds.has(i.id));
          return [...remoteData, ...offlineLocal];
        }
      } catch (err) {
        console.warn('Backend unavailable, fetching local inquiries:', err);
      }
      return getLocalInquiries();
    });
  },

  deleteInquiry: async (id: number): Promise<void> => {
    try {
      await fetch(`${BASE_URL}/inquiries/${id}`, { 
        method: 'DELETE',
        headers: {
          ...getAdminHeaders()
        }
      });
    } catch (err) {
      console.warn('Backend unavailable, deleting local inquiry:', err);
    }
    const local = getLocalInquiries();
    const updated = local.filter((inq) => inq.id !== id);
    saveLocalInquiries(updated);

    const cached = getCachedData<InquiryData[]>('all_inquiries');
    if (cached) {
      setCachedData('all_inquiries', cached.filter(i => i.id !== id));
    }
  },

  // Payment APIs
  getMembershipPlans: async (): Promise<MembershipPlan[]> => {
    return cachedFetch('membership_plans', async () => {
      const res = await fetch(`${BASE_URL}/membership-plans`);
      if (!res.ok) throw new Error('सदस्यत्व दर पत्रक प्राप्त करणे अयशस्वी.');
      return res.json();
    });
  },

  getMembershipPlanByCode: async (planCode: string): Promise<MembershipPlan> => {
    const res = await fetch(`${BASE_URL}/membership-plans/${planCode}`);
    if (!res.ok) throw new Error('सदस्यत्व दर प्राप्त करणे अयशस्वी.');
    return res.json();
  },

  updateMembershipPlan: async (planCode: string, amount: number): Promise<MembershipPlan> => {
    const res = await fetch(`${BASE_URL}/membership-plans/${planCode}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminHeaders(),
      },
      body: JSON.stringify({ amount }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'सदस्यत्व दर जतन करणे अयशस्वी.');
    invalidateCache('membership_plans');
    return data;
  },

  getPaymentSettings: async (): Promise<PaymentSettingResponse> => {
    return cachedFetch('payment_settings', async () => {
      const res = await fetch(`${BASE_URL}/payment-settings`);
      if (!res.ok) throw new Error('पेमेंट माहिती प्राप्त करणे अयशस्वी.');
      return res.json();
    });
  },

  getPaymentQrSettings: async (): Promise<PaymentSettingResponse> => {
    return cachedFetch('payment_qr_settings', async () => {
      const res = await fetch(`${BASE_URL}/payment-settings/qr`);
      if (!res.ok) throw new Error('QR कोड व पेमेंट माहिती प्राप्त करणे अयशस्वी.');
      return res.json();
    });
  },

  updatePaymentQrSettings: async (formData: FormData): Promise<PaymentSettingResponse> => {
    const res = await fetch(`${BASE_URL}/payment-settings/qr`, {
      method: 'POST',
      headers: {
        ...getAdminHeaders(),
      },
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'QR माहिती जतन करणे अयशस्वी.');
    invalidateCache('payment_qr_settings');
    invalidateCache('payment_settings');
    return data;
  },

  deletePaymentQrSettings: async (): Promise<PaymentSettingResponse> => {
    const res = await fetch(`${BASE_URL}/payment-settings/qr`, {
      method: 'DELETE',
      headers: {
        ...getAdminHeaders(),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'QR हटवणे अयशस्वी.');
    invalidateCache('payment_qr_settings');
    invalidateCache('payment_settings');
    return data;
  },

  submitPayment: async (formData: FormData): Promise<PaymentData> => {
    const res = await fetch(`${BASE_URL}/payments`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'पेमेंट साठवणे अयशस्वी.');
    invalidateCache('all_payments');
    return data;
  },

  getAllPayments: async (): Promise<PaymentData[]> => {
    return cachedFetch('all_payments', async () => {
      const res = await fetch(`${BASE_URL}/payments`, {
        headers: {
          ...getAdminHeaders(),
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'पेमेंट यादी प्राप्त करणे अयशस्वी.');
      return data;
    });
  },

  updatePaymentStatus: async (id: number, status: string, reason?: string): Promise<PaymentData> => {
    let url = `${BASE_URL}/payments/${id}/status?status=${encodeURIComponent(status)}`;
    if (reason) url += `&reason=${encodeURIComponent(reason)}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        ...getAdminHeaders(),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'पेमेंट स्थिती अद्ययावत करणे अयशस्वी.');

    const cached = getCachedData<PaymentData[]>('all_payments');
    if (cached) {
      setCachedData('all_payments', cached.map(p => p.id === id ? { ...p, status: status, rejectionReason: reason || p.rejectionReason } : p));
    }
    return data;
  },

  // Registration Draft API
  getDraft: async (draftId: string): Promise<any> => {
    const res = await fetch(`${BASE_URL}/registrations/draft/${draftId}`);
    if (res.status === 404) return null;
    if (!res.ok) throw new Error('ड्राफ्ट मिळवण्यात अडचण आली.');
    return res.json();
  },

  createOrUpdateDraft: async (data: any): Promise<any> => {
    const res = await fetch(`${BASE_URL}/registrations/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('ड्राफ्ट जतन करणे अयशस्वी.');
    return res.json();
  },

  deleteDraft: async (draftId: string): Promise<void> => {
    try {
      await fetch(`${BASE_URL}/registrations/draft/${draftId}`, {
        method: 'DELETE',
      });
    } catch (err) {
      console.error('Failed to delete server draft:', err);
    }
  },

  // Shibir APIs
  registerShibir: async (data: any): Promise<ShibirRegistrationData> => {
    const res = await fetch(`${BASE_URL}/shibir-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('शिबिर नोंदणी अयशस्वी झाली.');
    invalidateCache('all_shibirs');
    return res.json();
  },

  getAllShibirs: async (): Promise<ShibirRegistrationData[]> => {
    return cachedFetch('all_shibirs', async () => {
      const res = await fetch(`${BASE_URL}/shibir-registration`, {
        headers: { ...getAdminHeaders() },
      });
      if (!res.ok) throw new Error('Failed to fetch shibir registrations');
      return res.json();
    });
  },

  updateShibirStatus: async (id: number, status: string): Promise<ShibirRegistrationData> => {
    const res = await fetch(`${BASE_URL}/shibir-registration/${id}/status?status=${encodeURIComponent(status)}`, {
      method: 'PUT',
      headers: { ...getAdminHeaders() },
    });
    if (!res.ok) throw new Error('Failed to update shibir status');
    const updated = await res.json();

    const cached = getCachedData<ShibirRegistrationData[]>('all_shibirs');
    if (cached) {
      setCachedData('all_shibirs', cached.map(s => s.id === id ? { ...s, approvalStatus: status } : s));
    }
    return updated;
  },

  getShibirMasters: async (): Promise<ShibirMaster[]> => {
    return cachedFetch('shibir_masters', async () => {
      const res = await fetch(`${BASE_URL}/shibir-masters`);
      if (!res.ok) throw new Error('Failed to fetch shibir list');
      return res.json();
    });
  },

  createShibirMaster: async (data: { shibirName: string; shibirDate?: string; shibirLocation?: string }): Promise<ShibirMaster> => {
    const res = await fetch(`${BASE_URL}/shibir-masters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAdminHeaders(),
      },
      body: JSON.stringify(data),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) {
      const errorMsg = json?.message || json?.error || 'Failed to create shibir master';
      throw new Error(errorMsg);
    }
    invalidateCache('shibir_masters');
    return json;
  },

  deleteShibirMaster: async (id: number): Promise<void> => {
    const res = await fetch(`${BASE_URL}/shibir-masters/${id}`, {
      method: 'DELETE',
      headers: { ...getAdminHeaders() },
    });
    if (!res.ok) throw new Error('Failed to delete shibir master');
    invalidateCache('shibir_masters');
  },

  // Donation APIs
  getDonationTypes: async (): Promise<DonationType[]> => {
    return cachedFetch('donation_types', async () => {
      const res = await fetch(`${BASE_URL}/donation-types`);
      if (!res.ok) throw new Error('Failed to fetch donation types');
      return res.json();
    });
  },

  getDonationPurposes: async (): Promise<DonationPurpose[]> => {
    return cachedFetch('donation_purposes', async () => {
      const res = await fetch(`${BASE_URL}/donation-purposes`);
      if (!res.ok) throw new Error('Failed to fetch donation purposes');
      return res.json();
    });
  },

  saveDonationDraft: async (data: any): Promise<DonationRegistrationData> => {
    const res = await fetch(`${BASE_URL}/donation-registration/draft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('मसुदा जतन करणे अयशस्वी.');
    return res.json();
  },

  submitDonationRegistration: async (data: any): Promise<DonationRegistrationData> => {
    const res = await fetch(`${BASE_URL}/donation-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('देणगी नोंदणी जतन करणे अयशस्वी.');
    invalidateCache('all_donations');
    return res.json();
  },

  verifyDonationPayment: async (data: { receiptNumber: string; gatewayReference?: string; transactionId?: string; paymentStatus?: string; paymentMethod?: string }): Promise<DonationRegistrationData> => {
    const res = await fetch(`${BASE_URL}/donation-registration/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('पेमेंट पडताळणी अयशस्वी.');
    return res.json();
  },

  getDonationReceipt: async (receiptNumber: string): Promise<DonationRegistrationData> => {
    const res = await fetch(`${BASE_URL}/donation-registration/receipt/${receiptNumber}`);
    if (!res.ok) throw new Error('पावती सापडली नाही.');
    return res.json();
  },

  getAllDonations: async (): Promise<DonationRegistrationData[]> => {
    return cachedFetch('all_donations', async () => {
      const res = await fetch(`${BASE_URL}/donation-registration`, {
        headers: { ...getAdminHeaders() },
      });
      if (!res.ok) throw new Error('Failed to fetch donations');
      return res.json();
    });
  },

  updateDonationStatus: async (id: number, status: string): Promise<DonationRegistrationData> => {
    const res = await fetch(`${BASE_URL}/donation-registration/${id}/status?status=${encodeURIComponent(status)}`, {
      method: 'PUT',
      headers: { ...getAdminHeaders() },
    });
    if (!res.ok) throw new Error('Failed to update donation status');
    const updated = await res.json();
    invalidateCache('all_donations');
    return updated;
  },
};




