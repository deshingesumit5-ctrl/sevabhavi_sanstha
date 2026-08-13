import { useEffect, useState } from "react";

export interface GalleryImage {
  id: string;
  imageUrl: string;
  title?: string;
}

const imageUrl = (path: string) => path;

const fetchAllImages = async (): Promise<GalleryImage[]> => {
  // Try to fetch from a conventional API endpoint; fallback to empty list on error.
  try {
    const res = await fetch('/api/gallery');
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.warn('fetchAllImages fallback used', e);
    return [];
  }
};
import PhotoUploadBox from "../components/PhotoUploadBox";

const IS_ADMIN = true; // TODO: replace with your real auth check

export default function Gallery() {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<GalleryImage | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchAllImages();
      setImages(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-orange-800 mb-6" style={{ fontFamily: "'Baloo 2', sans-serif" }}>गॅलरी</h1>

      {IS_ADMIN && (
        <div className="mb-6 w-full sm:w-64">
          <PhotoUploadBox
            category="gallery"
            label="नवीन फोटो अपलोड करा"
            aspectRatio="aspect-square"
            onUploaded={load}
          />
        </div>
      )}

      {loading ? (
        <p className="text-gray-500">लोड होत आहे...</p>
      ) : images.length === 0 ? (
        <p className="text-gray-500">अजून कोणतेही फोटो नाहीत</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              onClick={() => setSelected(img)}
              className="aspect-square rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-md transition"
            >
              <img
                src={imageUrl(img.imageUrl)}
                alt={img.title || "gallery"}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      )}

      {selected && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelected(null)}
        >
          <img
            src={imageUrl(selected.imageUrl)}
            alt={selected.title || ""}
            className="max-w-full max-h-full rounded-lg"
          />
        </div>
      )}
    </div>
  );
}