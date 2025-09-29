// src/components/ui/ToastProvider.jsx
import React from 'react';
import { Toaster, resolveValue, ToastIcon, toast } from 'react-hot-toast';
import { X } from 'lucide-react';
import { gsap } from 'gsap';

// Hooks
import useGsap from '../../hooks/useGsap';
import useReducedMotion from '../../hooks/useReducedMotion';

const AnimatedToast = ({ t, onRemove }) => {
  const prefersReducedMotion = useReducedMotion();

  const toastRef = useGsap((_, toastEl) => {
    if (!toastEl) {
      return undefined;
    }

    if (prefersReducedMotion) {
      if (!t.visible) {
        onRemove(t.id);
      }
      return () => {};
    }

    let floatTween;
    let activeTween;

    if (t.visible) {
      activeTween = gsap.fromTo(
        toastEl,
        { x: 100, opacity: 0, scale: 0.9 },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: 'back.out(1.2)',
          onComplete: () => {
            floatTween = gsap.to(toastEl, {
              y: -2,
              duration: 1.5,
              repeat: -1,
              yoyo: true,
              ease: 'sine.inOut',
            });
          },
        }
      );
    } else {
      activeTween = gsap.to(toastEl, {
        x: 100,
        opacity: 0,
        scale: 0.9,
        duration: 0.3,
        ease: 'back.in(1.2)',
        onComplete: () => onRemove(t.id),
      });
    }

    return () => {
      if (floatTween) {
        floatTween.kill();
      }
      if (activeTween) {
        activeTween.kill();
      }
      gsap.killTweensOf(toastEl);
    };
  }, [t.visible, prefersReducedMotion]);

  return (
    <div ref={toastRef} className="premium-toast" style={t.style}>
      <ToastIcon toast={t} />
      <div className="flex-1">{resolveValue(t.message, t)}</div>
      {t.type !== 'loading' && (
        <button
          onClick={() => toast.dismiss(t.id)}
          className="p-1 rounded-full hover:bg-white/10 transition-colors"
        >
          <X size={16} />
        </button>
      )}
    </div>
  );
};

const ToastProvider = ({ children }) => {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={12}
        containerClassName="toast-container"
        toastOptions={{
          className: 'premium-toast',
          duration: 4000,
          style: {
            background: 'rgba(30, 30, 30, 0.7)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#fff',
            fontSize: '14px',
            padding: '12px 16px',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
          },
        }}
      >
        {(t) => <AnimatedToast t={t} onRemove={toast.remove} />}
      </Toaster>
    </>
  );
};

export default ToastProvider;
