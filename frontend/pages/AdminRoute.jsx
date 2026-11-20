// frontend/src/components/AdminRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Chargement...</div>;

    // Si pas connecté ou si le rôle n'est pas 'admin'
    if (!user || user.role !== 'admin') {
        // On redirige vers l'accueil (ou une page "Accès Interdit")
        return <Navigate to="/" replace />;
    }

    return children;
};

export default AdminRoute;