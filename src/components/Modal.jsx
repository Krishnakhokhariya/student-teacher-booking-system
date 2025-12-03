import React from "react";
import { createPortal } from "react-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";

function Modal({ isOpen, title, children, onClose, primaryLabel = "OK", onPrimaryClick }) {
  if (!isOpen) return null;

  const handlePrimary = () => {
    if (onPrimaryClick) onPrimaryClick();
    else onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto min-h-screen">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn">
        
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="px-4 py-4 text-sm text-slate-700 overflow-y-auto max-h-[65vh]">
          {children}
        </div>

        <div className="flex justify-end gap-3 border-t px-4 py-3 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm rounded-full border border-slate-300 text-slate-600 hover:bg-slate-100"
          >
            Close
          </button>
          <button
            onClick={handlePrimary}
            className="px-4 py-1.5 text-sm rounded-full bg-gray-800 text-white hover:bg-gray-900"
          >
            {primaryLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body  
  );
}

export default Modal;
