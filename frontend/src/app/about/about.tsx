import React, { useState, useEffect } from 'react';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import ConfirmModal, { type ConfirmState } from '../../components/ConfirmModal';
import { Pencil, Trash2 } from 'lucide-react';
import { uploadImage, imageUrl, deleteImage, fetchByCategory, type GalleryImage } from '../../services/galleryApi';
import { useAuth } from '../../context/AuthContext';

export const AboutPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [aboutImage, setAboutImage] = useState<GalleryImage | null>(null);

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
    <div className="flex flex-col w-full pb-8">
      {/* About Us Card Section */}
      <section className="w-full px-4 py-8 max-w-6xl mx-auto">
        <div className="bg-white rounded-3xl border border-amber-200/60 shadow-soft p-6 md:p-10 grid grid-cols-2 gap-4 md:gap-10 items-center">
          <div className="flex flex-col items-start justify-center">
            <h2 className="text-2xl md:text-3xl font-extrabold text-[#d9531e]" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              आमच्याबद्दल
            </h2>
            <div className="w-12 h-1 bg-[#d9531e] rounded-full mt-2 mb-4" />
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

      <ConfirmModal state={confirmState} onClose={closeConfirm} />
    </div>
  );
};

export default AboutPage;
