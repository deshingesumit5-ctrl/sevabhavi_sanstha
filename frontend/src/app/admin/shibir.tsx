import React, { useState, useEffect } from 'react';
import { api, type ShibirRegistrationData, type ShibirMaster } from '../../services/api';
import { Calendar, Plus, Trash2, CheckCircle2, XCircle, Search, Eye, ChevronDown, ChevronUp, Filter } from 'lucide-react';
import ConfirmModal, { type ConfirmState } from '../../components/ConfirmModal';

const convertDigitsToMarathi = (str: string | number): string => {
  const marathiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(str).replace(/[0-9]/g, (w) => marathiDigits[parseInt(w, 10)]);
};

export const AdminShibirPage: React.FC = () => {
  const initialCached = api.getCachedShibirs();
  const [registrations, setRegistrations] = useState<ShibirRegistrationData[]>(initialCached || []);
  const [loading, setLoading] = useState<boolean>(!initialCached);
  const [shibirMasters, setShibirMasters] = useState<ShibirMaster[]>([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Filters state
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterShibir, setFilterShibir] = useState('');

  // New Shibir Master Form State
  const [showAddMasterModal, setShowAddMasterModal] = useState(false);
  const [newMasterName, setNewMasterName] = useState('');
  const [newMasterDate, setNewMasterDate] = useState('');
  const [newMasterLocation, setNewMasterLocation] = useState('');
  const [savingMaster, setSavingMaster] = useState(false);

  // Confirm Modal state
  const [confirmState, setConfirmState] = useState<ConfirmState>({ open: false, message: '', onConfirm: () => { } });
  const closeConfirm = () => setConfirmState(prev => ({ ...prev, open: false }));
  const askConfirm = (message: string, onConfirm: () => void) =>
    setConfirmState({ open: true, message, onConfirm });

  const loadData = async () => {
    try {
      const [regs, masters] = await Promise.all([
        api.getAllShibirs().catch(() => []),
        api.getShibirMasters().catch(() => []),
      ]);
      const sortedRegs = [...regs].sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );
      setRegistrations(sortedRegs);
      setShibirMasters(masters);
    } catch (err) {
      console.error('Error loading shibir data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateStatus = async (id: number, status: string) => {
    try {
      await api.updateShibirStatus(id, status);
      setRegistrations(prev => prev.map(r => r.id === id ? { ...r, approvalStatus: status } : r));
    } catch (err: any) {
      alert('स्थिती अद्ययावत करताना त्रुटी: ' + (err.message || err));
    }
  };

  const handleAddMaster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMasterName.trim()) {
      alert('कृपया शिबिराचे नाव प्रविष्ट करा.');
      return;
    }
    if (!newMasterDate || !newMasterDate.trim()) {
      alert('कृपया शिबिर तारीख प्रविष्ट करा.');
      return;
    }
    if (!newMasterLocation.trim()) {
      alert('कृपया स्थळ प्रविष्ट करा.');
      return;
    }
    setSavingMaster(true);
    try {
      const created = await api.createShibirMaster({
        shibirName: newMasterName.trim(),
        shibirDate: newMasterDate.trim(),
        shibirLocation: newMasterLocation.trim(),
      });
      setShibirMasters(prev => [...prev, created]);
      setNewMasterName('');
      setNewMasterDate('');
      setNewMasterLocation('');
      setShowAddMasterModal(false);
    } catch (err: any) {
      alert('शिबिर जोडताना त्रुटी: ' + (err.message || err));
    } finally {
      setSavingMaster(false);
    }
  };

  const handleDeleteMaster = (id: number) => {
    askConfirm('हे शिबिर ड्रॉपडाउन मधून हटवायचे आहे का?', async () => {
      try {
        await api.deleteShibirMaster(id);
        setShibirMasters(prev => prev.filter(m => m.id !== id));
      } catch (err: any) {
        alert('हटवताना त्रुटी: ' + (err.message || err));
      }
    });
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

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('mr-IN');
    } catch {
      return dateStr;
    }
  };

  const filteredRegistrations = registrations.filter(r => {
    const matchSearch = 
      r.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.shibirName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.mobile?.includes(searchTerm) ||
      r.cityVillage?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchShibir = filterShibir ? r.shibirName === filterShibir : true;
    return matchSearch && matchShibir;
  });

  return (
    <div className="p-2 sm:p-4 md:p-6 w-full space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-saffron to-amber-600 rounded-xl text-white shadow-lg">
            <Calendar size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-charcoal" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              शिबिर नोंदणी अर्ज
            </h2>
            <p className="text-[11px] text-charcoal/50 font-semibold">एकूण अर्ज: {filteredRegistrations.length}</p>
          </div>
        </div>

        {/* Right Top Actions */}
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
          <button
            onClick={() => setShowAddMasterModal(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-saffron to-amber-600 hover:from-amber-600 hover:to-saffron text-white font-bold text-xs rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
          >
            <Plus size={16} />
            <span>नवीन शिबिर जोडा</span>
          </button>
        </div>
      </div>

      {/* Shibir Masters (Admin Dropdown Options) Bar */}
      <div className="bg-amber-50/50 border border-amber-200/60 rounded-xl p-4 space-y-3 shadow-soft">
        <h3 className="text-xs font-bold text-saffron-dark uppercase tracking-wider flex items-center gap-1.5">
          <Calendar size={14} className="text-saffron" /> उपलब्ध शिबिर पर्याय
        </h3>
        <div className="flex flex-wrap gap-2">
          {shibirMasters.length === 0 ? (
            <span className="text-xs text-charcoal/50 italic font-normal">कोणतेही नवीन शिबिर जोडलेले नाही.</span>
          ) : (
            shibirMasters.map(m => (
              <div key={m.id} className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-amber-200/80 text-xs font-normal text-charcoal shadow-sm">
                <span className="font-normal">{m.shibirName} {m.shibirDate ? `(${m.shibirDate})` : ''}</span>
                <button
                  onClick={() => handleDeleteMaster(m.id)}
                  className="text-rose-500 hover:text-rose-700 p-0.5 transition-colors"
                  title="हटवा"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Filters Section - Responsive Grid */}
      {showFilters && (
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-amber-200/60 shadow-soft">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 items-center">
            <div>
              <input
                type="text"
                placeholder="नाव, मोबाईल किंवा शहराने शोधा..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 bg-amber-50/20 border border-amber-200/80 rounded-xl text-sm focus:ring-2 focus:ring-saffron/20 focus:border-saffron outline-none font-normal text-charcoal placeholder:text-charcoal/40 transition-all"
              />
            </div>
            <div>
              <select
                value={filterShibir}
                onChange={(e) => setFilterShibir(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-amber-50/20 border border-amber-200/80 rounded-xl text-sm focus:ring-2 focus:ring-saffron/20 focus:border-saffron outline-none font-normal text-charcoal cursor-pointer transition-all"
              >
                <option value="">सर्व शिबिरे</option>
                {shibirMasters.map(m => (
                  <option key={m.id} value={m.shibirName}>{m.shibirName}</option>
                ))}
              </select>
            </div>
            <button className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-saffron to-amber-600 hover:from-amber-600 hover:to-saffron text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm whitespace-nowrap">
              <Search size={16} />
              शोधा
            </button>
          </div>
        </div>
      )}

      {/* Table Container */}
      {loading && registrations.length === 0 ? (
        <div className="bg-white rounded-xl border border-amber-200/60 shadow-soft p-12 text-center">
          <div className="w-8 h-8 border-3 border-saffron border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-charcoal/50 font-semibold">माहिती लोड होत आहे...</p>
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="bg-white rounded-xl border border-charcoal/5 shadow-soft p-12 text-center">
          <Calendar size={48} className="mx-auto text-charcoal/20 mb-4" />
          <p className="text-sm text-charcoal/50 font-semibold">कोणतेही शिबिर अर्ज सापडले नाहीत.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-amber-200/60 shadow-soft overflow-hidden">
          {/* MOBILE: stacked cards */}
          <div className="md:hidden divide-y divide-amber-100/80">
            {filteredRegistrations.map((r, index) => (
              <div key={r.id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-100/80 text-amber-900 text-[11px] font-bold rounded-lg shrink-0">
                      #{convertDigitsToMarathi(index + 1)}
                    </span>
                    <p className="text-base font-normal text-charcoal truncate" style={{ fontFamily: "'Baloo 2', sans-serif" }}>{r.fullName}</p>
                  </div>
                  {getStatusBadge(r.approvalStatus)}
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-normal bg-saffron/10 text-saffron-dark">{r.shibirName}</span>
                  <span className="text-charcoal/70 font-normal">{r.mobile}</span>
                  {r.cityVillage && <span className="text-charcoal/40 font-normal">· {r.cityVillage}</span>}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                    className="flex-1 justify-center px-3 py-2 bg-blue-50 active:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Eye size={15} />
                    अर्ज बघा
                    {expandedId === r.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {r.approvalStatus === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'APPROVED')}
                        className="px-3.5 py-2 bg-emerald-600 active:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1"
                      >
                        <CheckCircle2 size={16} />
                        मंजूर
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'REJECTED')}
                        className="px-3.5 py-2 bg-rose-500 active:bg-rose-600 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1"
                      >
                        <XCircle size={16} />
                        नाकारा
                      </button>
                    </>
                  )}
                </div>

                {expandedId === r.id && (
                  <div className="mt-3 bg-amber-50/40 border border-amber-200/60 rounded-xl p-4 space-y-4 text-xs">
                    <div>
                      <h5 className="text-xs font-bold text-saffron-dark mb-2 border-b border-saffron/20 pb-1" style={{ fontFamily: "'Baloo 2', sans-serif" }}>वैयक्तिक माहिती</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div><span className="text-charcoal/50 font-semibold block">पूर्ण नाव</span><span className="font-normal text-charcoal">{r.fullName}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">वय</span><span className="font-normal text-charcoal">{r.age ? `${r.age} वर्षे` : '-'}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">जन्मतारीख</span><span className="font-normal text-charcoal">{formatDate(r.birthDate)}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">व्यवसाय</span><span className="font-normal text-charcoal">{r.occupation || '-'}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">शिक्षण</span><span className="font-normal text-charcoal">{r.education || '-'}</span></div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-saffron-dark mb-2 border-b border-saffron/20 pb-1" style={{ fontFamily: "'Baloo 2', sans-serif" }}>संपर्क माहिती</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div><span className="text-charcoal/50 font-semibold block">मोबाईल</span><span className="font-normal text-charcoal">{r.mobile}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">नातेवाईक मोबाईल</span><span className="font-normal text-charcoal">{r.relativeMobile || '-'}</span></div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-saffron-dark mb-2 border-b border-saffron/20 pb-1" style={{ fontFamily: "'Baloo 2', sans-serif" }}>शिबिर माहिती</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div><span className="text-charcoal/50 font-semibold block">शिबिर नाव</span><span className="font-normal text-charcoal">{r.shibirName}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">शिबिर तारीख</span><span className="font-normal text-charcoal">{r.shibirDate || '-'}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">स्थळ</span><span className="font-normal text-charcoal">{r.shibirLocation || '-'}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">पूर्वी सहभाग</span><span className="font-normal text-charcoal">{r.participatedEarlier ? `होय (${r.previousEventName || ''})` : 'नाही'}</span></div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-saffron-dark mb-2 border-b border-saffron/20 pb-1" style={{ fontFamily: "'Baloo 2', sans-serif" }}>पत्ता</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2"><span className="text-charcoal/50 font-semibold block">संपूर्ण पत्ता</span><span className="font-normal text-charcoal">{r.fullAddress}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">शहर / गाव</span><span className="font-normal text-charcoal">{r.cityVillage}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">तालुका</span><span className="font-normal text-charcoal">{r.taluka?.nameMr || '-'}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">जिल्हा</span><span className="font-normal text-charcoal">{r.district?.nameMr || '-'}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">राज्य</span><span className="font-normal text-charcoal">{r.state?.nameMr || '-'}</span></div>
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-bold text-saffron-dark mb-2 border-b border-saffron/20 pb-1" style={{ fontFamily: "'Baloo 2', sans-serif" }}>पेमेंट माहिती</h5>
                      <div className="grid grid-cols-2 gap-3">
                        <div><span className="text-charcoal/50 font-semibold block">पेमेंट प्रकार</span><span className="font-normal text-charcoal">{r.paymentMode || 'Online'}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">रक्कम</span><span className="font-normal text-charcoal">{r.amountPaid ? `₹${r.amountPaid}` : '-'}</span></div>
                        <div><span className="text-charcoal/50 font-semibold block">UPI Txn ID</span><span className="font-normal text-charcoal">{r.upiTxnId || '-'}</span></div>
                      </div>
                    </div>

                    {r.specialInfo && (
                      <div>
                        <h5 className="text-xs font-bold text-saffron-dark mb-2 border-b border-saffron/20 pb-1" style={{ fontFamily: "'Baloo 2', sans-serif" }}>विशेष माहिती</h5>
                        <p className="font-normal text-charcoal">{r.specialInfo}</p>
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
                  <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>फोटो</th>
                  <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>नाव</th>
                  <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>मोबाईल</th>
                  <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>शिबिर नाव & तारीख</th>
                  <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>पत्ता & गाव</th>
                  <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>पेमेंट मोड</th>
                  <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>स्थिती</th>
                  <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>कृती</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100/80">
                {filteredRegistrations.map((r, index) => (
                  <React.Fragment key={r.id}>
                    <tr className="hover:bg-cream/30 transition-colors font-normal text-charcoal">
                      <td className="p-3.5 font-bold text-center text-charcoal/70">{convertDigitsToMarathi(index + 1)}</td>
                      <td className="p-3.5">
                        {r.passportPhotoUrl ? (
                          <img src={r.passportPhotoUrl} alt="Photo" className="w-9 h-11 object-cover rounded border border-amber-200" />
                        ) : (
                          <div className="w-9 h-11 bg-amber-50 rounded border border-amber-200/60 flex items-center justify-center text-[9px] text-charcoal/40 font-normal">No Photo</div>
                        )}
                      </td>
                      <td className="p-3.5 font-normal text-charcoal">
                        <p className="font-normal text-charcoal">{r.fullName}</p>
                        {r.age && <p className="text-[11px] text-charcoal/60 font-normal">वय: {r.age} वर्षे</p>}
                      </td>
                      <td className="p-3.5 font-normal text-charcoal">{r.mobile}</td>
                      <td className="p-3.5 font-normal text-charcoal">
                        <p className="font-normal text-charcoal">{r.shibirName}</p>
                        <p className="text-[11px] text-charcoal/60 font-normal">{r.shibirDate || '-'} | {r.shibirLocation || '-'}</p>
                      </td>
                      <td className="p-3.5 font-normal text-charcoal">
                        <p className="font-normal text-charcoal">{r.cityVillage}</p>
                        <p className="text-[10px] text-charcoal/60 font-normal">{r.district?.nameMr || ''}, {r.state?.nameMr || ''}</p>
                      </td>
                      <td className="p-3.5 font-normal">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.paymentMode === 'Cash' ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                          {r.paymentMode || 'Online'} {r.amountPaid ? `(₹${r.amountPaid})` : ''}
                        </span>
                      </td>
                      <td className="p-3.5">{getStatusBadge(r.approvalStatus)}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                            title="अर्ज बघा"
                          >
                            <Eye size={12} />
                            अर्ज बघा
                            {expandedId === r.id ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                          </button>
                          {r.approvalStatus === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatus(r.id, 'APPROVED')}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors shadow-sm"
                                title="मंजूर करा"
                              >
                                <CheckCircle2 size={12} />
                                मंजूर करा
                              </button>
                              <button
                                onClick={() => handleUpdateStatus(r.id, 'REJECTED')}
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

                    {expandedId === r.id && (
                      <tr>
                        <td colSpan={9} className="p-0">
                          <div className="bg-amber-50/40 border-t border-b border-saffron/20 p-5 space-y-5">
                            <div>
                              <h5 className="text-xs font-bold text-saffron-dark mb-3 border-b border-saffron/20 pb-1.5" style={{ fontFamily: "'Baloo 2', sans-serif" }}>वैयक्तिक माहिती</h5>
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">पूर्ण नाव</span>
                                  <span className="font-normal text-charcoal">{r.fullName}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">वय</span>
                                  <span className="font-normal text-charcoal">{r.age ? `${r.age} वर्षे` : '-'}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">जन्मतारीख</span>
                                  <span className="font-normal text-charcoal">{formatDate(r.birthDate)}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">व्यवसाय</span>
                                  <span className="font-normal text-charcoal">{r.occupation || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">शिक्षण</span>
                                  <span className="font-normal text-charcoal">{r.education || '-'}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h5 className="text-xs font-bold text-saffron-dark mb-3 border-b border-saffron/20 pb-1.5" style={{ fontFamily: "'Baloo 2', sans-serif" }}>संपर्क माहिती</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">मोबाईल</span>
                                  <span className="font-normal text-charcoal">{r.mobile}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">नातेवाईक मोबाईल</span>
                                  <span className="font-normal text-charcoal">{r.relativeMobile || '-'}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h5 className="text-xs font-bold text-saffron-dark mb-3 border-b border-saffron/20 pb-1.5" style={{ fontFamily: "'Baloo 2', sans-serif" }}>शिबिर माहिती</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">शिबिर नाव</span>
                                  <span className="font-normal text-charcoal">{r.shibirName}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">शिबिर तारीख</span>
                                  <span className="font-normal text-charcoal">{r.shibirDate || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">स्थळ</span>
                                  <span className="font-normal text-charcoal">{r.shibirLocation || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">पूर्वी सहभाग</span>
                                  <span className="font-normal text-charcoal">{r.participatedEarlier ? `होय (${r.previousEventName || ''})` : 'नाही'}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h5 className="text-xs font-bold text-saffron-dark mb-3 border-b border-saffron/20 pb-1.5" style={{ fontFamily: "'Baloo 2', sans-serif" }}>पत्ता व ठिकाण</h5>
                              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                                <div className="col-span-2">
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">संपूर्ण पत्ता</span>
                                  <span className="font-normal text-charcoal">{r.fullAddress}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">शहर / गाव</span>
                                  <span className="font-normal text-charcoal">{r.cityVillage}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">तालुका</span>
                                  <span className="font-normal text-charcoal">{r.taluka?.nameMr || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">जिल्हा</span>
                                  <span className="font-normal text-charcoal">{r.district?.nameMr || '-'}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h5 className="text-xs font-bold text-saffron-dark mb-3 border-b border-saffron/20 pb-1.5" style={{ fontFamily: "'Baloo 2', sans-serif" }}>पेमेंट व जमा माहिती</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">पेमेंट प्रकार</span>
                                  <span className="font-normal text-charcoal">{r.paymentMode || 'Online'}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">भरलेली रक्कम</span>
                                  <span className="font-normal text-charcoal">{r.amountPaid ? `₹${r.amountPaid}` : '-'}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">UPI Txn ID</span>
                                  <span className="font-normal text-charcoal">{r.upiTxnId || '-'}</span>
                                </div>
                              </div>
                            </div>

                            {r.specialInfo && (
                              <div>
                                <h5 className="text-xs font-bold text-saffron-dark mb-3 border-b border-saffron/20 pb-1.5" style={{ fontFamily: "'Baloo 2', sans-serif" }}>विशेष माहिती</h5>
                                <p className="font-normal text-charcoal">{r.specialInfo}</p>
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

      {/* Add Shibir Master Modal */}
      {showAddMasterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-saffron-dark border-b border-amber-200/60 pb-2" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              नवीन शिबिर जोडा (Add Shibir for Dropdown)
            </h3>
            <form onSubmit={handleAddMaster} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  शिबिर / कार्यक्रमाचे नाव <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. भव्य मोफत नेत्र तपासणी शिबिर"
                  value={newMasterName}
                  onChange={(e) => setNewMasterName(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-200/80 rounded-xl text-xs focus:ring-2 focus:ring-saffron/20 focus:border-saffron outline-none font-normal text-charcoal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  शिबिर तारीख <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={newMasterDate}
                  onChange={(e) => setNewMasterDate(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-200/80 rounded-xl text-xs focus:ring-2 focus:ring-saffron/20 focus:border-saffron outline-none font-normal text-charcoal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-charcoal mb-1">
                  स्थळ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. दापोली, हॉल नं. २"
                  value={newMasterLocation}
                  onChange={(e) => setNewMasterLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-amber-200/80 rounded-xl text-xs focus:ring-2 focus:ring-saffron/20 focus:border-saffron outline-none font-normal text-charcoal"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-amber-200/60">
                <button
                  type="button"
                  onClick={() => setShowAddMasterModal(false)}
                  className="px-4 py-2 border rounded-xl text-xs font-bold hover:bg-gray-50"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  disabled={savingMaster}
                  className="px-5 py-2 bg-saffron hover:bg-saffron-dark text-white rounded-xl text-xs font-bold shadow"
                >
                  {savingMaster ? 'साठवत आहे...' : 'जोडा (Save)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      <ConfirmModal state={confirmState} onClose={closeConfirm} />
    </div>
  );
};

export default AdminShibirPage;
