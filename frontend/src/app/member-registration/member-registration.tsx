import React, { useState, useEffect } from 'react';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import StepIndicator from '../../components/StepIndicator';
import ConfirmModal, { type ConfirmState } from '../../components/ConfirmModal';
import { ArrowLeft, ArrowRight, CheckCircle2, FileText, Crown, RefreshCw, QrCode, Upload, Loader2, Plus, Pencil, Trash2, Lock, CreditCard, X, Smartphone, Calendar } from 'lucide-react';
import { api, type State, type District, type Taluka, type Gender, type MaritalStatus, type BloodGroup, type PaymentSettingResponse } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { uploadImage, deleteImage, fetchByCategory, imageUrl, type GalleryImage } from '../../services/galleryApi';
import { buildUpiLink } from '../../utils/upi';
import { QRCodeSVG } from 'qrcode.react';
import { saveDraft, loadDraft, clearDraft } from '../../utils/formPersistence';
import { validateMemberForm, type MemberFormErrors } from '../../utils/validations';

export const MemberRegistrationPage: React.FC = () => {
  const localDraft = loadDraft<any>();

  const [currentStep, setCurrentStep] = useState<number>(() => localDraft?.currentStep ?? 1);
  const [errors, setErrors] = useState<MemberFormErrors>({});
  const [_idProofFile, setIdProofFile] = useState<File | null>(null);
  const [idProofPreview, setIdProofPreview] = useState<string | null>(null);
  const [selectedMemberType, setSelectedMemberType] = useState<'annual' | 'lifetime'>(() => localDraft?.selectedMemberType ?? 'annual');

  // Lookup state loaded from DB
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [talukas, setTalukas] = useState<Taluka[]>([]);
  const [genders, setGenders] = useState<Gender[]>([]);
  const [bloodGroups, setBloodGroups] = useState<BloodGroup[]>([]);
  const [maritalStatuses, setMaritalStatuses] = useState<MaritalStatus[]>([]);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { isAdmin } = useAuth();
  const [bannerImage, setBannerImage] = useState<GalleryImage | null>(null);
  const BANNER_SECTION_KEY = 'member_registration_banner';

  // Payment State
  const [annualPlanAmount, setAnnualPlanAmount] = useState<number>(100);
  const [lifetimePlanAmount, setLifetimePlanAmount] = useState<number>(2000);
  const [paymentAmount, setPaymentAmount] = useState<string>(() => localDraft?.paymentAmount ?? '');
  const [paymentQrSettings, setPaymentQrSettings] = useState<PaymentSettingResponse | null>(null);
  const [_loadingPaymentData, setLoadingPaymentData] = useState<boolean>(false);
  const [paymentMode, setPaymentMode] = useState<string>(() => localDraft?.paymentMode ?? 'GPay');
  const [upiTxnId, setUpiTxnId] = useState<string>(() => localDraft?.upiTxnId ?? '');
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [paymentSuccessMessage, setPaymentSuccessMessage] = useState<string | null>(() => localDraft?.paymentSuccessMessage ?? null);
  const [paymentSubmitted, setPaymentSubmitted] = useState<boolean>(() => localDraft?.paymentSubmitted ?? false);
  const [registeredMemberId, setRegisteredMemberId] = useState<number | null>(() => localDraft?.registeredMemberId ?? null);
  const [_isSubmittingPayment, setIsSubmittingPayment] = useState<boolean>(false);

  const [draftId, setDraftId] = useState<string | null>(() => localDraft?.draftId ?? null);
  const [isRestoring, setIsRestoring] = useState<boolean>(true);

  // Admin QR Code Management Modal State
  const [showAdminQrModal, setShowAdminQrModal] = useState(false);
  const [adminUpiId, setAdminUpiId] = useState('');
  const [adminPayeeName, setAdminPayeeName] = useState('');
  const [adminQrFile, setAdminQrFile] = useState<File | null>(null);
  const [adminQrPreview, setAdminQrPreview] = useState<string | null>(null);
  const [savingAdminQr, setSavingAdminQr] = useState(false);

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

  // Form state
  const [formData, setFormData] = useState<{
    fullName: string;
    birthDate: string;
    gender: string;
    bloodGroup: string;
    maritalStatus: string;
    mobile: string;
    email: string;
    occupation: string;
    education: string;
    idUploaded: boolean;
    occupationType: string;
    designation: string;
    companyName: string;
    annualIncome: string;
    currentAddress: string;
    permanentAddress: string;
    stateId: string;
    districtId: string;
    talukaId: string;
    pincode: string;
    memberType: string;
    idProofNumber: string;
    expectations: string;
    message: string;
    declaration: boolean;
  }>(() => {
    if (localDraft?.formData) {
      return localDraft.formData;
    }
    return {
      // Step 1: वैयक्तिक माहिती
      fullName: '',
      birthDate: '',
      gender: '',
      bloodGroup: '',
      maritalStatus: '',
      mobile: '',
      email: '',
      occupation: '',
      education: '',
      idUploaded: false,
      occupationType: '',
      designation: '',
      companyName: '',
      annualIncome: '',

      // Step 2: पत्ता माहिती
      currentAddress: '',
      permanentAddress: '',
      stateId: '',
      districtId: '',
      talukaId: '',
      pincode: '',

      // Step 3: अतिरिक्त माहिती
      memberType: 'annual',
      idProofNumber: '',
      expectations: '',
      message: '',

      // Declaration
      declaration: false,
    };
  });

  // Load lookup data on mount
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [statesData, gendersData, statusesData, bloodData] = await Promise.all([
          api.getStates(),
          api.getGenders(),
          api.getMaritalStatuses(),
          api.getBloodGroups()
        ]);
        setStates(statesData);
        setGenders(gendersData);
        setMaritalStatuses(statusesData);
        setBloodGroups(bloodData);

        // Pre-select Maharashtra if no state present yet
        const mh = statesData.find(s => s.nameEn === 'Maharashtra');
        setFormData(prev => {
          if (!prev.stateId && mh) {
            api.getDistricts(mh.id).then(setDistricts).catch(console.error);
            return { ...prev, stateId: mh.id.toString() };
          }
          return prev;
        });
      } catch (err) {
        console.error('Error loading lookup values:', err);
      }
    };
    loadLookups();
  }, []);

  // Fetch live amount & active QR settings on mount & when selectedMemberType changes
  useEffect(() => {
    setLoadingPaymentData(true);
    Promise.all([
      api.getMembershipPlans().catch(err => {
        console.error('Error loading plans:', err);
        return [];
      }),
      api.getPaymentQrSettings()
    ]).then(([plans, qrSettings]) => {
      if (plans && plans.length > 0) {
        const annual = plans.find(p => p.planCode === 'annual');
        const lifetime = plans.find(p => p.planCode === 'lifetime');
        if (annual) setAnnualPlanAmount(annual.amount);
        if (lifetime) setLifetimePlanAmount(lifetime.amount);
      }
      setPaymentQrSettings(qrSettings);
    }).catch(err => {
      console.error('Error loading live payment details:', err);
    }).finally(() => {
      setLoadingPaymentData(false);
    });
  }, [selectedMemberType]);

  // Restore lookups and reconcile with server draft
  useEffect(() => {
    const restore = async () => {
      // Re-load lookups if restored from local storage
      if (formData.stateId) {
        api.getDistricts(Number(formData.stateId)).then(setDistricts).catch(console.error);
      }
      if (formData.districtId) {
        api.getTalukas(Number(formData.districtId)).then(setTalukas).catch(console.error);
      }

      // Reconcile with server draft if draftId exists
      if (localDraft?.draftId) {
        try {
          const serverDraft = await api.getDraft(localDraft.draftId);
          if (serverDraft) {
            if (serverDraft.formDataJson) {
              const parsedFormData = JSON.parse(serverDraft.formDataJson);
              setFormData(parsedFormData);
              if (parsedFormData.stateId) {
                api.getDistricts(Number(parsedFormData.stateId)).then(setDistricts).catch(console.error);
              }
              if (parsedFormData.districtId) {
                api.getTalukas(Number(parsedFormData.districtId)).then(setTalukas).catch(console.error);
              }
            }
            if (serverDraft.currentStep !== undefined) setCurrentStep(serverDraft.currentStep);
            if (serverDraft.membershipPlan) setSelectedMemberType(serverDraft.membershipPlan === 'lifetime' ? 'lifetime' : 'annual');
            if (serverDraft.memberId) setRegisteredMemberId(serverDraft.memberId);
            if (serverDraft.draftId) setDraftId(serverDraft.draftId);
          } else {
            clearDraft();
            setFormData({
              fullName: '',
              birthDate: '',
              gender: '',
              bloodGroup: '',
              maritalStatus: '',
              mobile: '',
              email: '',
              occupation: '',
              education: '',
              idUploaded: false,
              occupationType: '',
              designation: '',
              companyName: '',
              annualIncome: '',
              currentAddress: '',
              permanentAddress: '',
              stateId: '',
              districtId: '',
              talukaId: '',
              pincode: '',
              memberType: 'annual',
              idProofNumber: '',
              expectations: '',
              message: '',
              declaration: false,
            });
            setSelectedMemberType('annual');
            setPaymentMode('GPay');
            setUpiTxnId('');
            setScreenshotFile(null);
            setScreenshotPreview(null);
            setPaymentSubmitted(false);
            setRegisteredMemberId(null);
            setDraftId(null);
            setPaymentSuccessMessage(null);
            setPaymentAmount('');
            setCurrentStep(1);
          }
        } catch (err) {
          console.error("Failed to restore draft from server:", err);
        }
      }
      setIsRestoring(false);
    };
    restore();
  }, []);

  // Write draft state to localStorage on every change
  useEffect(() => {
    if (isRestoring) return;
    const draft = {
      formData,
      currentStep,
      selectedMemberType,
      paymentMode,
      upiTxnId,
      paymentSubmitted,
      paymentSuccessMessage,
      registeredMemberId,
      draftId,
      paymentAmount,
    };
    saveDraft(draft);
  }, [formData, currentStep, selectedMemberType, paymentMode, upiTxnId, paymentSubmitted, paymentSuccessMessage, registeredMemberId, draftId, isRestoring, paymentAmount]);

  // Auto-save draft to server when step changes
  useEffect(() => {
    if (isRestoring) return;

    const saveServerDraft = async () => {
      try {
        const payload = {
          draftId: draftId || null,
          currentStep,
          formDataJson: JSON.stringify(formData),
          membershipPlan: selectedMemberType,
          memberId: registeredMemberId || null,
        };
        const response = await api.createOrUpdateDraft(payload);
        if (response && response.draftId && response.draftId !== draftId) {
          setDraftId(response.draftId);
          // IMMEDIATELY save to localStorage to avoid RAM-kill issues
          const draft = {
            formData,
            currentStep,
            selectedMemberType,
            paymentMode,
            upiTxnId,
            paymentSubmitted,
            paymentSuccessMessage,
            registeredMemberId,
            draftId: response.draftId,
          };
          saveDraft(draft);
        }
      } catch (err) {
        console.error("Failed to save draft to server:", err);
      }
    };

    // Save only if user progressed beyond step 1 or draft was already created
    if (currentStep > 1 || draftId) {
      saveServerDraft();
    }
  }, [currentStep, selectedMemberType, registeredMemberId, isRestoring]);



  const steps = [
    'वैयक्तिक माहिती',
    'पत्ता माहिती',
    'अतिरिक्त माहिती',
    'पेमेंट',
    'पुष्टीकरण'
  ];

  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'mobile') {
      val = value.replace(/[^0-9]/g, '').slice(0, 10);
    } else if (name === 'pincode') {
      val = value.replace(/[^0-9]/g, '').slice(0, 6);
    }
    setFormData((prev) => ({ ...prev, [name]: val }));
    if (errors[name as keyof MemberFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateIdVal = e.target.value;
    setFormData(prev => ({ ...prev, stateId: stateIdVal, districtId: '', talukaId: '' }));
    setDistricts([]);
    setTalukas([]);
    if (errors.stateId) {
      setErrors((prev) => ({ ...prev, stateId: undefined }));
    }
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
    setFormData(prev => ({ ...prev, districtId: districtIdVal, talukaId: '' }));
    setTalukas([]);
    if (errors.districtId) {
      setErrors((prev) => ({ ...prev, districtId: undefined }));
    }
    if (districtIdVal) {
      try {
        const data = await api.getTalukas(Number(districtIdVal));
        setTalukas(data);
      } catch (err) {
        console.error('Error loading talukas:', err);
      }
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
    if (errors[name as keyof MemberFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

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
      setErrors((prev) => ({ ...prev, screenshot: undefined }));
    }
  };


  // Submit payment in Step 4
  const handlePaymentSubmit = async (file: File): Promise<boolean> => {
    const finalAmount = (formData.memberType === 'lifetime' ? lifetimePlanAmount.toString() : annualPlanAmount.toString());
    // Generate a unique transaction ID since the manual input has been removed
    const finalTxnId = 'TXN-' + Date.now() + Math.random().toString(36).substring(2, 7).toUpperCase();

    setIsSubmittingPayment(true);
    try {
      let memberId = registeredMemberId;

      // Register member first if not yet created in DB
      if (!memberId) {
        const payload = {
          fullName: formData.fullName,
          birthDate: formData.birthDate,
          gender: formData.gender,
          bloodGroup: formData.bloodGroup,
          maritalStatus: formData.maritalStatus,
          mobile: formData.mobile,
          email: formData.email || null,
          occupation: formData.occupationType || formData.occupation,
          education: formData.education,
          idUploaded: formData.idUploaded,
          currentAddress: formData.currentAddress,
          permanentAddress: formData.permanentAddress,
          state: { id: Number(formData.stateId) },
          district: { id: Number(formData.districtId) },
          taluka: { id: Number(formData.talukaId) },
          pincode: formData.pincode,
          memberType: formData.memberType,
          idProofNumber: formData.idProofNumber || null,
          expectations: formData.expectations || null,
          message: formData.message || null,
          declaration: false
        };

        const savedMember = await api.registerMember(payload);
        memberId = savedMember.id;
        setRegisteredMemberId(savedMember.id);
      }

      if (!memberId) {
        throw new Error('सदस्य नोंदणी प्रक्रिया अपूर्ण राहिली.');
      }

      // Save payment
      const pData = new FormData();
      pData.append('memberId', memberId.toString());
      pData.append('amount', finalAmount);
      pData.append('membershipType', formData.memberType);
      pData.append('paymentMode', 'UPI');
      pData.append('upiTxnId', finalTxnId);
      pData.append('file', file);

      await api.submitPayment(pData);

      setPaymentAmount(finalAmount);
      setUpiTxnId(finalTxnId);
      setPaymentMode('UPI');

      setPaymentSubmitted(true);
      setPaymentSuccessMessage('तुमचे पेमेंट यशस्वी झाले आहे! तुम्ही फॉर्म पुढे सुरू ठेवू शकता.');
      setErrors((prev) => ({ ...prev, screenshot: undefined }));
      return true;

    } catch (err: any) {
      alert('पेमेंट सबमिट करताना त्रुटी आली: ' + (err.message || err));
      return false;
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate current step
    if (currentStep !== 4) {
      const { isValid, errors: stepErrors, firstErrorField } = validateMemberForm(formData, currentStep);
      if (!isValid) {
        setErrors((prev) => ({ ...prev, ...stepErrors }));
        
        if (firstErrorField) {
          setTimeout(() => {
            const element = document.getElementsByName(firstErrorField)[0] || document.getElementById(firstErrorField);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.focus();
            }
          }, 100);
        }
        return;
      }

      // Clear errors for fields in this step
      const newErrors = { ...errors };
      Object.keys(stepErrors).forEach((key) => {
        delete (newErrors as any)[key];
      });
      setErrors(newErrors);
    }

    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else if (currentStep === 4) {
      if (!screenshotFile) {
        setErrors(prev => ({ ...prev, screenshot: 'कृपया पेमेंटचा स्क्रीनशॉट अपलोड करा.' }));
        return;
      }
      if (!paymentSubmitted) {
        setErrors(prev => ({ ...prev, screenshot: 'कृपया प्रथम पेमेंट पूर्ण करा व स्क्रीनशॉट साठवा.' }));
        return;
      }
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.screenshot;
        return copy;
      });
      setCurrentStep(5);
    } else if (currentStep === 5) {
      // Final submit verification: check all steps
      const { isValid: formValid, errors: formErrors, firstErrorField, firstErrorStep } = validateMemberForm(formData);
      if (!formValid) {
        setErrors(formErrors);
        
        if (firstErrorStep) {
          setCurrentStep(firstErrorStep);
        }
        
        if (firstErrorField) {
          setTimeout(() => {
            const element = document.getElementsByName(firstErrorField)[0] || document.getElementById(firstErrorField);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.focus();
            }
          }, 200);
        }
        return;
      }

      setShowSuccessModal(true);

      // Clear draft storage key only after successful final submission
      clearDraft();
      if (draftId) {
        api.deleteDraft(draftId).catch(err => console.error("Failed to delete draft from server:", err));
      }

      // Reset form
      setFormData({
        fullName: '',
        birthDate: '',
        gender: '',
        bloodGroup: '',
        maritalStatus: '',
        mobile: '',
        email: '',
        occupation: '',
        education: '',
        idUploaded: false,
        occupationType: '',
        designation: '',
        companyName: '',
        annualIncome: '',
        currentAddress: '',
        permanentAddress: '',
        stateId: '',
        districtId: '',
        talukaId: '',
        pincode: '',
        memberType: 'annual',
        idProofNumber: '',
        expectations: '',
        message: '',
        declaration: false,
      });
      setSelectedMemberType('annual');
      setPaymentMode('GPay');
      setUpiTxnId('');
      setScreenshotFile(null);
      setScreenshotPreview(null);
      setPaymentSubmitted(false);
      setRegisteredMemberId(null);
      setDraftId(null);
      setPaymentSuccessMessage(null);
      setCurrentStep(1);
      setIdProofFile(null);
      setIdProofPreview(null);
      setErrors({});
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Find names for final preview
  const selectedState = states.find(s => s.id === Number(formData.stateId));
  const selectedDistrict = districts.find(d => d.id === Number(formData.districtId));
  const selectedTaluka = talukas.find(t => t.id === Number(formData.talukaId));
  const selectedGenderLabel = genders.find(g => g.code === formData.gender)?.labelMr || formData.gender;
  const selectedBloodLabel = bloodGroups.find(b => b.code === formData.bloodGroup)?.labelMr || formData.bloodGroup;
  const selectedMaritalLabel = maritalStatuses.find(m => m.code === formData.maritalStatus)?.labelMr || formData.maritalStatus;

  // Live UPI deep link variables
  const currentPlanAmount = formData.memberType === 'lifetime' ? lifetimePlanAmount : annualPlanAmount;
  const upiIdVal = paymentQrSettings?.upiId || 'dapolimadangad@upi';
  const payeeNameVal = paymentQrSettings?.payeeName || 'दापोली मडणगड सेवाभावी संस्था, पुणे';
  const liveUpiLink = buildUpiLink(upiIdVal, payeeNameVal, currentPlanAmount, 'Sadasya Nondani');

  if (isRestoring) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-saffron" size={48} />
        <p className="mt-4 text-charcoal font-medium">कृपया थांबा...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full">
      {/* 1. Hero Banner */}
      <section className="relative w-full overflow-hidden bg-cream-dark/20 p-2 md:p-4 section-gap-top">
        <div className="relative rounded-card-lg overflow-hidden shadow-soft">
          {bannerImage ? (
            <>
              <img
                src={imageUrl(bannerImage.imageUrl)}
                alt="सदस्य नोंदणी बॅनर"
                className="w-full min-h-[140px] sm:min-h-[220px] object-cover"
              />
              {isAdmin && (
                <div className="absolute top-3 right-3 flex gap-2 z-20">
                  <button
                    type="button"
                    onClick={() => document.getElementById('member-banner-input')?.click()}
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
              label="सदस्य नोंदणी बॅनर फोटो (२१:९)"
              className="w-full min-h-[140px] sm:min-h-[220px]"
              onFileSelect={handleBannerUpload}
            />
          )}
          <input
            id="member-banner-input"
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

      {/* 2. Membership Type Selection Below Banner */}
      <section id="membership-type-section" className="w-full px-4 max-w-4xl mx-auto section-gap-top">
        <div className="bg-white border border-saffron/20 rounded-2xl p-5 md:p-6 shadow-soft space-y-5">
          <p className="text-center text-sm font-bold text-charcoal/70 mb-2 flex items-center justify-center gap-3" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
            <span className="hidden sm:inline-block h-px w-12 bg-gradient-to-r from-transparent to-saffron/40" />
            आपण कोणत्या प्रकारचे सदस्यत्व घेऊ इच्छिता?
            <span className="hidden sm:inline-block h-px w-12 bg-gradient-to-l from-transparent to-saffron/40" />
          </p>

          <div className="relative flex items-center justify-center gap-3 sm:gap-5 max-w-xl mx-auto pt-1">
            {/* Annual Option */}
            <button
              type="button"
              onClick={() => {
                if (!paymentSubmitted) {
                  setSelectedMemberType('annual');
                  setFormData(prev => ({ ...prev, memberType: 'annual' }));
                }
              }}
              className={`relative flex-1 flex flex-col items-center justify-between rounded-2xl border-2 py-3 px-4 transition-all duration-300 cursor-pointer ${formData.memberType === 'annual'
                  ? 'border-saffron bg-gradient-to-b from-amber-50 to-amber-100/40 shadow-lg shadow-saffron/10'
                  : 'border-charcoal/10 bg-white hover:border-saffron/30 hover:shadow-md'
                }`}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden mb-2 bg-amber-50 border border-saffron/20 flex items-center justify-center">
                <Calendar className="w-6 h-6 sm:w-7 sm:h-7 text-saffron" />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="font-extrabold text-saffron text-base sm:text-lg" style={{ fontFamily: "'Baloo 2', sans-serif" }}>वार्षिक सदस्यत्व</span>
                <span className="text-[11px] sm:text-xs text-charcoal/50 font-semibold mt-0.5">1 वर्षासाठी वैध</span>
                <span className="text-sm sm:text-base font-extrabold text-saffron-dark font-mono mt-1">
                  ₹{annualPlanAmount}<span className="text-[10px] sm:text-xs text-charcoal/60 font-body">/ वर्ष</span>
                </span>
              </div>
              <span
                className={`mt-2.5 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.memberType === 'annual' ? 'border-saffron bg-white' : 'border-charcoal/25 bg-white'
                  }`}
              >
                {formData.memberType === 'annual' && <span className="h-2.5 w-2.5 rounded-full bg-saffron" />}
              </span>
            </button>

            {/* किंवा divider */}
            <span className="flex h-10 w-10 shrink-0 rounded-full border-2 border-saffron/30 bg-cream items-center justify-center text-[10px] sm:text-[11px] font-extrabold text-saffron-dark shadow-sm z-10 self-center">
              किंवा
            </span>

            {/* Lifetime Option */}
            <button
              type="button"
              onClick={() => {
                if (!paymentSubmitted) {
                  setSelectedMemberType('lifetime');
                  setFormData(prev => ({ ...prev, memberType: 'lifetime' }));
                }
              }}
              className={`relative flex-1 flex flex-col items-center justify-between rounded-2xl border-2 py-3 px-4 transition-all duration-300 cursor-pointer ${formData.memberType === 'lifetime'
                  ? 'border-saffron bg-gradient-to-b from-amber-50 to-amber-100/40 shadow-lg shadow-saffron/10'
                  : 'border-charcoal/10 bg-white hover:border-saffron/30 hover:shadow-md'
                }`}
            >
      

              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden mb-2 bg-amber-50 border border-saffron/20 flex items-center justify-center">
                <Crown className="w-6 h-6 sm:w-7 sm:h-7 text-saffron" />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="font-extrabold text-saffron text-base sm:text-lg" style={{ fontFamily: "'Baloo 2', sans-serif" }}>आजीवन सदस्यत्व</span>
                <span className="text-[11px] sm:text-xs text-charcoal/50 font-semibold mt-0.5">कायमस्वरूपी वैध</span>
                <span className="text-sm sm:text-base font-extrabold text-saffron-dark font-mono mt-1">
                  ₹{lifetimePlanAmount} <span className="text-[10px] sm:text-xs text-charcoal/60 font-body">एकदाच</span>
                </span>
              </div>
              <span
                className={`mt-2.5 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${formData.memberType === 'lifetime' ? 'border-saffron bg-white' : 'border-charcoal/25 bg-white'
                  }`}
              >
                {formData.memberType === 'lifetime' && <span className="h-2.5 w-2.5 rounded-full bg-saffron" />}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. Form Stepper and Container */}
      <section className="w-full px-4 max-w-4xl mx-auto space-y-6 section-gap-top">

        {/* Stepper Card */}
        <div className="bg-white rounded-card-lg border border-saffron/5 shadow-soft p-5">
          <StepIndicator steps={steps} currentStep={currentStep} layout="horizontal" />
        </div>

        {/* Form Content Card */}
        <div className="bg-white rounded-card-lg border border-saffron/5 shadow-soft p-6 md:p-8">
          <form onSubmit={handleNext} className="space-y-6">

            <h2 className="text-xl font-bold text-saffron border-b border-saffron/5 pb-3" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              पायरी {currentStep}: {steps[currentStep - 1]}
            </h2>

            {/* STEP 1: वैयक्तिक माहिती */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">पूर्ण नाव <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="आपले पूर्ण नाव लिहा"
                      className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${
                        errors.fullName
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                      }`}
                    />
                    {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">जन्म तारीख <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      max={getTodayDateString()}
                      className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${
                        errors.birthDate
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                      }`}
                    />
                    {errors.birthDate && <p className="text-red-500 text-xs mt-1">{errors.birthDate}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">लिंग <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-white transition-all ${
                        errors.gender
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                      }`}
                    >
                      <option value="">निवडा</option>
                      {genders.map(g => (
                        <option key={g.id} value={g.code}>{g.labelMr}</option>
                      ))}
                    </select>
                    {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">रक्तगट <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-white transition-all ${
                        errors.bloodGroup
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                      }`}
                    >
                      <option value="">निवडा</option>
                      {bloodGroups.map(b => (
                        <option key={b.id} value={b.code}>{b.labelMr}</option>
                      ))}
                    </select>
                    {errors.bloodGroup && <p className="text-red-500 text-xs mt-1">{errors.bloodGroup}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">वैवाहिक स्थिती <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={handleInputChange}
                      className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-white transition-all ${
                        errors.maritalStatus
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                      }`}
                    >
                      <option value="">निवडा</option>
                      {maritalStatuses.map(m => (
                        <option key={m.id} value={m.code}>{m.labelMr}</option>
                      ))}
                    </select>
                    {errors.maritalStatus && <p className="text-red-500 text-xs mt-1">{errors.maritalStatus}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">मोबाईल क्रमांक <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      maxLength={10}
                      inputMode="numeric"
                      pattern="\d*"
              
                      placeholder="उदा. १० अंकी मोबाईल नंबर"
                      className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${
                        errors.mobile
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                      }`}
                    />
                    {errors.mobile && <p className="text-red-500 text-xs mt-1">{errors.mobile}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">ईमेल आयडी</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="उदा. name@gmail.com"
                      className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${
                        errors.email
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                      }`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">शिक्षण <span className="text-red-500">*</span></label>
                    <select
                      name="education"
                      value={formData.education}
                      onChange={handleInputChange}
                      className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-white transition-all ${
                        errors.education
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                      }`}
                    >
                      <option value="">निवडा</option>
                      <option value="post_graduate">पदव्युत्तर (Post Graduate)</option>
                      <option value="graduate">पदवीधर (Graduate)</option>
                      <option value="diploma">डिप्लोमा (Diploma)</option>
                      <option value="12th">१२ वी उत्तीर्ण</option>
                      <option value="10th">१० वी उत्तीर्ण</option>
                    </select>
                    {errors.education && <p className="text-red-500 text-xs mt-1">{errors.education}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">नोकरी / व्यवसाय प्रकार <span className="text-red-500">*</span></label>
                    <select
                      name="occupationType"
                      value={formData.occupationType}
                      onChange={handleInputChange}
                      className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-white transition-all ${
                        errors.occupationType
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                      }`}
                    >
                      <option value="">निवडा</option>
                      <option value="private_job">खाजगी नोकरी (Private Job)</option>
                      <option value="gov_job">शासकीय नोकरी (Government Job)</option>
                      <option value="business">व्यवसाय (Business)</option>
                      <option value="not_working">काम करत नाही</option>
                    </select>
                    {errors.occupationType && <p className="text-red-500 text-xs mt-1">{errors.occupationType}</p>}
                  </div>
                </div>

                {/* ओळखपत्र (पर्यायी) file upload box */}
                <div className="border border-dashed border-saffron/20 rounded-card p-4 bg-cream/10 space-y-3">
                  <div className="flex items-center gap-2 text-saffron">
                    <FileText size={18} />
                    <span className="text-xs font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>आधार / पॅन / मतदार कार्ड (पर्यायी)</span>
                  </div>
                  {idProofPreview ? (
                    <div className="relative rounded-card overflow-hidden shadow-soft aspect-[21/9] max-h-[150px] w-full mx-auto group">
                      <img
                        src={idProofPreview}
                        alt="ओळखपत्र"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIdProofFile(null);
                          setIdProofPreview(null);
                          setFormData(prev => ({ ...prev, idUploaded: false }));
                        }}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-md transition-colors animate-fade-in"
                        title="काढा"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <ImagePlaceholder
                      aspectRatio="aspect-[21/9]"
                      label="ओळखपत्र अपलोड करा"
                      forceInteractive={true}
                      onFileSelect={(file) => {
                        if (file.size > 2 * 1024 * 1024) {
                          alert('ओळखपत्राचा आकार २ MB पेक्षा जास्त नसावा.');
                          return;
                        }
                        setIdProofFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setIdProofPreview(reader.result as string);
                          setFormData(prev => ({ ...prev, idUploaded: true }));
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="max-h-[120px]"
                    />
                  )}
              
                </div>
              </div>
            )}

            {/* STEP 2: पत्ता माहिती */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-charcoal/75 mb-1">सध्याचा पत्ता <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="currentAddress"
                    value={formData.currentAddress}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="घर क्रमांक, इमारत, गल्ली, भाग, शहर"
                    className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 resize-none transition-all ${
                      errors.currentAddress
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                    }`}
                  />
                  {errors.currentAddress && <p className="text-red-500 text-xs mt-1">{errors.currentAddress}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal/75 mb-1">कायमचा पत्ता (उदा. मूळ गावचा पत्ता) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="permanentAddress"
                    value={formData.permanentAddress}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="उदा. मु. पो. दापोली, जि. रत्नागिरी"
                    className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 resize-none transition-all ${
                      errors.permanentAddress
                        ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                        : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                    }`}
                  />
                  {errors.permanentAddress && <p className="text-red-500 text-xs mt-1">{errors.permanentAddress}</p>}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">राज्य <span className="text-red-500">*</span>
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
                      <option value="">निवडा</option>
                      {states.map(s => (
                        <option key={s.id} value={s.id}>{s.nameMr}</option>
                      ))}
                    </select>
                    {errors.stateId && <p className="text-red-500 text-xs mt-1">{errors.stateId}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">जिल्हा <span className="text-red-500">*</span>
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
                      <option value="">निवडा</option>
                      {districts.map(d => (
                        <option key={d.id} value={d.id}>{d.nameMr}</option>
                      ))}
                    </select>
                    {errors.districtId && <p className="text-red-500 text-xs mt-1">{errors.districtId}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">तालुका <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="talukaId"
                      value={formData.talukaId}
                      onChange={handleInputChange}
                      disabled={!formData.districtId}
                      className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-white disabled:opacity-50 transition-all ${
                        errors.talukaId
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                      }`}
                    >
                      <option value="">निवडा</option>
                      {talukas.map(t => (
                        <option key={t.id} value={t.id}>{t.nameMr}</option>
                      ))}
                    </select>
                    {errors.talukaId && <p className="text-red-500 text-xs mt-1">{errors.talukaId}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">पिनकोड <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      maxLength={6}
                      inputMode="numeric"
                      pattern="\d*"
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

            {/* STEP 3: अतिरिक्त माहिती */}
            {currentStep === 3 && (
              <div className="space-y-4">
                {/* Membership type reminder */}
                <div>
                  <label className="block text-xs font-bold text-charcoal/75 mb-1">सदस्यत्व प्रकार</label>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-card border-2 w-fit border-saffron bg-saffron/5 text-saffron`}>
                    {formData.memberType === 'lifetime' ? <Crown size={16} /> : <RefreshCw size={16} />}
                    <span className="text-sm font-extrabold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                      {formData.memberType === 'lifetime' ? 'आजीवन सदस्य' : 'वार्षिक सदस्य'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal/75 mb-1">ओळख पुरावा क्रमांक (उदा. आधार कार्ड नंबर)</label>
                  <input
                    type="text"
                    name="idProofNumber"
                    value={formData.idProofNumber}
                    onChange={handleInputChange}
                    placeholder="उदा. १२ अंकी आधार क्रमांक"
                    className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal/75 mb-1">संस्थेकडून आपल्या काय अपेक्षा आहेत?</label>
                  <textarea
                    name="expectations"
                    value={formData.expectations}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="उदा. आरोग्य शिबिरे वाढवणे, शैक्षणिक उपक्रम राबवणे..."
                    className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5 resize-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal/75 mb-1">इतर काही संदेश / प्रतिक्रिया</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="आपले मत येथे नोंदवा..."
                    className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5 resize-none"
                  />
                </div>
              </div>
            )}

            {/* STEP 4: सदस्यत्व व पेमेंट */}
            {currentStep === 4 && (
              <div className="space-y-6">

                {/* 1. Selected Membership Info Card */}
                <div className="bg-amber-50/80 border border-saffron/30 rounded-2xl p-5 md:p-6 shadow-xs space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-saffron/10 rounded-xl text-saffron border border-saffron/20">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-charcoal/90" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                          तुम्ही <span className="text-saffron font-extrabold">{formData.memberType === 'lifetime' ? 'आजिवन सदस्यत्व' : 'वार्षिक सदस्यत्व'}</span> निवडले आहे.
                        </h3>
                        <p className="text-xs text-charcoal/60">
                          भराव्याची रक्कम (Read-only): <span className="font-extrabold text-saffron text-sm bg-white px-2.5 py-0.5 rounded-full border border-saffron/30">₹{currentPlanAmount}</span>
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
                        तुम्ही <strong>{formData.memberType === 'lifetime' ? 'आजिवन सदस्यत्व (₹' + currentPlanAmount + ')' : 'वार्षिक सदस्यत्व (₹' + currentPlanAmount + ')'}</strong> निवडले आहे. पेमेंट पूर्ण झाल्यानंतर सदस्यत्वाचा प्रकार बदलता येणार नाही. जर तुम्हाला सदस्यत्वाचा प्रकार बदलायचा असल्यास, तुम्ही बॅनरखाली दिलेल्या <strong>&apos;सदस्यत्व निवडा&apos;</strong> पर्यायातून तो बदलू शकता.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          const elem = document.getElementById('membership-type-section');
                          if (elem) elem.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-saffron hover:underline cursor-pointer"
                      >
                        <RefreshCw size={13} />
                        सदस्यत्व प्रकार बदला (Change Membership)
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. QR Code Scanning & Clickable UPI Link Card */}
                <div className="bg-white border border-charcoal/15 rounded-2xl p-5 md:p-6 shadow-xs space-y-4 text-center">
                  <div className="flex items-center gap-3 text-left">
                    <div className="p-2.5 bg-amber-50 rounded-xl text-saffron border border-saffron/10">
                      <QrCode className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-saffron" style={{ fontFamily: "'Baloo 2', sans-serif" }}>QR कोड स्कॅन करून किंवा UPI ने पेमेंट करा</h3>
                      <p className="text-xs text-charcoal/60">GPay, PhonePe, Paytm किंवा कोणत्याही UPI ॲपने पेमेंट करा</p>
                    </div>
                  </div>

                  {/* Amount Read-Only Badge */}
                  <div className="inline-block bg-saffron text-white font-bold text-sm px-6 py-1.5 rounded-full shadow-xs">
                    भराव्याची रक्कम: ₹{currentPlanAmount}
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
                        <QRCodeSVG value={liveUpiLink} size={180} includeMargin={true} />
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
                      href={liveUpiLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="upi-pay-link inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-extrabold text-xs md:text-sm rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform active:scale-95 cursor-pointer"
                    >
                      <Smartphone size={16} />
                      <span>येथे क्लिक करून UPI ने पैसे भरा</span>
                    </a>
                  </div>
                </div>

                {/* 3. पेमेंट स्क्रीनशॉट अपलोड section */}
                <div className="bg-white border-2 border-saffron/40 rounded-2xl p-5 md:p-6 shadow-md space-y-4">
                  <div className="flex items-center gap-3">
                    {/* <div className="p-2.5 bg-amber-50 rounded-xl text-saffron border border-saffron/10">
                      <Upload className="w-6 h-6" />
                    </div> */}
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
                        id="payment-screenshot-input"
                        accept="image/png, image/jpeg, image/jpg"
                        onChange={handleScreenshotChange}
                        disabled={_isSubmittingPayment}
                        className="hidden"
                      />
                      <button
                        type="button"
                        disabled={_isSubmittingPayment}
                        onClick={() => document.getElementById('payment-screenshot-input')?.click()}
                        className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-saffron/20 hover:border-saffron text-saffron rounded-xl font-bold text-xs shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        {_isSubmittingPayment ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Upload size={16} />
                        )}
                        <span>
                          {_isSubmittingPayment
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
                        {!_isSubmittingPayment && (
                          <div className="absolute top-1.5 right-1.5 flex gap-1.5 z-10">
                            <button
                              type="button"
                              onClick={() => document.getElementById('payment-screenshot-input')?.click()}
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
                                const input = document.getElementById('payment-screenshot-input') as HTMLInputElement;
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

                  {!paymentSubmitted && (
                    <div className="pt-2">
                      {/* <button
                        type="button"
                        onClick={handlePaymentSubmit}
                        disabled={_isSubmittingPayment}
                        className="w-full md:w-auto px-6 py-2.5 bg-saffron hover:bg-saffron-dark text-white rounded-full font-bold text-xs md:text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
                      >
                        {_isSubmittingPayment && <Loader2 size={16} className="animate-spin" />}
                        <span>मी पेमेंट पूर्ण केले ✓</span>
                      </button> */}
                    </div>
                  )}

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

            {/* STEP 5: पुष्टीकरण (Confirmation) */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="bg-cream/30 border border-saffron/10 rounded-card p-5 space-y-4">
                  <h3 className="text-sm font-bold text-saffron border-b border-saffron/5 pb-2" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                    तपशील पुनरावलोकन (Summary Review)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-body">
                    <div>
                      <span className="text-charcoal/50 font-semibold block">नाव:</span>
                      <span className="font-bold text-charcoal/90">{formData.fullName || '-'}</span>
                    </div>
                    <div>
                      <span className="text-charcoal/50 font-semibold block">मोबाईल क्रमांक:</span>
                      <span className="font-bold text-charcoal/90">{formData.mobile || '-'}</span>
                    </div>
                    <div>
                      <span className="text-charcoal/50 font-semibold block">लिंग:</span>
                      <span className="font-bold text-charcoal/90">{selectedGenderLabel || '-'}</span>
                    </div>
                    <div>
                      <span className="text-charcoal/50 font-semibold block">रक्तगट:</span>
                      <span className="font-bold text-charcoal/90">{selectedBloodLabel || '-'}</span>
                    </div>
                    <div>
                      <span className="text-charcoal/50 font-semibold block">वैवाहिक स्थिती:</span>
                      <span className="font-bold text-charcoal/90">{selectedMaritalLabel || '-'}</span>
                    </div>
                    <div>
                      <span className="text-charcoal/50 font-semibold block">ईमेल आयडी:</span>
                      <span className="font-bold text-charcoal/90">{formData.email || '-'}</span>
                    </div>
                    <div>
                      <span className="text-charcoal/50 font-semibold block">सदस्यत्व प्रकार:</span>
                      <span className="font-bold text-saffron uppercase" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                        {formData.memberType === 'lifetime' ? 'आजीवन (Lifetime) - ₹' + lifetimePlanAmount : 'वार्षिक (Annual) - ₹' + annualPlanAmount}
                      </span>
                    </div>
                    {/* <div>
                      <span className="text-charcoal/50 font-semibold block">पेमेंट माध्यम व Txn ID:</span>
                      <span className="font-bold text-emerald-800">
                        {paymentMode} - {upiTxnId || 'सादर केले'}
                      </span>
                    </div> */}
                    <div>
                      <span className="text-charcoal/50 font-semibold block">पत्ता:</span>
                      <span className="font-bold text-charcoal/90">
                        {formData.currentAddress || '-'}, {selectedTaluka?.nameMr || ''}, {selectedDistrict?.nameMr || ''}, {selectedState?.nameMr || ''} - {formData.pincode}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-1 mt-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="declaration"
                      name="declaration"
                      checked={formData.declaration}
                      onChange={handleCheckboxChange}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-saffron focus:ring-saffron cursor-pointer"
                    />
                    <label htmlFor="declaration" className="text-xs font-semibold text-charcoal/80 leading-normal cursor-pointer select-none">
                      मी याद्वारे घोषित करतो/करते की मी संस्थेच्या नियम व अटींचे पालन करेन आणि अर्जामध्ये भरलेली सर्व माहिती सत्य आहे.
                    </label>
                  </div>
                  {errors.declaration && <p className="text-red-500 text-xs mt-1">{errors.declaration}</p>}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between border-t border-saffron/5 pt-5 mt-8">
              <button
                type="button"
                onClick={handlePrev}
                disabled={currentStep === 1}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-full font-bold text-xs md:text-sm transition-all duration-300 ${currentStep === 1
                  ? 'bg-cream text-charcoal/30 cursor-not-allowed border border-charcoal/10'
                  : 'bg-white text-saffron hover:text-saffron-dark hover:bg-cream border border-saffron/20 hover:border-saffron shadow-sm'
                  }`}
              >
                <ArrowLeft size={16} />
                <span>परत जा (Previous)</span>
              </button>

              <button
                type="submit"
                disabled={currentStep === 4 && !paymentSubmitted}
                className={`flex items-center gap-1.5 px-6 py-2 rounded-full font-bold text-xs md:text-sm shadow-md transition-all duration-300 ${currentStep === 4 && !paymentSubmitted
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed shadow-none'
                    : 'bg-saffron hover:bg-saffron-dark text-white shadow-saffron/20 hover:shadow-lg'
                  }`}
              >
                <span>
                  {currentStep === 5
                    ? 'नोंदणी पूर्ण करा (Submit)'
                    : 'पुढे जा (Next)'}
                </span>
                {currentStep < 5 ? <ArrowRight size={16} /> : <CheckCircle2 size={16} />}
              </button>
            </div>

          </form>
        </div>
      </section>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-white rounded-card-lg shadow-2xl border border-saffron/10 overflow-hidden">

            {/* Top accent bar */}
            <div className="h-2 w-full bg-gradient-to-r from-saffron via-saffron-light to-saffron" />

            <div className="flex flex-col items-center text-center px-6 py-8 sm:px-8 sm:py-10">
              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-amber-50 to-amber-100 flex items-center justify-center mb-4 shadow-sm border border-saffron/10">
                <CheckCircle2 size={32} className="text-saffron" strokeWidth={2.2} />
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-saffron mb-2" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                अभिनंदन!
              </h3>

              <p className="text-sm text-charcoal/70 leading-relaxed font-body mb-6">
                तुमचा फॉर्म आणि पेमेंट यशस्वीरित्या सबमिट झाले आहे. प्रशासकीय पडताळणीनंतर तुमची नोंदणी मंजूर होईल.
              </p>

              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="w-full sm:w-auto px-8 py-2.5 bg-saffron hover:bg-saffron-dark text-white rounded-full font-bold text-sm shadow-md shadow-saffron/20 hover:shadow-lg transition-all duration-300"
              >
                ठीक आहे 
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin QR Code Edit Modal */}
      {showAdminQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-saffron/20 space-y-5 relative">
            <div className="flex items-center justify-between border-b border-saffron/10 pb-3">
              <h3 className="text-base font-bold text-saffron flex items-center gap-2" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                <QrCode size={20} />
                {paymentQrSettings?.qrImageUrl ? 'QR कोड आणि UPI माहिती बदला' : 'नवीन QR कोड जोडा'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAdminQrModal(false)}
                className="text-charcoal/40 hover:text-saffron p-1 rounded-full hover:bg-cream"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveAdminQr} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal/80 mb-1">
                  पेई नाव (Payee Name)
                </label>
                <input
                  type="text"
                  value={adminPayeeName}
                  onChange={(e) => setAdminPayeeName(e.target.value)}
                  placeholder="उदा. दापोली मडणगड सेवाभावी संस्था, पुणे"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal/20 focus:border-saffron text-sm outline-none bg-cream/5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal/80 mb-1">
                  UPI आयडी (UPI ID) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={adminUpiId}
                  onChange={(e) => setAdminUpiId(e.target.value)}
                  required
                  placeholder="उदा. dapolimadangad@upi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal/20 focus:border-saffron text-sm outline-none bg-cream/5 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal/80 mb-1">
                  QR कोड फोटो अपलोड करा (JPG/PNG)
                </label>
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
                  className="w-full text-xs text-charcoal/70 file:mr-3 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-bold file:bg-saffron/10 file:text-saffron hover:file:bg-saffron hover:file:text-white cursor-pointer"
                />
                {adminQrPreview && (
                  <div className="mt-3 flex justify-center">
                    <img src={adminQrPreview} alt="QR Preview" className="w-32 h-32 object-contain rounded-xl border border-saffron/20 shadow-xs" />
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-saffron/10">
                <button
                  type="button"
                  onClick={() => setShowAdminQrModal(false)}
                  className="px-4 py-2 text-xs font-bold text-charcoal/60 hover:text-charcoal border border-charcoal/20 rounded-full"
                >
                  रद्द करा (Cancel)
                </button>
                <button
                  type="submit"
                  disabled={savingAdminQr}
                  className="px-6 py-2 bg-saffron hover:bg-saffron-dark text-white text-xs font-bold rounded-full shadow-md flex items-center gap-2"
                >
                  {savingAdminQr && <Loader2 size={14} className="animate-spin" />}
                  <span>जतन करा (Save)</span>
                </button>
              </div>
            </form>
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

export default MemberRegistrationPage;
