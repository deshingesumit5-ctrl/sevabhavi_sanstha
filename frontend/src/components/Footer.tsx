import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const footerLinks = [
    { path: '/',                      label: 'होम' },
    { path: '/member-registration',   label: 'सदस्य नोंदणी' },
    { path: '/marriage-registration', label: 'विवाह नोंदणी' },
    { path: '/donation-registration', label: 'देणगी नोंदणी' },
    { path: '/gallery',               label: 'गॅलरी' },
    { path: '/contact',               label: 'संपर्क साधा' },
  ];

  const handleFooterNavigate = (path: string) => {
    if (path === '/donation-registration') {
      navigate(path, { state: { resetCategory: Date.now() } });
    } else {
      navigate(path);
    }
  };

  return (
    <footer className="w-full bg-[#FFF8F0] text-charcoal border-t-2 border-saffron/30 pt-10 pb-20 lg:pb-10 px-6 shadow-xs section-gap-top">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Column 1: Logo + About / Motto */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="दापोली मंडणगड सेवाभावी संस्था लोगो"
              className="w-14 h-14 rounded-full object-contain border border-saffron/30 bg-white p-1 shadow-xs shrink-0"
            />
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-saffron-dark leading-snug" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                दापोली मंडणगड सेवाभावी संस्था, पुणे
              </h3>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="h-[1px] w-4 bg-saffron"></span>
                <span className="text-xs font-semibold text-saffron tracking-widest uppercase">
                  जन सेवा हीच ईश्वर सेवा
                </span>
                <span className="h-[1px] w-4 bg-saffron"></span>
              </div>
            </div>
          </div>
          <p className="text-xs text-charcoal/70 leading-relaxed mt-1">
            कोकणातील बांधवांसाठी सामाजिक, शैक्षणिक, आरोग्य व वधू-वर सूचक उपक्रम राबविणारी अग्रगण्य सेवाभावी संस्था.
          </p>
        </div>

        {/* Column 2: Navigation Links */}
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-bold text-saffron-dark" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
            महत्वाच्या लिंक्स
          </h3>
          <div className="flex flex-wrap md:flex-col gap-3 text-sm font-semibold">
            {footerLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => handleFooterNavigate(link.path)}
                className="hover:text-saffron text-left text-charcoal/80 transition-colors duration-200 cursor-pointer"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>

        {/* Column 3: Contact info + Official Website */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold text-saffron-dark" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
            संपर्क तपशील
          </h3>
          <ul className="space-y-3.5 text-sm font-semibold text-charcoal/80">
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-saffron shrink-0" />
              <span>9970535876 / 7350293376 / 9226743239</span>
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-saffron shrink-0" />
              <span>dmsevabhavisanstha@gmail.com</span>
            </li>
            <li className="flex items-center gap-3">
              <Globe size={18} className="text-saffron shrink-0" />
              <a
                href="https://dmsevabhavi.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-saffron-dark hover:text-saffron underline underline-offset-2 transition-colors"
              >
                https://dmsevabhavi.com
              </a>
            </li>
          </ul>
        </div>

      </div>

      {/* Border Separator */}
      <div className="max-w-5xl mx-auto border-t border-charcoal/10 my-8"></div>

      {/* Copyright & Developer row */}
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between text-center gap-3 text-xs text-charcoal/70 font-body">
        <p>© २०२६ दापोली मंडणगड सेवाभावी संस्था, पुणे. सर्व हक्क सुरक्षित.</p>
        <p className="font-semibold text-charcoal/80">Developed By: SA Software Solution</p>
      </div>
    </footer>
  );
};

export default Footer;
