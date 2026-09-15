import React, { useState, useEffect } from 'react';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import ConfirmModal, { type ConfirmState } from '../../components/ConfirmModal';
import { Pencil, Trash2 } from 'lucide-react';
import { uploadImage, imageUrl, deleteImage, fetchByCategory, type GalleryImage } from '../../services/galleryApi';
import { useAuth } from '../../context/AuthContext';

import photoRajeshDalavi from '../../assets/members_photos/rajendra.dalavi.png';
import photoMilindVaradkar from '../../assets/members_photos/milind.varadkar.png';
import photoAbhishekShinde from '../../assets/members_photos/abhishek.shinde.png';
import photoSurajKadam from '../../assets/members_photos/suraj.kadam.png';
import photoJitendraPawar from '../../assets/members_photos/jitendra.pawar.png';
import photoNyandevPawar from '../../assets/members_photos/nyandev.pawar.png';
import photoRajendraSondkar from '../../assets/members_photos/rajendra.sondkar.png';
import photoAvadhutKadam from '../../assets/members_photos/avadhut.kadam.png';
import photoRajendraPawar from '../../assets/members_photos/rajendra.pawar.png';
import photoMilindDabholkar from '../../assets/members_photos/milind.dabholkar.png';
import photoPardule from '../../assets/members_photos/pardule.png';
import photoVilasBarve from '../../assets/members_photos/vilas.barve.png';
import photoPradipKhambe from '../../assets/members_photos/pradip.khambe.png';
import photoGaneshChougule from '../../assets/members_photos/ganesh.chougule.png';
import photoMahendraChavan from '../../assets/members_photos/mahendra.chavan.png';
import photoAmolShinde from '../../assets/members_photos/amol.shinde.png';
import photoRajendraKadam from '../../assets/members_photos/shree.rajabhau.kadam.png';

const ABOUT_TEXT =
  "सस्नेह नमस्कार ! आपली दापोली मंडणगड सेवाभावी संस्था, पुणे आजतागायत वेगवेगळ्या यथोचित उपक्रमातून दोन तालुक्यांतीलच नव्हे तर सर्व कोकणी माणसाच्या सर्वांगीण विकासासाठी प्रयत्नशील राहून काम करत आहे. भविष्यात आपल्या सर्वांच्या सकारात्मक प्रतिसादाने, सहकार्याने संचालक मंडळ आपल्या सर्वांना सोबत घेऊन 'एकमेकां सहाय्य करू, अवघे धरू सुपंथ' या वृत्तीने आपल्या ध्येयाकडे वाटचाल करत राहिल, अशी ग्वाही आम्ही देत आहोत. बंधुनो संस्थेच्या याच ध्येय उद्दिष्टांच्या पूर्ततेसाठी आपल्यासारख्या बंधू भगिनींना संस्थेचे सदस्यत्व देऊन या प्रवाहात आणण्याचा आमचा हा छोटासा प्रयत्न आहे. संस्थेमध्ये सर्वधर्म समभाव, तसेच कोणत्याही प्रकारचा जातीयवाद न बाळगता राजकारण विरहित कार्य करत तळागाळातील सर्व कोकणी माणसाच्या सर्वांगीण विकासासाठी आपण सर्व बंधू भगिनी यशस्वीपणे वाटचाल सुरू ठेऊन आपल्या या संस्थेला नावलौकिक मिळवून देण्यासाठी प्रयत्नशील राहू या. धन्यवाद!";

