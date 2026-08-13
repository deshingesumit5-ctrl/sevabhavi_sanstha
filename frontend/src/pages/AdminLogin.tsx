import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, KeyRound, User, ShieldCheck, AlertCircle } from 'lucide-react';

const AdminLogin: React.FC = () => {
  const { isAdmin, login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Already logged in → straight to dashboard
  if (isAdmin) return <Navigate to="/admin/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('कृपया युझरनेम आणि पासवर्ड भरा.');
      return;
    }

    setIsLoading(true);
    const ok = await login(username.trim(), password.trim());
    setIsLoading(false);

    if (ok) {
      navigate('/admin/dashboard', { replace: true });
    } else {
      setError('युझरनेम किंवा पासवर्ड चुकीचा आहे. पुन्हा प्रयत्न करा.');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF8F0] flex flex-col items-center justify-center px-4 py-8 sm:py-12">

      {/* ── Unified Single Login Section ───────────────────────────── */}
      <div className="w-full max-w-md bg-white rounded-2xl border border-maroon/8 shadow-xl shadow-maroon/8 px-6 sm:px-8 py-8">

        {/* Logo */}
        <div className="flex justify-center mb-3">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center p-1">
            <img
              src="/logo.png"
              alt="दापोली मंडणगड सेवाभावी संस्था, पुणे"
              className="w-full h-full object-contain"
            />
          </div>
        </div>

        {/* NGO Name + Tagline */}
        <div className="flex flex-col items-center text-center mb-4">
          <h1 className="text-lg sm:text-xl font-extrabold text-maroon leading-tight" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
            दापोली मंडणगड सेवाभावी संस्था, पुणे
          </h1>

          {/* Tagline */}
          <div className="flex items-center gap-2 mt-1.5">
            <span className="h-px w-5 bg-saffron" />
            <span className="text-[10px] sm:text-xs font-bold text-saffron tracking-widest uppercase">
              जन सेवा हीच ईश्वर सेवा
            </span>
            <span className="h-px w-5 bg-saffron" />
          </div>
        </div>

        {/* Admin Panel Badge */}
        <div className="flex justify-center mb-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cream border border-saffron/30 text-[11px] font-bold text-maroon shadow-sm">
            <ShieldCheck size={13} className="text-saffron" />
            एडमिन पॅनेल
          </span>
        </div>

        {/* Titles */}
        <h2 className="text-xl sm:text-2xl font-extrabold text-charcoal text-center mb-1" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
          प्रशासक लॉगिन
        </h2>
        <p className="text-[11px] text-charcoal/50 font-semibold text-center mb-6">
          युझरनेम आणि पासवर्ड टाकून लॉगिन करा
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Username field */}
          <div>
            <label htmlFor="admin-username" className="block text-xs font-bold text-charcoal/70 mb-1.5">
              युझरनेम / ईमेल आयडी
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40">
                <User size={16} />
              </span>
              <input
                id="admin-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                autoComplete="username"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-charcoal/15 bg-cream/30 focus:border-saffron focus:ring-2 focus:ring-saffron/20 text-sm outline-none transition-all placeholder:text-charcoal/30"
              />
            </div>
          </div>

          {/* Password field */}
          <div>
            <label htmlFor="admin-password" className="block text-xs font-bold text-charcoal/70 mb-1.5">
              पासवर्ड
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40">
                <KeyRound size={16} />
              </span>
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-charcoal/15 bg-cream/30 focus:border-saffron focus:ring-2 focus:ring-saffron/20 text-sm outline-none transition-all placeholder:text-charcoal/30"
              />
              <button
                type="button"
                tabIndex={-1}
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-saffron transition-colors"
                aria-label={showPassword ? 'पासवर्ड लपवा' : 'पासवर्ड दाखवा'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Remember me + Forgot */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-charcoal/20 text-saffron focus:ring-saffron cursor-pointer"
              />
              <span className="text-[11px] font-semibold text-charcoal/60">मला लक्षात ठेवा</span>
            </label>
            <button
              type="button"
              onClick={() => alert('पासवर्ड रिसेट लिंक पाठवण्यात येईल.')}
              className="text-[11px] font-bold text-saffron hover:text-maroon transition-colors"
            >
              पासवर्ड विसरलात?
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
              <AlertCircle size={14} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-[11px] font-semibold text-red-600 leading-snug">{error}</p>
            </div>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-saffron to-[#D4631A] hover:from-[#D4631A] hover:to-saffron text-white font-extrabold text-sm shadow-lg shadow-saffron/30 hover:shadow-xl hover:shadow-saffron/40 transition-all duration-300 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span>लॉगिन होत आहे...</span>
              </>
            ) : (
              <span>लॉगिन करा →</span>
            )}
          </button>
        </form>
      </div>

      {/* Back to home */}
      <button
        onClick={() => navigate('/')}
        className="mt-5 text-xs font-bold text-maroon/60 hover:text-saffron transition-colors underline underline-offset-2"
      >
        ← मुख्य वेबसाइटवर परत जा
      </button>
    </div>
  );
};

export default AdminLogin;
