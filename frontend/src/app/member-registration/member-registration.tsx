import React, { useState, useEffect } from 'react';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import StepIndicator from '../../components/StepIndicator';
import { UserPlus, ArrowLeft, ArrowRight, CheckCircle2, FileText, Crown, RefreshCw } from 'lucide-react';
import { api, type State, type District, type Taluka, type Gender, type MaritalStatus } from '../../services/api';

export const MemberRegistrationPage: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [selectedMemberType, setSelectedMemberType] = useState<'annual' | 'lifetime'>('annual');

  // Lookup state loaded from DB
  const [states, setStates] = useState<State[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [talukas, setTalukas] = useState<Taluka[]>([]);
  const [genders, setGenders] = useState<Gender[]>([]);
  const [maritalStatuses, setMaritalStatuses] = useState<MaritalStatus[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    // Step 1: वैयक्तिक माहिती
    fullName: '',
    birthDate: '',
    gender: '',
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
    memberType: selectedMemberType,
    idProofNumber: '',
    expectations: '',
    message: '',

    // Declaration
    declaration: false,
  });

  // Load lookup data on mount
  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [statesData, gendersData, statusesData] = await Promise.all([
          api.getStates(),
          api.getGenders(),
          api.getMaritalStatuses()
        ]);
        setStates(statesData);
        setGenders(gendersData);
        setMaritalStatuses(statusesData);

        // Pre-select Maharashtra if present
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
    'पत्ता माहिती',
    'अतिरिक्त माहिती',
    'पुष्टीकरण'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStateChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stateIdVal = e.target.value;
    setFormData(prev => ({ ...prev, stateId: stateIdVal, districtId: '', talukaId: '' }));
    setDistricts([]);
    setTalukas([]);
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
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1);
    } else {
      // Final Submit to Backend
      const payload = {
        fullName: formData.fullName,
        birthDate: formData.birthDate,
        gender: formData.gender,
        maritalStatus: formData.maritalStatus,
        mobile: formData.mobile,
        email: formData.email || null,
        occupation: formData.occupationType,
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
        declaration: formData.declaration
      };

      try {
        await api.registerMember(payload);
        alert('तुमचा फॉर्म पुढे सबमिट झाला आहे. प्रशासकीय मंजुरीनंतर तुमची नोंदणी पूर्ण होईल.');

        // Reset form
        setFormData({
          fullName: '',
          birthDate: '',
          gender: '',
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
        setCurrentStep(1);
      } catch (err: any) {
        alert('नोंदणी करताना त्रुटी आली: ' + err.message);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev + 1 - 2);
    }
  };

  // Find names for final preview
  const selectedState = states.find(s => s.id === Number(formData.stateId));
  const selectedDistrict = districts.find(d => d.id === Number(formData.districtId));
  const selectedTaluka = talukas.find(t => t.id === Number(formData.talukaId));
  const selectedGenderLabel = genders.find(g => g.code === formData.gender)?.labelMr || formData.gender;
  const selectedMaritalLabel = maritalStatuses.find(m => m.code === formData.maritalStatus)?.labelMr || formData.maritalStatus;

  return (
    <div className="flex flex-col w-full pb-8">
      {/* 1. Hero Banner */}
      <section className="relative w-full overflow-hidden bg-cream-dark/20 p-2 md:p-4">
        <div className="relative rounded-card-lg overflow-hidden shadow-soft">
          <ImagePlaceholder
            aspectRatio="aspect-[16/9] md:aspect-[21/9]"
            label="सदस्य नोंदणी बॅनर फोटो (२१:९)"
            className="w-full min-h-[140px] sm:min-h-[220px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-maroon/80 to-transparent flex items-end p-6 z-10">
            <div className="flex items-center gap-3">
            </div>
          </div>
        </div>
      </section>

      {/* 2. Membership Type Selector */}
      <section className="w-full px-4 pt-6 max-w-4xl mx-auto">
        <div className="bg-white rounded-card-lg border border-maroon/5 shadow-soft p-5">
          <h2 className="text-sm font-bold text-charcoal/60 uppercase tracking-widest mb-4 text-center">
            सदस्यत्व प्रकार निवडा — Choose Membership Type
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {/* Annual */}
            <button
              type="button"
              onClick={() => {
                setSelectedMemberType('annual');
                setFormData(prev => ({ ...prev, memberType: 'annual' }));
              }}
              className={`relative flex flex-col items-center justify-center gap-3 p-5 rounded-card-lg border-2 transition-all duration-300 group ${selectedMemberType === 'annual'
                ? 'border-saffron bg-gradient-to-b from-saffron/10 to-saffron/5 shadow-md shadow-saffron/20'
                : 'border-charcoal/10 bg-white hover:border-maroon/30 hover:bg-cream/20'
                }`}
            >
              {selectedMemberType === 'annual' && (
                <span className="absolute top-2.5 right-2.5 w-5 h-5 bg-saffron rounded-full flex items-center justify-center">
                  <CheckCircle2 size={13} className="text-white" />
                </span>
              )}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${selectedMemberType === 'annual' ? 'bg-saffron text-white' : 'bg-cream text-maroon group-hover:bg-saffron/10'
                }`}>
                <RefreshCw size={22} className="stroke-[2]" />
              </div>
              <div className="text-center">
                <span className={`block text-base font-extrabold font-heading transition-colors ${selectedMemberType === 'annual' ? 'text-saffron' : 'text-maroon'
                  }`}>वार्षिक सदस्य</span>
                <span className="block text-[11px] text-charcoal/50 font-semibold mt-0.5">Annual Member</span>
                <span className={`block text-sm font-bold mt-2 ${selectedMemberType === 'annual' ? 'text-saffron' : 'text-charcoal/60'
                  }`}>रु. १००/- <span className="font-normal text-[10px]">प्रतिवर्ष</span></span>
              </div>
            </button>

            {/* Lifetime */}
            <button
              type="button"
              onClick={() => {
                setSelectedMemberType('lifetime');
                setFormData(prev => ({ ...prev, memberType: 'lifetime' }));
              }}
              className={`relative flex flex-col items-center justify-center gap-3 p-5 rounded-card-lg border-2 transition-all duration-300 group ${selectedMemberType === 'lifetime'
                ? 'border-maroon bg-gradient-to-b from-maroon/10 to-maroon/5 shadow-md shadow-maroon/20'
                : 'border-charcoal/10 bg-white hover:border-maroon/30 hover:bg-cream/20'
                }`}
            >
              {selectedMemberType === 'lifetime' && (
                <span className="absolute top-2.5 right-2.5 w-5 h-5 bg-maroon rounded-full flex items-center justify-center">
                  <CheckCircle2 size={13} className="text-white" />
                </span>
              )}
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors duration-300 ${selectedMemberType === 'lifetime' ? 'bg-maroon text-white' : 'bg-cream text-maroon group-hover:bg-maroon/10'
                }`}>
                <Crown size={22} className="stroke-[2]" />
              </div>
              <div className="text-center">
                <span className={`block text-base font-extrabold font-heading transition-colors ${selectedMemberType === 'lifetime' ? 'text-maroon' : 'text-maroon'
                  }`}>आजीवन सदस्य</span>
                <span className="block text-[11px] text-charcoal/50 font-semibold mt-0.5">Lifetime Member</span>
                <span className={`block text-sm font-bold mt-2 ${selectedMemberType === 'lifetime' ? 'text-maroon' : 'text-charcoal/60'
                  }`}>रु. १,०००/- <span className="font-normal text-[10px]">एकदा मात्र</span></span>
              </div>
            </button>
          </div>

          {/* Selected type pill */}
          <p className="text-center mt-4 text-[11px] font-semibold text-charcoal/50">
            निवडलेला प्रकार:
            <span className={`font-extrabold ${selectedMemberType === 'lifetime' ? 'text-maroon' : 'text-saffron'}`}>
              {selectedMemberType === 'lifetime' ? 'आजीवन सदस्य (Lifetime)' : 'वार्षिक सदस्य (Annual)'}
            </span>
          </p>
        </div>
      </section>

      {/* 3. Form Stepper and Container */}
      <section className="w-full px-4 py-8 max-w-4xl mx-auto space-y-6">

        {/* Stepper Card */}
        <div className="bg-white rounded-card-lg border border-maroon/5 shadow-soft p-5">
          <StepIndicator steps={steps} currentStep={currentStep} layout="horizontal" />
        </div>

        {/* Form Content Card */}
        <div className="bg-white rounded-card-lg border border-maroon/5 shadow-soft p-6 md:p-8">
          <form onSubmit={handleNext} className="space-y-6">

            <h2 className="text-xl font-bold font-heading text-maroon border-b border-maroon/5 pb-3">
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
                      required
                      placeholder="आपले पूर्ण नाव लिहा"
                      className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">जन्म तारीख <span className="text-red-500">*</span>
                    </label>
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
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">लिंग <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-white"
                    >
                      <option value="">निवडा</option>
                      {genders.map(g => (
                        <option key={g.id} value={g.code}>{g.labelMr}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">वैवाहिक स्थिती <span className="text-red-500">*</span>
                    </label>
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
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">मोबाईल क्रमांक <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                      required
                      placeholder="उदा. ९८२३४५६७८९"
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
                      placeholder="उदा. amitsawant@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">शिक्षण <span className="text-red-500">*</span></label>
                    <select
                      name="education"
                      value={formData.education}
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
                </div>

                {/* ओळखपत्र (पर्यायी) file upload box */}
                <div className="border border-dashed border-maroon/20 rounded-card p-4 bg-cream/10 space-y-3">
                  <div className="flex items-center gap-2 text-maroon">
                    <FileText size={18} />
                    <span className="text-xs font-bold font-heading">ओळखपत्र (पर्यायी) - आधार / पॅन / मतदार कार्ड</span>
                  </div>
                  <ImagePlaceholder
                    aspectRatio="aspect-[21/9]"
                    label={formData.idUploaded ? "ओळखपत्र यशस्वीरित्या जोडले आहे! (बदलण्यासाठी क्लिक करा)" : "ओळखपत्र अपलोड करा (+)"}
                    onClick={() => setFormData(prev => ({ ...prev, idUploaded: true }))}
                    className="max-h-[120px]"
                  />
                  <p className="text-[10px] text-charcoal/50 leading-relaxed font-semibold text-center">
                    नोंद: JPG, PNG, PDF स्वरूपामध्ये कमाल आकार २ MB असावा.
                  </p>
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
                    required
                    rows={2}
                    placeholder="घर क्रमांक, इमारत, गल्ली, भाग, शहर"
                    className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-charcoal/75 mb-1">कायमचा पत्ता (उदा. मूळ गावचा पत्ता) <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="permanentAddress"
                    value={formData.permanentAddress}
                    onChange={handleInputChange}
                    required
                    rows={2}
                    placeholder="उदा. मु. पो. दापोली, जि. रत्नागिरी"
                    className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5 resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">राज्य <span className="text-red-500">*</span>
                    </label>
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
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">जिल्हा <span className="text-red-500">*</span>
                    </label>
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
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">तालुका <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="talukaId"
                      value={formData.talukaId}
                      onChange={handleInputChange}
                      required
                      disabled={!formData.districtId}
                      className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-white disabled:opacity-50"
                    >
                      <option value="">निवडा</option>
                      {talukas.map(t => (
                        <option key={t.id} value={t.id}>{t.nameMr}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-charcoal/75 mb-1">पिनकोड <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleInputChange}
                      required
                      placeholder="६ अंकी पिनकोड"
                      className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: अतिरिक्त माहिती */}
            {currentStep === 3 && (
              <div className="space-y-4">
                {/* Membership type reminder (read-only in Step 3) */}
                <div>
                  <label className="block text-xs font-bold text-charcoal/75 mb-1">सदस्यत्व प्रकार (मागील पानावर बदलू शकता)</label>
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-card border-2 w-fit ${formData.memberType === 'lifetime' ? 'border-maroon bg-maroon/5 text-maroon' : 'border-saffron bg-saffron/5 text-saffron'
                    }`}>
                    {formData.memberType === 'lifetime' ? <Crown size={16} /> : <RefreshCw size={16} />}
                    <span className="text-sm font-extrabold font-heading">
                      {formData.memberType === 'lifetime' ? 'आजीवन सदस्य — रु. १,०००/-' : 'वार्षिक सदस्य — रु. १००/-'}
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

            {/* STEP 4: पुष्टीकरण */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="bg-cream/30 border border-maroon/10 rounded-card p-5 space-y-4">
                  <h3 className="text-sm font-bold text-maroon font-heading border-b border-maroon/5 pb-2">
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
                      <span className="text-charcoal/50 font-semibold block">वैवाहिक स्थिती:</span>
                      <span className="font-bold text-charcoal/90">{selectedMaritalLabel || '-'}</span>
                    </div>
                    <div>
                      <span className="text-charcoal/50 font-semibold block">ईमेल आयडी:</span>
                      <span className="font-bold text-charcoal/90">{formData.email || '-'}</span>
                    </div>
                    <div>
                      <span className="text-charcoal/50 font-semibold block">सदस्यत्व प्रकार:</span>
                      <span className="font-bold text-saffron uppercase font-heading">
                        {formData.memberType === 'lifetime' ? 'आजीवन (Lifetime)' : 'वार्षिक (Annual)'}
                      </span>
                    </div>
                    <div>
                      <span className="text-charcoal/50 font-semibold block">पत्ता:</span>
                      <span className="font-bold text-charcoal/90">
                        {formData.currentAddress || '-'}, {selectedTaluka?.nameMr || ''}, {selectedDistrict?.nameMr || ''}, {selectedState?.nameMr || ''} - {formData.pincode}
                      </span>
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
                    मी याद्वारे घोषित करतो/करते की मी संस्थेच्या नियम व अटींचे पालन करेन आणि अर्जामध्ये भरलेली सर्व माहिती सत्य आहे.
                  </label>
                </div>
              </div>
            )}

            {/* Navigation buttons */}
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
                <span>परत जा (Previous)</span>
              </button>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-6 py-2 bg-saffron hover:bg-saffron-dark text-white rounded-full font-bold text-xs md:text-sm shadow-md shadow-saffron/20 hover:shadow-lg transition-all duration-300"
              >
                <span>{currentStep === 4 ? 'नोंदणी पूर्ण करा (Submit)' : 'पुढे जा (Next)'}</span>
                {currentStep < 4 ? <ArrowRight size={16} /> : <CheckCircle2 size={16} />}
              </button>
            </div>

          </form>
        </div>

      </section>
    </div>
  );
};

export default MemberRegistrationPage;
