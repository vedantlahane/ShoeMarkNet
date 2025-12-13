import React, { useState } from 'react';
import PropTypes from 'prop-types';

const ImageGalleryModal = ({ images = [], onClose }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!images.length) {
    return null;
  }

  const activeImage = images[activeIndex];

  const handleNavigate = (direction) => {
    setActiveIndex((prev) => {
      if (direction === 'next') {
        return (prev + 1) % images.length;
      }
      return (prev - 1 + images.length) % images.length;
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 text-white hover:bg-white/20 flex items-center justify-center"
        aria-label="Close gallery"
      >
        <i className="fas fa-times text-xl"></i>
      </button>

      <div className="relative w-full max-w-5xl bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
        <div className="relative">
          <img
            src={activeImage}
            alt={`Product ${activeIndex + 1}`}
            className="w-full h-[480px] object-contain bg-black"
          />

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => handleNavigate('prev')}
                className="absolute inset-y-0 left-0 px-4 flex items-center justify-center text-white bg-gradient-to-r from-black/70 to-transparent hover:from-black/90 transition"
                aria-label="Previous image"
              >
                <i className="fas fa-chevron-left text-2xl"></i>
              </button>
              <button
                type="button"
                onClick={() => handleNavigate('next')}
                className="absolute inset-y-0 right-0 px-4 flex items-center justify-center text-white bg-gradient-to-l from-black/70 to-transparent hover:from-black/90 transition"
                aria-label="Next image"
              >
                <i className="fas fa-chevron-right text-2xl"></i>
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3 p-4 bg-black/30">
            {images.map((image, index) => (
              <button
                key={image + index}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={`relative rounded-2xl overflow-hidden border-2 ${
                  activeIndex === index ? 'border-blue-500' : 'border-transparent'
                }`}
              >
                <img src={image} alt={`Thumbnail ${index + 1}`} className="w-full h-20 object-cover" />
                {activeIndex === index && (
                  <span className="absolute inset-0 bg-blue-500/20"></span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

ImageGalleryModal.propTypes = {
  images: PropTypes.array,
  onClose: PropTypes.func.isRequired
};

export default ImageGalleryModal;
