import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ShieldAlert,
  Home,
  Users,
  Image as ImageIcon,
  Heart,
  UserPlus,
  Calendar,
  Gift,
  PhoneCall,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const publicMenuItems = [
    { id: 'home', path: '/', label: 'होम', icon: Home },
    { id: 'about', path: '/about', label: 'आमच्याबद्दल', icon: Users },
    { id: 'member-registration', path: '/member-registration', label: 'सदस्य नोंदणी', icon: UserPlus },
    { id: 'marriage-registration', path: '/marriage-registration', label: 'विवाह नोंदणी', icon: Heart },
    { id: 'shibir-registration', path: '/shibir-registration', label: 'शिबिर नोंदणी', icon: Calendar },
    { id: 'donation-registration', path: '/donation-registration', label: 'देणगी नोंदणी', icon: Gift },
    { id: 'gallery', path: '/gallery', label: 'गॅलरी', icon: ImageIcon },
    { id: 'contact', path: '/contact', label: 'संपर्क साधा', icon: PhoneCall },
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Mobile Backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-maroon/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* Navigation Container: Horizontal on Laptop (lg:), Left Drawer on Mobile */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 z-50 flex flex-col w-[280px] h-screen bg-white border-r border-maroon/10 shadow-soft-lg transform transition-transform duration-300
          ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-30 lg:flex-row lg:w-full lg:h-auto lg:bg-white lg:border-r-0 lg:border-b lg:border-maroon/10 lg:shadow-sm lg:py-2.5 lg:px-6 lg:justify-center
        `}
      >
        {/* Sidebar Header - Mobile Only */}
        <div className="flex items-center justify-between p-4 border-b border-maroon/5 bg-cream/10 lg:hidden">
          <div className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="दापोली मंडणगड सेवाभावी संस्था"
              className="w-8 h-8 rounded-full object-contain shrink-0"
            />
            <span className="font-bold text-maroon text-base truncate" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              सेवाभावी संस्था
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-cream text-maroon hover:text-saffron rounded-full transition-colors"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1 bg-cream/5 lg:bg-transparent lg:overflow-visible lg:py-0 lg:px-0 lg:space-y-0 lg:flex lg:flex-row lg:items-center lg:justify-center lg:gap-2 lg:flex-wrap">

          {/* Admin Panel link — only visible when logged in as admin */}
          {isAdmin && (
            <button
              onClick={() => handleNavigate('/admin/dashboard')}
              className={`w-full lg:w-auto flex items-center gap-2.5 px-4 py-2.5 lg:py-2 rounded-card lg:rounded-full text-sm font-semibold transition-all duration-300 group ${location.pathname.startsWith('/admin')
                ? 'bg-saffron text-white shadow-md shadow-saffron/20'
                : 'text-charcoal/80 hover:bg-cream-dark/40 hover:text-saffron'
                }`}
            >
              <ShieldAlert
                size={18}
                className={`transition-colors duration-300 ${location.pathname.startsWith('/admin') ? 'text-white' : 'text-maroon group-hover:text-saffron'
                  }`}
              />
              <span className="text-[13.5px] truncate">एडमिन पॅनेल</span>
            </button>
          )}

          {/* Public nav items */}
          {publicMenuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.path)}
                className={`w-full lg:w-auto flex items-center gap-2.5 px-4 py-2.5 lg:py-2 rounded-card lg:rounded-full text-sm font-semibold transition-all duration-300 group ${isActive
                  ? 'bg-saffron text-white shadow-md shadow-saffron/20'
                  : 'text-charcoal/80 hover:bg-cream-dark/40 hover:text-saffron'
                  }`}
              >
                <Icon
                  size={18}
                  className={`transition-colors duration-300 ${isActive ? 'text-white' : 'text-maroon group-hover:text-saffron'
                    }`}
                />
                <span className="text-[13.5px] truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Sidebar Footer - Mobile Only */}
        <div className="p-4 border-t border-maroon/5 bg-cream/20 text-center lg:hidden">
          <p className="text-[10px] font-semibold text-maroon/60 tracking-wider">
            दापोली मंडणगड सेवाभावी संस्था, पुणे
          </p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
