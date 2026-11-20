// frontend/src/services/authors.js
const API_URL = 'http://localhost:3001/api/authors';

const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem('token') || localStorage.getItem('userToken');
  const headers = {
    Authorization: token ? `Bearer ${token}` : '',
  };
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }
  return headers;
};

export const authorService = {
  getAll: async () => {
    const res = await fetch(API_URL, { headers: getHeaders() });
    if (!res.ok) throw new Error('Impossible de charger les auteurs');
    return res.json();
  },

  create: async (formData) => {
    const isFormData = formData instanceof FormData;
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(isFormData),
      body: isFormData ? formData : JSON.stringify(formData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Échec création');
    }
    return res.json();
  },

  update: async (id, formData) => {
    const isFormData = formData instanceof FormData;
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'PUT',
      headers: getHeaders(isFormData),
      body: isFormData ? formData : JSON.stringify(formData),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Échec mise à jour');
    }
    return res.json();
  },

  delete: async (id) => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Échec suppression');
  },
};