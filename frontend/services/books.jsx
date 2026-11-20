// frontend/src/services/books.js

const API_URL = 'http://localhost:3001/api/books';

/**
 * Prépare les headers.
 *  IMPORTANT : Si on envoie du FormData (image), on NE DOIT PAS mettre 'Content-Type': 'application/json'.
 * Le navigateur s'en charge automatiquement pour inclure le fichier.
 */
const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem('token');
  const headers = {
    'Authorization': token ? `Bearer ${token}` : ''
  };
  
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  
  return headers;
};

export const bookService = {
  // 1. Récupérer tous les livres
  getAll: async () => {
    const res = await fetch(API_URL, { headers: getHeaders() });
    if (!res.ok) throw new Error("Impossible de charger les livres");
    
    const data = await res.json();
    // Sécurité : on s'assure de renvoyer un tableau
    return Array.isArray(data) ? data : (data.books || []);
  },

  // 2. Créer un livre (avec Image)
  create: async (formData) => {
    // formData est un objet natif JS pour les fichiers
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(true), // true car c'est du FormData
      body: formData 
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Erreur lors de la création du livre");
    }
    return await res.json();
  },

  // 3. Supprimer un livre
  delete: async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Erreur lors de la suppression");
    }
    return true;
  }
};