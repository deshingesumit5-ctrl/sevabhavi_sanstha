import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, UserPlus, Heart, Calendar, PhoneCall } from 'lucide-react';

const navItems = [
  { id: 'home',                  path: '/',                      label: 'होम',           icon: Home },
  { id: 'member-registration',   path: '/member-registration',   label: 'सदस्य नोंदणी', icon: UserPlus },
  { id: 'marriage-registration', path: '/marriage-registration', label: 'विवाह नोंदणी', icon: Heart },
  { id: 'shibir-registration',   path: '/shibir-registration',   label: 'शिबिर नोंदणी', icon: Calendar },
  { id: 'contact',               path: '/contact',               label: 'संपर्क',        icon: PhoneCall },
];

export const BottomNav: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Don't render on admin pages
  if (location.pathname.startsWith('/admin')) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-maroon/10 shadow-lg lg:hidden px-2 py-1.5 flex items-center justify-around">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;

        return (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className="flex flex-col items-center justify-center flex-1 py-1 text-center transition-all duration-300 relative"
          >
            {/* Nav Icon */}
            <div
              className={`p-1 rounded-full transition-all duration-300 ${
                isActive
                  ? 'text-saffron scale-110'
                  : 'text-maroon/75 hover:text-saffron'
              }`}
            >
              <Icon size={20} className="stroke-[2.2]" />
            </div>

            {/* Nav Label */}
            <span
              className={`text-[9px] font-bold tracking-wide mt-0.5 transition-colors duration-300 ${
                isActive ? 'text-saffron font-extrabold' : 'text-charcoal/70'
              }`}
            >
              {item.label}
            </span>

            {/* Active Indicator Dot */}
            {isActive && (
              <span className="absolute bottom-0 w-1.5 h-1.5 rounded-full bg-saffron animate-pulse" />
            )}
          </button>
        );
      })}
    </nav>
  );
};

export default BottomNav;
