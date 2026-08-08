import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import StepIndicator from '../../components/StepIndicator';
import { Heart, ArrowLeft, ArrowRight, HelpCircle, CheckCircle2 } from 'lucide-react';
import { api, type State, type District, type City, type BloodGroup, type MaritalStatus, type Religion, type Height } from '../../services/api';

export const MarriageRegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const [profileType, setProfileType] = useState<'bride' | 'groom'>('bride'); // वधू / वर
  const [currentStep, setCurrentStep] = useState(1);

  // Lookups loaded from DB
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [bloodGroups, setBloodGroups] = useState<BloodGroup[]>([]);
  const [maritalStatuses, setMaritalStatuses] = useState<MaritalStatus[]>([]);
  const [religions, setReligions] = useState<Religion[]>([]);
  const [heights, setHeights] = useState<Height[]>([]);

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
      try {
        const [statesData, bloodData, maritalData, religionData, heightData] = await Promise.all([
          api.getStates(),
          api.getBloodGroups(),
          api.getMaritalStatuses(),
          api.getReligions(),
          api.getHeights()
        ]);
        setStates(statesData);
        setBloodGroups(bloodData);
        setMaritalStatuses(maritalData);
        setReligions(religionData);
        setHeights(heightData);

        // Pre-select Maharashtra
        const mh = statesData.find(s => s.nameEn === 'Maharashtra');
        if (mh) {
          setFormData(prev => ({ ...prev, stateId: mh.id.toString() }));
          const mhDistricts = await api.getDistricts(mh.id);
          setDistricts(mhDistricts);
        }
      } catch (err) {
        console.error('Error loading lookup values:', err);
      }
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateIdVal = e.target.value;
    setFormData(prev => ({ ...prev, stateId: stateIdVal, districtId: '', city: '' }));
    setDistricts([]);
    setCities([]);
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
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 6) {
      setCurrentStep((prev) => prev + 1);
    } else {
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
        alert('तुमचा फॉर्म पुढे सबमिट झाला आहे. प्रशासकीय मंजुरीनंतर तुमची नोंदणी पूर्ण होईल.');

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

  const isNotWorking = formData.occupationType === 'not_working';
  const isBusiness = formData.occupationType === 'business';

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
          <ImagePlaceholder
            aspectRatio="aspect-[16/9] md:aspect-[21/9]"
            label="विवाह नोंदणी बॅनर फोटो (२१:९)"
            className="w-full min-h-[140px] sm:min-h-[220px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-maroon/80 to-transparent flex items-end p-6 z-10">
            <div className="flex items-center gap-3">
              {/* <div className="p-2 bg-saffron rounded-full text-white shadow-md">
                <Heart size={24} className="fill-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-heading m-0">
                विवाह नोंदणी
              </h1> */}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Form Section */}
      <section className="w-full px-4 py-8 max-w-6xl mx-auto">

        {/* Bride/Groom Selector */}
        <div className="mb-8">
          <p className="text-center text-sm font-bold text-charcoal/70 mb-5 flex items-center justify-center gap-3 font-heading">
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
                ? 'border-maroon bg-gradient-to-b from-rose-50 to-rose-100/60 shadow-md shadow-md shadow-lg shadow-maroon/10'
                : 'border-charcoal/10 bg-white hover:border-maroon/30 hover:shadow-md'
                }`}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden mb-2 bg-rose-50 flex items-center justify-center">
                <img src="/bride.png" alt="वधू" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="font-extrabold text-maroon text-base sm:text-lg font-heading">वधू</span>
                <span className="text-[11px] sm:text-xs text-charcoal/50 font-semibold mt-0.5">Bride</span>
              </div>
              <span
                className={`mt-2.5 h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${profileType === 'bride' ? 'border-maroon bg-white' : 'border-charcoal/25 bg-white'
                  }`}
              >
                {profileType === 'bride' && <span className="h-2.5 w-2.5 rounded-full bg-maroon" />}
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
                ? 'border-saffron bg-gradient-to-b from-rose-50 to-rose-100/60 shadow-mdshadow-lg shadow-saffron/10'
                : 'border-charcoal/10 bg-white hover:border-saffron/30 hover:shadow-md'
                }`}
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden mb-2 bg-amber-50 flex items-center justify-center">
                <img src="/groom.png" alt="वर" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col text-left leading-tight">
                <span className="font-extrabold text-maroon text-base sm:text-lg font-heading">वर</span>
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
          <div className="lg:col-span-1 bg-white rounded-card-lg border border-maroon/5 shadow-soft p-5 h-fit">
            <h3 className="text-sm font-bold text-maroon mb-4 font-heading border-b border-maroon/5 pb-2 hidden lg:block">
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
          <div className="lg:col-span-3 bg-white rounded-card-lg border border-maroon/5 shadow-soft p-6 md:p-8">
            <form onSubmit={handleNext} className="space-y-6">

              <h2 className="text-xl font-bold font-heading text-maroon border-b border-maroon/5 pb-3">
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
                      required
                      placeholder="आपले पूर्ण नाव लिहा"
                      className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">जन्म तारीख <span className="text-red-500">*</span></label>
                    <input
                      type="date"
                      name="birthDate"
                      value={formData.birthDate}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">उंची (फूट/इंच) <span className="text-red-500">*</span></label>
                    <select
                      name="height"
                      value={formData.height}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-white"
                    >
                      <option value="">निवडा</option>
                      {heights.map(h => (
                        <option key={h.heightId} value={h.heightText}>{h.heightText}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">रक्तगट <span className="text-red-500">*</span></label>
                    <select
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-white"
                    >
                      <option value="">निवडा</option>
                      {bloodGroups.map(b => (
                        <option key={b.id} value={b.code}>{b.labelMr}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">वैवाहिक स्थिती <span className="text-red-500">*</span></label>
                    <select
                      name="maritalStatus"
                      value={formData.maritalStatus}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-white"
                    >
                      <option value="">निवडा</option>
                      {maritalStatuses.map(m => (
                        <option key={m.id} value={m.code}>{m.labelMr}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">धर्म <span className="text-red-500">*</span></label>
                    <select
                      name="religion"
                      value={formData.religion}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-white"
                    >
                      <option value="">निवडा</option>
                      {religions.map(r => (
                        <option key={r.religionId} value={r.religionName}>{r.religionName}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">जात/उपजात  <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="caste"
                      value={formData.caste}
                      onChange={handleInputChange}
                      required
                      placeholder="उदा. मराठा, कुणबी"
                      className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                    />
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
                      required
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
                      required
                      className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-white"
                    >
                      <option value="">निवडा</option>
                      {states.map(s => (
                        <option key={s.id} value={s.id}>{s.nameMr}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">जिल्हा <span className="text-red-500">*</span></label>
                    <select
                      name="districtId"
                      value={formData.districtId}
                      onChange={handleDistrictChange}
                      required
                      disabled={!formData.stateId}
                      className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-white disabled:opacity-50"
                    >
                      <option value="">निवडा</option>
                      {districts.map(d => (
                        <option key={d.id} value={d.id}>{d.nameMr}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">शहर <span className="text-red-500">*</span></label>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.districtId}
                      className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-white disabled:opacity-50"
                    >
                      <option value="">निवडा</option>
                      {cities && cities.map((city) => (
                        <option key={city.id} value={city.nameMr}>
                          {city.nameMr}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">मोबाईल नंबर <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      required
                      placeholder="१० अंकी नंबर"
                      className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">ईमेल आयडी</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="उदा. info@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">पालकांचा / पालकांचे संपर्क नंबर <span className="text-red-500">*</span></label>
                    <input
                      type="tel"
                      name="parentMobile"
                      value={formData.parentMobile}
                      onChange={handleInputChange}
                      required
                      placeholder="पालकांचा संपर्क नंबर"
                      className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">स्वतःबद्दल थोडक्यात (उदा. छंद, व्यक्तिमत्त्व) <span className="text-red-500">*</span></label>
                    <textarea
                      name="aboutSelf"
                      value={formData.aboutSelf}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      placeholder="स्वतःबद्दल थोडी माहिती लिहा..."
                      className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5 resize-none"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">आपली अपेक्षा (जोडीदाराकडून अपेक्षा) <span className="text-red-500">*</span></label>
                    <textarea
                      name="expectations"
                      value={formData.expectations}
                      onChange={handleInputChange}
                      required
                      rows={3}
                      placeholder="भावी जोडीदाराकडून आपल्या अपेक्षा काय आहेत..."
                      className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5 resize-none"
                    />
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
                      required
                      className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-white"
                    >
                      <option value="">निवडा</option>
                      <option value="post_graduate">पदव्युत्तर (Post Graduate)</option>
                      <option value="graduate">पदवीधर (Graduate)</option>
                      <option value="diploma">डिप्लोमा (Diploma)</option>
                      <option value="12th">१२ वी उत्तीर्ण</option>
                      <option value="10th">१० वी उत्तीर्ण</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">पदवीचे नाव (उदा. BE, BCom, MBA) <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      name="degreeName"
                      value={formData.degreeName}
                      onChange={handleInputChange}
                      required
                      placeholder="उदा. B.A., M.B.B.S."
                      className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                    />
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
                      required
                      placeholder="उदा. २०१५"
                      className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                    />
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
                      required
                      className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-white"
                    >
                      <option value="">निवडा</option>
                      <option value="private_job">खाजगी नोकरी (Private Job)</option>
                      <option value="gov_job">शासकीय नोकरी (Government Job)</option>
                      <option value="business">व्यवसाय (Business)</option>
                      <option value="not_working">काम करत नाही</option>
                    </select>
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
                            required
                            placeholder="उदा. मॅनेजर, सॉफ्टवेअर इंजिनिअर"
                            className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                          />
                        </div>
                      )}
                      <div>
                        <label className="block text-xs font-bold text-charcoal/75 mb-1">कंपनी / व्यवसायाचे नाव</label>
                        <input
                          type="text"
                          name="companyName"
                          value={formData.companyName}
                          onChange={handleInputChange}
                          placeholder="उदा. TCS Ltd"
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
                          required
                          placeholder="उदा. ५,००,०००/-"
                          className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                        />
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
                          required
                          placeholder="वडिलांचे नाव"
                          className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-charcoal/75 mb-1">वडिलांचा व्यवसाय / नोकरी <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          name="fatherOccupation"
                          value={formData.fatherOccupation}
                          onChange={handleInputChange}
                          required
                          placeholder="उदा. शेती / निवृत्त"
                          className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-charcoal/75 mb-1">आईचे पूर्ण नाव <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          name="motherName"
                          value={formData.motherName}
                          onChange={handleInputChange}
                          required
                          placeholder="आईचे नाव"
                          className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                        />
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
                      <p className="text-xs text-charcoal/60 leading-relaxed font-semibold">
                        कृपया वधू / वराचा स्पष्ट फोटो अपलोड करा. फाइल स्वरूप JPG किंवा PNG असावे आणि फाइल आकार २ MB पेक्षा कमी असावा.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="block text-xs font-bold text-charcoal/75 mb-1">मुख्य प्रोफाइल फोटो <span className="text-red-500">*</span></label>
                          <ImagePlaceholder
                            aspectRatio="aspect-square"
                            label={formData.mainPhotoUploaded ? "फोटो अपलोड केला आहे! (बदलण्यासाठी दाबा)" : "मुख्य फोटो अपलोड करा (+)"}
                            onClick={() => setFormData(prev => ({ ...prev, mainPhotoUploaded: true }))}
                          />
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
                      <div className="bg-cream/30 border border-maroon/10 rounded-card p-5 space-y-4">
                        <h3 className="text-sm font-bold text-maroon font-heading border-b border-maroon/5 pb-2">
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

                      <div className="flex items-start gap-3 mt-4">
                        <input
                          type="checkbox"
                          id="declaration"
                          name="declaration"
                          checked={formData.declaration}
                          onChange={handleCheckboxChange}
                          required
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-maroon focus:ring-maroon cursor-pointer"
                        />
                        <label htmlFor="declaration" className="text-xs font-semibold text-charcoal/80 leading-normal cursor-pointer select-none">
                          मी याद्वारे घोषित करतो/करते की मी विवाह नोंदणी अर्जामध्ये भरलेली सर्व वैयक्तिक माहिती सत्य आणि अचूक आहे.
                        </label>
                      </div>
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <div className="flex items-center justify-between border-t border-maroon/5 pt-5 mt-8">
                    <button
                      type="button"
                      onClick={handlePrev}
                      disabled={currentStep === 1}
                      className={`flex items-center gap-1.5 px-5 py-2 rounded-full font-bold text-xs md:text-sm transition-all duration-300 ${currentStep === 1
                        ? 'bg-cream text-charcoal/30 cursor-not-allowed border border-charcoal/10'
                        : 'bg-white text-maroon hover:text-saffron hover:bg-cream border border-maroon/20 hover:border-saffron shadow-sm'
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
    </div>
  );
};

export default MarriageRegistrationPage;
