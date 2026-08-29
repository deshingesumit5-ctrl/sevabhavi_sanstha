export interface MemberFormErrors {
  fullName?: string;
  birthDate?: string;
  gender?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  mobile?: string;
  email?: string;
  education?: string;
  occupationType?: string;
  currentAddress?: string;
  permanentAddress?: string;
  stateId?: string;
  districtId?: string;
  talukaId?: string;
  pincode?: string;
  declaration?: string;
  screenshot?: string;
}

export const validateMobile = (mobile: string): boolean => {
  return /^\d{10}$/.test(mobile);
};

export const validateEmail = (email: string): boolean => {
  if (!email) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const validateBirthDate = (birthDate: string): boolean => {
  if (!birthDate) return false;
  const parts = birthDate.split('-');
  if (parts.length !== 3) return false;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // months are 0-indexed
  const day = parseInt(parts[2], 10);
  
  const selectedDate = new Date(year, month, day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  selectedDate.setHours(0, 0, 0, 0);
  return selectedDate <= today;
};

export const validateMemberForm = (
  formData: any,
  step?: number
): { errors: MemberFormErrors; isValid: boolean; firstErrorField: string | null; firstErrorStep: number | null } => {
  const errors: MemberFormErrors = {};
  let firstErrorField: string | null = null;
  let firstErrorStep: number | null = null;

  const setFieldError = (field: keyof MemberFormErrors, msg: string, fieldStep: number) => {
    if (!errors[field]) {
      errors[field] = msg;
      if (!firstErrorField) {
        firstErrorField = field;
        firstErrorStep = fieldStep;
      }
    }
  };

  // Step 1: वैयक्तिक माहिती
  if (!step || step === 1) {
    if (!formData.fullName || !formData.fullName.trim()) {
      setFieldError('fullName', 'ही माहिती भरणे आवश्यक आहे', 1);
    }
    if (!formData.birthDate) {
      setFieldError('birthDate', 'ही माहिती भरणे आवश्यक आहे', 1);
    } else if (!validateBirthDate(formData.birthDate)) {
      setFieldError('birthDate', 'जन्म तारीख भविष्यातील असू शकत नाही', 1);
    }
    if (!formData.gender) {
      setFieldError('gender', 'ही माहिती भरणे आवश्यक आहे', 1);
    }
    if (!formData.bloodGroup) {
      setFieldError('bloodGroup', 'ही माहिती भरणे आवश्यक आहे', 1);
    }
    if (!formData.maritalStatus) {
      setFieldError('maritalStatus', 'ही माहिती भरणे आवश्यक आहे', 1);
    }
    if (!formData.mobile) {
      setFieldError('mobile', 'ही माहिती भरणे आवश्यक आहे', 1);
    } else if (!validateMobile(formData.mobile)) {
      setFieldError('mobile', 'कृपया वैध १० अंकी मोबाईल क्रमांक प्रविष्ट करा', 1);
    }
    if (formData.email && !validateEmail(formData.email)) {
      setFieldError('email', 'कृपया वैध ईमेल पत्ता प्रविष्ट करा', 1);
    }
    if (!formData.education) {
      setFieldError('education', 'ही माहिती भरणे आवश्यक आहे', 1);
    }
    if (!formData.occupationType) {
      setFieldError('occupationType', 'ही माहिती भरणे आवश्यक आहे', 1);
    }
  }

  // Step 2: पत्ता माहिती
  if (!step || step === 2) {
    if (!formData.currentAddress || !formData.currentAddress.trim()) {
      setFieldError('currentAddress', 'ही माहिती भरणे आवश्यक आहे', 2);
    }
    if (!formData.permanentAddress || !formData.permanentAddress.trim()) {
      setFieldError('permanentAddress', 'ही माहिती भरणे आवश्यक आहे', 2);
    }
    if (!formData.stateId) {
      setFieldError('stateId', 'ही माहिती भरणे आवश्यक आहे', 2);
    }
    if (!formData.districtId) {
      setFieldError('districtId', 'ही माहिती भरणे आवश्यक आहे', 2);
    }
    if (!formData.talukaId) {
      setFieldError('talukaId', 'ही माहिती भरणे आवश्यक आहे', 2);
    }
    if (!formData.pincode) {
      setFieldError('pincode', 'ही माहिती भरणे आवश्यक आहे', 2);
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      setFieldError('pincode', 'कृपया वैध ६ अंकी पिनकोड प्रविष्ट करा', 2);
    }
  }

  // Step 5: पुष्टीकरण (Declaration)
  if (!step || step === 5) {
    if (!formData.declaration) {
      setFieldError('declaration', 'ही माहिती भरणे आवश्यक आहे', 5);
    }
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    firstErrorField,
    firstErrorStep,
  };
};

export interface MarriageFormErrors {
  education?: string;
  fullName?: string;
  birthDate?: string;
  height?: string;
  bloodGroup?: string;
  maritalStatus?: string;
  religion?: string;
  caste?: string;
  stateId?: string;
  districtId?: string;
  city?: string;
  mobile?: string;
  email?: string;
  parentMobile?: string;
  aboutSelf?: string;
  expectations?: string;
  educationLevel?: string;
  degreeName?: string;
  passingYear?: string;
  occupationType?: string;
  designation?: string;
  companyName?: string;
  annualIncome?: string;
  fatherName?: string;
  fatherOccupation?: string;
  fatherDesignation?: string;
  fatherCompanyName?: string;
  motherName?: string;
  mainPhotoUploaded?: string;
  declaration?: string;
  screenshot?: string;
}

export const validateMarriageForm = (
  formData: any,
  step?: number
): { errors: MarriageFormErrors; isValid: boolean; firstErrorField: string | null; firstErrorStep: number | null } => {
  const errors: MarriageFormErrors = {};
  let firstErrorField: string | null = null;
  let firstErrorStep: number | null = null;

  const setFieldError = (field: keyof MarriageFormErrors, msg: string, fieldStep: number) => {
    if (!errors[field]) {
      errors[field] = msg;
      if (!firstErrorField) {
        firstErrorField = field;
        firstErrorStep = fieldStep;
      }
    }
  };

  // Step 1: वैयक्तिक माहिती
  if (!step || step === 1) {
    if (!formData.fullName || !formData.fullName.trim()) {
      setFieldError('fullName', 'ही माहिती भरणे आवश्यक आहे', 1);
    }
    if (!formData.birthDate) {
      setFieldError('birthDate', 'ही माहिती भरणे आवश्यक आहे', 1);
    } else if (!validateBirthDate(formData.birthDate)) {
      setFieldError('birthDate', 'जन्म तारीख भविष्यातील असू शकत नाही', 1);
    }
    if (!formData.height) {
      setFieldError('height', 'ही माहिती भरणे आवश्यक आहे', 1);
    }
    if (!formData.bloodGroup) {
      setFieldError('bloodGroup', 'ही माहिती भरणे आवश्यक आहे', 1);
    }
    if (!formData.maritalStatus) {
      setFieldError('maritalStatus', 'ही माहिती भरणे आवश्यक आहे', 1);
    }
    if (!formData.religion) {
      setFieldError('religion', 'ही माहिती भरणे आवश्यक आहे', 1);
    }
    if (!formData.caste || !formData.caste.trim()) {
      setFieldError('caste', 'ही माहिती भरणे आवश्यक आहे', 1);
    }
    if (!formData.stateId) {
      setFieldError('stateId', 'ही माहिती भरणे आवश्यक आहे', 1);
    }
    if (!formData.districtId) {
      setFieldError('districtId', 'ही माहिती भरणे आवश्यक आहे', 1);
    }
    if (!formData.city) {
      setFieldError('city', 'ही माहिती भरणे आवश्यक आहे', 1);
    }
    if (!formData.mobile) {
      setFieldError('mobile', 'ही माहिती भरणे आवश्यक आहे', 1);
    } else if (!validateMobile(formData.mobile)) {
      setFieldError('mobile', 'कृपया वैध १० अंकी मोबाईल क्रमांक प्रविष्ट करा', 1);
    }
    if (formData.email && !validateEmail(formData.email)) {
      setFieldError('email', 'कृपया वैध ईमेल पत्ता प्रविष्ट करा', 1);
    }
    if (!formData.parentMobile) {
      setFieldError('parentMobile', 'ही माहिती भरणे आवश्यक आहे', 1);
    } else if (!validateMobile(formData.parentMobile)) {
      setFieldError('parentMobile', 'कृपया वैध १० अंकी मोबाईल क्रमांक प्रविष्ट करा', 1);
    }
    if (!formData.aboutSelf || !formData.aboutSelf.trim()) {
      setFieldError('aboutSelf', 'ही माहिती भरणे आवश्यक आहे', 1);
    }
    if (!formData.expectations || !formData.expectations.trim()) {
      setFieldError('expectations', 'ही माहिती भरणे आवश्यक आहे', 1);
    }
  }

  // Step 2: शैक्षणिक माहिती
  if (!step || step === 2) {
    if (!formData.educationLevel) {
      setFieldError('educationLevel', 'ही माहिती भरणे आवश्यक आहे', 2);
    }
    if (!formData.degreeName || !formData.degreeName.trim()) {
      setFieldError('degreeName', 'ही माहिती भरणे आवश्यक आहे', 2);
    }
    if (!formData.passingYear || !formData.passingYear.trim()) {
      setFieldError('passingYear', 'ही माहिती भरणे आवश्यक आहे', 2);
    } else if (!/^\d{4}$/.test(formData.passingYear)) {
      setFieldError('passingYear', 'कृपया वैध उत्तीर्ण वर्ष प्रविष्ट करा (उदा. २०१५)', 2);
    }
  }

  // Step 3: व्यावसायिक माहिती
  if (!step || step === 3) {
    if (!formData.occupationType) {
      setFieldError('occupationType', 'ही माहिती भरणे आवश्यक आहे', 3);
    } else if (formData.occupationType === 'private_job' || formData.occupationType === 'gov_job') {
      if (!formData.designation || !formData.designation.trim()) {
        setFieldError('designation', 'ही माहिती भरणे आवश्यक आहे', 3);
      }
      if (!formData.companyName || !formData.companyName.trim()) {
        setFieldError('companyName', 'ही माहिती भरणे आवश्यक आहे', 3);
      }
      if (!formData.annualIncome || !formData.annualIncome.trim()) {
        setFieldError('annualIncome', 'ही माहिती भरणे आवश्यक आहे', 3);
      }
    } else if (formData.occupationType === 'business') {
      if (!formData.companyName || !formData.companyName.trim()) {
        setFieldError('companyName', 'ही माहिती भरणे आवश्यक आहे', 3);
      }
      if (!formData.annualIncome || !formData.annualIncome.trim()) {
        setFieldError('annualIncome', 'ही माहिती भरणे आवश्यक आहे', 3);
      }
    }
  }

  // Step 4: कुटुंबाची माहिती
  if (!step || step === 4) {
    if (!formData.fatherName || !formData.fatherName.trim()) {
      setFieldError('fatherName', 'ही माहिती भरणे आवश्यक आहे', 4);
    }
    if (!formData.fatherOccupation || !formData.fatherOccupation.trim()) {
      setFieldError('fatherOccupation', 'ही माहिती भरणे आवश्यक आहे', 4);
    } else if (formData.fatherOccupation === 'private_job' || formData.fatherOccupation === 'gov_job') {
      if (!formData.fatherDesignation || !formData.fatherDesignation.trim()) {
        setFieldError('fatherDesignation', 'ही माहिती भरणे आवश्यक आहे', 4);
      }
      if (!formData.fatherCompanyName || !formData.fatherCompanyName.trim()) {
        setFieldError('fatherCompanyName', 'ही माहिती भरणे आवश्यक आहे', 4);
      }
    } else if (formData.fatherOccupation === 'business') {
      if (!formData.fatherCompanyName || !formData.fatherCompanyName.trim()) {
        setFieldError('fatherCompanyName', 'ही माहिती भरणे आवश्यक आहे', 4);
      }
    }
    if (!formData.motherName || !formData.motherName.trim()) {
      setFieldError('motherName', 'ही माहिती भरणे आवश्यक आहे', 4);
    }
  }

  // Step 5: फोटो अपलोड करा
  if (!step || step === 5) {
    if (!formData.mainPhotoUploaded) {
      setFieldError('mainPhotoUploaded', 'मुख्य प्रोफाइल फोटो अपलोड करणे आवश्यक आहे', 5);
    }
  }

  // Step 7: पुष्टीकरण (Declaration - validated before final submit)
  if (!step || step === 7) {
    if (!formData.declaration) {
      setFieldError('declaration', 'ही माहिती भरणे आवश्यक आहे', 7);
    }
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    firstErrorField,
    firstErrorStep,
  };
};

export interface ShibirFormErrors {
  shibirName?: string;
  shibirDate?: string;
  fullName?: string;
  fullAddress?: string;
  stateId?: string;
  districtId?: string;
  talukaId?: string;
  cityVillage?: string;
  birthDate?: string;
  mobile?: string;
  relativeMobile?: string;
  passportPhotoUploaded?: string;
  declaration?: string;
  screenshot?: string;
}

export const validateShibirForm = (
  formData: any,
  step?: number
): { errors: ShibirFormErrors; isValid: boolean; firstErrorField: string | null; firstErrorStep: number | null } => {
  const errors: ShibirFormErrors = {};
  let firstErrorField: string | null = null;
  let firstErrorStep: number | null = null;

  const setFieldError = (field: keyof ShibirFormErrors, msg: string, fieldStep: number) => {
    if (!errors[field]) {
      errors[field] = msg;
      if (!firstErrorField) {
        firstErrorField = field;
        firstErrorStep = fieldStep;
      }
    }
  };

  // Step 1: कार्यक्रमाची माहिती
  if (!step || step === 1) {
    if (!formData.shibirName || !formData.shibirName.trim()) {
      setFieldError('shibirName', 'कार्यक्रम / शिबिराचे नाव निवडणे किंवा प्रविष्ट करणे आवश्यक आहे', 1);
    }
  }

  // Step 2: वैयक्तिक माहिती
  if (!step || step === 2) {
    if (!formData.fullName || !formData.fullName.trim()) {
      setFieldError('fullName', 'ही माहिती भरणे आवश्यक आहे', 2);
    }
    if (!formData.fullAddress || !formData.fullAddress.trim()) {
      setFieldError('fullAddress', 'ही माहिती भरणे आवश्यक आहे', 2);
    }
    if (!formData.stateId) {
      setFieldError('stateId', 'ही माहिती भरणे आवश्यक आहे', 2);
    }
    if (!formData.districtId) {
      setFieldError('districtId', 'ही माहिती भरणे आवश्यक आहे', 2);
    }
    if (!formData.talukaId) {
      setFieldError('talukaId', 'ही माहिती भरणे आवश्यक आहे', 2);
    }
    if (!formData.cityVillage || !formData.cityVillage.trim()) {
      setFieldError('cityVillage', 'ही माहिती भरणे आवश्यक आहे', 2);
    }
    if (!formData.birthDate) {
      setFieldError('birthDate', 'ही माहिती भरणे आवश्यक आहे', 2);
    } else if (!validateBirthDate(formData.birthDate)) {
      setFieldError('birthDate', 'जन्म तारीख भविष्यातील असू शकत नाही', 2);
    }
    if (!formData.mobile) {
      setFieldError('mobile', 'ही माहिती भरणे आवश्यक आहे', 2);
    } else if (!validateMobile(formData.mobile)) {
      setFieldError('mobile', 'कृपया वैध १० अंकी मोबाईल क्रमांक प्रविष्ट करा', 2);
    }
    if (formData.relativeMobile && !validateMobile(formData.relativeMobile)) {
      setFieldError('relativeMobile', 'कृपया वैध १० अंकी मोबाईल क्रमांक प्रविष्ट करा', 2);
    }
  }

  // Step 4: फोटो
  if (!step || step === 4) {
    if (!formData.passportPhotoUploaded) {
      setFieldError('passportPhotoUploaded', 'पासपोर्ट साईज फोटो अपलोड करणे आवश्यक आहे', 4);
    }
  }

  // Step 5: पुष्टीकरण (Declaration)
  if (!step || step === 5) {
    if (!formData.declaration) {
      setFieldError('declaration', 'ही माहिती भरणे आवश्यक आहे', 5);
    }
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    firstErrorField,
    firstErrorStep,
  };
};

export const validatePan = (pan: string): boolean => {
  if (!pan) return false;
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase());
};

export interface DonationFormErrors {
  fullName?: string;
  mobile?: string;
  email?: string;
  address?: string;
  city?: string;
  stateId?: string;
  districtId?: string;
  pincode?: string;
  donationTypeId?: string;
  donationPurposeId?: string;
  customPurpose?: string;
  amount?: string;
  paymentMethod?: string;
  transactionId?: string;
  screenshot?: string;
}

export const validateDonationForm = (
  formData: any,
  step?: number
): { errors: DonationFormErrors; isValid: boolean; firstErrorField: string | null; firstErrorStep: number | null } => {
  const errors: DonationFormErrors = {};
  let firstErrorField: string | null = null;
  let firstErrorStep: number | null = null;

  const setFieldError = (field: keyof DonationFormErrors, msg: string, fieldStep: number) => {
    if (!errors[field]) {
      errors[field] = msg;
      if (!firstErrorField) {
        firstErrorField = field;
        firstErrorStep = fieldStep;
      }
    }
  };

  // Step 1: वैयक्तिक माहिती (Personal Information)
  if (!step || step === 1) {
    if (!formData.fullName || !formData.fullName.trim()) {
      setFieldError('fullName', 'ही माहिती भरणे आवश्यक आहे', 1);
    }
    if (!formData.mobile) {
      setFieldError('mobile', 'ही माहिती भरणे आवश्यक आहे', 1);
    } else if (!validateMobile(formData.mobile)) {
      setFieldError('mobile', 'कृपया वैध १० अंकी मोबाईल क्रमांक प्रविष्ट करा', 1);
    }
    if (formData.email && !validateEmail(formData.email)) {
      setFieldError('email', 'कृपया वैध ईमेल पत्ता प्रविष्ट करा', 1);
    }
    if (!formData.address || !formData.address.trim()) {
      setFieldError('address', 'ही माहिती भरणे आवश्यक आहे', 1);
    }
    if (!formData.stateId) {
      setFieldError('stateId', 'ही माहिती भरणे आवश्यक आहे', 1);
    }
    if (!formData.districtId) {
      setFieldError('districtId', 'ही माहिती भरणे आवश्यक आहे', 1);
    }
    if (!formData.city || !formData.city.trim()) {
      setFieldError('city', 'ही माहिती भरणे आवश्यक आहे', 1);
    }
    if (!formData.pincode || !formData.pincode.trim()) {
      setFieldError('pincode', 'ही माहिती भरणे आवश्यक आहे', 1);
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      setFieldError('pincode', 'कृपया वैध ६ अंकी पिनकोड प्रविष्ट करा', 1);
    }
  }

  // Step 2: देणगीचा प्रकार व उद्देश (Donation Type & Purpose)
  if (!step || step === 2) {
    if (!formData.donationPurposeId) {
      setFieldError('donationPurposeId', 'कृपया निधीचा उद्देश निवडा', 2);
    } else if (formData.donationPurposeId === 'other') {
      if (!formData.customPurpose || !formData.customPurpose.trim()) {
        setFieldError('customPurpose', 'ही माहिती भरणे आवश्यक आहे', 2);
      }
    }
  }

  // Step 3: पेमेंट (Payment) & रक्कम
  if (!step || step === 3) {
    const amt = Number(formData.amount);
    if (!formData.amount || isNaN(amt) || amt < 10) {
      setFieldError('amount', 'कृपया किमान ₹ १० किंवा त्यापेक्षा जास्त रक्कम प्रविष्ट करा', 3);
    }
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    firstErrorField,
    firstErrorStep,
  };
};


