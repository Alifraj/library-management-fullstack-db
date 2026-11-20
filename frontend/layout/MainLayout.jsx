// frontend/src/layouts/MainLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../pages/Navbar';  // On déplace Navbar dans components/

const MainLayout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Navbar visible partout sauf getstarted/login */}
      <Navbar />
      
      <main style={{ flex: 1 }}>
        <Outlet /> {/* Ici s’affiche la page enfant (Dashboard, Admin, etc.) */}
      </main>
    </div>
  );
};

export default MainLayout;