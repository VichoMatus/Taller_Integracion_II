// Este componente usa hooks y DOM, debe ser un Client Component
'use client';
import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ open, onClose, children }) => {
  if (!open) return null;

  // Evitar scroll del body mientras el modal está abierto
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, []);

  const modalNode = (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-container">
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );

  // Renderizar en body para evitar stacking-context issues
  if (typeof document !== 'undefined') {
    return createPortal(modalNode, document.body);
  }

  return null;
};

export default Modal;