import React from 'react'

function Modal({ isOpen, title, children, onClose, primaryLabel = "OK", onPrimaryClick }) {
  if (!isOpen) return null;

  function handlePrimary(){
    if(onPrimaryClick){
      onPrimaryClick();
    } else{
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto animate-fadeIn">
        
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            X
          </button>
        </div>

        <div className="px-4 py-4 text-sm text-slate-700">
          {children}
        </div>

        <div className="flex justify-end gap-3 border-t px-4 py-3 bg-slate-50 rounded-b-2xl">
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
    </div>
  );
}

export default Modal;
