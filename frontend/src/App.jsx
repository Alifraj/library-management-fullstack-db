import React, { useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import SplashScreen from '../pages/SplashScreen'; 
import AppRoutes from '../routes';
import { AuthProvider } from '../context/AuthContext';

function App() {
    const [isLoaded, setIsLoaded] = useState(false);

    return (
        <BrowserRouter>
        <AuthProvider>
            {!isLoaded ? (
                <SplashScreen onFinish={() => setIsLoaded(true)} />
            ) : (
                <AppRoutes />
            )}
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
