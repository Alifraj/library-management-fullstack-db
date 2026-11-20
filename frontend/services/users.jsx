// frontend/src/services/users.js

const API_URL = 'http://localhost:3001/api/users';

const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem('token');
  const headers = { Authorization: token ? `Bearer ${token}` : '' };
  if (!isFormData) headers['Content-Type'] = 'application/json';
  return headers;
};

export const userService = {
  // --- ADMIN ---
  getAll: async () => {
    const res = await fetch(API_URL, { headers: getHeaders() });
    if (!res.ok) throw new Error("Erreur chargement utilisateurs");
    return await res.json();
  },

  deleteUser: async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (!res.ok) throw new Error("Erreur suppression utilisateur");
    return true;
  },

  // --- PROFIL 
  getProfile: async () => {
    const res = await fetch(`${API_URL}/me`, { headers: getHeaders() });
    if (!res.ok) throw new Error("Erreur chargement profil");
    return await res.json();
  },

  updateProfile: async (formData) => {
    const res = await fetch(`${API_URL}/me`, {
      method: 'PUT',
      headers: getHeaders(true), // true car FormData (Image)
      body: formData
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || "Erreur mise à jour profil");
    }
    return await res.json();
  }
};