import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import {
  FaShareAlt,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaWhatsapp,
  FaCopy,
  FaCheck,
  FaEllipsisH
} from 'react-icons/fa';
import ShareModal from '../modals/ShareModal';
import { toast } from 'react-toastify';
import { trackEvent } from '../../../utils/analytics';

const SocialShare = ({ url, title, description, image, className = '' }) => {
  const [copied, setCopied] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const shareMeta = useMemo(() => {
    const resolvedUrl = url ?? (typeof window !== 'undefined' ? window.location.href : '');
    return {
      url: resolvedUrl,
      title: title || 'Check out this product on ShoeMarkNet',
      description: description || 'Discover the latest footwear on ShoeMarkNet',
      image: image || undefined
    };
  }, [url, title, description, image]);

  const shareOptions = useMemo(() => [
    {
      name: 'Facebook',
      icon: FaFacebookF,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareMeta.url)}`
    },
    {
      name: 'Twitter',
      icon: FaTwitter,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareMeta.url)}&text=${encodeURIComponent(shareMeta.title)}`
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedinIn,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareMeta.url)}`
    },
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      url: `https://wa.me/?text=${encodeURIComponent(`${shareMeta.title} - ${shareMeta.url}`)}`
    }
  ], [shareMeta]);

  const openShareWindow = (shareUrl, network) => {
    if (!shareUrl) return;

    trackEvent('share_product', {
      method: network,
      url: shareMeta.url,
      title: shareMeta.title
    });

    if (typeof window !== 'undefined') {
      window.open(shareUrl, '_blank', 'width=600,height=500');
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: shareMeta.title,
          text: shareMeta.description,
          url: shareMeta.url
        });
        trackEvent('share_product', {
          method: 'native_share',
          url: shareMeta.url,
          title: shareMeta.title
        });
      } catch (error) {
        if (error?.name !== 'AbortError') {
          console.error('Native share failed:', error);
          toast.error('Unable to open native share dialog.');
        }
      }
    } else {
      setIsModalOpen(true);
    }
  };

  const handleCopyLink = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareMeta.url);
      } else if (typeof document !== 'undefined') {
        const tempInput = document.createElement('input');
        tempInput.value = shareMeta.url;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
      }

      setCopied(true);
      toast.success('Link copied to clipboard!');
      trackEvent('share_product', {
        method: 'copy_link',
        url: shareMeta.url,
        title: shareMeta.title
      });

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Copy failed:', error);
      toast.error('Could not copy link. Please try again.');
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        type="button"
        onClick={handleNativeShare}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20 backdrop-blur border border-white/30 text-gray-700 dark:text-gray-200 hover:bg-white/30 transition-all"
        aria-label="Share product"
      >
        <FaShareAlt size={16} />
      </button>

      {shareOptions.map((option) => (
        <button
          key={option.name}
          type="button"
          onClick={() => openShareWindow(option.url, option.name.toLowerCase())}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur border border-white/20 text-gray-600 dark:text-gray-300 hover:bg-white/25 transition-all"
          aria-label={`Share on ${option.name}`}
        >
          <option.icon size={16} />
        </button>
      ))}

      <button
        type="button"
        onClick={handleCopyLink}
        className={`flex items-center justify-center w-10 h-10 rounded-full border border-white/20 transition-all ${
          copied ? 'bg-green-500 text-white' : 'bg-white/10 backdrop-blur text-gray-600 dark:text-gray-300 hover:bg-white/25'
        }`}
        aria-label="Copy share link"
      >
        {copied ? <FaCheck size={16} /> : <FaCopy size={16} />}
      </button>

      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 backdrop-blur border border-white/20 text-gray-600 dark:text-gray-300 hover:bg-white/25 transition-all"
        aria-label="More share options"
      >
        <FaEllipsisH size={16} />
      </button>

      <ShareModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        url={shareMeta.url}
        title={shareMeta.title}
        description={shareMeta.description}
        image={shareMeta.image}
      />
    </div>
  );
};

SocialShare.propTypes = {
  url: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  image: PropTypes.string,
  className: PropTypes.string
};

export default SocialShare;
