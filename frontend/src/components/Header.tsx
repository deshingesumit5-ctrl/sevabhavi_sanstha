import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Bell, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  onToggleSidebar: () => void;
  notificationCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  notificationCount = 3,
}) => {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/', { replace: true });
    setTimeout(() => {
      logout();
    }, 200);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-maroon/10 shadow-sm px-4 py-2.5 flex items-center justify-between">
      {/* Left: Hamburger menu */}
      <button
        onClick={onToggleSidebar}
        className="p-2 hover:bg-cream-dark/50 text-maroon hover:text-saffron rounded-full transition-colors focus:outline-none"
        aria-label="Menu"
      >
        <Menu size={24} className="stroke-[2.5]" />
      </button>

      {/* Center: NGO Name & Tagline */}
      <div className="flex flex-col items-center text-center px-2 flex-1">
        <h1 className="text-[17px] sm:text-xl md:text-2xl font-bold text-maroon leading-tight m-0 tracking-wide" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
          दापोली मंडणगड सेवाभावी संस्था, पुणे
        </h1>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="h-[1px] w-4 bg-saffron"></span>
          <span className="text-[10px] sm:text-xs font-semibold text-saffron tracking-widest uppercase">
            जन सेवा हीच ईश्वर सेवा
          </span>
          <span className="h-[1px] w-4 bg-saffron"></span>
        </div>
      </div>

      {/* Right: Bell + optional Logout */}
      <div className="flex items-center gap-1">
        <button
          className="p-2 hover:bg-cream-dark/50 text-maroon hover:text-saffron rounded-full relative transition-colors focus:outline-none"
          aria-label="Notifications"
          onClick={() => alert('नवीन नोटिफिकेशन्स नाहीत.')}
        >
          <Bell size={24} className="stroke-[2.2]" />
          {notificationCount > 0 && (
            <span className="absolute top-1.5 right-1.5 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-saffron opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-saffron border border-white"></span>
            </span>
          )}
        </button>

        {/* Logout button — only when admin is logged in */}
        {isAdmin && (
          <button
            onClick={handleLogout}
            title="लॉगआउट"
            className="flex items-center gap-1.5 ml-1 px-3 py-1.5 rounded-full bg-saffron/10 hover:bg-saffron text-saffron hover:text-white border border-saffron/20 hover:border-saffron text-[11px] font-bold transition-all duration-300"
          >
            <LogOut size={13} />
            <span className="hidden sm:inline">लॉगआउट</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
