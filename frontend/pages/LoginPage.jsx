// frontend/src/pages/LoginPage.jsx

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import { useAuth } from '../context/AuthContext'; // Import du contexte
import loginAnimation from '../animations/Login.json'
import '../styles/LoginPage.css'; // Le fichier CSS que nous allons créer

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { login } = useAuth(); // Récupère la fonction login du contexte
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);

        try {
            // Appel de la fonction login du contexte (qui appelle l'API)
            await login(email, password);
            
            // Si succès, redirection vers le dashboard
            navigate('/admin/authors'); 
        } catch (err) {
            // Gestion de l'erreur (ex: identifiants incorrects)
            setError(err.message || "Échec de la connexion. Vérifiez vos identifiants.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-wrapper">
                
                {/* Section Gauche : Visuelle / Animation */}
                <div className="login-visual">
                    <div className="lottie-container">
                        <Lottie 
                            animationData={loginAnimation} 
                            loop={true} 
                            style={{ height: '350px' }} 
                        />
                    </div>
                    <h2>Bon retour parmi nous !</h2>
                    <p>Gérez votre bibliothèque numérique en toute simplicité.</p>
                </div>

                {/* Section Droite : Formulaire */}
                <div className="login-form-section">
                    <div className="form-header">
                        <h1>Connexion</h1>
                        <p>Entrez vos coordonnées pour accéder à votre compte.</p>
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit} className="login-form">
                        <div className="input-group">
                            <label htmlFor="email">Adresse Email</label>
                            <input 
                                type="email" 
                                id="email" 
                                placeholder="exemple@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required 
                            />
                        </div>

                        <div className="input-group">
                            <label htmlFor="password">Mot de passe</label>
                            <input 
                                type="password" 
                                id="password" 
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required 
                            />
                        </div>

                        <button type="submit" className="login-btn" disabled={isSubmitting}>
                            {isSubmitting ? 'Connexion en cours...' : 'Se Connecter'}
                        </button>

                        <div className="register-link">
                            Pas encore de compte ? <Link to="/register">S'inscrire</Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;