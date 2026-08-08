import React from 'react';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import { Landmark, Compass, Award, ShieldAlert } from 'lucide-react';

export const AboutPage: React.FC = () => {
  const committeeMembers = [
  ];

  return (
    <div className="flex flex-col w-full pb-8">
      {/* 1. Hero Banner */}
      <section className="relative w-full overflow-hidden bg-cream-dark/20 p-2 md:p-4">
        <div className="relative rounded-card-lg overflow-hidden shadow-soft">
          <ImagePlaceholder 
            aspectRatio="aspect-[16/9] md:aspect-[21/9]" 
            label="आमच्याबद्दल मुख्य फोटो (२१:९)"
            className="w-full min-h-[160px] sm:min-h-[250px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-maroon/80 to-transparent flex items-end p-6 z-10">
          
          </div>
        </div>
      </section>

      {/* 2. NGO Info: History, Vision, Mission */}
      <section className="w-full px-4 py-8 max-w-6xl mx-auto space-y-8">
        
        {/* History Card */}
        <div className="bg-white rounded-card-lg border border-maroon/5 shadow-soft p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-12 h-12 rounded-full bg-cream text-maroon flex items-center justify-center shrink-0">
            <Landmark size={24} className="stroke-[2]" />
          </div>
          <div className="flex-1 space-y-3">
            <h2 className="text-xl md:text-2xl font-bold font-heading text-maroon border-b border-maroon/10 pb-1.5">
              आमचा इतिहास 
            </h2>
            {/* <p className="text-sm md:text-base leading-relaxed text-charcoal/80">
              दापोली आणि मंडणगड तालुक्यातून कामानिमित्त पुण्यामध्ये स्थायिक झालेल्या कोकणवासीयांच्या हितासाठी आणि त्यांच्या मूळ गावी विविध लोकोपयोगी उपक्रम राबवण्यासाठी या संस्थेची स्थापना करण्यात आली. गेल्या २०+ वर्षांहून अधिक काळ आम्ही विविध सामाजिक, शैक्षणिक आणि सांस्कृतिक चळवळींमध्ये हिरिरीने भाग घेत आहोत.
            </p> */}
          </div>
        </div>

        {/* Vision & Mission grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Vision */}
          <div className="bg-white rounded-card-lg border border-maroon/5 shadow-soft p-6 md:p-8 flex gap-5 items-start">
            <div className="w-11 h-11 rounded-full bg-cream text-saffron flex items-center justify-center shrink-0">
              <Compass size={22} className="stroke-[2.2]" />
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="text-lg md:text-xl font-bold font-heading text-maroon">
                दृष्टिकोन 
              </h2>
              {/* <p className="text-xs md:text-sm leading-relaxed text-charcoal/80">
                एक सशक्त, स्वावलंबी आणि सुशिक्षित समाज घडवणे हे आमचे ध्येय आहे. कोकणातील दुर्गम भागात राहणाऱ्या बांधवांसाठी शिक्षण, आरोग्य आणि रोजगाराच्या नवीन संधी निर्माण करणे.
              </p> */}
            </div>
          </div>

          {/* Mission */}
          <div className="bg-white rounded-card-lg border border-maroon/5 shadow-soft p-6 md:p-8 flex gap-5 items-start">
            <div className="w-11 h-11 rounded-full bg-cream text-saffron flex items-center justify-center shrink-0">
              <Award size={22} className="stroke-[2.2]" />
            </div>
            <div className="flex-1 space-y-2">
              <h2 className="text-lg md:text-xl font-bold font-heading text-maroon">
                ध्येय 
              </h2>
              {/* <p className="text-xs md:text-sm leading-relaxed text-charcoal/80">
                मोफत बस सेवा, आरोग्य शिबिरे, शैक्षणिक साहित्य वाटप, विवाह जुळवणी मार्गदर्शन आणि वृक्षारोपण अशा लोककल्याणकारी उपक्रमांच्या माध्यमातून तळागाळातील लोकांपर्यंत पोहोचणे.
              </p> */}
            </div>
          </div>

        </div>

      </section>

      {/* 3. Committee Members List */}
      <section className="w-full px-4 py-8 bg-cream/30 border-y border-maroon/5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-8">
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-maroon inline-block border-b-2 border-saffron pb-2">
              समिती सदस्य
            </h2>
            <p className="text-xs md:text-sm text-charcoal/60 mt-2 font-medium">
              संस्थेच्या सुचारू संचालनासाठी निस्वार्थीपणे योगदान देणारे आमचे मार्गदर्शक आणि पदाधिकारी.
            </p>
          </div>

          {/* Members Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {committeeMembers.map((member, idx) => (
              <div 
                key={idx}
                className="bg-white rounded-card border border-maroon/5 shadow-soft hover:shadow-md hover:border-saffron/20 transition-all duration-300 p-5 flex items-center gap-4"
              >
                {/* Member Profile Placeholder */}
                <div className="w-16 h-16 rounded-full overflow-hidden shrink-0 border-2 border-maroon/10">
                  <ImagePlaceholder aspectRatio="aspect-square" label="" className="w-full h-full text-[8px]" />
                </div>
                
                {/* Member Details */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold text-maroon font-heading truncate">{member.name}</h3>
                  <p className="text-xs text-saffron font-bold mt-0.5">{member.designation}</p>
                  <p className="text-xs text-charcoal/50 mt-1 font-semibold">संपर्क: {member.contact}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Committee Note Banner */}
          <div className="mt-8 bg-white/60 rounded-card p-4 border border-dashed border-maroon/20 flex items-center gap-3 max-w-3xl mx-auto">
            <ShieldAlert size={20} className="text-maroon shrink-0" />
            <p className="text-xs text-charcoal/70 leading-relaxed font-semibold">
              टीप: समिती सदस्यांशी संपर्क साधण्यासाठी दिलेल्या क्रमांकावर कार्यालयीन वेळेत (सकाळी १० ते संध्याकाळी ६) संपर्क करावा.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
};

export default AboutPage;
