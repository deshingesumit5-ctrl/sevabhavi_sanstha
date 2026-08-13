import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Users,
  Heart,
  Image as ImageIcon,
  Newspaper,
  ArrowRight,
} from 'lucide-react';
import {
  api,
  type DashboardStatsData,
} from '../../services/api';
import { fetchAllImages } from '../../services/galleryApi';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();

  const [stats, setStats] = useState<DashboardStatsData>({
    todayRegistrationsCount: 0,
    memberTotalCount: 0,
    memberAnnualCount: 0,
    memberLifetimeCount: 0,
    marriageTotalCount: 0,
    galleryTotalCount: 0,
    newsTotalCount: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);

      const [statsRes, membersData, marriageData, galleryData, newsData, todayData] = await Promise.all([
        api.getDashboardStats().catch(() => null),
        api.getAllMembers().catch(() => []),
        api.getAllMarriages().catch(() => []),
        fetchAllImages().catch(() => []),
        api.getAllNews().catch(() => []),
        api.getTodayRegistrations().catch(() => []),
      ]);

      const todayCount = todayData.length > 0 ? todayData.length : (statsRes?.todayRegistrationsCount ?? 0);
      const memberTotal = membersData.length > 0 ? membersData.length : (statsRes?.memberTotalCount ?? 0);

      const memberAnnual = membersData.length > 0
        ? membersData.filter(m => !m.memberType || m.memberType.toLowerCase() === 'annual' || m.memberType.includes('वार्षिक')).length
        : (statsRes?.memberAnnualCount ?? 0);

      const memberLifetime = membersData.length > 0
        ? membersData.filter(m => m.memberType && (m.memberType.toLowerCase() === 'lifetime' || m.memberType.includes('आजीवन'))).length
        : (statsRes?.memberLifetimeCount ?? 0);

      const marriageTotal = marriageData.length > 0 ? marriageData.length : (statsRes?.marriageTotalCount ?? 0);
      const galleryTotal = galleryData.length > 0 ? galleryData.length : (statsRes?.galleryTotalCount ?? 0);
      const newsTotal = newsData.length > 0 ? newsData.length : (statsRes?.newsTotalCount ?? 0);

      setStats({
        todayRegistrationsCount: todayCount,
        memberTotalCount: memberTotal,
        memberAnnualCount: memberAnnual,
        memberLifetimeCount: memberLifetime,
        marriageTotalCount: marriageTotal,
        galleryTotalCount: galleryTotal,
        newsTotalCount: newsTotal,
      });

    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  // 5 Stat Cards in EXACT requested order with navigation paths
  const cards = [
    {
      id: 1,
      title: "आजची नोंदणी",
      subTitle: "Today's Submissions",
      count: stats.todayRegistrationsCount,
      badgeText: "आजचे अर्ज",
      icon: Calendar,
      gradient: "from-amber-500 to-saffron",
      path: "/admin/members",
    },
    {
      id: 2,
      title: "सदस्य नोंदणी",
      subTitle: "Member Registrations",
      count: stats.memberTotalCount,
      badgeText: `वार्षिक: ${stats.memberAnnualCount} | आजीवन: ${stats.memberLifetimeCount}`,
      icon: Users,
      gradient: "from-blue-600 to-indigo-600",
      path: "/admin/members",
    },
    {
      id: 3,
      title: "विवाह नोंदणी",
      subTitle: "Marriage Registrations",
      count: stats.marriageTotalCount,
      badgeText: "एकूण विवाह नोंदणी",
      icon: Heart,
      gradient: "from-rose-500 to-orange-600",
      path: "/admin/marriage-registrations",
    },
    {
      id: 4,
      title: "गॅलरी",
      subTitle: "Gallery Count",
      count: stats.galleryTotalCount,
      badgeText: "एकूण फोटो",
      icon: ImageIcon,
      gradient: "from-emerald-600 to-teal-700",
      path: "/admin/gallery-manage",
    },
    {
      id: 5,
      title: "बातम्या",
      subTitle: "News Count",
      count: stats.newsTotalCount,
      badgeText: "एकूण बातम्या",
      icon: Newspaper,
      gradient: "from-purple-600 to-indigo-800",
      path: "/admin/news",
    },
  ];

  return (
    <div className="space-y-6">
      {/* ── Top Header Bar (Website theme, Refresh button removed) ────── */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200/60 shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-extrabold text-saffron-dark flex items-center gap-2" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
            डॅशबोर्ड सारांश
          </h2>
          <p className="text-xs text-charcoal/60 font-semibold mt-0.5">
            संस्थेच्या सर्व नोंदणी, गॅलरी व बातम्यांची मुख्य आकडेवारी
          </p>
        </div>
      </div>

      {/* ── 5 Stat Cards Grid (Website Theme, Click opens corresponding module) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {cards.map((c) => {
          const Icon = c.icon;

          return (
            <div
              key={c.id}
              onClick={() => navigate(c.path)}
              className="group relative bg-white rounded-2xl p-4 border border-amber-200/70 hover:border-saffron/60 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              {/* Card top bar */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${c.gradient} text-white flex items-center justify-center shadow-md shrink-0 group-hover:scale-105 transition-transform duration-200`}>
                  <Icon size={20} />
                </div>
                <div className="flex items-center gap-1 text-[11px] font-bold text-saffron group-hover:translate-x-0.5 transition-transform">
                  <span>मॉड्यूल पहा</span>
                  <ArrowRight size={13} />
                </div>
              </div>

              {/* Title & Count */}
              <div>
                <p className="text-xs font-bold text-charcoal/70 leading-tight" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                  {c.title}
                </p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-extrabold text-charcoal" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                    {loading ? '...' : c.count}
                  </span>
                </div>
                <div className="mt-2.5 pt-2 border-t border-charcoal/5 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-saffron-dark bg-saffron/10 px-2 py-0.5 rounded-md truncate max-w-full">
                    {c.badgeText}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminDashboardPage;
