import React from 'react';
import { Trash2 } from 'lucide-react';

export type ConfirmState = {
  open: boolean;
  message: string;
  onConfirm: () => void;
};

export const ConfirmModal: React.FC<{ state: ConfirmState; onClose: () => void }> = ({ state, onClose }) => {
  if (!state.open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-card-lg shadow-2xl border border-maroon/10 overflow-hidden">
        <div className="h-2 w-full bg-gradient-to-r from-maroon via-saffron to-maroon" />
        <div className="flex flex-col items-center text-center px-6 py-8">
          <div className="w-14 h-14 rounded-full bg-gradient-to-b from-rose-50 to-rose-100 flex items-center justify-center mb-4 shadow-sm border border-maroon/10">
            <Trash2 size={26} className="text-red-600" strokeWidth={2.2} />
          </div>
          <p className="text-sm text-charcoal/80 leading-relaxed font-semibold mb-6">
            {state.message}
          </p>
          <div className="flex gap-3 w-full">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-cream hover:bg-cream-dark/30 text-charcoal/70 rounded-full font-bold text-sm border border-charcoal/10 transition-all duration-300"
            >
              रद्द करा
            </button>
            <button
              type="button"
              onClick={() => {
                state.onConfirm();
                onClose();
              }}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-sm shadow-md transition-all duration-300"
            >
              हटवा
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