const committeeMembers = [
  { firstName: 'राजेश', role: 'अध्यक्ष', name: 'राजेश स. दळवी', place: 'मंडणगड - घराडी', photo: photoRajeshDalavi },
  { firstName: 'मिलिंद', role: 'उपाध्यक्ष', name: 'मिलिंद श. वराडकर', place: 'दापोली - मुरुड', photo: photoMilindVaradkar },
  { firstName: 'अभिषेक', role: 'खजिनदार', name: 'अभिषेक अ.शिंदे', place: 'मंडणगड - कुडुक', photo: photoAbhishekShinde },
  { firstName: 'सुरज', role: 'उपखजिनदार', name: 'सुरज सु. कदम', place: 'दापोली - जामगी', photo: photoSurajKadam },
  { firstName: 'जितेंद्र', role: 'सेक्रेटरी', name: 'जितेंद्र स. पवार', place: 'मंडणगड - विन्हे', photo: photoJitendraPawar },
  { firstName: 'ज्ञानदेव', role: 'उपसेक्रेटरी', name: 'ज्ञानदेव व. पवार', place: 'मंडणगड - सडे', photo: photoNyandevPawar },
  { firstName: 'राजेंद्र', role: 'कार्याध्यक्ष', name: 'राजेंद्र का. सोडकर', place: 'मंडणगड - कादवण', photo: photoRajendraSondkar },
  { firstName: 'अवधूत', role: 'संपर्कप्रमुख', name: 'अवधूत अ. कदम', place: 'दापोली - जामगी', photo: photoAvadhutKadam },
  { firstName: 'राजेंद्र', role: 'संचालक', name: 'राजेंद्र रा. पवार', place: 'मंडणगड - विन्हे', photo: photoRajendraPawar },
  { firstName: 'मिलिंद', role: 'संचालक', name: 'मिलिंद सु. दाभोळकर', place: 'दापोली - जालगाव', photo: photoMilindDabholkar },
  { firstName: 'नरेश', role: 'संचालक', name: 'नरेश ना. पारदुले', place: 'दापोली - आतगाव केळशी', photo: photoPardule },
  { firstName: 'विलास', role: 'संचालक', name: 'विलास बा. बर्वे', place: 'मंडणगड - तिडे', photo: photoVilasBarve },
  { firstName: 'प्रदीप', role: 'संचालक', name: 'प्रदीप पा. खांबे', place: 'दापोली - भडवले', photo: photoPradipKhambe },
  { firstName: 'गणेश', role: 'संचालक', name: 'गणेश शा. चौगुले', place: 'मंडणगड - आतखोल', photo: photoGaneshChougule },
  { firstName: 'महेंद्र', role: 'संचालक', name: 'महेंद्र कृ. चव्हाण', place: 'दापोली - जामगी', photo: photoMahendraChavan },
  { firstName: 'अमोल', role: 'संचालक', name: 'अमोल सि. शिंदे', place: 'मंडणगड - वैरळ', photo: photoAmolShinde },
  { firstName: 'राजेंद्र', role: 'संचालक', name: 'राजेंद्र तु. कदम', place: 'मंडणगड - कादवण', photo: photoRajendraKadam },
];

