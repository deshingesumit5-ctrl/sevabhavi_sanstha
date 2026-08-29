import React from 'react';
import { useLocation } from 'react-router-dom';
import { Settings } from 'lucide-react';
import AdminDashboardPage from './dashboard';
import AdminMembersPage from './members';
import AdminMarriagePage from './marriage';
import AdminShibirPage from './shibir';
import AdminInquiriesPage from './inquiries';
import AdminPaymentsPage from './payments';
import GalleryPage from '../gallery/gallery';
import UpdatesPage from '../updates/updates';

export const AdminPage: React.FC = () => {
  const location = useLocation();

  // Determine active tab based on pathname
  let activeTab: 'dashboard' | 'members' | 'marriage' | 'shibir' | 'inquiries' | 'payments' | 'gallery' | 'news' | 'other' = 'dashboard';
  if (location.pathname === '/admin/dashboard' || location.pathname === '/admin') {
    activeTab = 'dashboard';
  } else if (location.pathname === '/admin/members') {
    activeTab = 'members';
  } else if (location.pathname === '/admin/marriage-registrations') {
    activeTab = 'marriage';
  } else if (location.pathname === '/admin/shibir-registrations') {
    activeTab = 'shibir';
  } else if (location.pathname === '/admin/inquiries') {
    activeTab = 'inquiries';
  } else if (location.pathname === '/admin/payments') {
    activeTab = 'payments';
  } else if (location.pathname === '/admin/gallery-manage') {
    activeTab = 'gallery';
  } else if (location.pathname === '/admin/news') {
    activeTab = 'news';
  } else {
    activeTab = 'other';
  }

  return (
    <div className="flex flex-col w-full pb-8">
      {/* Main Container */}
      <section className="w-full px-1.5 sm:px-4 py-4 md:py-6 max-w-7xl mx-auto">

        {/* Tab Panel Content */}
        <div className="w-full bg-white rounded-card border border-amber-200/60 shadow-soft p-2 sm:p-4 md:p-6">
          {/* Tab 1: Dashboard Summary */}
          {activeTab === 'dashboard' && (
            <AdminDashboardPage />
          )}

          {/* Tab 2: Registered Members */}
          {activeTab === 'members' && (
            <AdminMembersPage />
          )}

          {/* Tab 3: Marriage Registrations */}
          {activeTab === 'marriage' && (
            <AdminMarriagePage />
          )}

          {/* Tab 3.5: Shibir Registrations */}
          {activeTab === 'shibir' && (
            <AdminShibirPage />
          )}

          {/* Tab 4: Inquiries */}
          {activeTab === 'inquiries' && (
            <AdminInquiriesPage />
          )}

          {/* Tab 5: Payments */}
          {activeTab === 'payments' && (
            <AdminPaymentsPage />
          )}

          {/* Tab 6: Gallery Management */}
          {activeTab === 'gallery' && (
            <GalleryPage />
          )}

          {/* Tab 7: News / Updates Management */}
          {activeTab === 'news' && (
            <UpdatesPage />
          )}

          {/* Other Admin Routes Placeholder */}
          {activeTab === 'other' && (
            <div className="text-center py-12 space-y-3">
              <Settings className="mx-auto text-charcoal/30 w-12 h-12 animate-spin-slow" />
              <h3 className="text-sm font-bold text-saffron-dark" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                हा विभाग लवकरच उपलब्ध होईल
              </h3>
              <p className="text-xs text-charcoal/50 font-semibold">
                या विभागाचे काम सुरू आहे.
              </p>
            </div>
          )}

        </div>

      </section>
    </div>
  );
};

export default AdminPage;
