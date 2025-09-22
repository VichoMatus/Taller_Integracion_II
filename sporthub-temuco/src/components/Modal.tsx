import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="relative bg-[#f2f4f3] rounded-[28px] shadow-2xl px-10 py-10 min-w-[350px] max-w-[90vw]">
        <button
          className="absolute top-[13px] right-[18px] text-gray-700 text-4xl font-bold hover:text-black bg-transparent border-none outline-none"
          onClick={onClose}
          aria-label="Cerrar modal"
          style={{ padding: 0, margin: 0 }}
        >
          ×
        </button>
        <div className="flex flex-col items-center justify-center">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;