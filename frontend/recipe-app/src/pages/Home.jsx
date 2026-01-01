import React, { useState, useEffect } from 'react';
import image_3 from '../assets/image_3.png';
import './Home.css';
import AllRecipes from '../components/AllRecipes';
import { useNavigate } from 'react-router-dom';
import Modal from '../components/Modal';
import InputForm from '../components/InputForm';
import PendingRecipes from '../components/PendingRecipes';

function Home({ showMine = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    setUser(storedUser);
  }, []);

  const handleShareRecipe = () => {
    const token = localStorage.getItem('token');
    
    if (token && user) {
      navigate('/selectCategory');
    } else {
      setIsOpen(true);
    }
  };

  const closeModal = () => setIsOpen(false);

  // Interface pour les nutritionnistes
  if (user && user.role === 'nutritionist') {
    return (
      <div className="home-page">
        <section className="hero-section nutritionist-hero">
          <div className="hero-content">
            <div className="hero-badge">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              <span>Espace Nutritionniste</span>
            </div>
            <h1>Tableau de bord</h1>
            {user.nutritionistId && (
              <span className="nutritionist-id">ID: {user.nutritionistId}</span>
            )}
            <p>
              Bienvenue ! En tant que nutritionniste, vous pouvez valider les recettes 
              et maintenir la qualité de notre base de données sans gluten.
            </p>
            
            <div className="hero-actions">
              <button 
                className="btn-primary-hero" 
                onClick={() => navigate('/selectCategory')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Créer une recette
              </button>
              <button 
                className="btn-secondary-hero"
                onClick={() => window.location.reload()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                </svg>
                Actualiser
              </button>
            </div>
          </div>
          
          <div className="hero-image">
            <div className="image-backdrop"></div>
            <img src={image_3} alt="nutrition illustration" />
          </div>
        </section>

        <div className="wave-divider">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" preserveAspectRatio="none">
            <path fill="currentColor" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"/>
          </svg>
        </div>

        <PendingRecipes />
        
        <section className="recipes-section">
          <div className="section-header">
            <h2>Recettes Approuvées</h2>
            <p>Toutes les recettes validées par notre équipe</p>
          </div>
          <AllRecipes filter="all" />
        </section>
      </div>
    );
  }

  // Interface pour les utilisateurs réguliers
  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
              <path d="M8 12l2 2 4-4"/>
            </svg>
            <span>Recettes Sans Gluten</span>
          </div>
          <h1>Partagez vos recettes<br/>sans gluten</h1>
          <p>
            Rejoignez notre communauté dédiée aux personnes intolérantes au gluten. 
            Découvrez des recettes saines, validées par des nutritionnistes, 
            et partagez vos propres créations !
          </p>

          <div className="hero-actions">
            <button 
              className="btn-primary-hero" 
              onClick={handleShareRecipe}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 5v14M5 12h14"/>
              </svg>
              Partager une recette
            </button>
            
            {user && (
              <button 
                className="btn-secondary-hero"
                onClick={() => navigate('/myRecipes')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>
                </svg>
                Mes recettes
              </button>
            )}
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Recettes</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">Sans Gluten</span>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                <path d="M9 12l2 2 4-4"/>
              </svg>
              <span className="stat-label">Vérifié</span>
            </div>
          </div>
        </div>

        <div className="hero-image">
          <div className="image-backdrop"></div>
          <img src={image_3} alt="food illustration" />
          <div className="floating-card card-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.43 2 5.23 3.54 3.01 6L12 22l8.99-16C18.78 3.55 15.57 2 12 2z"/>
            </svg>
            <span className="card-text">Desserts</span>
          </div>
          <div className="floating-card card-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
            </svg>
            <span className="card-text">Plats</span>
          </div>
        </div>
      </section>

      <div className="wave-divider">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"/>
        </svg>
      </div>

      {isOpen && (
        <Modal onClose={closeModal}>
          <InputForm />
        </Modal>
      )}

      <section className="recipes-section">
        <div className="section-header">
          <h2>Découvrez nos recettes</h2>
          <p>Des plats savoureux et des desserts délicieux, tous sans gluten et validés par des nutritionnistes</p>
        </div>
        <AllRecipes filter={showMine ? "mine" : "all"} />
      </section>
    </div>
  );
}

export default Home;
