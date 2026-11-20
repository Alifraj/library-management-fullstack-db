// frontend/src/App.jsx

import React, { useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import Splash from './pages/SplashScreen'; // <--- ASSUREZ-VOUS QUE LE CHEMIN EST CORRECT !
import AppRoutes from './routes'; 

function App() {
    const [isLoaded, setIsLoaded] = useState(false); 

    if (!isLoaded) {
        // Le Splash doit s'afficher ici
        return <Splash onFinish={() => setIsLoaded(true)} />;
    }

    return (
        <Router> 
            <AppRoutes /> 
        </Router>
    );
}

export default App;