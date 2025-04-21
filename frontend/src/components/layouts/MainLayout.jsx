// src/components/layouts/MainLayout.jsx
import React from 'react';
import Header from '../common/Header';
import Footer from '../common/Footer';

const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
