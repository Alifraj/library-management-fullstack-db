// frontend/src/pages/DashboardPage.jsx

import React, { useState, useEffect } from 'react';
import { bookService } from '../services/books';
import { loanService } from '../services/loans';
import '../styles/Dashboard.css'; 

const DashboardPage = () => {
  const [books, setBooks] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      const data = await bookService.getAll();
      setBooks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBorrow = async (bookId) => {
    if (!window.confirm("Voulez-vous emprunter ce livre ?")) return;
    
    try {
      await loanService.borrowBook(bookId);
      setMsg({ type: 'success', text: "Livre emprunté avec succès ! Consultez 'Mes Emprunts'." });
      loadBooks(); // Recharger pour mettre à jour le stock
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
    
    // Effacer le message après 3 secondes
    setTimeout(() => setMsg({ type: '', text: '' }), 3000);
  };

  // Filtrage local pour la recherche
  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.authors?.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="loading-container">Chargement de la bibliothèque...</div>;

  return (
    <div className="dashboard-container">
      
      {/* Header et Recherche */}
      <div className="dashboard-header-hero">
        <h1>Bienvenue à la Bibliothèque</h1>
        <p>Découvrez nos {books.length} ouvrages disponibles</p>
        
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Rechercher un titre ou un auteur..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Notifications */}
      {msg.text && (
        <div className={`msg-popup ${msg.type}`}>
          {msg.text}
        </div>
      )}

      {/* Grille des Livres */}
      <div className="dashboard-content">
        <div className="books-grid">
          {filteredBooks.map((book) => (
            <div key={book.book_id} className="book-card-public">
              <div className="cover-wrapper">
                <img 
                  src={book.cover_url || 'https://via.placeholder.com/200x300?text=No+Cover'} 
                  alt={book.title} 
                />
                {/* Badge de disponibilité */}
                <div className={`stock-badge ${book.stock_quantity > 0 ? 'in-stock' : 'out-of-stock'}`}>
                  {book.stock_quantity > 0 ? `${book.stock_quantity} dispo` : 'Rupture'}
                </div>
              </div>

              <div className="book-info-public">
                <h3>{book.title}</h3>
                <p className="author-name">
                  {book.authors ? `${book.authors.first_name} ${book.authors.last_name}` : 'Auteur Inconnu'}
                </p>
                <div className="book-meta">
                  <span>{book.publication_year}</span>
                  <span>{book.publisher}</span>
                </div>
                
                <button 
                  className="borrow-btn" 
                  disabled={book.stock_quantity <= 0}
                  onClick={() => handleBorrow(book.book_id)}
                >
                  {book.stock_quantity > 0 ? 'Emprunter' : 'Indisponible'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;