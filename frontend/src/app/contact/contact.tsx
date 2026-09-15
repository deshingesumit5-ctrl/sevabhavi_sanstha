import React, { useState, useEffect } from 'react';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import ConfirmModal, { type ConfirmState } from '../../components/ConfirmModal';
import { Phone, Mail, MapPin, Send, Pencil, Trash2, CheckCircle2 } from 'lucide-react';
import { uploadImage, imageUrl, deleteImage, fetchByCategory, type GalleryImage } from '../../services/galleryApi';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const ContactPage: React.FC = () => {
  const { isAdmin } = useAuth();

  const [heroImage, setHeroImage] = useState<GalleryImage | null>(null);
  const [mapImage, setMapImage] = useState<GalleryImage | null>(null);
  const HERO_SECTION_KEY = 'contact_us_banner';
  const MAP_SECTION_KEY = 'contact_us_map';
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [confirmState, setConfirmState] = useState<ConfirmState>({ open: false, message: '', onConfirm: () => { } });
  const closeConfirm = () => setConfirmState(prev => ({ ...prev, open: false }));
  const askConfirm = (message: string, onConfirm: () => void) => setConfirmState({ open: true, message, onConfirm });

  useEffect(() => {
    fetchByCategory('banner')
      .then(images => {
        setHeroImage(images.find(img => img.sectionKey === HERO_SECTION_KEY) ?? null);
        setMapImage(images.find(img => img.sectionKey === MAP_SECTION_KEY) ?? null);
      })
      .catch(err => console.error('Error loading banners:', err));
  }, []);

  const handleHeroUpload = async (file: File) => {
    try {
      const uploaded = await uploadImage({ file, category: 'banner', sectionKey: HERO_SECTION_KEY });
      setHeroImage(uploaded);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleHeroDelete = async () => {
    if (!heroImage) return;
    askConfirm('बॅनर फोटो हटवायचा आहे का?', async () => {
      try {
        await deleteImage(heroImage.id);
        setHeroImage(null);
      } catch (err) {
        alert((err as Error).message);
      }
    });
  };

  const handleMapUpload = async (file: File) => {
    try {
      const uploaded = await uploadImage({ file, category: 'banner', sectionKey: MAP_SECTION_KEY });
      setMapImage(uploaded);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleMapDelete = async () => {
    if (!mapImage) return;
    askConfirm('नकाशा फोटो हटवायचा आहे का?', async () => {
      try {
        await deleteImage(mapImage.id);
        setMapImage(null);
      } catch (err) {
        alert((err as Error).message);
      }
    });
  };

  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    message: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    let val = value;
    if (name === 'mobile') {
      val = value.replace(/[^0-9]/g, '').slice(0, 10);
    }
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.mobile.trim() || !formData.message.trim()) {
      alert('कृपया सर्व आवश्यक माहिती भरा.');
      return;
    }

    // Validate mobile (exactly 10 digits)
    const mobileRegex = /^\d{10}$/;
    if (!mobileRegex.test(formData.mobile)) {
      alert('कृपया वैध १० अंकी मोबाईल क्रमांक प्रविष्ट करा.');
      return;
    }

    // Validate email (if provided)
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        alert('कृपया वैध ईमेल पत्ता प्रविष्ट करा.');
        return;
      }
    }
    try {
      setIsSubmitting(true);
      await api.submitInquiry(formData);
      setShowSuccessModal(true);
      setFormData({ name: '', mobile: '', email: '', message: '' });
    } catch (err) {
      console.error('Error submitting inquiry:', err);
      alert('संदेश पाठवताना त्रुटी आली. कृपया पुन्हा प्रयत्न करा.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* 1. Header Banner */}
      <section className="relative w-full overflow-hidden bg-cream-dark/20 p-2 md:p-4 section-gap-top">
        <div className="relative rounded-card-lg overflow-hidden shadow-soft">
          {heroImage ? (
            <>
              <img
                src={imageUrl(heroImage.imageUrl)}
                alt="संपर्क साधा बॅनर"
                className="w-full min-h-[140px] sm:min-h-[220px] object-cover"
              />
              {isAdmin && (
                <div className="absolute top-3 right-3 flex gap-2 z-20">
                  <button
                    type="button"
                    onClick={() => document.getElementById('contact-banner-input')?.click()}
                    className="p-2 bg-white/90 hover:bg-white text-maroon rounded-full shadow-md"
                    title="फोटो बदला"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={handleHeroDelete}
                    className="p-2 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-md"
                    title="फोटो हटवा"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <ImagePlaceholder
              aspectRatio="aspect-[16/9] md:aspect-[21/9]"
              label="संपर्क साधा मुख्य फोटो अपलोड करा"
              className="w-full min-h-[140px] sm:min-h-[220px]"
              onFileSelect={handleHeroUpload}
            />
          )}
          <input
            id="contact-banner-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleHeroUpload(file);
              e.target.value = '';
            }}
          />
        </div>
      </section>

      {/* 2. Main Grid */}
      <section className="w-full px-4 max-w-6xl mx-auto section-gap-top">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

          {/* Left Column: Details & Map */}
          <div className="space-y-6">

            {/* Info Card */}
            <div className="bg-white rounded-card-lg border border-maroon/5 shadow-soft p-6 space-y-5">
              <h2 className="text-xl font-bold text-maroon border-b border-maroon/5 pb-2" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                कार्यालयीन पत्ता व संपर्क
              </h2>

              <ul className="space-y-4 text-sm font-body">
                <li className="flex items-start gap-3">
                  <MapPin size={20} className="text-saffron shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-charcoal/90" style={{ fontFamily: "'Baloo 2', sans-serif" }}>पुणे कार्यालय पत्ता:</h4>
                    <p className="text-charcoal/70 mt-0.5 leading-relaxed">
                      आकुर्डी, पुणे
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Phone size={20} className="text-saffron shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-charcoal/90" style={{ fontFamily: "'Baloo 2', sans-serif" }}>संपर्क क्रमांक:</h4>
                    <p className="text-charcoal/70 mt-0.5 leading-relaxed">
                      9970535876 / 7350293376 / 9226743239
                    </p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <Mail size={20} className="text-saffron shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-charcoal/90" style={{ fontFamily: "'Baloo 2', sans-serif" }}>ईमेल पत्ता:</h4>
                    <p className="text-charcoal/70 mt-0.5 leading-relaxed">
                      dmsevabhavisanstha@gmail.com
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Map Placeholder Box */}
            <div className="bg-white rounded-card-lg border border-maroon/5 shadow-soft p-4 flex flex-col gap-3">
              <h3 className="text-sm font-bold text-maroon" style={{ fontFamily: "'Baloo 2', sans-serif" }}>नकाशा (Google Map Location)</h3>
              {mapImage ? (
                <div className="relative w-full h-[220px] rounded-card overflow-hidden">
                  <img
                    src={imageUrl(mapImage.imageUrl)}
                    alt="गूगल नकाशा"
                    className="w-full h-full object-cover"
                  />
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-2 z-20">
                      <button
                        type="button"
                        onClick={() => document.getElementById('contact-map-input')?.click()}
                        className="p-2 bg-white/90 hover:bg-white text-maroon rounded-full shadow-md"
                        title="फोटो बदला"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={handleMapDelete}
                        className="p-2 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-md"
                        title="फोटो हटवा"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative w-full h-[220px] rounded-card overflow-hidden">
                  <iframe
                    title="Google Map Location"
                    src="https://maps.google.com/maps?q=18.657723,73.807135&z=15&output=embed"
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-2 z-20">
                      <button
                        type="button"
                        onClick={() => document.getElementById('contact-map-input')?.click()}
                        className="p-2 bg-white/90 hover:bg-white text-maroon rounded-full shadow-md"
                        title="फोटो बदला"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  )}
                </div>
              )}
              <input
                id="contact-map-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleMapUpload(file);
                  e.target.value = '';
                }}
              />
            </div>

          </div>

          {/* Right Column: Contact Form */}
          <div className="bg-white rounded-card-lg border border-maroon/5 shadow-soft p-6 md:p-8">
            <h2 className="text-xl font-bold text-maroon border-b border-maroon/5 pb-3" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
              अभिप्राय / संदेश फॉर्म
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4 mt-6">
              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1">नाव <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="आपले पूर्ण नाव लिहा"
                  className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1">मोबाईल क्रमांक <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  required
                  maxLength={10}
                  inputMode="numeric"
                  pattern="\d*"
                  placeholder="१० अंकी मोबाईल नंबर"
                  className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1">ईमेल आयडी</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="उदा. name@example.com"
                  className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1">संदेश / विचार <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="आपला संदेश किंवा चौकशी येथे सविस्तर लिहा..."
                  className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5 resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-saffron hover:bg-saffron-dark disabled:opacity-50 text-white rounded-full font-bold text-sm md:text-base shadow-md shadow-saffron/20 hover:shadow-lg transition-all duration-300"
                >
                  <span>{isSubmitting ? 'पाठवत आहे...' : 'संदेश पाठवा (Send Message)'}</span>
                  <Send size={16} />
                </button>
              </div>
            </form>
          </div>

        </div>
      </section>

      {/* Success Modal Banner */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm">
          <div className="relative w-full max-w-sm bg-white rounded-card-lg shadow-2xl border border-maroon/10 overflow-hidden">

            {/* Top accent bar */}
            <div className="h-2 w-full bg-gradient-to-r from-maroon via-saffron to-maroon" />

            <div className="flex flex-col items-center text-center px-6 py-8 sm:px-8 sm:py-10">
              {/* Icon */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-b from-rose-50 to-rose-100 flex items-center justify-center mb-4 shadow-sm border border-maroon/10">
                <CheckCircle2 size={32} className="text-maroon" strokeWidth={2.2} />
              </div>

              <h3 className="text-lg sm:text-xl font-extrabold text-maroon mb-2" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                धन्यवाद!
              </h3>

              <p className="text-sm text-charcoal/70 leading-relaxed font-body mb-6">
                तुमचा संदेश/चौकशी अर्ज यशस्वीरित्या पाठवला गेला आहे. आम्ही लवकरच तुमच्याशी संपर्क साधू.
              </p>

              <button
                type="button"
                onClick={() => setShowSuccessModal(false)}
                className="w-full sm:w-auto px-8 py-2.5 bg-saffron hover:bg-saffron-dark text-white rounded-full font-bold text-sm shadow-md shadow-saffron/20 hover:shadow-lg transition-all duration-300"
              >
                ठीक आहे
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal state={confirmState} onClose={closeConfirm} />
    </div>
  );
};

export default ContactPage;
