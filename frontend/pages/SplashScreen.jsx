import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import { useNavigate } from 'react-router-dom';
import animationData from '../animations/Library.json';
import '../styles/Splash.css';

const SPLASH_DURATION = 3200;

function SplashScreen({ onFinish }) {
    const [fadeOut, setFadeOut] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fadeTimer = setTimeout(() => setFadeOut(true), 2500);

        const finishTimer = setTimeout(() => {
            onFinish();               // cache le splash dans App.jsx
            navigate('/getstarted');  // navigation automatique
        }, SPLASH_DURATION);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(finishTimer);
        };
    }, [navigate, onFinish]);

    return (
        <div className={`splash-container ${fadeOut ? 'fade-out' : ''}`}>
            <div className="logo-wrapper">
                <Lottie
                    animationData={animationData}
                    loop={false}
                    autoplay={true}
                    style={{ width: 220, height: 220 }}
                />
            </div>
            <h1 className="splash-title">Bibliothèque Numérique</h1>
            <p className="splash-subtitle">Votre savoir, sans limites.</p>
        </div>
    );
}

export default SplashScreen;
