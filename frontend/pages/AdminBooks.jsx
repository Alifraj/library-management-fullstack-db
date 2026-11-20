// frontend/src/pages/admin/AdminBooks.jsx

import React, { useState, useEffect } from 'react';
import { bookService } from '../services/books';
import { authorService } from '../services/authors'; // Pour le dropdown auteurs
import Lottie from 'lottie-react';
// Tu peux utiliser la même animation ou en télécharger une "Book" sur Lottiefiles
import bookAnimation from '../animations/Books stack.json'; 
import '../styles/AdminBooks.css';

const AdminBooks = () => {
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]); // Liste des auteurs pour le select
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  
  // État pour le MODAL
  const [selectedBook, setSelectedBook] = useState(null);

  // Formulaire
  const [formData, setFormData] = useState({
    title: '', isbn: '', publication_year: '', 
    publisher: '', stock_quantity: 1, description: '', author_id: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  // Chargement Initial
  useEffect(() => {
    loadData();
    // Nettoyage mémoire image
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, []);

  const loadData = async () => {
    try {
      // On charge les Livres ET les Auteurs en parallèle
      const [booksData, authorsData] = await Promise.all([
        bookService.getAll(),
        authorService.getAll()
      ]);
      setBooks(booksData);
      setAuthors(authorsData);
    } catch (err) {
      showMsg('error', 'Erreur de connexion au serveur.');
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 5000);
  };

  // Gestion Image
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(file));
    }
  };

  // Gestion Champs Texte
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Soumission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.author_id) return showMsg('error', 'Veuillez sélectionner un auteur.');
    
    setIsSubmitting(true);

    const data = new FormData();
    // Ajout automatique de tous les champs texte
    Object.keys(formData).forEach(key => {
      data.append(key, formData[key]);
    });
    // Ajout image si présente
    if (imageFile) data.append('image', imageFile);

    try {
      await bookService.create(data);
      showMsg('success', 'Livre ajouté avec succès !');
      resetForm();
      loadData();
    } catch (err) {
      showMsg('error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '', isbn: '', publication_year: '', 
      publisher: '', stock_quantity: 1, description: '', author_id: ''
    });
    setImageFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Stop pour ne pas ouvrir le modal
    if (!window.confirm('Supprimer ce livre ?')) return;
    try {
      await bookService.delete(id);
      showMsg('success', 'Livre supprimé.');
      if (selectedBook && selectedBook.book_id === id) setSelectedBook(null);
      loadData();
    } catch (err) {
      showMsg('error', err.message);
    }
  };

  if (loading) return <div className="loading-screen">Chargement de la bibliothèque...</div>;

  return (
    <div className="admin-page-container">
      <div className="admin-content-wrapper">
        
        {/* HEADER */}
        <div className="admin-header">
          <div className="lottie-container">
            <Lottie animationData={bookAnimation} loop={true} style={{ height: 100 }} />
          </div>
          <h1>Gestion des Livres</h1>
          <p>Gérez le catalogue, les stocks et les parutions.</p>
        </div>

        {msg.text && <div className={`notification ${msg.type}`}>{msg.text}</div>}

        {/* FORMULAIRE */}
        <div className="admin-card form-section">
          <div className="card-header"><h2>Nouveau Livre</h2></div>
          
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-layout">
              {/* Colonne Image */}
              <div className="image-upload-wrapper">
                <div className={`image-preview-rect ${preview ? 'has-image' : ''}`}>
                  {preview ? <img src={preview} alt="Cover" /> : <div className="upload-placeholder">📕</div>}
                </div>
                <label className="custom-file-upload">
                  {imageFile ? 'Changer' : 'Couverture'}
                  <input type="file" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>

              {/* Colonne Champs */}
              <div className="text-inputs-wrapper">
                <div className="form-row">
                  <div className="form-group">
                    <label>Titre</label>
                    <input name="title" value={formData.title} onChange={handleChange} required placeholder="Titre du livre" />
                  </div>
                  <div className="form-group">
                    <label>Auteur</label>
                    <select name="author_id" value={formData.author_id} onChange={handleChange} required>
                      <option value="">-- Sélectionner --</option>
                      {authors.map(a => (
                        <option key={a.author_id} value={a.author_id}>{a.first_name} {a.last_name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>ISBN</label>
                    <input name="isbn" value={formData.isbn} onChange={handleChange} required placeholder="Code ISBN" />
                  </div>
                  <div className="form-group">
                    <label>Stock</label>
                    <input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} required />
                  </div>
                </div>

                <div className="form-row">
                   <div className="form-group">
                    <label>Éditeur</label>
                    <input name="publisher" value={formData.publisher} onChange={handleChange} required />
                  </div>
                   <div className="form-group">
                    <label>Année</label>
                    <input type="number" name="publication_year" value={formData.publication_year} onChange={handleChange} />
                  </div>
                </div>

                <div className="form-group">
                  <label>Résumé</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={2} />
                </div>

                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? <span className="spinner"></span> : "Ajouter le Livre"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* LISTE */}
        <div className="list-section">
          <h2>Catalogue ({books.length})</h2>
          {books.length === 0 ? (
             <div className="empty-state">La bibliothèque est vide. Ajoutez des livres !</div>
          ) : (
            <div className="books-grid">
              {books.map((book) => (
                <div 
                  key={book.book_id} 
                  className="book-card-item"
                  onClick={() => setSelectedBook(book)}
                  title="Voir détails"
                >
                  <div className="book-cover-img">
                    <img src={book.cover_url || 'https://via.placeholder.com/150x220?text=No+Cover'} alt={book.title} />
                  </div>
                  <div className="book-card-info">
                    <h3>{book.title}</h3>
                    <p className="book-author">
                      {book.authors ? `${book.authors.first_name} ${book.authors.last_name}` : 'Auteur inconnu'}
                    </p>
                    <div className="book-badges">
                        <span className="badge-stock">Stock: {book.stock_quantity}</span>
                        <span className="badge-year">{book.publication_year}</span>
                    </div>
                  </div>
                  <button onClick={(e) => handleDelete(e, book.book_id)} className="icon-delete-btn">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* --- MODAL --- */}
      {selectedBook && (
        <div className="modal-overlay" onClick={() => setSelectedBook(null)}>
          <div className="modal-content book-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setSelectedBook(null)}>&times;</button>
            
            <div className="modal-book-layout">
                <div className="modal-book-cover">
                    <img src={selectedBook.cover_url || 'https://via.placeholder.com/300'} alt={selectedBook.title} />
                </div>
                <div className="modal-book-details">
                    <h2>{selectedBook.title}</h2>
                    <h3 className="modal-author-name">
                        par {selectedBook.authors?.first_name} {selectedBook.authors?.last_name}
                    </h3>
                    
                    <div className="modal-meta-grid">
                        <div><strong>ISBN:</strong> {selectedBook.isbn}</div>
                        <div><strong>Éditeur:</strong> {selectedBook.publisher}</div>
                        <div><strong>Année:</strong> {selectedBook.publication_year}</div>
                        <div><strong>Stock:</strong> {selectedBook.stock_quantity} ex.</div>
                    </div>

                    <div className="modal-desc">
                        <h4>Résumé</h4>
                        <p>{selectedBook.description || "Aucun résumé disponible."}</p>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminBooks;