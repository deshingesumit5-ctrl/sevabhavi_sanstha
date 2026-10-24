import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Lock, Phone, Eye, EyeOff, LogIn, AlertCircle, CheckCircle2, KeyRound } from 'lucide-react';
import { useMatrimonyAuth } from '../context/MatrimonyAuthContext';
import { api } from '../services/api';

interface MatrimonyLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const MatrimonyLoginModal: React.FC<MatrimonyLoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const navigate = useNavigate();
  const { login } = useMatrimonyAuth();

  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode('login');
      setIdentifier('');
      setPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setShowPassword(false);
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const err = await login(identifier, password);
      if (err) {
        setError(err);
      } else {
        setSuccessMsg('लॉगिन यशस्वी झाले!');
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 600);
      }
    } catch (e: any) {
      setError(e.message || 'लॉगिन अयशस्वी झाले.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!identifier.trim()) {
      setError('कृपया आपला नोंदणीकृत मोबाईल किंवा ईमेल भरा.');
      return;
    }
    if (newPassword.length < 6) {
      setError('नवीन पासवर्ड किमान ६ अक्षरांचा असावा.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setError('पासवर्ड जुळत नाहीत.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.matrimonyResetPassword(identifier.trim(), newPassword);
      setSuccessMsg(res.message || 'पासवर्ड यशस्वीरित्या बदलला आहे! आता लॉगिन करा.');
      setTimeout(() => {
        setMode('login');
        setPassword('');
        setSuccessMsg(null);
      }, 1500);
    } catch (e: any) {
      setError(e.message || 'पासवर्ड बदल अयशस्वी.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-saffron/20 overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-saffron to-[#C45D14] px-6 py-5 text-white flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold tracking-wide" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              {mode === 'login' ? 'विवाह नोंदणी लॉगिन' : 'पासवर्ड रीसेट करा'}
            </h3>
            <p className="text-xs text-white/90">
              {mode === 'login' ? 'आपल्या मॅट्रिमोनी खात्यात प्रवेश करा' : 'नोंदणीकृत तपशील प्रविष्ट करा'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLoginSubmit} autoComplete="off" className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal/80 mb-1">
                  मोबाईल नंबर किंवा ईमेल आयडी <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="matrimony-identifier"
                    autoComplete="off"
                    readOnly
                    onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Enter digits or email"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/10"
                  />
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-charcoal/80">
                    पासवर्ड <span className="text-red-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('forgot');
                      setError(null);
                      setSuccessMsg(null);
                    }}
                    className="text-[11px] font-semibold text-saffron hover:underline"
                  >
                    पासवर्ड विसरलात?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="matrimony-password"
                    autoComplete="new-password"
                    readOnly
                    onFocus={(e) => e.currentTarget.removeAttribute('readonly')}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="आपला पासवर्ड टाका"
                    className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/10"
                  />
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 bg-gradient-to-r from-saffron to-[#C45D14] hover:from-[#C45D14] hover:to-saffron text-white rounded-xl font-bold text-sm shadow-md shadow-saffron/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <LogIn size={16} />
                <span>{loading ? 'लॉगिन होत आहे...' : 'लॉगिन करा'}</span>
              </button>
            </form>
          ) : (
          <form onSubmit={handleForgotSubmit} autoComplete="off" className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal/80 mb-1">
                  नोंदणीकृत मोबाईल किंवा ईमेल <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="उदा. 9823456789"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal/80 mb-1">
                  नवीन पासवर्ड (किमान ६ अक्षरे) <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="नवीन पासवर्ड प्रविष्ट करा"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal/80 mb-1">
                  नवीन पासवर्ड पुष्टीकरण <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="पुन्हा प्रविष्ट करा"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/10"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                    setSuccessMsg(null);
                  }}
                  className="w-1/3 py-2.5 border border-charcoal/20 text-charcoal/80 hover:bg-cream rounded-xl font-bold text-xs transition-colors"
                >
                  रद्द करा
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 py-2.5 bg-saffron hover:bg-saffron-dark text-white rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <KeyRound size={15} />
                  <span>{loading ? 'बदलत आहे...' : 'पासवर्ड रीसेट करा'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Footer Note & Registration CTA */}
          <div className="mt-6 pt-4 border-t border-charcoal/10 text-center">
            <p className="text-xs text-charcoal/70">
              अद्याप विवाह नोंदणी केली नाही का?{' '}
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate('/marriage-registration?tab=register');
                }}
                className="text-saffron font-bold hover:underline ml-1 cursor-pointer"
              >
                येथे नोंदणी करा
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatrimonyLoginModal;
