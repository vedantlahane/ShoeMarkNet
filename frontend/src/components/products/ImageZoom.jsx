import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const ImageZoom = ({ images, currentIndex, onClose, onImageChange, productName }) => {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  const handlePrevious = () => {
    onImageChange(currentIndex > 0 ? currentIndex - 1 : images.length - 1);
  };

  const handleNext = () => {
    onImageChange(currentIndex < images.length - 1 ? currentIndex + 1 : 0);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') handleClose();
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  return createPortal(
    <div className={`fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300 ${
      isClosing ? 'opacity-0' : 'opacity-100'
    }`}>
      
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-6 right-6 w-12 h-12 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
      >
        <i className="fas fa-times text-xl"></i>
      </button>

      {/* Image Container */}
      <div className="relative max-w-4xl max-h-[80vh] w-full">
        <img
          src={images[currentIndex]}
          alt={`${productName} - Image ${currentIndex + 1}`}
          className="w-full h-full object-contain"
        />

        {/* Navigation */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevious}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-white/20 backdrop-blur-lg rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </>
        )}

        {/* Image Counter */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-full text-sm">
          {currentIndex + 1} of {images.length}
        </div>
      </div>

      {/* Thumbnail Strip */}
      {images.length > 1 && (
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 max-w-xs overflow-x-auto">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => onImageChange(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                index === currentIndex 
                  ? 'border-white scale-110' 
                  : 'border-white/50 hover:border-white/75'
              }`}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>,
    document.body
  );
};

export default ImageZoom;
