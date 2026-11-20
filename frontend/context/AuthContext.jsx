// frontend/src/context/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
// On utilise ton fichier api.js pour faire les requêtes proprement
import { request } from '../services/api'; 

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Lecture sécurisée au démarrage
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedToken && storedUser && storedUser !== "undefined") {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Données locales corrompues. Nettoyage...");
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            // Utilise /signIn ou /login selon ton backend
            const data = await request('/auth/signIn', 'POST', { email, password });
            
            console.log("Réponse du Backend:", data); // 👇 Regarde ça dans ta console F12 !

            // Si le backend ne renvoie pas d'objet "user", on le construit nous-même
            // Cela évite le bug "undefined"
            const userData = data.user || {
                id: data.user_id || data.userId || data.id, 
                role: data.role,
                email: email
            };

            if (!data.token) throw new Error("Token manquant !");

            // Sauvegarde sécurisée
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(userData));
            
            setUser(userData);
            return true;
        } catch (error) {
            console.error("Erreur Login:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);