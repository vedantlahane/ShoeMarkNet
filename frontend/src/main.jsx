// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster 
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName="toast-container"
      containerStyle={{
        top: 20,
        right: 20,
      }}
      toastOptions={{
        className: 'premium-toast',
        duration: 4000,
        style: {
          background: 'var(--toast-background)',
          backdropFilter: 'var(--glass-blur)',
          border: '1px solid var(--toast-border)',
          borderRadius: '16px',
          color: 'var(--toast-color)',
          fontSize: '14px',
          fontWeight: '500',
          padding: '16px 20px',
          boxShadow: 'var(--toast-shadow)',
        },
        success: {
          iconTheme: {
            primary: '#22c55e',
            secondary: '#ffffff',
          },
        },
        error: {
          iconTheme: {
            primary: '#ef4444',
            secondary: '#ffffff',
          },
        },
      }}
    />
  </StrictMode>
);
