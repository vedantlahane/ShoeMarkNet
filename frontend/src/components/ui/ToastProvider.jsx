// src/components/ui/ToastProvider.jsx
import React, { useEffect, useRef, useState } from 'react';
import { Toaster, resolveValue, ToastIcon, toast } from 'react-hot-toast';
import { X } from 'lucide-react';

import useReducedMotion from '../../hooks/useReducedMotion';

const AnimatedToast = ({ t, onRemove }) => {
  const toastRef = useRef(null);
  const prefersReducedMotion = useReducedMotion();
  const [hasAppeared, setHasAppeared] = useState(prefersReducedMotion);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) {
      setHasAppeared(true);
      return undefined;
    }

    const raf = window.requestAnimationFrame(() => setHasAppeared(true));
    return () => window.cancelAnimationFrame(raf);
  }, [prefersReducedMotion]);

  useEffect(() => {
    if (t.visible) {
      setIsExiting(false);
      return undefined;
    }

    if (prefersReducedMotion) {
      onRemove(t.id);
      return undefined;
    }

    setIsExiting(true);
    const timeout = window.setTimeout(() => onRemove(t.id), 220);
    return () => window.clearTimeout(timeout);
  }, [t.visible, t.id, onRemove, prefersReducedMotion]);

  const animationClasses = prefersReducedMotion
    ? ''
    : isExiting
      ? 'opacity-0 translate-x-6 scale-95'
      : hasAppeared
        ? 'opacity-100 translate-x-0 scale-100'
        : 'opacity-0 translate-x-6 scale-95';

  return (
    <div
      ref={toastRef}
      className={`premium-toast ${prefersReducedMotion ? '' : 'transition-all duration-200 ease-out'} ${animationClasses}`}
      style={t.style}
      role="status"
      aria-live={t.ariaLive || 'polite'}
    >
      <ToastIcon toast={t} />
      <div className="flex-1">{resolveValue(t.message, t)}</div>
      {t.type !== 'loading' && (
        <button
          type="button"
          onClick={() => toast.dismiss(t.id)}
          className="p-1 rounded-full hover:bg-white/10 transition-colors"
          aria-label="Dismiss notification"
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
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)'
          }
        }}
      >
        {(t) => <AnimatedToast t={t} onRemove={toast.remove} />}
      </Toaster>
    </>
  );
};

export default ToastProvider;
