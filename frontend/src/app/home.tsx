import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ImagePlaceholder from '../components/ImagePlaceholder';
import { 
  Users, 
  Calendar, 
  Droplet, 
  Sprout, 
  Image as ImageIcon,
  ArrowRight,
  TrendingUp,
  MapPin,
  Briefcase,
  ChevronRight,
  Bus,
  BookOpen
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);

  // Quick navigation items
  const quickNav = [
    { label: 'आमच्याबद्दल', icon: Users, id: 'about' },
    { label: 'सदस्य नोंदणी', icon: Calendar, id: 'member-registration' },
    { label: 'रक्तदान शिबिर', icon: Droplet, id: 'home' },
    { label: 'पर्यावरण', icon: Sprout, id: 'home' },
    { label: 'गॅलरी', icon: ImageIcon, id: 'gallery' },
  ];

  // Projects list
  const initiatives = [
    {
      title: 'मोफत बस सेवा',
      description: 'कोकण वासीयांसाठी मोफत बस सेवा.',
      icon: Bus,
      label: 'फोटो अपलोड करा'
    },
    {
      title: 'रक्तदान शिबिर',
      description: 'रक्तदान शिबिरांचे आयोजन.',
      icon: Droplet,
      label: 'फोटो अपलोड करा'
    },
    {
      title: 'पर्यावरण संवर्धन',
      description: 'झाडे लावा, पर्यावरण वाचवा.',
      icon: Sprout,
      label: 'फोटो अपलोड करा'
    },
    {
      title: 'शैक्षणिक मदत',
      description: 'विद्यार्थ्यांना शैक्षणिक साहित्य वाटप.',
      icon: BookOpen,
      label: 'फोटो अपलोड करा'
    },
  ];

  // News list
  const newsItems = [
    {
      title: 'कोकण सभेसाठी मोफत बस नियोजन यशस्वी',
      date: '२५ मे २०२४'
    },
    {
      title: 'धर्मादाय आयुक्तांतून एक प्रमाणपत्र प्राप्त',
      date: '१५ मे २०२४'
    },
    {
      title: 'पर्यावरण संवर्धन उपक्रमांतर्गत ५०० झाडे लावली',
      date: '१० मे २०२४'
    }
  ];

  return (
    <div className="flex flex-col w-full pb-6">
      
      {/* 1. Hero Section Carousel */}
      <section className="relative w-full overflow-hidden bg-cream-dark/20 p-2 md:p-4">
        <div className="relative rounded-card-lg overflow-hidden shadow-soft">
          <ImagePlaceholder 
            aspectRatio="aspect-[16/9] md:aspect-[21/9]" 
            label={`मुख्य बॅनर फोटो ${activeHeroSlide + 1} अपलोड करा (admin)`}
            className="w-full min-h-[180px] sm:min-h-[300px]"
          />
          {/* Carousel indicators */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
            {[0, 1, 2, 3].map((idx) => (
              <button
                key={idx}
                onClick={() => setActiveHeroSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  activeHeroSlide === idx ? 'bg-saffron w-6' : 'bg-white/60'
                }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. Quick Nav Row */}
      <section className="w-full px-4 py-6">
        <div className="flex items-center justify-between overflow-x-auto gap-4 py-2 scrollbar-none snap-x">
          {quickNav.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => navigate(`/${item.id === 'home' ? '' : item.id}`)}
                className="flex flex-col items-center justify-center min-w-[85px] p-3 bg-white rounded-card border border-maroon/5 shadow-soft hover:shadow-md hover:border-saffron/20 transition-all duration-300 snap-center"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-cream text-maroon mb-2 group-hover:bg-saffron/10">
                  <Icon size={20} className="stroke-[2]" />
                </div>
                <span className="text-[11px] font-bold text-center text-charcoal/80 whitespace-nowrap">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Dark Stat Strip */}
      <section className="w-full bg-[#271E17] text-white py-6 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          
          <div className="flex flex-col items-center">
            <TrendingUp size={24} className="text-saffron mb-1.5" />
            <h4 className="text-xl md:text-2xl font-bold font-heading text-saffron">२०+</h4>
            <p className="text-[11.5px] md:text-xs font-semibold text-cream/70">वर्षांचा अनुभव</p>
          </div>

          <div className="flex flex-col items-center">
            <Users size={24} className="text-saffron mb-1.5" />
            <h4 className="text-xl md:text-2xl font-bold font-heading text-saffron">५०००+</h4>
            <p className="text-[11.5px] md:text-xs font-semibold text-cream/70">समाजाची लाभार्थी</p>
          </div>

          <div className="flex flex-col items-center">
            <Briefcase size={24} className="text-saffron mb-1.5" />
            <h4 className="text-xl md:text-2xl font-bold font-heading text-saffron">१००+</h4>
            <p className="text-[11.5px] md:text-xs font-semibold text-cream/70">उपक्रम</p>
          </div>

          <div className="flex flex-col items-center">
            <MapPin size={24} className="text-saffron mb-1.5" />
            <h4 className="text-sm md:text-lg font-bold font-heading text-saffron">कोकण ते पुणे</h4>
            <p className="text-[11.5px] md:text-xs font-semibold text-cream/70">सेवा विस्तार</p>
          </div>

        </div>
      </section>

      {/* 4. About Us Preview Card */}
      <section className="w-full px-4 py-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-card-lg border border-maroon/5 shadow-soft p-6 md:p-8 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          
          {/* Left Text Content */}
          <div className="flex flex-col items-start gap-4">
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-maroon border-b-2 border-saffron pb-2 leading-tight">
              आमच्याबद्दल
            </h2>
            {/* <p className="text-sm md:text-base leading-relaxed text-charcoal/80">
              दापोली मंडणगड सेवाभावी संस्था, पुणे ही सामाजिक, शैक्षणिक, आरोग्य, पर्यावरण आणि समाज हिताच्या विविध उपक्रमांसाठी कार्यरत आहे. समाजातील प्रत्येक घटकासाठी मदतीचा हात पुढे करून, हीच आमची प्रेरणा.
            </p> */}
            <button 
              onClick={() => navigate('/about')}
              className="flex items-center gap-2 px-5 py-2.5 bg-saffron hover:bg-saffron-dark text-white rounded-full font-bold text-sm shadow-md shadow-saffron/20 hover:shadow-lg transition-all duration-300 group"
            >
              <span>संपूर्ण माहिती वाचा</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          {/* Right Image Placeholder */}
          <div className="w-full">
            <ImagePlaceholder aspectRatio="aspect-[4/3]" label="संस्थेचा फोटो अपलोड करा" className="w-full shadow-inner" />
          </div>

        </div>
      </section>

      {/* 5. Initiatives Section */}
      <section className="w-full px-4 py-8 bg-cream/30 border-y border-maroon/5">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold font-heading text-maroon">
              उपक्रम आणि उपक्रम
            </h2>
            <button 
              onClick={() => navigate('/about')} 
              className="flex items-center gap-1 text-xs md:text-sm font-bold text-maroon hover:text-saffron transition-colors border border-maroon/20 hover:border-saffron px-3 py-1.5 rounded-full"
            >
              <span>सर्व पाहा</span>
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {initiatives.map((item, idx) => {
              const CardIcon = item.icon;
              return (
                <div 
                  key={idx} 
                  className="bg-white rounded-card border border-maroon/5 shadow-soft hover:shadow-md hover:border-saffron/25 transition-all duration-300 flex flex-col overflow-hidden"
                >
                  <ImagePlaceholder aspectRatio="aspect-video" label={item.label} className="rounded-b-none" />
                  <div className="p-4 flex flex-col flex-1 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-cream text-maroon flex items-center justify-center">
                        <CardIcon size={14} className="stroke-[2.5]" />
                      </div>
                      <h3 className="text-base font-bold font-heading text-maroon leading-tight">{item.title}</h3>
                    </div>
                    <p className="text-xs text-charcoal/80 font-body leading-normal flex-1">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. CTA Banner */}
      <section className="w-full px-4 py-8 max-w-6xl mx-auto">
        <div className="bg-gradient-to-r from-saffron to-maroon text-white rounded-card-lg p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-soft-lg">
          
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-full bg-white/10 hidden md:flex items-center justify-center text-white">
              <Users size={24} className="stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-xl md:text-2xl font-bold font-heading text-white leading-tight">
                आपणही बना आमच्या सेवाकार्यातील भागीदार
              </h3>
              <p className="text-xs md:text-sm text-white/80 font-semibold mt-1">
                समाजासाठी आजच एक पाऊल पुढे टाका.
              </p>
            </div>
          </div>

          <button 
            onClick={() => navigate('/member-registration')}
            className="flex items-center gap-2 px-6 py-3 bg-[#2B1B12] hover:bg-black text-white font-bold text-sm md:text-base rounded-full shadow-lg hover:translate-y-[-2px] transition-all duration-300 shrink-0"
          >
            <span>सदस्य नोंदणी करा</span>
            <ArrowRight size={18} />
          </button>

        </div>
      </section>

      {/* 7. Latest Updates Section */}
      <section className="w-full px-4 py-8 max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold font-heading text-maroon">
            नवीन अपडेट्स
          </h2>
          <button 
            onClick={() => alert('नवीन अपडेट्स लोड होत आहेत...')} 
            className="flex items-center gap-1 text-xs md:text-sm font-bold text-maroon hover:text-saffron transition-colors border border-maroon/20 hover:border-saffron px-3 py-1.5 rounded-full"
          >
            <span>सर्व अपडेट्स पाहा</span>
            <ChevronRight size={14} />
          </button>
        </div>

        {/* Updates List */}
        <div className="space-y-4">
          {newsItems.map((item, idx) => (
            <div 
              key={idx} 
              className="flex items-center justify-between p-3 bg-white hover:bg-cream/10 rounded-card border border-maroon/5 shadow-soft hover:shadow-md transition-all duration-300 cursor-pointer group"
              onClick={() => alert(`${item.title} च्या तपशीलाकडे रीडायरेक्ट करत आहे.`)}
            >
              <div className="flex items-center gap-4">
                {/* Small Thumbnail Placeholder */}
                <div className="w-16 h-16 rounded-card overflow-hidden shrink-0">
                  <ImagePlaceholder aspectRatio="aspect-square" label="" className="w-full h-full text-[10px]" />
                </div>
                {/* News Title & Date */}
                <div className="flex flex-col gap-1.5">
                  <h4 className="text-xs md:text-sm font-bold text-charcoal/90 group-hover:text-saffron transition-colors leading-snug">
                    {item.title}
                  </h4>
                  <span className="text-[10px] md:text-xs font-semibold text-charcoal/50">
                    {item.date}
                  </span>
                </div>
              </div>
              
              {/* Arrow */}
              <div className="text-charcoal/30 group-hover:text-saffron group-hover:translate-x-1 transition-all duration-300">
                <ChevronRight size={20} />
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};

export default HomePage;
