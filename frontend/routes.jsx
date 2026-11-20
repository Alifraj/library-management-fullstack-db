// frontend/src/AppRoutes.jsx
import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';


import LoginPage from './pages/LoginPage';
import GetStarted from './pages/GetStarted';
import ProtectedRoute from './pages/ProtectedRoute';
import Navbar from './pages/Navbar';
import AdminAuthors from './pages/AdminAuthors';
import AdminRoute from './pages/AdminRoute';
import AdminBooks from './pages/AdminBooks';
import ProfilePage from './pages/ProfilePage';
import AdminUsers from './pages/AdminUsers';
import DashboardPage from './pages/DashboardPage';
import MyLoansPage from './pages/MyLoansPage';

// Layout avec Navbar
const LayoutWithNavbar = () => (
  <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
    <Navbar />
    <div style={{ flex: 1, width: '100%', position: 'relative' }}>
      <Outlet /> {/* Ceci est crucial pour afficher les routes enfants */}
    </div>
  </div>
);

// Layout sans Navbar
const LayoutWithoutNavbar = () => (
  <div style={{ minHeight: '100vh', width: '100%' }}>
    <Outlet /> {/* Ceci est crucial pour afficher les routes enfants */}
  </div>
);

const AppRoutes = () => (
  <Routes>
    {/* --- Routes Publiques sans Navbar --- */}
    <Route element={<LayoutWithoutNavbar />}>
      <Route path="/getstarted" element={<GetStarted />} />
      <Route path="/login" element={<LoginPage />} />
    </Route>

    {/* --- Routes avec Navbar (et protection) --- */}
    <Route element={<LayoutWithNavbar />}>
      {/* Route racine protégée */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Route dashboard protégée */}
     <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Route admin avec double protection */}
   {/* Gestion des Auteurs */}
      <Route 
        path="/admin/authors" 
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminAuthors />
            </AdminRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/my-loans" 
        element={
          <ProtectedRoute>
            <MyLoansPage />
          </ProtectedRoute>
        } 
      />

      {/* 👇 Gestion des Livres (AJOUTÉ ICI) */}
      <Route 
        path="/admin/books" 
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminBooks />
            </AdminRoute>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/users" 
        element={
          <ProtectedRoute>
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          </ProtectedRoute>
        } 
      />

      <Route 
        path="/profile" 
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } 
      />
    </Route>
  </Routes>
);

export default AppRoutes;