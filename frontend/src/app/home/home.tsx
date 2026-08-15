import React, { useState, useEffect, useRef, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import ConfirmModal, { type ConfirmState } from '../../components/ConfirmModal';
import { Pencil, Trash2, Plus, X, CheckCircle2 as CheckCircle2Icon } from 'lucide-react';
import { uploadImage, updateImage, updateImageWithFile, imageUrl, deleteImage, fetchByCategory, type GalleryImage } from "../../services/galleryApi";
import { useAuth } from '../../context/AuthContext';

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
} from 'lucide-react';

const defaultInitiatives: {
  description: ReactNode;
  icon: any; key: string; title?: string
}[] = [];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [activeHeroSlide, setActiveHeroSlide] = useState(0);
  const [bannerImages, setBannerImages] = useState<Record<number, GalleryImage>>({});
  const [aboutImage, setAboutImage] = useState<GalleryImage | null>(null);

  // Touch swipe state for carousel
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const [confirmState, setConfirmState] = useState<ConfirmState>({ open: false, message: '', onConfirm: () => { } });
  const closeConfirm = () => setConfirmState(prev => ({ ...prev, open: false }));
  const askConfirm = (message: string, onConfirm: () => void) =>
    setConfirmState({ open: true, message, onConfirm });

  // --- Initiative / Category state ---
  const [initiativeImages, setInitiativeImages] = useState<Record<string, GalleryImage>>({});
  const [customInitiatives, setCustomInitiatives] = useState<GalleryImage[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState<{ name: string; description: string; file: File | null }>({
    name: '', description: '', file: null
  });
  const [savingCategory, setSavingCategory] = useState(false);

  // --- Edit initiative state ---
  const [editInitiative, setEditInitiative] = useState<GalleryImage | null>(null);
  const [editForm, setEditForm] = useState<{ name: string; description: string; file: File | null }>({
    name: '', description: '', file: null
  });
  const [savingEdit, setSavingEdit] = useState(false);

  // --- Updates / News state ---
  const [updates, setUpdates] = useState<GalleryImage[]>([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState<{ name: string; description: string; date: string; file: File | null }>({
    name: '', description: '', date: '', file: null
  });
  const [savingUpdate, setSavingUpdate] = useState(false);

  // --- Edit Update state ---
  const [editUpdateItem, setEditUpdateItem] = useState<GalleryImage | null>(null);
  const [editUpdateForm, setEditUpdateForm] = useState<{ name: string; description: string; date: string; file: File | null }>({
    name: '', description: '', date: '', file: null
  });
  const [savingEditUpdate, setSavingEditUpdate] = useState(false);

  const loadInitiatives = () => {
    fetchByCategory('initiative')
      .then(images => {
        const fixedKeys = defaultInitiatives.map(d => d.key);
        const map: Record<string, GalleryImage> = {};
        images.forEach(img => {
          if (img.sectionKey && fixedKeys.includes(img.sectionKey)) map[img.sectionKey] = img;
        });
        setInitiativeImages(map);

        const custom = images
          .filter(img => !img.sectionKey || !fixedKeys.includes(img.sectionKey))
          .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
        setCustomInitiatives(custom);
      })
      .catch(err => console.error('Error loading initiatives:', err));
  };

  const loadUpdates = () => {
    fetchByCategory('updates')
      .then(images => {
        const sorted = [...images].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
        setUpdates(sorted);
      })
      .catch(err => console.error('Error loading updates:', err));
  };

  useEffect(() => {
    fetchByCategory('banner')
      .then(images => {
        const map: Record<number, GalleryImage> = {};
        [0, 1, 2, 3].forEach(idx => {
          const img = images.find(i => i.sectionKey === `home_banner_${idx + 1}`);
          if (img) map[idx] = img;
        });
        setBannerImages(map);
      })
      .catch(err => console.error('Error loading home banners:', err));

    fetchByCategory('about')
      .then(images => setAboutImage(images.find(img => img.sectionKey === 'about_us_photo') ?? null))
      .catch(err => console.error('Error loading about image:', err));

    loadInitiatives();
    loadUpdates();
  }, []);

  // --- Carousel touch handlers ---
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // swipe left → next banner
        setActiveHeroSlide(prev => (prev + 1) % 4);
      } else {
        // swipe right → prev banner
        setActiveHeroSlide(prev => (prev - 1 + 4) % 4);
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  // --- Initiative handlers ---
  const handleInitiativeUpload = async (file: File, sectionKey: string) => {
    try {
      const uploaded = await uploadImage({ file, category: 'initiative', sectionKey });
      setInitiativeImages(prev => ({ ...prev, [sectionKey]: uploaded }));
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleInitiativeDelete = (sectionKey: string) => {
    const img = initiativeImages[sectionKey];
    if (!img) return;
    askConfirm('हा फोटो हटवायचा आहे का?', async () => {
      try {
        await deleteImage(img.id);
        setInitiativeImages(prev => {
          const next = { ...prev };
          delete next[sectionKey];
          return next;
        });
      } catch (err) {
        alert((err as Error).message);
      }
    });
  };

  const handleCustomDelete = (img: GalleryImage) => {
    askConfirm('हा उपक्रम हटवायचा आहे का?', async () => {
      try {
        await deleteImage(img.id);
        setCustomInitiatives(prev => prev.filter(i => i.id !== img.id));
      } catch (err) {
        alert((err as Error).message);
      }
    });
  };

  const openEditModal = (img: GalleryImage) => {
    setEditInitiative(img);
    setEditForm({ name: img.title || '', description: img.description || '', file: null });
  };

  const handleSaveEdit = async () => {
    if (!editInitiative) return;
    if (!editForm.name.trim()) {
      alert('नाव आवश्यक आहे');
      return;
    }
    setSavingEdit(true);
    try {
      let updated: GalleryImage;
      if (editForm.file) {
        // Replace image + metadata
        updated = await updateImageWithFile(editInitiative.id, {
          file: editForm.file,
          title: editForm.name.trim(),
          description: editForm.description.trim(),
          category: 'initiative',
          sectionKey: editInitiative.sectionKey,
        });
      } else {
        // Re-upload with original file if needed or update metadata
        updated = await updateImage(editInitiative.id, {
          title: editForm.name.trim(),
          description: editForm.description.trim()
        });
      }
      setCustomInitiatives(prev => prev.map(i => i.id === editInitiative.id ? updated : i));
      setEditInitiative(null);
      setEditForm({ name: '', description: '', file: null });
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSavingEdit(false);
    }
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim() || !categoryForm.file) {
      alert('नाव आणि फोटो आवश्यक आहेत');
      return;
    }
    setSavingCategory(true);
    try {
      const uploaded = await uploadImage({
        file: categoryForm.file,
        category: 'initiative',
        sectionKey: `custom_${Date.now()}`,
        title: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
      });
      setCustomInitiatives(prev => [uploaded, ...prev]);
      setCategoryForm({ name: '', description: '', file: null });
      setShowCategoryModal(false);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSavingCategory(false);
    }
  };

  // --- Banner handlers ---
  const handleBannerUpload = async (file: File, slideIdx: number) => {
    try {
      const uploaded = await uploadImage({
        file,
        category: 'banner',
        sectionKey: `home_banner_${slideIdx + 1}`,
      });
      setBannerImages(prev => ({ ...prev, [slideIdx]: uploaded }));
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleBannerDelete = (slideIdx: number) => {
    const img = bannerImages[slideIdx];
    if (!img) return;
    askConfirm('बॅनर फोटो हटवायचा आहे का?', async () => {
      try {
        await deleteImage(img.id);
        setBannerImages(prev => {
          const next = { ...prev };
          delete next[slideIdx];
          return next;
        });
      } catch (err) {
        alert((err as Error).message);
      }
    });
  };

  const handleAboutUpload = async (file: File) => {
    try {
      const uploaded = await uploadImage({ file, category: 'about', sectionKey: 'about_us_photo' });
      setAboutImage(uploaded);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleAboutDelete = () => {
    if (!aboutImage) return;
    askConfirm('फोटो हटवायचा आहे का?', async () => {
      try {
        await deleteImage(aboutImage.id);
        setAboutImage(null);
      } catch (err) {
        alert((err as Error).message);
      }
    });
  };

  // --- Updates handlers ---
  const handleSaveUpdate = async () => {
    if (!updateForm.name.trim() || !updateForm.file) {
      alert('कृपया अपडेटचे नाव आणि फोटो निवडा.');
      return;
    }
    setSavingUpdate(true);
    try {
      const dateStr = updateForm.date.trim() || new Date().toISOString().split('T')[0];
      const uploaded = await uploadImage({
        file: updateForm.file,
        category: 'updates',
        sectionKey: dateStr,
        title: updateForm.name.trim(),
        description: updateForm.description.trim(),
      });
      setUpdates(prev => [uploaded, ...prev]);
      setUpdateForm({ name: '', description: '', date: '', file: null });
      setShowUpdateModal(false);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSavingUpdate(false);
    }
  };

  const openEditUpdateModal = (img: GalleryImage) => {
    setEditUpdateItem(img);
    setEditUpdateForm({
      name: img.title || '',
      description: img.description || '',
      date: img.sectionKey || '',
      file: null,
    });
  };

  const handleSaveEditUpdate = async () => {
    if (!editUpdateItem) return;
    if (!editUpdateForm.name.trim()) {
      alert('कृपया अपडेटचे नाव द्या.');
      return;
    }
    setSavingEditUpdate(true);
    try {
      let updated: GalleryImage;
      const dateStr = editUpdateForm.date.trim() || editUpdateItem.sectionKey || new Date().toISOString().split('T')[0];
      if (editUpdateForm.file) {
        updated = await updateImageWithFile(editUpdateItem.id, {
          file: editUpdateForm.file,
          title: editUpdateForm.name.trim(),
          description: editUpdateForm.description.trim(),
          category: 'updates',
          sectionKey: dateStr,
        });
      } else {
        updated = await updateImage(editUpdateItem.id, {
          title: editUpdateForm.name.trim(),
          description: editUpdateForm.description.trim(),
          date: dateStr,
        });
      }
      setUpdates(prev => prev.map(u => u.id === editUpdateItem.id ? updated : u));
      setEditUpdateItem(null);
      setEditUpdateForm({ name: '', description: '', date: '', file: null });
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSavingEditUpdate(false);
    }
  };

  const handleUpdateDelete = (img: GalleryImage) => {
    askConfirm('हा अपडेट हटवायचा आहे का?', async () => {
      try {
        await deleteImage(img.id);
        setUpdates(prev => prev.filter(u => u.id !== img.id));
      } catch (err) {
        alert((err as Error).message);
      }
    });
  };

  // Quick navigation items
  const quickNav = [
    { label: 'आमच्याबद्दल', icon: Users, path: '/about' },
    { label: 'सदस्य नोंदणी', icon: Calendar, path: '/member-registration' },
    { label: 'रक्तदान शिबिर', icon: Droplet, path: '/gallery?category=blood' },
    { label: 'पर्यावरण संवर्धन', icon: Sprout, path: '/gallery?category=env' },
    { label: 'गॅलरी', icon: ImageIcon, path: '/gallery' },
  ];

  const formatUpdateDate = (sectionKey?: string) => {
    if (!sectionKey) return '';
    try {
      const d = new Date(sectionKey);
      if (isNaN(d.getTime())) return sectionKey;
      return d.toLocaleDateString('mr-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return sectionKey;
    }
  };

  return (
    <div className="flex flex-col w-full">

      {/* 1. Hero Section Carousel */}
      <section className="relative w-full overflow-hidden bg-cream-dark/20 p-2 md:p-4">
        <div
          className="relative rounded-card-lg overflow-hidden shadow-soft select-none cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {bannerImages[activeHeroSlide] ? (
            <>
              <img
                src={imageUrl(bannerImages[activeHeroSlide].imageUrl)}
                alt={`मुख्य बॅनर ${activeHeroSlide + 1}`}
                className="w-full min-h-[180px] sm:min-h-[300px] object-cover transition-opacity duration-300"
              />
              {isAdmin && (
                <div className="absolute top-3 right-3 flex gap-2 z-20">
                  <button
                    type="button"
                    onClick={() => document.getElementById(`home-banner-input-${activeHeroSlide}`)?.click()}
                    className="p-2 bg-white/90 hover:bg-white text-maroon rounded-full shadow-md"
                    title="फोटो बदला"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBannerDelete(activeHeroSlide)}
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
              label={`मुख्य बॅनर फोटो ${activeHeroSlide + 1} अपलोड करा (admin)`}
              className="w-full min-h-[180px] sm:min-h-[300px]"
              onFileSelect={(file) => handleBannerUpload(file, activeHeroSlide)}
            />
          )}
          <input
            id={`home-banner-input-${activeHeroSlide}`}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleBannerUpload(file, activeHeroSlide);
              e.target.value = '';
            }}
          />
          {/* Carousel indicators (4 dots) */}
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 z-10">
            {[0, 1, 2, 3].map((idx) => (
              <button
                key={idx}
                onClick={() => setActiveHeroSlide(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${activeHeroSlide === idx ? 'bg-saffron w-6' : 'bg-white/60'
                  }`}
                aria-label={`Slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 2. Quick Nav Row */}
      <section className="w-full px-4 section-gap-top">
        <div className="flex items-center justify-between overflow-x-auto gap-4 py-2 scrollbar-none snap-x">
          {quickNav.map((item, idx) => {
            const Icon = item.icon;
            return (
              <button
                key={idx}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center min-w-[85px] p-3 bg-white rounded-card border border-maroon/5 shadow-soft hover:shadow-md hover:border-saffron/20 transition-all duration-300 snap-center font-body"
              >
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-cream text-maroon mb-2 group-hover:bg-saffron/10">
                  <Icon size={20} className="stroke-[2]" />
                </div>
                <span className="text-[11px] font-bold text-center text-charcoal/80 whitespace-nowrap font-body">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. Dark Stat Strip */}
      <section className="w-full bg-[#271E17] text-white py-5 px-2 sm:px-4 section-gap-top">
        <div className="max-w-6xl mx-auto grid grid-cols-4 divide-x divide-white/10 text-center items-center">

          <div className="flex flex-col items-center px-1 sm:px-3">
            <TrendingUp className="text-saffron mb-1 w-5 h-5 sm:w-6 sm:h-6" />
            <h4 className="font-heading text-sm sm:text-xl md:text-2xl font-bold text-saffron whitespace-nowrap">२०+</h4>
            <p className="text-[10px] sm:text-[11.5px] md:text-xs font-semibold text-cream/70 leading-tight font-body">वर्षांचा अनुभव</p>
          </div>

          <div className="flex flex-col items-center px-1 sm:px-3">
            <Users className="text-saffron mb-1 w-5 h-5 sm:w-6 sm:h-6" />
            <h4 className="font-heading text-sm sm:text-xl md:text-2xl font-bold text-saffron whitespace-nowrap">५०००+</h4>
            <p className="text-[10px] sm:text-[11.5px] md:text-xs font-semibold text-cream/70 leading-tight font-body">समाजाची लाभार्थी</p>
          </div>

          <div className="flex flex-col items-center px-1 sm:px-3">
            <Briefcase className="text-saffron mb-1 w-5 h-5 sm:w-6 sm:h-6" />
            <h4 className="font-heading text-sm sm:text-xl md:text-2xl font-bold text-saffron whitespace-nowrap">१००+</h4>
            <p className="text-[10px] sm:text-[11.5px] md:text-xs font-semibold text-cream/70 leading-tight font-body">उपक्रम</p>
          </div>

          <div className="flex flex-col items-center px-1 sm:px-3">
            <MapPin className="text-saffron mb-1 w-5 h-5 sm:w-6 sm:h-6" />
            <h4 className="font-heading text-[11px] sm:text-base md:text-lg font-bold text-saffron whitespace-nowrap">कोकण ते पुणे</h4>
            <p className="text-[10px] sm:text-[11.5px] md:text-xs font-semibold text-cream/70 leading-tight font-body">सेवा विस्तार</p>
          </div>

        </div>
      </section>

      {/* 4. About Us Preview Card */}
      <section className="w-full px-4 max-w-6xl mx-auto section-gap-top">
        <div className="bg-white rounded-3xl border border-amber-200/60 shadow-soft p-6 md:p-8 grid grid-cols-2 gap-4 md:gap-8 items-center">

          {/* Left Text Content */}
          <div className="flex flex-col items-start justify-center">
            <h2 className="font-heading text-2xl md:text-3xl font-extrabold text-[#d9531e]">
              आमच्याबद्दल
            </h2>
            <div className="w-12 h-1 bg-[#d9531e] rounded-full mt-2 mb-4" />

            <button
              onClick={() => navigate('/about')}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-[#d9531e] hover:bg-[#b84315] text-white rounded-xl font-bold text-[10px] sm:text-sm shadow-md transition-all group font-body whitespace-nowrap"
            >
              <span className="font-body whitespace-nowrap">संपूर्ण माहिती वाचा</span>
              <ArrowRight size={16} className="shrink-0 group-hover:translate-x-1 transition-transform" />
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
                      onClick={() => document.getElementById('about-photo-input')?.click()}
                      className="p-2 bg-white/90 hover:bg-white text-maroon rounded-full shadow-md"
                      title="फोटो बदला"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={handleAboutDelete}
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
                aspectRatio="aspect-[4/3]"
                label="संस्थेचा फोटो अपलोड करा"
                className="w-full shadow-sm rounded-2xl"
                onFileSelect={handleAboutUpload}
              />
            )}
            <input
              id="about-photo-input"
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

      {/* 5. Initiatives Section */}
      <section className="w-full px-4 py-8 bg-cream/30 border-y border-maroon/5">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 gap-3">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-maroon">
              आमचे उपक्रम
            </h2>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <button
                  onClick={() => setShowCategoryModal(true)}
                  className="flex items-center gap-1 text-xs md:text-sm font-bold text-white bg-saffron hover:bg-saffron-dark transition-colors px-3 py-1.5 rounded-full shadow-sm font-body"
                >
                  <Plus size={14} />
                  <span className="font-body">Category जोडा</span>
                </button>
              )}
              {/* Takes to /activities (activities only, NOT about us) */}
              <button
                onClick={() => navigate('/activities')}
                className="flex items-center gap-1 text-xs md:text-sm font-bold text-maroon hover:text-saffron transition-colors border border-maroon/20 hover:border-saffron px-3 py-1.5 rounded-full font-body"
              >
                <span className="font-body">सर्व पाहा</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-none snap-x sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:pb-0">
            {/* Custom (admin-added) categories — most recent first */}
            {customInitiatives.map((img) => (
              <div
                key={img.id}
                className="flex-none w-[240px] sm:w-auto snap-center relative bg-white rounded-card border border-maroon/5 shadow-soft hover:shadow-md hover:border-saffron/25 transition-all duration-300 flex flex-col overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={imageUrl(img.imageUrl)}
                    alt={img.title || 'उपक्रम'}
                    className="w-full aspect-video object-cover"
                  />
                  {isAdmin && (
                    <div className="absolute top-2 right-2 flex gap-1.5">
                      {/* Edit icon beside delete button */}
                      <button
                        type="button"
                        onClick={() => openEditModal(img)}
                        className="p-2 bg-white/90 hover:bg-white text-maroon rounded-full shadow-md"
                        title="संपादित करा"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleCustomDelete(img)}
                        className="p-2 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-md"
                        title="हटवा"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col flex-1 gap-2">
                  <h3 className="font-heading text-base font-bold text-maroon leading-tight">{img.title}</h3>
                  {img.description && (
                    <p className="text-xs text-charcoal/80 font-body leading-normal flex-1">{img.description}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Fixed default categories */}
            {defaultInitiatives.map((item) => {
              const CardIcon = item.icon;
              const img = initiativeImages[item.key];
              return (
                <div
                  key={item.key}
                  className="flex-none w-[240px] sm:w-auto snap-center bg-white rounded-card border border-maroon/5 shadow-soft hover:shadow-md hover:border-saffron/25 transition-all duration-300 flex flex-col overflow-hidden"
                >
                  <div className="relative">
                    {img ? (
                      <>
                        <img
                          src={imageUrl(img.imageUrl)}
                          alt={item.title}
                          className="w-full aspect-video object-cover"
                        />
                        {isAdmin && (
                          <div className="absolute top-2 right-2 flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => document.getElementById(`initiative-input-${item.key}`)?.click()}
                              className="p-2 bg-white/90 hover:bg-white text-maroon rounded-full shadow-md"
                              title="फोटो बदला"
                            >
                              <Pencil size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleInitiativeDelete(item.key)}
                              className="p-2 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-md"
                              title="फोटो हटवा"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </>
                    ) : (
                      <ImagePlaceholder
                        aspectRatio="aspect-video"
                        label="फोटो अपलोड करा"
                        className="rounded-b-none"
                        onFileSelect={(file) => handleInitiativeUpload(file, item.key)}
                      />
                    )}
                    <input
                      id={`initiative-input-${item.key}`}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleInitiativeUpload(file, item.key);
                        e.target.value = '';
                      }}
                    />
                  </div>
                  <div className="p-4 flex flex-col flex-1 gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-cream text-maroon flex items-center justify-center">
                        <CardIcon size={14} className="stroke-[2.5]" />
                      </div>
                      <h3 className="font-heading text-base font-bold text-maroon leading-tight">{item.title}</h3>
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
      <section className="w-full px-4 max-w-6xl mx-auto section-gap-top">
        <div className="bg-gradient-to-r from-saffron to-maroon text-white rounded-card-lg p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-soft-lg">

          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-full bg-white/10 hidden md:flex items-center justify-center text-white">
              <Users size={24} className="stroke-[2.2]" />
            </div>
            <div>
              <h3 className="font-heading text-xl md:text-2xl font-bold text-white leading-tight">
                आपणही बना आमच्या सेवाकार्यातील भागीदार
              </h3>
              <p className="text-xs md:text-sm text-white/80 font-semibold mt-1 font-body">
                समाजासाठी आजच एक पाऊल पुढे टाका.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate('/member-registration')}
            className="flex items-center gap-2 px-6 py-3 bg-[#2B1B12] hover:bg-black text-white font-bold text-sm md:text-base rounded-full shadow-lg hover:translate-y-[-2px] transition-all duration-300 shrink-0 font-body"
          >
            <span className="font-body">सदस्य नोंदणी करा</span>
            <ArrowRight size={18} />
          </button>

        </div>
      </section>

      {/* 7. Latest Updates Section */}
      <section className="w-full px-4 max-w-6xl mx-auto section-gap-top">
        <div className="flex items-center justify-between mb-6 gap-3">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-maroon">
            नवीन अपडेट्स
          </h2>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={() => setShowUpdateModal(true)}
                className="flex items-center gap-1 text-xs md:text-sm font-bold text-white bg-saffron hover:bg-saffron-dark transition-colors px-3 py-1.5 rounded-full shadow-sm font-body"
              >
                <Plus size={14} />
                <span className="font-body">नवीन Updates जोडा</span>
              </button>
            )}
            {/* Takes to /updates (shows all updates only) */}
            <button
              onClick={() => navigate('/updates')}
              className="flex items-center gap-1 text-xs md:text-sm font-bold text-maroon hover:text-saffron transition-colors border border-maroon/20 hover:border-saffron px-3 py-1.5 rounded-full font-body"
            >
              <span className="font-body">सर्व अपडेट्स पाहा</span>
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Updates List */}
        <div className="space-y-3">
          {updates.length === 0 && (
            <p className="text-sm text-charcoal/50 text-center py-6 font-body">अद्याप कोणते अपडेट्स नाहीत.</p>
          )}
          {updates.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-white hover:bg-cream/10 rounded-card border border-maroon/5 shadow-soft hover:shadow-md transition-all duration-300 cursor-pointer group"
              onClick={() => navigate('/updates')}
            >
              <div className="flex items-center gap-4">
                {/* Thumbnail */}
                <div className="w-16 h-16 rounded-card overflow-hidden shrink-0 bg-cream">
                  <img
                    src={imageUrl(item.imageUrl)}
                    alt={item.title || 'अपडेट'}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Title & Date */}
                <div className="flex flex-col gap-1">
                  <h4 className="font-heading text-xs md:text-sm font-bold text-charcoal/90 group-hover:text-saffron transition-colors leading-snug">
                    {item.title}
                  </h4>
                  <span className="text-[10px] md:text-xs font-semibold text-charcoal/50 font-body">
                    {formatUpdateDate(item.sectionKey)}
                  </span>
                </div>
              </div>

              {/* Admin edit & delete + Arrow */}
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); openEditUpdateModal(item); }}
                      className="p-1.5 bg-white/90 hover:bg-white text-maroon rounded-full shadow-sm hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                      title="संपादित करा"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleUpdateDelete(item); }}
                      className="p-1.5 bg-white/90 hover:bg-white text-red-500 rounded-full shadow-sm hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                      title="हटवा"
                    >
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
                <div className="text-charcoal/30 group-hover:text-saffron group-hover:translate-x-1 transition-all duration-300">
                  <ChevronRight size={20} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Edit Update Modal */}
      {editUpdateItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-card-lg shadow-2xl border border-maroon/10 overflow-hidden max-h-[90vh] overflow-y-auto font-body">
            <div className="h-2 w-full bg-gradient-to-r from-maroon via-saffron to-maroon" />
            <div className="flex items-center justify-between px-6 pt-5">
              <h3 className="font-heading text-lg font-extrabold text-maroon">अपडेट संपादित करा</h3>
              <button
                type="button"
                onClick={() => { setEditUpdateItem(null); setEditUpdateForm({ name: '', description: '', date: '', file: null }); }}
                className="p-1.5 rounded-full hover:bg-cream text-charcoal/50 hover:text-maroon transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1 font-body">
                  अपडेटचे नाव <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editUpdateForm.name}
                  onChange={(e) => setEditUpdateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="उदा. रक्तदान शिबिर यशस्वी"
                  className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5 font-body"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1 font-body">वर्णन</label>
                <textarea
                  value={editUpdateForm.description}
                  onChange={(e) => setEditUpdateForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="या अपडेटबद्दल थोडक्यात माहिती..."
                  className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1 font-body">तारीख</label>
                <input
                  type="date"
                  value={editUpdateForm.date}
                  onChange={(e) => setEditUpdateForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5 font-body"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1 font-body">फोटो बदला (ऐच्छिक)</label>
                {editUpdateForm.file ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(editUpdateForm.file)}
                      alt="preview"
                      className="w-full aspect-video object-cover rounded-card"
                    />
                    <button
                      type="button"
                      onClick={() => setEditUpdateForm(prev => ({ ...prev, file: null }))}
                      className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-md"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imageUrl(editUpdateItem.imageUrl)}
                      alt={editUpdateItem.title || 'अपडेट'}
                      className="w-full aspect-video object-cover rounded-card opacity-80"
                    />
                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-black/20 rounded-card hover:bg-black/30 transition-colors">
                      <Pencil size={20} className="text-white mb-1" />
                      <span className="text-white text-xs font-bold font-body">नवीन फोटो निवडा</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setEditUpdateForm(prev => ({ ...prev, file }));
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6 font-body">
              <button
                type="button"
                onClick={() => { setEditUpdateItem(null); setEditUpdateForm({ name: '', description: '', date: '', file: null }); }}
                className="flex-1 px-4 py-2.5 bg-cream hover:bg-cream-dark/30 text-charcoal/70 rounded-full font-bold text-sm border border-charcoal/10 transition-all duration-300"
              >
                रद्द करा
              </button>
              <button
                type="button"
                disabled={savingEditUpdate}
                onClick={handleSaveEditUpdate}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-saffron hover:bg-saffron-dark disabled:opacity-60 text-white rounded-full font-bold text-sm shadow-md transition-all duration-300"
              >
                {savingEditUpdate ? 'जतन करत आहे...' : <><CheckCircle2Icon size={16} /> जतन करा</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-card-lg shadow-2xl border border-maroon/10 overflow-hidden font-body">
            <div className="h-2 w-full bg-gradient-to-r from-maroon via-saffron to-maroon" />
            <div className="flex items-center justify-between px-6 pt-5">
              <h3 className="font-heading text-lg font-extrabold text-maroon">नवीन Category जोडा</h3>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="p-1.5 rounded-full hover:bg-cream text-charcoal/50 hover:text-maroon transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1 font-body">
                  श्रेणीचे नाव <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="उदा. आरोग्य शिबिर"
                  className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5 font-body"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1 font-body">वर्णन</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="या उपक्रमाबद्दल थोडक्यात माहिती..."
                  className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1 font-body">
                  फोटो <span className="text-red-500">*</span>
                </label>
                {categoryForm.file ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(categoryForm.file)}
                      alt="preview"
                      className="w-full aspect-video object-cover rounded-card"
                    />
                    <button
                      type="button"
                      onClick={() => setCategoryForm(prev => ({ ...prev, file: null }))}
                      className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-md"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <ImagePlaceholder
                    aspectRatio="aspect-video"
                    label="फोटो अपलोड करा (+)"
                    onFileSelect={(file) => setCategoryForm(prev => ({ ...prev, file }))}
                  />
                )}
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6 font-body">
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="flex-1 px-4 py-2.5 bg-cream hover:bg-cream-dark/30 text-charcoal/70 rounded-full font-bold text-sm border border-charcoal/10 transition-all duration-300"
              >
                रद्द करा
              </button>
              <button
                type="button"
                disabled={savingCategory}
                onClick={handleSaveCategory}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-saffron hover:bg-saffron-dark disabled:opacity-60 text-white rounded-full font-bold text-sm shadow-md transition-all duration-300"
              >
                {savingCategory ? 'जतन करत आहे...' : <><CheckCircle2Icon size={16} /> जतन करा</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Edit Initiative Modal */}
      {editInitiative && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-card-lg shadow-2xl border border-maroon/10 overflow-hidden font-body">
            <div className="h-2 w-full bg-gradient-to-r from-maroon via-saffron to-maroon" />
            <div className="flex items-center justify-between px-6 pt-5">
              <h3 className="font-heading text-lg font-extrabold text-maroon">उपक्रम संपादित करा</h3>
              <button
                type="button"
                onClick={() => { setEditInitiative(null); setEditForm({ name: '', description: '', file: null }); }}
                className="p-1.5 rounded-full hover:bg-cream text-charcoal/50 hover:text-maroon transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1 font-body">
                  श्रेणीचे नाव <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="उदा. आरोग्य शिबिर"
                  className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5 font-body"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1 font-body">वर्णन</label>
                <textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="या उपक्रमाबद्दल थोडक्यात माहिती..."
                  className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1 font-body">फोटो बदला (ऐच्छिक)</label>
                {editForm.file ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(editForm.file)}
                      alt="preview"
                      className="w-full aspect-video object-cover rounded-card"
                    />
                    <button
                      type="button"
                      onClick={() => setEditForm(prev => ({ ...prev, file: null }))}
                      className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-md"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imageUrl(editInitiative.imageUrl)}
                      alt={editInitiative.title || 'उपक्रम'}
                      className="w-full aspect-video object-cover rounded-card opacity-80"
                    />
                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-black/20 rounded-card hover:bg-black/30 transition-colors">
                      <Pencil size={20} className="text-white mb-1" />
                      <span className="text-white text-xs font-bold font-body">नवीन फोटो निवडा</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setEditForm(prev => ({ ...prev, file }));
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6 font-body">
              <button
                type="button"
                onClick={() => { setEditInitiative(null); setEditForm({ name: '', description: '', file: null }); }}
                className="flex-1 px-4 py-2.5 bg-cream hover:bg-cream-dark/30 text-charcoal/70 rounded-full font-bold text-sm border border-charcoal/10 transition-all duration-300"
              >
                रद्द करा
              </button>
              <button
                type="button"
                disabled={savingEdit}
                onClick={handleSaveEdit}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-saffron hover:bg-saffron-dark disabled:opacity-60 text-white rounded-full font-bold text-sm shadow-md transition-all duration-300"
              >
                {savingEdit ? 'जतन करत आहे...' : <><CheckCircle2Icon size={16} /> जतन करा</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════ */}
      {/* Add Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-card-lg shadow-2xl border border-maroon/10 overflow-hidden max-h-[90vh] overflow-y-auto font-body">
            <div className="h-2 w-full bg-gradient-to-r from-maroon via-saffron to-maroon" />
            <div className="flex items-center justify-between px-6 pt-5">
              <h3 className="font-heading text-lg font-extrabold text-maroon">नवीन Update जोडा</h3>
              <button
                type="button"
                onClick={() => setShowUpdateModal(false)}
                className="p-1.5 rounded-full hover:bg-cream text-charcoal/50 hover:text-maroon transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1 font-body">
                  अपडेटचे नाव <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={updateForm.name}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="उदा. रक्तदान शिबिर यशस्वी"
                  className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5 font-body"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1 font-body">वर्णन</label>
                <textarea
                  value={updateForm.description}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="या अपडेटबद्दल थोडक्यात माहिती..."
                  className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1 font-body">तारीख</label>
                <input
                  type="date"
                  value={updateForm.date}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5 font-body"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1 font-body">
                  फोटो <span className="text-red-500">*</span>
                </label>
                {updateForm.file ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(updateForm.file)}
                      alt="preview"
                      className="w-full aspect-video object-cover rounded-card"
                    />
                    <button
                      type="button"
                      onClick={() => setUpdateForm(prev => ({ ...prev, file: null }))}
                      className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-md"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <ImagePlaceholder
                    aspectRatio="aspect-video"
                    label="फोटो अपलोड करा (+)"
                    onFileSelect={(file) => setUpdateForm(prev => ({ ...prev, file }))}
                  />
                )}
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6 font-body">
              <button
                type="button"
                onClick={() => setShowUpdateModal(false)}
                className="flex-1 px-4 py-2.5 bg-cream hover:bg-cream-dark/30 text-charcoal/70 rounded-full font-bold text-sm border border-charcoal/10 transition-all duration-300"
              >
                रद्द करा
              </button>
              <button
                type="button"
                disabled={savingUpdate}
                onClick={handleSaveUpdate}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-saffron hover:bg-saffron-dark disabled:opacity-60 text-white rounded-full font-bold text-sm shadow-md transition-all duration-300"
              >
                {savingUpdate ? 'जतन करत आहे...' : <><CheckCircle2Icon size={16} /> जतन करा</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal state={confirmState} onClose={closeConfirm} />

    </div>
  );
};

export default HomePage;
