import { useRef, useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { uploadImage, imageUrl, type GalleryImage } from "../services/galleryApi";

interface Props {
  category: string;
  sectionKey?: string;
  existingImage?: GalleryImage | null;
  label?: string;
  aspectRatio?: string;
  onUploaded?: (img: GalleryImage) => void;
}

export default function PhotoUploadBox({
  category,
  sectionKey,
  existingImage,
  label = "फोटो अपलोड करा",
  aspectRatio = "aspect-video",
  onUploaded,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(
    existingImage ? imageUrl(existingImage.imageUrl) : null
  );
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setUploading(true);
    setPreview(URL.createObjectURL(file));

    try {
      const saved = await uploadImage({
        file,
        category,
        sectionKey,
        uploadedBy: "admin",
      });
      setPreview(imageUrl(saved.imageUrl));
      onUploaded?.(saved);
    } catch (err: any) {
      setError(err.message || "अपलोड अयशस्वी झाला");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      onClick={() => !uploading && inputRef.current?.click()}
      className={`relative ${aspectRatio} rounded-2xl border-2 border-dashed border-orange-300
        overflow-hidden cursor-pointer flex items-center justify-center
        bg-gradient-to-b from-orange-50 to-orange-100 hover:opacity-90 transition`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      {preview ? (
        <img src={preview} alt={label} className="w-full h-full object-cover" />
      ) : null}

      {(!preview || uploading) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/5">
          <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center">
            {uploading ? <Loader2 className="animate-spin" size={20} /> : <Plus size={20} />}
          </div>
          <span className="text-sm text-orange-700 font-medium px-4 text-center">
            {uploading ? "अपलोड होत आहे..." : label}
          </span>
        </div>
      )}

      {error && (
        <div className="absolute bottom-0 left-0 right-0 bg-red-500 text-white text-xs text-center py-1">
          {error}
        </div>
      )}
    </div>
  );
}