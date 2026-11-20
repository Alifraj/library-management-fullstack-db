// Définir l'URL de base de votre API Express (assurez-vous qu'elle est correcte)
const API_URL = 'http://localhost:3001/api/auth';

/**
 * Fonction générique pour gérer les requêtes POST.
 * @param {string} endpoint - 'signIn' ou 'signUp'.
 * @param {object} credentials - { email, password, username? }
 * @returns {object} - L'objet de réponse de l'API (token, user_id, role ou erreur).
 */
const handleAuthRequest = async (endpoint, credentials) => {
    try {
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });

        const data = await response.json();

        if (!response.ok) {
            // Gérer les erreurs HTTP (400, 401, 409, etc.)
            // Throw pour que la fonction appelante puisse gérer l'erreur facilement
            throw new Error(data.error || data.message || `Erreur HTTP: ${response.status}`);
        }

        return data; // Contient { message, token, user_id, role, etc. }

    } catch (error) {
        // Gérer les erreurs réseau ou les erreurs lancées par 'throw new Error'
        console.error(`Erreur lors de la requête ${endpoint}:`, error);
        throw error;
    }
};

/**
 * Inscription de l'utilisateur
 */
export const signUp = async (email, password, username) => {
    return handleAuthRequest('signUp', { email, password, username });
};

/**
 * Connexion de l'utilisateur et récupération du JWT
 */
export const signIn = async (email, password) => {
    const data = await handleAuthRequest('signIn', { email, password });
    
    // Si la connexion réussit, stocker le token et les infos dans le localStorage
    if (data.token) {
        localStorage.setItem('userToken', data.token);
        localStorage.setItem('userRole', data.role);
        localStorage.setItem('userId', data.user_id);
    }
    
    return data;
};

/**
 * Déconnexion de l'utilisateur (suppression du token)
 */
export const signOut = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    // Le serveur n'a pas besoin d'être contacté dans cette architecture JWT simple.
};