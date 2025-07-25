import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out" 
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto transform transition-all duration-300 ease-in-out scale-95 opacity-0 animate-modalShow"
        onClick={e => e.stopPropagation()} 
        style={{ animationName: 'modalShowAnim', animationDuration: '0.3s', animationFillMode: 'forwards' }}
      >
        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
          <h2 id="modal-title" className="text-xl font-semibold text-emerald-700">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-emerald-600 transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        <div>{children}</div>
      </div>
      <style>{`
        @keyframes modalShowAnim {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-modalShow {
          animation-name: modalShowAnim;
          animation-duration: 0.3s;
          animation-fill-mode: forwards;
        }
      `}</style>
    </div>
  );
};