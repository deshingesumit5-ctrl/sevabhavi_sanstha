import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, FileText, Heart, LogOut, User } from 'lucide-react';
import MatrimonyDirectory from './MatrimonyDirectory';
import MarriageRegistrationPage from './marriage_registration';
import { useMatrimonyAuth } from '../../context/MatrimonyAuthContext';

export const MatrimonyLanding: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'register' ? 'register' : 'directory';
  const [activeTab, setActiveTab] = useState<'directory' | 'register'>(initialTab);
  const { matrimonyUser, logout: matrimonyLogout } = useMatrimonyAuth();

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'register') {
      setActiveTab('register');
    } else if (tabParam === 'directory') {
      setActiveTab('directory');
    }
  }, [searchParams]);

  const handleTabSwitch = (tab: 'directory' | 'register') => {
    setActiveTab(tab);
    setSearchParams(tab === 'register' ? { tab: 'register' } : {});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full flex flex-col min-h-screen">
      {/* Top Module Subheader / Tab Switcher Bar */}
      <div className="bg-white border-b border-saffron/20 sticky top-[57px] z-30 shadow-xs px-4 py-2.5">
        <div className="	max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-saffron/10 text-saffron rounded-lg">
              <Heart size={16} className="fill-saffron" />
            </div>
            <h2 className="text-sm sm:text-base font-bold text-saffron-dark" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              वधू-वर सूचक केंद्र (विवाह विभाग)
            </h2>
          </div>

          {/* Tab Buttons & Login in Sub-header */}
          <div className="flex items-center gap-2 flex-wrap justify-center">
            <div className="flex items-center gap-1.5 p-1 bg-cream rounded-full border border-saffron/20 shadow-inner">
              <button
                onClick={() => handleTabSwitch('directory')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold transition-all duration-300 cursor-pointer ${
                  activeTab === 'directory'
                    ? 'bg-gradient-to-r from-saffron to-[#C45D14] text-white shadow-xs'
                    : 'text-charcoal/70 hover:text-saffron'
                }`}
              >
                <Users size={14} />
                <span>सर्व प्रोफाइल्स (वधू-वर सूची)</span>
              </button>

              <button
                onClick={() => handleTabSwitch('register')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-extrabold transition-all duration-300 cursor-pointer ${
                  activeTab === 'register'
                    ? 'bg-gradient-to-r from-saffron to-[#C45D14] text-white shadow-xs'
                    : 'text-charcoal/70 hover:text-saffron'
                }`}
              >
                <FileText size={14} />
                <span>नवीन विवाह नोंदणी अर्ज</span>
              </button>
            </div>

            {matrimonyUser && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-saffron/10 border border-saffron/20 text-xs font-bold text-saffron-dark">
                <User size={13} className="text-saffron" />
                <span className="truncate max-w-[100px]">{matrimonyUser.fullName.split(' ')[0]}</span>
                <button
                  onClick={() => matrimonyLogout()}
                  title="लॉगआउट"
                  className="p-0.5 text-charcoal/60 hover:text-red-600 rounded-full hover:bg-white transition-colors"
                >
                  <LogOut size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Tab View */}
      <div className="flex-1 w-full">
        {activeTab === 'directory' ? (
          <MatrimonyDirectory onGoToRegister={() => handleTabSwitch('register')} />
        ) : (
          <MarriageRegistrationPage />
        )}
      </div>

  
    </div>
  );
};

export default MatrimonyLanding;
