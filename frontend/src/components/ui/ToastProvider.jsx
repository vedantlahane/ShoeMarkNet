// src/components/ui/ToastProvider.jsx
import React, { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { gsap } from 'gsap';

const ToastProvider = ({ children }) => {
  useEffect(() => {
    // Animate toast entrance with GSAP
    const handleToastShow = (toast) => {
      const toastEl = document.querySelector(`[data-toast-id="${toast.id}"]`);
      if (toastEl) {
        gsap.fromTo(
          toastEl,
          {
            x: 100,
            opacity: 0,
            scale: 0.9,
          },
          {
            x: 0,
            opacity: 1,
            scale: 1,
            duration: 0.4,
            ease: "back.out(1.2)",
          }
        );
      }
    };

    // Animate toast exit with GSAP
    const handleToastHide = (toast) => {
      const toastEl = document.querySelector(`[data-toast-id="${toast.id}"]`);
      if (toastEl) {
        gsap.to(toastEl, {
          x: 100,
          opacity: 0,
          scale: 0.9,
          duration: 0.3,
          ease: "back.in(1.2)",
        });
      }
    };

    // Add event listeners for toast animations
    const toastContainer = document.querySelector('.toast-container');
    if (toastContainer) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1 && node.classList.contains('premium-toast')) {
              gsap.fromTo(
                node,
                {
                  x: 100,
                  opacity: 0,
                  scale: 0.9,
                  rotateX: -10,
                },
                {
                  x: 0,
                  opacity: 1,
                  scale: 1,
                  rotateX: 0,
                  duration: 0.5,
                  ease: "back.out(1.4)",
                  onComplete: () => {
                    // Add subtle floating animation
                    gsap.to(node, {
                      y: -2,
                      duration: 1.5,
                      repeat: -1,
                      yoyo: true,
                      ease: "sine.inOut",
                    });
                  },
                }
              );
            }
          });
        });
      });

      observer.observe(toastContainer, {
        childList: true,
        subtree: true,
      });

      return () => observer.disconnect();
    }
  }, []);

  return (
    <>
      {children}
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={12}
        containerClassName="toast-container fixed top-4 right-4 z-50"
        containerStyle={{
          top: 20,
          right: 20,
          zIndex: 9999,
        }}
        toastOptions={{
          className: 'premium-toast',
          duration: 4000,
          style: {
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '16px',
            color: '#ffffff',
            fontSize: '14px',
            fontWeight: '500',
            padding: '16px 20px',
            minHeight: '64px',
            minWidth: '300px',
            maxWidth: '400px',
            boxShadow: `
              0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04),
              inset 0 1px 0 rgba(255, 255, 255, 0.1)
            `,
            transform: 'translateZ(0)', // Force hardware acceleration
            willChange: 'transform, opacity',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#ffffff',
            },
            style: {
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(16, 185, 129, 0.12) 100%)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              boxShadow: `
                0 20px 25px -5px rgba(34, 197, 94, 0.1),
                0 10px 10px -5px rgba(34, 197, 94, 0.04),
                inset 0 1px 0 rgba(34, 197, 94, 0.2)
              `,
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },
            style: {
              background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.12) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              boxShadow: `
                0 20px 25px -5px rgba(239, 68, 68, 0.1),
                0 10px 10px -5px rgba(239, 68, 68, 0.04),
                inset 0 1px 0 rgba(239, 68, 68, 0.2)
              `,
            },
          },
          loading: {
            iconTheme: {
              primary: '#3b82f6',
              secondary: '#ffffff',
            },
            style: {
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(37, 99, 235, 0.12) 100%)',
              border: '1px solid rgba(59, 130, 246, 0.3)',
              boxShadow: `
                0 20px 25px -5px rgba(59, 130, 246, 0.1),
                0 10px 10px -5px rgba(59, 130, 246, 0.04),
                inset 0 1px 0 rgba(59, 130, 246, 0.2)
              `,
            },
          },
          blank: {
            style: {
              background: 'linear-gradient(135deg, rgba(75, 85, 99, 0.12) 0%, rgba(55, 65, 81, 0.12) 100%)',
              border: '1px solid rgba(75, 85, 99, 0.3)',
              boxShadow: `
                0 20px 25px -5px rgba(75, 85, 99, 0.1),
                0 10px 10px -5px rgba(75, 85, 99, 0.04),
                inset 0 1px 0 rgba(75, 85, 99, 0.2)
              `,
            },
          },
        }}
      />

      {/* Custom toast styles for dark mode */}
      <style jsx>{`
        @media (prefers-color-scheme: dark) {
          .premium-toast {
            background: rgba(0, 0, 0, 0.2) !important;
            border: 1px solid rgba(255, 255, 255, 0.15) !important;
            color: #ffffff !important;
          }
        }

        .premium-toast:hover {
          transform: scale(1.02) translateY(-2px) !important;
          box-shadow: 
            0 25px 50px -12px rgba(0, 0, 0, 0.25),
            inset 0 1px 0 rgba(255, 255, 255, 0.15) !important;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        }

        @media (max-width: 640px) {
          .toast-container {
            left: 16px !important;
            right: 16px !important;
            top: 16px !important;
            width: auto !important;
          }
          
          .premium-toast {
            margin: 0 !important;
            width: 100% !important;
            max-width: none !important;
            min-width: auto !important;
          }
        }
      `}</style>
    </>
  );
};

export default ToastProvider;
