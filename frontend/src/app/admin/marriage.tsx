import React, { useState, useEffect } from 'react';
import { Heart, Eye, CheckCircle2, XCircle, ChevronDown, ChevronUp, Search, Filter } from 'lucide-react';
import { api, type MarriageRegistrationData, type MaritalStatus, type BloodGroup } from '../../services/api';

const convertDigitsToMarathi = (str: string | number): string => {
  const marathiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(str).replace(/[0-9]/g, (w) => marathiDigits[parseInt(w, 10)]);
};

const AdminMarriagePage: React.FC = () => {
  const [marriages, setMarriages] = useState<MarriageRegistrationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [maritalStatuses, setMaritalStatuses] = useState<MaritalStatus[]>([]);
  const [bloodGroups, setBloodGroups] = useState<BloodGroup[]>([]);

  // Filters state
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [filterBloodGroup, setFilterBloodGroup] = useState('');
  const [filterType, setFilterType] = useState('');

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectId, setRejectId] = useState<number | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  useEffect(() => {
    loadMarriages();
    api.getMaritalStatuses().then(setMaritalStatuses).catch(err => console.error('Error loading marital statuses:', err));
    api.getBloodGroups().then(setBloodGroups).catch(err => console.error('Error loading blood groups:', err));
  }, []);

  const loadMarriages = async () => {
    try {
      setLoading(true);
      const data = await api.getAllMarriages();
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setMarriages(sorted);
    } catch (err) {
      console.error('Error loading marriages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await api.updateMarriageStatus(id, status);
      setMarriages(prev => prev.map(m => m.id === id ? { ...m, approvalStatus: status } : m));
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
      await api.updateMarriageStatus(rejectId, 'REJECTED', rejectReason.trim());
      setMarriages(prev => prev.map(m => m.id === rejectId ? { ...m, approvalStatus: 'REJECTED' } : m));
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

  const getProfileBadge = (type: string) => {
    return type === 'bride'
      ? <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-700">वधू</span>
      : <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">वर</span>;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('mr-IN');
    } catch {
      return dateStr;
    }
  };

  const getOccupationLabel = (type: string) => {
    const map: Record<string, string> = {
      'private_job': 'खाजगी नोकरी',
      'gov_job': 'शासकीय नोकरी',
      'business': 'व्यवसाय',
      'not_working': 'काम करत नाही',
    };
    return map[type] || type;
  };

  const getMaritalLabel = (code: string) =>
    maritalStatuses.find(m => m.code === code)?.labelMr ?? code;

  const filteredMarriages = marriages.filter(m => {
    const matchName = m.fullName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCity = filterCity ? (m.city?.toLowerCase().includes(filterCity.toLowerCase()) || m.district?.nameMr?.includes(filterCity)) : true;
    const matchBloodGroup = filterBloodGroup ? m.bloodGroup === filterBloodGroup : true;
    const matchType = filterType ? m.profileType === filterType : true;
    return matchName && matchCity && matchBloodGroup && matchType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-saffron border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="p-2 sm:p-4 md:p-6 w-full space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-saffron to-amber-600 rounded-xl text-white shadow-lg">
            <Heart size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-charcoal" style={{ fontFamily: "'Baloo 2', sans-serif" }}>विवाह नोंदणी अर्ज</h2>
            <p className="text-[11px] text-charcoal/50 font-semibold">एकूण अर्ज: {filteredMarriages.length}</p>
          </div>
        </div>

        {/* Right Top Actions: Filter Button */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm border ${
              showFilters
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
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-[1fr_160px_140px_140px_auto] gap-3 items-center">
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
                placeholder="शहर..."
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
                <option value="bride">वधू</option>
                <option value="groom">वर</option>
              </select>
            </div>
            <button className="w-full sm:col-span-2 md:col-span-1 lg:w-auto px-6 py-2.5 bg-gradient-to-r from-saffron to-amber-600 hover:from-amber-600 hover:to-saffron text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm whitespace-nowrap">
              <Search size={16} />
              शोधा
            </button>
          </div>
        </div>
      )}

      {/* Marriage Table */}
      {filteredMarriages.length === 0 ? (
        <div className="bg-white rounded-card border border-charcoal/5 shadow-soft p-12 text-center">
          <Heart size={48} className="mx-auto text-charcoal/20 mb-4" />
          <p className="text-sm text-charcoal/50 font-semibold">कोणतेही विवाह नोंदणी अर्ज नाहीत.</p>
        </div>
      ) : (
        <div className="bg-white rounded-card border border-amber-200/60 shadow-soft overflow-hidden">
          {/* MOBILE: stacked cards */}
          <div className="md:hidden divide-y divide-amber-100/80">
            {filteredMarriages.map((item, index) => (
              <div key={item.id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-100/80 text-amber-900 text-[11px] font-bold rounded-lg shrink-0">
                      #{convertDigitsToMarathi(index + 1)}
                    </span>
                    <p className="text-base font-bold text-charcoal truncate" style={{ fontFamily: "'Baloo 2', sans-serif" }}>{item.fullName}</p>
                  </div>
                  {getStatusBadge(item.approvalStatus)}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  {getProfileBadge(item.profileType)}
                  <span className="text-charcoal/70 font-medium">{item.city}</span>
                  <span className="text-charcoal/40">· {formatDate(item.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                    className="flex-1 justify-center px-3 py-2 bg-blue-50 active:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Eye size={15} />
                    अर्ज बघा
                    {expandedId === item.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {item.approvalStatus === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleStatusUpdate(item.id, 'APPROVED')}
                        className="px-3.5 py-2 bg-emerald-600 active:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1"
                      >
                        <CheckCircle2 size={16} />
                        मंजूर
                      </button>
                      <button
                        onClick={() => handleRejectClick(item.id)}
                        className="px-3.5 py-2 bg-rose-500 active:bg-rose-600 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1"
                      >
                        <XCircle size={16} />
                        नाकारा
                      </button>
                    </>
                  )}
                </div>

                {expandedId === item.id && (
                  <div className="mt-3 bg-amber-50/40 border border-amber-200/60 rounded-xl p-4 space-y-4 text-xs">
                    <div>
                      <h5 className="text-xs font-bold text-saffron-dark mb-2 border-b border-saffron/20 pb-1" style={{ fontFamily: "'Baloo 2', sans-serif" }}>वैयक्तिक माहिती</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div><span className="text-charcoal/50 font-semibold block">पूर्ण नाव</span><span className="font-bold text-charcoal">{item.fullName}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">जन्मतारीख</span><span className="font-bold text-charcoal">{formatDate(item.birthDate)}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">उंची</span><span className="font-bold text-charcoal">{item.height}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">रक्तगट</span><span className="font-bold text-charcoal">{item.bloodGroup}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">वैवाहिक स्थिती</span><span className="font-bold text-charcoal">{getMaritalLabel(item.maritalStatus)}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">धर्म</span><span className="font-bold text-charcoal">{item.religion}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">जात</span><span className="font-bold text-charcoal">{item.caste}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">गोत्र</span><span className="font-bold text-charcoal">{item.gotra || '-'}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">मंगळ दोष</span><span className="font-bold text-charcoal">{item.manglik === 'yes' ? 'होय' : item.manglik === 'no' ? 'नाही' : 'माहित नाही'}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">शहर</span><span className="font-bold text-charcoal">{item.city}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">जिल्हा</span><span className="font-bold text-charcoal">{item.district?.nameMr || '-'}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">राज्य</span><span className="font-bold text-charcoal">{item.state?.nameMr || '-'}</span></div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-saffron-dark mb-2 border-b border-saffron/20 pb-1" style={{ fontFamily: "'Baloo 2', sans-serif" }}>संपर्क माहिती</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div><span className="text-charcoal/50 font-semibold block">मोबाईल</span><span className="font-bold text-charcoal">{item.mobile}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">ईमेल</span><span className="font-bold text-charcoal">{item.email || '-'}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">पालकांचा नंबर</span><span className="font-bold text-charcoal">{item.parentMobile}</span></div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-saffron-dark mb-2 border-b border-saffron/20 pb-1" style={{ fontFamily: "'Baloo 2', sans-serif" }}>शैक्षणिक माहिती</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div><span className="text-charcoal/50 font-semibold block">शिक्षण स्तर</span><span className="font-bold text-charcoal">{item.educationLevel}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">पदवी</span><span className="font-bold text-charcoal">{item.degreeName}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">शाळा / कॉलेज</span><span className="font-bold text-charcoal">{item.schoolCollege || '-'}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">उत्तीर्ण वर्ष</span><span className="font-bold text-charcoal">{item.passingYear}</span></div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-saffron-dark mb-2 border-b border-saffron/20 pb-1" style={{ fontFamily: "'Baloo 2', sans-serif" }}>व्यावसायिक माहिती</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div><span className="text-charcoal/50 font-semibold block">नोकरी / व्यवसाय प्रकार</span><span className="font-bold text-charcoal">{getOccupationLabel(item.occupationType)}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">पद</span><span className="font-bold text-charcoal">{item.designation || '-'}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">कंपनी</span><span className="font-bold text-charcoal">{item.companyName || '-'}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">वार्षिक उत्पन्न</span><span className="font-bold text-charcoal">{item.annualIncome}</span></div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-saffron-dark mb-2 border-b border-saffron/20 pb-1" style={{ fontFamily: "'Baloo 2', sans-serif" }}>कुटुंबाची माहिती</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div><span className="text-charcoal/50 font-semibold block">वडिलांचे नाव</span><span className="font-bold text-charcoal">{item.fatherName}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">वडिलांचा व्यवसाय</span><span className="font-bold text-charcoal">{item.fatherOccupation}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">आईचे नाव</span><span className="font-bold text-charcoal">{item.motherName}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">भाऊ / बहीण</span><span className="font-bold text-charcoal">{item.brothers} भाऊ, {item.sisters} बहीण</span></div>
                        {item.familyBackground && (
                          <div className="col-span-2"><span className="text-charcoal/50 font-semibold block">कुटुंब पार्श्वभूमी</span><span className="font-bold text-charcoal">{item.familyBackground}</span></div>
                        )}
                        <div className="col-span-2"><span className="text-charcoal/50 font-semibold block">स्वतःबद्दल</span><span className="font-bold text-charcoal">{item.aboutSelf}</span></div>
                        <div className="col-span-2"><span className="text-charcoal/50 font-semibold block">अपेक्षा</span><span className="font-bold text-charcoal">{item.expectations}</span></div>
                      </div>
                    </div>
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
                  <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>प्रकार</th>
                  <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>मोबाईल</th>
                  <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>शहर</th>
                  <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>तारीख</th>
                  <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>स्थिती</th>
                  <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>कृती</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100/80">
                {filteredMarriages.map((item, index) => (
                  <React.Fragment key={item.id}>
                    <tr className="hover:bg-cream/30 transition-colors font-medium text-charcoal">
                      <td className="p-3.5 font-bold text-center text-charcoal/70">{convertDigitsToMarathi(index + 1)}</td>
                      <td className="p-3.5 font-bold">{item.fullName}</td>
                      <td className="p-3.5">{getProfileBadge(item.profileType)}</td>
                      <td className="p-3.5">{item.mobile}</td>
                      <td className="p-3.5">{item.city}</td>
                      <td className="p-3.5">{formatDate(item.createdAt)}</td>
                      <td className="p-3.5">{getStatusBadge(item.approvalStatus)}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                            title="अर्ज बघा"
                          >
                            <Eye size={12} />
                            अर्ज बघा
                            {expandedId === item.id ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                          </button>
                          {item.approvalStatus === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(item.id, 'APPROVED')}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors shadow-sm"
                                title="मंजूर करा"
                              >
                                <CheckCircle2 size={12} />
                                मंजूर करा
                              </button>
                              <button
                                onClick={() => handleRejectClick(item.id)}
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
                    {expandedId === item.id && (
                      <tr>
                        <td colSpan={8} className="p-0">
                          <div className="bg-amber-50/40 border-t border-b border-saffron/20 p-5 space-y-5">
                            {/* Personal Info */}
                            <div>
                              <h5 className="text-xs font-bold text-saffron-dark mb-3 border-b border-saffron/20 pb-1.5" style={{ fontFamily: "'Baloo 2', sans-serif" }}>वैयक्तिक माहिती</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">पूर्ण नाव</span>
                                  <span className="font-bold text-charcoal">{item.fullName}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">जन्मतारीख</span>
                                  <span className="font-bold text-charcoal">{formatDate(item.birthDate)}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">उंची</span>
                                  <span className="font-bold text-charcoal">{item.height}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">रक्तगट</span>
                                  <span className="font-bold text-charcoal">{item.bloodGroup}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">वैवाहिक स्थिती</span>
                                  <span className="font-bold text-charcoal">{getMaritalLabel(item.maritalStatus)}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">धर्म</span>
                                  <span className="font-bold text-charcoal">{item.religion}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">जात</span>
                                  <span className="font-bold text-charcoal">{item.caste}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">गोत्र</span>
                                  <span className="font-bold text-charcoal">{item.gotra || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">मंगळ दोष</span>
                                  <span className="font-bold text-charcoal">{item.manglik === 'yes' ? 'होय' : item.manglik === 'no' ? 'नाही' : 'माहित नाही'}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">शहर</span>
                                  <span className="font-bold text-charcoal">{item.city}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">जिल्हा</span>
                                  <span className="font-bold text-charcoal">{item.district?.nameMr || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">राज्य</span>
                                  <span className="font-bold text-charcoal">{item.state?.nameMr || '-'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Contact */}
                            <div>
                              <h5 className="text-xs font-bold text-saffron-dark mb-3 border-b border-saffron/20 pb-1.5" style={{ fontFamily: "'Baloo 2', sans-serif" }}>संपर्क माहिती</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">मोबाईल</span>
                                  <span className="font-bold text-charcoal">{item.mobile}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">ईमेल</span>
                                  <span className="font-bold text-charcoal">{item.email || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">पालकांचा नंबर</span>
                                  <span className="font-bold text-charcoal">{item.parentMobile}</span>
                                </div>
                              </div>
                            </div>

                            {/* Education */}
                            <div>
                              <h5 className="text-xs font-bold text-saffron-dark mb-3 border-b border-saffron/20 pb-1.5" style={{ fontFamily: "'Baloo 2', sans-serif" }}>शैक्षणिक माहिती</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">शिक्षण स्तर</span>
                                  <span className="font-bold text-charcoal">{item.educationLevel}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">पदवी</span>
                                  <span className="font-bold text-charcoal">{item.degreeName}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">शाळा / कॉलेज</span>
                                  <span className="font-bold text-charcoal">{item.schoolCollege || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">उत्तीर्ण वर्ष</span>
                                  <span className="font-bold text-charcoal">{item.passingYear}</span>
                                </div>
                              </div>
                            </div>

                            {/* Occupation */}
                            <div>
                              <h5 className="text-xs font-bold text-saffron-dark mb-3 border-b border-saffron/20 pb-1.5" style={{ fontFamily: "'Baloo 2', sans-serif" }}>व्यावसायिक माहिती</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">नोकरी / व्यवसाय प्रकार</span>
                                  <span className="font-bold text-charcoal">{getOccupationLabel(item.occupationType)}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">पद</span>
                                  <span className="font-bold text-charcoal">{item.designation || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">कंपनी</span>
                                  <span className="font-bold text-charcoal">{item.companyName || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">वार्षिक उत्पन्न</span>
                                  <span className="font-bold text-charcoal">{item.annualIncome}</span>
                                </div>
                              </div>
                            </div>

                            {/* Family */}
                            <div>
                              <h5 className="text-xs font-bold text-saffron-dark mb-3 border-b border-saffron/20 pb-1.5" style={{ fontFamily: "'Baloo 2', sans-serif" }}>कुटुंबाची माहिती</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">वडिलांचे नाव</span>
                                  <span className="font-bold text-charcoal">{item.fatherName}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">वडिलांचा व्यवसाय</span>
                                  <span className="font-bold text-charcoal">{item.fatherOccupation}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">आईचे नाव</span>
                                  <span className="font-bold text-charcoal">{item.motherName}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">भाऊ / बहीण</span>
                                  <span className="font-bold text-charcoal">{item.brothers} भाऊ, {item.sisters} बहीण</span>
                                </div>
                                {item.familyBackground && (
                                  <div className="md:col-span-4">
                                    <span className="text-charcoal/50 font-semibold block mb-0.5">कुटुंब पार्श्वभूमी</span>
                                    <span className="font-bold text-charcoal">{item.familyBackground}</span>
                                  </div>
                                )}
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">स्वतःबद्दल</span>
                                  <span className="font-bold text-charcoal">{item.aboutSelf}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">अपेक्षा</span>
                                  <span className="font-bold text-charcoal">{item.expectations}</span>
                                </div>
                              </div>
                            </div>
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
              className={`w-full border rounded-xl p-3 text-sm outline-none transition-all min-h-[110px] mb-2 font-medium ${
                rejectError
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
    </div>
  );
}
export default AdminMarriagePage;
