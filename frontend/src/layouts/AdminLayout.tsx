import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Heart,
  HelpCircle,
  Image as ImageIcon,
  Newspaper,
  CreditCard,
  BarChart3,
  LogOut,
  Menu,
  X,
} from 'lucide-react';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  path: string;
}

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'डॅशबोर्ड', icon: LayoutDashboard, path: '/admin/dashboard' },
  { id: 'members', label: 'सदस्य नोंदणी अर्ज', icon: Users, path: '/admin/members' },
  { id: 'marriage', label: 'विवाह नोंदणी अर्ज', icon: Heart, path: '/admin/marriage-registrations' },
  { id: 'inquiries', label: 'चौकशी अर्ज', icon: HelpCircle, path: '/admin/inquiries' },
  { id: 'gallery', label: 'गॅलरी', icon: ImageIcon, path: '/admin/gallery-manage' },
  { id: 'news', label: 'बातम्या', icon: Newspaper, path: '/admin/news' },
  { id: 'payments', label: 'पेमेंट्स', icon: CreditCard, path: '/admin/payments' },
  { id: 'reports', label: 'अहवाल', icon: BarChart3, path: '/admin/reports' },
];

const AdminLayout: React.FC = () => {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Redirect if not admin
  if (!isAdmin) return <Navigate to="/login" replace />;

  const handleLogout = () => {
    navigate('/', { replace: true });
    setTimeout(() => {
      logout();
    }, 200);
  };

  return (
    <div className="min-h-screen flex bg-cream font-body">

      {/* ── Mobile sidebar backdrop ──────────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ─────────────────────────────────────────────── */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col w-64 bg-white border-r border-charcoal/8 shadow-sm transform transition-transform duration-300
          lg:relative lg:translate-x-0 lg:z-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-charcoal/8">
          <div className="flex items-center gap-2.5">
            <div>
              <p className="text-saffron-dark font-bold text-sm leading-tight" style={{ fontFamily: "'Baloo 2', sans-serif" }}>एडमिन पॅनेल</p>
              <p className="text-charcoal/40 text-[9px] font-semibold">दापोली मडणगड सेवाभावी संस्था, पुणे</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-charcoal/40 hover:text-saffron transition-colors p-1"
          >
            <X size={18} />
          </button>
        </div>


        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path ||
              (item.path === '/admin/dashboard' && location.pathname === '/admin');
            return (
              <button
                key={item.id}
                onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive
                  ? 'bg-saffron text-white shadow-lg shadow-saffron/20'
                  : 'text-charcoal/60 hover:text-saffron hover:bg-cream'
                  }`}
              >
                <Icon size={17} className={isActive ? 'text-white' : 'text-charcoal/40'} />
                <span className="text-[13px]">{item.label}</span>
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/70" />}
              </button>
            );
          })}
        </nav>
        {/* Logout */}
        <div className="p-4 border-t border-charcoal/8">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-red-500 hover:text-white hover:bg-red-500 text-sm font-semibold transition-all duration-200"
          >
            <LogOut size={17} />
            <span className="text-[13px]">लॉगआउट</span>
          </button>
        </div>
      </aside>

      {/* ── Main area ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 bg-cream/30">

        {/* Top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-white border-b border-charcoal/8 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-lg text-charcoal/60 hover:text-saffron hover:bg-cream transition-colors"
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="text-sm font-bold text-charcoal" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                {navItems.find(n => n.path === location.pathname)?.label ?? 'एडमिन पॅनेल'}
              </h1>
              <p className="text-[10px] text-charcoal/40 font-semibold">
                दापोली मंडणगड सेवाभावी संस्था, पुणे
              </p>
            </div>
          </div>

          {/* Public site link */}
          <button
            onClick={() => navigate('/')}
            className="text-xs font-bold text-saffron hover:text-saffron-dark transition-colors border border-saffron/20 hover:border-saffron px-3 py-1.5 rounded-full"
          >
            ← वेबसाइट पाहा
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
