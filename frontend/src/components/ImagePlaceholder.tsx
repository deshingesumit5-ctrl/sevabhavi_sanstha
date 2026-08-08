import React, { useRef } from 'react';
import { Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface ImagePlaceholderProps {
  className?: string;
  aspectRatio?: string;
  label?: string;
  onClick?: () => void;
}

export const ImagePlaceholder: React.FC<ImagePlaceholderProps> = ({
  className = '',
  aspectRatio = 'aspect-video',
  label = 'फोटो अपलोड करा',
  onClick,
}) => {
  const { isAdmin } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!isAdmin) return;
    if (onClick) {
      onClick();
    } else {
      // Open native file picker as mock handler
      fileInputRef.current?.click();
    }
  };

  // ── Admin: interactive upload box ──────────────────────────────
  if (isAdmin) {
    return (
      <>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) alert(`फाइल निवडली: ${file.name} (अपलोड API अद्याप जोडलेले नाही)`);
          }}
        />
        <div
          onClick={handleClick}
          className={`group relative flex flex-col items-center justify-center border-2 border-dashed border-saffron/40 hover:border-saffron bg-[#f4ebd9]/30 hover:bg-[#f4ebd9]/60 cursor-pointer rounded-card transition-all duration-300 ${aspectRatio} ${className}`}
        >
          <div className="flex flex-col items-center gap-2 p-4 text-center">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-cream text-maroon group-hover:bg-saffron group-hover:text-white transition-all duration-300 shadow-sm">
              <Plus size={24} className="group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="text-sm font-semibold text-charcoal/80 group-hover:text-saffron transition-colors">
              {label}
            </span>
          </div>
        </div>
      </>
    );
  }

  // ── Public: plain background box, no upload UI ──────────────────
  return (
    <div
      className={`bg-[#ede3d0]/40 rounded-card pointer-events-none ${aspectRatio} ${className}`}
      aria-hidden="true"
    />
  );
};

export default ImagePlaceholder;
