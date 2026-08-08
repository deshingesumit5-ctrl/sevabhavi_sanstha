import React, { useState, useEffect } from 'react';
import { Heart, Eye, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { api, type MarriageRegistrationData, type MaritalStatus } from '../../services/api';

const AdminMarriagePage: React.FC = () => {
  const [marriages, setMarriages] = useState<MarriageRegistrationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const [maritalStatuses, setMaritalStatuses] = useState<MaritalStatus[]>([]);

  useEffect(() => {
    loadMarriages();
    api.getMaritalStatuses().then(setMaritalStatuses).catch(err => console.error('Error loading marital statuses:', err));
  }, []);

  const loadMarriages = async () => {
    try {
      setLoading(true);
      const data = await api.getAllMarriages();
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setMarriages(sorted);
    } catch (err) {
      console.error('Error loading marriages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await api.updateMarriageStatus(id, status);
      setMarriages(prev => prev.map(m => m.id === id ? { ...m, approvalStatus: status } : m));
    } catch (err) {
      console.error('Error updating status:', err);
      alert('स्थिती अपडेट करताना त्रुटी आली.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">मंजूर</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700">नाकारले</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-700">प्रलंबित</span>;
    }
  };

  const getProfileBadge = (type: string) => {
    return type === 'bride'
      ? <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-100 text-pink-700">वधू</span>
      : <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700">वर</span>;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('mr-IN');
    } catch {
      return dateStr;
    }
  };

  const getOccupationLabel = (type: string) => {
    const map: Record<string, string> = {
      'private_job': 'खाजगी नोकरी',
      'gov_job': 'शासकीय नोकरी',
      'business': 'व्यवसाय',
      'not_working': 'काम करत नाही',
    };
    return map[type] || type;
  };

  const getMaritalLabel = (code: string) =>
    maritalStatuses.find(m => m.code === code)?.labelMr ?? code;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-saffron border-t-transparent rounded-full" />
      </div>
    );
  }


  return (
    <div className="p-4 md:p-6 w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-maroon to-[#541221] rounded-xl text-white shadow-lg">
            <Heart size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-charcoal font-heading">विवाह नोंदणी अर्ज</h2>
            <p className="text-[11px] text-charcoal/50 font-semibold">एकूण अर्ज: {marriages.length}</p>
          </div>
        </div>
      </div>

      {/* Marriage Table */}
      {marriages.length === 0 ? (
        <div className="bg-white rounded-2xl border border-charcoal/5 shadow-sm p-12 text-center">
          <Heart size={48} className="mx-auto text-charcoal/20 mb-4" />
          <p className="text-sm text-charcoal/50 font-semibold">कोणतेही विवाह नोंदणी अर्ज नाहीत.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-maroon/8 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-gradient-to-r from-cream/70 to-cream/40 border-b-2 border-maroon/15">
                  <th className="p-3.5 text-maroon font-bold font-heading">नाव</th>
                  <th className="p-3.5 text-maroon font-bold font-heading">प्रकार</th>
                  <th className="p-3.5 text-maroon font-bold font-heading">मोबाईल</th>
                  <th className="p-3.5 text-maroon font-bold font-heading">शहर</th>
                  <th className="p-3.5 text-maroon font-bold font-heading">तारीख</th>
                  <th className="p-3.5 text-maroon font-bold font-heading">स्थिती</th>
                  <th className="p-3.5 text-maroon font-bold font-heading">कृती</th>
                </tr>
              </thead>
              <tbody>
                {marriages.map((item) => (
                  <React.Fragment key={item.id}>
                    <tr className="border-b border-charcoal/5 hover:bg-cream/20 transition-colors font-semibold text-charcoal/85">
                      <td className="p-3.5">{item.fullName}</td>
                      <td className="p-3.5">{getProfileBadge(item.profileType)}</td>
                      <td className="p-3.5">{item.mobile}</td>
                      <td className="p-3.5">{item.city}</td>
                      <td className="p-3.5">{formatDate(item.createdAt)}</td>
                      <td className="p-3.5">{getStatusBadge(item.approvalStatus)}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                            title="अर्ज बघा"
                          >
                            <Eye size={12} />
                            अर्ज बघा
                            {expandedId === item.id ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                          </button>
                          {item.approvalStatus === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(item.id, 'APPROVED')}
                                className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors shadow-sm"
                                title="मंजूर करा"
                              >
                                <CheckCircle2 size={12} />
                                मंजूर करा
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(item.id, 'REJECTED')}
                                className="px-2.5 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors shadow-sm"
                                title="नाकारा"
                              >
                                <XCircle size={12} />
                                नाकारा
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                    {expandedId === item.id && (
                      <tr>
                        <td colSpan={7} className="p-0">
                          <div className="bg-cream/40 border-t border-b border-maroon/15 p-5 space-y-5">
                            {/* Personal Info */}
                            <div>
                              <h5 className="text-xs font-bold text-maroon font-heading mb-3 border-b border-maroon/10 pb-1.5">वैयक्तिक माहिती</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">पूर्ण नाव</span>
                                  <span className="font-bold text-charcoal/90">{item.fullName}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">जन्मतारीख</span>
                                  <span className="font-bold text-charcoal/90">{formatDate(item.birthDate)}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">उंची</span>
                                  <span className="font-bold text-charcoal/90">{item.height}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">रक्तगट</span>
                                  <span className="font-bold text-charcoal/90">{item.bloodGroup}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">वैवाहिक स्थिती</span>
                                  <span className="font-bold text-charcoal/90">{getMaritalLabel(item.maritalStatus)}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">धर्म</span>
                                  <span className="font-bold text-charcoal/90">{item.religion}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">जात</span>
                                  <span className="font-bold text-charcoal/90">{item.caste}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">गोत्र</span>
                                  <span className="font-bold text-charcoal/90">{item.gotra || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">मंगळ दोष</span>
                                  <span className="font-bold text-charcoal/90">{item.manglik === 'yes' ? 'होय' : item.manglik === 'no' ? 'नाही' : 'माहित नाही'}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">शहर</span>
                                  <span className="font-bold text-charcoal/90">{item.city}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">जिल्हा</span>
                                  <span className="font-bold text-charcoal/90">{item.district?.nameMr || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">राज्य</span>
                                  <span className="font-bold text-charcoal/90">{item.state?.nameMr || '-'}</span>
                                </div>
                              </div>
                            </div>

                            {/* Contact */}
                            <div>
                              <h5 className="text-xs font-bold text-maroon font-heading mb-3 border-b border-maroon/10 pb-1.5">संपर्क माहिती</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">मोबाईल</span>
                                  <span className="font-bold text-charcoal/90">{item.mobile}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">ईमेल</span>
                                  <span className="font-bold text-charcoal/90">{item.email || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">पालकांचा नंबर</span>
                                  <span className="font-bold text-charcoal/90">{item.parentMobile}</span>
                                </div>
                              </div>
                            </div>

                            {/* Education */}
                            <div>
                              <h5 className="text-xs font-bold text-maroon font-heading mb-3 border-b border-maroon/10 pb-1.5">शैक्षणिक माहिती</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">शिक्षण स्तर</span>
                                  <span className="font-bold text-charcoal/90">{item.educationLevel}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">पदवी</span>
                                  <span className="font-bold text-charcoal/90">{item.degreeName}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">शाळा / कॉलेज</span>
                                  <span className="font-bold text-charcoal/90">{item.schoolCollege || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">उत्तीर्ण वर्ष</span>
                                  <span className="font-bold text-charcoal/90">{item.passingYear}</span>
                                </div>
                              </div>
                            </div>

                            {/* Occupation */}
                            <div>
                              <h5 className="text-xs font-bold text-maroon font-heading mb-3 border-b border-maroon/10 pb-1.5">व्यावसायिक माहिती</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">नोकरी / व्यवसाय प्रकार</span>
                                  <span className="font-bold text-charcoal/90">{getOccupationLabel(item.occupationType)}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">पद</span>
                                  <span className="font-bold text-charcoal/90">{item.designation || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">कंपनी</span>
                                  <span className="font-bold text-charcoal/90">{item.companyName || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">वार्षिक उत्पन्न</span>
                                  <span className="font-bold text-charcoal/90">{item.annualIncome}</span>
                                </div>
                              </div>
                            </div>
{/* Family */}
                            <div>
                              <h5 className="text-xs font-bold text-maroon font-heading mb-3 border-b border-maroon/10 pb-1.5">कुटुंबाची माहिती</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">वडिलांचे नाव</span>
                                  <span className="font-bold text-charcoal/90">{item.fatherName}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">वडिलांचा व्यवसाय</span>
                                  <span className="font-bold text-charcoal/90">{item.fatherOccupation}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">आईचे नाव</span>
                                  <span className="font-bold text-charcoal/90">{item.motherName}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">भाऊ / बहीण</span>
                                  <span className="font-bold text-charcoal/90">{item.brothers} भाऊ, {item.sisters} बहीण</span>
                                </div>
                                {item.familyBackground && (
                                  <div className="md:col-span-4">
                                    <span className="text-charcoal/50 font-semibold block mb-0.5">कुटुंब पार्श्वभूमी</span>
                                    <span className="font-bold text-charcoal/90">{item.familyBackground}</span>
                                  </div>
                                )}
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">स्वतःबद्दल</span>
                                  <span className="font-bold text-charcoal/90">{item.aboutSelf}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">अपेक्षा</span>
                                  <span className="font-bold text-charcoal/90">{item.expectations}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
export default AdminMarriagePage;
