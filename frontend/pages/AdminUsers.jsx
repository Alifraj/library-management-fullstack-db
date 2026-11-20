// frontend/src/pages/admin/AdminUsers.jsx

import React, { useState, useEffect } from 'react';
import { userService } from '../services/users';
import '../styles/AdminUsers.css' ; 
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState({ type: '', text: '' });
  
  // État pour le Modal
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (err) {
      setMsg({ type: 'error', text: "Impossible de charger les utilisateurs" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation(); // Empêche l'ouverture du modal lors du clic sur supprimer
    if (!window.confirm("Supprimer DÉFINITIVEMENT cet utilisateur ?")) return;
    try {
      await userService.deleteUser(id);
      setMsg({ type: 'success', text: "Utilisateur supprimé." });
      // Si l'utilisateur supprimé était ouvert, on ferme le modal
      if (selectedUser && selectedUser.user_id === id) setSelectedUser(null);
      loadUsers();
    } catch (err) {
      setMsg({ type: 'error', text: err.message });
    }
  };

  // Fonction utilitaire pour l'avatar (Supabase ou Initiales)
  const getAvatarUrl = (profile) => {
    if (profile?.avatar_url) return profile.avatar_url;
    // Fallback : Génère une image avec les initiales
    const name = `${profile?.first_name || 'U'} ${profile?.last_name || 'N'}`;
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=256`;
  };

  if (loading) return <div className="loading-screen">Chargement des membres...</div>;

  return (
    <div className="admin-page-container">
      <div className="admin-content-wrapper">
        
        {/* Header */}
        <div className="admin-header">
          <h1>Gestion des Utilisateurs</h1>
          <p>Consultez et gérez les {users.length} membres de la bibliothèque.</p>
        </div>

        {msg.text && <div className={`notification ${msg.type}`}>{msg.text}</div>}

        {/* Grille des Utilisateurs */}
        <div className="list-section">
          <div className="users-grid">
            {users.map((u) => (
              <div 
                key={u.user_id} 
                className="user-card" 
                onClick={() => setSelectedUser(u)} // Ouvre le modal
                title="Voir détails"
              >
                
                {/* Avatar avec gestion d'erreur */}
                <div className="user-avatar">
                  <img 
                    src={getAvatarUrl(u.profiles)}
                    alt="Avatar"
                    onError={(e) => {
                        // Si l'image Supabase ne charge pas, on remet les initiales
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=User&background=ccc&color=fff`;
                    }}
                  />
                </div>

                {/* Infos */}
                <div className="user-info">
                  <h3 className="user-name">
                    {u.profiles?.first_name} {u.profiles?.last_name}
                  </h3>
                  <p className="user-username">@{u.profiles?.username || 'sans_pseudo'}</p>
                  
                  {/* Badge Rôle */}
                  <span className={`role-badge role-${u.role}`}>
                    {u.role}
                  </span>
                </div>

                {/* Bouton Supprimer */}
                <button 
                  className="delete-user-btn" 
                  onClick={(e) => handleDelete(e, u.user_id)}
                  title="Supprimer l'utilisateur"
                >
                  ✕
                </button>

              </div>
            ))}
          </div>
        </div>

      </div>

      {/* --- MODAL UTILISATEUR --- */}
      {selectedUser && (
        <div className="modal-overlay" onClick={() => setSelectedUser(null)}>
          <div className="modal-content user-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setSelectedUser(null)}>&times;</button>
            
            {/* Header du Modal (Fond coloré + Avatar) */}
            <div className="modal-user-header">
                <div className="modal-avatar-large">
                    <img src={getAvatarUrl(selectedUser.profiles)} alt="Avatar Large" />
                </div>
            </div>

            <div className="modal-body user-modal-body">
                <h2>{selectedUser.profiles?.first_name} {selectedUser.profiles?.last_name}</h2>
                <p className="modal-subtitle">@{selectedUser.profiles?.username}</p>
                
                <div className="user-details-grid">
                    <div className="detail-item">
                        <label>Email</label>
                        <span>{selectedUser.email}</span>
                    </div>
                    <div className="detail-item">
                        <label>Rôle</label>
                        <span className={`role-badge role-${selectedUser.role}`}>{selectedUser.role}</span>
                    </div>
                    <div className="detail-item">
                        <label>Membre depuis le</label>
                        <span>{new Date(selectedUser.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'long', year: 'numeric'
                        })}</span>
                    </div>
                    <div className="detail-item full-width">
                        <label>ID Utilisateur</label>
                        <span className="id-text">{selectedUser.user_id}</span>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminUsers;