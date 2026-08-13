import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Pencil, Trash2, X, CheckCircle2 as CheckCircle2Icon } from 'lucide-react';
import { fetchByCategory, imageUrl, deleteImage, updateImage, updateImageWithFile, type GalleryImage } from '../../services/galleryApi';
import { useAuth } from '../../context/AuthContext';
import ConfirmModal, { type ConfirmState } from '../../components/ConfirmModal';

export const UpdatesPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [updates, setUpdates] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUpdate, setSelectedUpdate] = useState<GalleryImage | null>(null);

  // Edit Update state
  const [editUpdateItem, setEditUpdateItem] = useState<GalleryImage | null>(null);
  const [editUpdateForm, setEditUpdateForm] = useState<{ name: string; description: string; date: string; file: File | null }>({
    name: '', description: '', date: '', file: null
  });
  const [savingEditUpdate, setSavingEditUpdate] = useState(false);

  // Confirm Modal state
  const [confirmState, setConfirmState] = useState<ConfirmState>({ open: false, message: '', onConfirm: () => { } });
  const closeConfirm = () => setConfirmState(prev => ({ ...prev, open: false }));
  const askConfirm = (message: string, onConfirm: () => void) =>
    setConfirmState({ open: true, message, onConfirm });

  useEffect(() => {
    fetchByCategory('updates')
      .then(images => {
        const sorted = [...images].sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
        setUpdates(sorted);
      })
      .catch(err => console.error('Error fetching updates:', err))
      .finally(() => setLoading(false));
  }, []);

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
            सर्व नवीन अपडेट्स
          </h1>
          <p className="text-xs md:text-sm text-charcoal/70">
            संस्थेच्या सर्व ताज्या बातम्या, घडामोडी आणि अपडेट्स
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-charcoal/50">लोड होत आहे...</div>
      ) : updates.length === 0 ? (
        <div className="text-center py-12 text-charcoal/50">अद्याप कोणतेही अपडेट्स उपलब्ध नाहीत.</div>
      ) : (
        <div className="space-y-4">
          {updates.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedUpdate(item)}
              className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-white hover:bg-cream/10 rounded-card border border-maroon/5 shadow-soft hover:shadow-md transition-all duration-300 cursor-pointer group gap-4"
            >
              <div className="flex items-center gap-4 w-full sm:w-auto flex-1">
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-card overflow-hidden shrink-0 bg-cream">
                  <img
                    src={imageUrl(item.imageUrl)}
                    alt={item.title || 'अपडेट'}
                    className="w-full h-full object-cover"
                  />
                </div>
                {/* Title & Date */}
                <div className="flex flex-col gap-1 flex-1">
                  <h3 className="text-sm md:text-base font-bold text-charcoal/90 group-hover:text-saffron transition-colors leading-snug" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-xs text-charcoal/60 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                  <span className="text-xs font-semibold text-saffron mt-1">
                    {formatUpdateDate(item.sectionKey)}
                  </span>
                </div>
              </div>

              {/* Admin Actions & Arrow */}
              <div className="flex items-center gap-2 self-end sm:self-center">
                {isAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); openEditUpdateModal(item); }}
                      className="p-2 bg-white/90 hover:bg-white text-maroon rounded-full shadow-sm hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                      title="संपादित करा"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleUpdateDelete(item); }}
                      className="p-2 bg-white/90 hover:bg-white text-red-500 rounded-full shadow-sm hover:scale-110 transition-all opacity-0 group-hover:opacity-100"
                      title="हटवा"
                    >
                      <Trash2 size={15} />
                    </button>
                  </>
                )}
                <div className="text-charcoal/30 group-hover:text-saffron group-hover:translate-x-1 transition-all duration-300">
                  <ChevronRight size={22} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedUpdate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-card-lg shadow-2xl border border-maroon/10 overflow-hidden">
            <div className="h-2 w-full bg-gradient-to-r from-maroon via-saffron to-maroon" />
            <div className="p-6 space-y-4">
              <img
                src={imageUrl(selectedUpdate.imageUrl)}
                alt={selectedUpdate.title || 'अपडेट'}
                className="w-full aspect-video object-cover rounded-card"
              />
              <span className="text-xs font-semibold text-saffron block">
                {formatUpdateDate(selectedUpdate.sectionKey)}
              </span>
              <h2 className="text-xl font-bold text-maroon leading-tight" style={{ fontFamily: "'Baloo 2', sans-serif" }}>
                {selectedUpdate.title}
              </h2>
              {selectedUpdate.description && (
                <p className="text-sm text-charcoal/80 leading-relaxed">
                  {selectedUpdate.description}
                </p>
              )}
              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedUpdate(null)}
                  className="px-6 py-2.5 bg-saffron hover:bg-saffron-dark text-white rounded-full font-bold text-sm shadow-md transition-all duration-300"
                >
                  बंद करा
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Update Modal */}
      {editUpdateItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-card-lg shadow-2xl border border-maroon/10 overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="h-2 w-full bg-gradient-to-r from-maroon via-saffron to-maroon" />
            <div className="flex items-center justify-between px-6 pt-5">
              <h3 className="text-lg font-extrabold text-maroon" style={{ fontFamily: "'Baloo 2', sans-serif" }}>अपडेट संपादित करा</h3>
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
                <label className="block text-xs font-bold text-charcoal/75 mb-1">
                  अपडेटचे नाव <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editUpdateForm.name}
                  onChange={(e) => setEditUpdateForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="उदा. रक्तदान शिबिर यशस्वी"
                  className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1">वर्णन</label>
                <textarea
                  value={editUpdateForm.description}
                  onChange={(e) => setEditUpdateForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  placeholder="या अपडेटबद्दल थोडक्यात माहिती..."
                  className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5 resize-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1">तारीख</label>
                <input
                  type="date"
                  value={editUpdateForm.date}
                  onChange={(e) => setEditUpdateForm(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-card border border-charcoal/20 focus:border-saffron focus:ring-1 focus:ring-saffron text-sm outline-none bg-cream/5"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-charcoal/75 mb-1">फोटो बदला (ऐच्छिक)</label>
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
                      <span className="text-white text-xs font-bold">नवीन फोटो निवडा</span>
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
            <div className="flex gap-3 px-6 pb-6">
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

      <ConfirmModal state={confirmState} onClose={closeConfirm} />
    </div>
  );
};

export default UpdatesPage;
