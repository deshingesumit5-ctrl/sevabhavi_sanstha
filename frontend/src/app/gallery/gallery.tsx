import React, { useState } from 'react';
import ImagePlaceholder from '../../components/ImagePlaceholder';

export const GalleryPage: React.FC = () => {
  const categories = [
    { id: 'all', label: 'सर्व (All)' },
    { id: 'bus', label: 'मोफत बस सेवा' },
    { id: 'blood', label: 'रक्तदान शिबिर' },
    { id: 'env', label: 'पर्यावरण संवर्धन' },
    { id: 'edu', label: 'शैक्षणिक मदत' },
  ];

  const [activeTab, setActiveTab] = useState('all');

  // Generate placeholder elements based on active category
  const getPhotos = () => {
    switch (activeTab) {
      case 'bus':
        return [
          { label: 'बस सेवा उद्घाटन फोटो १' },
          { label: 'प्रवासी निरोप समारंभ फोटो २' },
          { label: 'बस प्रवास प्रवास अनुभव फोटो ३' },
        ];
      case 'blood':
        return [
          { label: 'रक्तदान शिबिर बॅनर फोटो १' },
          { label: 'रक्तदाते सन्मान फोटो २' },
          { label: 'डॉक्टर्स आणि स्वयंसेवक टीम फोटो ३' },
          { label: 'रक्त गोळा करणे फोटो ४' },
        ];
      case 'env':
        return [
          { label: 'वृक्षारोपण शुभारंभ फोटो १' },
          { label: 'झाडे लावताना फोटो २' },
          { label: 'पर्यावरण दिंडी फोटो ३' },
        ];
      case 'edu':
        return [
          { label: 'साहित्य वाटप फोटो १' },
          { label: 'विद्यार्थी सत्कार फोटो २' },
          { label: 'पालक मेळावा फोटो ३' },
          { label: 'शाळा समिती भेटी फोटो ४' },
        ];
      default: // all
        return [
          { label: 'मोफत बस सेवा उद्घाटन फोटो' },
          { label: 'रक्तदान शिबिर प्रमुख अतिथी फोटो' },
          { label: 'पर्यावरण संवर्धन वृक्षारोपण फोटो' },
          { label: 'शैक्षणिक साहित्य वाटप कार्यक्रम' },
          { label: 'वार्षिक स्नेहसंमेलन सोहळा फोटो' },
          { label: 'कोकण मेळावा पुणे आयोजन फोटो' },
        ];
    }
  };

  const photos = getPhotos();

  return (
    <div className="flex flex-col w-full pb-8">
      {/* 1. Header Banner */}
      <section className="relative w-full overflow-hidden bg-cream-dark/20 p-2 md:p-4">
        <div className="relative rounded-card-lg overflow-hidden shadow-soft">
          <ImagePlaceholder 
            aspectRatio="aspect-[16/9] md:aspect-[21/9]" 
            label="गॅलरी मुख्य फोटो अपलोड करा"
            className="w-full min-h-[150px] sm:min-h-[220px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-maroon/80 to-transparent flex items-end p-6 z-10">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white font-heading m-0">
              फोटो गॅलरी 
            </h1>
          </div>
        </div>
      </section>

      {/* 2. Category Tabs */}
      <section className="w-full px-4 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none justify-start md:justify-center">
          {categories.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-full font-bold text-xs md:text-sm whitespace-nowrap transition-all duration-300 ${
                activeTab === tab.id
                  ? 'bg-saffron text-white shadow-md shadow-saffron/20'
                  : 'bg-white text-charcoal/80 border border-maroon/10 hover:border-saffron hover:text-saffron'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Photo Placeholders Grid */}
      <section className="w-full px-4 max-w-6xl mx-auto">
        <div className="bg-white rounded-card-lg border border-maroon/5 shadow-soft p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {photos.map((photo, idx) => (
              <div 
                key={idx} 
                className="group flex flex-col bg-cream/10 border border-maroon/5 rounded-card overflow-hidden hover:shadow-md hover:border-saffron/20 transition-all duration-300"
              >
                {/* Upload Placeholder */}
                <ImagePlaceholder 
                  aspectRatio="aspect-[4/3]" 
                  label={photo.label} 
                  className="rounded-b-none border-0 bg-transparent group-hover:bg-[#f4ebd9]/35" 
                />
                
                {/* Image Label Overlay info */}
                <div className="p-3 bg-white border-t border-maroon/5">
                  <span className="text-[11.5px] font-bold text-charcoal/70 group-hover:text-saffron transition-colors">
                    {photo.label}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {photos.length === 0 && (
            <div className="text-center py-12">
              <p className="text-sm font-semibold text-charcoal/50">या गॅलरी श्रेणीत कोणतेही फोटो नाहीत.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default GalleryPage;
