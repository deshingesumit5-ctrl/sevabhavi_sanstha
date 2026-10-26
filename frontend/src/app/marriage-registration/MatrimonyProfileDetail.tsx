import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Heart,
  CheckCircle2,
  Lock,
  User,
  GraduationCap,
  Briefcase,
  Home,
  Phone,
  Camera,
  MapPin,
  Share2,
  Users,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  LogIn
} from 'lucide-react';
import {
  api,
  type MatrimonyPublicProfile,
  type MatrimonyFullProfile
} from '../../services/api';
import { useMatrimonyAuth } from '../../context/MatrimonyAuthContext';
import MatrimonyLoginModal from '../../components/MatrimonyLoginModal';

export const MatrimonyProfileDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const profileId = Number(id);

  const { matrimonyUser, favorites, toggleFavorite } = useMatrimonyAuth();

  const [publicProfile, setPublicProfile] = useState<MatrimonyPublicProfile | null>(null);
  const [fullProfile, setFullProfile] = useState<MatrimonyFullProfile | null>(null);
  const [similarProfiles, setSimilarProfiles] = useState<MatrimonyPublicProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'basic' | 'education' | 'family' | 'personal' | 'photos' | 'contact'>('basic');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [similarScrollIndex, setSimilarScrollIndex] = useState<number>(0);

  // Load Profile from DB
  useEffect(() => {
    if (!profileId) return;

    // If the logged-in user opens their own profile URL directly, redirect to /marriage-registration
    if (matrimonyUser && matrimonyUser.id === profileId) {
      navigate('/marriage-registration', { replace: true });
      return;
    }

    setLoading(true);
    setError(null);

    const loadData = async () => {
      try {
        // 1. Load public profile
        const pub = await api.getMatrimonyProfile(profileId);
        setPublicProfile(pub);
        setActivePhoto(pub.mainPhotoUrl || null);

        // 2. Load similar profiles from API
        api.getSimilarProfiles(profileId, 8).then(setSimilarProfiles).catch(() => {});

        // 3. If logged in with active subscription or admin, attempt to load full details
        if (matrimonyUser) {
          try {
            const full = await api.getMatrimonyFullProfile(profileId);
            setFullProfile(full);
          } catch (err: any) {
            // Subscription expired or unauthorized
            if (err?.message && err.message.includes('नूतनीकरण')) {
              setError(err.message);
            }
          }
        }
      } catch (err: any) {
        setError(err.message || 'प्रोफाइल सापडली नाही.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [profileId, matrimonyUser, navigate]);

  const isFavorite = favorites.includes(profileId);

  const handleFavoriteClick = async () => {
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

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 bg-[#FFF8F0]">
        <div className="w-10 h-10 border-4 border-saffron/30 border-t-saffron rounded-full animate-spin" />
        <p className="text-xs font-bold text-charcoal/60">प्रोफाइल माहिती लोड होत आहे...</p>
      </div>
    );
  }

  if (error || !publicProfile) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-red-200 text-center space-y-4">
        <h3 className="text-lg font-bold text-charcoal" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
          {error || 'कोणतेही प्रोफाइल्स आढळले नाहीत'}
        </h3>
        <button
          type="button"
          onClick={() => navigate('/marriage-registration')}
          className="px-5 py-2.5 bg-saffron text-white rounded-xl font-bold text-xs hover:bg-saffron-dark transition-colors cursor-pointer"
        >
          ← विवाह नोंदणी सूचीवर परत जा
        </button>
      </div>
    );
  }

  const isBride = publicProfile.profileType?.toLowerCase() === 'bride';
  const hasFullAccess = !!fullProfile;

  const photoList = publicProfile.mainPhotoUrl ? [publicProfile.mainPhotoUrl] : [];

  return (
    <div className="w-full pb-16 bg-[#FFF8F0]">
      {/* ── Breadcrumb & Back Bar (matching Target Image 4) ───────────────── */}
      <div className="w-full bg-cream-dark/20 border-b border-saffron/15 py-3 px-4">
        <div className="	max-w-5xl mx-auto flex items-center justify-between text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-charcoal/70">
            <Link to="/" className="hover:text-saffron">होम</Link>
            <span>&gt;</span>
            <Link to="/marriage-registration" className="hover:text-saffron">विवाह नोंदणी</Link>
            <span>&gt;</span>
            <span className="text-saffron-dark font-bold">प्रोफाइल तपशील</span>
          </div>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-saffron-dark hover:text-saffron transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>परत जा</span>
          </button>
        </div>
      </div>

      <div className="	max-w-5xl mx-auto px-4 mt-6 space-y-6">
        {/* ── Top Main Profile Header (matching Image 4 Layout) ────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Photos Gallery (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            {/* Main Big Photo */}
            <div className="relative aspect-[16/10] w-full rounded-3xl overflow-hidden bg-cream/40 border-2 border-saffron/20 shadow-sm">
              {activePhoto ? (
                <img
                  src={activePhoto}
                  alt={publicProfile.displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                /* Neutral avatar placeholder icon - Zero stock photos */
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-orange-100/50 text-saffron/40">
                  <User size={68} className="stroke-[1.5]" />
                  <span className="text-xs font-medium text-charcoal/40 mt-2">फोटो उपलब्ध नाही</span>
                </div>
              )}

              {/* Heart Toggle in circle */}
              <button
                type="button"
                onClick={handleFavoriteClick}
                className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white text-charcoal shadow-md transition-all cursor-pointer"
                title={isFavorite ? 'आवडीतून काढा' : 'आवडीत जोडा'}
              >
                <Heart
                  size={18}
                  className={isFavorite ? 'fill-rose-600 text-rose-600' : 'text-charcoal/50 hover:text-rose-600'}
                />
              </button>

              {/* Verified badge pill */}
              <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-xs">
                <CheckCircle2 size={14} className="text-emerald-400" />
                <span>तपासणी केलेली प्रोफाइल</span>
              </div>
            </div>

            {/* Thumbnail Strip */}
            <div className="grid grid-cols-4 gap-2">
              {photoList.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => setActivePhoto(p)}
                  className={`aspect-square rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${
                    activePhoto === p ? 'border-saffron shadow-sm' : 'border-transparent opacity-80 hover:opacity-100'
                  }`}
                >
                  <img src={p} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                </div>
              ))}
              <div
                onClick={() => {
                  if (!hasFullAccess) setShowLoginModal(true);
                  else setActiveTab('photos');
                }}
                className="aspect-square rounded-xl bg-saffron/10 border-2 border-dashed border-saffron/30 flex flex-col items-center justify-center text-saffron-dark font-extrabold text-xs cursor-pointer hover:bg-saffron/20"
              >
                <Camera size={16} />
                <span>+१ फोटो</span>
              </div>
            </div>
          </div>

          {/* Middle Column: Profile Summary Details (4 cols or 8 cols if full access) */}
          <div className={`${hasFullAccess ? 'lg:col-span-8' : 'lg:col-span-4'} bg-white rounded-3xl p-6 border border-saffron/20 shadow-xs space-y-4`}>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className={`px-3 py-0.5 rounded-full text-xs font-extrabold shadow-xs ${
                  isBride ? 	'bg-[#fbcfe8] text-[#9d174d]' : 'bg-[#bfdbfe] text-[#1e40af]'
                }`}
              >
                {isBride ? 'वधू' : 'वर'}
              </span>

              <span className="text-xs font-mono font-bold text-charcoal/60">
                Profile ID: {isBride ? 'BRD' : 'GRM'}{String(publicProfile.id).padStart(7, '0')}
              </span>
            </div>

            <div>
              <h2
                className="text-2xl font-black text-charcoal flex items-center gap-2"
                style={{ fontFamily: "'Baloo 2', sans-serif" }}
              >
                <span>{hasFullAccess && fullProfile?.fullName ? fullProfile.fullName : publicProfile.displayName}</span>
                <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
              </h2>

              <p className="text-sm font-semibold text-charcoal/80 mt-1">
                {publicProfile.age ? `${publicProfile.age} वर्षे` : '-'} • {publicProfile.height || '-'} • {publicProfile.degreeName || publicProfile.educationLevel || '-'}
              </p>

              <p className="flex items-center gap-1.5 text-xs text-charcoal/70 mt-2">
                <MapPin size={14} className="text-saffron shrink-0" />
                <span>
                  {publicProfile.city || '-'}{publicProfile.districtNameMr ? `, ${publicProfile.districtNameMr}` : ''}
                </span>
                <span className="text-charcoal/30">•</span>
                <span>जात: {publicProfile.caste || '-'}</span>
              </p>
            </div>

            {/* Action Buttons row (Solid Orange + Outline Orange) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!hasFullAccess) setShowLoginModal(true);
                }}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-saffron to-[#C45D14] hover:from-[#C45D14] hover:to-saffron text-white rounded-xl font-bold text-xs shadow-md shadow-saffron/20 transition-all cursor-pointer"
              >
                <Lock size={14} />
                <span>{hasFullAccess ? 'संपूर्ण माहिती उपलब्ध ✓' : 'संपूर्ण माहिती पाहा'}</span>
              </button>

              <button
                type="button"
                onClick={handleFavoriteClick}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer ${
                  isFavorite
                    ? 'border-rose-300 bg-rose-50 text-rose-600'
                    : 'border-saffron/40 hover:bg-saffron/10 text-saffron-dark'
                }`}
              >
                <Heart size={14} className={isFavorite ? 'fill-rose-600' : ''} />
                <span>{isFavorite ? 'आवडले ✓' : 'आवडले'}</span>
              </button>
            </div>

            {/* Share link */}
            <div className="pt-2 border-t border-charcoal/5">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(window.location.href);
                  alert('प्रोफाइल लिंक कॉपी झाली आहे!');
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-charcoal/60 hover:text-saffron-dark transition-colors"
              >
                <Share2 size={13} />
                <span>प्रोफाइल लिंक शेअर करा</span>
              </button>
            </div>
          </div>

          {/* Right Column: Locked Profile CTA Sidebar Card (shown ONLY for guests / non-full-access) */}
          {!hasFullAccess && (
            <div className="lg:col-span-4 bg-[#FFF5EC] border border-saffron/30 rounded-3xl p-6 text-center shadow-xs space-y-4">
              <div className="w-12 h-12 bg-saffron text-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Lock size={22} />
              </div>

              <div>
                <h4
                  className="text-base font-bold text-saffron-dark mb-1"
                  style={{ fontFamily: "'Baloo 2', sans-serif" }}
                >
                  संपूर्ण प्रोफाइल पाहण्यासाठी नोंदणी करा
                </h4>
                <p className="text-xs text-charcoal/70 leading-relaxed">
                  या सदस्याची संपूर्ण माहिती, संपर्क तपशील आणि अधिक फोटो पाहण्यासाठी कृपया नोंदणी करा किंवा लॉगिन करा.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => navigate('/marriage-registration?tab=register')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-saffron hover:bg-saffron-dark text-white rounded-xl font-bold text-xs shadow-xs transition-colors cursor-pointer"
                >
                  <UserPlus size={14} />
                  <span>आता नोंदणी करा</span>
                </button>

                <div className="text-xs text-charcoal/40 font-bold">किंवा</div>

                <button
                  type="button"
                  onClick={() => setShowLoginModal(true)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 border border-saffron text-saffron-dark hover:bg-saffron/10 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  <LogIn size={14} />
                  <span>लॉगिन करा</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Details Tabs (matching Target Image 4) ───────────────────────── */}
        <div className="bg-white rounded-3xl border border-saffron/20 shadow-xs overflow-hidden">
          {/* Tabs Bar */}
          <div className="flex items-center overflow-x-auto border-b border-charcoal/10 bg-cream/20 p-2.5 gap-2 scrollbar-none">
            <button
              onClick={() => setActiveTab('basic')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'basic'
                  ? 'bg-saffron text-white shadow-xs'
                  : 'text-charcoal/70 hover:bg-cream-dark/30'
              }`}
            >
              <User size={15} />
              <span>मूलभूत माहिती</span>
            </button>

            <button
              onClick={() => setActiveTab('education')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'education'
                  ? 'bg-saffron text-white shadow-xs'
                  : 'text-charcoal/70 hover:bg-cream-dark/30'
              }`}
            >
              <GraduationCap size={15} />
              <span>शिक्षण व करिअर</span>
            </button>

            <button
              onClick={() => setActiveTab('family')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'family'
                  ? 'bg-saffron text-white shadow-xs'
                  : 'text-charcoal/70 hover:bg-cream-dark/30'
              }`}
            >
              <Home size={15} />
              <span>कौटुंबिक माहिती</span>
            </button>

            <button
              onClick={() => setActiveTab('personal')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'personal'
                  ? 'bg-saffron text-white shadow-xs'
                  : 'text-charcoal/70 hover:bg-cream-dark/30'
              }`}
            >
              <Briefcase size={15} />
              <span>वैयक्तिक माहिती</span>
            </button>

            <button
              onClick={() => setActiveTab('photos')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'photos'
                  ? 'bg-saffron text-white shadow-xs'
                  : 'text-charcoal/70 hover:bg-cream-dark/30'
              }`}
            >
              <Camera size={15} />
              <span>अधिक फोटो</span>
            </button>

            <button
              onClick={() => setActiveTab('contact')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === 'contact'
                  ? 'bg-saffron text-white shadow-xs'
                  : 'text-charcoal/70 hover:bg-cream-dark/30'
              }`}
            >
              <Phone size={15} />
              <span>संपर्क माहिती</span>
            </button>
          </div>

          {/* Tab Content Section */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Tab Left Info Table (7 cols) - Real Data Only */}
              <div className="lg:col-span-7 space-y-4">
                {activeTab === 'basic' && (
                  <div className="space-y-3">
                    <h4
                      className="text-base font-bold text-charcoal flex items-center gap-2"
                      style={{ fontFamily: "'Baloo 2', sans-serif" }}
                    >
                      <User size={16} className="text-saffron" />
                      <span>मूलभूत माहिती</span>
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-xs pt-2">
                      <div className="flex justify-between py-1.5 border-b border-charcoal/10">
                        <span className="font-semibold text-charcoal/60">वय:</span>
                        <span className="font-bold text-charcoal">{publicProfile.age ? `${publicProfile.age} वर्षे` : '-'}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-charcoal/10">
                        <span className="font-semibold text-charcoal/60">उंची:</span>
                        <span className="font-bold text-charcoal">{publicProfile.height || '-'}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-charcoal/10">
                        <span className="font-semibold text-charcoal/60">रक्तगट:</span>
                        <span className="font-bold text-charcoal">{publicProfile.bloodGroup || '-'}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-charcoal/10">
                        <span className="font-semibold text-charcoal/60">जात / समाज:</span>
                        <span className="font-bold text-charcoal">{publicProfile.caste || '-'}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-charcoal/10">
                        <span className="font-semibold text-charcoal/60">विवाह स्थिती:</span>
                        <span className="font-bold text-charcoal">{publicProfile.maritalStatus || '-'}</span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-charcoal/10">
                        <span className="font-semibold text-charcoal/60">राहण्याचे ठिकाण:</span>
                        <span className="font-bold text-charcoal">
                          {publicProfile.city || '-'}{publicProfile.districtNameMr ? `, ${publicProfile.districtNameMr}` : ''}
                        </span>
                      </div>
                      <div className="flex justify-between py-1.5 border-b border-charcoal/10">
                        <span className="font-semibold text-charcoal/60">मुलगाव:</span>
                        <span className="font-bold text-charcoal">
                          {publicProfile.districtNameMr || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'education' && (
                  <div className="space-y-3">
                    <h4
                      className="text-base font-bold text-charcoal flex items-center gap-2"
                      style={{ fontFamily: "'Baloo 2', sans-serif" }}
                    >
                      <GraduationCap size={16} className="text-saffron" />
                      <span>शिक्षण व करिअर</span>
                    </h4>

                    {hasFullAccess ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-xs pt-2">
                        <div className="flex justify-between py-1.5 border-b border-charcoal/10">
                          <span className="font-semibold text-charcoal/60">शिक्षण पातळी:</span>
                          <span className="font-bold text-charcoal">{fullProfile?.educationLevel || '-'}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-charcoal/10">
                          <span className="font-semibold text-charcoal/60">पदवी नाव:</span>
                          <span className="font-bold text-charcoal">{fullProfile?.degreeName || '-'}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-charcoal/10">
                          <span className="font-semibold text-charcoal/60">महाविद्यालय / शाळा:</span>
                          <span className="font-bold text-charcoal">{fullProfile?.schoolCollege || '-'}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-charcoal/10">
                          <span className="font-semibold text-charcoal/60">व्यवसाय प्रकार:</span>
                          <span className="font-bold text-charcoal">{fullProfile?.occupationType || '-'}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-charcoal/10">
                          <span className="font-semibold text-charcoal/60">पदनाम:</span>
                          <span className="font-bold text-charcoal">{fullProfile?.designation || '-'}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-charcoal/10">
                          <span className="font-semibold text-charcoal/60">कंपनी:</span>
                          <span className="font-bold text-charcoal">{fullProfile?.companyName || '-'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 rounded-2xl bg-amber-50/60 border border-saffron/20 text-center space-y-3">
                        <Lock size={22} className="mx-auto text-saffron" />
                        <p className="text-xs font-bold text-charcoal">
                          शिक्षणाचा आणि करिअरचा संपूर्ण तपशील पाहण्यासाठी कृपया लॉगिन करा.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowLoginModal(true)}
                          className="px-4 py-1.5 bg-saffron text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          लॉगिन करा
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'family' && (
                  <div className="space-y-3">
                    <h4
                      className="text-base font-bold text-charcoal flex items-center gap-2"
                      style={{ fontFamily: "'Baloo 2', sans-serif" }}
                    >
                      <Home size={16} className="text-saffron" />
                      <span>कौटुंबिक माहिती</span>
                    </h4>

                    {hasFullAccess ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-xs pt-2">
                        <div className="flex justify-between py-1.5 border-b border-charcoal/10">
                          <span className="font-semibold text-charcoal/60">वडिलांचे नाव:</span>
                          <span className="font-bold text-charcoal">{fullProfile?.fatherName || '-'}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-charcoal/10">
                          <span className="font-semibold text-charcoal/60">वडिलांचा व्यवसाय:</span>
                          <span className="font-bold text-charcoal">{fullProfile?.fatherOccupation || '-'}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-charcoal/10">
                          <span className="font-semibold text-charcoal/60">आईचे नाव:</span>
                          <span className="font-bold text-charcoal">{fullProfile?.motherName || '-'}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-charcoal/10">
                          <span className="font-semibold text-charcoal/60">भाऊ:</span>
                          <span className="font-bold text-charcoal">{fullProfile?.brothers ?? '-'}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-charcoal/10">
                          <span className="font-semibold text-charcoal/60">बहिणी:</span>
                          <span className="font-bold text-charcoal">{fullProfile?.sisters ?? '-'}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 rounded-2xl bg-amber-50/60 border border-saffron/20 text-center space-y-3">
                        <Lock size={22} className="mx-auto text-saffron" />
                        <p className="text-xs font-bold text-charcoal">
                          कौटुंबिक माहिती पाहण्यासाठी नोंदणीकृत सदस्यांचे लॉगिन आवश्यक आहे.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowLoginModal(true)}
                          className="px-4 py-1.5 bg-saffron text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          लॉगिन करा
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'personal' && (
                  <div className="space-y-3">
                    <h4
                      className="text-base font-bold text-charcoal flex items-center gap-2"
                      style={{ fontFamily: "'Baloo 2', sans-serif" }}
                    >
                      <Briefcase size={16} className="text-saffron" />
                      <span>वैयक्तिक माहिती व अपेक्षा</span>
                    </h4>

                    {hasFullAccess ? (
                      <div className="space-y-4 text-xs pt-2">
                        <div className="p-3.5 bg-cream/30 rounded-xl border border-charcoal/10">
                          <span className="font-bold text-charcoal block mb-1">स्वतःबद्दल:</span>
                          <p className="text-charcoal leading-relaxed">{fullProfile?.aboutSelf || '-'}</p>
                        </div>
                        <div className="p-3.5 bg-cream/30 rounded-xl border border-charcoal/10">
                          <span className="font-bold text-charcoal block mb-1">अपेक्षित जोडीदार:</span>
                          <p className="text-charcoal leading-relaxed">{fullProfile?.expectations || '-'}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                          <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800">
                            <Phone size={15} />
                            <div>
                              <p className="text-[10px] font-semibold">मोबाईल नंबर</p>
                              <p className="font-mono font-bold text-xs">{fullProfile?.mobile || '-'}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 rounded-2xl bg-amber-50/60 border border-saffron/20 text-center space-y-3">
                        <Lock size={22} className="mx-auto text-saffron" />
                        <p className="text-xs font-bold text-charcoal">
                          वैयक्तिक अपेक्षा आणि संपर्क क्रमांक पाहण्यासाठी लॉगिन आवश्यक आहे.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowLoginModal(true)}
                          className="px-4 py-1.5 bg-saffron text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          लॉगिन करा
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'photos' && (
                  <div className="space-y-3">
                    <h4
                      className="text-base font-bold text-charcoal flex items-center gap-2"
                      style={{ fontFamily: "'Baloo 2', sans-serif" }}
                    >
                      <Camera size={16} className="text-saffron" />
                      <span>अधिक फोटो</span>
                    </h4>

                    {hasFullAccess ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
                        {photoList.map((p, idx) => (
                          <div key={idx} className="aspect-square rounded-xl overflow-hidden border border-charcoal/10 shadow-xs">
                            <img src={p} alt={`Photo ${idx}`} className="w-full h-full object-cover" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-5 rounded-2xl bg-amber-50/60 border border-saffron/20 text-center space-y-3">
                        <Lock size={22} className="mx-auto text-saffron" />
                        <p className="text-xs font-bold text-charcoal">
                          अधिक फोटो पाहण्यासाठी कृपया नोंदणीकृत सदस्यांचे लॉगिन करा.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowLoginModal(true)}
                          className="px-4 py-1.5 bg-saffron text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          लॉगिन करा
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'contact' && (
                  <div className="space-y-3">
                    <h4
                      className="text-base font-bold text-charcoal flex items-center gap-2"
                      style={{ fontFamily: "'Baloo 2', sans-serif" }}
                    >
                      <Phone size={16} className="text-saffron" />
                      <span>संपर्क माहिती</span>
                    </h4>

                    {hasFullAccess ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="flex items-center gap-3 p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800">
                          <Phone size={18} />
                          <div>
                            <p className="text-[10px] font-semibold">उमेदवाराचा मोबाईल नंबर</p>
                            <p className="font-mono font-bold text-sm">{fullProfile?.mobile || '-'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800">
                          <Phone size={18} />
                          <div>
                            <p className="text-[10px] font-semibold">पालकांचा मोबाईल नंबर</p>
                            <p className="font-mono font-bold text-sm">{fullProfile?.parentMobile || '-'}</p>
                          </div>
                        </div>

                        {fullProfile?.email && (
                          <div className="flex items-center gap-3 p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 sm:col-span-2">
                            <div>
                              <p className="text-[10px] font-semibold">ईमेल आयडी</p>
                              <p className="font-medium text-xs">{fullProfile.email}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-5 rounded-2xl bg-amber-50/60 border border-saffron/20 text-center space-y-3">
                        <Lock size={22} className="mx-auto text-saffron" />
                        <p className="text-xs font-bold text-charcoal">
                          संपर्क माहिती पाहण्यासाठी अधिकृत नोंदणी किंवा लॉगिन करा.
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowLoginModal(true)}
                          className="px-4 py-1.5 bg-saffron text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          लॉगिन करा
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Tab Right Locked / Blurred Preview Card (shown ONLY for guests / non-full-access) */}
              {!hasFullAccess && (
                <div className="lg:col-span-5">
                  <div className="rounded-2xl overflow-hidden border-2 border-saffron/30 p-5 bg-gradient-to-b from-[#FFF5EC] to-amber-50/60 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                      <div className="relative w-28 h-36 rounded-xl overflow-hidden bg-gradient-to-tr from-saffron/20 to-amber-100 flex items-center justify-center shrink-0 border border-saffron/30">
                        <div className="absolute inset-0 bg-white/40 backdrop-blur-md" />
                        <div className="relative w-10 h-10 rounded-full bg-saffron text-white flex items-center justify-center shadow-md">
                          <Lock size={18} />
                        </div>
                      </div>

                      <div className="flex-1 text-center sm:text-left">
                        <h5
                          className="text-sm font-bold text-saffron-dark mb-1"
                          style={{ fontFamily: "'Baloo 2', sans-serif" }}
                        >
                          अधिक माहितीसाठी नोंदणी आवश्यक
                        </h5>
                        <p className="text-[11px] text-charcoal/70">
                          खालील तपशील पाहण्यासाठी कृपया अधिकृत नोंदणी किंवा लॉगिन करा.
                        </p>
                      </div>
                    </div>

                    <ul className="space-y-1.5 text-xs font-semibold text-charcoal/80 bg-white/80 p-3.5 rounded-xl border border-saffron/20">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                        <span>शिक्षणाची संपूर्ण माहिती</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                        <span>करिअर / व्यावसायिक तपशील</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                        <span>कौटुंबिक माहिती</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                        <span>वैयक्तिक आवडी-निवडी</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                        <span>संपर्क तपशील (नोंदणीकृत सदस्यांसाठी)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                        <span>अधिक फोटो (नोंदणीकृत सदस्यांसाठी)</span>
                      </li>
                    </ul>

                    <button
                      type="button"
                      onClick={() => navigate('/marriage-registration?tab=register')}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-saffron to-[#C45D14] hover:from-[#C45D14] hover:to-saffron text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      <UserPlus size={14} />
                      <span>आता नोंदणी करा</span>
                    </button>

                    <p className="text-center text-xs text-charcoal/70 pt-1">
                      आधीच नोंदणी केली आहे?{' '}
                      <button
                        type="button"
                        onClick={() => setShowLoginModal(true)}
                        className="text-saffron-dark font-bold hover:underline cursor-pointer"
                      >
                        लॉगिन करा
                      </button>
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── "हा प्रोफाइल आवडला का?" Strip (hidden for logged-in matrimony user) ──────── */}
        {!matrimonyUser && (
          <div className="bg-white rounded-3xl p-5 border border-saffron/20 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-saffron/10 text-saffron rounded-2xl">
                <Users size={22} />
              </div>
              <div>
                <h5
                  className="text-sm font-bold text-charcoal"
                  style={{ fontFamily: "'Baloo 2', sans-serif" }}
                >
                  हा प्रोफाइल आवडला का?
                </h5>
                <p className="text-xs text-charcoal/60">
                  नोंदणी करून आवडीची प्रोफाइल सेव्ह करा, नंतर पुन्हा पाहण्यासाठी.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center sm:items-end">
              <button
                type="button"
                onClick={handleFavoriteClick}
                className={`px-5 py-2.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  isFavorite
                    ? 'border-rose-400 bg-rose-50 text-rose-600 shadow-xs'
                    : 'border-saffron/40 hover:bg-saffron hover:text-white text-saffron-dark'
                }`}
              >
                <Heart size={15} className={isFavorite ? 'fill-rose-600' : ''} />
                <span>{isFavorite ? 'आवडले ✓' : 'आवडले'}</span>
              </button>
              <span className="text-[10px] text-charcoal/50 mt-1">(नोंदणीनंतर उपलब्ध)</span>
            </div>
          </div>
        )}

        {/* ── Similar Profiles Carousel (matching Target Image 4) ──────────── */}
        {similarProfiles.length > 0 && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart size={18} className="text-saffron fill-saffron" />
                <h4
                  className="text-lg font-bold text-charcoal"
                  style={{ fontFamily: "'Baloo 2', sans-serif" }}
                >
                  सदृश प्रोफाइल्स
                </h4>
              </div>

              <div className="flex items-center gap-2">
                {/* Carousel arrow navigation */}
                <button
                  type="button"
                  onClick={() => setSimilarScrollIndex((prev) => Math.max(0, prev - 1))}
                  disabled={similarScrollIndex === 0}
                  className="w-7 h-7 rounded-full border border-charcoal/20 bg-white hover:bg-cream flex items-center justify-center text-charcoal/70 disabled:opacity-30 cursor-pointer shadow-2xs"
                  aria-label="Previous Similar Profiles"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setSimilarScrollIndex((prev) =>
                      prev + 4 < similarProfiles.length ? prev + 1 : prev
                    )
                  }
                  disabled={similarScrollIndex + 4 >= similarProfiles.length}
                  className="w-7 h-7 rounded-full border border-charcoal/20 bg-white hover:bg-cream flex items-center justify-center text-charcoal/70 disabled:opacity-30 cursor-pointer shadow-2xs"
                  aria-label="Next Similar Profiles"
                >
                  <ChevronRight size={16} />
                </button>

                <Link
                  to="/marriage-registration"
                  className="flex items-center gap-1 text-xs font-bold text-saffron-dark hover:underline ml-2"
                >
                  <span>सर्व पहा</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {similarProfiles
                .slice(similarScrollIndex, similarScrollIndex + 4)
                .map((sim) => {
                  const isSimBride = sim.profileType?.toLowerCase() === 'bride';
                  const isSimFav = favorites.includes(sim.id);

                  return (
                    <div
                      key={sim.id}
                      onClick={() => {
                        navigate(`/marriage-registration/profile/${sim.id}`);
                        window.scrollTo(0, 0);
                      }}
                      className="bg-white rounded-2xl overflow-hidden border border-saffron/20 shadow-xs hover:shadow-lg transition-all cursor-pointer group"
                    >
                      <div className="relative aspect-[4/3.6] overflow-hidden bg-cream/40">
                        {sim.mainPhotoUrl ? (
                          <img
                            src={sim.mainPhotoUrl}
                            alt={sim.displayName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-amber-50 to-orange-100/50 text-saffron/40">
                            <User size={46} className="stroke-[1.5]" />
                            <span className="text-[10px] text-charcoal/40 mt-1">फोटो उपलब्ध नाही</span>
                          </div>
                        )}
                        <span
                          className={`absolute top-2 left-2 px-2 py-0.5 rounded-md text-[10px] font-bold ${
                            isSimBride ? 	'bg-[#fbcfe8] text-[#9d174d]' : 'bg-[#bfdbfe] text-[#1e40af]'
                          }`}
                        >
                          {isSimBride ? 'वधू' : 'वर'}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!matrimonyUser) {
                              setShowLoginModal(true);
                            } else {
                              toggleFavorite(sim.id);
                            }
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-white/90 hover:bg-white text-charcoal/60 shadow-xs"
                        >
                          <Heart size={14} className={isSimFav ? 'fill-rose-600 text-rose-600' : ''} />
                        </button>
                      </div>

                      <div className="p-3 text-xs">
                        <h5
                          className="font-bold text-charcoal truncate group-hover:text-saffron-dark transition-colors"
                          style={{ fontFamily: "'Baloo 2', sans-serif" }}
                        >
                          {sim.displayName}
                        </h5>
                        <p className="text-[11px] text-charcoal/70 truncate mt-0.5">
                          {sim.age ? `${sim.age} वर्षे` : '-'} • {sim.degreeName || sim.educationLevel || '-'}
                        </p>
                        <p className="text-[10px] text-charcoal/60 truncate flex items-center gap-1 mt-0.5">
                          <MapPin size={11} className="text-saffron" />
                          <span>{sim.city || '-'}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Matrimony Login Modal */}
      <MatrimonyLoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => setShowLoginModal(false)}
      />
    </div>
  );
};

export default MatrimonyProfileDetail;
