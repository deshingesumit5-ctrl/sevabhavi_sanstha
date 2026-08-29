import React, { useState, useEffect, useRef } from 'react';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import StepIndicator from '../../components/StepIndicator';
import { ArrowLeft, ArrowRight, CheckCircle2, Printer, Loader2, ShieldCheck, Pencil, Trash2, QrCode, Smartphone, Upload, Download, Eye, RotateCcw, X, FileText } from 'lucide-react';
import { api, BASE_URL, type State, type District, type City, type BloodGroup, type MaritalStatus, type Religion, type Height, type PaymentSettingResponse } from '../../services/api';
import { uploadImage, imageUrl, deleteImage, fetchByCategory, type GalleryImage } from '../../services/galleryApi';
import { useAuth } from '../../context/AuthContext';
import { validateMarriageForm, type MarriageFormErrors } from '../../utils/validations';
import { QRCodeSVG } from 'qrcode.react';
import { saveDraft, loadDraft, clearDraft } from '../../utils/formPersistence';
import { buildUpiLink } from '../../utils/upi';
import ConfirmModal, { type ConfirmState } from '../../components/ConfirmModal';

const DRAFT_KEY = "marriage_reg_draft";

export const MarriageRegistrationPage: React.FC = () => {
  const localDraft = loadDraft<any>(DRAFT_KEY);

  const formSectionRef = useRef<HTMLDivElement>(null);
  const todayDate = new Date().toISOString().split('T')[0];

  // Confirm Modal state
  const [confirmState, setConfirmState] = useState<ConfirmState>({ open: false, message: '', onConfirm: () => { } });
  const closeConfirm = () => setConfirmState(prev => ({ ...prev, open: false }));
  const askConfirm = (message: string, onConfirm: () => void) =>
    setConfirmState({ open: true, message, onConfirm });

  const [profileType, setProfileType] = useState<'bride' | 'groom'>(() => localDraft?.profileType ?? 'bride');
  const [currentStep, setCurrentStep] = useState<number>(() => localDraft?.currentStep ?? 1);
  const [errors, setErrors] = useState<MarriageFormErrors>({});
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  // Lookups loaded from DB
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [bloodGroups, setBloodGroups] = useState<BloodGroup[]>([]);
  const [maritalStatuses, setMaritalStatuses] = useState<MaritalStatus[]>([]);
  const [religions, setReligions] = useState<Religion[]>([]);
  const [heights, setHeights] = useState<Height[]>([]);
  const [showDeclarationBanner, setShowDeclarationBanner] = useState<boolean>(false);
  const [declarationMsg, setDeclarationMsg] = useState<string>('कृपया माहिती सत्य असल्याची पुष्टी करण्यासाठी टिक करा.');
  const [, setMainPhotoFile] = useState<File | null>(null);
  const [mainPhotoPreview, setMainPhotoPreview] = useState<string | null>(() => localDraft?.mainPhotoPreview ?? null);
  const { isAdmin } = useAuth();
  const [bannerImage, setBannerImage] = useState<GalleryImage | null>(null);
  const BANNER_SECTION_KEY = 'marriage_registration_banner';

  // Payment State (Fixed ₹500 fee requirement for Marriage)
  const MARRIAGE_FEE = 500;
  const [paymentQrSettings, setPaymentQrSettings] = useState<PaymentSettingResponse | null>(null);
  const [paymentMode, setPaymentMode] = useState<string>(() => localDraft?.paymentMode ?? (isAdmin ? 'Cash' : 'GPay'));
  const [cashAmountReceived, setCashAmountReceived] = useState<string>(() => localDraft?.cashAmountReceived ?? '500');
  const [upiTxnId] = useState<string>(() => localDraft?.upiTxnId ?? '');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(() => localDraft?.screenshotPreview ?? null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [registrationComplete, setRegistrationComplete] = useState<boolean>(() => localDraft?.registrationComplete ?? false);
  const [registeredId, setRegisteredId] = useState<number | null>(() => localDraft?.registeredId ?? null);

  useEffect(() => {
    fetchByCategory('banner')
      .then(images => setBannerImage(images.find(img => img.sectionKey === BANNER_SECTION_KEY) ?? null))
      .catch(err => console.error('Error loading banner:', err));

    api.getPaymentQrSettings()
      .then(setPaymentQrSettings)
      .catch(err => console.error('Error loading payment QR:', err));
  }, []);

  const handleBannerUpload = async (file: File) => {
    try {
      const uploaded = await uploadImage({ file, category: 'banner', sectionKey: BANNER_SECTION_KEY });
      setBannerImage(uploaded);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleBannerDelete = async () => {
    if (!bannerImage) return;
    askConfirm('बॅनर फोटो हटवायचा आहे का?', async () => {
      try {
        await deleteImage(bannerImage.id);
        setBannerImage(null);
      } catch (err) {
        alert((err as Error).message);
      }
    });
  };

  // Form state
  const [formData, setFormData] = useState(() => {
    if (localDraft?.formData) return localDraft.formData;
    return {
      fullName: '',
      birthDate: '',
      height: '',
      bloodGroup: '',
      maritalStatus: '',
      religion: '',
      caste: '',
      gotra: '',
      manglik: 'no',
      city: '',
      stateId: '',
      districtId: '',
      mobile: '',
      email: '',
      parentMobile: '',
      aboutSelf: '',
      expectations: '',
      educationLevel: '',
      degreeName: '',
      schoolCollege: '',
      passingYear: '',
      occupationType: '',
      designation: '',
      companyName: '',
      annualIncome: '',
      fatherName: '',
      fatherOccupation: '',
      fatherDesignation: '',
      fatherCompanyName: '',
      motherName: '',
      brothers: '0',
      sisters: '0',
      familyBackground: '',
      mainPhotoUploaded: false,
      fullPhotoUploaded: false,
      declaration: false,
    };
  });

  // Load lookups on mount
  useEffect(() => {
    const loadLookups = async () => {
      const [statesRes, bloodRes, maritalRes, religionRes, heightRes, citiesRes] = await Promise.allSettled([
        api.getStates(),
        api.getBloodGroups(),
        api.getMaritalStatuses(),
        api.getReligions(),
        api.getHeights(),
        api.getCities(formData.districtId ? Number(formData.districtId) : undefined)
      ]);

      if (statesRes.status === 'fulfilled') {
        setStates(statesRes.value);

        const mh = statesRes.value.find(s => s.nameEn === 'Maharashtra');
        if (!formData.stateId && mh) {
          setFormData((prev: any) => ({ ...prev, stateId: mh.id.toString() }));
          try {
            const mhDistricts = await api.getDistricts(mh.id);
            setDistricts(mhDistricts);
          } catch (err) {
            console.error('Error loading districts:', err);
          }
        } else if (formData.stateId) {
          api.getDistricts(Number(formData.stateId)).then(setDistricts).catch(console.error);
        }
      }

      if (bloodRes.status === 'fulfilled') setBloodGroups(bloodRes.value);
      if (maritalRes.status === 'fulfilled') setMaritalStatuses(maritalRes.value);
      if (religionRes.status === 'fulfilled') setReligions(religionRes.value);
      if (heightRes.status === 'fulfilled') setHeights(heightRes.value);
      if (citiesRes.status === 'fulfilled') setCities(citiesRes.value);
    };
    loadLookups();
  }, []);

  // Save state to draft on changes
  useEffect(() => {
    const draft = {
      formData,
      profileType,
      currentStep,
      mainPhotoPreview,
      paymentMode,
      cashAmountReceived,
      upiTxnId,
      screenshotPreview,
      registrationComplete,
      registeredId,
    };
    saveDraft(draft, DRAFT_KEY);
  }, [formData, profileType, currentStep, mainPhotoPreview, paymentMode, cashAmountReceived, upiTxnId, screenshotPreview, registrationComplete, registeredId]);

  const steps = [
    'वैयक्तिक माहिती',
    'शैक्षणिक माहिती',
    'व्यावसायिक माहिती',
    'कुटुंबाची माहिती',
    'फोटो अपलोड करा',
    'पेमेंट (₹५००)',
    'पुष्टीकरण'
  ];

  const handleMainPhotoSelect = (file: File) => {
    setMainPhotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setMainPhotoPreview(reader.result as string);
      setFormData((prev: any) => ({ ...prev, mainPhotoUploaded: true }));
      if (errors.mainPhotoUploaded) {
        setErrors((prev: any) => ({ ...prev, mainPhotoUploaded: undefined }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('स्क्रीनशॉटचा आकार ३ MB पेक्षा जास्त नसावा.');
        return;
      }
      setScreenshotFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'mobile' || name === 'parentMobile') {
      val = value.replace(/[^0-9]/g, '').slice(0, 10);
    }
    setFormData((prev: any) => ({ ...prev, [name]: val }));
    if (errors[name as keyof MarriageFormErrors]) {
      setErrors((prev: any) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateIdVal = e.target.value;
    setFormData((prev: any) => ({ ...prev, stateId: stateIdVal, districtId: '', city: '' }));
    setDistricts([]);
    if (errors.stateId) {
      setErrors((prev: any) => ({ ...prev, stateId: undefined }));
    }
    if (stateIdVal) {
      try {
        const data = await api.getDistricts(Number(stateIdVal));
        setDistricts(data);
      } catch (err) {
        console.error('Error loading districts:', err);
      }
    }
    api.getCities().then(setCities).catch(console.error);
  };

  const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtIdVal = e.target.value;
    setFormData((prev: any) => ({ ...prev, districtId: districtIdVal, city: '' }));
    if (errors.districtId) {
      setErrors((prev: any) => ({ ...prev, districtId: undefined }));
    }
    if (districtIdVal) {
      try {
        const data = await api.getCities(Number(districtIdVal));
        setCities(data);
      } catch (err) {
        console.error('Error loading cities:', err);
      }
    } else {
      api.getCities().then(setCities).catch(console.error);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: checked }));
    if (errors[name as keyof MarriageFormErrors]) {
      setErrors((prev: any) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();

    if (currentStep === 6 && paymentMode !== 'Cash' && !screenshotFile && !screenshotPreview) {
      setErrors((prev: any) => ({ ...prev, screenshot: 'कृपया पेमेंट स्क्रीनशॉट अपलोड करा' }));
      return;
    }

    const { isValid, errors: stepErrors, firstErrorField } = validateMarriageForm(formData, currentStep);
    if (!isValid) {
      setErrors((prev: any) => ({ ...prev, ...stepErrors }));
      if (firstErrorField) {
        setTimeout(() => {
          const element = document.getElementsByName(firstErrorField)[0] || document.getElementById(firstErrorField);
          element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
      return;
    }

    setErrors({});
    if (currentStep < 7) {
      setCurrentStep((prev) => prev + 1);
      setTimeout(() => {
        formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      setTimeout(() => {
        formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  const handleSubmitFinal = async () => {
    if (!formData.declaration) {
      setDeclarationMsg('कृपया माहिती सत्य असल्याची पुष्टी करण्यासाठी टिक करा.');
      setShowDeclarationBanner(true);
      return;
    }

    if (paymentMode !== 'Cash' && !screenshotPreview && !screenshotFile) {
      setDeclarationMsg('कृपया ५०० रुपयांच्या पेमेंटचा स्क्रीनशॉट अपलोड करा.');
      setShowDeclarationBanner(true);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        profileType,
        fullName: formData.fullName,
        birthDate: formData.birthDate,
        height: formData.height,
        bloodGroup: formData.bloodGroup,
        maritalStatus: formData.maritalStatus,
        religion: formData.religion,
        caste: formData.caste,
        gotra: formData.gotra || null,
        manglik: formData.manglik,
        city: formData.city,
        state: { id: Number(formData.stateId) },
        district: { id: Number(formData.districtId) },
        mobile: formData.mobile,
        email: formData.email || null,
        parentMobile: formData.parentMobile,
        aboutSelf: formData.aboutSelf,
        expectations: formData.expectations,
        educationLevel: formData.educationLevel,
        degreeName: formData.degreeName,
        schoolCollege: formData.schoolCollege || null,
        passingYear: formData.passingYear,
        occupationType: formData.occupationType,
        designation: formData.designation || null,
        companyName: formData.companyName || null,
        annualIncome: formData.annualIncome,
        fatherName: formData.fatherName,
        fatherOccupation: formData.fatherOccupation === 'private_job'
          ? `खाजगी नोकरी (${formData.fatherDesignation || ''} - ${formData.fatherCompanyName || ''})`
          : formData.fatherOccupation === 'gov_job'
            ? `शासकीय नोकरी (${formData.fatherDesignation || ''} - ${formData.fatherCompanyName || ''})`
            : formData.fatherOccupation === 'business'
              ? `व्यवसाय (${formData.fatherCompanyName || ''})`
              : formData.fatherOccupation === 'retired'
                ? 'निवृत्त (Retired)'
                : formData.fatherOccupation === 'not_working'
                  ? 'काम करत नाही'
                  : formData.fatherOccupation,
        motherName: formData.motherName,
        brothers: Number(formData.brothers),
        sisters: Number(formData.sisters),
        familyBackground: formData.familyBackground || null,
        mainPhotoUploaded: formData.mainPhotoUploaded,
        fullPhotoUploaded: formData.fullPhotoUploaded,
        declaration: formData.declaration
      };

      const saved = await api.registerMarriage(payload);
      setRegisteredId(saved.id);

      try {
        const fd = new FormData();
        fd.append('registrationType', 'MARRIAGE');
        fd.append('registrationId', saved.id.toString());
        fd.append('amount', paymentMode === 'Cash' ? (cashAmountReceived || '500') : '500');
        fd.append('membershipType', 'marriage');
        fd.append('paymentMode', paymentMode);
        if (upiTxnId) fd.append('upiTxnId', upiTxnId);
        if (screenshotFile) fd.append('file', screenshotFile);

        await api.submitPayment(fd);
      } catch (payErr) {
        console.warn('Payment submit notice:', payErr);
      }

      setRegistrationComplete(true);
      clearDraft(DRAFT_KEY);
    } catch (err: any) {
      alert('विवाह नोंदणी साठवताना त्रुटी आली: ' + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateAge = (dobString: string): string => {
    if (!dobString) return '';
    const parts = dobString.split('-');
    if (parts.length !== 3) return '';
    const birthYear = parseInt(parts[0], 10);
    const birthMonth = parseInt(parts[1], 10);
    const birthDay = parseInt(parts[2], 10);
    if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) return '';

    const today = new Date();
    let age = today.getFullYear() - birthYear;
    const m = (today.getMonth() + 1) - birthMonth;
    if (m < 0 || (m === 0 && today.getDate() < birthDay)) {
      age--;
    }
    return age >= 0 ? age.toString() : '0';
  };

  const getEducationLabel = (level: string) => {
    if (level === 'post_graduate') return 'पदव्युत्तर (Post Graduate)';
    if (level === 'graduate') return 'पदवीधर (Graduate)';
    if (level === 'diploma') return 'डिप्लोमा (Diploma)';
    if (level === '12th') return '१२ वी उत्तीर्ण';
    if (level === '10th') return '१० वी उत्तीर्ण';
    if (level === 'other') return 'इतर (Other)';
    return level || '-';
  };

  const getOccupationLabel = (type: string) => {
    if (type === 'private_job') return 'खाजगी नोकरी (Private Job)';
    if (type === 'gov_job') return 'शासकीय नोकरी (Government Job)';
    if (type === 'business') return 'व्यवसाय (Business)';
    if (type === 'not_working') return 'काम करत नाही';
    return type || '-';
  };

  const getFatherOccupationLabel = (occ: string) => {
    if (occ === 'private_job') {
      return `खाजगी नोकरी ${formData.fatherDesignation ? `(${formData.fatherDesignation}` : ''}${formData.fatherCompanyName ? ` - ${formData.fatherCompanyName})` : formData.fatherDesignation ? ')' : ''}`;
    }
    if (occ === 'gov_job') {
      return `शासकीय नोकरी ${formData.fatherDesignation ? `(${formData.fatherDesignation}` : ''}${formData.fatherCompanyName ? ` - ${formData.fatherCompanyName})` : formData.fatherDesignation ? ')' : ''}`;
    }
    if (occ === 'business') {
      return `व्यवसाय ${formData.fatherCompanyName ? `(${formData.fatherCompanyName})` : ''}`;
    }
    if (occ === 'retired') return 'निवृत्त (Retired)';
    if (occ === 'not_working') return 'काम करत नाही';
    return occ || '-';
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Marriage_Registration_MARRIAGE_${registeredId || 'NEW'}_${formData.fullName || 'Form'}`;
    window.print();
    document.title = originalTitle;
  };

  // Download PDF directly on same screen
  const handleDownloadPdf = async () => {
    if (!registeredId) {
      handlePrint();
      return;
    }
    try {
      const downloadUrl = `${BASE_URL}/marriage-registration/form/${registeredId}/pdf`;
      const res = await fetch(downloadUrl);
      if (!res.ok) {
        throw new Error('PDF माहिती प्राप्त करण्यात त्रुटी आली.');
      }
      const blob = await res.blob();
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Marriage_Registration_MARRIAGE_${registeredId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err: any) {
      alert('PDF डाउनलोड करताना त्रुटी आली: ' + (err.message || err));
    }
  };

  const handleResetForm = () => {
    setRegistrationComplete(false);
    setCurrentStep(1);
    setFormData({
      fullName: '',
      birthDate: '',
      height: '',
      bloodGroup: '',
      maritalStatus: '',
      religion: '',
      caste: '',
      gotra: '',
      manglik: 'no',
      city: '',
      stateId: states.find(s => s.nameEn === 'Maharashtra')?.id.toString() || '',
      districtId: '',
      mobile: '',
      email: '',
      parentMobile: '',
      aboutSelf: '',
      expectations: '',
      educationLevel: '',
      degreeName: '',
      schoolCollege: '',
      passingYear: '',
      occupationType: '',
      designation: '',
      companyName: '',
      annualIncome: '',
      fatherName: '',
      fatherOccupation: '',
      fatherDesignation: '',
      fatherCompanyName: '',
      motherName: '',
      brothers: '0',
      sisters: '0',
      familyBackground: '',
      mainPhotoUploaded: false,
      fullPhotoUploaded: false,
      declaration: false,
    });
    setProfileType('bride');
    setMainPhotoPreview(null);
    setMainPhotoFile(null);
    setScreenshotPreview(null);
    setScreenshotFile(null);
    setPaymentMode(isAdmin ? 'Cash' : 'GPay');
    setCashAmountReceived('500');
    setRegisteredId(null);
    setErrors({});
    setShowPreviewModal(false);
    clearDraft(DRAFT_KEY);
    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  };

  const selectedState = states.find(s => s.id === Number(formData.stateId));
  const selectedDistrict = districts.find(d => d.id === Number(formData.districtId));
  const selectedBloodLabel = bloodGroups.find(b => b.code === formData.bloodGroup)?.labelMr || formData.bloodGroup;
  const selectedMaritalLabel = maritalStatuses.find(m => m.code === formData.maritalStatus)?.labelMr || formData.maritalStatus;

  const upiPayLink = buildUpiLink(
    paymentQrSettings?.upiId || '9823456789@upi',
    paymentQrSettings?.payeeName || 'दापोली मंडणगड सेवाभावी संस्था',
    MARRIAGE_FEE,
    `Marriage Registration - ${formData.fullName}`
  );

  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero Banner - Sized exactly like Member Registration */}
      <section className="relative w-full overflow-hidden bg-cream-dark/20 p-2 md:p-4 section-gap-top">
        <div className="relative rounded-card-lg overflow-hidden shadow-soft">
          {bannerImage ? (
            <>
              <img
                src={imageUrl(bannerImage.imageUrl)}
                alt="विवाह नोंदणी बॅनर"
                className="w-full min-h-[140px] sm:min-h-[220px] object-cover"
              />
              {isAdmin && (
                <div className="absolute top-3 right-3 flex gap-2 z-20">
                  <button
                    type="button"
                    onClick={() => document.getElementById('marriage-banner-input')?.click()}
                    className="p-2 bg-white/90 hover:bg-white text-saffron rounded-full shadow-md"
                    title="फोटो बदला"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={handleBannerDelete}
                    className="p-2 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-md"
                    title="फोटो हटवा"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <ImagePlaceholder
              aspectRatio="aspect-[16/9] md:aspect-[21/9]"
              label="विवाह नोंदणी बॅनर फोटो (२१:९)"
              className="w-full min-h-[140px] sm:min-h-[220px]"
              onFileSelect={handleBannerUpload}
            />
          )}
          <input
            id="marriage-banner-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleBannerUpload(file);
              e.target.value = '';
            }}
          />
        </div>
      </section>

      {/* 2. Vadhu (Bride) vs Var (Groom) Selection Below Banner - Like 3rd Image */}
      <section id="profile-type-section" className="w-full px-4 max-w-4xl mx-auto section-gap-top">
        <div className="bg-white border border-saffron/20 rounded-2xl p-5 md:p-6 shadow-soft space-y-5">
          <p className="text-center text-sm font-bold text-charcoal/70 mb-2 flex items-center justify-center gap-3" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
            <span className="hidden sm:inline-block h-px w-12 bg-gradient-to-r from-transparent to-saffron/40" />
            आपण कोण म्हणून नोंदणी करीत आहात?
            <span className="hidden sm:inline-block h-px w-12 bg-gradient-to-l from-transparent to-saffron/40" />
          </p>

          <div className="relative flex items-center justify-center gap-2 sm:gap-4 max-w-xl mx-auto pt-1">
            {/* Bride (Vadhu) Option */}
            <button
              type="button"
              onClick={() => setProfileType('bride')}
              className={`relative flex-1 flex items-center gap-3 rounded-2xl border-2 py-3 px-3 sm:py-4 sm:px-4 transition-all duration-300 cursor-pointer ${profileType === 'bride'
                ? 'border-rose-600 bg-gradient-to-b from-rose-50/80 to-rose-100/30 shadow-md shadow-rose-600/10'
                : 'border-charcoal/10 bg-white hover:border-rose-300 hover:shadow-sm'
                }`}
            >
              {/* Radio dot - top right corner */}
              <span
                className={`absolute top-2.5 right-2.5 h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all ${profileType === 'bride' ? 'border-rose-600 bg-white' : 'border-charcoal/25 bg-white'
                  }`}
              >
                {profileType === 'bride' && <span className="h-2 w-2 rounded-full bg-rose-600" />}
              </span>

              <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full overflow-hidden bg-rose-50/80 border border-rose-200 flex items-center justify-center p-1.5 shadow-xs">
                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-rose-600" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 68C20 52 24 32 40 20C54 9 74 15 80 30C86 45 82 62 78 78C76 86 74 92 74 92" strokeWidth="2.2" strokeDasharray="3 3" />
                  <path d="M30 40C28 26 38 15 52 15C66 15 76 25 76 40C76 45 74 55 72 65" />
                  <path d="M48 30C46 36 46 42 48 48C49 52 52 56 56 58C52 62 48 68 46 76" />
                  <path d="M52 15V26" />
                  <circle cx="52" cy="27" r="2" fill="currentColor" />
                  <circle cx="53" cy="35" r="1.5" fill="currentColor" />
                  <circle cx="57" cy="46" r="2.5" />
                  <path d="M59.5 46C64 45 68 38 68 38" />
                  <path d="M38 32C42 36 44 44 42 52C40 60 36 68 34 78" />
                  <path d="M42 45L40 50H44L42 45Z" fill="currentColor" />
                  <path d="M46 68C52 70 60 70 66 66" />
                  <path d="M44 74C52 77 62 77 70 72" />
                </svg>
              </div>

              <div className="flex flex-col text-left leading-tight">
                <span className={`font-extrabold text-base sm:text-lg transition-colors ${profileType === 'bride' ? 'text-rose-700' : 'text-charcoal'}`} style={{ fontFamily: "'Baloo 2', sans-serif" }}>वधू</span>
                <span className="text-[11px] text-charcoal/60 font-medium">Bride</span>
              </div>
            </button>

            {/* किंवा Divider */}
            <span className="flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 rounded-full border-2 border-saffron/30 bg-cream items-center justify-center text-[10px] sm:text-[11px] font-extrabold text-saffron-dark shadow-sm z-10 self-center">
              किंवा
            </span>

            {/* Groom (Var) Option */}
            <button
              type="button"
              onClick={() => setProfileType('groom')}
              className={`relative flex-1 flex items-center gap-3 rounded-2xl border-2 py-3 px-3 sm:py-4 sm:px-4 transition-all duration-300 cursor-pointer ${profileType === 'groom'
                ? 'border-blue-600 bg-gradient-to-b from-blue-50/80 to-blue-100/30 shadow-md shadow-blue-600/10'
                : 'border-charcoal/10 bg-white hover:border-blue-300 hover:shadow-sm'
                }`}
            >
              {/* Radio dot - top right corner */}
              <span
                className={`absolute top-2.5 right-2.5 h-4 w-4 rounded-full border-2 flex items-center justify-center transition-all ${profileType === 'groom' ? 'border-blue-600 bg-white' : 'border-charcoal/25 bg-white'
                  }`}
              >
                {profileType === 'groom' && <span className="h-2 w-2 rounded-full bg-blue-600" />}
              </span>

              <div className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-full overflow-hidden bg-blue-50/80 border border-blue-200 flex items-center justify-center p-1.5 shadow-xs">
                <svg viewBox="0 0 100 100" fill="none" className="w-full h-full text-blue-600" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M25 36C25 24 35 14 50 14C65 14 75 24 75 36C75 40 73 44 70 46H30C27 44 25 40 25 36Z" fill="currentColor" fillOpacity="0.08" />
                  <path d="M24 38C35 32 50 30 76 34" strokeWidth="2.2" />
                  <path d="M26 30C38 24 54 22 74 28" strokeWidth="2.2" />
                  <path d="M30 22C42 17 56 16 70 22" strokeWidth="2.2" />
                  <path d="M50 14C50 8 53 4 56 2C54 7 53 10 52 14" strokeWidth="2" fill="currentColor" />
                  <circle cx="50" cy="14" r="2.5" fill="currentColor" />
                  <path d="M72 38C75 48 76 60 75 75C74 84 72 92 72 92" strokeDasharray="3 3" />
                  <path d="M36 46C38 52 38 58 40 64C42 68 46 72 50 74C46 78 42 84 40 92" />
                  <path d="M48 62C52 62 55 60 58 61" strokeWidth="2" />
                  <path d="M34 52C32 55 33 58 35 60" />
                  <path d="M40 78L46 92" strokeWidth="2" />
                  <path d="M56 78L52 92" strokeWidth="2" />
                  <path d="M36 82C46 84 56 84 66 82" />
                </svg>
              </div>

              <div className="flex flex-col text-left leading-tight">
                <span className={`font-extrabold text-base sm:text-lg transition-colors ${profileType === 'groom' ? 'text-blue-700' : 'text-charcoal'}`} style={{ fontFamily: "'Baloo 2', sans-serif" }}>वर</span>
                <span className="text-[11px] text-charcoal/60 font-medium">Groom</span>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Form Stepper and Container Below */}
      <section ref={formSectionRef} className="w-full px-4 max-w-4xl mx-auto space-y-6 section-gap-top mb-12">
        {/* Stepper Card */}
        {!registrationComplete && (
          <div className="bg-white rounded-card-lg border border-saffron/5 shadow-soft p-5">
            <StepIndicator steps={steps} currentStep={currentStep} layout="horizontal" />
          </div>
        )}

        {/* Form Content Card */}
        <div className="bg-white rounded-card-lg border border-saffron/5 shadow-soft p-6 md:p-8">

          {/* REGISTRATION COMPLETE / PREVIEW VIEW */}
          {registrationComplete ? (
            <div className="py-6 space-y-6">
              {/* Success Notification Banner */}
              <div className="text-center space-y-3 no-print">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 size={36} />
                </div>

                <h2 className="text-2xl font-bold text-saffron" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                  आपली विवाह नोंदणी यशस्वीरित्या पूर्ण झाली आहे!
                </h2>
                <p className="text-sm text-charcoal/70 max-w-md mx-auto">
                  नोंदणी क्रमांक: <span className="font-bold text-saffron-dark font-mono">MARRIAGE-{registeredId || 'NEW'}</span>. माहितीची पडताळणी करून लवकरच प्रोफाइल सक्रिय केले जाईल.
                </p>
              </div>

              {/* Scoped Print Styles for A4 Paper */}
              <style>{`
                @media print {
                  @page {
                    size: A4 portrait;
                    margin: 8mm 10mm;
                  }
                  body {
                    background: white !important;
                    color: black !important;
                    -webkit-print-color-adjust: exact !important;
                    print-color-adjust: exact !important;
                  }
                  header, footer, nav, .no-print, button {
                    display: none !important;
                  }
                  body * {
                    visibility: hidden;
                  }
                  #printable-marriage-form, #printable-marriage-form * {
                    visibility: visible;
                  }
                  #printable-marriage-form {
                    position: absolute;
                    left: 0;
                    top: 0;
                    width: 100% !important;
                    max-width: 100% !important;
                    margin: 0 !important;
                    padding: 16px !important;
                    border: 2px solid #E8792C !important;
                    box-shadow: none !important;
                    background: white !important;
                  }
                }
              `}</style>

              {/* Official Form Preview (Auto-populated with all entered details) */}
              <div
                id="printable-marriage-form"
                className="w-full max-w-3xl mx-auto text-left border-2 border-saffron/30 rounded-2xl p-6 sm:p-8 bg-white shadow-md space-y-5 print:border-2 print:border-saffron print:shadow-none print:p-4 print:rounded-none"
              >
                {/* Official Form Header */}
                <div className="border-b-2 border-saffron/30 pb-4 text-center relative">
                  <p className="text-[11px] font-bold text-saffron tracking-widest uppercase mb-0.5">॥ जनसेवा हीच ईश्वरसेवा ॥</p>
                  <h3 className="text-xl sm:text-2xl font-black text-saffron-dark leading-tight" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                    दापोली मंडणगड सेवाभावी संस्था, पुणे
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-charcoal/80 mt-0.5">
                    वधू-वर सूचक केंद्र • अधिकृत नोंदणी अर्ज (Official Marriage Registration Form)
                  </p>
                  <p className="text-[10px] text-charcoal/60 mt-0.5">
                    नोंदणी कार्यालय: पुणे, महाराष्ट्र • संपर्क: ९८२३४५६७८९ / dmsanstha@gmail.com
                  </p>

                  {/* Metadata Bar */}
                  <div className="mt-3 pt-2.5 border-t border-dashed border-saffron/20 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
                    <div className="flex items-center gap-1.5 bg-cream/60 px-3 py-1 rounded-md border border-saffron/20">
                      <span className="text-charcoal/70">नोंदणी क्रमांक:</span>
                      <span className="font-mono font-bold text-saffron-dark">MARRIAGE-{registeredId || 'NEW'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-cream/60 px-3 py-1 rounded-md border border-saffron/20">
                      <span className="text-charcoal/70">नोंदणी प्रकार:</span>
                      <span className="font-bold text-saffron-dark">{profileType === 'bride' ? 'वधू (Bride)' : 'वर (Groom)'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-cream/60 px-3 py-1 rounded-md border border-saffron/20">
                      <span className="text-charcoal/70">दिनांक:</span>
                      <span className="font-bold text-charcoal">{todayDate}</span>
                    </div>
                  </div>

                  {/* Profile Photo Container (Top Right Box) */}
                  {mainPhotoPreview ? (
                    <div className="mt-3 sm:mt-0 sm:absolute top-1 right-1 flex flex-col items-center">
                      <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-lg overflow-hidden border-2 border-saffron/40 shadow-xs bg-cream/30">
                        <img src={mainPhotoPreview} alt="Applicant" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[9px] font-medium text-charcoal/60 mt-0.5">अर्जदार छायाचित्र</span>
                    </div>
                  ) : (
                    <div className="mt-3 sm:mt-0 sm:absolute top-1 right-1 flex flex-col items-center">
                      <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-lg border-2 border-dashed border-saffron/30 flex flex-col items-center justify-center bg-cream/20 text-charcoal/40 text-[10px]">
                        <span>पासपोर्ट फोटो</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 1: वैयक्तिक माहिती */}
                <div className="space-y-2">
                  <div className="bg-saffron/10 px-3 py-1 rounded border-l-4 border-saffron">
                    <h4 className="text-xs sm:text-sm font-bold text-saffron-dark">१. वैयक्तिक माहिती (Personal Details)</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">पूर्ण नाव:</span> <span className="font-bold text-charcoal">{formData.fullName || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">जन्म तारीख / वय:</span> <span className="font-bold text-charcoal">{formData.birthDate || '-'} {formData.birthDate ? `(${calculateAge(formData.birthDate)} वर्षे)` : ''}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">उंची & रक्तगट:</span> <span className="font-bold text-charcoal">{formData.height || '-'} / {selectedBloodLabel || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">वैवाहिक स्थिती:</span> <span className="font-bold text-charcoal">{selectedMaritalLabel || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">धर्म व जात:</span> <span className="font-bold text-charcoal">{formData.religion ? `${formData.religion} - ${formData.caste || ''}` : '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">गोत्र & मंगळ:</span> <span className="font-bold text-charcoal">{formData.gotra || '-'} / {formData.manglik === 'yes' ? 'मंगळ आहे' : formData.manglik === 'no' ? 'मंगळ नाही' : 'माहित नाही'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">संपर्क मोबाईल:</span> <span className="font-bold text-charcoal">{formData.mobile || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">पालकांचा मोबाईल:</span> <span className="font-bold text-charcoal">{formData.parentMobile || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">ईमेल:</span> <span className="font-bold text-charcoal">{formData.email || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15 sm:col-span-2 md:col-span-3"><span className="text-charcoal/60 block text-[11px]">पत्ता (शहर/जिल्हा/राज्य):</span> <span className="font-bold text-charcoal">{formData.city ? `${formData.city}, ` : ''}{selectedDistrict?.nameMr || selectedDistrict?.nameEn || ''}, {selectedState?.nameMr || selectedState?.nameEn || ''}</span></div>
                    {formData.aboutSelf && (
                      <div className="p-2 bg-cream/20 rounded border border-saffron/15 sm:col-span-2 md:col-span-3"><span className="text-charcoal/60 block text-[11px]">स्वतःबद्दल थोडक्यात:</span> <span className="font-medium text-charcoal">{formData.aboutSelf}</span></div>
                    )}
                    {formData.expectations && (
                      <div className="p-2 bg-cream/20 rounded border border-saffron/15 sm:col-span-2 md:col-span-3"><span className="text-charcoal/60 block text-[11px]">अपेक्षित जोडीदाराविषयी:</span> <span className="font-medium text-charcoal">{formData.expectations}</span></div>
                    )}
                  </div>
                </div>

                {/* Section 2: शैक्षणिक माहिती */}
                <div className="space-y-2">
                  <div className="bg-saffron/10 px-3 py-1 rounded border-l-4 border-saffron">
                    <h4 className="text-xs sm:text-sm font-bold text-saffron-dark">२. शैक्षणिक माहिती (Educational Details)</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">शिक्षण पातळी:</span> <span className="font-bold text-charcoal">{getEducationLabel(formData.educationLevel)}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">पदवी नाव:</span> <span className="font-bold text-charcoal">{formData.degreeName || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">शाळा / कॉलेज:</span> <span className="font-bold text-charcoal">{formData.schoolCollege || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">उत्तीर्ण वर्ष:</span> <span className="font-bold text-charcoal">{formData.passingYear || '-'}</span></div>
                  </div>
                </div>

                {/* Section 3: व्यावसायिक माहिती */}
                <div className="space-y-2">
                  <div className="bg-saffron/10 px-3 py-1 rounded border-l-4 border-saffron">
                    <h4 className="text-xs sm:text-sm font-bold text-saffron-dark">३. व्यावसायिक माहिती (Professional Details)</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">व्यवसाय प्रकार:</span> <span className="font-bold text-charcoal">{getOccupationLabel(formData.occupationType)}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">पद / Designation:</span> <span className="font-bold text-charcoal">{formData.designation || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">कंपनी / कार्यालयाचे नाव:</span> <span className="font-bold text-charcoal">{formData.companyName || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">वार्षिक उत्पन्न:</span> <span className="font-bold text-charcoal">{formData.annualIncome || '-'}</span></div>
                  </div>
                </div>


                {/* Section 4: कौटुंबिक माहिती */}
                <div className="space-y-2">
                  <div className="bg-saffron/10 px-3 py-1 rounded border-l-4 border-saffron">
                    <h4 className="text-xs sm:text-sm font-bold text-saffron-dark">४. कौटुंबिक माहिती (Family Details)</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">वडिलांचे नाव:</span> <span className="font-bold text-charcoal">{formData.fatherName || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15 sm:col-span-2"><span className="text-charcoal/60 block text-[11px]">वडिलांचा व्यवसाय व पद:</span> <span className="font-bold text-charcoal">{getFatherOccupationLabel(formData.fatherOccupation)}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">आईचे नाव:</span> <span className="font-bold text-charcoal">{formData.motherName || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">भावंडे:</span> <span className="font-bold text-charcoal">{formData.brothers || '0'} भाऊ, {formData.sisters || '0'} बहीण</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">कौटुंबिक पार्श्वभूमी:</span> <span className="font-bold text-charcoal">{formData.familyBackground || '-'}</span></div>
                  </div>
                </div>

                {/* Section 5: नोंदणी व शुल्क तपशील */}
                <div className="space-y-2">
                  <div className="bg-saffron/10 px-3 py-1 rounded border-l-4 border-saffron">
                    <h4 className="text-xs sm:text-sm font-bold text-saffron-dark">५. नोंदणी व शुल्क तपशील (Registration & Fee)</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">नोंदणी शुल्क:</span> <span className="font-bold text-saffron-dark">₹५०० ({paymentMode})</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">नोंदणी स्थिती:</span> <span className="font-bold text-emerald-700">नोंदणी पूर्ण (यशस्वी)</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">घोषणा पुष्टीकरण:</span> <span className="font-semibold text-charcoal">माहिती सत्य व अचूक आहे.</span></div>
                  </div>
                </div>

                {/* Official Signatures & Seal Box */}
                <div className="pt-6 mt-4 border-t-2 border-dashed border-saffron/30 grid grid-cols-2 gap-6 text-center text-xs">
                  <div className="space-y-10">
                    <div className="h-8" />
                    <div className="border-t border-charcoal/50 pt-1 font-bold text-charcoal">
                      अर्जदाराची स्वाक्षरी (Applicant's Signature)
                    </div>
                  </div>
                  <div className="space-y-10">
                    <div className="h-8" />
                    <div className="border-t border-charcoal/50 pt-1 font-bold text-saffron-dark">
                      अधिकृत संस्था प्रतिनिधी स्वाक्षरी व शिक्का
                    </div>
                  </div>
                </div>
              </div>
              {/* Options Below Preview Section */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4 no-print">
                {/* 1. Preview Form Option */}
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="px-5 py-2.5 bg-amber-50 hover:bg-amber-100 text-saffron-dark border border-saffron/30 font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Eye size={17} className="text-saffron-dark" />
                  <span>फॉर्म पूर्वावलोकन (Preview Form)</span>
                </button>

                {/* 2. Print Form Option */}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Printer size={17} />
                  <span>फॉर्म प्रिंट करा (Print Form)</span>
                </button>

                {/* 3. Download PDF Option */}
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="px-5 py-2.5 bg-saffron hover:bg-saffron-dark text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Download size={17} />
                  <span>PDF डाऊनलोड करा (Download PDF)</span>
                </button>

                {/* 4. Reset and Start from Beginning Option */}
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="px-5 py-2.5 bg-charcoal/80 hover:bg-charcoal text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm cursor-pointer"
                >
                  <RotateCcw size={17} />
                  <span>नवीन नोंदणी करा (Start From Beginning)</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleNext} className="space-y-6">

              <h2 className="text-xl font-bold text-saffron border-b border-saffron/5 pb-3" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                पायरी {currentStep}: {steps[currentStep - 1]}
              </h2>

              {/* STEP 1: वैयक्तिक माहिती */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-normal text-charcoal/80 mb-1">पूर्ण नाव <span className="text-red-500">*</span></label>
                      <input type="text" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="आपले पूर्ण नाव लिहा" className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${errors.fullName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'}`} />
                      {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-normal text-charcoal/80 mb-1">जन्म तारीख <span className="text-red-500">*</span></label>
                      <input type="date" name="birthDate" max={todayDate} value={formData.birthDate} onChange={handleInputChange} className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${errors.birthDate ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'}`} />
                      {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-normal text-charcoal/80 mb-1">उंची <span className="text-red-500">*</span></label>
                      <select name="height" value={formData.height} onChange={handleInputChange} className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-white transition-all ${errors.height ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'}`}>
                        <option value="">-- उंची निवडा --</option>
                        {heights.map(h => <option key={h.heightId} value={h.heightText}>{h.heightText}</option>)}
                      </select>
                      {errors.height && <p className="text-red-500 text-xs mt-1">{errors.height}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-normal text-charcoal/80 mb-1">रक्तगट <span className="text-red-500">*</span></label>
                      <select name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-white transition-all ${errors.bloodGroup ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'}`}>
                        <option value="">-- रक्तगट निवडा --</option>
                        {bloodGroups.map(b => <option key={b.id} value={b.code}>{b.labelMr}</option>)}
                      </select>
                      {errors.bloodGroup && <p className="text-red-500 text-xs mt-1">{errors.bloodGroup}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-normal text-charcoal/80 mb-1">वैवाहिक स्थिती <span className="text-red-500">*</span></label>
                      <select name="maritalStatus" value={formData.maritalStatus} onChange={handleInputChange} className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-white transition-all ${errors.maritalStatus ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'}`}>
                        <option value="">-- वैवाहिक स्थिती निवडा --</option>
                        {maritalStatuses.map(m => <option key={m.id} value={m.code}>{m.labelMr}</option>)}
                      </select>
                      {errors.maritalStatus && <p className="text-red-500 text-xs mt-1">{errors.maritalStatus}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-normal text-charcoal/80 mb-1">धर्म <span className="text-red-500">*</span></label>
                      <select name="religion" value={formData.religion} onChange={handleInputChange} className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-white transition-all ${errors.religion ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'}`}>
                        <option value="">-- धर्म निवडा --</option>
                        {religions.map(r => <option key={r.religionId} value={r.religionName}>{r.religionName}</option>)}
                      </select>
                      {errors.religion && <p className="text-red-500 text-xs mt-1">{errors.religion}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-normal text-charcoal/80 mb-1">जात <span className="text-red-500">*</span></label>
                      <input type="text" name="caste" value={formData.caste} onChange={handleInputChange} placeholder="आपली जात प्रविष्ट करा" className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${errors.caste ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'}`} />
                      {errors.caste && <p className="text-red-500 text-xs mt-1">{errors.caste}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-normal text-charcoal/80 mb-1">राज्य <span className="text-red-500">*</span></label>
                      <select name="stateId" value={formData.stateId} onChange={handleStateChange} className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-white transition-all ${errors.stateId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'}`}>
                        <option value="">-- राज्य निवडा --</option>
                        {states.map(s => <option key={s.id} value={s.id}>{s.nameMr || s.nameEn}</option>)}
                      </select>
                      {errors.stateId && <p className="text-red-500 text-xs mt-1">{errors.stateId}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-normal text-charcoal/80 mb-1">जिल्हा <span className="text-red-500">*</span></label>
                      <select name="districtId" value={formData.districtId} onChange={handleDistrictChange} className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-white transition-all ${errors.districtId ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'}`}>
                        <option value="">-- जिल्हा निवडा --</option>
                        {districts.map(d => <option key={d.id} value={d.id}>{d.nameMr || d.nameEn}</option>)}
                      </select>
                      {errors.districtId && <p className="text-red-500 text-xs mt-1">{errors.districtId}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-normal text-charcoal/80 mb-1">शहर / गाव <span className="text-red-500">*</span></label>
                      <select
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-white transition-all ${errors.city ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'}`}
                      >
                        <option value="">-- शहर निवडा --</option>
                        {cities.map((c) => (
                          <option key={c.id} value={c.nameMr || c.nameEn}>
                            {c.nameMr ? `${c.nameMr}${c.nameEn ? ` (${c.nameEn})` : ''}` : c.nameEn}
                          </option>
                        ))}
                      </select>
                      {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-normal text-charcoal/80 mb-1">मोबाईल नं. <span className="text-red-500">*</span></label>
                      <input type="tel" name="mobile" maxLength={10} value={formData.mobile} onChange={handleInputChange} placeholder="१० अंकी नंबर" className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${errors.mobile ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'}`} />
                      {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-normal text-charcoal/80 mb-1">पालकांचा मोबाईल नं. <span className="text-red-500">*</span></label>
                      <input type="tel" name="parentMobile" maxLength={10} value={formData.parentMobile} onChange={handleInputChange} placeholder="पालकांचा मोबाईल नंबर" className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${errors.parentMobile ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'}`} />
                      {errors.parentMobile && <p className="text-red-500 text-xs mt-1">{errors.parentMobile}</p>}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-normal text-charcoal/80 mb-1">स्वतःबद्दल माहिती <span className="text-red-500">*</span></label>
                      <textarea name="aboutSelf" rows={2} value={formData.aboutSelf} onChange={handleInputChange} placeholder="आपल्याबद्दल थोडक्यात सांगा..." className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${errors.aboutSelf ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'}`} />
                      {errors.aboutSelf && <p className="text-red-500 text-xs mt-1">{errors.aboutSelf}</p>}
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-normal text-charcoal/80 mb-1">अपेक्षित जोडीदाराविषयी <span className="text-red-500">*</span></label>
                      <textarea name="expectations" rows={2} value={formData.expectations} onChange={handleInputChange} placeholder="जोडीदाराकडून असलेल्या अपेक्षा..." className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${errors.expectations ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'}`} />
                      {errors.expectations && <p className="text-red-500 text-xs mt-1">{errors.expectations}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: शैक्षणिक माहिती */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-normal text-charcoal/80 mb-1">शिक्षण पातळी <span className="text-red-500">*</span></label>
                      <select
                        name="educationLevel"
                        value={formData.educationLevel}
                        onChange={handleInputChange}
                        className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-white transition-all ${errors.educationLevel ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'}`}
                      >
                        <option value="">-- निवडा --</option>
                        <option value="post_graduate">पदव्युत्तर (Post Graduate)</option>
                        <option value="graduate">पदवीधर (Graduate)</option>
                        <option value="diploma">डिप्लोमा (Diploma)</option>
                        <option value="12th">१२ वी उत्तीर्ण</option>
                        <option value="10th">१० वी उत्तीर्ण</option>
                        <option value="other">इतर (Other)</option>
                      </select>
                      {errors.educationLevel && <p className="text-red-500 text-xs mt-1">{errors.educationLevel}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-normal text-charcoal/80 mb-1">पदवी नाव <span className="text-red-500">*</span></label>
                      <input type="text" name="degreeName" value={formData.degreeName} onChange={handleInputChange} placeholder="उदा. B.Tech, B.Com, MBA" className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${errors.degreeName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'}`} />
                      {errors.degreeName && <p className="text-red-500 text-xs mt-1">{errors.degreeName}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-normal text-charcoal/80 mb-1">उत्तीर्ण वर्ष <span className="text-red-500">*</span></label>
                      <input type="text" name="passingYear" value={formData.passingYear} onChange={handleInputChange} placeholder="उदा. २०२०" className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${errors.passingYear ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'}`} />
                      {errors.passingYear && <p className="text-red-500 text-xs mt-1">{errors.passingYear}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: व्यावसायिक माहिती */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className={formData.occupationType === 'not_working' ? 'sm:col-span-2' : ''}>
                      <label className="block text-xs font-bold text-charcoal/75 mb-1">नोकरी / व्यवसाय प्रकार <span className="text-red-500">*</span></label>
                      <select name="occupationType" value={formData.occupationType} onChange={handleInputChange} className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-white transition-all ${errors.occupationType ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'}`}>
                        <option value="">-- प्रकार निवडा --</option>
                        <option value="private_job">खाजगी नोकरी (Private Job)</option>
                        <option value="gov_job">शासकीय नोकरी (Government Job)</option>
                        <option value="business">व्यवसाय (Business)</option>
                        <option value="not_working">काम करत नाही</option>
                      </select>
                      {errors.occupationType && <p className="text-red-500 text-xs mt-1">{errors.occupationType}</p>}
                    </div>

                    {(formData.occupationType === 'private_job' || formData.occupationType === 'gov_job') && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-charcoal/75 mb-1">पद / Designation <span className="text-red-500">*</span></label>
                          <input type="text" name="designation" value={formData.designation} onChange={handleInputChange} placeholder="उदा. मॅनेजर, सॉफ्टवेअर इंजिनिअर" className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${errors.designation ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'}`} />
                          {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-charcoal/75 mb-1">कंपनी / कार्यालयाचे नाव <span className="text-red-500">*</span></label>
                          <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="उदा. TCS, SBI" className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${errors.companyName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'}`} />
                          {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-charcoal/75 mb-1">वार्षिक उत्पन्न <span className="text-red-500">*</span></label>
                          <input type="text" name="annualIncome" value={formData.annualIncome} onChange={handleInputChange} placeholder="उदा. ₹५,००,०००" className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${errors.annualIncome ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'}`} />
                          {errors.annualIncome && <p className="text-red-500 text-xs mt-1">{errors.annualIncome}</p>}
                        </div>
                      </>
                    )}

                    {formData.occupationType === 'business' && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-charcoal/75 mb-1">व्यवसायाचे नाव / प्रकार <span className="text-red-500">*</span></label>
                          <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} placeholder="उदा. किराणा स्टोअर्स, हॉटेल" className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${errors.companyName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'}`} />
                          {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-charcoal/75 mb-1">वार्षिक उत्पन्न <span className="text-red-500">*</span></label>
                          <input type="text" name="annualIncome" value={formData.annualIncome} onChange={handleInputChange} placeholder="उदा. ₹५,००,०००" className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${errors.annualIncome ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'}`} />
                          {errors.annualIncome && <p className="text-red-500 text-xs mt-1">{errors.annualIncome}</p>}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* STEP 4: कुटुंबाची माहिती */}
              {currentStep === 4 && (
                <div className="space-y-4 animate-fade-in">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-charcoal/75 mb-1">वडिलांचे नाव <span className="text-red-500">*</span></label>
                      <input type="text" name="fatherName" value={formData.fatherName} onChange={handleInputChange} placeholder="वडिलांचे पूर्ण नाव" className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${errors.fatherName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'}`} />
                      {errors.fatherName && <p className="text-red-500 text-xs mt-1">{errors.fatherName}</p>}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-charcoal/75 mb-1">वडिलांचा व्यवसाय <span className="text-red-500">*</span></label>
                      <select name="fatherOccupation" value={formData.fatherOccupation} onChange={handleInputChange} className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-white transition-all ${errors.fatherOccupation ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'}`}>
                        <option value="">-- व्यवसाय निवडा --</option>
                        <option value="private_job">खाजगी नोकरी (Private Job)</option>
                        <option value="gov_job">शासकीय नोकरी (Government Job)</option>
                        <option value="business">व्यवसाय (Business)</option>
                        <option value="retired">निवृत्त (Retired)</option>
                        <option value="not_working">काम करत नाही</option>
                      </select>
                      {errors.fatherOccupation && <p className="text-red-500 text-xs mt-1">{errors.fatherOccupation}</p>}
                    </div>

                    {(formData.fatherOccupation === 'private_job' || formData.fatherOccupation === 'gov_job') && (
                      <>
                        <div>
                          <label className="block text-xs font-bold text-charcoal/75 mb-1">वडिलांचे पद / Designation <span className="text-red-500">*</span></label>
                          <input type="text" name="fatherDesignation" value={formData.fatherDesignation} onChange={handleInputChange} placeholder="उदा. मॅनेजर, अधिकारी" className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${errors.fatherDesignation ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'}`} />
                          {errors.fatherDesignation && <p className="text-red-500 text-xs mt-1">{errors.fatherDesignation}</p>}
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-charcoal/75 mb-1">कंपनी / कार्यालयाचे नाव <span className="text-red-500">*</span></label>
                          <input type="text" name="fatherCompanyName" value={formData.fatherCompanyName} onChange={handleInputChange} placeholder="उदा. MSEB, सरकारी कार्यालय" className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${errors.fatherCompanyName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'}`} />
                          {errors.fatherCompanyName && <p className="text-red-500 text-xs mt-1">{errors.fatherCompanyName}</p>}
                        </div>
                      </>
                    )}

                    {formData.fatherOccupation === 'business' && (
                      <div>
                        <label className="block text-xs font-bold text-charcoal/75 mb-1">व्यवसायाचे नाव / प्रकार <span className="text-red-500">*</span></label>
                        <input type="text" name="fatherCompanyName" value={formData.fatherCompanyName} onChange={handleInputChange} placeholder="उदा. शेती, दुकान, व्यापार" className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${errors.fatherCompanyName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'}`} />
                        {errors.fatherCompanyName && <p className="text-red-500 text-xs mt-1">{errors.fatherCompanyName}</p>}
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-charcoal/75 mb-1">आईचे नाव <span className="text-red-500">*</span></label>
                      <input type="text" name="motherName" value={formData.motherName} onChange={handleInputChange} placeholder="आईचे पूर्ण नाव" className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${errors.motherName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'}`} />
                      {errors.motherName && <p className="text-red-500 text-xs mt-1">{errors.motherName}</p>}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 5: फोटो अपलोड */}
              {currentStep === 5 && (
                <div className="space-y-4 animate-fade-in text-center">
                  <div className="p-6 border-2 border-dashed border-saffron/40 rounded-2xl bg-saffron/5">
                    {mainPhotoPreview ? (
                      <div className="space-y-3">
                        <img src={mainPhotoPreview} alt="Preview" className="w-40 h-40 aspect-square object-cover rounded-xl mx-auto shadow-md border-2 border-saffron/20" />
                        <button type="button" onClick={() => { setMainPhotoPreview(null); setFormData((prev: any) => ({ ...prev, mainPhotoUploaded: false })); }} className="text-xs font-semibold text-red-600 hover:underline">
                          फोटो बदला
                        </button>
                      </div>
                    ) : (
                      <ImagePlaceholder aspectRatio="aspect-square" label="मुख्य फोटो अपलोड करा (*)" onFileSelect={handleMainPhotoSelect} forceInteractive={true} className="max-w-[260px] mx-auto" />
                    )}
                  </div>
                  {errors.mainPhotoUploaded && <p className="text-red-500 text-xs">{errors.mainPhotoUploaded}</p>}
                </div>
              )}

              {/* STEP 6: पेमेंट (₹५००) */}
              {currentStep === 6 && (
                <div className="space-y-6 animate-fade-in">
                  {paymentMode !== 'Cash' && (
                    <>
                      {/* 1. QR Code Scanning & Clickable UPI Link Card (Same design as Member Registration) */}
                      <div className="bg-white border border-charcoal/15 rounded-2xl p-5 md:p-6 shadow-xs space-y-4 text-center">
                        <div className="flex items-center gap-3 text-left">
                          <div className="p-2.5 bg-amber-50 rounded-xl text-saffron border border-saffron/10">
                            <QrCode className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-saffron" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                              QR कोड स्कॅन करून किंवा UPI ने पेमेंट करा
                            </h3>
                            <p className="text-xs text-charcoal/60">GPay, PhonePe, Paytm किंवा कोणत्याही UPI ॲपने पेमेंट करा</p>
                          </div>
                        </div>

                        {/* Amount Read-Only Badge */}
                        <div className="inline-block bg-saffron text-white font-bold text-sm px-6 py-1.5 rounded-full shadow-xs">
                          भराव्याची रक्कम: ₹५००
                        </div>

                        {/* Live QR Code Display Container */}
                        <div className="relative max-w-[240px] mx-auto p-4 bg-white rounded-2xl border-2 border-saffron/20 shadow-md flex flex-col items-center justify-center">
                          {paymentQrSettings?.qrImageUrl ? (
                            <img
                              src={imageUrl(paymentQrSettings.qrImageUrl)}
                              alt="Payment QR Code"
                              className="w-48 h-48 object-contain rounded-xl"
                            />
                          ) : (
                            <div className="p-2 bg-white rounded-xl shadow-inner border border-charcoal/10 flex flex-col items-center justify-center">
                              <QRCodeSVG value={upiPayLink} size={180} includeMargin={true} />
                            </div>
                          )}
                        </div>

                        {/* UPI Details & Clickable "येथे क्लिक करून UPI ने पैसे भरा" Deep Link */}
                        <div className="space-y-3 pt-2 flex flex-col items-center">
                          <p className="text-xs font-bold text-charcoal/90">
                            संस्थेचा UPI आयडी: <span className="font-mono text-saffron selection:bg-amber-100">{paymentQrSettings?.upiId || '9823456789@upi'}</span>
                          </p>
                          {(paymentQrSettings?.payeeName || 'दापोली मंडणगड सेवाभावी संस्था, पुणे') && (
                            <p className="text-[11px] text-charcoal/60 font-semibold">
                              पेई नाव: {paymentQrSettings?.payeeName || 'दापोली मंडणगड सेवाभावी संस्था, पुणे'}
                            </p>
                          )}

                          {/* Clickable Live UPI Link/Button */}
                          <a
                            href={upiPayLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="upi-pay-link inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs md:text-sm rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform active:scale-95 cursor-pointer"
                          >
                            <Smartphone size={16} />
                            <span>येथे क्लिक करून UPI ने पैसे भरा</span>
                          </a>
                        </div>
                      </div>

                      {/* 2. पेमेंट स्क्रीनशॉट अपलोड section (Same design as Member Registration) */}
                      <div className="bg-white border-2 border-saffron/40 rounded-2xl p-5 md:p-6 shadow-md space-y-4">
                        <div className="flex items-center gap-3">
                          <div>
                            <h3 className="text-base font-bold text-saffron" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                              पेमेंट स्क्रीनशॉट <span className="text-red-500">*</span>
                            </h3>
                            <p className="text-xs text-charcoal/60">पेमेंट पूर्ण झाल्यावर कृपया त्याचा स्क्रीनशॉट येथे अपलोड करा</p>
                          </div>
                        </div>

                        <div className="pt-2">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                            <input
                              type="file"
                              id="marriage-payment-screenshot-input"
                              accept="image/png, image/jpeg, image/jpg"
                              onChange={handleScreenshotChange}
                              className="hidden"
                            />
                            <button
                              type="button"
                              onClick={() => document.getElementById('marriage-payment-screenshot-input')?.click()}
                              className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-saffron/20 hover:border-saffron text-saffron rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
                            >
                              <Upload size={16} />
                              <span>
                                {screenshotFile
                                  ? 'स्क्रीनशॉट बदलू शकता'
                                  : 'स्क्रीनशॉट निवडा'}
                              </span>
                            </button>
                            {screenshotFile && (
                              <span className="text-xs font-semibold text-emerald-700 truncate max-w-[280px]">
                                ✓ {screenshotFile.name}
                              </span>
                            )}
                          </div>

                          {screenshotPreview && (
                            <div className="mt-4 relative w-32 h-32 rounded-xl overflow-hidden border-2 border-saffron shadow-sm group">
                              <img src={screenshotPreview} alt="Screenshot Preview" className="w-full h-full object-cover" />
                              <div className="absolute top-1.5 right-1.5 flex gap-1.5 z-10">
                                <button
                                  type="button"
                                  onClick={() => document.getElementById('marriage-payment-screenshot-input')?.click()}
                                  className="p-1.5 bg-white/90 hover:bg-white text-saffron rounded-full shadow-md transition-all duration-200 hover:scale-105"
                                  title="स्क्रीनशॉट बदला"
                                >
                                  <Pencil size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setScreenshotFile(null);
                                    setScreenshotPreview(null);
                                    const input = document.getElementById('marriage-payment-screenshot-input') as HTMLInputElement;
                                    if (input) input.value = '';
                                  }}
                                  className="p-1.5 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-md transition-all duration-200 hover:scale-105"
                                  title="स्क्रीनशॉट हटवा"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {errors.screenshot && (
                          <p className="text-red-500 text-xs mt-1 font-bold">{errors.screenshot}</p>
                        )}
                      </div>
                    </>
                  )}

                  {/* 3. Admin Mode Selection (After Online Payment & Screenshot) */}
                  {isAdmin && (
                    <div className="p-5 bg-amber-50/90 rounded-2xl border border-amber-200 shadow-xs space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="px-2 py-0.5 bg-amber-200/80 rounded-md text-amber-900 font-bold text-xs uppercase tracking-wider">
                          एडमिन पर्याय
                        </div>
                        <label className="text-sm font-bold text-amber-950">
                          पेमेंट मोड निवड (Payment Mode Selection):
                        </label>
                      </div>
                      <div className="flex items-center gap-6 pt-1">
                        <label className="flex items-center gap-2 text-sm font-bold text-charcoal cursor-pointer">
                          <input
                            type="radio"
                            name="adminPayMode"
                            value="Online"
                            checked={paymentMode !== 'Cash'}
                            onChange={() => setPaymentMode('GPay')}
                            className="w-4 h-4 text-saffron focus:ring-saffron"
                          />
                          Online Payment
                        </label>
                        <label className="flex items-center gap-2 text-sm font-bold text-charcoal cursor-pointer">
                          <input
                            type="radio"
                            name="adminPayMode"
                            value="Cash"
                            checked={paymentMode === 'Cash'}
                            onChange={() => {
                              setPaymentMode('Cash');
                              if (!cashAmountReceived) {
                                setCashAmountReceived('500');
                              }
                            }}
                            className="w-4 h-4 text-saffron focus:ring-saffron"
                          />
                          Cash Payment
                        </label>
                      </div>

                      {paymentMode === 'Cash' && (
                        <div className="pt-2 border-t border-amber-200/60 space-y-2">
                          <label className="block text-xs font-bold text-charcoal">
                            जमा झालेली नकद रक्कम (Amount Received in Cash) <span className="text-red-500">*</span>:
                          </label>
                          <div className="flex items-center gap-3">
                            <span className="text-base font-bold text-charcoal/70">₹</span>
                            <input
                              type="number"
                              min="1"
                              placeholder="रक्कम प्रविष्ट करा"
                              value={cashAmountReceived || '500'}
                              onChange={(e) => setCashAmountReceived(e.target.value)}
                              className="w-full max-w-xs px-3.5 py-2 border border-gray-300 rounded-xl text-sm font-bold text-emerald-700 bg-white focus:outline-none focus:ring-2 focus:ring-saffron"
                            />
                          </div>
                          <p className="text-[11px] text-charcoal/60">
                            * कार्यालयात रोख (Cash) जमा झाल्यास प्रत्यक्ष मिळालेली रक्कम येथे टाका.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* STEP 7: पुष्टीकरण व पुनरावलोकन */}
              {currentStep === 7 && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-cream/30 border border-saffron/20 rounded-card-lg p-5 md:p-6 space-y-6 shadow-xs">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-saffron/15 pb-4 gap-4">
                      <div>
                        <h3 className="text-base font-bold text-saffron" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                          विवाह नोंदणी अर्जाचे अंतिम पुनरावलोकन (Preview Form)
                        </h3>
                        <p className="text-xs text-charcoal/60">कृपया सबमिट करण्यापूर्वी भरलेली सर्व माहिती तपासून घ्या</p>
                      </div>
                      {mainPhotoPreview && (
                        <div className="w-24 h-24 aspect-square shrink-0 rounded-xl overflow-hidden border-2 border-saffron/30 shadow-xs">
                          <img src={mainPhotoPreview} alt="Profile Preview" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>

                    {/* १. वैयक्तिक माहिती */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-saffron-dark uppercase tracking-wider border-b border-saffron/10 pb-1">
                        १. वैयक्तिक माहिती (Personal Details)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div><span className="text-charcoal/60 font-medium block">नोंदणी प्रकार:</span> <span className="font-bold text-saffron">{profileType === 'bride' ? 'वधू (Bride)' : 'वर (Groom)'}</span></div>
                        <div><span className="text-charcoal/60 font-medium block">पूर्ण नाव:</span> <span className="font-bold text-charcoal">{formData.fullName || '-'}</span></div>
                        <div><span className="text-charcoal/60 font-medium block">जन्म तारीख:</span> <span className="font-bold text-charcoal">{formData.birthDate || '-'}</span></div>
                        <div><span className="text-charcoal/60 font-medium block">उंची:</span> <span className="font-bold text-charcoal">{formData.height || '-'}</span></div>
                        <div><span className="text-charcoal/60 font-medium block">रक्तगट:</span> <span className="font-bold text-charcoal">{selectedBloodLabel || '-'}</span></div>
                        <div><span className="text-charcoal/60 font-medium block">वैवाहिक स्थिती:</span> <span className="font-bold text-charcoal">{selectedMaritalLabel || '-'}</span></div>
                        <div><span className="text-charcoal/60 font-medium block">धर्म व जात:</span> <span className="font-bold text-charcoal">{formData.religion ? `${formData.religion} - ${formData.caste}` : '-'}</span></div>
                        {formData.gotra && <div><span className="text-charcoal/60 font-medium block">गोत्र:</span> <span className="font-bold text-charcoal">{formData.gotra}</span></div>}
                        <div><span className="text-charcoal/60 font-medium block">मंगळ:</span> <span className="font-bold text-charcoal">{formData.manglik === 'yes' ? 'होय' : formData.manglik === 'no' ? 'नाही' : 'माहित नाही'}</span></div>
                        <div><span className="text-charcoal/60 font-medium block">राज्य:</span> <span className="font-bold text-charcoal">{selectedState?.nameMr || selectedState?.nameEn || '-'}</span></div>
                        <div><span className="text-charcoal/60 font-medium block">जिल्हा:</span> <span className="font-bold text-charcoal">{selectedDistrict?.nameMr || selectedDistrict?.nameEn || '-'}</span></div>
                        <div><span className="text-charcoal/60 font-medium block">शहर / गाव:</span> <span className="font-bold text-charcoal">{formData.city || '-'}</span></div>
                        <div><span className="text-charcoal/60 font-medium block">मोबाईल नं.:</span> <span className="font-bold text-charcoal">{formData.mobile || '-'}</span></div>
                        <div><span className="text-charcoal/60 font-medium block">पालकांचा मोबाईल:</span> <span className="font-bold text-charcoal">{formData.parentMobile || '-'}</span></div>
                        {formData.email && <div><span className="text-charcoal/60 font-medium block">ईमेल:</span> <span className="font-bold text-charcoal">{formData.email}</span></div>}
                        <div className="sm:col-span-2 md:col-span-3"><span className="text-charcoal/60 font-medium block">स्वतःबद्दल:</span> <span className="font-semibold text-charcoal">{formData.aboutSelf || '-'}</span></div>
                        <div className="sm:col-span-2 md:col-span-3"><span className="text-charcoal/60 font-medium block">अपेक्षित जोडीदाराविषयी:</span> <span className="font-semibold text-charcoal">{formData.expectations || '-'}</span></div>
                      </div>
                    </div>

                    {/* २. शैक्षणिक माहिती */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-saffron-dark uppercase tracking-wider border-b border-saffron/10 pb-1">
                        २. शैक्षणिक माहिती (Educational Details)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div><span className="text-charcoal/60 font-medium block">शिक्षण पातळी:</span> <span className="font-bold text-charcoal">{formData.educationLevel || '-'}</span></div>
                        <div><span className="text-charcoal/60 font-medium block">पदवी नाव:</span> <span className="font-bold text-charcoal">{formData.degreeName || '-'}</span></div>
                        <div><span className="text-charcoal/60 font-medium block">उत्तीर्ण वर्ष:</span> <span className="font-bold text-charcoal">{formData.passingYear || '-'}</span></div>
                      </div>
                    </div>

                    {/* ३. व्यावसायिक माहिती */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-saffron-dark uppercase tracking-wider border-b border-saffron/10 pb-1">
                        ३. व्यावसायिक माहिती (Professional Details)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-charcoal/60 font-medium block">नोकरी / व्यवसाय प्रकार:</span>
                          <span className="font-bold text-charcoal">
                            {formData.occupationType === 'private_job' ? 'खाजगी नोकरी (Private Job)'
                              : formData.occupationType === 'gov_job' ? 'शासकीय नोकरी (Government Job)'
                                : formData.occupationType === 'business' ? 'व्यवसाय (Business)'
                                  : formData.occupationType === 'not_working' ? 'काम करत नाही'
                                    : formData.occupationType || '-'}
                          </span>
                        </div>
                        {formData.designation && <div><span className="text-charcoal/60 font-medium block">पद / Designation:</span> <span className="font-bold text-charcoal">{formData.designation}</span></div>}
                        {formData.companyName && <div><span className="text-charcoal/60 font-medium block">कंपनी / कार्यालयाचे नाव:</span> <span className="font-bold text-charcoal">{formData.companyName}</span></div>}
                        {formData.annualIncome && <div><span className="text-charcoal/60 font-medium block">वार्षिक उत्पन्न:</span> <span className="font-bold text-charcoal">{formData.annualIncome}</span></div>}
                      </div>
                    </div>

                    {/* ४. कुटुंबाची माहिती */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-saffron-dark uppercase tracking-wider border-b border-saffron/10 pb-1">
                        ४. कुटुंबाची माहिती (Family Details)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div><span className="text-charcoal/60 font-medium block">वडिलांचे नाव:</span> <span className="font-bold text-charcoal">{formData.fatherName || '-'}</span></div>
                        <div>
                          <span className="text-charcoal/60 font-medium block">वडिलांचा व्यवसाय:</span>
                          <span className="font-bold text-charcoal">
                            {formData.fatherOccupation === 'private_job' ? 'खाजगी नोकरी (Private Job)'
                              : formData.fatherOccupation === 'gov_job' ? 'शासकीय नोकरी (Government Job)'
                                : formData.fatherOccupation === 'business' ? 'व्यवसाय (Business)'
                                  : formData.fatherOccupation === 'retired' ? 'निवृत्त (Retired)'
                                    : formData.fatherOccupation === 'not_working' ? 'काम करत नाही'
                                      : formData.fatherOccupation || '-'}
                          </span>
                        </div>
                        {formData.fatherDesignation && <div><span className="text-charcoal/60 font-medium block">वडिलांचे पद:</span> <span className="font-bold text-charcoal">{formData.fatherDesignation}</span></div>}
                        {formData.fatherCompanyName && <div><span className="text-charcoal/60 font-medium block">कंपनी / व्यवसाय नाव:</span> <span className="font-bold text-charcoal">{formData.fatherCompanyName}</span></div>}
                        <div><span className="text-charcoal/60 font-medium block">आईचे नाव:</span> <span className="font-bold text-charcoal">{formData.motherName || '-'}</span></div>
                      </div>
                    </div>

                    {/* ५. पेमेंट माहिती */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-saffron-dark uppercase tracking-wider border-b border-saffron/10 pb-1">
                        ५. पेमेंट माहिती (Payment Details)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div><span className="text-charcoal/60 font-medium block">नोंदणी शुल्क:</span> <span className="font-bold text-saffron">₹५०० ({paymentMode})</span></div>
                        {screenshotPreview && (
                          <div>
                            <span className="text-charcoal/60 font-medium block mb-1">स्क्रीनशॉट:</span>
                            <img src={screenshotPreview} alt="Screenshot" className="w-16 h-16 aspect-square object-cover rounded-lg border border-saffron/30" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>


                  <div className="flex items-start gap-2 pt-2">
                    <input type="checkbox" id="declaration" name="declaration" checked={formData.declaration} onChange={handleCheckboxChange} className="w-4 h-4 text-saffron focus:ring-saffron mt-0.5 cursor-pointer" />
                    <label htmlFor="declaration" className="text-xs text-charcoal/80 cursor-pointer select-none">
                      मी याद्वारे घोषित करतो/करते की मी विवाह नोंदणी अर्जामध्ये भरलेली सर्व वैयक्तिक माहिती सत्य आणि अचूक आहे.
                    </label>
                  </div>
                  {errors.declaration && <p className="text-red-500 text-xs font-bold">{errors.declaration}</p>}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-6 border-t border-saffron/10">
                {currentStep > 1 ? (
                  <button type="button" onClick={handlePrev} className="px-5 py-2.5 rounded-xl border border-saffron/30 text-saffron hover:text-saffron-dark hover:bg-saffron/5 font-bold text-sm shadow-xs transition-all duration-300 flex items-center gap-1.5 cursor-pointer">
                    <ArrowLeft size={16} /> मागे
                  </button>
                ) : <div />}

                {currentStep < 7 ? (
                  <button type="submit" className="px-6 py-2.5 rounded-xl bg-saffron text-white text-sm font-bold shadow-md hover:bg-saffron-dark flex items-center gap-1.5 cursor-pointer">
                    पुढील पायरी <ArrowRight size={16} />
                  </button>
                ) : (
                  <button type="button" onClick={handleSubmitFinal} disabled={isSubmitting} className="px-8 py-2.5 rounded-xl bg-saffron hover:bg-saffron-dark text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer">
                    {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                    नोंदणी पूर्ण करा (Submit)
                  </button>
                )}
              </div>

            </form>
          )}
        </div>
      </section>

      {/* Official Form Preview Modal (पूर्वावलोकन Modal) */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl border border-saffron/20 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-cream border-b border-saffron/20">
              <div className="flex items-center gap-2">
                <FileText className="text-saffron-dark" size={20} />
                <h3 className="font-bold text-saffron-dark text-sm sm:text-base" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                  अधिकृत विवाह नोंदणी अर्ज पूर्वावलोकन (Official Form Preview)
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-3 py-1.5 bg-charcoal/80 hover:bg-charcoal text-white rounded-lg font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  title="प्रिंट करा"
                >
                  <Printer size={14} /> प्रिंट
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPdf}
                  className="px-3 py-1.5 bg-saffron hover:bg-saffron-dark text-white rounded-lg font-bold text-xs shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  title="PDF डाऊनलोड"
                >
                  <Download size={14} /> PDF
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 hover:bg-black/5 text-charcoal/70 hover:text-charcoal rounded-lg transition-colors cursor-pointer"
                  title="बंद करा"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Modal Body - Scrollable Form Content */}
            <div className="p-4 sm:p-6 overflow-y-auto bg-gray-50/50">
              <div className="w-full max-w-3xl mx-auto text-left border-2 border-saffron/30 rounded-2xl p-6 sm:p-8 bg-white shadow-sm space-y-5">
                {/* Header */}
                <div className="border-b-2 border-saffron/30 pb-4 text-center relative">
                  <p className="text-[11px] font-bold text-saffron tracking-widest uppercase mb-0.5">॥ जनसेवा हीच ईश्वरसेवा ॥</p>
                  <h3 className="text-xl sm:text-2xl font-black text-saffron-dark leading-tight" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                    दापोली मंडणगड सेवाभावी संस्था, पुणे
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-charcoal/80 mt-0.5">
                    वधू-वर सूचक केंद्र • अधिकृत नोंदणी अर्ज (Official Marriage Registration Form)
                  </p>
                  <p className="text-[10px] text-charcoal/60 mt-0.5">
                    नोंदणी कार्यालय: पुणे, महाराष्ट्र • संपर्क: ९८२३४५६७८९ / dmsanstha@gmail.com
                  </p>

                  {/* Metadata Bar */}
                  <div className="mt-3 pt-2.5 border-t border-dashed border-saffron/20 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
                    <div className="flex items-center gap-1.5 bg-cream/60 px-3 py-1 rounded-md border border-saffron/20">
                      <span className="text-charcoal/70">नोंदणी क्रमांक:</span>
                      <span className="font-mono font-bold text-saffron-dark">MARRIAGE-{registeredId || 'NEW'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-cream/60 px-3 py-1 rounded-md border border-saffron/20">
                      <span className="text-charcoal/70">नोंदणी प्रकार:</span>
                      <span className="font-bold text-saffron-dark">{profileType === 'bride' ? 'वधू (Bride)' : 'वर (Groom)'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-cream/60 px-3 py-1 rounded-md border border-saffron/20">
                      <span className="text-charcoal/70">दिनांक:</span>
                      <span className="font-bold text-charcoal">{todayDate}</span>
                    </div>
                  </div>

                  {/* Photo */}
                  {mainPhotoPreview ? (
                    <div className="mt-3 sm:mt-0 sm:absolute top-1 right-1 flex flex-col items-center">
                      <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-lg overflow-hidden border-2 border-saffron/40 shadow-xs bg-cream/30">
                        <img src={mainPhotoPreview} alt="Applicant" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[9px] font-medium text-charcoal/60 mt-0.5">अर्जदार छायाचित्र</span>
                    </div>
                  ) : (
                    <div className="mt-3 sm:mt-0 sm:absolute top-1 right-1 flex flex-col items-center">
                      <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-lg border-2 border-dashed border-saffron/30 flex flex-col items-center justify-center bg-cream/20 text-charcoal/40 text-[10px]">
                        <span>पासपोर्ट फोटो</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 1 */}
                <div className="space-y-2">
                  <div className="bg-saffron/10 px-3 py-1 rounded border-l-4 border-saffron">
                    <h4 className="text-xs sm:text-sm font-bold text-saffron-dark">१. वैयक्तिक माहिती (Personal Details)</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">पूर्ण नाव:</span> <span className="font-bold text-charcoal">{formData.fullName || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">जन्म तारीख / वय:</span> <span className="font-bold text-charcoal">{formData.birthDate || '-'} {formData.birthDate ? `(${calculateAge(formData.birthDate)} वर्षे)` : ''}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">उंची & रक्तगट:</span> <span className="font-bold text-charcoal">{formData.height || '-'} / {selectedBloodLabel || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">वैवाहिक स्थिती:</span> <span className="font-bold text-charcoal">{selectedMaritalLabel || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">धर्म व जात:</span> <span className="font-bold text-charcoal">{formData.religion ? `${formData.religion} - ${formData.caste || ''}` : '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">गोत्र & मंगळ:</span> <span className="font-bold text-charcoal">{formData.gotra || '-'} / {formData.manglik === 'yes' ? 'मंगळ आहे' : formData.manglik === 'no' ? 'मंगळ नाही' : 'माहित नाही'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">संपर्क मोबाईल:</span> <span className="font-bold text-charcoal">{formData.mobile || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">पालकांचा मोबाईल:</span> <span className="font-bold text-charcoal">{formData.parentMobile || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">ईमेल:</span> <span className="font-bold text-charcoal">{formData.email || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15 sm:col-span-2 md:col-span-3"><span className="text-charcoal/60 block text-[11px]">पत्ता (शहर/जिल्हा/राज्य):</span> <span className="font-bold text-charcoal">{formData.city ? `${formData.city}, ` : ''}{selectedDistrict?.nameMr || selectedDistrict?.nameEn || ''}, {selectedState?.nameMr || selectedState?.nameEn || ''}</span></div>
                    {formData.aboutSelf && (
                      <div className="p-2 bg-cream/20 rounded border border-saffron/15 sm:col-span-2 md:col-span-3"><span className="text-charcoal/60 block text-[11px]">स्वतःबद्दल थोडक्यात:</span> <span className="font-medium text-charcoal">{formData.aboutSelf}</span></div>
                    )}
                    {formData.expectations && (
                      <div className="p-2 bg-cream/20 rounded border border-saffron/15 sm:col-span-2 md:col-span-3"><span className="text-charcoal/60 block text-[11px]">अपेक्षित जोडीदाराविषयी:</span> <span className="font-medium text-charcoal">{formData.expectations}</span></div>
                    )}
                  </div>
                </div>

                {/* Section 2 */}
                <div className="space-y-2">
                  <div className="bg-saffron/10 px-3 py-1 rounded border-l-4 border-saffron">
                    <h4 className="text-xs sm:text-sm font-bold text-saffron-dark">२. शैक्षणिक माहिती (Educational Details)</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">शिक्षण पातळी:</span> <span className="font-bold text-charcoal">{getEducationLabel(formData.educationLevel)}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">पदवी नाव:</span> <span className="font-bold text-charcoal">{formData.degreeName || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">शाळा / कॉलेज:</span> <span className="font-bold text-charcoal">{formData.schoolCollege || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">उत्तीर्ण वर्ष:</span> <span className="font-bold text-charcoal">{formData.passingYear || '-'}</span></div>
                  </div>
                </div>

                {/* Section 3 */}
                <div className="space-y-2">
                  <div className="bg-saffron/10 px-3 py-1 rounded border-l-4 border-saffron">
                    <h4 className="text-xs sm:text-sm font-bold text-saffron-dark">३. व्यावसायिक माहिती (Professional Details)</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">व्यवसाय प्रकार:</span> <span className="font-bold text-charcoal">{getOccupationLabel(formData.occupationType)}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">पद / Designation:</span> <span className="font-bold text-charcoal">{formData.designation || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">कंपनी / कार्यालयाचे नाव:</span> <span className="font-bold text-charcoal">{formData.companyName || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">वार्षिक उत्पन्न:</span> <span className="font-bold text-charcoal">{formData.annualIncome || '-'}</span></div>
                  </div>
                </div>

                {/* Section 4 */}
                <div className="space-y-2">
                  <div className="bg-saffron/10 px-3 py-1 rounded border-l-4 border-saffron">
                    <h4 className="text-xs sm:text-sm font-bold text-saffron-dark">४. कौटुंबिक माहिती (Family Details)</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">वडिलांचे नाव:</span> <span className="font-bold text-charcoal">{formData.fatherName || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15 sm:col-span-2"><span className="text-charcoal/60 block text-[11px]">वडिलांचा व्यवसाय व पद:</span> <span className="font-bold text-charcoal">{getFatherOccupationLabel(formData.fatherOccupation)}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">आईचे नाव:</span> <span className="font-bold text-charcoal">{formData.motherName || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">भावंडे:</span> <span className="font-bold text-charcoal">{formData.brothers || '0'} भाऊ, {formData.sisters || '0'} बहीण</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">कौटुंबिक पार्श्वभूमी:</span> <span className="font-bold text-charcoal">{formData.familyBackground || '-'}</span></div>
                  </div>
                </div>

                {/* Section 5 */}
                <div className="space-y-2">
                  <div className="bg-saffron/10 px-3 py-1 rounded border-l-4 border-saffron">
                    <h4 className="text-xs sm:text-sm font-bold text-saffron-dark">५. नोंदणी व शुल्क तपशील (Registration & Fee)</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">नोंदणी शुल्क:</span> <span className="font-bold text-saffron-dark">₹५०० ({paymentMode})</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">नोंदणी स्थिती:</span> <span className="font-bold text-emerald-700">नोंदणी पूर्ण (यशस्वी)</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">घोषणा पुष्टीकरण:</span> <span className="font-semibold text-charcoal">माहिती सत्य व अचूक आहे.</span></div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="pt-6 mt-4 border-t-2 border-dashed border-saffron/30 grid grid-cols-2 gap-6 text-center text-xs">
                  <div className="space-y-10">
                    <div className="h-8" />
                    <div className="border-t border-charcoal/50 pt-1 font-bold text-charcoal">
                      अर्जदाराची स्वाक्षरी (Applicant's Signature)
                    </div>
                  </div>
                  <div className="space-y-10">
                    <div className="h-8" />
                    <div className="border-t border-charcoal/50 pt-1 font-bold text-saffron-dark">
                      अधिकृत संस्था प्रतिनिधी स्वाक्षरी व शिक्का
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 bg-cream/50 border-t border-saffron/10 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-5 py-2 bg-charcoal/10 hover:bg-charcoal/20 text-charcoal font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                बंद करा (Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Declaration Square Box Modal Alert */}
      {showDeclarationBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl border-2 border-saffron shadow-2xl p-6 max-w-sm w-full text-center relative flex flex-col items-center gap-4 animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-600 shadow-inner">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-charcoal">सूचना</h3>
              <p className="text-sm font-medium text-charcoal/80 leading-relaxed">
                {declarationMsg}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setShowDeclarationBanner(false)}
              className="mt-2 w-full py-2.5 px-6 rounded-xl bg-saffron hover:bg-saffron-dark text-white font-bold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer"
            >
              ठीक आहे (OK)
            </button>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        state={confirmState}
        onClose={closeConfirm}
      />

    </div>
  );
};

export default MarriageRegistrationPage;
