import React, { useState, useEffect } from 'react';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import StepIndicator from '../../components/StepIndicator';
import ConfirmModal, { type ConfirmState } from '../../components/ConfirmModal';
import { ArrowLeft, ArrowRight, CheckCircle2, X } from 'lucide-react';
import { api, type State, type District, type City, type BloodGroup, type MaritalStatus, type Religion, type Height } from '../../services/api';
import { uploadImage, imageUrl, deleteImage, fetchByCategory, type GalleryImage  } from '../../services/galleryApi';
import { Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { validateMarriageForm, type MarriageFormErrors } from '../../utils/validations';


export const MarriageRegistrationPage: React.FC = () => {
  const [profileType, setProfileType] = useState<'bride' | 'groom'>('bride'); 
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<MarriageFormErrors>({});

  // Lookups loaded from DB
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [bloodGroups, setBloodGroups] = useState<BloodGroup[]>([]);
  const [maritalStatuses, setMaritalStatuses] = useState<MaritalStatus[]>([]);
  const [religions, setReligions] = useState<Religion[]>([]);
  const [heights, setHeights] = useState<Height[]>([]);
  const [, setMainPhotoFile] = useState<File | null>(null);
  const [mainPhotoPreview, setMainPhotoPreview] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const { isAdmin } = useAuth();
  const [bannerImage, setBannerImage] = useState<GalleryImage | null>(null);
  const BANNER_SECTION_KEY = 'marriage_registration_banner';

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
  const [formData, setFormData] = useState({
    // Step 1: वैयक्तिक माहिती
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

    // Step 2: शैक्षणिक माहिती
    educationLevel: '',
    degreeName: '',
    schoolCollege: '',
    passingYear: '',

    // Step 3: व्यावसायिक माहिती
    occupationType: '',
    designation: '',
    companyName: '',
    annualIncome: '',

    // Step 4: कुटुंबाची माहिती
    fatherName: '',
    fatherOccupation: '',
    motherName: '',
    brothers: '0',
    sisters: '0',
    familyBackground: '',

    // Step 5: फोटो अपलोड (mock files)
    mainPhotoUploaded: false,
    fullPhotoUploaded: false,

    // Declaration checkbox
    declaration: false,
  });

  // Load lookups on mount
  useEffect(() => {
    const loadLookups = async () => {
      const [statesRes, bloodRes, maritalRes, religionRes, heightRes] = await Promise.allSettled([
        api.getStates(),
        api.getBloodGroups(),
        api.getMaritalStatuses(),
        api.getReligions(),
        api.getHeights()
      ]);

      if (statesRes.status === 'fulfilled') {
        setStates(statesRes.value);

        // Pre-select Maharashtra
        const mh = statesRes.value.find(s => s.nameEn === 'Maharashtra');
        if (mh) {
          setFormData(prev => ({ ...prev, stateId: mh.id.toString() }));
          try {
            const mhDistricts = await api.getDistricts(mh.id);
            setDistricts(mhDistricts);
          } catch (err) {
            console.error('Error loading districts:', err);
          }
        }
      } else {
        console.error('Error loading states:', statesRes.reason);
      }

      if (bloodRes.status === 'fulfilled') setBloodGroups(bloodRes.value);
      else console.error('Error loading blood groups:', bloodRes.reason);

      if (maritalRes.status === 'fulfilled') setMaritalStatuses(maritalRes.value);
      else console.error('Error loading marital statuses:', maritalRes.reason);

      if (religionRes.status === 'fulfilled') setReligions(religionRes.value);
      else console.error('Error loading religions:', religionRes.reason);

      if (heightRes.status === 'fulfilled') setHeights(heightRes.value);
      else console.error('Error loading heights:', heightRes.reason);
    };
    loadLookups();
  }, []);


  const steps = [
    'वैयक्तिक माहिती',
    'शैक्षणिक माहिती',
    'व्यावसायिक माहिती',
    'कुटुंबाची माहिती',
    'फोटो अपलोड करा',
    'पुष्टीकरण'
  ];

  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleMainPhotoSelect = (file: File) => {
    setMainPhotoFile(file);
    setMainPhotoPreview(URL.createObjectURL(file));
    setFormData(prev => ({ ...prev, mainPhotoUploaded: true }));
    if (errors.mainPhotoUploaded) {
      setErrors(prev => ({ ...prev, mainPhotoUploaded: undefined }));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'mobile' || name === 'parentMobile') {
      val = value.replace(/[^0-9]/g, '').slice(0, 10);
    }
    setFormData((prev) => ({ ...prev, [name]: val }));
    if (errors[name as keyof MarriageFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateIdVal = e.target.value;
    setFormData(prev => ({ ...prev, stateId: stateIdVal, districtId: '', city: '' }));
    setDistricts([]);
    setCities([]);
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
    setFormData(prev => ({ ...prev, districtId: districtIdVal, city: '' }));
    setCities([]);
    if (errors.districtId) {
      setErrors((prev) => ({ ...prev, districtId: undefined }));
    }
    if (districtIdVal) {
      try {
        const data = await api.getCities(Number(districtIdVal));
        setCities(data);
      } catch (err) {
        console.error('Error loading cities:', err);
      }
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
    if (errors[name as keyof MarriageFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate current step
    const { isValid, errors: stepErrors, firstErrorField } = validateMarriageForm(formData, currentStep);
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

    // Clear step errors if valid
    const newErrors = { ...errors };
    Object.keys(stepErrors).forEach((key) => {
      delete (newErrors as any)[key];
    });
    setErrors(newErrors);

    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Final submit check for whole form
      const { isValid: formValid, errors: formErrors, firstErrorField, firstErrorStep } = validateMarriageForm(formData);
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

      // Final Submit to Backend
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
        fatherOccupation: formData.fatherOccupation,
        motherName: formData.motherName,
        brothers: Number(formData.brothers),
        sisters: Number(formData.sisters),
        familyBackground: formData.familyBackground || null,
        mainPhotoUploaded: formData.mainPhotoUploaded,
        fullPhotoUploaded: formData.fullPhotoUploaded,
        declaration: formData.declaration
      };

      try {
        await api.registerMarriage(payload);
        setShowSuccessModal(true);

        // Reset form
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
          motherName: '',
          brothers: '0',
          sisters: '0',
          familyBackground: '',
          mainPhotoUploaded: false,
          fullPhotoUploaded: false,
          declaration: false,
        });
        setMainPhotoFile(null);
        setMainPhotoPreview(null);
        setErrors({});
        setCurrentStep(1);
      } catch (err: any) {
        alert('नोंदणी करताना त्रुटी आली: ' + err.message);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  // Previews labels
  const selectedState = states.find(s => s.id === Number(formData.stateId));
  const selectedDistrict = districts.find(d => d.id === Number(formData.districtId));
  const selectedBloodLabel = bloodGroups.find(b => b.code === formData.bloodGroup)?.labelMr || formData.bloodGroup;
  const selectedMaritalLabel = maritalStatuses.find(m => m.code === formData.maritalStatus)?.labelMr || formData.maritalStatus;

  return (
    <div className="flex flex-col w-full pb-8">
      {/* 1. Hero Banner */}
      <section className="relative w-full overflow-hidden bg-cream-dark/20 p-2 md:p-4">
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

      {/* 2. Form Section */}
      <section className="w-full px-4 py-8 max-w-6xl mx-auto">

        {/* Bride/Groom Selector */}
        <div className="mb-8">
          <p className="text-center text-sm font-bold text-charcoal/70 mb-5 flex items-center justify-center gap-3" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
            <span className="hidden sm:inline-block h-px w-12 bg-gradient-to-r from-transparent to-saffron/40" />
            आपण कोण म्हणून नोंदणी करीत आहात?
            <span className="hidden sm:inline-block h-px w-12 bg-gradient-to-l from-transparent to-saffron/40" />
          </p>

          <div className="relative flex items-center justify-center gap-3 sm:gap-5 max-w-xl mx-auto">
            {/* Bride Card */}
            <button
              type="button"
              onClick={() => setProfileType('bride')}
              className={`relative flex-1 flex flex-row items-center justify-between rounded-2xl border-2 py-3 px-4  transition-all duration-300 cursor-pointer ${profileType === 'bride'
                ? 'border-saffron bg-gradient-to-b from-orange-50 to-orange-100/60 shadow-md shadow-lg shadow-saffron/10'
                : 'border-charcoal/10 bg-white hover:border-saffron/30 hover:shadow-md'
                }`}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden mb-2 bg-orange-50 flex items-center justify-center">
                <img src="/bride.png" alt="वधू" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="font-extrabold text-saffron text-base sm:text-lg" style={{ fontFamily: "'Baloo 2', sans-serif" }}>वधू</span>
                <span className="text-[11px] sm:text-xs text-charcoal/50 font-semibold mt-0.5">Bride</span>
              </div>
              <span
                className={`mt-2.5 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${profileType === 'bride' ? 'border-saffron bg-white' : 'border-charcoal/25 bg-white'
                  }`}
              >
                {profileType === 'bride' && <span className="h-2.5 w-2.5 rounded-full bg-saffron" />}
              </span>
            </button>

            {/* किंवा divider */}
            <span className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 rounded-full border-2 border-saffron/30 bg-cream items-center justify-center text-[10px] sm:text-[11px] font-extrabold text-saffron-dark shadow-sm z-10">
              किंवा
            </span>

            {/* Groom Card */}
            <button
              type="button"
              onClick={() => setProfileType('groom')}
              className={`relative flex-1 flex flex-row items-center justify-between rounded-2xl border-2 py-3 px-4 transition-all duration-300 cursor-pointer ${profileType === 'groom'
                ? 'border-saffron bg-gradient-to-b from-orange-50 to-orange-100/60 shadow-md shadow-lg shadow-saffron/10'
                : 'border-charcoal/10 bg-white hover:border-saffron/30 hover:shadow-md'
                }`}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden mb-2 bg-amber-50 flex items-center justify-center">
                <img src="/groom.png" alt="वर" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="font-extrabold text-saffron text-base sm:text-lg" style={{ fontFamily: "'Baloo 2', sans-serif" }}>वर</span>
                <span className="text-[11px] sm:text-xs text-charcoal/50 font-semibold mt-0.5">Groom</span>
              </div>
              <span
                className={`mt-2.5 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${profileType === 'groom' ? 'border-saffron bg-white' : 'border-charcoal/25 bg-white'
                  }`}
              >
                {profileType === 'groom' && <span className="h-2.5 w-2.5 rounded-full bg-saffron" />}
              </span>
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* Left Column: Vertical Step Indicator (Desktop) / Horizontal (Mobile) */}
          <div className="lg:col-span-1 bg-white rounded-card-lg border border-saffron/5 shadow-soft p-5 h-fit">
            <h3 className="text-sm font-bold text-saffron mb-4 border-b border-saffron/5 pb-2 hidden lg:block" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              नोंदणीचे टप्पे
            </h3>

            {/* Display Vertical on Desktop, Horizontal on Mobile */}
            <div className="hidden lg:block">
              <StepIndicator steps={steps} currentStep={currentStep} layout="vertical" />
            </div>
            <div className="block lg:hidden">
              <StepIndicator steps={steps} currentStep={currentStep} layout="horizontal" />
            </div>
          </div>

          {/* Right Column: Form Container */}
          <div className="lg:col-span-3 bg-white rounded-card-lg border border-saffron/5 shadow-soft p-6 md:p-8">
            <form onSubmit={handleNext} className="space-y-6">

              <h2 className="text-xl font-bold text-saffron border-b border-saffron/5 pb-3" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                पायरी {currentStep}: {steps[currentStep - 1]}
              </h2>

              {/* STEP 1: वैयक्तिक माहिती */}
              {currentStep === 1 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">पूर्ण नाव <span className="text-red-500">*</span></label>
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
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">जन्म तारीख <span className="text-red-500">*</span></label>
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
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">उंची (फूट/इंच) <span className="text-red-500">*</span></label>
                    <select
                      name="height"
                      value={formData.height}
                      onChange={handleInputChange}
                      className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-white transition-all ${
                        errors.height
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                      }`}
                    >
                      <option value="">निवडा</option>
                      {heights.map(h => (
                        <option key={h.heightId} value={h.heightText}>{h.heightText}</option>
                      ))}
                    </select>
                    {errors.height && <p className="text-red-500 text-xs mt-1">{errors.height}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">रक्तगट <span className="text-red-500">*</span></label>
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
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">वैवाहिक स्थिती <span className="text-red-500">*</span></label>
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
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">धर्म <span className="text-red-500">*</span></label>
                    <select
                      name="religion"
                      value={formData.religion}
                      onChange={handleInputChange}
                      className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-white transition-all ${
                        errors.religion
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                      }`}
                    >
                      <option value="">निवडा</option>
                      {religions.map(r => (
                        <option key={r.religionId} value={r.religionName}>{r.religionName}</option>
                      ))}
                    </select>
                    {errors.religion && <p className="text-red-500 text-xs mt-1">{errors.religion}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">जात/उपजात  <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="caste"
                      value={formData.caste}
                      onChange={handleInputChange}
                      placeholder="उदा. मराठा, कुणबी"
                      className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${
                        errors.caste
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                      }`}
                    />
                    {errors.caste && <p className="text-red-500 text-xs mt-1">{errors.caste}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">गोत्र</label>
                    <input
                      type="text"
                      name="gotra"
                      value={formData.gotra}
                      onChange={handleInputChange}
                      placeholder="उदा. कश्यप"
                      className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">मंगळ दोष आहे का? <span className="text-red-500">*</span></label>
                    <select
                      name="manglik"
                      value={formData.manglik}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-white"
                    >
                      <option value="no">नाही</option>
                      <option value="yes">होय</option>
                      <option value="unknown">माहित नाही</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">राज्य <span className="text-red-500">*</span></label>
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
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">जिल्हा <span className="text-red-500">*</span></label>
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
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">शहर <span className="text-red-500">*</span></label>
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
                      <option value="">निवडा</option>
                      {cities && cities.map((city) => (
                        <option key={city.id} value={city.nameMr}>
                          {city.nameMr}
                        </option>
                      ))}
                    </select>
                    {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">मोबाईल नंबर <span className="text-red-500">*</span></label>
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
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">पालकांचा / पालकांचे संपर्क नंबर <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      name="parentMobile"
                      value={formData.parentMobile}
                      onChange={handleInputChange}
                      maxLength={10}
                      inputMode="numeric"
                      pattern="\d*"
                      placeholder="पालकांचा संपर्क नंबर"
                      className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${
                        errors.parentMobile
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                      }`}
                    />
                    {errors.parentMobile && <p className="text-red-500 text-xs mt-1">{errors.parentMobile}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">स्वतःबद्दल थोडक्यात (उदा. छंद, व्यक्तिमत्त्व) <span className="text-red-500">*</span></label>
                    <textarea
                      name="aboutSelf"
                      value={formData.aboutSelf}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="स्वतःबद्दल थोडी माहिती लिहा..."
                      className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 resize-none transition-all ${
                        errors.aboutSelf
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                      }`}
                    />
                    {errors.aboutSelf && <p className="text-red-500 text-xs mt-1">{errors.aboutSelf}</p>}
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">आपली अपेक्षा (जोडीदाराकडून अपेक्षा) <span className="text-red-500">*</span></label>
                    <textarea
                      name="expectations"
                      value={formData.expectations}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="भावी जोडीदाराकडून आपल्या अपेक्षा काय आहेत..."
                      className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 resize-none transition-all ${
                        errors.expectations
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                      }`}
                    />
                    {errors.expectations && <p className="text-red-500 text-xs mt-1">{errors.expectations}</p>}
                  </div>
                </div>
              )}

              {/* STEP 2: शैक्षणिक माहिती */}
              {currentStep === 2 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">शिक्षण स्तर <span className="text-red-500">*</span></label>
                    <select
                      name="educationLevel"
                      value={formData.educationLevel}
                      onChange={handleInputChange}
                      className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-white transition-all ${
                        errors.educationLevel
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
                    {errors.educationLevel && <p className="text-red-500 text-xs mt-1">{errors.educationLevel}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">पदवीचे नाव (उदा. BE, BCom, MBA) <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="degreeName"
                      value={formData.degreeName}
                      onChange={handleInputChange}
                      placeholder="उदा. B.A., M.B.B.S."
                      className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${
                        errors.degreeName
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                      }`}
                    />
                    {errors.degreeName && <p className="text-red-500 text-xs mt-1">{errors.degreeName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">शाळा / कॉलेजचे नाव</label>
                    <input
                      type="text"
                      name="schoolCollege"
                      value={formData.schoolCollege}
                      onChange={handleInputChange}
                      placeholder="उदा. पुणे युनिव्हर्सिटी"
                      className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">उत्तीर्ण वर्ष <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="passingYear"
                      value={formData.passingYear}
                      onChange={handleInputChange}
                      placeholder="उदा. २०१५"
                      className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${
                        errors.passingYear
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                      }`}
                    />
                    {errors.passingYear && <p className="text-red-500 text-xs mt-1">{errors.passingYear}</p>}
                  </div>
                </div>
              )}

              {/* STEP 3: व्यावसायिक माहिती */}
              {currentStep === 3 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {formData.occupationType !== 'not_working' && (
                    <>
                      {formData.occupationType !== 'business' && (
                        <div>
                          <label className="block text-xs font-bold text-charcoal/75 mb-1">पद (Designation) <span className="text-red-500">*</span></label>
                          <input
                            type="text"
                            name="designation"
                            value={formData.designation}
                            onChange={handleInputChange}
                            placeholder="उदा. मॅनेजर, सॉफ्टवेअर इंजिनिअर"
                            className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${
                              errors.designation
                                ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                                : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                            }`}
                          />
                          {errors.designation && <p className="text-red-500 text-xs mt-1">{errors.designation}</p>}
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-bold text-charcoal/75 mb-1">कंपनी / व्यवसायाचे नाव</label>
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          placeholder="उदा. TCS"
                          className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-charcoal/75 mb-1">वार्षिक उत्पन्न (रुपयात) <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          name="annualIncome"
                          value={formData.annualIncome}
                          onChange={handleInputChange}
                          placeholder="उदा. ५,००,०००/-"
                          className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${
                            errors.annualIncome
                              ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                              : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                          }`}
                        />
                        {errors.annualIncome && <p className="text-red-500 text-xs mt-1">{errors.annualIncome}</p>}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* STEP 4: कुटुंबाची माहिती */}
              {currentStep === 4 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">वडिलांचे पूर्ण नाव <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="fatherName"
                      value={formData.fatherName}
                      onChange={handleInputChange}
                      placeholder="वडिलांचे नाव"
                      className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${
                        errors.fatherName
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                      }`}
                    />
                    {errors.fatherName && <p className="text-red-500 text-xs mt-1">{errors.fatherName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">वडिलांचा व्यवसाय / नोकरी <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="fatherOccupation"
                      value={formData.fatherOccupation}
                      onChange={handleInputChange}
                      placeholder="उदा. शेती / निवृत्त"
                      className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${
                        errors.fatherOccupation
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                      }`}
                    />
                    {errors.fatherOccupation && <p className="text-red-500 text-xs mt-1">{errors.fatherOccupation}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">आईचे पूर्ण नाव <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="motherName"
                      value={formData.motherName}
                      onChange={handleInputChange}
                      placeholder="आईचे नाव"
                      className={`w-full px-3.5 py-2.5 rounded-card border text-sm outline-none bg-cream/5 transition-all ${
                        errors.motherName
                          ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                          : 'border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron'
                      }`}
                    />
                    {errors.motherName && <p className="text-red-500 text-xs mt-1">{errors.motherName}</p>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-bold text-charcoal/75 mb-1">भाऊ (संख्या)</label>
                      <input
                        type="number"
                        name="brothers"
                        min="0"
                        value={formData.brothers}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-charcoal/75 mb-1">बहीण (संख्या)</label>
                      <input
                        type="number"
                        name="sisters"
                        min="0"
                        value={formData.sisters}
                        onChange={handleInputChange}
                        className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">कुटुंबाची पार्श्वभूमी / माहिती</label>
                    <textarea
                      name="familyBackground"
                      value={formData.familyBackground}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="कुटुंबाची आर्थिक, सामाजिक माहिती..."
                      className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5 resize-none"
                    />
                  </div>
                </div>
              )}

              {/* STEP 5: फोटो अपलोड करा */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="block text-xs font-bold text-charcoal/75 mb-1">मुख्य प्रोफाइल फोटो <span className="text-red-500">*</span></label>
                      {mainPhotoPreview ? (
                        <div className="relative rounded-card overflow-hidden shadow-soft aspect-square w-full max-w-[300px] mx-auto group">
                          <img
                            src={mainPhotoPreview}
                            alt="मुख्य प्रोफाइल फोटो"
                            className="w-full h-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setMainPhotoFile(null);
                              setMainPhotoPreview(null);
                              setFormData(prev => ({ ...prev, mainPhotoUploaded: false }));
                            }}
                            className="absolute top-2 right-2 p-1.5 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-md transition-colors"
                            title="फोटो काढा"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ) : (
                        <ImagePlaceholder
                          aspectRatio="aspect-square"
                          label="मुख्य फोटो अपलोड करा (+)"
                          onFileSelect={handleMainPhotoSelect}
                          forceInteractive={true}
                          className={`max-w-[300px] mx-auto transition-all ${errors.mainPhotoUploaded ? 'border-red-500' : ''}`}
                        />
                      )}
                      {errors.mainPhotoUploaded && <p className="text-red-500 text-xs mt-1 text-center">{errors.mainPhotoUploaded}</p>}
                      {formData.mainPhotoUploaded && (
                        <span className="text-[11px] text-green-600 font-bold flex items-center gap-1 mt-1 justify-center">
                          <CheckCircle2 size={12} /> मुख्य प्रोफाइल फोटो संलग्न केला.
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 6: पुष्टीकरण */}
              {currentStep === 6 && (
                <div className="space-y-6">
                  <div className="bg-cream/30 border border-saffron/10 rounded-card p-5 space-y-4">
                    <h3 className="text-sm font-bold text-saffron border-b border-saffron/5 pb-2" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                      भरलेल्या माहितीचे पुनरावलोकन (Summary Review)
                    </h3>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-xs font-body">
                      <div>
                        <span className="text-charcoal/50 font-semibold block">नाव:</span>
                        <span className="font-bold text-charcoal/90">{formData.fullName || '-'}</span>
                      </div>
                      <div>
                        <span className="text-charcoal/50 font-semibold block">नोंदणी प्रकार:</span>
                        <span className="font-bold text-saffron">{profileType === 'bride' ? 'वधू (Bride)' : 'वर (Groom)'}</span>
                      </div>
                      <div>
                        <span className="text-charcoal/50 font-semibold block">जन्मतारीख:</span>
                        <span className="font-bold text-charcoal/90">{formData.birthDate || '-'}</span>
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
                        <span className="text-charcoal/50 font-semibold block">शहर व पत्ता:</span>
                        <span className="font-bold text-charcoal/90">
                          {formData.city || '-'}, {selectedDistrict?.nameMr || ''}, {selectedState?.nameMr || ''}
                        </span>
                      </div>
                      <div>
                        <span className="text-charcoal/50 font-semibold block">शिक्षण:</span>
                        <span className="font-bold text-charcoal/90">{formData.degreeName || '-'}</span>
                      </div>
                      <div>
                        <span className="text-charcoal/50 font-semibold block">वार्षिक उत्पन्न:</span>
                        <span className="font-bold text-charcoal/90">{formData.annualIncome || '-'}</span>
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
                        मी याद्वारे घोषित करतो/करते की मी विवाह नोंदणी अर्जामध्ये भरलेली सर्व वैयक्तिक माहिती सत्य आणि अचूक आहे.
                      </label>
                    </div>
                    {errors.declaration && <p className="text-red-500 text-xs mt-1">{errors.declaration}</p>}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between border-t border-saffron/5 pt-5 mt-8">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStep === 1}
                  className={`flex items-center gap-1.5 px-5 py-2 rounded-full font-bold text-xs md:text-sm transition-all duration-300 ${currentStep === 1
                    ? 'bg-cream text-charcoal/30 cursor-not-allowed border border-charcoal/10'
                    : 'bg-white text-saffron hover:bg-cream border border-saffron/20 hover:border-saffron shadow-sm'
                    }`}
                >
                  <ArrowLeft size={16} />
                  <span>मागे जा (Previous)</span>
                </button>

                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-6 py-2 bg-saffron hover:bg-saffron-dark text-white rounded-full font-bold text-xs md:text-sm shadow-md shadow-saffron/20 hover:shadow-lg transition-all duration-300"
                >
                  <span>{currentStep === 6 ? 'नोंदणी पूर्ण करा (Submit)' : 'पुढे जा (Next)'}</span>
                  {currentStep < 6 ? <ArrowRight size={16} /> : <CheckCircle2 size={16} />}
                </button>
              </div>

            </form>
          </div>
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
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-orange-50 to-orange-100 flex items-center justify-center mb-4 shadow-sm border border-saffron/10">
                <CheckCircle2 size={32} className="text-saffron" strokeWidth={2.2} />
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-saffron mb-2" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                अभिनंदन!
              </h3>

              <p className="text-sm text-charcoal/70 leading-relaxed font-body mb-6">
                तुमचा फॉर्म पुढे सबमिट झाला आहे. प्रशासकीय मंजुरीनंतर तुमची नोंदणी पूर्ण होईल.
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

      <ConfirmModal state={confirmState} onClose={closeConfirm} />
    </div>
  );
};

export default MarriageRegistrationPage;