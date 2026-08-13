import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { fetchByCategory, imageUrl, type GalleryImage } from '../../services/galleryApi';

export const ActivitiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [activities, setActivities] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchByCategory('initiative')
      .then(images => {
        const sorted = [...images].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
        setActivities(sorted);
      })
      .catch(err => console.error('Error fetching activities:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-8">
      {/* Header with back button */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate('/')}
          className="p-2 rounded-full bg-cream hover:bg-cream-dark/30 text-maroon transition-colors"
          title="मागे जा"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-maroon" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
            सर्व उपक्रम आणि उपक्रम
          </h1>
          <p className="text-xs md:text-sm text-charcoal/70">
            संस्थेच्या सर्व सामाजिक, शैक्षणिक आणि सेवाभावी उपक्रमांची यादी
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-charcoal/50">लोड होत आहे...</div>
      ) : activities.length === 0 ? (
        <div className="text-center py-12 text-charcoal/50">अद्याप कोणतेही उपक्रम उपलब्ध नाहीत.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {activities.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-card border border-maroon/5 shadow-soft hover:shadow-md transition-all duration-300 flex flex-col overflow-hidden"
            >
              <img
                src={imageUrl(item.imageUrl)}
                alt={item.title || 'उपक्रम'}
                className="w-full aspect-video object-cover"
              />
              <div className="p-4 flex flex-col flex-1 gap-2">
                <h3 className="text-lg font-bold text-maroon leading-tight" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                  {item.title || 'उपक्रम'}
                </h3>
                {item.description && (
                  <p className="text-sm text-charcoal/80 font-body leading-relaxed flex-1">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivitiesPage;
