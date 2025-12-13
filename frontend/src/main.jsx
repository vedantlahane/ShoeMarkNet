// src/main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { QueryClientProvider } from '@tanstack/react-query';

import './index.css';
import App from './App.jsx';
import getQueryClient from './lib/queryClient';

const queryClient = getQueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName="pointer-events-none"
        containerStyle={{
          top: 20,
          right: 20,
        }}
        toastOptions={{
          className:
            'pointer-events-auto rounded-2xl border border-slate-200 bg-white/90 text-slate-900 shadow-lg backdrop-blur-lg transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900/90 dark:text-slate-100',
          duration: 4000,
          style: {
            padding: '16px 20px',
            fontSize: '14px',
            fontWeight: 500,
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
    </QueryClientProvider>
  </StrictMode>
);
