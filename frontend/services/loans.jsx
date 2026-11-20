// frontend/src/services/loans.js

const API_URL = 'http://localhost:3001/api/loans';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

export const loanService = {
  // 1. Voir mes emprunts (GET)
  getMyLoans: async () => {
    const res = await fetch(API_URL, { headers: getHeaders() });
    if (!res.ok) throw new Error("Impossible de charger les emprunts");
    return await res.json();
  },

  // 2. Emprunter un livre (POST)
  borrowBook: async (bookId) => {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ book_id: bookId })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Erreur lors de l'emprunt");
    }
    return data;
  },

  // 3. Retourner un livre (PUT)
  returnBook: async (loanId) => {
    
    const res = await fetch(`${API_URL}/${loanId}/return`, {
      method: 'PUT',
      headers: getHeaders()
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Erreur lors du retour");
    }
    return data;
  }
};