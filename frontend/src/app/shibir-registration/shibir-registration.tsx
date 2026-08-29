import React, { useState, useEffect } from 'react';
import StepIndicator from '../../components/StepIndicator';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import ConfirmModal, { type ConfirmState } from '../../components/ConfirmModal';
import {
  ArrowLeft, ArrowRight, CheckCircle2, Upload, Loader2, CreditCard,
  Calendar, MapPin, User, Printer, ShieldCheck, Pencil, Trash2,
  Lock, QrCode, Smartphone, Plus, X, Download, Eye, RotateCcw, FileText
} from 'lucide-react';
import { api, BASE_URL, type State, type District, type Taluka, type City, type PaymentSettingResponse, type ShibirMaster } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { uploadImage, deleteImage, fetchByCategory, imageUrl, type GalleryImage } from '../../services/galleryApi';
import { QRCodeSVG } from 'qrcode.react';
import { saveDraft, loadDraft, clearDraft } from '../../utils/formPersistence';
import { validateShibirForm, type ShibirFormErrors } from '../../utils/validations';
import { buildUpiLink } from '../../utils/upi';

const DRAFT_KEY = "shibir_reg_draft";

export const ShibirRegistrationPage: React.FC = () => {
  const localDraft = loadDraft<any>(DRAFT_KEY);

  const [currentStep, setCurrentStep] = useState<number>(() => localDraft?.currentStep ?? 1);
  const [errors, setErrors] = useState<ShibirFormErrors>({});

  // Shibir dropdown list
  const [shibirMasters, setShibirMasters] = useState<ShibirMaster[]>([]);

  // Lookup state
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [talukas, setTalukas] = useState<Taluka[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [shibirPlanAmount, setShibirPlanAmount] = useState<number>(200);

  const { isAdmin } = useAuth();
  const [bannerImage, setBannerImage] = useState<GalleryImage | null>(null);
  const BANNER_SECTION_KEY = 'shibir_registration_banner';

  // Photo
  const [, setPassportPhotoFile] = useState<File | null>(null);
  const [passportPhotoPreview, setPassportPhotoPreview] = useState<string | null>(() => localDraft?.passportPhotoPreview ?? null);

  // Payment State
  const [paymentQrSettings, setPaymentQrSettings] = useState<PaymentSettingResponse | null>(null);
  const [paymentMode, setPaymentMode] = useState<string>(() => localDraft?.paymentMode ?? (isAdmin ? 'Cash' : 'GPay'));
  const [cashAmountReceived, setCashAmountReceived] = useState<string>(() => localDraft?.cashAmountReceived ?? '0');
  const [upiTxnId] = useState<string>(() => localDraft?.upiTxnId ?? '');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(() => localDraft?.screenshotPreview ?? null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [registrationComplete, setRegistrationComplete] = useState<boolean>(() => localDraft?.registrationComplete ?? false);
  const [registeredId, setRegisteredId] = useState<number | null>(() => localDraft?.registeredId ?? null);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  // Admin QR Modal State
  const [showAdminQrModal, setShowAdminQrModal] = useState(false);
  const [adminUpiId, setAdminUpiId] = useState('');
  const [adminPayeeName, setAdminPayeeName] = useState('');
  const [adminQrFile, setAdminQrFile] = useState<File | null>(null);
  const [savingAdminQr, setSavingAdminQr] = useState(false);

  const [confirmState, setConfirmState] = useState<ConfirmState>({ open: false, message: '', onConfirm: () => { } });
  const closeConfirm = () => setConfirmState(prev => ({ ...prev, open: false }));
  const askConfirm = (message: string, onConfirm: () => void) => setConfirmState({ open: true, message, onConfirm });

  useEffect(() => {
    fetchByCategory('banner')
      .then(images => setBannerImage(images.find(img => img.sectionKey === BANNER_SECTION_KEY) ?? null))
      .catch(err => console.error('Error loading banner:', err));
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

  const openAdminQrModal = () => {
    setAdminUpiId(paymentQrSettings?.upiId || '');
    setAdminPayeeName(paymentQrSettings?.payeeName || '');
    setAdminQrFile(null);
    setShowAdminQrModal(true);
  };

  const handleSaveAdminQr = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAdminQr(true);
    try {
      const fd = new FormData();
      if (adminUpiId) fd.append('upiId', adminUpiId.trim());
      if (adminPayeeName) fd.append('payeeName', adminPayeeName.trim());
      if (adminQrFile) fd.append('file', adminQrFile);

      const updated = await api.updatePaymentQrSettings(fd);
      setPaymentQrSettings(updated);
      setShowAdminQrModal(false);
    } catch (err: any) {
      alert('QR माहिती साठवताना त्रुटी आली: ' + (err.message || err));
    } finally {
      setSavingAdminQr(false);
    }
  };

  const handleDeleteAdminQr = () => {
    askConfirm('QR कोड हटवायचा आहे का?', async () => {
      try {
        const updated = await api.deletePaymentQrSettings();
        setPaymentQrSettings(updated);
      } catch (err: any) {
        alert('QR कोड हटवताना त्रुटी आली: ' + (err.message || err));
      }
    });
  };

  // Form State
  const [formData, setFormData] = useState(() => {
    if (localDraft?.formData) return localDraft.formData;
    return {
      // Step 1: कार्यक्रमाची माहिती
      shibirName: '',
      shibirDate: '',
      shibirLocation: '',

      // Step 2: वैयक्तिक माहिती
      fullName: '',
      fullAddress: '',
      stateId: '',
      districtId: '',
      talukaId: '',
      cityVillage: '',
      occupation: '',
      education: '',
      birthDate: '',
      age: 0,
      mobile: '',
      relativeMobile: '',

      // Step 3: शिबिर संबंधित माहिती
      participatedEarlier: 'no',
      previousEventName: '',
      specialInfo: '',

      // Photo
      passportPhotoUploaded: false,

      // Declaration
      declaration: false,
    };
  });

  const calculateAge = (dobString: string): number => {
    if (!dobString) return 0;
    const parts = dobString.split('-');
    if (parts.length !== 3) return 0;
    const birthYear = parseInt(parts[0], 10);
    const birthMonth = parseInt(parts[1], 10);
    const birthDay = parseInt(parts[2], 10);
    if (isNaN(birthYear) || isNaN(birthMonth) || isNaN(birthDay)) return 0;

    const today = new Date();
    let age = today.getFullYear() - birthYear;
    const m = (today.getMonth() + 1) - birthMonth;
    if (m < 0 || (m === 0 && today.getDate() < birthDay)) {
      age--;
    }
    return age >= 0 ? age : 0;
  };

  // Calculate age automatically whenever birthDate changes
  useEffect(() => {
    if (!formData.birthDate) {
      setFormData((prev: any) => ({ ...prev, age: 0 }));
      return;
    }
    const computedAge = calculateAge(formData.birthDate);
    setFormData((prev: any) => ({ ...prev, age: computedAge }));
  }, [formData.birthDate]);

  // Load lookup data, cities, and shibir list on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [statesData, shibirList, qrSettings, citiesData, plansData] = await Promise.all([
          api.getStates(),
          api.getShibirMasters().catch(() => []),
          api.getPaymentQrSettings().catch(() => null),
          api.getCities().catch(() => []),
          api.getMembershipPlans().catch(() => []),
        ]);

        setStates(statesData);
        setShibirMasters(shibirList);
        setPaymentQrSettings(qrSettings);
        setCities(citiesData);

        const shibirPlan = plansData.find(p => p.planCode === 'shibir');
        if (shibirPlan) {
          setShibirPlanAmount(shibirPlan.amount);
        }

        // Pre-select Maharashtra if no state present yet
        const mh = statesData.find(s => s.nameEn === 'Maharashtra');
        if (!formData.stateId && mh) {
          api.getDistricts(mh.id).then(setDistricts).catch(console.error);
          setFormData((prev: any) => ({ ...prev, stateId: mh.id.toString() }));
        } else if (formData.stateId) {
          api.getDistricts(Number(formData.stateId)).then(setDistricts).catch(console.error);
        }

        if (formData.districtId) {
          api.getTalukas(Number(formData.districtId)).then(setTalukas).catch(console.error);
          api.getCities(Number(formData.districtId)).then(setCities).catch(console.error);
        }
      } catch (err) {
        console.error('Error loading lookups for Shibir registration:', err);
      }
    };
    loadData();
  }, []);

  // Save draft locally on state changes
  useEffect(() => {
    const draft = {
      formData,
      currentStep,
      passportPhotoPreview,
      paymentMode,
      cashAmountReceived,
      upiTxnId,
      screenshotPreview,
      registrationComplete,
      registeredId,
    };
    saveDraft(draft, DRAFT_KEY);
  }, [formData, currentStep, passportPhotoPreview, paymentMode, cashAmountReceived, upiTxnId, screenshotPreview, registrationComplete, registeredId]);

  const steps = [
    'कार्यक्रमाची माहिती',
    'वैयक्तिक माहिती',
    'शिबिर माहिती',
    'फोटो',
    'पेमेंट व पुष्टीकरण'
  ];

  const scrollToFormTop = () => {
    setTimeout(() => {
      const el = document.getElementById('shibir-form-container');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'mobile' || name === 'relativeMobile') {
      val = value.replace(/[^0-9]/g, '').slice(0, 10);
    }
    setFormData((prev: any) => ({ ...prev, [name]: val }));

    if (name === 'shibirName') {
      const selectedMaster = shibirMasters.find(s => s.shibirName === value);
      if (selectedMaster) {
        setFormData((prev: any) => ({
          ...prev,
          shibirName: value,
          shibirDate: selectedMaster.shibirDate || prev.shibirDate,
          shibirLocation: selectedMaster.shibirLocation || prev.shibirLocation,
        }));
      }
    }

    if (errors[name as keyof ShibirFormErrors]) {
      setErrors((prev: any) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateIdVal = e.target.value;
    setFormData((prev: any) => ({ ...prev, stateId: stateIdVal, districtId: '', talukaId: '' }));
    setDistricts([]);
    setTalukas([]);
    if (errors.stateId) setErrors((prev: any) => ({ ...prev, stateId: undefined }));
    if (stateIdVal) {
      try {
        const data = await api.getDistricts(Number(stateIdVal));
        setDistricts(data);
      } catch (err) {
        console.error('Error loading districts:', err);
      }
    }
  };

  const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtIdVal = e.target.value;
    setFormData((prev: any) => ({ ...prev, districtId: districtIdVal, talukaId: '', cityVillage: '' }));
    setTalukas([]);
    setCities([]);
    if (errors.districtId) setErrors((prev: any) => ({ ...prev, districtId: undefined }));
    if (districtIdVal) {
      try {
        const [tData, cData] = await Promise.all([
          api.getTalukas(Number(districtIdVal)),
          api.getCities(Number(districtIdVal))
        ]);
        setTalukas(tData);
        setCities(cData);
      } catch (err) {
        console.error('Error loading talukas/cities:', err);
      }
    } else {
      api.getCities().then(setCities).catch(console.error);
    }
  };

  const handlePassportPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        alert('फोटोचा आकार ३ MB पेक्षा जास्त नसावा.');
        return;
      }
      setPassportPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPassportPhotoPreview(reader.result as string);
        setFormData((prev: any) => ({ ...prev, passportPhotoUploaded: true }));
        if (errors.passportPhotoUploaded) {
          setErrors((prev: any) => ({ ...prev, passportPhotoUploaded: undefined }));
        }
      };
      reader.readAsDataURL(file);
    }
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

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    const { isValid, errors: stepErrors, firstErrorField } = validateShibirForm(formData, currentStep);
    if (!isValid) {
      setErrors(stepErrors);
      if (firstErrorField) {
        setTimeout(() => {
          const el = document.getElementsByName(firstErrorField)[0] || document.getElementById(firstErrorField);
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
      return;
    }
    setErrors({});
    if (currentStep < 5) {
      setCurrentStep(prev => prev + 1);
      scrollToFormTop();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      scrollToFormTop();
    }
  };

  const handleSubmitFinal = async () => {
    const { isValid, errors: stepErrors } = validateShibirForm(formData, 5);
    if (!isValid) {
      setErrors(stepErrors);
      return;
    }

    if (paymentMode !== 'Cash' && !screenshotPreview && !screenshotFile) {
      alert('कृपया पेमेंट स्क्रीनशॉट अपलोड करा.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        shibirName: formData.shibirName,
        shibirDate: formData.shibirDate || null,
        shibirLocation: formData.shibirLocation || null,
        fullName: formData.fullName,
        fullAddress: formData.fullAddress,
        state: { id: Number(formData.stateId) },
        district: { id: Number(formData.districtId) },
        taluka: { id: Number(formData.talukaId) },
        cityVillage: formData.cityVillage,
        occupation: formData.occupation || null,
        education: formData.education || null,
        birthDate: formData.birthDate,
        age: formData.age ? Number(formData.age) : null,
        mobile: formData.mobile,
        relativeMobile: formData.relativeMobile || null,
        participatedEarlier: formData.participatedEarlier === 'yes',
        previousEventName: formData.previousEventName || null,
        specialInfo: formData.specialInfo || null,
        passportPhotoUrl: passportPhotoPreview || null,
        paymentMode: paymentMode,
        amountPaid: paymentMode === 'Cash' ? Number(cashAmountReceived || 0) : shibirPlanAmount,
        upiTxnId: upiTxnId || null,
        screenshotUrl: screenshotPreview || null,
        paymentStatus: paymentMode === 'Cash' ? 'PAID' : 'SUBMITTED',
        approvalStatus: 'PENDING',
      };

      const saved = await api.registerShibir(payload);
      setRegisteredId(saved.id);

      try {
        const fd = new FormData();
        fd.append('registrationType', 'SHIBIR');
        fd.append('registrationId', saved.id.toString());
        fd.append('amount', paymentMode === 'Cash' ? (cashAmountReceived || shibirPlanAmount.toString()) : shibirPlanAmount.toString());
        fd.append('membershipType', 'shibir');
        fd.append('paymentMode', paymentMode);
        if (upiTxnId) fd.append('upiTxnId', upiTxnId);
        if (screenshotFile) fd.append('file', screenshotFile);

        await api.submitPayment(fd);
      } catch (payErr) {
        console.warn('Payment record save warning:', payErr);
      }

      setRegistrationComplete(true);
      clearDraft(DRAFT_KEY);
      scrollToFormTop();
    } catch (err: any) {
      alert('नोंदणी साठवताना त्रुटी आली: ' + (err.message || err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Shibir_Registration_SHIBIR_${registeredId || 'NEW'}_${formData.fullName || 'Form'}`;
    window.print();
    document.title = originalTitle;
  };

  // Download Shibir PDF directly on same screen
  const handleDownloadPdf = async () => {
    if (!registeredId) {
      handlePrint();
      return;
    }
    try {
      const downloadUrl = `${BASE_URL}/shibir-registration/form/${registeredId}/pdf`;
      const res = await fetch(downloadUrl);
      if (!res.ok) {
        throw new Error('PDF माहिती प्राप्त करण्यात त्रुटी आली.');
      }
      const blob = await res.blob();
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Shibir_Registration_SHIBIR_${registeredId}.pdf`;
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
      shibirName: '',
      shibirDate: '',
      shibirLocation: '',
      fullName: '',
      fullAddress: '',
      stateId: states.find(s => s.nameEn === 'Maharashtra')?.id.toString() || '',
      districtId: '',
      talukaId: '',
      cityVillage: '',
      occupation: '',
      education: '',
      birthDate: '',
      age: 0,
      mobile: '',
      relativeMobile: '',
      participatedEarlier: 'no',
      previousEventName: '',
      specialInfo: '',
      passportPhotoUploaded: false,
      declaration: false,
    });
    setPassportPhotoPreview(null);
    setPassportPhotoFile(null);
    setScreenshotPreview(null);
    setScreenshotFile(null);
    setPaymentMode(isAdmin ? 'Cash' : 'GPay');
    setCashAmountReceived('0');
    setRegisteredId(null);
    setErrors({});
    setShowPreviewModal(false);
    clearDraft(DRAFT_KEY);
    scrollToFormTop();
  };

  const selectedState = states.find(s => s.id === Number(formData.stateId));
  const selectedDistrict = districts.find(d => d.id === Number(formData.districtId));
  const selectedTaluka = talukas.find(t => t.id === Number(formData.talukaId));

  const upiIdVal = paymentQrSettings?.upiId || '9823456789@upi';
  const payeeNameVal = paymentQrSettings?.payeeName || 'दापोली मंडणगड सेवाभावी संस्था, पुणे';
  const upiPayLink = buildUpiLink(
    upiIdVal,
    payeeNameVal,
    shibirPlanAmount,
    `Shibir Registration - ${formData.fullName}`
  );

  const todayDate = new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-col w-full bg-[#FFF8F0] min-h-screen py-6 px-3 sm:px-6 md:px-8 font-body">
      <ConfirmModal state={confirmState} onClose={closeConfirm} />

      {/* 1. Hero Banner */}
      <section className="relative w-full overflow-hidden bg-cream-dark/20 p-2 md:p-4 section-gap-top mb-6">
        <div className="relative rounded-card-lg overflow-hidden shadow-soft">
          {bannerImage ? (
            <>
              <img
                src={imageUrl(bannerImage.imageUrl)}
                alt="शिबीर नोंदणी बॅनर"
                className="w-full min-h-[140px] sm:min-h-[220px] object-cover"
              />
              {isAdmin && (
                <div className="absolute top-3 right-3 flex gap-2 z-20">
                  <button
                    type="button"
                    onClick={() => document.getElementById('shibir-banner-input')?.click()}
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
              label="शिबीर नोंदणी बॅनर फोटो (२१:९)"
              className="w-full min-h-[140px] sm:min-h-[220px]"
              onFileSelect={handleBannerUpload}
            />
          )}
          <input
            id="shibir-banner-input"
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

      {/* Form Container */}
      <div id="shibir-form-container" className="max-w-4xl w-full mx-auto bg-white rounded-2xl shadow-soft border border-maroon/10 p-4 sm:p-8">

        {/* Step Indicator */}
        {!registrationComplete && (
          <div className="mb-8">
            <StepIndicator steps={steps} currentStep={currentStep} />
          </div>
        )}

        {/* REGISTRATION COMPLETE VIEW */}
        {registrationComplete ? (
          <div className="text-center py-6 space-y-6">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 size={36} />
            </div>

            <h2 className="text-2xl font-bold text-saffron" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              आपली शिबिर नोंदणी यशस्वीरित्या पूर्ण झाली आहे!
            </h2>
            <p className="text-sm text-charcoal/70 max-w-md mx-auto">
              आपला नोंदणी क्रमांक: <span className="font-bold text-saffron-dark font-mono">SHIBIR-{registeredId || 'NEW'}</span>. माहिती पडताळणीनंतर आपणास अधिकृत आयडी कार्ड / प्रवेश पत्र प्रदान केले जाईल.
            </p>

            {/* Official Form Preview Card (Exact Layout Matching PDF) */}
            <div className="w-full max-w-3xl mx-auto text-left border-2 border-saffron/30 rounded-2xl p-6 sm:p-8 bg-white shadow-sm space-y-5 print:border-none print:shadow-none" id="printable-shibir-form">
              {/* Header */}
              <div className="border-b-2 border-saffron/30 pb-4 text-center relative">
                <p className="text-[11px] font-bold text-saffron tracking-widest uppercase mb-0.5">॥ जनसेवा हीच ईश्वरसेवा ॥</p>
                <h3 className="text-xl sm:text-2xl font-black text-saffron-dark leading-tight" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                  दापोली मंडणगड सेवाभावी संस्था, पुणे
                </h3>
                <p className="text-xs sm:text-sm font-bold text-charcoal/80 mt-0.5">
                  शिबिर नोंदणी अर्ज (Official Shibir Registration Form)
                </p>
                <p className="text-[10px] text-charcoal/60 mt-0.5">
                  नोंदणी कार्यालय: पुणे, महाराष्ट्र • संपर्क: ९८२३४५६७८९ / dmsanstha@gmail.com
                </p>

                {/* Metadata Bar */}
                <div className="mt-3 pt-2.5 border-t border-dashed border-saffron/20 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
                  <div className="flex items-center gap-1.5 bg-cream/60 px-3 py-1 rounded-md border border-saffron/20">
                    <span className="text-charcoal/70">नोंदणी क्रमांक:</span>
                    <span className="font-mono font-bold text-saffron-dark">SHIBIR-{registeredId || 'NEW'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-cream/60 px-3 py-1 rounded-md border border-saffron/20">
                    <span className="text-charcoal/70">शिबिर नाव:</span>
                    <span className="font-bold text-saffron-dark">{formData.shibirName || '-'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-cream/60 px-3 py-1 rounded-md border border-saffron/20">
                    <span className="text-charcoal/70">दिनांक:</span>
                    <span className="font-bold text-charcoal">{todayDate}</span>
                  </div>
                </div>

                {/* Photo */}
                {passportPhotoPreview ? (
                  <div className="mt-3 sm:mt-0 sm:absolute top-1 right-1 flex flex-col items-center">
                    <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-lg overflow-hidden border-2 border-saffron/40 shadow-xs bg-cream/30">
                      <img src={passportPhotoPreview} alt="Applicant" className="w-full h-full object-cover" />
                    </div>
                    <span className="text-[9px] font-medium text-charcoal/60 mt-0.5">शिबिरार्थी छायाचित्र</span>
                  </div>
                ) : (
                  <div className="mt-3 sm:mt-0 sm:absolute top-1 right-1 flex flex-col items-center">
                    <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-lg border-2 border-dashed border-saffron/30 flex flex-col items-center justify-center bg-cream/20 text-charcoal/40 text-[10px]">
                      <span>पासपोर्ट फोटो</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Section 1: शिबिर तपशील */}
              <div className="space-y-2">
                <div className="bg-saffron/10 px-3 py-1 rounded border-l-4 border-saffron">
                  <h4 className="text-xs sm:text-sm font-bold text-saffron-dark">१. शिबिर तपशील (Shibir Details)</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">निवडलेले शिबिर:</span> <span className="font-bold text-charcoal">{formData.shibirName || '-'}</span></div>
                  <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">शिबिर तारीख:</span> <span className="font-bold text-charcoal">{formData.shibirDate || '-'}</span></div>
                  <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">शिबिर ठिकाण:</span> <span className="font-bold text-charcoal">{formData.shibirLocation || '-'}</span></div>
                </div>
              </div>

              {/* Section 2: शिबिरार्थी वैयक्तिक माहिती */}
              <div className="space-y-2">
                <div className="bg-saffron/10 px-3 py-1 rounded border-l-4 border-saffron">
                  <h4 className="text-xs sm:text-sm font-bold text-saffron-dark">२. शिबिरार्थी वैयक्तिक माहिती (Personal Details)</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">पूर्ण नाव:</span> <span className="font-bold text-charcoal">{formData.fullName || '-'}</span></div>
                  <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">जन्म तारीख / वय:</span> <span className="font-bold text-charcoal">{formData.birthDate || '-'} {formData.age ? `(${formData.age} वर्षे)` : ''}</span></div>
                  <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">मोबाईल:</span> <span className="font-bold text-charcoal">{formData.mobile || '-'}</span></div>
                  <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">नातेवाईक मोबाईल:</span> <span className="font-bold text-charcoal">{formData.relativeMobile || '-'}</span></div>
                  <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">व्यवसाय:</span> <span className="font-bold text-charcoal">{formData.occupation || '-'}</span></div>
                  <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">शिक्षण:</span> <span className="font-bold text-charcoal">{formData.education || '-'}</span></div>
                </div>
              </div>

              {/* Section 3: पत्ता व रहिवासी माहिती */}
              <div className="space-y-2">
                <div className="bg-saffron/10 px-3 py-1 rounded border-l-4 border-saffron">
                  <h4 className="text-xs sm:text-sm font-bold text-saffron-dark">३. पत्ता व रहिवासी माहिती (Address Details)</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">तालुका / जिल्हा / राज्य:</span> <span className="font-bold text-charcoal">{selectedTaluka?.nameMr || selectedTaluka?.nameEn || ''}, {selectedDistrict?.nameMr || selectedDistrict?.nameEn || ''}, {selectedState?.nameMr || selectedState?.nameEn || ''}</span></div>
                  <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">शहर / गाव:</span> <span className="font-bold text-charcoal">{formData.cityVillage || '-'}</span></div>
                  <div className="p-2 bg-cream/20 rounded border border-saffron/15 sm:col-span-2 md:col-span-3"><span className="text-charcoal/60 block text-[11px]">संपूर्ण पत्ता:</span> <span className="font-bold text-charcoal">{formData.fullAddress || '-'}</span></div>
                </div>
              </div>

              {/* Section 4: पूर्व सहभाग व विशेष माहिती */}
              <div className="space-y-2">
                <div className="bg-saffron/10 px-3 py-1 rounded border-l-4 border-saffron">
                  <h4 className="text-xs sm:text-sm font-bold text-saffron-dark">४. पूर्व सहभाग व विशेष माहिती</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">यापूर्वी सहभाग घेतला आहे का?:</span> <span className="font-bold text-charcoal">{formData.participatedEarlier === 'yes' ? `होय ${formData.previousEventName ? `(${formData.previousEventName})` : ''}` : 'नाही'}</span></div>
                  <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">विशेष माहिती / वैद्यकीय सूचना:</span> <span className="font-bold text-charcoal">{formData.specialInfo || 'लागू नाही'}</span></div>
                </div>
              </div>

              {/* Section 5: नोंदणी व शुल्क तपशील */}
              <div className="space-y-2">
                <div className="bg-saffron/10 px-3 py-1 rounded border-l-4 border-saffron">
                  <h4 className="text-xs sm:text-sm font-bold text-saffron-dark">५. नोंदणी व शुल्क तपशील (Registration & Fee)</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">पेमेंट मोड:</span> <span className="font-bold text-saffron-dark">{paymentMode}</span></div>
                  <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">नोंदणी शुल्क:</span> <span className="font-bold text-saffron-dark">₹{shibirPlanAmount}</span></div>
                  <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">नोंदणी स्थिती:</span> <span className="font-bold text-emerald-700">नोंदणी पूर्ण (यशस्वी)</span></div>
                </div>
              </div>

              {/* Official Signatures & Seal Box */}
              <div className="pt-6 mt-4 border-t-2 border-dashed border-saffron/30 grid grid-cols-2 gap-6 text-center text-xs">
                <div className="space-y-10">
                  <div className="h-8" />
                  <div className="border-t border-charcoal/50 pt-1 font-bold text-charcoal">
                    शिबिरार्थी स्वाक्षरी (Participant's Signature)
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

            {/* STEP 1: कार्यक्रमाची माहिती */}
            {currentStep === 1 && (
              <div className="space-y-5 animate-fade-in">
                {/* 4) Orange Theme Step Title */}
                <div className="flex items-center gap-2.5 text-saffron-dark font-extrabold text-lg sm:text-xl border-b border-saffron/20 pb-3 mb-6">
                  <Calendar size={22} className="text-saffron" />
                  <span style={{ fontFamily: "'Baloo 2', sans-serif" }}>पायरी १: कार्यक्रमाची माहिती</span>
                </div>

                <div className="space-y-4">
                  {/* 3) Shibir Name Dropdown - Normal Text Label */}
                  <div>
                    <label className="block text-xs sm:text-sm font-normal text-charcoal/80 mb-1">
                      कार्यक्रम / शिबिराचे नाव <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="shibirName"
                      value={formData.shibirName}
                      onChange={handleInputChange}
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.shibirName ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-saffron text-sm bg-white`}
                    >
                      <option value="">-- शिबिर / कार्यक्रम निवडा --</option>
                      {shibirMasters.map((s) => (
                        <option key={s.id} value={s.shibirName}>
                          {s.shibirName} {s.shibirDate ? `(${s.shibirDate})` : ''}
                        </option>
                      ))}
                    </select>
                    {errors.shibirName && <p className="text-red-500 text-xs mt-1">{errors.shibirName}</p>}
                  </div>

                  {/* Manual Shibir Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs sm:text-sm font-normal text-charcoal/80 mb-1">
                        कार्यक्रमाची तारीख
                      </label>
                      <input
                        type="date"
                        name="shibirDate"
                        value={formData.shibirDate}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-saffron text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-normal text-charcoal/80 mb-1">
                        स्थळ
                      </label>
                      <input
                        type="text"
                        name="shibirLocation"
                        placeholder="उदा. दापोली, पुणे, इत्यादी"
                        value={formData.shibirLocation}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-saffron text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: वैयक्तिक माहिती */}
            {currentStep === 2 && (
              <div className="space-y-5 animate-fade-in">
                {/* 4) Orange Theme Step Title */}
                <div className="flex items-center gap-2.5 text-saffron-dark font-extrabold text-lg sm:text-xl border-b border-saffron/20 pb-3 mb-6">
                  <User size={22} className="text-saffron" />
                  <span style={{ fontFamily: "'Baloo 2', sans-serif" }}>पायरी २: वैयक्तिक माहिती</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-normal text-charcoal/80 mb-1">पूर्ण नाव <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="आपले संपूर्ण नाव प्रविष्ट करा"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.fullName ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-saffron text-sm`}
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                  </div>

                  {/* Address */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs sm:text-sm font-normal text-charcoal/80 mb-1">पूर्ण पत्ता <span className="text-red-500">*</span></label>
                    <textarea
                      name="fullAddress"
                      rows={2}
                      placeholder="घर नं, गल्ली, भाग इ."
                      value={formData.fullAddress}
                      onChange={handleInputChange}
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.fullAddress ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-saffron text-sm`}
                    />
                    {errors.fullAddress && <p className="text-red-500 text-xs mt-1">{errors.fullAddress}</p>}
                  </div>

                  {/* State */}
                  <div>
                    <label className="block text-xs sm:text-sm font-normal text-charcoal/80 mb-1">राज्य <span className="text-red-500">*</span></label>
                    <select
                      name="stateId"
                      value={formData.stateId}
                      onChange={handleStateChange}
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.stateId ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-saffron text-sm bg-white`}
                    >
                      <option value="">-- राज्य निवडा --</option>
                      {states.map((s) => (
                        <option key={s.id} value={s.id}>{s.nameMr || s.nameEn}</option>
                      ))}
                    </select>
                    {errors.stateId && <p className="text-red-500 text-xs mt-1">{errors.stateId}</p>}
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-xs sm:text-sm font-normal text-charcoal/80 mb-1">जिल्हा <span className="text-red-500">*</span></label>
                    <select
                      name="districtId"
                      value={formData.districtId}
                      onChange={handleDistrictChange}
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.districtId ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-saffron text-sm bg-white`}
                    >
                      <option value="">-- जिल्हा निवडा --</option>
                      {districts.map((d) => (
                        <option key={d.id} value={d.id}>{d.nameMr || d.nameEn}</option>
                      ))}
                    </select>
                    {errors.districtId && <p className="text-red-500 text-xs mt-1">{errors.districtId}</p>}
                  </div>

                  {/* Taluka */}
                  <div>
                    <label className="block text-xs sm:text-sm font-normal text-charcoal/80 mb-1">तालुका <span className="text-red-500">*</span></label>
                    <select
                      name="talukaId"
                      value={formData.talukaId}
                      onChange={handleInputChange}
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.talukaId ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-saffron text-sm bg-white`}
                    >
                      <option value="">-- तालुका निवडा --</option>
                      {talukas.map((t) => (
                        <option key={t.id} value={t.id}>{t.nameMr || t.nameEn}</option>
                      ))}
                    </select>
                    {errors.talukaId && <p className="text-red-500 text-xs mt-1">{errors.talukaId}</p>}
                  </div>

                  {/* 5) City / Village Dropdown loaded from DB */}
                  <div>
                    <label className="block text-xs sm:text-sm font-normal text-charcoal/80 mb-1">शहर / गाव <span className="text-red-500">*</span></label>
                    <select
                      name="cityVillage"
                      value={formData.cityVillage}
                      onChange={handleInputChange}
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.cityVillage ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-saffron text-sm bg-white`}
                    >
                      <option value="">-- शहर निवडा --</option>
                      {cities.map((c) => (
                        <option key={c.id} value={c.nameMr || c.nameEn}>
                          {c.nameMr ? `${c.nameMr}${c.nameEn ? ` (${c.nameEn})` : ''}` : c.nameEn}
                        </option>
                      ))}
                    </select>
                    {errors.cityVillage && <p className="text-red-500 text-xs mt-1">{errors.cityVillage}</p>}
                  </div>

                  {/* 6) Business (Occupation) Dropdown */}
                  <div>
                    <label className="block text-xs sm:text-sm font-normal text-charcoal/80 mb-1">व्यवसाय / नोकरी प्रकार</label>
                    <select
                      name="occupation"
                      value={formData.occupation}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-saffron text-sm bg-white"
                    >
                      <option value="">-- व्यवसाय / नोकरी प्रकार निवडा --</option>
                      <option value="private_job">खाजगी नोकरी (Private Job)</option>
                      <option value="gov_job">शासकीय नोकरी (Government Job)</option>
                      <option value="business">व्यवसाय (Business)</option>
                      <option value="student">विद्यार्थी (Student)</option>
                      <option value="not_working">काम करत नाही / गृहिणी</option>
                      <option value="other">इतर (Other)</option>
                    </select>
                  </div>

                  {/* 6) Education Dropdown */}
                  <div>
                    <label className="block text-xs sm:text-sm font-normal text-charcoal/80 mb-1">शिक्षण</label>
                    <select
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-saffron text-sm bg-white"
                    >
                      <option value="">-- शिक्षण निवडा --</option>
                      <option value="10th">१० वी उत्तीर्ण (10th)</option>
                      <option value="12th">१२ वी उत्तीर्ण (12th)</option>
                      <option value="diploma">डिप्लोमा (Diploma)</option>
                      <option value="graduate">पदवीधर (Graduate)</option>
                      <option value="post_graduate">पदव्युत्तर (Post Graduate)</option>
                      <option value="other">इतर (Other)</option>
                    </select>
                  </div>

                  {/* Birth Date */}
                  <div>
                    <label className="block text-xs sm:text-sm font-normal text-charcoal/80 mb-1">जन्म तारीख <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      name="birthDate"
                      max={todayDate}
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.birthDate ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-saffron text-sm`}
                    />
                    {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
                  </div>

                  {/* Age (Auto Calculate) */}
                  <div>
                    <label className="block text-xs sm:text-sm font-normal text-charcoal/80 mb-1">
                      वय (Auto Calculate)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formData.birthDate ? `${calculateAge(formData.birthDate)} वर्षे` : 'जन्म तारीख निवडा'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 bg-gray-100 font-bold text-saffron-dark text-sm cursor-not-allowed"
                    />
                  </div>

                  {/* Mobile No */}
                  <div>
                    <label className="block text-xs sm:text-sm font-normal text-charcoal/80 mb-1">मोबाईल नं. <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      name="mobile"
                      maxLength={10}
                      placeholder="१० अंकी मोबाईल नंबर"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      className={`w-full px-3.5 py-2.5 rounded-xl border ${errors.mobile ? 'border-red-500 bg-red-50' : 'border-gray-300'} focus:ring-2 focus:ring-saffron text-sm`}
                    />
                    {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                  </div>

                  {/* Relative Mobile */}
                  <div>
                    <label className="block text-xs sm:text-sm font-normal text-charcoal/80 mb-1">घरातील व्यक्तीचा मोबाईल नं.</label>
                    <input
                      type="tel"
                      name="relativeMobile"
                      maxLength={10}
                      placeholder="नातेवाईकाचा मोबाईल नंबर"
                      value={formData.relativeMobile}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-saffron text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: शिबिर / कार्यक्रम संबंधित माहिती */}
            {currentStep === 3 && (
              <div className="space-y-5 animate-fade-in">
                {/* 4) Orange Theme Step Title */}
                <div className="flex items-center gap-2.5 text-saffron-dark font-extrabold text-lg sm:text-xl border-b border-saffron/20 pb-3 mb-6">
                  <MapPin size={22} className="text-saffron" />
                  <span style={{ fontFamily: "'Baloo 2', sans-serif" }}>पायरी ३: शिबिर संबंधित माहिती</span>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-normal text-charcoal/80 mb-2">
                      या पूर्वीच्या कार्यक्रमात / शिबिरात सहभाग घेतला आहे का? <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-6">
                      <label className="flex items-center gap-2 text-sm font-bold text-charcoal cursor-pointer">
                        <input
                          type="radio"
                          name="participatedEarlier"
                          value="yes"
                          checked={formData.participatedEarlier === 'yes'}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-saffron focus:ring-saffron"
                        />
                        होय
                      </label>
                      <label className="flex items-center gap-2 text-sm font-bold text-charcoal cursor-pointer">
                        <input
                          type="radio"
                          name="participatedEarlier"
                          value="no"
                          checked={formData.participatedEarlier === 'no'}
                          onChange={handleInputChange}
                          className="w-4 h-4 text-saffron focus:ring-saffron"
                        />
                        नाही
                      </label>
                    </div>
                  </div>

                  {formData.participatedEarlier === 'yes' && (
                    <div>
                      <label className="block text-xs sm:text-sm font-normal text-charcoal/80 mb-1">
                        यापूर्वी सहभागी झालेला कार्यक्रम (Optional)
                      </label>
                      <input
                        type="text"
                        name="previousEventName"
                        placeholder="उदा. आरोग्य शिबिर २०२४, रक्तदान शिबिर इ."
                        value={formData.previousEventName}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-saffron text-sm"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs sm:text-sm font-normal text-charcoal/80 mb-1">
                      विशेष माहिती (Optional)
                    </label>
                    <textarea
                      name="specialInfo"
                      rows={3}
                      placeholder="आपल्याकडे असलेली काही विशेष माहिती किंवा अपेक्षा इथे नमूद करा..."
                      value={formData.specialInfo}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-saffron text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: फोटो */}
            {currentStep === 4 && (
              <div className="space-y-5 animate-fade-in">
                {/* 4) Orange Theme Step Title */}
                <div className="flex items-center gap-2.5 text-saffron-dark font-extrabold text-lg sm:text-xl border-b border-saffron/20 pb-3 mb-6">
                  <Upload size={22} className="text-saffron" />
                  <span style={{ fontFamily: "'Baloo 2', sans-serif" }}>पायरी ४: फोटो अपलोड</span>
                </div>

                <div className="p-6 border-2 border-dashed border-saffron/40 rounded-2xl text-center bg-saffron/5 hover:bg-saffron/10 transition-colors">
                  {passportPhotoPreview ? (
                    <div className="space-y-3">
                      <img src={passportPhotoPreview} alt="Passport Preview" className="w-32 h-36 object-cover rounded-lg mx-auto shadow-md border" />
                      <button
                        type="button"
                        onClick={() => { setPassportPhotoPreview(null); setFormData((prev: any) => ({ ...prev, passportPhotoUploaded: false })); }}
                        className="text-xs font-bold text-red-600 hover:underline"
                      >
                        फोटो बदला
                      </button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block space-y-2">
                      <Upload className="mx-auto text-saffron w-10 h-10" />
                      <span className="block text-sm font-bold text-saffron-dark">पासपोर्ट साईज फोटो अपलोड करा <span className="text-red-500">*</span></span>
                      <span className="block text-xs text-charcoal/60">(ID Card आवश्यक असल्यास फोटो अनिवार्य आहे. जास्तीत जास्त ३ MB)</span>
                      <input type="file" accept="image/*" onChange={handlePassportPhotoChange} className="hidden" />
                    </label>
                  )}
                </div>
                {errors.passportPhotoUploaded && <p className="text-red-500 text-xs text-center">{errors.passportPhotoUploaded}</p>}
              </div>
            )}

            {/* 8) STEP 5: पेमेंट व पुष्टीकरण (Payment Design like member registration form) */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-fade-in">
                {/* Orange Theme Step Title */}
                <div className="flex items-center gap-2.5 text-saffron-dark font-extrabold text-lg sm:text-xl border-b border-saffron/20 pb-3 mb-6">
                  <CreditCard size={22} className="text-saffron" />
                  <span style={{ fontFamily: "'Baloo 2', sans-serif" }}>पायरी ५: पेमेंट व पुष्टीकरण</span>
                </div>

                {/* Selected Fee Info Card */}
                <div className="bg-amber-50/80 border border-saffron/30 rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-saffron/10 rounded-xl text-saffron border border-saffron/20">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-charcoal/90" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                          शिबिर नोंदणी शुल्क
                        </h3>
                        <p className="text-xs text-charcoal/60">
                          भराव्याची रक्कम (Read-only): <span className="font-extrabold text-saffron text-sm bg-white px-2.5 py-0.5 rounded-full border border-saffron/30">₹{shibirPlanAmount}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/90 border border-amber-200/80 rounded-xl p-4 flex items-start gap-3.5">
                    <div className="p-2 bg-amber-100/80 rounded-lg text-saffron shrink-0 mt-0.5">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div className="text-xs text-charcoal/80 space-y-2 leading-relaxed">
                      <p>
                        आपण <strong>शिबिर नोंदणी शुल्क (₹{shibirPlanAmount})</strong> भरत आहात. कृपया खाली दिलेल्या QR कोडवर किंवा UPI बटनवर क्लिक करून पेमेंट पूर्ण करा व त्याचा स्क्रीनशॉट अपलोड करा.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Online Payment Details & QR Code (Matching member-registration design) */}
                {paymentMode !== 'Cash' && (
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
                      भराव्याची रक्कम: ₹{shibirPlanAmount}
                    </div>

                    {/* Live QR Code Display Container */}
                    <div className="relative group max-w-[240px] mx-auto p-4 bg-white rounded-2xl border-2 border-saffron/20 shadow-md flex flex-col items-center justify-center">

                      {/* Admin floating QR Action Buttons */}
                      {isAdmin && (
                        <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-white/90 backdrop-blur-xs p-1 rounded-full shadow-md z-10 border border-saffron/10">
                          <button
                            type="button"
                            onClick={openAdminQrModal}
                            className="p-1.5 bg-saffron/10 hover:bg-saffron hover:text-white text-saffron rounded-full transition-colors"
                            title={paymentQrSettings?.qrImageUrl ? "QR कोड आणि माहिती बदला (Edit)" : "QR कोड जोडा (Add)"}
                          >
                            {paymentQrSettings?.qrImageUrl ? <Pencil size={14} /> : <Plus size={14} />}
                          </button>
                          {paymentQrSettings?.qrImageUrl && (
                            <button
                              type="button"
                              onClick={handleDeleteAdminQr}
                              className="p-1.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded-full transition-colors"
                              title="QR कोड हटवा (Delete)"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      )}

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
                        संस्थेचा UPI आयडी: <span className="font-mono text-saffron selection:bg-amber-100">{upiIdVal}</span>
                      </p>
                      {payeeNameVal && (
                        <p className="text-[11px] text-charcoal/60 font-semibold">
                          पेई नाव: {payeeNameVal}
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
                )}

                {/* Screenshot Upload Card */}
                {paymentMode !== 'Cash' && (
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
                          id="shibir-screenshot-input"
                          accept="image/png, image/jpeg, image/jpg"
                          onChange={handleScreenshotChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => document.getElementById('shibir-screenshot-input')?.click()}
                          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-saffron/20 hover:border-saffron text-saffron rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          <Upload size={16} />
                          <span>
                            {screenshotFile ? 'स्क्रीनशॉट बदलू शकता' : 'स्क्रीनशॉट निवडा'}
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
                          <img
                            src={screenshotPreview}
                            alt="स्क्रीनशॉट"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setScreenshotFile(null);
                              setScreenshotPreview(null);
                            }}
                            className="absolute top-1.5 right-1.5 p-1 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-md transition-colors"
                            title="स्क्रीनशॉट काढा"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Admin Mode Selection (After Online Payment & Screenshot) */}
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
                              setCashAmountReceived(shibirPlanAmount.toString());
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
                            value={cashAmountReceived || shibirPlanAmount.toString()}
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

                {/* Declaration Checkbox */}
                <div className="flex items-start gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="declaration"
                    name="declaration"
                    checked={formData.declaration}
                    onChange={(e) => setFormData((prev: any) => ({ ...prev, declaration: e.target.checked }))}
                    className="w-4 h-4 text-saffron focus:ring-saffron mt-0.5 cursor-pointer"
                  />
                  <label htmlFor="declaration" className="text-xs text-charcoal/80 cursor-pointer">
                    मी याद्वारे जाहीर करतो/करते की वर दिलेली सर्व माहिती माझ्या ज्ञानानुसार खरी आणि अचूक आहे.
                  </label>
                </div>
                {errors.declaration && <p className="text-red-500 text-xs">{errors.declaration}</p>}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-maroon/10">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-5 py-2.5 rounded-xl border border-saffron/30 text-saffron-dark text-sm font-bold hover:bg-cream transition-colors flex items-center gap-1.5"
                >
                  <ArrowLeft size={16} /> मागे
                </button>
              ) : <div />}

              {currentStep < 5 ? (
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-saffron text-white text-sm font-bold shadow-md hover:bg-saffron-dark transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  पुढील पायरी <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitFinal}
                  disabled={isSubmitting}
                  className="px-8 py-2.5 rounded-xl bg-saffron text-white text-sm font-bold shadow-md hover:bg-saffron-dark transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
                  फॉर्म सबमिट करा
                </button>
              )}
            </div>

          </form>
        )}

      </div>

      {/* Admin QR Code Modal */}
      {showAdminQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-card-lg max-w-md w-full p-6 shadow-2xl space-y-4 border border-saffron/20">
            <div className="flex items-center justify-between border-b border-amber-200/80 pb-3">
              <h3 className="text-base font-extrabold text-saffron-dark" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                पेमेंट QR कोड & UPI माहिती अद्ययावत करा
              </h3>
              <button onClick={() => setShowAdminQrModal(false)} className="text-charcoal/50 hover:text-charcoal p-1">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveAdminQr} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-charcoal/80 mb-1">UPI ID (उदा. 9823456789@upi):</label>
                <input
                  type="text"
                  value={adminUpiId}
                  onChange={(e) => setAdminUpiId(e.target.value)}
                  placeholder="उदा. name@upi"
                  className="w-full px-3 py-2 rounded-card border border-gray-300 focus:border-saffron outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal/80 mb-1">पेई नाव (Payee Name):</label>
                <input
                  type="text"
                  value={adminPayeeName}
                  onChange={(e) => setAdminPayeeName(e.target.value)}
                  placeholder="उदा. दापोली मडणगड सेवाभावी संस्था, पुणे"
                  className="w-full px-3 py-2 rounded-card border border-gray-300 focus:border-saffron outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-charcoal/80 mb-1">QR कोड फोटो (कस्टम QR फोटो अपलोड करा):</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) setAdminQrFile(file);
                  }}
                  className="w-full text-xs text-charcoal file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-saffron file:text-white hover:file:bg-saffron-dark cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowAdminQrModal(false)}
                  className="px-4 py-2 rounded-card border text-charcoal/70 hover:bg-gray-100 font-bold"
                >
                  रद्द
                </button>
                <button
                  type="submit"
                  disabled={savingAdminQr}
                  className="px-5 py-2 rounded-card bg-saffron hover:bg-saffron-dark text-white font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                >
                  {savingAdminQr ? <Loader2 size={15} className="animate-spin" /> : null}
                  <span>साठवा</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Official Form Preview Modal (पूर्वावलोकन Modal) */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl border border-saffron/20 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-cream border-b border-saffron/20">
              <div className="flex items-center gap-2">
                <FileText className="text-saffron-dark" size={20} />
                <h3 className="font-bold text-saffron-dark text-sm sm:text-base" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                  अधिकृत शिबिर नोंदणी अर्ज पूर्वावलोकन (Official Form Preview)
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
                    शिबिर नोंदणी अर्ज (Official Shibir Registration Form)
                  </p>
                  <p className="text-[10px] text-charcoal/60 mt-0.5">
                    नोंदणी कार्यालय: पुणे, महाराष्ट्र • संपर्क: ९८२३४५६७८९ / dmsanstha@gmail.com
                  </p>

                  {/* Metadata Bar */}
                  <div className="mt-3 pt-2.5 border-t border-dashed border-saffron/20 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
                    <div className="flex items-center gap-1.5 bg-cream/60 px-3 py-1 rounded-md border border-saffron/20">
                      <span className="text-charcoal/70">नोंदणी क्रमांक:</span>
                      <span className="font-mono font-bold text-saffron-dark">SHIBIR-{registeredId || 'NEW'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-cream/60 px-3 py-1 rounded-md border border-saffron/20">
                      <span className="text-charcoal/70">शिबिर नाव:</span>
                      <span className="font-bold text-saffron-dark">{formData.shibirName || '-'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-cream/60 px-3 py-1 rounded-md border border-saffron/20">
                      <span className="text-charcoal/70">दिनांक:</span>
                      <span className="font-bold text-charcoal">{todayDate}</span>
                    </div>
                  </div>

                  {/* Photo */}
                  {passportPhotoPreview ? (
                    <div className="mt-3 sm:mt-0 sm:absolute top-1 right-1 flex flex-col items-center">
                      <div className="w-24 h-28 sm:w-28 sm:h-32 rounded-lg overflow-hidden border-2 border-saffron/40 shadow-xs bg-cream/30">
                        <img src={passportPhotoPreview} alt="Applicant" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-[9px] font-medium text-charcoal/60 mt-0.5">शिबिरार्थी छायाचित्र</span>
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
                    <h4 className="text-xs sm:text-sm font-bold text-saffron-dark">१. शिबिर तपशील (Shibir Details)</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">निवडलेले शिबिर:</span> <span className="font-bold text-charcoal">{formData.shibirName || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">शिबिर तारीख:</span> <span className="font-bold text-charcoal">{formData.shibirDate || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">शिबिर ठिकाण:</span> <span className="font-bold text-charcoal">{formData.shibirLocation || '-'}</span></div>
                  </div>
                </div>

                {/* Section 2 */}
                <div className="space-y-2">
                  <div className="bg-saffron/10 px-3 py-1 rounded border-l-4 border-saffron">
                    <h4 className="text-xs sm:text-sm font-bold text-saffron-dark">२. शिबिरार्थी वैयक्तिक माहिती (Personal Details)</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">पूर्ण नाव:</span> <span className="font-bold text-charcoal">{formData.fullName || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">जन्म तारीख / वय:</span> <span className="font-bold text-charcoal">{formData.birthDate || '-'} {formData.age ? `(${formData.age} वर्षे)` : ''}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">मोबाईल:</span> <span className="font-bold text-charcoal">{formData.mobile || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">नातेवाईक मोबाईल:</span> <span className="font-bold text-charcoal">{formData.relativeMobile || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">व्यवसाय:</span> <span className="font-bold text-charcoal">{formData.occupation || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">शिक्षण:</span> <span className="font-bold text-charcoal">{formData.education || '-'}</span></div>
                  </div>
                </div>

                {/* Section 3 */}
                <div className="space-y-2">
                  <div className="bg-saffron/10 px-3 py-1 rounded border-l-4 border-saffron">
                    <h4 className="text-xs sm:text-sm font-bold text-saffron-dark">३. पत्ता व रहिवासी माहिती (Address Details)</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">तालुका / जिल्हा / राज्य:</span> <span className="font-bold text-charcoal">{selectedTaluka?.nameMr || selectedTaluka?.nameEn || ''}, {selectedDistrict?.nameMr || selectedDistrict?.nameEn || ''}, {selectedState?.nameMr || selectedState?.nameEn || ''}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">शहर / गाव:</span> <span className="font-bold text-charcoal">{formData.cityVillage || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15 sm:col-span-2 md:col-span-3"><span className="text-charcoal/60 block text-[11px]">संपूर्ण पत्ता:</span> <span className="font-bold text-charcoal">{formData.fullAddress || '-'}</span></div>
                  </div>
                </div>

                {/* Section 4 */}
                <div className="space-y-2">
                  <div className="bg-saffron/10 px-3 py-1 rounded border-l-4 border-saffron">
                    <h4 className="text-xs sm:text-sm font-bold text-saffron-dark">४. पूर्व सहभाग व विशेष माहिती</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">यापूर्वी सहभाग घेतला आहे का?:</span> <span className="font-bold text-charcoal">{formData.participatedEarlier === 'yes' ? `होय ${formData.previousEventName ? `(${formData.previousEventName})` : ''}` : 'नाही'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">विशेष माहिती / वैद्यकीय सूचना:</span> <span className="font-bold text-charcoal">{formData.specialInfo || 'लागू नाही'}</span></div>
                  </div>
                </div>

                {/* Section 5 */}
                <div className="space-y-2">
                  <div className="bg-saffron/10 px-3 py-1 rounded border-l-4 border-saffron">
                    <h4 className="text-xs sm:text-sm font-bold text-saffron-dark">५. नोंदणी व शुल्क तपशील (Registration & Fee)</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">पेमेंट मोड:</span> <span className="font-bold text-saffron-dark">{paymentMode}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">नोंदणी शुल्क:</span> <span className="font-bold text-saffron-dark">₹{shibirPlanAmount}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">नोंदणी स्थिती:</span> <span className="font-bold text-emerald-700">नोंदणी पूर्ण (यशस्वी)</span></div>
                  </div>
                </div>

                {/* Signatures */}
                <div className="pt-6 mt-4 border-t-2 border-dashed border-saffron/30 grid grid-cols-2 gap-6 text-center text-xs">
                  <div className="space-y-10">
                    <div className="h-8" />
                    <div className="border-t border-charcoal/50 pt-1 font-bold text-charcoal">
                      शिबिरार्थी स्वाक्षरी (Participant's Signature)
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
    </div>
  );
};

export default ShibirRegistrationPage;
