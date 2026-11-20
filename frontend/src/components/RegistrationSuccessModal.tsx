import React from 'react';
import { CheckCircle2, Phone, Mail, X } from 'lucide-react';

interface RegistrationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrationNumber?: string;
  title?: string;
}

export const RegistrationSuccessModal: React.FC<RegistrationSuccessModalProps> = ({
  isOpen,
  onClose,
  registrationNumber,
  title = 'नोंदणी यशस्वीरित्या सादर झाली!',
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn print:hidden"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-saffron/30 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Accent Strip */}
        <div className="h-2 w-full bg-gradient-to-r from-maroon via-saffron to-maroon" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-charcoal/50 hover:text-charcoal hover:bg-cream transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="p-6 sm:p-8 flex flex-col items-center text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-200 flex items-center justify-center text-emerald-600 shadow-sm">
            <CheckCircle2 size={36} />
          </div>

          <div className="space-y-1.5">
            <h3
              className="text-xl font-extrabold text-maroon"
              style={{ fontFamily: "'Baloo 2', sans-serif" }}
            >
              {title}
            </h3>
            {registrationNumber && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-saffron/30 text-xs font-bold text-saffron-dark">
                <span>नोंदणी क्रमांक:</span>
                <span className="font-mono">{registrationNumber}</span>
              </div>
            )}
          </div>

          <p className="text-sm text-charcoal/85 leading-relaxed font-medium bg-cream/60 border border-saffron/20 rounded-2xl p-4">
            Your registration has been submitted successfully. Your application will be reviewed and approved within 48 hours. For any further information or assistance, please contact us on the provided contact number.
          </p>

          {/* Organization Contact Numbers */}
          <div className="w-full bg-amber-50/70 border border-saffron/20 rounded-2xl p-3.5 space-y-2 text-xs text-charcoal/80">
            <div className="flex items-center justify-center gap-2 font-bold text-saffron-dark">
              <Phone size={15} className="text-saffron shrink-0" />
              <span>संपर्क क्रमांक: 9970535876 / 7350293376 / 9226743239</span>
            </div>
            <div className="flex items-center justify-center gap-2 font-semibold text-charcoal/70">
              <Mail size={14} className="text-saffron shrink-0" />
              <span>dmsevabhavisanstha@gmail.com</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-saffron hover:bg-saffron-dark text-white font-bold text-sm shadow-md shadow-saffron/20 transition-all active:scale-[0.98] cursor-pointer"
          >
            ठीक आहे / अर्ज व पावती पहा (OK)
          </button>
        </div>
      </div>
    </div>
  );
};

export default RegistrationSuccessModal;
