import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CategorySelection.css';

function CategorySelection() {
    const navigate = useNavigate();

    const handleCategorySelect = (category) => {
        navigate('/addRecipe', { state: { category } });
    };

    return (
        <div className="category-selection-container">
            <div className="category-modal">
                <div className="modal-header-section">
                    <h2>Nouvelle Recette</h2>
                    <p>Sélectionnez le type de recette que vous souhaitez créer</p>
                </div>
                
                <div className="category-cards">
                    <div 
                        className="category-card plats-card"
                        onClick={() => handleCategorySelect('plats')}
                    >
                        <div className="card-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
                            </svg>
                        </div>
                        <div className="card-content">
                            <h3>Plats</h3>
                            <p>Entrées, plats principaux, accompagnements...</p>
                        </div>
                        <div className="card-arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                            </svg>
                        </div>
                    </div>
                    
                    <div 
                        className="category-card dessert-card"
                        onClick={() => handleCategorySelect('dessert')}
                    >
                        <div className="card-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C8.43 2 5.23 3.54 3.01 6L12 22l8.99-16C18.78 3.55 15.57 2 12 2zM7 7c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm5 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                            </svg>
                        </div>
                        <div className="card-content">
                            <h3>Dessert</h3>
                            <p>Gâteaux, tartes, crèmes, pâtisseries...</p>
                        </div>
                        <div className="card-arrow">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <button 
                    className="back-button"
                    onClick={() => navigate(-1)}
                >
                    Retour
                </button>
            </div>
        </div>
    );
}

export default CategorySelection;
