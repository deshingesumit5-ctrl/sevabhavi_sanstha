import React, { useState, useEffect, useRef } from 'react';
import StepIndicator from '../../components/StepIndicator';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import ConfirmModal, { type ConfirmState } from '../../components/ConfirmModal';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Download,
  Loader2,
  QrCode,
  CreditCard,
  Smartphone,
  Pencil,
  Trash2,
  Plus,
  Upload,
  Eye,
  Printer,
  RotateCcw,
  FileText,
  X,
} from 'lucide-react';
import {
  api,
  type State,
  type District,
  type Taluka,
  type City,
  type DonationType,
  type DonationPurpose,
  type PaymentSettingResponse,
  BASE_URL,
} from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { uploadImage, deleteImage, fetchByCategory, imageUrl, type GalleryImage } from '../../services/galleryApi';
import { validateDonationForm, type DonationFormErrors } from '../../utils/validations';
import { saveDraft, loadDraft, clearDraft } from '../../utils/formPersistence';
import { buildUpiLink } from '../../utils/upi';
import { QRCodeSVG } from 'qrcode.react';

const DRAFT_KEY = 'donation_reg_draft';
const BANNER_SECTION_KEY = 'donation_registration_banner';

export const DonationRegistrationPage: React.FC = () => {
  const formContainerRef = useRef<HTMLDivElement>(null);
  const localDraft = loadDraft<any>(DRAFT_KEY);
  const { isAdmin } = useAuth();

  // Banner image state
  const [bannerImage, setBannerImage] = useState<GalleryImage | null>(null);

  // Modal confirm state
  const [confirmState, setConfirmState] = useState<ConfirmState>({ open: false, message: '', onConfirm: () => { } });
  const closeConfirm = () => setConfirmState(prev => ({ ...prev, open: false }));
  const askConfirm = (message: string, onConfirm: () => void) =>
    setConfirmState({ open: true, message, onConfirm });

  // Navigation Steps (1-4)
  const steps = [
    'वैयक्तिक माहिती',
    'देणगीचा प्रकार व उद्देश',
    'पेमेंट',
    'पुष्टीकरण',
  ];

  const [currentStep, setCurrentStep] = useState<number>(() => localDraft?.currentStep ?? 1);
  const [errors, setErrors] = useState<DonationFormErrors>({});

  // Lookups loaded from Backend DB
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [talukas, setTalukas] = useState<Taluka[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [donationTypes, setDonationTypes] = useState<DonationType[]>([]);
  const [donationPurposes, setDonationPurposes] = useState<DonationPurpose[]>([]);
  const [paymentQrSettings, setPaymentQrSettings] = useState<PaymentSettingResponse | null>(null);

  // Payment states
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(() => localDraft?.screenshotPreview ?? null);
  const [paymentSubmitted, setPaymentSubmitted] = useState<boolean>(() => localDraft?.paymentSubmitted ?? false);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(() => localDraft?.paymentSuccessMessage ?? null);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState<boolean>(false);
  const [registrationComplete, setRegistrationComplete] = useState<boolean>(() => localDraft?.registrationComplete ?? false);
  const [receiptNumber, setReceiptNumber] = useState<string>(() => localDraft?.receiptNumber ?? '');
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  // Admin QR Code Modal State
  const [showAdminQrModal, setShowAdminQrModal] = useState(false);
  const [adminUpiId, setAdminUpiId] = useState('');
  const [adminPayeeName, setAdminPayeeName] = useState('');
  const [adminQrFile, setAdminQrFile] = useState<File | null>(null);
  const [adminQrPreview, setAdminQrPreview] = useState<string | null>(null);
  const [savingAdminQr, setSavingAdminQr] = useState(false);

  // Form State
  const [formData, setFormData] = useState(() => {
    if (localDraft?.formData) return localDraft.formData;
    return {
      fullName: '',
      mobile: '',
      email: '',
      birthDate: '',
      gender: 'पुरुष',
      address: '',
      city: '',
      stateId: '',
      districtId: '',
      talukaId: '',
      pincode: '',

      donationTypeId: '1',
      donationPurposeId: '',
      customPurpose: '',
      inMemoryOfToggle: false,
      inMemoryOfName: '',
      isAnonymous: false,
      message: '',

      amount: '1000',
      currency: 'INR',
      paymentMethod: 'UPI',
    };
  });

  // Load Banner Image
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

  // Load Lookups from DB on mount
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [statesRes, typesRes, purposesRes, qrRes] = await Promise.allSettled([
          api.getStates(),
          api.getDonationTypes(),
          api.getDonationPurposes(),
          api.getPaymentQrSettings(),
        ]);

        if (statesRes.status === 'fulfilled') {
          setStates(statesRes.value);
          const mh = statesRes.value.find(s => s.nameEn === 'Maharashtra');
          if (!formData.stateId && mh) {
            const dists = await api.getDistricts(mh.id).catch(() => []);
            setDistricts(dists);
            setFormData((prev: any) => ({ ...prev, stateId: mh.id.toString() }));
          } else if (formData.stateId) {
            const dists = await api.getDistricts(Number(formData.stateId)).catch(() => []);
            setDistricts(dists);
          }
        }

        if (formData.districtId) {
          const [tals, cits] = await Promise.all([
            api.getTalukas(Number(formData.districtId)).catch(() => []),
            api.getCities(Number(formData.districtId)).catch(() => [])
          ]);
          setTalukas(tals);
          setCities(cits);
        } else {
          const cits = await api.getCities().catch(() => []);
          setCities(cits);
        }

        if (typesRes.status === 'fulfilled' && typesRes.value.length > 0) {
          setDonationTypes(typesRes.value);
          if (!formData.donationTypeId) {
            setFormData((prev: any) => ({ ...prev, donationTypeId: typesRes.value[0].id.toString() }));
          }
        } else {
          const defaults: DonationType[] = [
            { id: 1, code: 'ONE_TIME', nameEn: 'One-time', nameMr: 'एकरकमी' },
            { id: 2, code: 'MONTHLY', nameEn: 'Monthly', nameMr: 'मासिक' },
            { id: 3, code: 'YEARLY', nameEn: 'Yearly', nameMr: 'वार्षिक' },
          ];
          setDonationTypes(defaults);
          if (!formData.donationTypeId) {
            setFormData((prev: any) => ({ ...prev, donationTypeId: '1' }));
          }
        }

        if (purposesRes.status === 'fulfilled' && purposesRes.value.length > 0) {
          setDonationPurposes(purposesRes.value);
          if (!formData.donationPurposeId) {
            setFormData((prev: any) => ({ ...prev, donationPurposeId: purposesRes.value[0].id.toString() }));
          }
        } else {
          const defaultPurposes: DonationPurpose[] = [
            { id: 1, code: 'GENERAL_FUND', nameEn: 'General Fund', nameMr: 'सर्वसाधारण निधी' },
            { id: 2, code: 'EDUCATION', nameEn: 'Educational Aid', nameMr: 'शैक्षणिक मदत' },
            { id: 3, code: 'MEDICAL', nameEn: 'Medical Support', nameMr: 'वैद्यकीय मदत' },
            { id: 4, code: 'SOCIAL_WELFARE', nameEn: 'Social Welfare', nameMr: 'समाजउपयोगी उपक्रम' },
            { id: 5, code: 'SHIBIR', nameEn: 'Shibir Fund', nameMr: 'शिबीर व शिबीर उपक्रम' },
          ];
          setDonationPurposes(defaultPurposes);
          if (!formData.donationPurposeId) {
            setFormData((prev: any) => ({ ...prev, donationPurposeId: '1' }));
          }
        }

        if (qrRes.status === 'fulfilled') {
          setPaymentQrSettings(qrRes.value);
        }
      } catch (err) {
        console.error('Error loading lookup data:', err);
      }
    };

    loadLookups();
  }, []);

  // Save Draft locally
  useEffect(() => {
    const draftData = {
      formData,
      currentStep,
      screenshotPreview,
      paymentSubmitted,
      paymentSuccessMessage,
      registrationComplete,
      receiptNumber,
    };
    saveDraft(draftData, DRAFT_KEY);
  }, [
    formData,
    currentStep,
    screenshotPreview,
    paymentSubmitted,
    paymentSuccessMessage,
    registrationComplete,
    receiptNumber,
  ]);

  const scrollToTop = () => {
    if (formContainerRef.current) {
      formContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Form Input Handler
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    let val: any = value;

    if (type === 'checkbox') {
      val = (e.target as HTMLInputElement).checked;
    } else if (name === 'mobile') {
      val = value.replace(/[^0-9]/g, '').slice(0, 10);
    } else if (name === 'pincode') {
      val = value.replace(/[^0-9]/g, '').slice(0, 6);
    } else if (name === 'amount') {
      val = value.replace(/[^0-9]/g, '');
    }

    setFormData((prev: any) => ({ ...prev, [name]: val }));

    if (errors[name as keyof DonationFormErrors]) {
      setErrors((prev: any) => ({ ...prev, [name]: undefined }));
    }
  };

  // Location Handlers (State -> District -> Taluka & City from DB)
  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateIdVal = e.target.value;
    setFormData((prev: any) => ({ ...prev, stateId: stateIdVal, districtId: '', talukaId: '', city: '' }));
    setDistricts([]);
    setTalukas([]);
    setCities([]);
    if (stateIdVal) {
      try {
        const dists = await api.getDistricts(Number(stateIdVal));
        setDistricts(dists);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const distIdVal = e.target.value;
    setFormData((prev: any) => ({ ...prev, districtId: distIdVal, talukaId: '', city: '' }));
    setTalukas([]);
    setCities([]);
    if (distIdVal) {
      try {
        const [tals, cits] = await Promise.all([
          api.getTalukas(Number(distIdVal)),
          api.getCities(Number(distIdVal))
        ]);
        setTalukas(tals);
        setCities(cits);
      } catch (err) {
        console.error(err);
      }
    }
  };

  // Payment Screenshot Handler
  const handleScreenshotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('स्क्रीनशॉटचा आकार २ MB पेक्षा जास्त नसावा.');
        e.target.value = '';
        return;
      }
      setScreenshotFile(file);
      setPaymentSubmitted(false);
      setPaymentSuccessMessage(null);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
        handlePaymentSubmit(file);
      };
      reader.readAsDataURL(file);
      setErrors((prev: any) => ({ ...prev, screenshot: undefined }));
    }
  };

  // Submit payment / donation
  const handlePaymentSubmit = async (file?: File): Promise<boolean> => {
    const amt = Number(formData.amount);
    if (!formData.amount || isNaN(amt) || amt < 10) {
      setErrors(prev => ({ ...prev, amount: 'कृपया किमान ₹ १० किंवा त्यापेक्षा जास्त देणगी रक्कम प्रविष्ट करा' }));
      return false;
    }

    setIsSubmittingPayment(true);
    try {
      const finalTxnId = 'TXN-' + Date.now() + Math.random().toString(36).substring(2, 7).toUpperCase();

      const finalPurposeId = formData.donationPurposeId === 'other'
        ? (donationPurposes[0]?.id || 1)
        : Number(formData.donationPurposeId || 1);

      const finalMessage = formData.donationPurposeId === 'other'
        ? (formData.customPurpose ? `उद्देश: ${formData.customPurpose}${formData.message ? '\n' + formData.message : ''}` : formData.message)
        : formData.message;

      const payload = {
        receiptNumber: receiptNumber || undefined,
        fullName: formData.fullName,
        mobile: formData.mobile,
        email: formData.email || undefined,
        birthDate: formData.birthDate || undefined,
        gender: formData.gender,
        address: formData.address,
        city: formData.city,
        stateId: formData.stateId ? Number(formData.stateId) : undefined,
        districtId: formData.districtId ? Number(formData.districtId) : undefined,
        talukaId: formData.talukaId ? Number(formData.talukaId) : undefined,
        pincode: formData.pincode || undefined,
        donationTypeId: Number(formData.donationTypeId || 1),
        donationPurposeId: finalPurposeId,
        inMemoryOfToggle: formData.inMemoryOfToggle,
        inMemoryOfName: formData.inMemoryOfName || undefined,
        isAnonymous: formData.isAnonymous,
        message: finalMessage || undefined,
        amount: Number(formData.amount),
        currency: formData.currency || 'INR',
        paymentMethod: 'UPI',
        paymentStatus: 'SUCCESS',
        transactionId: finalTxnId,
      };

      const result = await api.submitDonationRegistration(payload);
      setReceiptNumber(result.receiptNumber);

      // If screenshot file passed, save to general payment submission if needed
      if (file) {
        try {
          const pData = new FormData();
          pData.append('registrationId', result.id.toString());
          pData.append('registrationType', 'DONATION');
          pData.append('memberName', formData.fullName);
          pData.append('memberMobile', formData.mobile);
          pData.append('amount', formData.amount);
          pData.append('membershipType', 'DONATION');
          pData.append('paymentMode', 'UPI');
          pData.append('upiTxnId', finalTxnId);
          pData.append('file', file);
          await api.submitPayment(pData).catch(() => {});
        } catch {
          // ignore optional screenshot upload error
        }
      }

      setPaymentSubmitted(true);
      setPaymentSuccessMessage('तुमचे देणगी पेमेंट यशस्वी झाले आहे! तुम्ही नोंदणी पूर्ण करू शकता.');
      setErrors((prev: any) => ({ ...prev, screenshot: undefined, amount: undefined }));
      return true;

    } catch (err: any) {
      alert('पेमेंट सबमिट करताना त्रुटी आली: ' + (err.message || err));
      return false;
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  // Step Validation & Navigation
  const handleNextStep = async () => {
    const { errors: currentErrors, isValid } = validateDonationForm(formData, currentStep);

    if (!isValid) {
      setErrors(currentErrors);
      return;
    }

    if (currentStep === 3) {
      if (!paymentSubmitted) {
        if (!formData.amount || Number(formData.amount) < 10) {
          setErrors(prev => ({ ...prev, amount: 'कृपया प्रथम देणगी रक्कम प्रविष्ट करा.' }));
          return;
        }
        // Attempt final submission if not submitted via screenshot
        const success = await handlePaymentSubmit(screenshotFile || undefined);
        if (!success) return;
      }
      setRegistrationComplete(true);
      setCurrentStep(4);
      clearDraft(DRAFT_KEY);
      scrollToTop();
      return;
    }

    setErrors({});

    // Save draft to backend
    try {
      const finalDraftPurposeId = formData.donationPurposeId === 'other'
        ? (donationPurposes[0]?.id || 1)
        : Number(formData.donationPurposeId || 1);

      await api.saveDonationDraft({
        ...formData,
        receiptNumber: receiptNumber || undefined,
        amount: Number(formData.amount),
        donationTypeId: Number(formData.donationTypeId || 1),
        donationPurposeId: finalDraftPurposeId,
        stateId: formData.stateId ? Number(formData.stateId) : undefined,
        districtId: formData.districtId ? Number(formData.districtId) : undefined,
        talukaId: formData.talukaId ? Number(formData.talukaId) : undefined,
        paymentMethod: 'UPI',
        draftStep: currentStep + 1,
      }).then(res => {
        if (res.receiptNumber) setReceiptNumber(res.receiptNumber);
      }).catch(() => {});
    } catch {
      // ignore non-critical draft API error
    }

    if (currentStep < 4) {
      setCurrentStep(prev => prev + 1);
      scrollToTop();
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
      scrollToTop();
    }
  };

  // Helper Labels
  const selectedPurpose = formData.donationPurposeId === 'other'
    ? { nameMr: formData.customPurpose || 'इतर' }
    : donationPurposes.find(p => p.id.toString() === formData.donationPurposeId);
  const selectedState = states.find(s => s.id.toString() === formData.stateId);
  const selectedDistrict = districts.find(d => d.id.toString() === formData.districtId);
  const selectedTaluka = talukas.find(t => t.id.toString() === formData.talukaId);
  const selectedDonationType = donationTypes.find(t => t.id.toString() === formData.donationTypeId);

  // Live UPI link generation
  const currentPlanAmount = Number(formData.amount || 0);
  const upiIdVal = paymentQrSettings?.upiId || 'dapolimadangad@upi';
  const payeeNameVal = paymentQrSettings?.payeeName || 'दापोली मडणगड सेवाभावी संस्था, पुणे';
  const liveUpiLink = buildUpiLink(
    upiIdVal,
    payeeNameVal,
    currentPlanAmount,
    `Donation: ${receiptNumber || 'Sevabhavi'}`
  );

  // Admin QR Handlers
  const openAdminQrModal = () => {
    setAdminUpiId(paymentQrSettings?.upiId || '');
    setAdminPayeeName(paymentQrSettings?.payeeName || '');
    setAdminQrFile(null);
    setAdminQrPreview(null);
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

  // Download Receipt
  const handleDownloadReceipt = async () => {
    if (!receiptNumber) {
      handlePrint();
      return;
    }
    try {
      const downloadUrl = `${BASE_URL}/donation-registration/receipt/${receiptNumber}/pdf`;
      const res = await fetch(downloadUrl);
      if (!res.ok) {
        throw new Error('पावती माहिती प्राप्त करण्यात त्रुटी आली.');
      }
      const blob = await res.blob();
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `Donation_Receipt_${receiptNumber}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err: any) {
      alert('पावती डाउनलोड करताना त्रुटी आली: ' + (err.message || err));
    }
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Donation_Receipt_${receiptNumber || 'NEW'}_${formData.fullName || 'Form'}`;
    window.print();
    document.title = originalTitle;
  };

  const handleResetForm = () => {
    setRegistrationComplete(false);
    setCurrentStep(1);
    setReceiptNumber('');
    setFormData({
      fullName: '',
      mobile: '',
      email: '',
      birthDate: '',
      gender: 'पुरुष',
      address: '',
      city: '',
      stateId: states.find(s => s.nameEn === 'Maharashtra')?.id.toString() || '',
      districtId: '',
      talukaId: '',
      pincode: '',

      donationTypeId: '1',
      donationPurposeId: '1',
      customPurpose: '',
      inMemoryOfToggle: false,
      inMemoryOfName: '',
      isAnonymous: false,
      message: '',

      amount: '1000',
      currency: 'INR',
      paymentMethod: 'UPI',
    });
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setPaymentSubmitted(false);
    setPaymentSuccessMessage(null);
    setShowPreviewModal(false);
    clearDraft(DRAFT_KEY);
    scrollToTop();
  };

  return (
    <div className="flex flex-col w-full font-body">
      <ConfirmModal state={confirmState} onClose={closeConfirm} />

      {/* 1. Hero Banner (Matches Member Registration Banner Size & Design) */}
      <section className="relative w-full overflow-hidden bg-cream-dark/20 p-2 md:p-4 section-gap-top">
        <div className="relative rounded-card-lg overflow-hidden shadow-soft">
          {bannerImage ? (
            <>
              <img
                src={imageUrl(bannerImage.imageUrl)}
                alt="देणगी नोंदणी बॅनर"
                className="w-full min-h-[140px] sm:min-h-[220px] object-cover"
              />
              {isAdmin && (
                <div className="absolute top-3 right-3 flex gap-2 z-20">
                  <button
                    type="button"
                    onClick={() => document.getElementById('donation-banner-input')?.click()}
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
              label="देणगी नोंदणी बॅनर फोटो (२१:९)"
              className="w-full min-h-[140px] sm:min-h-[220px]"
              onFileSelect={handleBannerUpload}
            />
          )}
          <input
            id="donation-banner-input"
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

      {/* Form Section Container */}
      <section className="w-full px-4 max-w-4xl mx-auto space-y-6 section-gap-top mb-12" ref={formContainerRef}>

        {/* Stepper Card */}
        {!registrationComplete && (
          <div className="bg-white rounded-card-lg border border-saffron/5 shadow-soft p-5">
            <StepIndicator steps={steps} currentStep={currentStep} layout="horizontal" />
          </div>
        )}

        {/* Form Content Card */}
        <div className="bg-white rounded-card-lg border border-saffron/5 shadow-soft p-6 md:p-8">

          {/* STEP 1: वैयक्तिक माहिती */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-saffron border-b border-saffron/5 pb-3" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                पायरी १: वैयक्तिक माहिती <span className="text-xs font-normal text-charcoal/60"></span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-bold text-charcoal/75 mb-1">
                    पूर्ण नाव <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="आपले पूर्ण नाव प्रविष्ट करा"
                    className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${
                      errors.fullName
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                    }`}
                  />
                  {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                </div>

                {/* Birth Date */}
                <div>
                  <label className="block text-xs font-bold text-charcoal/75 mb-1">
                    जन्म तारीख
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron"
                  />
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-xs font-bold text-charcoal/75 mb-1">
                    मोबाईल नंबर <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    maxLength={10}
                    value={formData.mobile}
                    onChange={handleInputChange}
                    placeholder="१० अंकी मोबाईल नंबर"
                    className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${
                      errors.mobile
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                    }`}
                  />
                  {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-bold text-charcoal/75 mb-1">
                    ईमेल
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="example@gmail.com"
                    className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${
                      errors.email
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                    }`}
                  />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-bold text-charcoal/75 mb-1">
                    लिंग
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-white transition-all border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron"
                  >
                    <option value="पुरुष">पुरुष</option>
                    <option value="स्त्री">स्त्री</option>
                    <option value="इतर">इतर</option>
                  </select>
                </div>

                {/* State Dropdown (from Backend DB) */}
                <div>
                  <label className="block text-xs font-bold text-charcoal/75 mb-1">
                    राज्य <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="stateId"
                    value={formData.stateId}
                    onChange={handleStateChange}
                    className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-white transition-all ${
                      errors.stateId
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                    }`}
                  >
                    <option value="">राज्य निवडा</option>
                    {states.map(s => (
                      <option key={s.id} value={s.id.toString()}>{s.nameMr}</option>
                    ))}
                  </select>
                  {errors.stateId && <p className="text-red-500 text-xs mt-1">{errors.stateId}</p>}
                </div>

                {/* District Dropdown (from Backend DB) */}
                <div>
                  <label className="block text-xs font-bold text-charcoal/75 mb-1">
                    जिल्हा <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="districtId"
                    value={formData.districtId}
                    onChange={handleDistrictChange}
                    disabled={!formData.stateId}
                    className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-white disabled:opacity-50 transition-all ${
                      errors.districtId
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                    }`}
                  >
                    <option value="">जिल्हा निवडा</option>
                    {districts.map(d => (
                      <option key={d.id} value={d.id.toString()}>{d.nameMr}</option>
                    ))}
                  </select>
                  {errors.districtId && <p className="text-red-500 text-xs mt-1">{errors.districtId}</p>}
                </div>

                {/* City Dropdown (from Backend DB ONLY, not text input) */}
                <div>
                  <label className="block text-xs font-bold text-charcoal/75 mb-1">
                    शहर / गाव <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    disabled={!formData.districtId}
                    className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-white disabled:opacity-50 transition-all ${
                      errors.city
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                    }`}
                  >
                    <option value="">शहर / गाव निवडा</option>
                    {cities.map(c => (
                      <option key={c.id} value={c.nameMr}>{c.nameMr}</option>
                    ))}
                  </select>
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-bold text-charcoal/75 mb-1">
                    पत्ता <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="घर क्रमांक, रस्ता, परिसराचे नाव"
                    className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 resize-none transition-all ${
                      errors.address
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                    }`}
                  />
                  {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                </div>

                {/* Pincode (Standard 1 column field) */}
                <div>
                  <label className="block text-xs font-bold text-charcoal/75 mb-1">
                    पिनकोड <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="pincode"
                    maxLength={6}
                    inputMode="numeric"
                    pattern="\d*"
                    value={formData.pincode}
                    onChange={handleInputChange}
                    placeholder="६ अंकी पिनकोड"
                    className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${
                      errors.pincode
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                    }`}
                  />
                  {errors.pincode && <p className="text-red-500 text-xs mt-1">{errors.pincode}</p>}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: देणगीचा प्रकार व उद्देश */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-saffron border-b border-saffron/5 pb-3" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                पायरी २: निधीचा उद्देश <span className="text-xs font-normal text-charcoal/60"></span>
              </h2>

              <div className="space-y-5">
                {/* Donation Purpose Dropdown */}
                <div>
                  <label className="block text-xs font-bold text-charcoal/75 mb-1">
                    निधीचा उद्देश निवडा <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="donationPurposeId"
                    value={formData.donationPurposeId}
                    onChange={(e) => {
                      handleInputChange(e);
                      if (e.target.value !== 'other') {
                        setFormData((prev: any) => ({ ...prev, customPurpose: '' }));
                      }
                    }}
                    className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-white transition-all ${
                      errors.donationPurposeId
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                    }`}
                  >
                    <option value="">निधीचा उद्देश निवडा</option>
                    {donationPurposes.map(p => (
                      <option key={p.id} value={p.id.toString()}>{p.nameMr}</option>
                    ))}
                    <option value="other">इतर</option>
                  </select>
                  {errors.donationPurposeId && <p className="text-red-500 text-xs mt-1">{errors.donationPurposeId}</p>}
                </div>

                {/* Custom Purpose Input Field when "इतर" is selected */}
                {formData.donationPurposeId === 'other' && (
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">
                      निधीचा उद्देश प्रविष्ट करा <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="customPurpose"
                      value={formData.customPurpose || ''}
                      onChange={handleInputChange}
                      placeholder="उदा. गोशाळा मदत, अन्नछत्र उपक्रम, इत्यादी"
                      className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${
                        errors.customPurpose
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                      }`}
                    />
                    {errors.customPurpose && <p className="text-red-500 text-xs mt-1">{errors.customPurpose}</p>}
                  </div>
                )}

                {/* In Memory Of Checkbox & Field */}
                <div className="border border-charcoal/10 rounded-card p-4 space-y-3 bg-cream/5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-charcoal/80">
                    <input
                      type="checkbox"
                      name="inMemoryOfToggle"
                      checked={formData.inMemoryOfToggle}
                      onChange={handleInputChange}
                      className="rounded accent-saffron w-4 h-4"
                    />
                    <span>कोणाच्या तरी स्मरणार्थ / सन्मानार्थ देणगी द्यायची आहे का?</span>
                  </label>

                  {formData.inMemoryOfToggle && (
                    <input
                      type="text"
                      name="inMemoryOfName"
                      value={formData.inMemoryOfName}
                      onChange={handleInputChange}
                      placeholder="ज्यांच्या स्मरणार्थ द्यायची आहे त्यांचे नाव"
                      className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 text-sm outline-none focus:border-saffron focus:ring-1 focus:ring-saffron bg-white"
                    />
                  )}
                </div>

                {/* Anonymous Donation Checkbox */}
                <div className="border border-charcoal/10 rounded-card p-4 bg-cream/5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-charcoal/80">
                    <input
                      type="checkbox"
                      name="isAnonymous"
                      checked={formData.isAnonymous}
                      onChange={handleInputChange}
                      className="rounded accent-saffron w-4 h-4"
                    />
                    <span>मला निनावी (Anonymous) देणगीदार म्हणून नोंदणी करायची आहे</span>
                  </label>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-xs font-bold text-charcoal/75 mb-1">संदेश / अभिप्राय</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="संस्थेसाठी तुमचा संदेश येथे लिहा..."
                    className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 text-sm outline-none focus:border-saffron focus:ring-1 focus:ring-saffron bg-cream/5 resize-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: पेमेंट (Payment - Designed like Member Registration Form, Amount Editable) */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-xl font-bold text-saffron border-b border-saffron/5 pb-3" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                पायरी ३: देणगी रक्कम व पेमेंट <span className="text-xs font-normal text-charcoal/60"></span>
              </h2>

              {/* 1. Editable Amount Input & Quick Select Buttons */}
              <div className="bg-amber-50/80 border border-saffron/30 rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-saffron/10 rounded-xl text-saffron border border-saffron/20">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-charcoal/90" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                      देणगी रक्कम प्रविष्ट करा (Donation Amount)
                    </h3>
                    <p className="text-xs text-charcoal/60">
                      तुम्ही हवी ती देणगी रक्कम येथे प्रविष्ट करू शकता.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold text-charcoal/75">
                    देणगी रक्कम (₹) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative max-w-xs">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-saffron font-extrabold text-base">₹</span>
                    <input
                      type="text"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="उदा. १०००"
                      className={`w-full pl-8 pr-4 py-2.5 rounded-card border text-base font-bold text-saffron outline-none bg-white transition-all ${
                        errors.amount
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-saffron/40 focus:border-saffron focus:ring-1 focus:ring-saffron'
                      }`}
                    />
                  </div>
                  {errors.amount && <p className="text-red-500 text-xs font-bold">{errors.amount}</p>}


                </div>
              </div>

              {/* 2. QR Code Scanning & Clickable UPI Link Card (Matches Member Registration Design) */}
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

                {/* Amount Display Badge */}
                <div className="inline-block bg-saffron text-white font-bold text-sm px-6 py-1.5 rounded-full shadow-xs">
                  भराव्याची देणगी रक्कम: ₹{currentPlanAmount || 0}
                </div>

                {/* Live QR Code Display */}
                <div className="relative group max-w-[240px] mx-auto p-4 bg-white rounded-2xl border-2 border-saffron/20 shadow-md flex flex-col items-center justify-center">

                  {/* Admin Floating Action Buttons */}
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-white/90 backdrop-blur-xs p-1 rounded-full shadow-md z-10 border border-saffron/10">
                      <button
                        type="button"
                        onClick={openAdminQrModal}
                        className="p-1.5 bg-saffron/10 hover:bg-saffron hover:text-white text-saffron rounded-full transition-colors"
                        title={paymentQrSettings?.qrImageUrl ? "QR कोड आणि माहिती बदला" : "QR कोड जोडा"}
                      >
                        {paymentQrSettings?.qrImageUrl ? <Pencil size={14} /> : <Plus size={14} />}
                      </button>
                      {paymentQrSettings?.qrImageUrl && (
                        <button
                          type="button"
                          onClick={handleDeleteAdminQr}
                          className="p-1.5 bg-red-50 hover:bg-red-600 hover:text-white text-red-600 rounded-full transition-colors"
                          title="QR कोड हटवा"
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
                      <QRCodeSVG value={liveUpiLink} size={180} includeMargin={true} />
                    </div>
                  )}
                </div>

                {/* UPI Details & Clickable Link */}
                <div className="space-y-3 pt-2 flex flex-col items-center">
                  <p className="text-xs font-bold text-charcoal/90">
                    संस्थेचा UPI आयडी: <span className="font-mono text-saffron selection:bg-amber-100">{upiIdVal}</span>
                  </p>
                  {payeeNameVal && (
                    <p className="text-[11px] text-charcoal/60 font-semibold">
                      पेई नाव: {payeeNameVal}
                    </p>
                  )}

                  {/* Clickable UPI Button */}
                  <a
                    href={liveUpiLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="upi-pay-link inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs md:text-sm rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform active:scale-95 cursor-pointer"
                  >
                    <Smartphone size={16} />
                    <span>येथे क्लिक करून UPI ने पैसे भरा (₹{currentPlanAmount || 0})</span>
                  </a>
                </div>
              </div>

              {/* 3. Payment Screenshot Upload Box */}
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
                      id="donation-payment-screenshot-input"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handleScreenshotChange}
                      disabled={isSubmittingPayment}
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isSubmittingPayment}
                      onClick={() => document.getElementById('donation-payment-screenshot-input')?.click()}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-saffron/20 hover:border-saffron text-saffron rounded-xl font-bold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                    >
                      {isSubmittingPayment ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Upload size={16} />
                      )}
                      <span>
                        {isSubmittingPayment
                          ? 'अपलोड होत आहे...'
                          : screenshotFile
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
                      {!isSubmittingPayment && (
                        <div className="absolute top-1.5 right-1.5 flex gap-1.5 z-10">
                          <button
                            type="button"
                            onClick={() => document.getElementById('donation-payment-screenshot-input')?.click()}
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
                              setPaymentSubmitted(false);
                              setPaymentSuccessMessage(null);
                              const input = document.getElementById('donation-payment-screenshot-input') as HTMLInputElement;
                              if (input) input.value = '';
                            }}
                            className="p-1.5 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-md transition-all duration-200 hover:scale-105"
                            title="स्क्रीनशॉट हटवा"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {paymentSubmitted && paymentSuccessMessage && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 animate-fade-in">
                    <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
                    <span className="text-sm font-bold">{paymentSuccessMessage}</span>
                  </div>
                )}

                {errors.screenshot && (
                  <p className="text-red-500 text-xs mt-1 font-bold">{errors.screenshot}</p>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: पुष्टीकरण व अधिकृत पावती (Confirmation & Official Receipt Preview) */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn text-center py-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 size={36} />
              </div>

              <div className="space-y-2">
                <h2 className="text-2xl font-extrabold text-charcoal" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                  देणगी नोंदणी यशस्वीपणे पूर्ण झाली आहे!
                </h2>
                <p className="text-xs text-charcoal/70 max-w-md mx-auto">
                  आपल्या बहुमूल्य योगदानाबद्दल दापोली मंडणगड सेवाभावी संस्था आपले मनःपूर्वक आभार मानत आहे.
                </p>
              </div>

              {/* Official Donation Receipt & Form Preview Card */}
              <div className="w-full max-w-3xl mx-auto text-left border-2 border-saffron/30 rounded-2xl p-6 sm:p-8 bg-white shadow-sm space-y-5 print:border-none print:shadow-none" id="printable-donation-form">
                {/* Header */}
                <div className="border-b-2 border-saffron/30 pb-4 text-center relative">
                  <p className="text-[11px] font-bold text-saffron tracking-widest uppercase mb-0.5">॥ जनसेवा हीच ईश्वरसेवा ॥</p>
                  <h3 className="text-xl sm:text-2xl font-black text-saffron-dark leading-tight" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                    दापोली मंडणगड सेवाभावी संस्था, पुणे
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-charcoal/80 mt-0.5">
                    अधिकृत देणगी पावती व नोंदणी अर्ज (Official Donation Receipt & Registration Form)
                  </p>
                  <p className="text-[10px] text-charcoal/60 mt-0.5">
                    नोंदणी कार्यालय: पुणे, महाराष्ट्र • संपर्क: ९८२३४५६७८९ / dmsanstha@gmail.com
                  </p>
                  <p className="text-[10px] font-bold text-saffron-dark mt-0.5">
                    ८०G / १२A आयकर सवलत प्रमाणपत्र क्रमांक: AAAAT1234F • पॅन: AAAAT1234F
                  </p>

                  {/* Metadata Bar */}
                  <div className="mt-3 pt-2.5 border-t border-dashed border-saffron/20 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
                    <div className="flex items-center gap-1.5 bg-cream/60 px-3 py-1 rounded-md border border-saffron/20">
                      <span className="text-charcoal/70">पावती क्रमांक:</span>
                      <span className="font-mono font-bold text-saffron-dark">{receiptNumber || 'DON-NEW'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-cream/60 px-3 py-1 rounded-md border border-saffron/20">
                      <span className="text-charcoal/70">देणगी प्रकार:</span>
                      <span className="font-bold text-saffron-dark">{selectedDonationType?.nameMr || (formData.donationTypeId === '2' ? 'मासिक' : formData.donationTypeId === '3' ? 'वार्षिक' : 'एकरकमी')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-cream/60 px-3 py-1 rounded-md border border-saffron/20">
                      <span className="text-charcoal/70">दिनांक:</span>
                      <span className="font-bold text-charcoal">{new Date().toISOString().split('T')[0]}</span>
                    </div>
                  </div>
                </div>

                {/* Section 1: देणगीदार वैयक्तिक माहिती */}
                <div className="space-y-2">
                  <div className="bg-saffron/10 px-3 py-1 rounded border-l-4 border-saffron">
                    <h4 className="text-xs sm:text-sm font-bold text-saffron-dark">१. देणगीदार तपशील (Donor Details)</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">देणगीदाराचे नाव:</span> <span className="font-bold text-charcoal">{formData.isAnonymous ? 'अनामित देणगीदार (Anonymous)' : (formData.fullName || '-')}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">मोबाईल:</span> <span className="font-bold text-charcoal">{formData.mobile || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">ईमेल:</span> <span className="font-bold text-charcoal">{formData.email || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">जन्म तारीख / लिंग:</span> <span className="font-bold text-charcoal">{formData.birthDate || '-'} / {formData.gender || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15 sm:col-span-2"><span className="text-charcoal/60 block text-[11px]">गोपनीयता:</span> <span className="font-bold text-charcoal">{formData.isAnonymous ? 'नाव गोपनीय ठेवावे (होय)' : 'सार्वजनिक (नाही)'}</span></div>
                  </div>
                </div>

                {/* Section 2: पत्ता व संपर्क माहिती */}
                <div className="space-y-2">
                  <div className="bg-saffron/10 px-3 py-1 rounded border-l-4 border-saffron">
                    <h4 className="text-xs sm:text-sm font-bold text-saffron-dark">२. पत्ता माहिती (Address Details)</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">तालुका / जिल्हा / राज्य:</span> <span className="font-bold text-charcoal">{selectedTaluka?.nameMr || selectedTaluka?.nameEn || ''}, {selectedDistrict?.nameMr || selectedDistrict?.nameEn || ''}, {selectedState?.nameMr || selectedState?.nameEn || ''}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">शहर / गाव:</span> <span className="font-bold text-charcoal">{formData.city || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">पिनकोड:</span> <span className="font-bold text-charcoal">{formData.pincode || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15 sm:col-span-2 md:col-span-3"><span className="text-charcoal/60 block text-[11px]">संपूर्ण पत्ता:</span> <span className="font-bold text-charcoal">{formData.address || '-'}</span></div>
                  </div>
                </div>

                {/* Section 3: देणगीचा उद्देश व विशेष माहिती */}
                <div className="space-y-2">
                  <div className="bg-saffron/10 px-3 py-1 rounded border-l-4 border-saffron">
                    <h4 className="text-xs sm:text-sm font-bold text-saffron-dark">३. देणगीचा उद्देश व विशेष सूचना (Purpose & Notes)</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">देणगीचा उद्देश:</span> <span className="font-bold text-charcoal">{selectedPurpose?.nameMr || formData.customPurpose || 'सर्वसाधारण निधी'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">स्मृतीप्रित्यर्थ:</span> <span className="font-bold text-charcoal">{formData.inMemoryOfToggle && formData.inMemoryOfName ? `होय (${formData.inMemoryOfName})` : 'नाही'}</span></div>
                    {formData.message && (
                      <div className="p-2 bg-cream/20 rounded border border-saffron/15 sm:col-span-2"><span className="text-charcoal/60 block text-[11px]">विशेष संदेश / सूचना:</span> <span className="font-bold text-charcoal">{formData.message}</span></div>
                    )}
                  </div>
                </div>

                {/* Section 4: देणगी रक्कम व पावती तपशील */}
                <div className="space-y-2">
                  <div className="bg-saffron/10 px-3 py-1 rounded border-l-4 border-saffron">
                    <h4 className="text-xs sm:text-sm font-bold text-saffron-dark">४. देणगी रक्कम व पावती तपशील (Amount & Payment)</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">जमा झालेली रक्कम:</span> <span className="font-bold text-saffron-dark text-sm">₹{formData.amount} ({formData.currency || 'INR'})</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">पेमेंट मोड:</span> <span className="font-bold text-charcoal">{formData.paymentMethod || 'UPI'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">पेमेंट स्थिती:</span> <span className="font-bold text-emerald-700">यशस्वी (SUCCESS)</span></div>
                  </div>
                </div>

                {/* Signatures Box */}
                <div className="pt-6 mt-4 border-t-2 border-dashed border-saffron/30 grid grid-cols-2 gap-6 text-center text-xs">
                  <div className="space-y-10">
                    <div className="h-8" />
                    <div className="border-t border-charcoal/50 pt-1 font-bold text-charcoal">
                      देणगीदाराची स्वाक्षरी (Donor's Signature)
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

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-4 no-print">
                {/* 1. Preview Form Option */}
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(true)}
                  className="px-5 py-2.5 bg-amber-50 hover:bg-amber-100 text-saffron-dark border border-saffron/30 font-bold rounded-xl shadow-xs hover:shadow-md transition-all flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Eye size={17} className="text-saffron-dark" />
                  <span>पावती पूर्वावलोकन (Preview Receipt)</span>
                </button>

                {/* 2. Print Form Option */}
                <button
                  type="button"
                  onClick={handlePrint}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 text-sm cursor-pointer"
                >
                  <Printer size={17} />
                  <span>पावती प्रिंट करा (Print Receipt)</span>
                </button>

                {/* 3. Download PDF Option */}
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
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
                  <span>नवीन देणगी नोंदणी करा (Start From Beginning)</span>
                </button>
              </div>
            </div>
          )}

          {/* Navigation Controls (Prev / Next Buttons) */}
          {!registrationComplete && (
            <div className="flex items-center justify-between pt-6 border-t border-saffron/10 mt-6">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={handlePrevStep}
                  className="px-5 py-2.5 border border-charcoal/20 hover:bg-cream text-charcoal rounded-full font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <ArrowLeft size={16} />
                  <span>मागे (Previous)</span>
                </button>
              ) : (
                <div />
              )}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-6 py-2.5 bg-saffron hover:bg-saffron-dark text-white rounded-full font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <span>पुढे (Next)</span>
                  <ArrowRight size={16} />
                </button>
              ) : currentStep === 3 ? (
                <button
                  type="button"
                  onClick={handleNextStep}
                  disabled={isSubmittingPayment}
                  className="px-6 py-2.5 bg-saffron hover:bg-saffron-dark text-white rounded-full font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingPayment ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>प्रक्रिया सुरू आहे...</span>
                    </>
                  ) : (
                    <>
                      <span>नोंदणी पूर्ण करा (Complete Registration)</span>
                      <CheckCircle2 size={16} />
                    </>
                  )}
                </button>
              ) : null}
            </div>
          )}
        </div>
      </section>

      {/* Admin QR Code Edit Modal */}
      {showAdminQrModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-card-lg border border-saffron/20 shadow-2xl max-w-md w-full p-6 space-y-4 relative">
            <h3 className="text-lg font-bold text-saffron border-b border-saffron/10 pb-2" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              QR कोड व पेमेंट माहिती संपादित करा
            </h3>

            <form onSubmit={handleSaveAdminQr} className="space-y-4 text-left">
              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1">UPI ID</label>
                <input
                  type="text"
                  value={adminUpiId}
                  onChange={(e) => setAdminUpiId(e.target.value)}
                  placeholder="उदा. dapolimadangad@upi"
                  className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 text-xs outline-none focus:border-saffron"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1">पेई नाव (Payee Name)</label>
                <input
                  type="text"
                  value={adminPayeeName}
                  onChange={(e) => setAdminPayeeName(e.target.value)}
                  placeholder="उदा. दापोली मडणगड सेवाभावी संस्था, पुणे"
                  className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 text-xs outline-none focus:border-saffron"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1">QR इमेज फाईल (इच्छित असल्यास)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setAdminQrFile(file);
                      const reader = new FileReader();
                      reader.onloadend = () => setAdminQrPreview(reader.result as string);
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full text-xs"
                />
                {adminQrPreview && (
                  <img src={adminQrPreview} alt="Preview" className="w-24 h-24 object-contain mt-2 border rounded" />
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-charcoal/10">
                <button
                  type="button"
                  onClick={() => setShowAdminQrModal(false)}
                  className="px-4 py-2 border border-charcoal/20 rounded-full text-xs font-bold text-charcoal hover:bg-cream"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  disabled={savingAdminQr}
                  className="px-5 py-2 bg-saffron text-white rounded-full text-xs font-bold hover:bg-saffron-dark disabled:opacity-50"
                >
                  {savingAdminQr ? 'जतन होत आहे...' : 'जतन करा'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Official Donation Receipt & Form Preview Modal (पूर्वावलोकन Modal) */}
      {showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 animate-in fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl border border-saffron/20 shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden my-auto animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-3.5 bg-cream border-b border-saffron/20">
              <div className="flex items-center gap-2">
                <FileText className="text-saffron-dark" size={20} />
                <h3 className="font-bold text-saffron-dark text-sm sm:text-base" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                  अधिकृत देणगी पावती व अर्ज पूर्वावलोकन (Official Receipt & Form Preview)
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
                  onClick={handleDownloadReceipt}
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
                    अधिकृत देणगी पावती व नोंदणी अर्ज (Official Donation Receipt & Registration Form)
                  </p>
                  <p className="text-[10px] text-charcoal/60 mt-0.5">
                    नोंदणी कार्यालय: पुणे, महाराष्ट्र • संपर्क: ९८२३४५६७८९ / dmsanstha@gmail.com
                  </p>
                  <p className="text-[10px] font-bold text-saffron-dark mt-0.5">
                    ८०G / १२A आयकर सवलत प्रमाणपत्र क्रमांक: AAAAT1234F • पॅन: AAAAT1234F
                  </p>

                  {/* Metadata Bar */}
                  <div className="mt-3 pt-2.5 border-t border-dashed border-saffron/20 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
                    <div className="flex items-center gap-1.5 bg-cream/60 px-3 py-1 rounded-md border border-saffron/20">
                      <span className="text-charcoal/70">पावती क्रमांक:</span>
                      <span className="font-mono font-bold text-saffron-dark">{receiptNumber || 'DON-NEW'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-cream/60 px-3 py-1 rounded-md border border-saffron/20">
                      <span className="text-charcoal/70">देणगी प्रकार:</span>
                      <span className="font-bold text-saffron-dark">{selectedDonationType?.nameMr || (formData.donationTypeId === '2' ? 'मासिक' : formData.donationTypeId === '3' ? 'वार्षिक' : 'एकरकमी')}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-cream/60 px-3 py-1 rounded-md border border-saffron/20">
                      <span className="text-charcoal/70">दिनांक:</span>
                      <span className="font-bold text-charcoal">{new Date().toISOString().split('T')[0]}</span>
                    </div>
                  </div>
                </div>

                {/* Section 1: देणगीदार वैयक्तिक माहिती */}
                <div className="space-y-2">
                  <div className="bg-saffron/10 px-3 py-1 rounded border-l-4 border-saffron">
                    <h4 className="text-xs sm:text-sm font-bold text-saffron-dark">१. देणगीदार तपशील (Donor Details)</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">देणगीदाराचे नाव:</span> <span className="font-bold text-charcoal">{formData.isAnonymous ? 'अनामित देणगीदार (Anonymous)' : (formData.fullName || '-')}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">मोबाईल:</span> <span className="font-bold text-charcoal">{formData.mobile || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">ईमेल:</span> <span className="font-bold text-charcoal">{formData.email || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">जन्म तारीख / लिंग:</span> <span className="font-bold text-charcoal">{formData.birthDate || '-'} / {formData.gender || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15 sm:col-span-2"><span className="text-charcoal/60 block text-[11px]">गोपनीयता:</span> <span className="font-bold text-charcoal">{formData.isAnonymous ? 'नाव गोपनीय ठेवावे (होय)' : 'सार्वजनिक (नाही)'}</span></div>
                  </div>
                </div>

                {/* Section 2: पत्ता व संपर्क माहिती */}
                <div className="space-y-2">
                  <div className="bg-saffron/10 px-3 py-1 rounded border-l-4 border-saffron">
                    <h4 className="text-xs sm:text-sm font-bold text-saffron-dark">२. पत्ता माहिती (Address Details)</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">तालुका / जिल्हा / राज्य:</span> <span className="font-bold text-charcoal">{selectedTaluka?.nameMr || selectedTaluka?.nameEn || ''}, {selectedDistrict?.nameMr || selectedDistrict?.nameEn || ''}, {selectedState?.nameMr || selectedState?.nameEn || ''}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">शहर / गाव:</span> <span className="font-bold text-charcoal">{formData.city || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">पिनकोड:</span> <span className="font-bold text-charcoal">{formData.pincode || '-'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15 sm:col-span-2 md:col-span-3"><span className="text-charcoal/60 block text-[11px]">संपूर्ण पत्ता:</span> <span className="font-bold text-charcoal">{formData.address || '-'}</span></div>
                  </div>
                </div>

                {/* Section 3: देणगीचा उद्देश व विशेष माहिती */}
                <div className="space-y-2">
                  <div className="bg-saffron/10 px-3 py-1 rounded border-l-4 border-saffron">
                    <h4 className="text-xs sm:text-sm font-bold text-saffron-dark">३. देणगीचा उद्देश व विशेष सूचना (Purpose & Notes)</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">देणगीचा उद्देश:</span> <span className="font-bold text-charcoal">{selectedPurpose?.nameMr || formData.customPurpose || 'सर्वसाधारण निधी'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">स्मृतीप्रित्यर्थ:</span> <span className="font-bold text-charcoal">{formData.inMemoryOfToggle && formData.inMemoryOfName ? `होय (${formData.inMemoryOfName})` : 'नाही'}</span></div>
                    {formData.message && (
                      <div className="p-2 bg-cream/20 rounded border border-saffron/15 sm:col-span-2"><span className="text-charcoal/60 block text-[11px]">विशेष संदेश / सूचना:</span> <span className="font-bold text-charcoal">{formData.message}</span></div>
                    )}
                  </div>
                </div>

                {/* Section 4: देणगी रक्कम व पावती तपशील */}
                <div className="space-y-2">
                  <div className="bg-saffron/10 px-3 py-1 rounded border-l-4 border-saffron">
                    <h4 className="text-xs sm:text-sm font-bold text-saffron-dark">४. देणगी रक्कम व पावती तपशील (Amount & Payment)</h4>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">जमा झालेली रक्कम:</span> <span className="font-bold text-saffron-dark text-sm">₹{formData.amount} ({formData.currency || 'INR'})</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">पेमेंट मोड:</span> <span className="font-bold text-charcoal">{formData.paymentMethod || 'UPI'}</span></div>
                    <div className="p-2 bg-cream/20 rounded border border-saffron/15"><span className="text-charcoal/60 block text-[11px]">पेमेंट स्थिती:</span> <span className="font-bold text-emerald-700">यशस्वी (SUCCESS)</span></div>
                  </div>
                </div>

                {/* Signatures Box */}
                <div className="pt-6 mt-4 border-t-2 border-dashed border-saffron/30 grid grid-cols-2 gap-6 text-center text-xs">
                  <div className="space-y-10">
                    <div className="h-8" />
                    <div className="border-t border-charcoal/50 pt-1 font-bold text-charcoal">
                      देणगीदाराची स्वाक्षरी (Donor's Signature)
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

export default DonationRegistrationPage;
