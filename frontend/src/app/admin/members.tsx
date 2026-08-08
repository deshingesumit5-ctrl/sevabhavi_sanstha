import React, { useState, useEffect } from 'react';
import { Users, Eye, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { api, type MemberRegistrationData, type MaritalStatus, type Gender } from '../../services/api';

const AdminMembersPage: React.FC = () => {
  const [members, setMembers] = useState<MemberRegistrationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [maritalStatuses, setMaritalStatuses] = useState<MaritalStatus[]>([]);
  const [genders, setGenders] = useState<Gender[]>([]);

  useEffect(() => {
    loadMembers();
    api.getMaritalStatuses().then(setMaritalStatuses).catch(err => console.error('Error loading marital statuses:', err));
    api.getGenders().then(setGenders).catch(err => console.error('Error loading genders:', err));
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      const data = await api.getAllMembers();
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setMembers(sorted);
    } catch (err) {
      console.error('Error loading members:', err);
    } finally {
      setLoading(false);
    }
  };
  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      await api.updateMemberStatus(id, status);
      setMembers(prev => prev.map(m => m.id === id ? { ...m, approvalStatus: status } : m));
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

  const getMaritalLabel = (code: string) =>
    maritalStatuses.find(m => m.code === code)?.labelMr ?? code;

  const getGenderLabel = (code: string) =>
    genders.find(g => g.code === code)?.labelMr ?? code;

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('mr-IN');
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-saffron border-t-transparent rounded-full" />
      </div>
    );
  }

  const getMemberTypeBadge = (type: string) => (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${type === 'lifetime' ? 'bg-maroon/10 text-maroon' : 'bg-saffron/10 text-saffron'}`}>
      {type === 'lifetime' ? 'आजीवन' : 'वार्षिक'}
    </span>
  );

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-saffron to-maroon rounded-xl text-white shadow-lg">
            <Users size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-charcoal font-heading">सदस्य नोंदणी अर्ज</h2>
            <p className="text-[11px] text-charcoal/50 font-semibold">एकूण अर्ज: {members.length}</p>
          </div>
        </div>
      </div>

      {/* Members Table */}
      {members.length === 0 ? (
        <div className="bg-white rounded-2xl border border-charcoal/5 shadow-sm p-12 text-center">
          <Users size={48} className="mx-auto text-charcoal/20 mb-4" />
          <p className="text-sm text-charcoal/50 font-semibold">कोणतेही सदस्य नोंदणी अर्ज नाहीत.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-maroon/8 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="bg-gradient-to-r from-cream/70 to-cream/40 border-b-2 border-maroon/15">
                  <th className="p-3.5 text-maroon font-bold font-heading">नाव</th>
                  <th className="p-3.5 text-maroon font-bold font-heading">मोबाईल</th>
                  <th className="p-3.5 text-maroon font-bold font-heading">प्रकार</th>
                  <th className="p-3.5 text-maroon font-bold font-heading">तारीख</th>
                  <th className="p-3.5 text-maroon font-bold font-heading">स्थिती</th>
                  <th className="p-3.5 text-maroon font-bold font-heading">कृती</th>
                </tr>
              </thead>
              <tbody>
                {members.map((member) => (
                  <React.Fragment key={member.id}>
                    <tr className="border-b border-charcoal/8 hover:bg-saffron/5 transition-colors font-semibold text-charcoal/85">
                      <td className="p-3.5">{member.fullName}</td>
                      <td className="p-3.5">{member.mobile}</td>
                      <td className="p-3.5">{getMemberTypeBadge(member.memberType)}</td>
                      <td className="p-3.5">{formatDate(member.createdAt)}</td>
                      <td className="p-3.5">{getStatusBadge(member.approvalStatus)}</td>
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setExpandedId(expandedId === member.id ? null : member.id)}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors"
                            title="अर्ज बघा"
                          >
                            <Eye size={12} />
                            अर्ज बघा
                            {expandedId === member.id ? <ChevronUp size={10} /> : <ChevronDown size={10} />}
                          </button>
                          {member.approvalStatus === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleStatusUpdate(member.id, 'APPROVED')}
                                className="px-2.5 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors shadow-sm"
                                title="मंजूर करा"
                              >
                                <CheckCircle2 size={12} />
                                मंजूर करा
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(member.id, 'REJECTED')}
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
                    {expandedId === member.id && (
                      <tr>
                        <td colSpan={6} className="p-0">
                          <div className="bg-cream/30 border-t border-b border-maroon/10 p-5 space-y-5">
                            <div>
                              <h5 className="text-xs font-bold text-maroon font-heading mb-3 border-b border-maroon/10 pb-1.5">वैयक्तिक माहिती</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">पूर्ण नाव</span>
                                  <span className="font-bold text-charcoal/90">{member.fullName}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">जन्म तारीख</span>
                                  <span className="font-bold text-charcoal/90">{formatDate(member.birthDate)}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">लिंग</span>
                                  <span className="font-bold text-charcoal/90">{getGenderLabel(member.gender)}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">वैवाहिक स्थिती</span>
                                  <span className="font-bold text-charcoal/90">{getMaritalLabel(member.maritalStatus)}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h5 className="text-xs font-bold text-maroon font-heading mb-3 border-b border-maroon/10 pb-1.5">संपर्क माहिती</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">मोबाईल</span>
                                  <span className="font-bold text-charcoal/90">{member.mobile}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">ईमेल</span>
                                  <span className="font-bold text-charcoal/90">{member.email || '-'}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h5 className="text-xs font-bold text-maroon font-heading mb-3 border-b border-maroon/10 pb-1.5">शिक्षण व व्यवसाय</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">शिक्षण</span>
                                  <span className="font-bold text-charcoal/90">{member.education}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">नोकरी / व्यवसाय प्रकार</span>
                                  <span className="font-bold text-charcoal/90">{member.occupation}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">सदस्यत्व प्रकार</span>
                                  <span className="font-bold text-charcoal/90">{member.memberType === 'lifetime' ? 'आजीवन' : 'वार्षिक'}</span>
                                </div>
                              </div>
                            </div>

                            <div>
                              <h5 className="text-xs font-bold text-maroon font-heading mb-3 border-b border-maroon/10 pb-1.5">पत्ता</h5>
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">सध्याचा पत्ता</span>
                                  <span className="font-bold text-charcoal/90">{member.currentAddress}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">कायमचा पत्ता</span>
                                  <span className="font-bold text-charcoal/90">{member.permanentAddress}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">राज्य</span>
                                  <span className="font-bold text-charcoal/90">{member.state?.nameMr || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">जिल्हा</span>
                                  <span className="font-bold text-charcoal/90">{member.district?.nameMr || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">तालुका</span>
                                  <span className="font-bold text-charcoal/90">{member.taluka?.nameMr || '-'}</span>
                                </div>
                                <div>
                                  <span className="text-charcoal/50 font-semibold block mb-0.5">पिनकोड</span>
                                  <span className="font-bold text-charcoal/90">{member.pincode}</span>
                                </div>
                              </div>
                            </div>

                            {(member.expectations || member.message) && (
                              <div>
                                <h5 className="text-xs font-bold text-maroon font-heading mb-3 border-b border-maroon/10 pb-1.5">अपेक्षा व संदेश</h5>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                                  {member.expectations && (
                                    <div>
                                      <span className="text-charcoal/50 font-semibold block mb-0.5">अपेक्षा</span>
                                      <span className="font-bold text-charcoal/90">{member.expectations}</span>
                                    </div>
                                  )}
                                  {member.message && (
                                    <div>
                                      <span className="text-charcoal/50 font-semibold block mb-0.5">संदेश</span>
                                      <span className="font-bold text-charcoal/90">{member.message}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
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

export default AdminMembersPage;
