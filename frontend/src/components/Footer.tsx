import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  const navigate = useNavigate();
  const footerLinks = [
    { path: '/',                      label: 'होम' },
    { path: '/member-registration',   label: 'सदस्य नोंदणी' },
    { path: '/marriage-registration', label: 'विवाह नोंदणी' },
    { path: '/gallery',               label: 'गॅलरी' },
    { path: '/contact',               label: 'संपर्क साधा' },
  ];

  return (
    <footer className="w-full bg-maroon text-cream border-t-4 border-saffron pt-10 pb-20 lg:pb-10 px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Column 1: About / Motto */}
        <div className="flex flex-col gap-3">
          <h3 className="text-xl font-bold font-heading text-saffron">
            दापोली मंडणगड सेवाभावी संस्था
          </h3>
          {/* <p className="text-sm text-cream/80 leading-relaxed font-body">
            आमची संस्था सामाजिक, शैक्षणिक, आरोग्य, पर्यावरण आणि समाज हिताच्या विविध उपक्रमांसाठी कार्यरत आहे. "जन सेवा हीच ईश्वर सेवा" या ब्रीदवाक्याने प्रेरित होऊन आम्ही सेवाकार्य करत आहोत.
          </p> */}
        </div>

        {/* Column 2: Navigation Links */}
        <div className="flex flex-col gap-3">
          <h3 className="text-lg font-bold font-heading text-saffron">
            महत्वाच्या लिंक्स
          </h3>
          <div className="flex flex-wrap md:flex-col gap-3 text-sm font-semibold">
            {footerLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="hover:text-saffron text-left transition-colors duration-200"
              >
                {link.label}
              </button>
            ))}
          </div>
        </div>

        {/* Column 3: Contact info */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold font-heading text-saffron">
            संपर्क तपशील
          </h3>
          <ul className="space-y-3.5 text-sm font-body text-cream/90">
            {/* <li className="flex items-start gap-3">
              <MapPin size={18} className="text-saffron shrink-0 mt-0.5" />
              <span>दापोली मंडणगड सेवाभावी संस्था, पुणे कार्यालय, सदाशिव पेठ, पुणे - ४११०३०.</span>
            </li> */}
            <li className="flex items-center gap-3">
              <Phone size={18} className="text-saffron shrink-0" />
              {/* <a href="tel:+919876543210" className="hover:text-saffron transition-colors">
                +91 ९८७६५ ४३२१० / ९८२३४ ५६७८९
              </a> */}
            </li>
            <li className="flex items-center gap-3">
              <Mail size={18} className="text-saffron shrink-0" />
              {/* <a href="mailto:info@dapolimandangadngo.org" className="hover:text-saffron transition-colors">
                info@dapolimandangadngo.org
              </a> */}
            </li>
          </ul>
        </div>

      </div>

      {/* Border Separator */}
      <div className="max-w-6xl mx-auto border-t border-cream/10 my-8"></div>

      {/* Copyright row */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between text-center gap-4 text-xs text-cream/60 font-body">
        <p>© २०२६ दापोली मडणगड सेवाभावी संस्था, पुणे. सर्व हक्क सुरक्षित.</p>
      </div>
    </footer>
  );
};

export default Footer;
