// frontend/src/pages/ProfilePage.jsx

import React, { useState, useEffect } from 'react';
import { userService } from '../services/users';
import { useAuth } from '../context/AuthContext';
import '../styles/AdminAuthors.css'; // On réutilise le style Admin pour la cohérence

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [userEmail, setUserEmail] = useState(''); // L'email ne se change pas ici
  const [role, setRole] = useState('');

  // Formulaire
  const [formData, setFormData] = useState({
    username: '', first_name: '', last_name: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null); // URL avatar actuel ou preview

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await userService.getProfile();
      setFormData({
        username: data.username || '',
        first_name: data.first_name || '',
        last_name: data.last_name || ''
      });
      setPreview(data.avatar_url);
      setUserEmail(data.users?.email); // Relation DB
      setRole(data.users?.role);
    } catch (err) {
      setMsg({ type: 'error', text: "Erreur chargement profil" });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg({ type: '', text: '' });

    const data = new FormData();
    data.append('username', formData.username);
    data.append('first_name', formData.first_name);
    data.append('last_name', formData.last_name);
    if (imageFile) data.append('image', imageFile);

    try {
      const response = await userService.updateProfile(data);
      setMsg({ type: 'success', text: "Profil mis à jour !" });
      // Optionnel : Mettre à jour l'avatar affiché avec la réponse du serveur
      setPreview(response.profile.avatar_url);
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  if (loading) return <div className="loading-screen">Chargement du profil...</div>;

  return (
    <div className="admin-page-container">
      <div className="admin-content-wrapper" style={{ maxWidth: '800px' }}>
        
        <div className="admin-header">
          <h1>Mon Profil</h1>
          <p>Gérez vos informations personnelles.</p>
        </div>

        {msg.text && <div className={`notification ${msg.type}`}>{msg.text}</div>}

        <div className="admin-card form-section">
          <div className="card-header">
            <h2>{userEmail} <span style={{fontSize:'0.8rem', opacity:0.7}}>({role})</span></h2>
          </div>

          <form onSubmit={handleSubmit} className="admin-form">
            <div className="form-layout" style={{ gridTemplateColumns: '1fr' }}>
              
              {/* Avatar Centré */}
              <div className="image-upload-wrapper">
                <div className="image-preview-circle has-image" style={{ width: '150px', height: '150px' }}>
                  <img src={preview || 'https://via.placeholder.com/150'} alt="Avatar" />
                </div>
                <label className="custom-file-upload">
                  Changer l'avatar
                  <input type="file" accept="image/*" onChange={handleFileChange} />
                </label>
              </div>

              {/* Champs */}
              <div className="text-inputs-wrapper">
                <div className="form-group">
                  <label>Nom d'utilisateur (Pseudo)</label>
                  <input 
                    value={formData.username} 
                    onChange={(e) => setFormData({...formData, username: e.target.value})} 
                    required 
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Prénom</label>
                    <input 
                      value={formData.first_name} 
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})} 
                    />
                  </div>
                  <div className="form-group">
                    <label>Nom</label>
                    <input 
                      value={formData.last_name} 
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})} 
                    />
                  </div>
                </div>

                <button type="submit" className="submit-btn">Mettre à jour</button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;