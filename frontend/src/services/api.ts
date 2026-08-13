const BASE_URL = `http://192.168.1.13:8080/api`;

const getAdminHeaders = (): Record<string, string> => {
  try {
    const stored = localStorage.getItem('sevabhavi_admin_session');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (parsed.token) {
        return { 'Authorization': `Bearer ${parsed.token}` };
      }
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
  memberId: number;
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

export const api = {
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
    const res = await fetch(`${BASE_URL}/lookups/states`);
    if (!res.ok) throw new Error('Failed to fetch states');
    return res.json();
  },


  getDistricts: async (stateId: number): Promise<District[]> => {
    const res = await fetch(`${BASE_URL}/lookups/districts?stateId=${stateId}`);
    if (!res.ok) throw new Error('Failed to fetch districts');
    return res.json();
  },

  getTalukas: async (districtId: number): Promise<Taluka[]> => {
    const res = await fetch(`${BASE_URL}/lookups/talukas?districtId=${districtId}`);
    if (!res.ok) throw new Error('Failed to fetch talukas');
    return res.json();
  },

  getCities: async (districtId: number): Promise<City[]> => {
    const res = await fetch(`${BASE_URL}/lookups/cities?districtId=${districtId}`);
    if (!res.ok) throw new Error('Failed to fetch cities');
    return res.json();
  },

  getBloodGroups: async (): Promise<BloodGroup[]> => {
    const res = await fetch(`${BASE_URL}/lookups/blood-groups`);
    if (!res.ok) throw new Error('Failed to fetch blood groups');
    return res.json();
  },

  getMaritalStatuses: async (): Promise<MaritalStatus[]> => {
    const res = await fetch(`${BASE_URL}/lookups/marital-statuses`);
    if (!res.ok) throw new Error('Failed to fetch marital statuses');
    return res.json();
  },

  getGenders: async (): Promise<Gender[]> => {
    const res = await fetch(`${BASE_URL}/lookups/genders`);
    if (!res.ok) throw new Error('Failed to fetch genders');
    return res.json();
  },

  // Transactions
  registerMember: async (data: any): Promise<any> => {
    const res = await fetch(`${BASE_URL}/member-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('सदस्य नोंदणी अयशस्वी झाली.');
    return res.json();
  },

  registerMarriage: async (data: any): Promise<any> => {
    const res = await fetch(`${BASE_URL}/marriage-registration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('विवाह नोंदणी अयशस्वी झाली.');
    return res.json();
  },

  // Admin - Get all registrations
  getAllMembers: async (): Promise<MemberRegistrationData[]> => {
    const res = await fetch(`${BASE_URL}/member-registration`);
    if (!res.ok) throw new Error('Failed to fetch member registrations');
    return res.json();
  },

  getAllMarriages: async (): Promise<MarriageRegistrationData[]> => {
    const res = await fetch(`${BASE_URL}/marriage-registration`);
    if (!res.ok) throw new Error('Failed to fetch marriage registrations');
    return res.json();
  },

  // Admin - Update approval status
  updateMemberStatus: async (id: number, status: string, reason?: string): Promise<MemberRegistrationData> => {
    let url = `${BASE_URL}/member-registration/${id}/status?status=${status}`;
    if (reason) url += `&reason=${encodeURIComponent(reason)}`;
    const res = await fetch(url, {
      method: 'PUT',
    });
    if (!res.ok) throw new Error('Failed to update member status');
    return res.json();
  },

  updateMarriageStatus: async (id: number, status: string, reason?: string): Promise<MarriageRegistrationData> => {
    let url = `${BASE_URL}/marriage-registration/${id}/status?status=${status}`;
    if (reason) url += `&reason=${encodeURIComponent(reason)}`;
    const res = await fetch(url, {
      method: 'PUT',
    });
    if (!res.ok) throw new Error('Failed to update marriage status');
    return res.json();
  },

  getReligions: async (): Promise<Religion[]> => {
    const res = await fetch(`${BASE_URL}/religions`);
    if (!res.ok) throw new Error('Failed to fetch religions');
    return res.json();
  },

  getHeights: async (): Promise<Height[]> => {
    const res = await fetch(`${BASE_URL}/heights`);
    if (!res.ok) throw new Error('Failed to fetch heights');
    return res.json();
  },


  // Dashboard Stats & Today's Registrations
  getDashboardStats: async (): Promise<DashboardStatsData> => {
    const res = await fetch(`${BASE_URL}/dashboard/stats`);
    if (!res.ok) throw new Error('Failed to fetch dashboard stats');
    return res.json();
  },

  getTodayRegistrations: async (): Promise<TodayRegistrationData[]> => {
    const res = await fetch(`${BASE_URL}/dashboard/today`);
    if (!res.ok) throw new Error('Failed to fetch today registrations');
    return res.json();
  },

  // News API
  getAllNews: async (): Promise<NewsData[]> => {
    const res = await fetch(`${BASE_URL}/news`);
    if (!res.ok) throw new Error('Failed to fetch news');
    return res.json();
  },

  createNews: async (data: { title: string; content: string; category?: string }): Promise<NewsData> => {
    const res = await fetch(`${BASE_URL}/news`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to save news');
    return res.json();
  },

  deleteNews: async (id: number): Promise<void> => {
    const res = await fetch(`${BASE_URL}/news/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete news');
  },

  // Inquiries
  submitInquiry: async (data: { name: string; mobile: string; email?: string; message: string }): Promise<InquiryData> => {
    try {
      const res = await fetch(`${BASE_URL}/inquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const saved = await res.json();
        const local = getLocalInquiries();
        saveLocalInquiries([saved, ...local]);
        return saved;
      }
    } catch (err) {
      console.warn('Backend unavailable, saving inquiry locally:', err);
    }
    const local = getLocalInquiries();
    const newInquiry: InquiryData = {
      id: Date.now(),
      name: data.name,
      mobile: data.mobile,
      email: data.email || null,
      message: data.message,
      status: 'NEW',
      createdAt: new Date().toISOString(),
    };
    saveLocalInquiries([newInquiry, ...local]);
    return newInquiry;
  },

  getAllInquiries: async (): Promise<InquiryData[]> => {
    try {
      const res = await fetch(`${BASE_URL}/inquiries`);
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
  },

  deleteInquiry: async (id: number): Promise<void> => {
    try {
      await fetch(`${BASE_URL}/inquiries/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Backend unavailable, deleting local inquiry:', err);
    }
    const local = getLocalInquiries();
    const updated = local.filter((inq) => inq.id !== id);
    saveLocalInquiries(updated);
  },

  // Payment APIs
  getMembershipPlans: async (): Promise<MembershipPlan[]> => {
    const res = await fetch(`${BASE_URL}/membership-plans`);
    if (!res.ok) throw new Error('सदस्यत्व दर पत्रक प्राप्त करणे अयशस्वी.');
    return res.json();
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
    return data;
  },

  getPaymentSettings: async (): Promise<PaymentSettingResponse> => {
    const res = await fetch(`${BASE_URL}/payment-settings`);
    if (!res.ok) throw new Error('पेमेंट माहिती प्राप्त करणे अयशस्वी.');
    return res.json();
  },

  getPaymentQrSettings: async (): Promise<PaymentSettingResponse> => {
    const res = await fetch(`${BASE_URL}/payment-settings/qr`);
    if (!res.ok) throw new Error('QR कोड व पेमेंट माहिती प्राप्त करणे अयशस्वी.');
    return res.json();
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
    return data;
  },

  submitPayment: async (formData: FormData): Promise<PaymentData> => {
    const res = await fetch(`${BASE_URL}/payments`, {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'पेमेंट साठवणे अयशस्वी.');
    return data;
  },

  getAllPayments: async (): Promise<PaymentData[]> => {
    const res = await fetch(`${BASE_URL}/payments`, {
      headers: {
        ...getAdminHeaders(),
      },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'पेमेंट यादी प्राप्त करणे अयशस्वी.');
    return data;
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
};



