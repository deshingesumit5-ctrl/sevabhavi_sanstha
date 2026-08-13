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
  annualIncome?: string;
  fatherName?: string;
  fatherOccupation?: string;
  motherName?: string;
  mainPhotoUploaded?: string;
  declaration?: string;
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
    }
    if (formData.occupationType && formData.occupationType !== 'not_working') {
      if (formData.occupationType !== 'business' && (!formData.designation || !formData.designation.trim())) {
        setFieldError('designation', 'ही माहिती भरणे आवश्यक आहे', 3);
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

  // Step 6: पुष्टीकरण (Declaration)
  if (!step || step === 6) {
    if (!formData.declaration) {
      setFieldError('declaration', 'ही माहिती भरणे आवश्यक आहे', 6);
    }
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    firstErrorField,
    firstErrorStep,
  };
};
