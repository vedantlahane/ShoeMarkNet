import React, { useState } from 'react';
import { FaShare, FaTimes, FaFacebook, FaTwitter, FaLinkedin, FaWhatsapp, FaCopy, FaLink } from 'react-icons/fa';

const ShareModal = ({ isOpen, onClose, url, title, description }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareData = {
    url: url || window.location.href,
    title: title || 'Check this out!',
    description: description || 'Amazing product from ShoeMarkNet'
  };

  const shareOptions = [
    {
      name: 'Facebook',
      icon: FaFacebook,
      color: '#3b5998',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`
    },
    {
      name: 'Twitter',
      icon: FaTwitter,
      color: '#1da1f2',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareData.url)}&text=${encodeURIComponent(shareData.title)}`
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      color: '#0077b5',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url)}`
    },
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: '#25d366',
      url: `https://wa.me/?text=${encodeURIComponent(`${shareData.title} - ${shareData.url}`)}`
    }
  ];

  const handleShare = (shareUrl) => {
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareData.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center">
            <FaShare className="mr-2" />
            Share this item
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes size={20} />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">{shareData.title}</p>
          <div className="flex items-center bg-gray-100 rounded-lg p-3">
            <FaLink className="text-gray-400 mr-2" />
            <input
              type="text"
              value={shareData.url}
              readOnly
              className="flex-1 bg-transparent text-sm text-gray-600 outline-none"
            />
            <button
              onClick={copyToClipboard}
              className="ml-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              {copied ? 'Copied!' : <FaCopy />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {shareOptions.map((option) => (
            <button
              key={option.name}
              onClick={() => handleShare(option.url)}
              className="flex items-center justify-center p-3 border rounded-lg hover:bg-gray-50 transition-colors"
              style={{ borderColor: option.color }}
            >
              <option.icon 
                className="mr-2" 
                style={{ color: option.color }} 
                size={20} 
              />
              <span className="text-sm font-medium">{option.name}</span>
            </button>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t">
          <button
            onClick={onClose}
            className="w-full py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
