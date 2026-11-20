// frontend/src/components/ProtectedRoute.jsx

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { user } = useAuth();

    if (!user) {
        // Si l'utilisateur n'est pas connecté, on le renvoie vers le Login
        // "replace" empêche l'utilisateur de revenir en arrière avec le bouton "Précédent"
        return <Navigate to="/login" replace />;
    }

    // Si l'utilisateur est connecté, on affiche la page demandée (l'enfant)
    return children;
};

export default ProtectedRoute;