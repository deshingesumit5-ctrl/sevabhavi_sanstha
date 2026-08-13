import React, { useState, useEffect } from 'react';
import { api, type MembershipPlan, type PaymentSettingResponse, type PaymentData } from '../../services/api';
import { imageUrl } from '../../services/galleryApi';
import ConfirmModal, { type ConfirmState } from '../../components/ConfirmModal';
import {
  CreditCard,
  QrCode,
  Users,
  CheckCircle2,
  XCircle,
  Pencil,
  Save,
  Upload,
  Search,
  Filter,
  Eye,
  Calendar,
  X,
  RefreshCw,
  Crown,
  AlertCircle,
  Loader2
} from 'lucide-react';

const convertDigitsToMarathi = (str: string | number): string => {
  const marathiDigits = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];
  return String(str).replace(/[0-9]/g, (w) => marathiDigits[parseInt(w, 10)]);
};

export const AdminPaymentsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'plans' | 'qr' | 'list'>('list');

  // Plans state
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [editingPlanCode, setEditingPlanCode] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState<string>('');
  const [loadingPlans, setLoadingPlans] = useState<boolean>(false);
  const [planSuccessMsg, setPlanSuccessMsg] = useState<string | null>(null);

  // QR & UPI Settings state
  const [qrSettings, setQrSettings] = useState<PaymentSettingResponse | null>(null);
  const [loadingQr, setLoadingQr] = useState<boolean>(false);
  const [newUpiId, setNewUpiId] = useState<string>('');

  const [newPayeeName, setNewPayeeName] = useState<string>('');
  const [newQrFile, setNewQrFile] = useState<File | null>(null);
  const [qrPreview, setQrPreview] = useState<string | null>(null);
  const [savingQr, setSavingQr] = useState<boolean>(false);
  const [qrSuccessMsg, setQrSuccessMsg] = useState<string | null>(null);

  // Payments Table state
  const [payments, setPayments] = useState<PaymentData[]>([]);
  const [loadingPayments, setLoadingPayments] = useState<boolean>(false);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('सर्व');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  // Modals state
  const [viewScreenshotUrl, setViewScreenshotUrl] = useState<string | null>(null);
  const [rejectModalPaymentId, setRejectModalPaymentId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const [confirmState, setConfirmState] = useState<ConfirmState>({ open: false, message: '', onConfirm: () => { } });
  const closeConfirm = () => setConfirmState(prev => ({ ...prev, open: false }));
  const askConfirm = (message: string, onConfirm: () => void) => setConfirmState({ open: true, message, onConfirm });

  // Load Data
  const loadPlans = async () => {
    setLoadingPlans(true);
    try {
      const data = await api.getMembershipPlans();
      setPlans(data);
    } catch (err: any) {
      console.error('Error loading plans:', err);
    } finally {
      setLoadingPlans(false);
    }
  };

  const loadQrSettings = async () => {
    setLoadingQr(true);
    try {
      const data = await api.getPaymentQrSettings();
      setQrSettings(data);
      setNewUpiId(data.upiId || '');
      setNewPayeeName(data.payeeName || '');
    } catch (err: any) {
      console.error('Error loading QR settings:', err);
    } finally {
      setLoadingQr(false);
    }
  };

  const loadPayments = async () => {
    setLoadingPayments(true);
    try {
      const data = await api.getAllPayments();
      setPayments(data);
    } catch (err: any) {
      console.error('Error loading payments:', err);
    } finally {
      setLoadingPayments(false);
    }
  };

  useEffect(() => {
    loadPlans();
    loadQrSettings();
    loadPayments();
  }, []);

  // Save Plan Amount
  const handleSavePlan = async (planCode: string) => {
    const val = parseFloat(editingAmount);
    if (isNaN(val) || val <= 0) {
      alert('कृपया धनात्मक (Positive) रक्कम प्रविष्ट करा.');
      return;
    }

    try {
      await api.updateMembershipPlan(planCode, val);
      setEditingPlanCode(null);
      setPlanSuccessMsg('दर यशस्वीरित्या जतन केला!');
      setTimeout(() => setPlanSuccessMsg(null), 3000);
      loadPlans();
    } catch (err: any) {
      alert('दर जतन करताना त्रुटी आली: ' + (err.message || err));
    }
  };

  // Save QR Code & UPI Settings
  const handleSaveQrSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpiId.trim()) {
      alert('UPI आयडी आवश्यक आहे.');
      return;
    }

    setSavingQr(true);
    try {
      const fd = new FormData();
      fd.append('upiId', newUpiId.trim());
      fd.append('payeeName', newPayeeName.trim());
      if (newQrFile) {
        fd.append('file', newQrFile);
      }

      const updated = await api.updatePaymentQrSettings(fd);
      setQrSettings(updated);
      setNewQrFile(null);

      setQrPreview(null);
      setQrSuccessMsg('QR कोड आणि UPI तपशील जतन केले!');
      setTimeout(() => setQrSuccessMsg(null), 3000);
    } catch (err: any) {
      alert('QR माहिती जतन करताना त्रुटी आली: ' + (err.message || err));
    } finally {
      setSavingQr(false);
    }
  };

  // Verify Payment Action
  const handleVerifyPayment = (id: number) => {
    askConfirm('सदर पेमेंट पडताळलेले म्हणून चिन्हांकित करायचे का?', async () => {
      setActionLoadingId(id);
      try {
        await api.updatePaymentStatus(id, 'पडताळलेले');
        loadPayments();
      } catch (err: any) {
        alert('त्रुटी आली: ' + (err.message || err));
      } finally {
        setActionLoadingId(null);
      }
    });
  };

  // Reject Payment Action
  const handleConfirmReject = async () => {
    if (!rejectModalPaymentId) return;
    setActionLoadingId(rejectModalPaymentId);
    try {
      await api.updatePaymentStatus(rejectModalPaymentId, 'नाकारलेले', rejectionReason.trim());
      setRejectModalPaymentId(null);
      setRejectionReason('');
      loadPayments();
    } catch (err: any) {
      alert('त्रुटी आली: ' + (err.message || err));
    } finally {
      setActionLoadingId(null);
    }
  };

  // Filter Payments
  const filteredPayments = payments.filter((p) => {
    // Status Filter
    if (statusFilter !== 'सर्व' && p.status !== statusFilter) {
      return false;
    }
    // Search Query (Name or Txn ID)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = p.memberName ? p.memberName.toLowerCase().includes(q) : false;
      const txnMatch = p.upiTxnId ? p.upiTxnId.toLowerCase().includes(q) : false;
      if (!nameMatch && !txnMatch) return false;
    }
    // Date Range Filter
    if (fromDate) {
      const pDate = new Date(p.paymentDate).getTime();
      const fDate = new Date(fromDate).getTime();
      if (pDate < fDate) return false;
    }
    if (toDate) {
      const pDate = new Date(p.paymentDate).getTime();
      const tDate = new Date(toDate).getTime() + 86400000; // end of day
      if (pDate > tDate) return false;
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'पडताळलेले':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 whitespace-nowrap inline-block">पडताळलेले</span>;
      case 'नाकारलेले':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 whitespace-nowrap inline-block">नाकारले</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 whitespace-nowrap inline-block">सादर केले</span>;
    }
  };

  const getMembershipTypeBadge = (type: string) => (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${type === 'lifetime' ? 'bg-amber-100 text-amber-900 border border-amber-300/40' : 'bg-saffron/10 text-saffron-dark'}`}>
      {type === 'lifetime' ? 'आजीवन' : 'वार्षिक'}
    </span>
  );

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('mr-IN');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col w-full space-y-6">

      {/* Module Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-card border border-amber-200/60 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-saffron/10 border border-saffron/20 flex items-center justify-center text-saffron shrink-0">
            <CreditCard size={22} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-saffron-dark" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              पेमेंट व्यवस्थापन
            </h2>
            <p className="text-xs text-charcoal/60 font-semibold">
              दर पत्रक बदला, QR कोड अद्ययावत करा आणि प्राप्त झालेली पेमेंट्स पडताळून पहा.
            </p>
          </div>
        </div>

        {/* Sub-tab Switcher Buttons & Right Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center bg-cream/40 p-1 rounded-xl border border-amber-200/60 self-start sm:self-auto">
            <button
              onClick={() => setActiveTab('list')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'list'
                ? 'bg-saffron text-white shadow-xs'
                : 'text-charcoal/70 hover:text-saffron'
                }`}
            >
              <Users size={15} />
              <span>पेमेंट यादी ({payments.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'plans'
                ? 'bg-saffron text-white shadow-xs'
                : 'text-charcoal/70 hover:text-saffron'
                }`}
            >
              <CreditCard size={15} />
              <span>दर पत्रक</span>
            </button>
            <button
              onClick={() => setActiveTab('qr')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'qr'
                ? 'bg-saffron text-white shadow-xs'
                : 'text-charcoal/70 hover:text-saffron'
                }`}
            >
              <QrCode size={15} />
              <span>QR / UPI कोड</span>
            </button>
          </div>

          {activeTab === 'list' && (
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
          )}
        </div>
      </div>

      {/* SECTION A: Membership Plans Pricing Manager */}
      {activeTab === 'plans' && (
        <div className="bg-white rounded-card border border-amber-200/60 shadow-soft p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-4">
            <div>
              <h3 className="text-sm font-extrabold text-saffron-dark flex items-center gap-2" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                <Crown size={18} className="text-saffron" />
                सदस्यत्व दर पत्रक
              </h3>
              <p className="text-xs text-charcoal/60">
                येथे बदललेला दर सदस्य नोंदणी फॉर्मवर त्वरित दिसेल.
              </p>
            </div>
            {planSuccessMsg && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full animate-fade-in">
                ✓ {planSuccessMsg}
              </span>
            )}
          </div>

          {loadingPlans ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 text-saffron animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="border-2 border-amber-200/60 hover:border-saffron/40 rounded-card-lg p-5 bg-gradient-to-b from-amber-50/20 to-white transition-all space-y-4 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white ${plan.planCode === 'lifetime' ? 'bg-amber-600' : 'bg-saffron'
                        }`}>
                        {plan.planCode === 'lifetime' ? <Crown size={20} /> : <RefreshCw size={20} />}
                      </div>
                      <div>
                        <h4 className="text-base font-extrabold text-saffron-dark" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                          {plan.planNameMr}
                        </h4>
                        <span className="text-[11px] font-semibold text-charcoal/50 uppercase">
                          कोड: {plan.planCode}
                        </span>
                      </div>
                    </div>

                    {editingPlanCode !== plan.planCode && (
                      <button
                        onClick={() => {
                          setEditingPlanCode(plan.planCode);
                          setEditingAmount(plan.amount.toString());
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-saffron/10 hover:bg-saffron text-saffron hover:text-white rounded-full text-xs font-bold transition-all border border-saffron/20"
                      >
                        <Pencil size={14} />
                        <span>बदला</span>
                      </button>
                    )}
                  </div>

                  {/* Amount Display or Edit Form */}
                  {editingPlanCode === plan.planCode ? (
                    <div className="space-y-3 bg-white p-3.5 rounded-card border border-saffron/30">
                      <label className="block text-xs font-bold text-charcoal/70">
                        नवीन रक्कम प्रविष्ट करा (₹):
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={editingAmount}
                          onChange={(e) => setEditingAmount(e.target.value)}
                          className="w-full px-3 py-2 rounded-card border border-amber-200 focus:border-saffron outline-none text-base font-bold font-mono"
                          placeholder="रक्कम टाका"
                        />
                        <button
                          onClick={() => handleSavePlan(plan.planCode)}
                          className="flex items-center gap-1 px-4 py-2 bg-saffron hover:bg-saffron-dark text-white rounded-card font-bold text-xs shadow-sm shrink-0"
                        >
                          <Save size={15} />
                          <span>जतन करा</span>
                        </button>
                        <button
                          onClick={() => setEditingPlanCode(null)}
                          className="px-3 py-2 bg-cream text-charcoal/60 rounded-card font-bold text-xs hover:bg-cream-dark"
                        >
                          रद्द
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-amber-50/30 rounded-card border border-amber-200/40 flex items-center justify-between">
                      <span className="text-xs font-bold text-charcoal/60">वर्तमान रक्कम:</span>
                      <span className="text-2xl font-extrabold text-saffron-dark font-mono">
                        ₹{plan.amount}
                      </span>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="pt-2 border-t border-charcoal/5 flex items-center justify-between text-[11px] text-charcoal/50 font-semibold">
                    <span>शेवटचा बदल: {plan.updatedBy || 'admin'}</span>
                    <span>
                      दिनांक: {formatDate(plan.updatedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SECTION B: QR Code & UPI Details Settings */}
      {activeTab === 'qr' && (
        <div className="bg-white rounded-card border border-amber-200/60 shadow-soft p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-amber-200/60 pb-4">
            <div>
              <h3 className="text-sm font-extrabold text-saffron-dark flex items-center gap-2" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                <QrCode size={18} className="text-saffron" />
                QR कोड आणि UPI व्यवस्थापन
              </h3>
              <p className="text-xs text-charcoal/60">
                नवीन QR फोटो अपलोड केल्यास जुना QR निष्क्रिय होऊन नवीन QR लगेच सक्रिय होईल (कमाल १ QR सक्रिय राहतो).
              </p>
            </div>
            {qrSuccessMsg && (
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full animate-fade-in">
                ✓ {qrSuccessMsg}
              </span>
            )}
          </div>

          {loadingQr ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="w-6 h-6 text-saffron animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

              {/* Active QR Preview */}
              <div className="bg-amber-50/30 border-2 border-amber-200/60 rounded-card-lg p-6 flex flex-col items-center text-center space-y-4">
                <h4 className="text-xs font-extrabold text-saffron-dark uppercase tracking-wider" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                  सध्या सक्रिय QR कोड
                </h4>

                {qrSettings?.qrImageUrl ? (
                  <div className="p-3 bg-white rounded-2xl border-2 border-saffron/20 shadow-md">
                    <img
                      src={imageUrl(qrSettings.qrImageUrl)}
                      alt="Active Payment QR"
                      className="w-56 h-56 object-contain rounded-xl"
                    />
                  </div>
                ) : (
                  <div className="w-56 h-56 bg-rose-50 border-2 border-dashed border-rose-200 rounded-2xl flex flex-col items-center justify-center p-4 text-rose-700 space-y-2">
                    <AlertCircle size={32} />
                    <p className="text-xs font-bold text-center">सध्या कोणताही QR कोड जोडलेला नाही.</p>
                  </div>
                )}

                <div className="w-full text-left bg-white p-3.5 rounded-card border border-amber-200/60 space-y-1">
                  <p className="text-xs font-bold text-charcoal/80">
                    पेई नाव: <span className="text-saffron-dark" style={{ fontFamily: "'Baloo 2', sans-serif" }}>{qrSettings?.payeeName || '-'}</span>
                  </p>
                  <p className="text-xs font-bold text-charcoal/80">
                    UPI आयडी: <code className="text-saffron font-mono text-xs">{qrSettings?.upiId || '-'}</code>
                  </p>
                </div>
              </div>

              {/* Edit QR Form */}
              <form onSubmit={handleSaveQrSettings} className="space-y-4 bg-white p-5 rounded-card-lg border border-amber-200/60 shadow-xs">
                <h4 className="text-xs font-extrabold text-saffron-dark border-b border-amber-200/60 pb-2" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                  QR कोड व UPI तपशील अद्ययावत करा
                </h4>

                <div>
                  <label className="block text-xs font-bold text-charcoal/75 mb-1">
                    UPI आयडी <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={newUpiId}
                    onChange={(e) => setNewUpiId(e.target.value)}
                    required
                    placeholder="उदा. 9823456789@upi"
                    className="w-full px-3.5 py-2 rounded-card border border-charcoal/20 focus:border-saffron text-sm outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal/75 mb-1">
                    पेई नाव
                  </label>
                  <input
                    type="text"
                    value={newPayeeName}
                    onChange={(e) => setNewPayeeName(e.target.value)}
                    placeholder="उदा. दापोली मडणगड सेवाभावी संस्था"
                    className="w-full px-3.5 py-2 rounded-card border border-charcoal/20 focus:border-saffron text-sm outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-charcoal/75 mb-1">
                    नवीन QR कोड फोटो निवडा
                  </label>
                  <input
                    type="file"
                    id="new-qr-file-input"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setNewQrFile(file);
                        const reader = new FileReader();
                        reader.onloadend = () => setQrPreview(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('new-qr-file-input')?.click()}
                    className="flex items-center gap-2 px-4 py-2.5 bg-cream hover:bg-cream-dark border border-amber-200/80 text-saffron-dark font-bold text-xs rounded-card shadow-xs transition-colors"
                  >
                    <Upload size={16} />
                    <span>{newQrFile ? 'फोटो निवडला आहे (बदला)' : 'QR फोटो निवडा (+)'}</span>
                  </button>

                  {qrPreview && (
                    <div className="mt-3 relative w-32 h-32 rounded-card overflow-hidden border-2 border-saffron">
                      <img src={qrPreview} alt="New QR Preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={savingQr}
                    className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-saffron hover:bg-saffron-dark text-white rounded-full font-bold text-xs shadow-md transition-all"
                  >
                    {savingQr ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    <span>{savingQr ? 'जतन होत आहे...' : 'QR कोड बदला & जतन करा'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      )}

      {/* SECTION C: Payments List & Verification Table */}
      {activeTab === 'list' && (
        <div className="bg-white rounded-card border border-amber-200/60 shadow-soft p-6 space-y-5">

          {/* Search and Filters Bar */}
          {showFilters && (
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-amber-50/20 p-4 rounded-card border border-amber-200/60">

              {/* Search Input */}
              <div className="relative flex-1 min-w-[220px]">
                <Search size={16} className="absolute left-3.5 top-3 text-charcoal/40" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="नावानुसार किंवा ट्रान्झॅक्शन आयडीने शोधा..."
                  className="w-full pl-9 pr-3.5 py-2 bg-white rounded-card border border-charcoal/20 focus:border-saffron text-xs outline-none font-semibold"
                />
              </div>

              {/* Filters Group */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Status Filter */}
                <div className="flex items-center gap-1.5">
                  <Filter size={14} className="text-charcoal/50" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 bg-white rounded-card border border-charcoal/20 text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value="सर्व">सर्व स्थिती</option>
                    <option value="सादर केले">सादर केले</option>
                    <option value="पडताळलेले">पडताळलेले</option>
                    <option value="नाकारलेले">नाकारलेले</option>
                  </select>
                </div>

                {/* Date Filters */}
                <div className="flex items-center gap-1 text-xs">
                  <Calendar size={14} className="text-charcoal/50" />
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="px-2 py-1.5 bg-white border border-charcoal/20 rounded-card text-xs outline-none font-semibold"
                  />
                  <span>ते</span>
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="px-2 py-1.5 bg-white border border-charcoal/20 rounded-card text-xs outline-none font-semibold"
                  />
                </div>

                {(searchQuery || statusFilter !== 'सर्व' || fromDate || toDate) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setStatusFilter('सर्व');
                      setFromDate('');
                      setToDate('');
                    }}
                    className="text-[11px] font-bold text-red-600 hover:underline px-2"
                  >
                    फिल्टर हटवा
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Table View */}
          {loadingPayments ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-saffron animate-spin" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-12 bg-cream/10 rounded-card border border-dashed border-amber-200/60">
              <CreditCard className="mx-auto w-12 h-12 text-charcoal/30 mb-2" />
              <p className="text-sm font-bold text-saffron-dark">कोणतेही पेमेंट सापडले नाही.</p>
            </div>
          ) : (
            <div className="bg-white rounded-card border border-amber-200/60 shadow-soft overflow-hidden">
              {/* MOBILE: stacked cards */}
              <div className="md:hidden divide-y divide-amber-100/80">
                {filteredPayments.map((p, index) => (
                  <div key={p.id} className="p-4 space-y-2.5 hover:bg-amber-50/20 transition-colors">
                    <div className="flex items-center justify-between gap-2">
                      <div className="min-w-0 flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-amber-100/80 text-amber-900 text-[11px] font-bold rounded-lg shrink-0">
                          #{convertDigitsToMarathi(index + 1)}
                        </span>
                        <p className="text-base font-extrabold text-[#701e2b] truncate" style={{ fontFamily: "'Baloo 2', sans-serif" }}>{p.memberName || 'सदस्य #' + p.memberId}</p>
                      </div>
                      {getStatusBadge(p.status)}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      {getMembershipTypeBadge(p.membershipType)}
                      <span className="font-extrabold text-saffron-dark font-mono">₹{p.amount}</span>
                      <span className="text-charcoal/50">· {formatDate(p.paymentDate)}</span>
                      {p.paymentMode && <span className="text-charcoal/60 font-semibold">· {p.paymentMode}</span>}
                    </div>

                    {p.upiTxnId && (
                      <div className="text-xs font-mono bg-amber-50/50 p-2 rounded-xl border border-amber-200/50 text-charcoal select-all">
                        <span className="text-[10px] text-charcoal/50 block font-sans">ट्रान्झॅक्शन आयडी:</span>
                        {p.upiTxnId}
                      </div>
                    )}

                    <div className="flex items-center gap-2 pt-1">
                      {p.screenshotUrl ? (
                        <button
                          onClick={() => setViewScreenshotUrl(imageUrl(p.screenshotUrl))}
                          className="flex-1 justify-center px-3 py-2 bg-blue-50 active:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Eye size={15} />
                          स्क्रीनशॉट बघा
                        </button>
                      ) : (
                        <div className="flex-1 text-center py-1.5 text-xs text-charcoal/40 font-medium bg-amber-50/30 rounded-xl">
                          स्क्रीनशॉट उपलब्ध नाही
                        </div>
                      )}
                      {p.status !== 'पडताळलेले' && (
                        <button
                          onClick={() => handleVerifyPayment(p.id)}
                          disabled={actionLoadingId === p.id}
                          className="px-3.5 py-2 bg-emerald-600 active:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1 shrink-0"
                        >
                          {actionLoadingId === p.id ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={16} />}
                          पडताळणी करा
                        </button>
                      )}
                      {p.status !== 'नाकारलेले' && (
                        <button
                          onClick={() => {
                            setRejectModalPaymentId(p.id);
                            setRejectionReason('');
                          }}
                          disabled={actionLoadingId === p.id}
                          className="px-3.5 py-2 bg-rose-500 active:bg-rose-600 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1 shrink-0"
                        >
                          <XCircle size={16} />
                          नाकारा
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* DESKTOP: member module theme table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-gradient-to-r from-amber-100 via-amber-50 to-orange-100/80 border-b-2 border-saffron/30">
                      <th className="p-3.5 text-amber-950 font-bold text-center w-14" style={{ fontFamily: "'Baloo 2', sans-serif" }}>अ. क्र.</th>
                      <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>नाव</th>
                      <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>मोबाईल</th>
                      <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>प्रकार</th>
                      <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>रक्कम</th>
                      <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>तारीख</th>
                      <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>माध्यम</th>
                      <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>ट्रान्झॅक्शन आयडी</th>
                      <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>स्थिती</th>
                      <th className="p-3.5 text-amber-950 font-bold text-center" style={{ fontFamily: "'Baloo 2', sans-serif" }}>स्क्रीनशॉट</th>
                      <th className="p-3.5 text-amber-950 font-bold" style={{ fontFamily: "'Baloo 2', sans-serif" }}>कृती</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100/80">
                    {filteredPayments.map((p, index) => (
                      <tr key={p.id} className="hover:bg-cream/30 transition-colors font-medium text-charcoal">

                        {/* Marathi S.No */}
                        <td className="p-3.5 font-bold text-center text-charcoal/70">{convertDigitsToMarathi(index + 1)}</td>

                        {/* Name */}
                        <td className="p-3.5 font-bold">{p.memberName || 'सदस्य #' + p.memberId}</td>

                        {/* Mobile */}
                        <td className="p-3.5">{p.memberMobile || '-'}</td>

                        {/* Type Badge */}
                        <td className="p-3.5">{getMembershipTypeBadge(p.membershipType)}</td>

                        {/* Amount */}
                        <td className="p-3.5 font-bold font-mono text-saffron-dark">₹{p.amount}</td>

                        {/* Date */}
                        <td className="p-3.5">{formatDate(p.paymentDate)}</td>

                        {/* Mode */}
                        <td className="p-3.5 font-bold text-charcoal/80">{p.paymentMode || '-'}</td>

                        {/* Txn ID */}
                        <td className="p-3.5 font-mono select-all">{p.upiTxnId || '-'}</td>

                        {/* Status Badge */}
                        <td className="p-3.5 whitespace-nowrap">{getStatusBadge(p.status)}</td>

                        {/* Screenshot */}
                        <td className="p-3.5 text-center">
                          {p.screenshotUrl ? (
                            <button
                              onClick={() => setViewScreenshotUrl(imageUrl(p.screenshotUrl))}
                              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold inline-flex items-center gap-1 transition-colors"
                              title="स्क्रीनशॉट बघा"
                            >
                              <Eye size={12} />
                              बघा
                            </button>
                          ) : (
                            <span className="text-[10px] text-charcoal/40 font-semibold">-</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-3.5">
                          <div className="flex items-center gap-1.5">
                            {p.status !== 'पडताळलेले' && (
                              <button
                                onClick={() => handleVerifyPayment(p.id)}
                                disabled={actionLoadingId === p.id}
                                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors shadow-sm whitespace-nowrap"
                                title="पडताळणी करा"
                              >
                                {actionLoadingId === p.id ? <Loader2 size={12} className="animate-spin" /> : <CheckCircle2 size={12} />}
                                पडताळणी करा
                              </button>
                            )}
                            {p.status !== 'नाकारलेले' && (
                              <button
                                onClick={() => {
                                  setRejectModalPaymentId(p.id);
                                  setRejectionReason('');
                                }}
                                disabled={actionLoadingId === p.id}
                                className="px-2.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors shadow-sm whitespace-nowrap"
                                title="नाकारा"
                              >
                                <XCircle size={12} />
                                नाकारा
                              </button>
                            )}
                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Full-size Screenshot Viewer Modal */}
      {viewScreenshotUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="relative bg-white rounded-card-lg shadow-2xl max-w-2xl w-full p-4 overflow-hidden space-y-3">
            <div className="flex items-center justify-between border-b border-charcoal/10 pb-2">
              <h4 className="text-xs font-bold text-saffron-dark" style={{ fontFamily: "'Baloo 2', sans-serif" }}>पेमेंट स्क्रीनशॉट</h4>
              <button
                onClick={() => setViewScreenshotUrl(null)}
                className="p-1 rounded-full hover:bg-cream text-charcoal/60"
              >
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-auto flex items-center justify-center">
              <img src={viewScreenshotUrl} alt="Full Screenshot" className="max-w-full max-h-full rounded-card object-contain" />
            </div>
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectModalPaymentId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-card-lg shadow-2xl max-w-md w-full p-6 space-y-4 border border-rose-200">
            <h4 className="text-sm font-extrabold text-rose-700 border-b border-rose-100 pb-2 flex items-center gap-2" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              <XCircle size={18} />
              पेमेंट नाकारण्याचे कारण
            </h4>

            <div>
              <label className="block text-xs font-bold text-charcoal/70 mb-1">
                कारण प्रविष्ट करा (पर्यायी):
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={3}
                placeholder="उदा. चुकीचा ट्रान्झॅक्शन आयडी किंवा अपूर्ण स्क्रीनशॉट..."
                className="w-full p-3 rounded-card border border-charcoal/20 focus:border-rose-500 text-xs outline-none resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 border-t border-charcoal/10 pt-3">
              <button
                onClick={() => setRejectModalPaymentId(null)}
                className="px-4 py-1.5 bg-cream text-charcoal/70 rounded-full font-bold text-xs hover:bg-cream-dark"
              >
                रद्द करा
              </button>
              <button
                onClick={handleConfirmReject}
                className="px-5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-bold text-xs shadow-sm"
              >
                नाकारा (Confirm Reject)
              </button>
            </div>
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

export default AdminPaymentsPage;
