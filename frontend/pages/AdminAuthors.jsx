// frontend/src/pages/admin/AdminAuthors.jsx

import React, { useState, useEffect } from 'react';
import { authorService } from '../services/authors';
import Lottie from 'lottie-react';
// 👇 Place ton fichier JSON ici : src/animations/writer.json
// Si tu n'en as pas, commente cette ligne pour l'instant
import writerAnimation from '../animations/STUDENT.json'; 
import '../styles/AdminAuthors.css'

const AdminAuthors = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // État pour le MODAL
  const [selectedAuthor, setSelectedAuthor] = useState(null);

  // Formulaire
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [biography, setBiography] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    loadAuthors();
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, []);

  const loadAuthors = async () => {
    try {
      const data = await authorService.getAll();
      setAuthors(data);
    } catch (err) {
      showMsg('error', 'Impossible de charger les auteurs');
    } finally {
      setLoading(false);
    }
  };

  const showMsg = (type, text) => {
    setMsg({ type, text });
    setTimeout(() => setMsg({ type: '', text: '' }), 5000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName) return showMsg('error', 'Prénom et nom requis');
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append('first_name', firstName);
    formData.append('last_name', lastName);
    if (biography) formData.append('biography', biography);
    if (imageFile) formData.append('image', imageFile);

    try {
      await authorService.create(formData);
      showMsg('success', 'Auteur ajouté avec succès !');
      resetForm();
      loadAuthors();
    } catch (err) {
      showMsg('error', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFirstName('');
    setLastName('');
    setBiography('');
    setImageFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // 🛑 Empêche d'ouvrir le modal quand on clique sur supprimer
    if (!window.confirm('Voulez-vous vraiment supprimer cet auteur ?')) return;
    try {
      await authorService.delete(id);
      showMsg('success', 'Auteur supprimé');
      // Si l'auteur supprimé était ouvert dans le modal, on le ferme
      if (selectedAuthor && selectedAuthor.author_id === id) setSelectedAuthor(null);
      loadAuthors();
    } catch (err) {
      showMsg('error', err.message);
    }
  };

  // --- Gestion du Modal ---
  const openModal = (author) => setSelectedAuthor(author);
  const closeModal = () => setSelectedAuthor(null);

  if (loading) return <div className="loading-screen">Chargement...</div>;

  return (
    <div className="admin-page-container">
      <div className="admin-content-wrapper">
        
        {/* --- Header avec Lottie --- */}
        <div className="admin-header">
          {/* Vérifie si l'animation est importée avant de l'afficher */}
          {writerAnimation && (
            <div className="lottie-container">
              <Lottie animationData={writerAnimation} loop={true} style={{ height: 120 }} />
            </div>
          )}
          <h1>Gestion des Auteurs</h1>
          <p>Ajoutez et gérez les écrivains de votre bibliothèque.</p>
        </div>

        {msg.text && (
          <div className={`notification ${msg.type}`}>
            {msg.type === 'success' ? '✅' : '⚠️'} {msg.text}
          </div>
        )}

        {/* --- Formulaire --- */}
        <div className="admin-card form-section">
          <div className="card-header">
            <h2>Nouvel Auteur</h2>
          </div>
          
          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-layout">
              <div className="image-upload-wrapper">
                <div className={`image-preview-circle ${preview ? 'has-image' : ''}`}>
                  {preview ? (
                    <img src={preview} alt="Aperçu" />
                  ) : (
                    <div className="upload-placeholder">📷</div>
                  )}
                </div>
                <label className="custom-file-upload">
                  {imageFile ? 'Changer' : 'Photo'}
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                </label>
              </div>

              <div className="text-inputs-wrapper">
                <div className="form-row">
                  <div className="form-group">
                    <label>Prénom</label>
                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                  </div>
                  <div className="form-group">
                    <label>Nom</label>
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Biographie</label>
                  <textarea value={biography} onChange={(e) => setBiography(e.target.value)} rows={3} />
                </div>

                <button type="submit" className="submit-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Envoi...' : "Enregistrer"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* --- Liste des Auteurs --- */}
        <div className="list-section">
          <h2>Catalogue ({authors.length})</h2>
          <div className="authors-grid">
            {authors.map((author) => (
              <div 
                key={author.author_id} 
                className="author-card-item" 
                onClick={() => openModal(author)} // 👇 Ouvre le modal
                title="Cliquez pour voir les détails"
              >
                <div className="card-avatar">
                  <img src={author.author_url || 'https://via.placeholder.com/150'} alt={author.last_name} />
                </div>
                <div className="card-info">
                  <h3>{author.first_name} {author.last_name}</h3>
                  <span className="info-hint">Voir détails</span>
                </div>
                <button
                  onClick={(e) => handleDelete(e, author.author_id)}
                  className="icon-delete-btn"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* --- LE MODAL --- */}
      {selectedAuthor && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={closeModal}>&times;</button>
            
            <div className="modal-header-img">
               <img 
                 src={selectedAuthor.author_url || 'https://via.placeholder.com/300?text=Pas+d\'image'} 
                 alt={selectedAuthor.last_name} 
               />
            </div>
            
            <div className="modal-body">
              <h2>{selectedAuthor.first_name} {selectedAuthor.last_name}</h2>
              <div className="modal-bio">
                <h3>Biographie</h3>
                <p>{selectedAuthor.biography || "Aucune biographie disponible pour cet auteur."}</p>
              </div>
              <div className="modal-footer">
                <span className="author-id">ID: {selectedAuthor.author_id}</span>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminAuthors;