import { useState, type ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  ariaLabel?: string;
  children: ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  ariaLabel,
  children,
}: ModalProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
  };

  const handleAnimationEnd = () => {
    if (isClosing) onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 z-200 flex flex-col justify-end"
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel ?? title}
    >
      <button
        type="button"
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
          isClosing ? 'opacity-0' : ''
        }`}
        aria-label="Close"
        onClick={handleClose}
      />
      <div
        className={`relative bg-[#181818] rounded-t-2xl px-6 pt-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] max-h-[90%] overflow-y-auto shadow-[0_-4px_24px_rgba(0,0,0,0.4)] ${
          isClosing ? 'animate-slide-down' : 'animate-slide-up'
        }`}
        onClick={(e) => e.stopPropagation()}
        onAnimationEnd={handleAnimationEnd}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">{title}</h2>
          <button
            type="button"
            className="p-2 -mr-2 text-white/60 hover:text-white cursor-pointer"
            aria-label="Close"
            onClick={handleClose}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
