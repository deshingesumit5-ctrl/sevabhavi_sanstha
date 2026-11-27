import React, { useState, useEffect } from 'react';
import { Users, Eye, CheckCircle2, XCircle, ChevronDown, ChevronUp, Search, Filter, X } from 'lucide-react';
import { api, type MemberRegistrationData, type MaritalStatus, type Gender, type BloodGroup, type PaymentData } from '../../services/api';
import { imageUrl } from '../../services/galleryApi';

const convertDigitsToMarathi = (str: string | number): string => {
  const marathiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(str).replace(/[0-9]/g, (w) => marathiDigits[parseInt(w, 10)]);
};

const AdminMembersPage: React.FC = () => {
  const initialCached = api.getCachedMembers();
  const [members, setMembers] = useState<MemberRegistrationData[]>(initialCached || []);
  const [loading, setLoading] = useState<boolean>(!initialCached);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [maritalStatuses, setMaritalStatuses] = useState<MaritalStatus[]>([]);
  const [genders, setGenders] = useState<Gender[]>([]);
  const [bloodGroups, setBloodGroups] = useState<BloodGroup[]>([]);

  // Filters state
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterBloodGroup, setFilterBloodGroup] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterActive, setFilterActive] = useState('');

  // Payments & Rejection modal state
  const [payments, setPayments] = useState<PaymentData[]>(api.getCachedPayments() || []);
  const [viewScreenshotUrl, setViewScreenshotUrl] = useState<string | null>(null);
  const [paymentActionLoadingId, setPaymentActionLoadingId] = useState<number | null>(null);
  const [payRejectModalId, setPayRejectModalId] = useState<number | null>(null);
  const [payRejectReason, setPayRejectReason] = useState('');
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  useEffect(() => {
    loadMembers();
    api.getMaritalStatuses().then(setMaritalStatuses).catch(err => console.error('Error loading marital statuses:', err));
    api.getGenders().then(setGenders).catch(err => console.error('Error loading genders:', err));
    api.getBloodGroups().then(setBloodGroups).catch(err => console.error('Error loading blood groups:', err));
  }, []);

  const loadMembers = async () => {
    try {
      const [data, payData] = await Promise.all([
        api.getAllMembers(),
        api.getAllPayments(true).catch(() => []),
      ]);
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setMembers(sorted);
      setPayments(payData);
    } catch (err) {
      console.error('Error loading members:', err);
    } finally {
      setLoading(false);
    }
  };

  const getMemberPayment = (memberId: number): PaymentData | undefined => {
    return payments.find((p) => {
      const regType = (p.registrationType || '').toUpperCase();
      const memType = (p.membershipType || '').toLowerCase();
      const isMemberPay =
        regType === 'MEMBER' ||
        memType === 'annual' ||
        memType === 'lifetime' ||
        (!regType && !memType.includes('marriage') && !memType.includes('shibir') && !memType.includes('donation'));
      return isMemberPay && (p.registrationId === memberId || p.memberId === memberId);
    });
  };

  const handleVerifyPayment = async (paymentId: number) => {
    setPaymentActionLoadingId(paymentId);
    try {
      const updated = await api.updatePaymentStatus(paymentId, 'VERIFIED');
      setPayments(prev => prev.map(p => p.id === paymentId ? { ...p, ...updated, status: 'VERIFIED' } : p));
    } catch (err: any) {
      alert('पेमेंट पडताळणी करताना त्रुटी: ' + (err?.message || err));
    } finally {
      setPaymentActionLoadingId(null);
    }
  };

  const handleConfirmRejectPayment = async () => {
    if (payRejectModalId === null) return;
    if (!payRejectReason.trim()) {
      alert('कृपया पेमेंट नाकारण्याचे कारण प्रविष्ट करा.');
      return;
    }
    setPaymentActionLoadingId(payRejectModalId);
    try {
      const updated = await api.updatePaymentStatus(payRejectModalId, 'REJECTED', payRejectReason.trim());
      setPayments(prev => prev.map(p => p.id === payRejectModalId ? { ...p, ...updated, status: 'REJECTED', rejectionReason: payRejectReason.trim() } : p));
      setPayRejectModalId(null);
      setPayRejectReason('');
    } catch (err: any) {
      alert('पेमेंट नाकारताना त्रुटी: ' + (err?.message || err));
    } finally {
      setPaymentActionLoadingId(null);
    }
  };
  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await api.updateMemberStatus(id, status);
      setMembers(prev => prev.map(m => m.id === id ? { ...m, approvalStatus: status } : m));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('स्थिती अपडेट करताना त्रुटी आली.');
    }
  };

  const handleRejectClick = (id: number) => {
    setRejectId(id);
    setRejectReason('');
    setRejectError('');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (rejectId === null) return;

    if (!rejectReason.trim()) {
      setRejectError('कृपया अर्ज नाकारण्याचे कारण प्रविष्ट करा.');
      return;
    }

    try {
      await api.updateMemberStatus(rejectId, 'REJECTED', rejectReason.trim());
      setMembers(prev => prev.map(m => m.id === rejectId ? { ...m, approvalStatus: 'REJECTED' } : m));
      setRejectModalOpen(false);
      setRejectError('');
    } catch (err) {
      console.error('Error updating status:', err);
      alert('स्थिती अपडेट करताना त्रुटी आली.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">मंजूर</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">नाकारले</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">प्रलंबित</span>;
    }
  };

  const getMaritalLabel = (code: string) =>
    maritalStatuses.find(m => m.code === code)?.labelMr ?? code;

  const getGenderLabel = (code: string) =>
    genders.find(g => g.code === code)?.labelMr ?? code;

  const getBloodLabel = (code: string) =>
    bloodGroups.find(b => b.code === code)?.labelMr ?? code;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('mr-IN');
    } catch {
      return dateStr;
    }
  };

  const handleToggleActive = async (id: number, currentActive: boolean) => {
    try {
      const nextActive = !currentActive;
      await api.toggleMemberActive(id, nextActive);
      setMembers(prev => prev.map(m => m.id === id ? { ...m, isActive: nextActive } : m));
    } catch (err) {
      console.error('Error updating active status:', err);
      alert('स्थिती अपडेट करताना त्रुटी आली.');
    }
  };

  const getActiveBadge = (isActive?: boolean) => {
    if (isActive === false) {
      return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700">निष्क्रिय</span>;
    }
    return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-800">सक्रिय</span>;
  };

  const filteredMembers = members.filter(m => {
    const matchName = m.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const cityMatchString = `${m.currentAddress} ${m.taluka?.nameMr} ${m.district?.nameMr} ${m.state?.nameMr}`;
    const matchCity = filterCity ? cityMatchString.toLowerCase().includes(filterCity.toLowerCase()) : true;
    const matchType = filterType ? m.memberType === filterType : true;
    const matchBloodGroup = filterBloodGroup ? m.bloodGroup === filterBloodGroup : true;
    const matchActive = filterActive === 'active'
      ? (m.isActive !== false)
      : filterActive === 'inactive'
        ? (m.isActive === false)
        : true;
    return matchName && matchCity && matchType && matchBloodGroup && matchActive;
  });



  const getMemberTypeBadge = (type: string) => (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${type === 'lifetime' ? 'bg-amber-100 text-amber-900 border border-amber-300/40' : 'bg-saffron/10 text-saffron-dark'}`}>
      {type === 'lifetime' ? 'आजीवन' : 'वार्षिक'}
    </span>
  );

  return (
    <div className="p-2 sm:p-4 md:p-6 max-w-7xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-saffron to-amber-600 rounded-xl text-white shadow-lg">
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-charcoal" style={{ fontFamily: "'Baloo 2', sans-serif" }}>सदस्य नोंदणी अर्ज</h2>
            <p className="text-[11px] text-charcoal/50 font-semibold">एकूण अर्ज: {filteredMembers.length}</p>
          </div>
        </div>

        {/* Right Top Actions: Filter Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm border ${showFilters
                ? 'bg-saffron text-white border-saffron'
                : 'bg-amber-50 hover:bg-amber-100 text-charcoal border-amber-200/80'
              }`}
            title="फिल्टर पर्याय"
          >
            <Filter size={15} />
            <span>फिल्टर</span>
          </button>
        </div>
      </div>

      {/* Filters Section - Responsive Grid for Mobile & Laptop */}
      {showFilters && (
        <div className="bg-white p-4 sm:p-5 rounded-card border border-amber-200/60 shadow-soft">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1fr_150px_130px_130px_160px_auto] gap-3 items-center">
            <div>
              <input
                type="text"
                placeholder="नावानुसार शोधा..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 bg-amber-50/20 border border-amber-200/80 rounded-xl text-sm focus:ring-2 focus:ring-saffron/20 focus:border-saffron outline-none font-medium text-charcoal placeholder:text-charcoal/40 transition-all"
              />
            </div>
            <div>
              <input
                type="text"
                placeholder="शहर / गाव..."
                value={filterCity}
                onChange={(e) => setFilterCity(e.target.value)}
                className="w-full px-4 py-2.5 bg-amber-50/20 border border-amber-200/80 rounded-xl text-sm focus:ring-2 focus:ring-saffron/20 focus:border-saffron outline-none font-medium text-charcoal placeholder:text-charcoal/40 transition-all"
              />
            </div>
            <div>
              <select
                value={filterBloodGroup}
                onChange={(e) => setFilterBloodGroup(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-amber-50/20 border border-amber-200/80 rounded-xl text-sm focus:ring-2 focus:ring-saffron/20 focus:border-saffron outline-none font-medium text-charcoal cursor-pointer transition-all"
              >
                <option value="">सर्व रक्तगट</option>
                {bloodGroups.map(b => (
                  <option key={b.id} value={b.code}>{b.labelMr || b.code}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-amber-50/20 border border-amber-200/80 rounded-xl text-sm focus:ring-2 focus:ring-saffron/20 focus:border-saffron outline-none font-medium text-charcoal cursor-pointer transition-all"
              >
                <option value="">सर्व प्रकार</option>
                <option value="lifetime">आजीवन</option>
                <option value="annual">वार्षिक</option>
              </select>
            </div>
            <div>
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-amber-50/20 border border-amber-200/80 rounded-xl text-sm focus:ring-2 focus:ring-saffron/20 focus:border-saffron outline-none font-medium text-charcoal cursor-pointer transition-all"
              >
                <option value="">सर्व स्थिती (सक्रिय/निष्क्रिय)</option>
                <option value="active">सक्रिय</option>
                <option value="inactive">निष्क्रिय</option>
              </select>
            </div>
            <button className="w-full sm:col-span-2 md:col-span-1 lg:w-auto px-6 py-2.5 bg-gradient-to-r from-saffron to-amber-600 hover:from-amber-600 hover:to-saffron text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm whitespace-nowrap">
              <Search size={16} />
              शोधा
            </button>
          </div>
        </div>
      )}

      {/* Members Table */}
      {loading && members.length === 0 ? (
        <div className="bg-white rounded-card border border-amber-200/60 shadow-soft p-12 text-center">
          <div className="w-8 h-8 border-3 border-saffron border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-charcoal/50 font-semibold">माहिती लोड होत आहे...</p>
        </div>
      ) : filteredMembers.length === 0 ? (
        <div className="bg-white rounded-card border border-charcoal/5 shadow-soft p-12 text-center">
          <Users size={48} className="mx-auto text-charcoal/20 mb-4" />
          <p className="text-sm text-charcoal/50 font-semibold">कोणतेही सदस्य नोंदणी अर्ज नाहीत.</p>
        </div>
      ) : (
        <div className="bg-white rounded-card border border-amber-200/60 shadow-soft overflow-hidden">
          {/* MOBILE: stacked cards */}
          <div className="md:hidden divide-y divide-amber-100/80">
            {filteredMembers.map((member, index) => (
              <div key={member.id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-100/80 text-amber-900 text-[11px] font-bold rounded-lg shrink-0">
                      #{convertDigitsToMarathi(index + 1)}
                    </span>
                    <p className="text-base font-normal text-charcoal truncate" style={{ fontFamily: "'Baloo 2', sans-serif" }}>{member.fullName}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {getStatusBadge(member.approvalStatus)}
                    {getActiveBadge(member.isActive)}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {getMemberTypeBadge(member.memberType)}
                  <span className="text-charcoal/40">{formatDate(member.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setExpandedId(expandedId === member.id ? null : member.id)}
                    className="flex-1 justify-center px-3 py-2 bg-blue-50 active:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Eye size={15} />
                    अर्ज बघा
                    {expandedId === member.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <button
                    onClick={() => handleToggleActive(member.id, member.isActive !== false)}
                    className={`px-3 py-2 rounded-xl font-bold text-xs shadow-sm flex items-center gap-1 transition-colors ${member.isActive === false
                        ? 'bg-emerald-600 active:bg-emerald-700 text-white'
                        : 'bg-gray-600 active:bg-gray-700 text-white'
                      }`}
                  >
                    {member.isActive === false ? 'सक्रिय करा' : 'निष्क्रिय करा'}
                  </button>
                  {member.approvalStatus === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(member.id, 'APPROVED')}
                        className="px-3.5 py-2 bg-emerald-600 active:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1"
                      >
                        <CheckCircle2 size={16} />
                        मंजूर
                      </button>
                      <button
                        onClick={() => handleRejectClick(member.id)}
                        className="px-3.5 py-2 bg-rose-500 active:bg-rose-600 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1"
                      >
                        <XCircle size={16} />
                        नाकारा
                      </button>
                    </>
                  )}
                </div>

                {expandedId === member.id && (
                  <div className="mt-3 bg-amber-50/40 border border-amber-200/60 rounded-xl p-4 space-y-4 text-xs">
                    <div>
                      <h5 className="text-xs font-bold text-saffron-dark mb-2 border-b border-saffron/20 pb-1" style={{ fontFamily: "'Baloo 2', sans-serif" }}>वैयक्तिक माहिती</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div><span className="text-charcoal/50 font-semibold block">पूर्ण नाव</span><span className="font-bold text-charcoal">{member.fullName}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">जन्म तारीख</span><span className="font-bold text-charcoal">{formatDate(member.birthDate)}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">लिंग</span><span className="font-bold text-charcoal">{getGenderLabel(member.gender)}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">रक्तगट</span><span className="font-bold text-charcoal">{getBloodLabel(member.bloodGroup || '') || '-'}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">वैवाहिक स्थिती</span><span className="font-bold text-charcoal">{getMaritalLabel(member.maritalStatus)}</span></div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-saffron-dark mb-2 border-b border-saffron/20 pb-1" style={{ fontFamily: "'Baloo 2', sans-serif" }}>संपर्क माहिती</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div><span className="text-charcoal/50 font-semibold block">मोबाईल</span><span className="font-bold text-charcoal">{member.mobile}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">ईमेल</span><span className="font-bold text-charcoal">{member.email || '-'}</span></div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-saffron-dark mb-2 border-b border-saffron/20 pb-1" style={{ fontFamily: "'Baloo 2', sans-serif" }}>शिक्षण व व्यवसाय</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div><span className="text-charcoal/50 font-semibold block">शिक्षण</span><span className="font-bold text-charcoal">{member.education}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">नोकरी / व्यवसाय</span><span className="font-bold text-charcoal">{member.occupation}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">सदस्यत्व प्रकार</span><span className="font-bold text-charcoal">{member.memberType === 'lifetime' ? 'आजीवन' : 'वार्षिक'}</span></div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-saffron-dark mb-2 border-b border-saffron/20 pb-1" style={{ fontFamily: "'Baloo 2', sans-serif" }}>पत्ता माहिती</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2 bg-white/70 p-2.5 rounded-lg border border-saffron/15">
                          <span className="text-saffron-dark font-bold block mb-0.5 text-[11px]">कायमचा पत्ता (रत्नागिरी)</span>
                          <span className="font-bold text-charcoal block">{member.permanentAddress}</span>
                          <span className="text-[11px] text-charcoal/70">
                            गाव: {member.permanentVillage || '-'}, ता. {member.permanentTaluka || member.taluka?.nameMr || '-'}, जि. {member.permanentDistrict || 'रत्नागिरी'} - {member.permanentPincode || member.pincode || '-'}
                          </span>
                        </div>
                        <div className="col-span-2 bg-white/70 p-2.5 rounded-lg border border-saffron/15">
                          <span className="text-saffron-dark font-bold block mb-0.5 text-[11px]">सध्याचा पत्ता (पुणे)</span>
                          <span className="font-bold text-charcoal block">{member.currentAddress}</span>
                          <span className="text-[11px] text-charcoal/70">
                            उपनगर: {member.currentSuburb || '-'}, जि. {member.currentDistrict || member.district?.nameMr || 'पुणे'} - {member.currentPincode || member.pincode || '-'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {(() => {
                      const payment = getMemberPayment(member.id);
                      const ssUrl = payment?.screenshotUrl ? imageUrl(payment.screenshotUrl) : null;
                      return (
                        <div>
                          <h5 className="text-xs font-bold text-saffron-dark mb-2 border-b border-saffron/20 pb-1" style={{ fontFamily: "'Baloo 2', sans-serif" }}>पेमेंट व स्क्रीनशॉट</h5>
                          {payment ? (
                            <div className="bg-white/80 p-3 rounded-lg border border-saffron/20 space-y-2">
                              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                                <span className="font-bold text-charcoal">₹{payment.amount} ({payment.paymentMode})</span>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${payment.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : payment.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                                  {payment.status === 'VERIFIED' ? 'सत्यापित' : payment.status === 'REJECTED' ? 'नाकारले' : 'प्रलंबित'}
                                </span>
                              </div>
                              <div className="text-[11px] text-charcoal/70 font-mono">Txn: {payment.upiTxnId || '-'}</div>
                              <div className="flex flex-wrap items-center gap-2 pt-1">
                                {ssUrl && (
                                  <button type="button" onClick={() => setViewScreenshotUrl(ssUrl)} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-saffron-dark font-bold rounded-lg text-[11px] cursor-pointer">
                                    <img src={ssUrl} alt="स्क्रीनशॉट" className="w-7 h-7 object-cover rounded border border-saffron/30" />
                                    <span>स्क्रीनशॉट बघा</span>
                                  </button>
                                )}
                                {payment.status === 'PENDING' && (
                                  <>
                                    <button type="button" disabled={paymentActionLoadingId === payment.id} onClick={() => handleVerifyPayment(payment.id)} className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded text-[11px]">
                                      पडताळणी करा
                                    </button>
                                    <button type="button" disabled={paymentActionLoadingId === payment.id} onClick={() => { setPayRejectModalId(payment.id); setPayRejectReason(''); }} className="px-2.5 py-1 bg-rose-600 text-white font-bold rounded text-[11px]">
                                      नाकारा
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ) : (
                            <p className="text-xs text-charcoal/50">पेमेंट रेकॉर्ड उपलब्ध नाही.</p>
                          )}
                        </div>
                      );
                    })()}

                    {(member.expectations || member.message) && (
                      <div>
                        <h5 className="text-xs font-bold text-saffron-dark mb-2 border-b border-saffron/20 pb-1" style={{ fontFamily: "'Baloo 2', sans-serif" }}>अपेक्षा व संदेश</h5>
                        <div className="space-y-3">
                          {member.expectations && (
                            <div><span className="text-charcoal/50 font-semibold block">अपेक्षा</span><span className="font-bold text-charcoal">{member.expectations}</span></div>
                          )}
                          {member.message && (
                            <div><span className="text-charcoal/50 font-semibold block">संदेश</span><span className="font-bold text-charcoal">{member.message}</span></div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* DESKTOP: website theme table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100/80 border-b-2 border-saffron/30">
                  <th className="p-3.5 text-amber-950 font-bold text-center w-14" style={{ fontFamily: "'Baloo 2', sans-serif" }}>अ. क्र.</th>
                  <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>नाव</th>
                  <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>मोबाईल</th>
                  <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>प्रकार</th>
                  <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>तारीख</th>
                  <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>स्थिती</th>
                  <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>कृती</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100/80">
                {filteredMembers.map((member, index) => (
                  <React.Fragment key={member.id}>
                    <tr className="hover:bg-cream/30 transition-colors font-medium text-charcoal">
                      <td className="p-3.5 font-bold text-center text-charcoal/70">{convertDigitsToMarathi(index + 1)}</td>
                      <td className="p-3.5 font-normal text-charcoal">{member.fullName}</td>
                      <td className="p-3.5">{member.mobile}</td>
                      <td className="p-3.5">{getMemberTypeBadge(member.memberType)}</td>
                      <td className="p-3.5">{formatDate(member.createdAt)}</td>
                      <td className="p-3.5">
                        <div className="flex flex-col gap-1 items-start">
                          {getStatusBadge(member.approvalStatus)}
                          {getActiveBadge(member.isActive)}
                        </div>
                      </td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setExpandedId(expandedId === member.id ? null : member.id)}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                            title="अर्ज बघा"
                          >
                            <Eye size={12} />
                            अर्ज बघा
                            {expandedId === member.id ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                          </button>
                          <button
                            onClick={() => handleToggleActive(member.id, member.isActive !== false)}
                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors shadow-sm ${member.isActive === false
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-gray-600 hover:bg-gray-700 text-white'
                              }`}
                            title={member.isActive === false ? 'सक्रिय करा' : 'निष्क्रिय करा'}
                          >
                            {member.isActive === false ? 'सक्रिय करा' : 'निष्क्रिय करा'}
                          </button>
                          {member.approvalStatus === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(member.id, 'APPROVED')}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors shadow-sm"
                                title="मंजूर करा"
                              >
                                <CheckCircle2 size={12} />
                                मंजूर करा
                              </button>
                              <button
                                onClick={() => handleRejectClick(member.id)}
                                className="px-2.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors shadow-sm"
                                title="नाकारा"
                              >
                                <XCircle size={12} />
                                नाकारा
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedId === member.id && (
                      <tr>
                        <td colSpan={7} className="p-0">
                          <div className="bg-amber-50/40 border-t border-b border-saffron/20 p-5 space-y-5">
                            <div>
                              <h5 className="text-xs font-bold text-saffron-dark mb-3 border-b border-saffron/20 pb-1.5" style={{ fontFamily: "'Baloo 2', sans-serif" }}>वैयक्तिक माहिती</h5>
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">पूर्ण नाव</span>
                                  <span className="font-bold text-charcoal">{member.fullName}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">जन्म तारीख</span>
                                  <span className="font-bold text-charcoal">{formatDate(member.birthDate)}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">लिंग</span>
                                  <span className="font-bold text-charcoal">{getGenderLabel(member.gender)}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">रक्तगट</span>
                                  <span className="font-bold text-charcoal">{getBloodLabel(member.bloodGroup || '') || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">वैवाहिक स्थिती</span>
                                  <span className="font-bold text-charcoal">{getMaritalLabel(member.maritalStatus)}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h5 className="text-xs font-bold text-saffron-dark mb-3 border-b border-saffron/20 pb-1.5" style={{ fontFamily: "'Baloo 2', sans-serif" }}>संपर्क माहिती</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">मोबाईल</span>
                                  <span className="font-bold text-charcoal">{member.mobile}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">ईमेल</span>
                                  <span className="font-bold text-charcoal">{member.email || '-'}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h5 className="text-xs font-bold text-saffron-dark mb-3 border-b border-saffron/20 pb-1.5" style={{ fontFamily: "'Baloo 2', sans-serif" }}>शिक्षण व व्यवसाय</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">शिक्षण</span>
                                  <span className="font-bold text-charcoal">{member.education}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">नोकरी / व्यवसाय प्रकार</span>
                                  <span className="font-bold text-charcoal">{member.occupation}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">सदस्यत्व प्रकार</span>
                                  <span className="font-bold text-charcoal">{member.memberType === 'lifetime' ? 'आजीवन' : 'वार्षिक'}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h5 className="text-xs font-bold text-saffron-dark mb-3 border-b border-saffron/20 pb-1.5" style={{ fontFamily: "'Baloo 2', sans-serif" }}>पत्ता माहिती</h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                <div className="bg-white/80 p-3 rounded-xl border border-saffron/15 space-y-1">
                                  <span className="text-saffron-dark font-bold block text-[11px]">कायमचा पत्ता (रत्नागिरी जिल्हा)</span>
                                  <span className="font-bold text-charcoal block">{member.permanentAddress}</span>
                                  <div className="text-charcoal/75">
                                    गाव: <span className="font-bold">{member.permanentVillage || '-'}</span> • तालुका: <span className="font-bold">{member.permanentTaluka || member.taluka?.nameMr || '-'}</span> • जिल्हा: <span className="font-bold">{member.permanentDistrict || 'रत्नागिरी'}</span> • पिनकोड: <span className="font-bold">{member.permanentPincode || member.pincode || '-'}</span>
                                  </div>
                                </div>
                                <div className="bg-white/80 p-3 rounded-xl border border-saffron/15 space-y-1">
                                  <span className="text-saffron-dark font-bold block text-[11px]">सध्याचा पत्ता (पुणे जिल्हा)</span>
                                  <span className="font-bold text-charcoal block">{member.currentAddress}</span>
                                  <div className="text-charcoal/75">
                                    उपनगर: <span className="font-bold">{member.currentSuburb || '-'}</span> • जिल्हा: <span className="font-bold">{member.currentDistrict || member.district?.nameMr || 'पुणे'}</span> • पिनकोड: <span className="font-bold">{member.currentPincode || member.pincode || '-'}</span>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {(() => {
                              const payment = getMemberPayment(member.id);
                              const ssUrl = payment?.screenshotUrl ? imageUrl(payment.screenshotUrl) : null;
                              return (
                                <div>
                                  <h5 className="text-xs font-bold text-saffron-dark mb-3 border-b border-saffron/20 pb-1.5" style={{ fontFamily: "'Baloo 2', sans-serif" }}>पेमेंट माहिती व स्क्रीनशॉट</h5>
                                  {payment ? (
                                    <div className="bg-white/90 p-3.5 rounded-xl border border-saffron/20 flex flex-wrap items-center justify-between gap-4 text-xs">
                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 flex-1">
                                        <div><span className="text-charcoal/50 font-semibold block">रक्कम व माध्यम</span><span className="font-bold text-saffron-dark">₹{payment.amount} ({payment.paymentMode})</span></div>
                                        <div><span className="text-charcoal/50 font-semibold block">ट्रान्झॅक्शन आयडी</span><span className="font-mono font-bold text-charcoal">{payment.upiTxnId || '-'}</span></div>
                                        <div>
                                          <span className="text-charcoal/50 font-semibold block">पेमेंट स्थिती</span>
                                          <span className={`inline-block mt-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${payment.status === 'VERIFIED' ? 'bg-emerald-100 text-emerald-800' : payment.status === 'REJECTED' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'}`}>
                                            {payment.status === 'VERIFIED' ? 'सत्यापित' : payment.status === 'REJECTED' ? 'नाकारले' : 'प्रलंबित'}
                                          </span>
                                        </div>
                                        <div>
                                          <span className="text-charcoal/50 font-semibold block">स्क्रीनशॉट</span>
                                          {ssUrl ? (
                                            <button type="button" onClick={() => setViewScreenshotUrl(ssUrl)} className="mt-0.5 inline-flex items-center gap-1.5 px-2 py-1 bg-amber-100 hover:bg-amber-200 text-saffron-dark font-bold rounded-lg transition-colors cursor-pointer">
                                              <img src={ssUrl} alt="स्क्रीनशॉट" className="w-8 h-8 object-cover rounded border border-saffron/30" />
                                              <span>बघा</span>
                                            </button>
                                          ) : <span className="text-charcoal/40">नाही</span>}
                                        </div>
                                      </div>
                                      {payment.status === 'PENDING' && (
                                        <div className="flex items-center gap-2 shrink-0">
                                          <button type="button" disabled={paymentActionLoadingId === payment.id} onClick={() => handleVerifyPayment(payment.id)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs cursor-pointer">
                                            पडताळणी करा
                                          </button>
                                          <button type="button" disabled={paymentActionLoadingId === payment.id} onClick={() => { setPayRejectModalId(payment.id); setPayRejectReason(''); }} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs cursor-pointer">
                                            नाकारा
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  ) : (
                                    <p className="text-xs text-charcoal/50">पेमेंट तपशील उपलब्ध नाही.</p>
                                  )}
                                </div>
                              );
                            })()}

                            {(member.expectations || member.message) && (
                              <div>
                                <h5 className="text-xs font-bold text-saffron-dark mb-3 border-b border-saffron/20 pb-1.5" style={{ fontFamily: "'Baloo 2', sans-serif" }}>अपेक्षा व संदेश</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                  {member.expectations && (
                                    <div>
                                      <span className="text-charcoal/50 font-semibold block mb-0.5">अपेक्षा</span>
                                      <span className="font-bold text-charcoal">{member.expectations}</span>
                                    </div>
                                  )}
                                  {member.message && (
                                    <div>
                                      <span className="text-charcoal/50 font-semibold block mb-0.5">संदेश</span>
                                      <span className="font-bold text-charcoal">{member.message}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-card-lg p-6 w-full max-w-md shadow-soft-lg border border-amber-200/60">
            <h3 className="text-lg font-bold text-saffron-dark mb-1 flex items-center gap-1" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              अर्ज नाकारण्याचे कारण <span className="text-red-500 font-bold">*</span>
            </h3>
            <p className="text-xs text-charcoal/60 mb-3 font-medium">कृपया अर्ज नाकारण्याचे स्पष्ट कारण नमूद करा.</p>
            <textarea
              className={`w-full border rounded-xl p-3 text-sm outline-none transition-all min-h-[110px] mb-2 font-medium ${rejectError
                  ? 'border-red-500 focus:ring-2 focus:ring-red-200'
                  : 'border-charcoal/20 focus:ring-2 focus:ring-saffron/30 focus:border-saffron'
                }`}
              placeholder="येथे कारण लिहा..."
              value={rejectReason}
              onChange={(e) => {
                setRejectReason(e.target.value);
                if (e.target.value.trim()) setRejectError('');
              }}
            />
            {rejectError && (
              <p className="text-xs text-red-500 font-bold mb-3">
                ⚠️ {rejectError}
              </p>
            )}
            <div className="flex gap-3 justify-end mt-4">
              <button
                onClick={() => {
                  setRejectModalOpen(false);
                  setRejectError('');
                }}
                className="px-4 py-2.5 text-xs font-bold text-charcoal/70 bg-charcoal/5 hover:bg-charcoal/10 rounded-xl transition-colors"
              >
                रद्द करा
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-5 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <XCircle size={14} />
                नाकारा
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Screenshot Modal */}
      {viewScreenshotUrl && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setViewScreenshotUrl(null)}>
          <div className="bg-white rounded-2xl max-w-lg w-full p-4 space-y-3 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
              <h4 className="font-bold text-saffron-dark text-sm">पेमेंट स्क्रीनशॉट</h4>
              <button type="button" onClick={() => setViewScreenshotUrl(null)} className="p-1 rounded-lg hover:bg-charcoal/10"><X size={18} /></button>
            </div>
            <img src={viewScreenshotUrl} alt="Payment Screenshot" className="w-full max-h-[70vh] object-contain rounded-xl border border-saffron/20" />
          </div>
        </div>
      )}

      {/* Payment Reject Modal */}
      {payRejectModalId !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/60 backdrop-blur-sm">
          <div className="bg-white rounded-card-lg p-6 w-full max-w-md shadow-soft-lg border border-amber-200/60 space-y-3">
            <h3 className="text-base font-bold text-saffron-dark">पेमेंट नाकारण्याचे कारण *</h3>
            <textarea
              value={payRejectReason}
              onChange={(e) => setPayRejectReason(e.target.value)}
              placeholder="पेमेंट का नाकारले ते नमूद करा..."
              className="w-full border border-charcoal/20 rounded-xl p-3 text-sm min-h-[90px]"
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setPayRejectModalId(null)} className="px-4 py-2 text-xs font-bold bg-charcoal/10 rounded-xl">रद्द करा</button>
              <button type="button" onClick={handleConfirmRejectPayment} className="px-4 py-2 text-xs font-bold bg-rose-600 text-white rounded-xl">नाकारा</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminMembersPage;