import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Users, Heart, Settings } from 'lucide-react';
import { api } from '../../services/api';
import AdminMembersPage from './members';
import AdminMarriagePage from './marriage';

export const AdminPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Counts state
  const [memberCount, setMemberCount] = useState(0);
  const [marriageCount, setMarriageCount] = useState(0);

  // Determine active tab based on pathname
  let activeTab: 'members' | 'marriage' | 'other' = 'members';
  if (location.pathname === '/admin/members' || location.pathname === '/admin/dashboard' || location.pathname === '/admin') {
    activeTab = 'members';
  } else if (location.pathname === '/admin/marriage-registrations') {
    activeTab = 'marriage';
  } else {
    activeTab = 'other';
  }

  // Load counts on mount
  useEffect(() => {
    const loadCounts = async () => {
      try {
        const [members, marriages] = await Promise.all([
          api.getAllMembers(),
          api.getAllMarriages()
        ]);
        setMemberCount(members.length);
        setMarriageCount(marriages.length);
      } catch (err) {
        console.error('Error loading counts in AdminPage:', err);
      }
    };
    loadCounts();
  }, [location.pathname]); // Re-fetch counts when navigation happens to reflect approvals

  return (
    <div className="flex flex-col w-full pb-8">
         {/* Main Container */}
      <section className="w-full px-1.5 sm:px-4 py-4 md:py-6 max-w-7xl mx-auto">

        {/* Tab Panel Content */}
        <div className="w-full bg-white rounded-card border border-maroon/5 shadow-soft p-2 sm:p-4 md:p-6">
          {/* Tab 2: Registered Members */}
          {activeTab === 'members' && (
            <AdminMembersPage />
          )}

          {/* Tab 3: Marriage Registrations */}
          {activeTab === 'marriage' && (
            <AdminMarriagePage />
          )}

          {/* Other Admin Routes Placeholder */}
          {activeTab === 'other' && (
            <div className="text-center py-12 space-y-3">
              <Settings className="mx-auto text-charcoal/30 w-12 h-12 animate-spin-slow" />
              <h3 className="text-sm font-bold text-maroon font-heading">
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
