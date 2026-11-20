// frontend/src/pages/GetStarted.jsx

import React from 'react';
import Lottie from 'lottie-react';
import animationData from '../animations/Library.json';
import '../styles/GetStarted.css';
import { useNavigate } from 'react-router-dom';

function GetStarted() {
    const navigate = useNavigate();

    const handleStart = () => {
        navigate('/login');  // 🔥 Navigation vers la page de connexion
    };

    return (
        <div className="getstarted-container">

            {/* Animation Lottie */}
            <div className="gs-animation">
                <Lottie
                    animationData={animationData}
                    loop
                    autoplay
                    style={{ width: 300, height: 300 }}
                />
            </div>

            <h1 className="gs-title">Bienvenue</h1>
            <p className="gs-subtitle">
                Explorez votre bibliothèque numérique et découvrez un monde de connaissances.
            </p>

            <button className="gs-button" onClick={handleStart}>
                Commencer
            </button>
        </div>
    );
}

export default GetStarted;
