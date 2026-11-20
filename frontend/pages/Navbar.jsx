// frontend/src/components/Navbar.jsx

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css'; // On crée le CSS juste après

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!user) return null; // Ne pas afficher la navbar si pas connecté

    return (
        <nav className="navbar">
            <div className="navbar-logo">
                <Link to="/">📚 BiblioTech</Link>
            </div>

            <div className="navbar-links">
                {/* Lien Accueil pour tout le monde */}
                <Link to="/profile" className="nav-link">Profile</Link>
                
                {/* Lien Mes Emprunts pour les membres */}
                <Link to="/my-loans" className="nav-link">Mes Emprunts</Link>

                {/* Liens ADMIN uniquement */}
                {user.role === 'admin' && (
                    <div className="admin-menu">
                        <span className="admin-label">Admin :</span>
                        <Link to="/admin/authors" className="nav-link admin-link">Auteurs</Link>
                        <Link to="/admin/books" className="nav-link admin-link">Livres</Link>
                        <Link to="/admin/users" className="nav-link admin-link">Utilisateurs</Link>
                    </div>
                )}
            </div>

            <div className="navbar-user">
                <span className="username">{user.first_name || user.email}</span>
                <button onClick={handleLogout} className="logout-btn-nav">Déconnexion</button>
            </div>
        </nav>
    );
};

export default Navbar;