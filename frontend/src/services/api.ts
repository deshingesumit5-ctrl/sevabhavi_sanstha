const BASE_URL = `http://${window.location.hostname}:8080/api`;

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

export const api = {
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
  updateMemberStatus: async (id: number, status: string): Promise<MemberRegistrationData> => {
    const res = await fetch(`${BASE_URL}/member-registration/${id}/status?status=${status}`, {
      method: 'PUT',
    });
    if (!res.ok) throw new Error('Failed to update member status');
    return res.json();
  },

  updateMarriageStatus: async (id: number, status: string): Promise<MarriageRegistrationData> => {
    const res = await fetch(`${BASE_URL}/marriage-registration/${id}/status?status=${status}`, {
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
};
