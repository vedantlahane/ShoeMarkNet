// src/index.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// import { Toaster } from 'react-hot-toast'; // ✅ Add this
import './index.css';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* <Toaster position="top-center" reverseOrder={false} /> Toast notification system */}
    <App /> {/* App already has Provider and BrowserRouter */}
  </StrictMode>
);
