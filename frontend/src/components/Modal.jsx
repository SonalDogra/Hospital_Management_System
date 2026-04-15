import { useEffect } from 'react';
import { IoClose } from 'react-icons/io5';

const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in"
      style={{
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`${sizeClasses[size]} w-full rounded-2xl shadow-2xl animate-scale-in max-h-[90vh] flex flex-col`}
        style={{
          background: 'linear-gradient(180deg, #1a2332 0%, #141c2b 100%)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-7 py-5 border-b border-white/8">
          <h2 className="text-lg font-semibold gradient-text">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/8 transition-all duration-200 text-gray-400 hover:text-white"
          >
            <IoClose size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-7 py-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
