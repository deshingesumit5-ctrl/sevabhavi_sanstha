import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Footer from './components/Footer';
import AdminGuard from './components/AdminGuard';
import AdminLayout from './layouts/AdminLayout';

// Public pages
// Home page moved under app/ directory to match other page imports
import HomePage from './app/home/home';
import AboutPage from './app/about/about';
import GalleryPage from './app/gallery/gallery';
import MarriageRegistrationPage from './app/marriage-registration/marriage_registration';
import MemberRegistrationPage from './app/member-registration/member-registration';
import ContactPage from './app/contact/contact';
import ActivitiesPage from './app/activities/activities';
import UpdatesPage from './app/updates/updates';

// Admin pages
import AdminLogin from './pages/AdminLogin';
import AdminPage from './app/admin/page';

// ── Public Layout wrapper ──────────────────────────────────────────────────────
function PublicLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-cream text-charcoal flex flex-col font-body selection:bg-saffron/30">
      {/* Top Header */}
      <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main layout */}
      <div className="flex-1 flex relative">
        {/* Left Sidebar */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        {/* Content + Footer */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#FFF8F0]">
          <div className="flex-grow">
            <Routes>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="activities" element={<ActivitiesPage />} />
              <Route path="updates" element={<UpdatesPage />} />
              <Route path="gallery" element={<GalleryPage />} />
              <Route path="marriage-registration" element={<MarriageRegistrationPage />} />
              <Route path="member-registration" element={<MemberRegistrationPage />} />
              <Route path="contact" element={<ContactPage />} />
            </Routes>
          </div>
          <Footer />
        </main>
      </div>

      {/* Sticky Bottom Nav (mobile) */}
      <BottomNav />
    </div>
  );
}

// ── Root App with routing ──────────────────────────────────────────────────────
function App() {
  const location = useLocation();

  useEffect(() => {
    if (!document.getElementById('baloo2-font-link')) {
      const link = document.createElement('link');
      link.id = 'baloo2-font-link';
      link.rel = 'stylesheet';
      link.href = 'https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&display=swap';
      document.head.appendChild(link);
    }
  }, []);

  // Scroll to top on route change (public pages)
  const isAdminRoute = location.pathname.startsWith('/admin');
  useEffect(() => {
    if (!isAdminRoute) {
      window.scrollTo(0, 0);
    }
  }, [location.pathname, isAdminRoute]);

  return (
    <Routes>
      {/* Admin login (standalone, no shared layout) */}
      <Route path="/login" element={<AdminLogin />} />

      {/* Protected admin routes inside AdminLayout */}
      <Route path="/admin" element={<AdminGuard />}>
        <Route element={<AdminLayout />}>
          <Route path="dashboard" element={<AdminPage />} />
          <Route path="members" element={<AdminPage />} />
          <Route path="marriage-registrations" element={<AdminPage />} />
          <Route path="inquiries" element={<AdminPage />} />
          <Route path="gallery-manage" element={<AdminPage />} />
          <Route path="news" element={<AdminPage />} />
          <Route path="payments" element={<AdminPage />} />
          <Route path="reports" element={<AdminPage />} />
        </Route>
      </Route>

      {/* Public routes inside shared layout */}
      <Route path="/*" element={<PublicLayout />} />
    </Routes>
  );
}

export default App;
