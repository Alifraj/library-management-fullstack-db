// frontend/src/services/api.js

// URL de base de ton API
const BASE_URL = 'http://localhost:3001/api';

/**
 * Fonction générique pour effectuer des requêtes API
 * Elle ajoute automatiquement le token si l'utilisateur est connecté.
 */
export const request = async (endpoint, method = 'GET', body = null) => {
    // 1. Récupération du token (doit correspondre à ce que tu as mis dans AuthContext)
    const token = localStorage.getItem('token'); 

    // 2. Configuration des Headers
    const headers = {
        'Content-Type': 'application/json',
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // 3. Configuration Fetch
    const config = {
        method,
        headers,
    };

    if (body) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, config);

        // 4. Gestion des erreurs HTTP (400, 401, 500...)
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            // On lance une erreur propre pour que le Frontend puisse l'afficher
            throw new Error(errorData.error || errorData.message || `Erreur ${response.status}`);
        }

        // 5. Retourner la réponse JSON
        // On vérifie si la réponse contient du texte avant de parser (utile pour DELETE qui peut ne rien renvoyer)
        const text = await response.text();
        return text ? JSON.parse(text) : {};

    } catch (error) {
        console.error(`API Error on ${endpoint}:`, error);
        throw error; // On relance l'erreur vers le composant
    }
};  