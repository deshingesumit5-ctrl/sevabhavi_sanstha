import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Heart,
  GraduationCap,
  User,
  Search,
  RotateCcw,
  ShieldCheck,
  Lock,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Camera,
  LogIn,
  UserPlus,
  Users,
  Sparkles
} from 'lucide-react';
import { api, type MatrimonyPublicProfile, type District, type City } from '../../services/api';
import { useMatrimonyAuth } from '../../context/MatrimonyAuthContext';
import MatrimonyLoginModal from '../../components/MatrimonyLoginModal';

interface MatrimonyDirectoryProps {
  onGoToRegister: () => void;
}

export const MatrimonyDirectory: React.FC<MatrimonyDirectoryProps> = ({ onGoToRegister }) => {
  const navigate = useNavigate();
  const { matrimonyUser, favorites, toggleFavorite } = useMatrimonyAuth();

  // Filters state
  const [profileType, setProfileType] = useState<string>('all'); // 'all', 'bride', 'groom'
  const [ageRange, setAgeRange] = useState<string>('all');
  const [caste, setCaste] = useState<string>('सर्व');
  const [educationLevel, setEducationLevel] = useState<string>('सर्व');
  const [occupationType, setOccupationType] = useState<string>('सर्व');
  const [selectedStateId, setSelectedStateId] = useState<string>('');
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>('');
  const [city, setCity] = useState<string>('सर्व');
  const [sortOrder, setSortOrder] = useState<string>('created_desc');

  // Lookups & Dynamic Options from real approved records
  const [districts, setDistricts] = useState<District[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [availableCastes, setAvailableCastes] = useState<string[]>([]);
  const [availableEducations, setAvailableEducations] = useState<string[]>([]);
  const [availableOccupations, setAvailableOccupations] = useState<string[]>([]);

  // Profiles and Pagination
  const [profiles, setProfiles] = useState<MatrimonyPublicProfile[]>([]);
  const [page, setPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

  // Banner slide state
  const [heroSlide, setHeroSlide] = useState<number>(0);
  const bannerImages = [
    '/logo.png', // Fallback local branding or neutral couple illustration
  ];

  // Load districts and populate dynamic filter options strictly from real DB records
  useEffect(() => {
    api.getStates().then((res) => {
      const mh = res.find((s) => s.nameEn === 'Maharashtra');
      if (mh) {
        setSelectedStateId(mh.id.toString());
        api.getDistricts(mh.id).then(setDistricts).catch(() => { });
      }
    }).catch(() => { });

    // Populate filter dropdowns ONLY from real APPROVED profiles in the database
    api.getMatrimonyProfiles({}, 0, 100).then((res) => {
      if (res && res.content) {
        const castes = Array.from(new Set(res.content.map((p) => p.caste).filter(Boolean))) as string[];
        const educations = Array.from(
          new Set(res.content.map((p) => p.degreeName || p.educationLevel).filter(Boolean))
        ) as string[];
        const occupations = Array.from(new Set(res.content.map((p) => p.occupationType).filter(Boolean))) as string[];

        setAvailableCastes(castes);
        setAvailableEducations(educations);
        setAvailableOccupations(occupations);
      }
    }).catch(() => { });
  }, []);

  const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedDistrictId(val);
    setCity('सर्व');
    if (val) {
      const c = await api.getCities(Number(val)).catch(() => []);
      setCities(c);
    } else {
      setCities([]);
    }
  };

  // Fetch approved profiles
  const fetchProfiles = useCallback(
    async (pageNum = 0, isAppend = false) => {
      if (isAppend) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        let minAge: number | undefined;
        let maxAge: number | undefined;

        if (ageRange === '21-25') {
          minAge = 21;
          maxAge = 25;
        } else if (ageRange === '25-30') {
          minAge = 25;
          maxAge = 30;
        } else if (ageRange === '30-35') {
          minAge = 30;
          maxAge = 35;
        } else if (ageRange === '35+') {
          minAge = 35;
        }

        const params = {
          profileType: profileType === 'all' ? undefined : profileType,
          minAge,
          maxAge,
          caste: caste === 'सर्व' ? undefined : caste,
          educationLevel: educationLevel === 'सर्व' ? undefined : educationLevel,
          occupationType: occupationType === 'सर्व' ? undefined : occupationType,
          stateId: selectedStateId ? Number(selectedStateId) : undefined,
          districtId: selectedDistrictId ? Number(selectedDistrictId) : undefined,
          city: city === 'सर्व' ? undefined : city,
          sort: sortOrder,
        };

        const res = await api.getMatrimonyProfiles(params, pageNum, 12);
        if (isAppend) {
          setProfiles((prev) => [...prev, ...res.content]);
        } else {
          setProfiles(res.content || []);
        }
        setTotalPages(res.totalPages || 1);
        setTotalElements(res.totalElements || 0);
        setPage(res.number || 0);
      } catch (err) {
        console.error('Error fetching matrimony profiles:', err);
        if (!isAppend) {
          setProfiles([]);
          setTotalElements(0);
          setTotalPages(1);
        }
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [profileType, ageRange, caste, educationLevel, occupationType, selectedStateId, selectedDistrictId, city, sortOrder]
  );

  useEffect(() => {
    fetchProfiles(0, false);
  }, [fetchProfiles]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProfiles(0, false);
  };

  const handleReset = () => {
    setProfileType('all');
    setAgeRange('all');
    setCaste('सर्व');
    setEducationLevel('सर्व');
    setOccupationType('सर्व');
    setSelectedDistrictId('');
    setCity('सर्व');
    setSortOrder('created_desc');
  };

  const handleFavoriteClick = async (e: React.MouseEvent, profileId: number) => {
    e.stopPropagation();
    if (!matrimonyUser) {
      setShowLoginModal(true);
      return;
    }
    try {
      await toggleFavorite(profileId);
    } catch (err: any) {
      alert(err.message || 'त्रुटी आली.');
    }
  };

  return (
    <div className="flex flex-col w-full pb-16 bg-[#FFF8F0]">
      {/* ── 1. Hero Banner ── */}
      <section className="w-full px-4 pt-6">
        <div className="relative 	max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-lg min-h-[300px] md:min-h-[320px] flex items-end md:items-center">
          <img
            src="/matrimony-banner.jpg"
            alt="Matrimony Banner"
            className="absolute inset-0 w-full h-full object-cover object-left"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#FFF3E6] via-[#FFF3E6]/70 md:via-transparent to-transparent md:to-[#FFF3E6]" />

          <button type="button" onClick={() => setHeroSlide((p) => (p === 0 ? 2 : p - 1))}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center cursor-pointer">
            <ChevronLeft size={18} />
          </button>
          <button type="button" onClick={() => setHeroSlide((p) => (p === 2 ? 0 : p + 1))}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center cursor-pointer">
            <ChevronRight size={18} />
          </button>

          <div className="relative z-[5] md:ml-auto w-full md:w-1/2 p-6 md:p-10 text-center space-y-3">
            <h2 className="text-2xl md:text-4xl font-extrabold text-[#C45D14] leading-snug" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              सुयोग्य जीवनसाथीच्या शोधासाठी विश्वासाचा मंच
            </h2>
            <div className="flex items-center justify-center gap-2">
              <span className="h-[1.5px] w-12 bg-saffron/40" />
              <Heart size={16} className="text-saffron fill-saffron/30" />
              <span className="h-[1.5px] w-12 bg-saffron/40" />
            </div>
            <p className="text-sm md:text-base font-semibold text-charcoal/70">Meaningful Matches for a Brighter Tomorrow</p>

            <div className="flex flex-wrap items-start justify-center gap-4 pt-2">
              {[
                { icon: <ShieldCheck size={18} />, t: 'विश्वासार्ह', s: 'प्रोफाइल्स' },
                { icon: <Lock size={18} />, t: 'सुरक्षित आणि', s: 'गोपनीय माहिती' },
                { icon: <Users size={18} />, t: 'समाजातील', s: 'विश्वासाचे नाते' },
              ].map((b) => (
                <div key={b.t} className="flex items-center gap-2 text-left">
                  <div className="w-10 h-10 rounded-full border-2 border-saffron/60 text-saffron flex items-center justify-center shrink-0">{b.icon}</div>
                  <p className="text-[11px] font-semibold text-charcoal/80 leading-tight">{b.t}<br />{b.s}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5">
            {[0, 1, 2].map((dot) => (
              <button key={dot} type="button" onClick={() => setHeroSlide(dot)}
                className={`h-2 rounded-full transition-all ${heroSlide === dot ? 'w-5 bg-saffron' : 'w-2 bg-white/80'}`} />
            ))}
          </div>
        </div>
      </section>

      {/* ── 2. Tabs + Filter Box (matching Target Image 3) ────────────────── */}
      <section className="	max-w-5xl mx-auto w-full px-4 mt-6 space-y-4">
        {/* Top Tabs: सर्व प्रोफाइल | वधू (Bride) | वर (Groom) */}
        <div className="inline-flex items-center gap-1.5 flex-wrap p-1.5 bg-white rounded-full border border-saffron/15 shadow-sm">
          <button
            type="button"
            onClick={() => setProfileType('all')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${profileType === 'all'
              ? 'bg-gradient-to-r from-saffron to-[#C45D14] text-white shadow-md shadow-saffron/20'
              : 'text-charcoal/80 hover:bg-saffron/10'
              }`}
          >
            <Users size={15} />
            <span>सर्व प्रोफाइल</span>
          </button>

          <button
            type="button"
            onClick={() => setProfileType('bride')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${profileType === 'bride'
              ? 'bg-gradient-to-r from-saffron to-[#C45D14] text-white shadow-md shadow-saffron/20'
              : 'text-charcoal/80 hover:bg-saffron/10'
              }`}
          >
            <Heart size={15} className="fill-current text-rose-500" />
            <span>वधू (Bride)</span>
          </button>

          <button
            type="button"
            onClick={() => setProfileType('groom')}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer ${profileType === 'groom'
              ? 'bg-gradient-to-r from-saffron to-[#C45D14] text-white shadow-md shadow-saffron/20'
              : 'text-charcoal/80 hover:bg-saffron/10'
              }`}
          >
            <User size={15} className="text-blue-500" />
            <span>वर (Groom)</span>
          </button>
        </div>

        {/* Filter Card */}
        <div className="bg-[#FFF3E6] rounded-3xl shadow-sm border border-saffron/15 p-5 md:p-6 space-y-4">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* वय (Age) */}
              <div>
                <label className="block text-xs font-bold text-[#8A3B0F] mb-1.5">वय (Age)</label>
                <div className="relative">
                  <select
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-saffron/25 bg-white text-xs font-semibold text-charcoal outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20"
                  >
                    <option value="all">सर्व वयोगट</option>
                    <option value="21-25">२१ ते २५ वर्षे</option>
                    <option value="25-30">२५ ते ३० वर्षे</option>
                    <option value="30-35">३० ते ३५ वर्षे</option>
                    <option value="35+">३५ वर्षांपेक्षा जास्त</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
                </div>
              </div>

              {/* जात / समाज (populated from approved database records) */}
              <div>
                <label className="block text-xs font-bold text-[#8A3B0F] mb-1.5">जात / समाज</label>
                <div className="relative">
                  <select
                    value={caste}
                    onChange={(e) => setCaste(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-saffron/25 bg-white text-xs font-semibold text-charcoal outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20"
                  >
                    <option value="सर्व">सर्व समाज</option>
                    {availableCastes.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
                </div>
              </div>

              {/* शिक्षण (populated from approved database records) */}
              <div>
                <label className="block text-xs font-bold text-[#8A3B0F] mb-1.5">शिक्षण</label>
                <div className="relative">
                  <select
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-saffron/25 bg-white text-xs font-semibold text-charcoal outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20"
                  >
                    <option value="सर्व">सर्व शिक्षण</option>
                    {availableEducations.map((edu) => (
                      <option key={edu} value={edu}>
                        {edu}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
                </div>
              </div>

              {/* व्यवसाय / क्षेत्र (populated from approved database records) */}
              <div>
                <label className="block text-xs font-bold text-[#8A3B0F] mb-1.5">व्यवसाय / क्षेत्र</label>
                <div className="relative">
                  <select
                    value={occupationType}
                    onChange={(e) => setOccupationType(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-saffron/25 bg-white text-xs font-semibold text-charcoal outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20"
                  >
                    <option value="सर्व">सर्व व्यवसाय</option>
                    {availableOccupations.map((occ) => (
                      <option key={occ} value={occ}>
                        {occ}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
                </div>
              </div>

              {/* राहण्याचे ठिकाण (जिल्हा) */}
              <div>
                <label className="block text-xs font-bold text-[#8A3B0F] mb-1.5">राहण्याचे ठिकाण</label>
                <div className="relative">
                  <select
                    value={selectedDistrictId}
                    onChange={handleDistrictChange}
                    className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-saffron/25 bg-white text-xs font-semibold text-charcoal outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20"
                  >
                    <option value="">सर्व जिल्हे</option>
                    {districts.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nameMr || d.nameEn}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
                </div>
              </div>

              {/* तालुका / शहर */}
              <div>
                <label className="block text-xs font-bold text-[#8A3B0F] mb-1.5">तालुका / शहर</label>
                <div className="relative">
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full appearance-none px-3.5 py-2.5 rounded-xl border border-saffron/25 bg-white text-xs font-semibold text-charcoal outline-none focus:border-saffron focus:ring-2 focus:ring-saffron/20"
                  >
                    <option value="सर्व">सर्व शहरे</option>
                    {cities.map((c) => (
                      <option key={c.id} value={c.nameMr || c.nameEn}>
                        {c.nameMr || c.nameEn}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
                </div>
              </div>

              {/* Action Buttons: शोधा and रीसेट */}
              <div className="sm:col-span-2 flex items-end gap-2.5">
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#C45D14] hover:bg-[#A84A0C] text-white rounded-xl font-bold text-xs shadow-md shadow-saffron/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Search size={15} />
                  <span>शोधा</span>
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-3 bg-white border border-saffron/40 hover:bg-saffron/10 text-[#C45D14] rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>रीसेट</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* ── 3. Profile Results Section (matching Image 3 Grid) ────────────── */}
      <section className="max-w-6xl mx-auto w-full px-4 mt-8">
        {/* Results Header + Sort Dropdown */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <h3
              className="text-xl sm:text-2xl font-black text-[#C45D14]"
              style={{ fontFamily: "'Baloo 2', sans-serif" }}
            >
              नवीन प्रोफाइल्स
            </h3>
            <span className="text-xl sm:text-2xl font-semibold text-[#C45D14]">
              ({totalElements})
            </span>
          </div>

          <div className="flex items-center gap-2">

            <div className="relative">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="appearance-none pl-4 pr-9 py-2 rounded-full border border-saffron/30 bg-white shadow-sm text-xs font-semibold text-charcoal outline-none focus:border-saffron"
              >
                <option value="created_desc">नवीन सर्वात पहिले</option>
                <option value="age_asc">वय: कमी ते जास्त</option>
                <option value="age_desc">वय: जास्त ते कमी</option>
              </select>
              <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-charcoal/40 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-saffron">
            <div className="w-10 h-10 border-4 border-saffron/30 border-t-saffron rounded-full animate-spin" />
            <p className="text-xs font-bold text-charcoal/60">प्रोफाइल्स लोड होत आहेत...</p>
          </div>
        ) : profiles.length === 0 ? (
          /* Empty State per CHANGE 2 requirement */
          <div className="py-16 text-center bg-white rounded-3xl border border-dashed border-saffron/30 p-8 space-y-4">
            <div className="w-16 h-16 bg-saffron/10 rounded-full flex items-center justify-center mx-auto text-saffron">
              <Users size={32} />
            </div>
            <h4 className="text-lg font-bold text-charcoal" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              कोणतेही प्रोफाइल्स आढळले नाहीत
            </h4>
            <p className="text-xs text-charcoal/60 max-w-md mx-auto">
              सध्या या निकषांनुसार कोणतेही मंजूर प्रोफाइल उपलब्ध नाही. कृपया फिल्टर्स बदलून पुन्हा शोधा किंवा नवीन अर्ज करा.
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 border border-saffron/40 hover:bg-saffron/10 text-saffron-dark font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                फिल्टर्स रीसेट करा
              </button>
              <button
                type="button"
                onClick={onGoToRegister}
                className="px-5 py-2 bg-saffron hover:bg-saffron-dark text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                नवीन नोंदणी करा
              </button>
            </div>
          </div>
        ) : (
          /* Profile Cards Grid (Target Image 3 Style) */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {profiles.map((profile) => {
              const isBride = profile.profileType?.toLowerCase() === 'bride';
              const isFav = favorites.includes(profile.id);

              return (
                <div
                  key={profile.id}
                  onClick={() => navigate(`/marriage-registration/profile/${profile.id}`)}
                  className="group relative bg-white rounded-2xl overflow-hidden border border-saffron/10 shadow-md hover:shadow-xl hover:border-saffron/50 transition-all duration-300 flex flex-col cursor-pointer transform hover:-translate-y-1"
                >
                  {/* Photo Section */}
                  <div className="relative w-full aspect-[4/3.4] overflow-hidden bg-cream/40">
                    {profile.mainPhotoUrl ? (
                      <img
                        src={profile.mainPhotoUrl}
                        alt={profile.displayName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      /* Clean Neutral Avatar Placeholder — Zero Stock Photos */
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-orange-100/50 text-saffron/40">
                        <User size={52} className="stroke-[1.5]" />
                        <span className="text-[10px] font-medium text-charcoal/40 mt-1">फोटो उपलब्ध नाही</span>
                      </div>
                    )}

                    {/* Top Left Badge: soft pink for Bride, soft blue for Groom */}
                    <div className="absolute top-2.5 left-2.5">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-bold shadow-xs ${isBride
                          ? 'bg-[#fbcfe8] text-[#9d174d]'
                          : 'bg-[#bfdbfe] text-[#1e40af]'
                          }`}
                      >
                        {isBride ? 'वधू' : 'वर'}
                      </span>
                    </div>

                    {/* Top Right: Photo Count Badge */}
                    <div className="absolute top-2.5 right-2.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-semibold backdrop-blur-xs">
                        <Camera size={11} />
                        <span>{profile.photoCount || 1}</span>
                      </span>
                    </div>
                  </div>
                  {/* Info Section */}
                  <div className="relative px-3 pt-5 pb-3 bg-white">
                    <button
                      type="button"
                      onClick={(e) => handleFavoriteClick(e, profile.id)}
                      className="absolute -top-4 right-2.5 z-10 w-8 h-8 rounded-full bg-white border border-saffron/30 shadow-md flex items-center justify-center hover:bg-saffron/10 transition-colors"
                      title={isFav ? 'आवडीतून काढा' : 'आवडीत जोडा'}
                    >
                      <Heart size={15} className={isFav ? 'fill-rose-500 text-rose-500' : 'text-saffron'} />
                    </button>

                    <h4
                      className="text-[15px] font-bold text-charcoal truncate pr-9 group-hover:text-saffron-dark transition-colors"
                      style={{ fontFamily: "'Baloo 2', sans-serif" }}
                    >
                      {profile.displayName}
                    </h4>
                    <p className="flex items-center gap-1.5 text-[11px] text-charcoal/70 truncate mt-1">
                      <GraduationCap size={12} className="text-saffron shrink-0" />
                      <span className="truncate">{profile.degreeName || profile.educationLevel || '-'}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-[11px] text-charcoal/70 truncate mt-0.5">
                      <User size={12} className="text-saffron shrink-0" />
                      <span>वय : {profile.age ? `${profile.age} वर्षे` : '-'}</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ── Load More Button (matching Image 3) ────────────────────────── */}
        {page + 1 < totalPages && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => fetchProfiles(page + 1, true)}
              disabled={loadingMore}
              className="inline-flex items-center gap-2 px-8 py-2.5 rounded-full border-2 border-saffron text-saffron-dark hover:bg-saffron hover:text-white font-bold text-xs tracking-wide shadow-xs transition-all duration-300 cursor-pointer disabled:opacity-50"
            >
              <span>{loadingMore ? 'लोड होत आहे...' : 'आणखी प्रोफाइल्स पहा'}</span>
              <ChevronDown size={16} />
            </button>
          </div>
        )}
      </section>

      {/* ── 4. Bottom Locked-Profile Banner (matching Image 3 with Orange) ─── */}
      <section className="	max-w-5xl mx-auto w-full px-4 mt-12">
        <div className="bg-gradient-to-r from-orange-50/80 via-amber-50 to-orange-50/80 border border-saffron/30 rounded-3xl p-6 sm:p-7 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xs">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="p-3.5 bg-saffron text-white rounded-2xl shadow-md shrink-0 hidden sm:flex">
              <Lock size={26} />
            </div>
            <div>
              <h4
                className="text-lg sm:text-xl font-bold text-saffron-dark mb-1"
                style={{ fontFamily: "'Baloo 2', sans-serif" }}
              >
                संपूर्ण प्रोफाइल आणि संपर्क माहिती पाहण्यासाठी
              </h4>
              <p className="text-xs sm:text-sm text-charcoal/80">
                नोंदणी करा किंवा लॉगिन करा.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onGoToRegister}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-saffron hover:bg-saffron-dark text-white font-bold text-xs shadow-sm transition-all cursor-pointer"
            >
              <UserPlus size={15} />
              <span>नोंदणी करा</span>
            </button>
            <button
              type="button"
              onClick={() => setShowLoginModal(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-saffron text-saffron-dark hover:bg-saffron/10 font-bold text-xs transition-colors cursor-pointer"
            >
              <LogIn size={15} />
              <span>लॉगिन</span>
            </button>
          </div>
        </div>
      </section>

      {/* Matrimony Login Modal */}
      <MatrimonyLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => {
          setShowLoginModal(false);
          fetchProfiles(0, false);
        }}
      />
    </div>
  );
};

export default MatrimonyDirectory;
