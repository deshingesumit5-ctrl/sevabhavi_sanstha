import React, { useState, useEffect } from 'react';
import { HelpCircle, Eye, ChevronDown, ChevronUp, Search, Trash2, Calendar, Phone, Mail, User, MessageSquare, CheckCircle2, AlertCircle, X, Filter } from 'lucide-react';
import { api, type InquiryData } from '../../services/api';

const MARATHI_MONTHS = [
  'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
  'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'
];

const convertDigitsToMarathi = (str: string | number): string => {
  const marathiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(str).replace(/[0-9]/g, (w) => marathiDigits[parseInt(w, 10)]);
};

const AdminInquiriesPage: React.FC = () => {
  const initialCached = api.getCachedInquiries();
  const [inquiries, setInquiries] = useState<InquiryData[]>(initialCached || []);
  const [loading, setLoading] = useState<boolean>(!initialCached);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Filters state
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Delete Modal & Banner state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadInquiries();
  }, []);

  const loadInquiries = async () => {
    try {
      const data = await api.getAllInquiries();
      const sorted = [...data].sort((a, b) => {
        const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return timeB - timeA;
      });
      setInquiries(sorted);
    } catch (err) {
      console.error('Error loading inquiries:', err);
    } finally {
      setLoading(false);
    }
  };

  const promptDeleteInquiry = (id: number) => {
    setDeleteId(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (deleteId === null) return;
    try {
      setIsDeleting(true);
      await api.deleteInquiry(deleteId);
      setInquiries((prev) => prev.filter((item) => item.id !== deleteId));
      if (expandedId === deleteId) setExpandedId(null);
      setBannerMessage({ type: 'success', text: 'चौकशी अर्ज यशस्वीरीत्या हटवला गेला.' });
    } catch (err) {
      console.error('Error deleting inquiry:', err);
      setBannerMessage({ type: 'error', text: 'चौकशी अर्ज हटवताना त्रुटी आली.' });
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setDeleteId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const day = convertDigitsToMarathi(date.getDate());
      const month = MARATHI_MONTHS[date.getMonth()];
      const year = convertDigitsToMarathi(date.getFullYear());
      return `${day} ${month}, ${year}`;
    } catch {
      return dateStr;
    }
  };

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      const day = convertDigitsToMarathi(date.getDate());
      const month = MARATHI_MONTHS[date.getMonth()];
      const year = convertDigitsToMarathi(date.getFullYear());
      let hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12;
      const formattedTime = `${convertDigitsToMarathi(hours)}:${convertDigitsToMarathi(minutes)} ${ampm}`;
      return `${day} ${month}, ${year} ${formattedTime}`;
    } catch {
      return dateStr;
    }
  };

  // Filter inquiries by search query (Name, Mobile, Message, Email)
  const filteredInquiries = inquiries.filter((inq) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      inq.name.toLowerCase().includes(q) ||
      inq.mobile.includes(q) ||
      (inq.email && inq.email.toLowerCase().includes(q)) ||
      inq.message.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-4">
      {/* Banner Message Alert */}
      {bannerMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between shadow-sm animate-fadeIn ${
            bannerMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            {bannerMessage.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span>{bannerMessage.text}</span>
          </div>
          <button
            onClick={() => setBannerMessage(null)}
            className="p-1 hover:bg-black/5 rounded-lg transition-colors text-charcoal/60"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-saffron to-amber-600 rounded-xl text-white shadow-lg">
            <HelpCircle size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-charcoal" style={{ fontFamily: "'Baloo 2', sans-serif" }}>चौकशी अर्ज</h2>
            <p className="text-[11px] text-charcoal/50 font-semibold">एकूण चौकशी: {filteredInquiries.length}</p>
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

      {/* Search Filter */}
      {showFilters && (
        <div className="bg-white p-4 sm:p-5 rounded-card border border-amber-200/60 shadow-soft">
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="नाव, मोबाईल किंवा संदेशानुसार शोधा..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2.5 bg-amber-50/20 border border-amber-200/80 rounded-xl text-sm focus:ring-2 focus:ring-saffron/20 focus:border-saffron outline-none font-medium text-charcoal placeholder:text-charcoal/40 transition-all"
              />
            </div>
            <button className="px-6 py-2.5 bg-gradient-to-r from-saffron to-amber-600 hover:from-amber-600 hover:to-saffron text-white font-bold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 text-sm whitespace-nowrap">
              <Search size={16} />
              शोधा
            </button>
          </div>
        </div>
      )}

      {/* Inquiries Table Container */}
      {loading && inquiries.length === 0 ? (
        <div className="bg-white rounded-card border border-amber-200/60 shadow-soft p-12 text-center">
          <div className="w-8 h-8 border-3 border-saffron border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-charcoal/50 font-semibold">माहिती लोड होत आहे...</p>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="bg-white rounded-card border border-charcoal/5 shadow-soft p-12 text-center">
          <HelpCircle size={48} className="mx-auto text-charcoal/20 mb-4" />
          <p className="text-sm text-charcoal/50 font-semibold">कोणतेही चौकशी अर्ज उपलब्ध नाहीत.</p>
        </div>
      ) : (
        <div className="bg-white rounded-card border border-amber-200/60 shadow-soft overflow-hidden">
          {/* MOBILE: stacked cards */}
          <div className="md:hidden divide-y divide-amber-100/80">
            {filteredInquiries.map((inq, index) => (
              <div key={inq.id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-amber-100/80 text-amber-900 text-[11px] font-bold rounded-lg shrink-0">
                      #{convertDigitsToMarathi(index + 1)}
                    </span>
                    <p className="text-base font-normal text-charcoal truncate" style={{ fontFamily: "'Baloo 2', sans-serif" }}>{inq.name}</p>
                  </div>
                  <span className="text-[10px] text-charcoal/50 font-semibold">{formatDate(inq.createdAt)}</span>
                </div>

                <p className="text-xs text-charcoal/70 line-clamp-2 italic bg-amber-50/40 p-2 rounded-lg border border-amber-200/40">
                  "{inq.message}"
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => setExpandedId(expandedId === inq.id ? null : inq.id)}
                    className="flex-1 justify-center px-3 py-2 bg-blue-50 active:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Eye size={15} />
                    अर्ज पहा
                    {expandedId === inq.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <button
                    onClick={() => promptDeleteInquiry(inq.id)}
                    className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                    title="हटवा"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Expanded Details Card */}
                {expandedId === inq.id && (
                  <div className="mt-3 bg-amber-50/40 border border-amber-200/60 rounded-xl p-4 space-y-3 text-xs animate-fadeIn">
                    <h5 className="text-xs font-bold text-saffron-dark border-b border-saffron/20 pb-1 flex items-center gap-1.5" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                      <User size={14} /> चौकशी अर्ज तपशील
                    </h5>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-charcoal/50 font-semibold block">नाव</span>
                        <span className="font-bold text-charcoal">{inq.name}</span>
                      </div>
                      <div>
                        <span className="text-charcoal/50 font-semibold block">मोबाईल नंबर</span>
                        <span className="font-bold text-charcoal">{inq.mobile}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-charcoal/50 font-semibold block">ईमेल आयडी</span>
                        <span className="font-bold text-charcoal">{inq.email || '-'}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-charcoal/50 font-semibold block">तारीख व वेळ</span>
                        <span className="font-bold text-charcoal">{formatDateTime(inq.createdAt)}</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-charcoal/50 font-semibold block mb-1">संदेश / विचार:</span>
                      <div className="p-3 bg-white border border-amber-200/60 rounded-lg text-charcoal font-medium whitespace-pre-wrap leading-relaxed">
                        {inq.message}
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
                  <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>मोबाईल</th>
                  <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>ईमेल</th>
                  <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>संदेश</th>
                  <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>तारीख</th>
                  <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>कृती</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-amber-100/80">
                {filteredInquiries.map((inq, index) => (
                  <React.Fragment key={inq.id}>
                    <tr className="hover:bg-cream/30 transition-colors font-medium text-charcoal">
                      <td className="p-3.5 font-bold text-center text-charcoal/70">{convertDigitsToMarathi(index + 1)}</td>
                      <td className="p-3.5 font-normal text-charcoal">{inq.name}</td>
                      <td className="p-3.5">{inq.mobile}</td>
                      <td className="p-3.5">{inq.email || '-'}</td>
                      <td className="p-3.5 max-w-xs truncate" title={inq.message}>
                        {inq.message}
                      </td>
                      <td className="p-3.5">{formatDate(inq.createdAt)}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setExpandedId(expandedId === inq.id ? null : inq.id)}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                            title="अर्ज पहा"
                          >
                            <Eye size={12} />
                            अर्ज पहा
                            {expandedId === inq.id ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                          </button>
                          <button
                            onClick={() => promptDeleteInquiry(inq.id)}
                            className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-bold transition-colors"
                            title="हटवा"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded Desktop Details Row */}
                    {expandedId === inq.id && (
                      <tr className="bg-amber-50/40">
                        <td colSpan={7} className="p-4 border-b border-saffron/20">
                          <div className="bg-white border border-amber-200/60 rounded-xl p-4 shadow-sm space-y-3">
                            <div className="flex items-center justify-between border-b border-amber-200/60 pb-2">
                              <h4 className="text-sm font-bold text-saffron-dark flex items-center gap-2" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                                <HelpCircle size={16} /> चौकशी अर्ज तपशील
                              </h4>
                              <span className="text-[11px] text-charcoal/50 font-semibold flex items-center gap-1">
                                <Calendar size={13} /> {formatDateTime(inq.createdAt)}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-xs">
                              <div className="flex items-center gap-2">
                                <User size={15} className="text-saffron shrink-0" />
                                <div>
                                  <span className="text-charcoal/50 block font-semibold text-[10px]">नाव</span>
                                  <span className="font-bold text-charcoal">{inq.name}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Phone size={15} className="text-saffron shrink-0" />
                                <div>
                                  <span className="text-charcoal/50 block font-semibold text-[10px]">मोबाईल क्रमांक</span>
                                  <span className="font-bold text-charcoal">{inq.mobile}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <Mail size={15} className="text-saffron shrink-0" />
                                <div>
                                  <span className="text-charcoal/50 block font-semibold text-[10px]">ईमेल आयडी</span>
                                  <span className="font-bold text-charcoal">{inq.email || '-'}</span>
                                </div>
                              </div>
                            </div>

                            <div className="pt-2">
                              <span className="text-charcoal/60 font-bold block text-[11px] mb-1 flex items-center gap-1">
                                <MessageSquare size={13} /> संदेश / विचार:
                              </span>
                              <div className="p-3.5 bg-amber-50/20 border border-amber-200/60 rounded-lg text-charcoal text-xs font-medium leading-relaxed whitespace-pre-wrap">
                                {inq.message}
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

      {/* Delete Confirmation Banner Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-amber-200/60">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-red-100 text-red-600 rounded-full">
                <Trash2 size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-charcoal" style={{ fontFamily: "'Baloo 2', sans-serif" }}>चौकशी अर्ज हटवा</h3>
                <p className="text-xs text-charcoal/60 font-medium">हा बदल रद्द केला जाऊ शकत नाही.</p>
              </div>
            </div>

            <p className="text-sm font-semibold text-charcoal/80 bg-cream/40 p-3 rounded-xl border border-maroon/10">
              तुम्हाला हा चौकशी अर्ज खरोखर हटवायचा आहे का?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setDeleteId(null);
                }}
                disabled={isDeleting}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-charcoal rounded-xl text-xs font-bold transition-colors"
              >
                रद्द करा
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-gradient-to-r from-red-600 to-rose-700 hover:from-rose-700 hover:to-red-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
              >
                {isDeleting ? (
                  <span>हटवत आहे...</span>
                ) : (
                  <>
                    <Trash2 size={14} />
                    हटवा
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminInquiriesPage;