export const AboutPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [aboutImage, setAboutImage] = useState<GalleryImage | null>(null);
  const [showFullAbout, setShowFullAbout] = useState(false);
  const [showAllMembers, setShowAllMembers] = useState(false);

  const [confirmState, setConfirmState] = useState<ConfirmState>({ open: false, message: '', onConfirm: () => { } });
  const closeConfirm = () => setConfirmState(prev => ({ ...prev, open: false }));
  const askConfirm = (message: string, onConfirm: () => void) => setConfirmState({ open: true, message, onConfirm });

  useEffect(() => {
    fetchByCategory('about')
      .then(images => setAboutImage(images.find(img => img.sectionKey === 'about_us_photo') ?? null))
      .catch(err => console.error('Error loading about image:', err));
  }, []);

  const handleAboutUpload = async (file: File) => {
    try {
      const uploaded = await uploadImage({ file, category: 'about', sectionKey: 'about_us_photo' });
      setAboutImage(uploaded);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleAboutDelete = async () => {
    if (!aboutImage) return;
    askConfirm('संस्थेचा फोटो हटवायचा आहे का?', async () => {
      try {
        await deleteImage(aboutImage.id);
        setAboutImage(null);
      } catch (err) {
        alert((err as Error).message);
      }
    });
  };

  return (
    <div className="flex flex-col w-full">
      {/* About Us Card Section */}
      <section className="w-full px-4 max-w-6xl mx-auto section-gap-top">
        <div className="bg-white rounded-3xl border border-amber-200/60 shadow-soft p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10 items-start">
          <div className="flex flex-col items-start justify-center">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#d9531e]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              आमच्याबद्दल
            </h2>
            <div className="w-12 h-1 bg-[#d9531e] rounded-full mt-2 mb-4" />
            <p
              className={`text-sm md:text-base leading-relaxed text-charcoal/80 font-body ${showFullAbout ? '' : 'line-clamp-6'}`}
            >
              {ABOUT_TEXT}
            </p>
            <button
              type="button"
              onClick={() => setShowFullAbout(prev => !prev)}
              className="mt-2 text-[#d9531e] font-bold text-sm font-body"
            >
              {showFullAbout ? 'कमी दाखवा' : 'अधिक दाखवा'}
            </button>
          </div>

          {/* Right Image Container */}
          <div className="w-full relative">
            {aboutImage ? (
              <>
                <img
                  src={imageUrl(aboutImage.imageUrl)}
                  alt="संस्थेचा फोटो"
                  className="w-full aspect-[4/3] object-cover rounded-2xl shadow-sm"
                />
                {isAdmin && (
                  <div className="absolute top-3 right-3 flex gap-2 z-20">
                    <button
                      type="button"
                      onClick={() => document.getElementById('about-page-photo-input')?.click()}
                      className="p-2 bg-white/90 hover:bg-white text-maroon rounded-full shadow-md transition-transform active:scale-95"
                      title="फोटो बदला"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={handleAboutDelete}
                      className="p-2 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-md transition-transform active:scale-95"
                      title="फोटो हटवा"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <ImagePlaceholder
                aspectRatio="aspect-[4/3]"
                label="संस्थेचा फोटो अपलोड करा"
                className="w-full shadow-sm rounded-2xl"
                onFileSelect={handleAboutUpload}
              />
            )}
            <input
              id="about-page-photo-input"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAboutUpload(file);
                e.target.value = '';
              }}
            />
          </div>

        </div>
      </section>

      <section className="w-full px-4 max-w-6xl mx-auto section-gap-top pb-8">
        <h2
          className="text-center text-xl md:text-2xl font-extrabold text-[#d9531e] mb-6"
          style={{ fontFamily: "'Baloo 2', sans-serif" }}
        >
          कार्यकारणी
        </h2>

        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {(showAllMembers ? committeeMembers : committeeMembers.slice(0, 4)).map((member) => (
            <div
              key={`${member.role}-${member.name}`}
              className="bg-white rounded-2xl border border-amber-200/60 shadow-soft px-2.5 py-3 flex items-center gap-3"
            >
              <img
                src={member.photo}
                alt={member.name}
                className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover object-top border border-amber-100 shrink-0"
              />
              <div className="min-w-0 flex-1">
                <p className="text-[#d9531e] text-xs md:text-sm font-bold leading-tight" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                  {member.role}
                </p>
                <p className="text-charcoal text-xs md:text-sm font-bold leading-tight mt-0.5">
                  {member.name}
                </p>
                <p className="text-charcoal/50 text-[10px] md:text-xs mt-0.5">
                  ({member.place})
                </p>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => setShowAllMembers(prev => !prev)}
          className="mt-6 w-full py-3 rounded-full border border-[#d9531e]/40 text-[#d9531e] font-bold text-sm bg-white/70 hover:bg-white transition-colors"
          style={{ fontFamily: "'Baloo 2', sans-serif" }}
        >
          {showAllMembers ? 'कमी दाखवा !' : 'अधिक दाखवा !'}
        </button>
      </section>

      <ConfirmModal state={confirmState} onClose={closeConfirm} />
    </div>
  );
};

export default AboutPage;
