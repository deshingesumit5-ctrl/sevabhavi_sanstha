import React, { useState, useEffect } from 'react';
import ImagePlaceholder from '../../components/ImagePlaceholder';
import ConfirmModal, { type ConfirmState } from '../../components/ConfirmModal';
import { uploadImage, imageUrl, deleteImage, fetchByCategory, fetchAllImages, updateImage, updateImageWithFile, type GalleryImage } from '../../services/galleryApi';
import { Pencil, Trash2, Plus, X, CheckCircle2 as CheckCircle2Icon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const GalleryPage: React.FC = () => {
  const { isAdmin } = useAuth();
  const [bannerImage, setBannerImage] = useState<GalleryImage | null>(null);
  const BANNER_SECTION_KEY = 'gallery_banner';

  const [confirmState, setConfirmState] = useState<ConfirmState>({ open: false, message: '', onConfirm: () => { } });
  const closeConfirm = () => setConfirmState(prev => ({ ...prev, open: false }));
  const askConfirm = (message: string, onConfirm: () => void) => setConfirmState({ open: true, message, onConfirm });

  // --- Category / Shreni state ---
  const [customCategories, setCustomCategories] = useState<GalleryImage[]>([]);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [categoryForm, setCategoryForm] = useState<{ name: string; description: string; file: File | null }>({
    name: '', description: '', file: null
  });
  const [savingCategory, setSavingCategory] = useState(false);

  // --- Edit Category state ---
  const [editCategoryItem, setEditCategoryItem] = useState<GalleryImage | null>(null);
  const [editCategoryForm, setEditCategoryForm] = useState<{ name: string; description: string; file: File | null }>({
    name: '', description: '', file: null
  });
  const [savingEditCategory, setSavingEditCategory] = useState(false);

  // --- Edit Photo state ---
  const [editPhotoItem, setEditPhotoItem] = useState<GalleryImage | null>(null);
  const [editPhotoForm, setEditPhotoForm] = useState<{ title: string; description: string; file: File | null }>({
    title: '', description: '', file: null
  });
  const [savingEditPhoto, setSavingEditPhoto] = useState(false);

  useEffect(() => {
    fetchByCategory('banner')
      .then(images => setBannerImage(images.find(img => img.sectionKey === BANNER_SECTION_KEY) ?? null))
      .catch(err => console.error('Error loading banner:', err));
    loadCustomCategories();
  }, []);

  const loadCustomCategories = async () => {
    try {
      const data = await fetchByCategory('gallery_category');
      setCustomCategories(data);
    } catch (err) {
      console.error('Error loading custom categories:', err);
    }
  };

  const handleBannerUpload = async (file: File) => {
    try {
      const uploaded = await uploadImage({ file, category: 'banner', sectionKey: BANNER_SECTION_KEY });
      setBannerImage(uploaded);
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handleBannerDelete = async () => {
    if (!bannerImage) return;
    askConfirm('बॅनर फोटो हटवायचा आहे का?', async () => {
      try {
        await deleteImage(bannerImage.id);
        setBannerImage(null);
      } catch (err) {
        alert((err as Error).message);
      }
    });
  };

  const [activeTab, setActiveTab] = useState('all');
  const [photos, setPhotos] = useState<GalleryImage[]>([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);

  const defaultCategories = [
    { id: 'all', label: 'सर्व (All)' },
    { id: 'bus', label: 'मोफत बस सेवा' },
    { id: 'blood', label: 'रक्तदान शिबिर' },
    { id: 'env', label: 'पर्यावरण संवर्धन' },
    { id: 'edu', label: 'शैक्षणिक मदत' },
  ];

  const categories = [
    ...defaultCategories,
    ...customCategories.map(c => ({ id: c.sectionKey || `cat_${c.id}`, label: c.title || '' }))
  ];

  const activeCustomCat = customCategories.find(c => c.sectionKey === activeTab);

  const loadPhotos = async () => {
    setLoadingPhotos(true);
    try {
      const data = activeTab === 'all' ? await fetchAllImages() : await fetchByCategory(activeTab);
      // exclude banner, updates, initiative, about, gallery_category from grid
      const excludedCategories = ['banner', 'updates', 'initiative', 'about', 'gallery_category'];
      setPhotos(data.filter((img) => !excludedCategories.includes(img.category) && img.isActive !== false));
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingPhotos(false);
    }
  };

  useEffect(() => { loadPhotos(); }, [activeTab]);

  const handlePhotoUpload = async (files: FileList) => {
    try {
      for (const file of Array.from(files)) {
        await uploadImage({ file, category: activeTab === 'all' ? 'general' : activeTab });
      }
      await loadPhotos();
    } catch (err) {
      alert((err as Error).message);
    }
  };

  const handlePhotoDelete = async (id: number) => {
    askConfirm('हा फोटो हटवायचा आहे का?', async () => {
      try {
        await deleteImage(id);
        setPhotos((prev) => prev.filter((p) => p.id !== id));
      } catch (err) {
        alert((err as Error).message);
      }
    });
  };

  const handleSaveCategory = async () => {
    if (!categoryForm.name.trim() || !categoryForm.file) {
      alert('कृपया श्रेणीचे नाव आणि फोटो निवडा.');
      return;
    }
    setSavingCategory(true);
    try {
      const catKey = `gallery_cat_${Date.now()}`;
      await uploadImage({
        file: categoryForm.file,
        category: 'gallery_category',
        sectionKey: catKey,
        title: categoryForm.name.trim(),
        description: categoryForm.description.trim(),
      });
      setCategoryForm({ name: '', description: '', file: null });
      setShowCategoryModal(false);
      await loadCustomCategories();
      setActiveTab(catKey);
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSavingCategory(false);
    }
  };

  const handleSaveEditCategory = async () => {
    if (!editCategoryItem) return;
    if (!editCategoryForm.name.trim()) {
      alert('कृपया श्रेणीचे नाव द्या.');
      return;
    }
    setSavingEditCategory(true);
    try {
      if (editCategoryForm.file) {
        await updateImageWithFile(editCategoryItem.id, {
          file: editCategoryForm.file,
          title: editCategoryForm.name.trim(),
          description: editCategoryForm.description.trim(),
          category: 'gallery_category',
          sectionKey: editCategoryItem.sectionKey,
        });
      } else {
        await updateImage(editCategoryItem.id, {
          title: editCategoryForm.name.trim(),
          description: editCategoryForm.description.trim(),
        });
      }
      setEditCategoryItem(null);
      setEditCategoryForm({ name: '', description: '', file: null });
      await loadCustomCategories();
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSavingEditCategory(false);
    }
  };

  const handleCategoryDelete = async (cat: GalleryImage) => {
    askConfirm('ही श्रेणी आणि त्यातील सर्व फोटो हटवायचे आहेत का?', async () => {
      try {
        await deleteImage(cat.id);
        const imagesInCat = await fetchByCategory(cat.sectionKey || '');
        for (const img of imagesInCat) {
          await deleteImage(img.id);
        }
        setActiveTab('all');
        await loadCustomCategories();
      } catch (err) {
        alert((err as Error).message);
      }
    });
  };

  const handleSaveEditPhoto = async () => {
    if (!editPhotoItem) return;
    setSavingEditPhoto(true);
    try {
      let updated: GalleryImage;
      if (editPhotoForm.file) {
        updated = await updateImageWithFile(editPhotoItem.id, {
          file: editPhotoForm.file,
          title: editPhotoForm.title.trim(),
          description: editPhotoForm.description.trim(),
          category: editPhotoItem.category,
          sectionKey: editPhotoItem.sectionKey,
        });
      } else {
        updated = await updateImage(editPhotoItem.id, {
          title: editPhotoForm.title.trim(),
          description: editPhotoForm.description.trim(),
        });
      }
      setPhotos(prev => prev.map(p => p.id === editPhotoItem.id ? updated : p));
      setEditPhotoItem(null);
      setEditPhotoForm({ title: '', description: '', file: null });
    } catch (err) {
      alert((err as Error).message);
    } finally {
      setSavingEditPhoto(false);
    }
  };

  return (
    <div className="flex flex-col w-full">
      {/* 1. Header Banner */}
      <section className="relative w-full overflow-hidden bg-cream-dark/20 p-2 md:p-4 section-gap-top">
        <div className="relative rounded-card-lg overflow-hidden shadow-soft">
          {bannerImage ? (
            <>
              <img
                src={imageUrl(bannerImage.imageUrl)}
                alt="गॅलरी बॅनर"
                className="w-full min-h-[150px] sm:min-h-[220px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-maroon/80 to-transparent flex items-end p-6 z-10 pointer-events-none" />
              {isAdmin && (
                <div className="absolute top-3 right-3 flex gap-2 z-20">
                  <button
                    type="button"
                    onClick={() => document.getElementById('gallery-banner-input')?.click()}
                    className="p-2 bg-white/90 hover:bg-white text-maroon rounded-full shadow-md"
                    title="फोटो बदला"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={handleBannerDelete}
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
              label="गॅलरी मुख्य फोटो अपलोड करा"
              className="w-full min-h-[150px] sm:min-h-[220px]"
              onFileSelect={handleBannerUpload}
            />
          )}
          <input
            id="gallery-banner-input"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleBannerUpload(file);
              e.target.value = '';
            }}
          />
        </div>
      </section>

      {/* 2. Category Tabs */}
      <section className="w-full px-4 max-w-6xl mx-auto section-gap-top">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-maroon/5 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none justify-start flex-1">
            {categories.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full font-bold text-xs md:text-sm whitespace-nowrap transition-all duration-300 ${activeTab === tab.id
                  ? 'bg-saffron text-white shadow-md shadow-saffron/20'
                  : 'bg-white text-charcoal/80 border border-maroon/10 hover:border-saffron hover:text-saffron'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              {activeCustomCat && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setEditCategoryItem(activeCustomCat);
                      setEditCategoryForm({
                        name: activeCustomCat.title || '',
                        description: activeCustomCat.description || '',
                        file: null
                      });
                    }}
                    className="flex items-center gap-1 text-xs md:text-sm font-bold text-maroon hover:text-saffron transition-colors border border-maroon/20 hover:border-saffron px-3 py-1.5 rounded-full"
                    title="श्रेणी सुधारा"
                  >
                    <Pencil size={14} />
                    <span className="hidden sm:inline">श्रेणी सुधारा</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCategoryDelete(activeCustomCat)}
                    className="flex items-center gap-1 text-xs md:text-sm font-bold text-red-600 hover:bg-red-50 transition-colors border border-red-200 hover:border-red-400 px-3 py-1.5 rounded-full"
                    title="श्रेणी हटवा"
                  >
                    <Trash2 size={14} />
                    <span className="hidden sm:inline">श्रेणी हटवा</span>
                  </button>
                </>
              )}
              <button
                onClick={() => setShowCategoryModal(true)}
                className="flex items-center gap-1 text-xs md:text-sm font-bold text-white bg-saffron hover:bg-saffron-dark transition-colors px-3 py-1.5 rounded-full shadow-sm"
              >
                <Plus size={14} />
                <span>श्रेणी जोडा</span>
              </button>
            </div>
          )}
        </div>
      </section>

      {/* 3. Photo Placeholders Grid */}
      <section className="w-full px-4 max-w-6xl mx-auto section-gap-top">
        <div className="bg-white rounded-card-lg border border-maroon/5 shadow-soft p-6">
          {loadingPhotos ? (
            <div className="text-center py-12">
              <p className="text-sm font-semibold text-charcoal/50">फोटो लोड होत आहेत...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {photos.map((photo) => (
                <div
                  key={photo.id}
                  className="group relative flex flex-col bg-cream/10 border border-maroon/5 rounded-card overflow-hidden hover:shadow-md hover:border-saffron/20 transition-all duration-300"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={imageUrl(photo.imageUrl)}
                      alt={photo.title || photo.sectionKey || ''}
                      className="w-full h-full object-cover"
                    />
                    {isAdmin && (
                      <div className="absolute top-2 right-2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                        <button
                          type="button"
                          onClick={() => {
                            setEditPhotoItem(photo);
                            setEditPhotoForm({
                              title: photo.title || '',
                              description: photo.description || '',
                              file: null,
                            });
                          }}
                          className="p-2 bg-white/90 hover:bg-white text-maroon rounded-full shadow-md"
                          title="फोटो सुधारा"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handlePhotoDelete(photo.id)}
                          className="p-2 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-md"
                          title="फोटो हटवा"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                  {(photo.title || photo.description) && (
                    <div className="p-3 bg-white border-t border-maroon/5 flex flex-col gap-0.5">
                      {photo.title && (
                        <span className="text-[11.5px] font-bold text-charcoal/90">
                          {photo.title}
                        </span>
                      )}
                      {photo.description && (
                        <span className="text-[10px] text-charcoal/60">
                          {photo.description}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {isAdmin && (
                <label className="group flex flex-col items-center justify-center border-2 border-dashed border-saffron/40 hover:border-saffron bg-[#f4ebd9]/30 hover:bg-[#f4ebd9]/60 cursor-pointer rounded-card aspect-[4/3] transition-all duration-300">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length) handlePhotoUpload(e.target.files);
                      e.target.value = '';
                    }}
                  />
                  <div className="flex flex-col items-center gap-2 p-4 text-center">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-cream text-maroon group-hover:bg-saffron group-hover:text-white transition-all duration-300 shadow-sm">
                      <Plus size={24} />
                    </div>
                    <span className="text-sm font-semibold text-charcoal/80 group-hover:text-saffron transition-colors">
                      फोटो जोडा (एकाच वेळी अनेक निवडू शकता)
                    </span>
                  </div>
                </label>
              )}
            </div>
          )}

          {!loadingPhotos && photos.length === 0 && !isAdmin && (
            <div className="text-center py-12">
              <p className="text-sm font-semibold text-charcoal/50">या गॅलरी श्रेणीत कोणतेही फोटो नाहीत.</p>
            </div>
          )}
        </div>

        {photos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm font-semibold text-charcoal/50">या गॅलरी श्रेणीत कोणतेही फोटो नाहीत.</p>
          </div>
        )}
      </section>

      {/* Add Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-card-lg shadow-2xl border border-maroon/10 overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-maroon via-saffron to-maroon" />
            <div className="flex items-center justify-between px-6 pt-5">
              <h3 className="text-lg font-extrabold text-maroon" style={{ fontFamily: "'Baloo 2', sans-serif" }}>नवीन Category जोडा</h3>
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
                <label className="block text-xs font-bold text-charcoal/75 mb-1">
                  श्रेणीचे नाव <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="उदा. आरोग्य शिबिर"
                  className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1">वर्णन</label>
                <textarea
                  value={categoryForm.description}
                  onChange={(e) => setCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="या उपक्रमाबद्दल थोडक्यात माहिती..."
                  className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1">
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
            <div className="flex gap-3 px-6 pb-6">
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

      {/* Edit Category Modal */}
      {editCategoryItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-card-lg shadow-2xl border border-maroon/10 overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-maroon via-saffron to-maroon" />
            <div className="flex items-center justify-between px-6 pt-5">
              <h3 className="text-lg font-extrabold text-maroon" style={{ fontFamily: "'Baloo 2', sans-serif" }}>श्रेणी संपादित करा</h3>
              <button
                type="button"
                onClick={() => { setEditCategoryItem(null); setEditCategoryForm({ name: '', description: '', file: null }); }}
                className="p-1.5 rounded-full hover:bg-cream text-charcoal/50 hover:text-maroon transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1">
                  श्रेणीचे नाव <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editCategoryForm.name}
                  onChange={(e) => setEditCategoryForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="उदा. आरोग्य शिबिर"
                  className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1">वर्णन</label>
                <textarea
                  value={editCategoryForm.description}
                  onChange={(e) => setEditCategoryForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="या उपक्रमाबद्दल थोडक्यात माहिती..."
                  className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1">फोटो बदला (ऐच्छिक)</label>
                {editCategoryForm.file ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(editCategoryForm.file)}
                      alt="preview"
                      className="w-full aspect-video object-cover rounded-card"
                    />
                    <button
                      type="button"
                      onClick={() => setEditCategoryForm(prev => ({ ...prev, file: null }))}
                      className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-md"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imageUrl(editCategoryItem.imageUrl)}
                      alt={editCategoryItem.title || 'category'}
                      className="w-full aspect-video object-cover rounded-card opacity-80"
                    />
                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-black/20 rounded-card hover:bg-black/30 transition-colors">
                      <Pencil size={20} className="text-white mb-1" />
                      <span className="text-white text-xs font-bold">नवीन फोटो निवडा</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setEditCategoryForm(prev => ({ ...prev, file }));
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                type="button"
                onClick={() => { setEditCategoryItem(null); setEditCategoryForm({ name: '', description: '', file: null }); }}
                className="flex-1 px-4 py-2.5 bg-cream hover:bg-cream-dark/30 text-charcoal/70 rounded-full font-bold text-sm border border-charcoal/10 transition-all duration-300"
              >
                रद्द करा
              </button>
              <button
                type="button"
                disabled={savingEditCategory}
                onClick={handleSaveEditCategory}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-saffron hover:bg-saffron-dark disabled:opacity-60 text-white rounded-full font-bold text-sm shadow-md transition-all duration-300"
              >
                {savingEditCategory ? 'जतन करत आहे...' : <><CheckCircle2Icon size={16} /> जतन करा</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Photo Modal */}
      {editPhotoItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-card-lg shadow-2xl border border-maroon/10 overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-maroon via-saffron to-maroon" />
            <div className="flex items-center justify-between px-6 pt-5">
              <h3 className="text-lg font-extrabold text-maroon" style={{ fontFamily: "'Baloo 2', sans-serif" }}>फोटो संपादित करा</h3>
              <button
                type="button"
                onClick={() => { setEditPhotoItem(null); setEditPhotoForm({ title: '', description: '', file: null }); }}
                className="p-1.5 rounded-full hover:bg-cream text-charcoal/50 hover:text-maroon transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1">शीर्षक / नाव</label>
                <input
                  type="text"
                  value={editPhotoForm.title}
                  onChange={(e) => setEditPhotoForm(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="उदा. मोफत बस सेवा शुभारंभ"
                  className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1">वर्णन</label>
                <textarea
                  value={editPhotoForm.description}
                  onChange={(e) => setEditPhotoForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="फोटोबद्दल थोडक्यात माहिती..."
                  className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1">फोटो बदला (ऐच्छिक)</label>
                {editPhotoForm.file ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(editPhotoForm.file)}
                      alt="preview"
                      className="w-full aspect-video object-cover rounded-card"
                    />
                    <button
                      type="button"
                      onClick={() => setEditPhotoForm(prev => ({ ...prev, file: null }))}
                      className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white text-red-600 rounded-full shadow-md"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={imageUrl(editPhotoItem.imageUrl)}
                      alt={editPhotoItem.title || 'photo'}
                      className="w-full aspect-video object-cover rounded-card opacity-80"
                    />
                    <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer bg-black/20 rounded-card hover:bg-black/30 transition-colors">
                      <Pencil size={20} className="text-white mb-1" />
                      <span className="text-white text-xs font-bold">नवीन फोटो निवडा</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setEditPhotoForm(prev => ({ ...prev, file }));
                          e.target.value = '';
                        }}
                      />
                    </label>
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                type="button"
                onClick={() => { setEditPhotoItem(null); setEditPhotoForm({ title: '', description: '', file: null }); }}
                className="flex-1 px-4 py-2.5 bg-cream hover:bg-cream-dark/30 text-charcoal/70 rounded-full font-bold text-sm border border-charcoal/10 transition-all duration-300"
              >
                रद्द करा
              </button>
              <button
                type="button"
                disabled={savingEditPhoto}
                onClick={handleSaveEditPhoto}
                className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 bg-saffron hover:bg-saffron-dark disabled:opacity-60 text-white rounded-full font-bold text-sm shadow-md transition-all duration-300"
              >
                {savingEditPhoto ? 'जतन करत आहे...' : <><CheckCircle2Icon size={16} /> जतन करा</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal state={confirmState} onClose={closeConfirm} />
    </div>
  );
};

export default GalleryPage;
