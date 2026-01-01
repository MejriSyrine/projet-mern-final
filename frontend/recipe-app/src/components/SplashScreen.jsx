import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.png';
import './SplashScreen.css';

function SplashScreen() {
    const navigate = useNavigate();
    const [fadeOut, setFadeOut] = useState(false);

    useEffect(() => {
        const fadeTimer = setTimeout(() => {
            setFadeOut(true);
        }, 4500);

        const redirectTimer = setTimeout(() => {
            navigate('/home');
        }, 5000);

        return () => {
            clearTimeout(fadeTimer);
            clearTimeout(redirectTimer);
        };
    }, [navigate]);

    return (
        <div className={`splash-screen ${fadeOut ? 'fade-out' : ''}`}>
            <div className="splash-content">
                <div className="logo-container">
                    <div className="logo-glow"></div>
                    <img src={logo} alt="Logo" className="splash-logo" />
                    <div className="logo-ring"></div>
                    <div className="logo-ring ring-2"></div>
                    <div className="logo-ring ring-3"></div>
                </div>
                
                <div className="splash-text">
                    <h1 className="app-name">GlutenFree Recipes</h1>
                    <p className="tagline">Découvrez, Créez, Partagez</p>
                </div>

                <div className="loader-container">
                    <div className="loader-bar">
                        <div className="loader-progress"></div>
                    </div>
                    <span className="loader-text">Chargement...</span>
                </div>

                <div className="floating-elements">
                    <span className="float-icon icon-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C8.43 2 5.23 3.54 3.01 6L12 22l8.99-16C18.78 3.55 15.57 2 12 2z"/>
                        </svg>
                    </span>
                    <span className="float-icon icon-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
                        </svg>
                    </span>
                    <span className="float-icon icon-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                            <path fill="#fff" d="M8 12l2 2 4-4"/>
                        </svg>
                    </span>
                    <span className="float-icon icon-4">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                        </svg>
                    </span>
                </div>
            </div>
        </div>
    );
}

export default SplashScreen;
