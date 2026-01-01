import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { HiHeart, HiOutlineHeart } from 'react-icons/hi2';
import { HiMiniPencilSquare } from "react-icons/hi2";
import { MdDeleteOutline } from "react-icons/md";
import { useNavigate } from 'react-router-dom';
import config from '../config';
import './RecipeCard.css';

const getImageUrl = (coverImage) => {
    if (!coverImage) {
        return 'https://via.placeholder.com/300?text=No+Image';
    }
    
    if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
        return coverImage;
    }
    
    return `${config.API_URL}/public/images/${coverImage}`;
};

function MyRecipes() {
    const [recipes, setRecipes] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
       
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setError('');
            
            try {
                const token = localStorage.getItem("token");
                const storedUser = JSON.parse(localStorage.getItem("user"));
                
                if (!token || !storedUser) {
                    navigate('/login');
                    return;
                }

                const recipesResponse = await axios.get(`${config.API_URL}/api/recipes/mine`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const recipesData = Array.isArray(recipesResponse.data) 
                    ? recipesResponse.data 
                    : (recipesResponse.data.recipes || []);
                
                setRecipes(recipesData);

                try {
                    const favoritesResponse = await axios.get(`${config.API_URL}/user/favorites`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const rawFavs = favoritesResponse.data.favorites || [];
                    const favIds = rawFavs.map(f => {
                        if (!f) return f;
                        if (typeof f === 'string') return f;
                        if (typeof f._id !== 'undefined') return String(f._id);
                        return String(f);
                    });
                    setFavorites(favIds);
                } catch (favError) {
                    console.error("Error fetching favorites:", favError);
                }

            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Échec du chargement de vos recettes. Veuillez réessayer.');
                
                if (error.response?.status === 401) {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [navigate]);

    const toggleFavorite = async (recipeId) => {
        const token = localStorage.getItem("token");
        if (!token) {
            navigate('/login');
            return;
        }

        const prevFavorites = [...favorites];
        const recipeIdStr = String(recipeId);
        const wasFav = prevFavorites.includes(recipeIdStr);
        if (wasFav) {
            setFavorites(prev => prev.filter(id => id !== recipeIdStr));
        } else {
            setFavorites(prev => [recipeIdStr, ...prev]);
        }

        try {
            const response = await axios.put(
                `${config.API_URL}/user/favorite/${recipeId}`, 
                {}, 
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            const rawFavs = response.data.favorites || response.data.favourites || [];
            const favIds = rawFavs.map(f => {
                if (!f) return f;
                if (typeof f === 'string') return f;
                if (typeof f._id !== 'undefined') return String(f._id);
                return String(f);
            });
            setFavorites(favIds);
        } catch (error) {
            setFavorites(prevFavorites);
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate('/login');
            }
        }
    };

    const isFavorite = (recipeId) => {
        return favorites.includes(String(recipeId));
    };

    const onDeleteRecipe = async (id) => {
        if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
            return;
        }

        try {
            const token = localStorage.getItem("token");
            await axios.delete(`${config.API_URL}/api/recipes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRecipes(prev => prev.filter(r => r._id !== id));
        } catch (error) {
            console.error('Error deleting recipe:', error);
            alert('Échec de la suppression. Veuillez réessayer.');
        }
    };

    const onEditRecipe = (recipeId) => {
        navigate(`/EditRecipe/${recipeId}`);
    };

    // Filtrer les recettes par catégorie (inclure anciennes catégories)
    const platsRecipes = recipes.filter(recipe => 
        recipe.category === 'plats' || 
        recipe.category === 'sour' || 
        recipe.category === 'salty' || 
        recipe.category === 'spicy'
    );
    const dessertRecipes = recipes.filter(recipe => 
        recipe.category === 'dessert' || 
        recipe.category === 'sweet'
    );

    const RecipeCard = ({ recipe }) => {
        const isFav = isFavorite(recipe._id);
        const isValidated = recipe.status === 'validated' || recipe.status === 'approved';
        const isPending = recipe.status === 'pending';
        const isRejected = recipe.status === 'rejected';
        const categoryClass = recipe.category === 'sweet' ? 'dessert' : ['sour', 'salty', 'spicy'].includes(recipe.category) ? 'plats' : recipe.category;

        return (
            <div className="recipe-card" key={recipe._id}>
                <div className="card-image-container">
                    <span className={`category-badge ${categoryClass}`}>
                        {(recipe.category === 'dessert' || recipe.category === 'sweet') ? (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 2C8.43 2 5.23 3.54 3.01 6L12 22l8.99-16C18.78 3.55 15.57 2 12 2z"/>
                                </svg>
                                Dessert
                            </>
                        ) : (
                            <>
                                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
                                </svg>
                                Plat
                            </>
                        )}
                    </span>
                    
                    {isPending && (
                        <span className="status-badge badge-warning">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
                            </svg>
                            En attente
                        </span>
                    )}
                    
                    {isRejected && (
                        <span className="status-badge badge-danger" title={recipe.rejectionReason}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/><path d="M15 9l-6 6M9 9l6 6"/>
                            </svg>
                            Rejeté
                        </span>
                    )}
                    
                    <span className="gluten-free-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                            <path d="M8 12l2 2 4-4"/>
                        </svg>
                        Sans gluten
                    </span>
                    
                    <img
                        className="card-image"
                        src={getImageUrl(recipe.coverImage)}
                        alt={recipe.title}
                        onError={(e) => { e.target.src = 'https://via.placeholder.com/300x200?text=Image'; }}
                        onClick={() => navigate(`/recipe/${recipe._id}`)}
                    />
                    
                    <button 
                        className={`favorite-btn ${isFav ? 'is-favorite' : ''}`}
                        onClick={(e) => { e.stopPropagation(); toggleFavorite(recipe._id); }}
                    >
                        {isFav ? <HiHeart size={20} /> : <HiOutlineHeart size={20} />}
                    </button>
                </div>
                
                <div className="card-content">
                    <h4 className="card-title" onClick={() => navigate(`/recipe/${recipe._id}`)}>
                        {recipe.title}
                    </h4>
                    
                    <p className="card-ingredients">
                        {Array.isArray(recipe.ingredients) 
                            ? recipe.ingredients.slice(0, 3).join(' • ') + (recipe.ingredients.length > 3 ? ' ...' : '')
                            : recipe.ingredients}
                    </p>
                    
                    <div className="card-actions-icons">
                        <button className="icon-btn edit-icon-btn" onClick={() => onEditRecipe(recipe._id)} title="Modifier">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                        </button>
                        <button className="icon-btn delete-icon-btn" onClick={() => onDeleteRecipe(recipe._id)} title="Supprimer">
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6"/>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                <line x1="10" y1="11" x2="10" y2="17"/>
                                <line x1="14" y1="11" x2="14" y2="17"/>
                            </svg>
                        </button>
                    </div>
                    
                    {isValidated && (
                        <div className="verified-badge">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                                <path d="M9 12l2 2 4-4"/>
                            </svg>
                            <span>Vérifié</span>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="recipes-container">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Chargement de vos recettes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="recipes-container">
                <div className="alert alert-danger">
                    {error}
                    <button 
                        onClick={() => window.location.reload()} 
                        className="btn btn-sm btn-outline-danger ms-3"
                    >
                        Réessayer
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="recipes-container my-recipes-page">
            <div className="recipes-header">
                <h2>Mes Recettes</h2>
                <button 
                    className="btn-create-recipe"
                    onClick={() => navigate('/selectCategory')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14"/>
                    </svg>
                    Nouvelle recette
                </button>
            </div>

            {recipes.length === 0 ? (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
                        </svg>
                    </div>
                    <h3>Aucune recette pour le moment</h3>
                    <p>Commencez par créer votre première recette sans gluten !</p>
                    <button 
                        className="btn-primary-hero"
                        onClick={() => navigate('/selectCategory')}
                    >
                        Créer ma première recette
                    </button>
                </div>
            ) : (
                <>
                    <div className="recipes-stats">
                        <div className="stat-item">
                            <span className="stat-number">{recipes.length}</span>
                            <span className="stat-label">Total</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">
                                {recipes.filter(r => r.status === 'approved' || r.status === 'validated').length}
                            </span>
                            <span className="stat-label">Validées</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{recipes.filter(r => r.status === 'pending').length}</span>
                            <span className="stat-label">En attente</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-number">{favorites.length}</span>
                            <span className="stat-label">Favoris</span>
                        </div>
                    </div>

                    <div className="categories-container">
                        {platsRecipes.length > 0 && (
                            <div className="category-section">
                                <div className="category-header">
                                    <div className="category-icon plats-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
                                        </svg>
                                    </div>
                                    <div className="category-info">
                                        <h3>Plats</h3>
                                        <span>{platsRecipes.length} recette{platsRecipes.length > 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                                <div className="cards-wrapper">
                                    {platsRecipes.map((recipe) => (
                                        <RecipeCard key={recipe._id} recipe={recipe} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {dessertRecipes.length > 0 && (
                            <div className="category-section">
                                <div className="category-header">
                                    <div className="category-icon dessert-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M12 2C8.43 2 5.23 3.54 3.01 6L12 22l8.99-16C18.78 3.55 15.57 2 12 2zM7 7c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm5 8c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2z"/>
                                        </svg>
                                    </div>
                                    <div className="category-info">
                                        <h3>Desserts</h3>
                                        <span>{dessertRecipes.length} recette{dessertRecipes.length > 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                                <div className="cards-wrapper">
                                    {dessertRecipes.map((recipe) => (
                                        <RecipeCard key={recipe._id} recipe={recipe} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {platsRecipes.length === 0 && dessertRecipes.length === 0 && recipes.length > 0 && (
                            <div className="category-section">
                                <div className="category-header">
                                    <div className="category-icon">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
                                        </svg>
                                    </div>
                                    <div className="category-info">
                                        <h3>Toutes mes recettes</h3>
                                        <span>{recipes.length} recette{recipes.length > 1 ? 's' : ''}</span>
                                    </div>
                                </div>
                                <div className="cards-wrapper">
                                    {recipes.map((recipe) => (
                                        <RecipeCard key={recipe._id} recipe={recipe} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}

export default MyRecipes;
