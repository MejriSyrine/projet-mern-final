import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { HiHeart, HiOutlineHeart } from "react-icons/hi2";
import { useNavigate } from 'react-router-dom';
import './RecipeCard.css';
import config from '../config';

const API_URL = config.API_URL;

const getImageUrl = (coverImage) => {
    if (!coverImage) {
        return 'https://via.placeholder.com/300x200?text=Image';
    }
    if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
        return coverImage;
    }
    return `${API_URL}/public/images/${coverImage}`;
};

function AllRecipes({ filter = "all" }) {
    const [recipes, setRecipes] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            
            try {
                const recipesResponse = await axios.get(`${config.API_URL}/api/recipes`);
                
                let recipesData = [];
                
                if (recipesResponse.data.recipes && Array.isArray(recipesResponse.data.recipes)) {
                    recipesData = recipesResponse.data.recipes;
                } else if (Array.isArray(recipesResponse.data)) {
                    recipesData = recipesResponse.data;
                }

                // Filtrer uniquement les recettes validées/approuvées
                recipesData = recipesData.filter(recipe => 
                    recipe.status === 'validated' || recipe.status === 'approved'
                );

                // Filtrer selon le paramètre
                if (filter === "mine") {
                    const currentUser = JSON.parse(localStorage.getItem("user"));
                    if (currentUser) {
                        recipesData = recipesData.filter(recipe => {
                            const createdById = recipe.createdBy?._id || recipe.createdBy;
                            return createdById === currentUser._id;
                        });
                    }
                }

                setRecipes(recipesData);

                // Récupérer les favoris si l'utilisateur est connecté
                const token = localStorage.getItem("token");
                const storedUser = JSON.parse(localStorage.getItem("user"));
                
                if (token && storedUser) {
                    setUser(storedUser);
                    try {
                        const favoritesResponse = await axios.get(`${config.API_URL}/user/favorites`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        const rawFavs = favoritesResponse.data.favorites || favoritesResponse.data.favourites || [];
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
                }
            } catch (err) {
                console.error("Error fetching recipes:", err);
                setError("Failed to load recipes: " + (err.response?.data?.message || err.message));
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [filter]);

    const toggleFavorite = async (recipeId) => {
        if (!user) {
            navigate('/login');
            return;
        }

        const token = localStorage.getItem("token");
        const prevFavorites = [...favorites];
        const recipeIdStr = String(recipeId);
        const wasFav = prevFavorites.includes(recipeIdStr);
        
        if (wasFav) {
            setFavorites(prev => prev.filter(id => id !== recipeIdStr));
        } else {
            setFavorites(prev => [recipeIdStr, ...prev]);
        }

        try {
            const res = await axios.put(`${config.API_URL}/user/favorite/${recipeId}`, null, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const rawFavs = res.data.favorites || res.data.favourites || [];
            const favIds = rawFavs.map(f => {
                if (!f) return f;
                if (typeof f === 'string') return f;
                if (typeof f._id !== 'undefined') return String(f._id);
                return String(f);
            });
            setFavorites(favIds);
        } catch (err) {
            setFavorites(prevFavorites);
            if (err.response?.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate('/login');
            }
        }
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
        const isFav = favorites.includes(String(recipe._id));
        const isValidated = recipe.status === 'validated' || recipe.status === 'approved';
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
                        {isFav ? (
                            <HiHeart size={20} />
                        ) : (
                            <HiOutlineHeart size={20} />
                        )}
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
                    
                    <div className="card-meta">
                        <div className="meta-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                            </svg>
                            <span>{recipe.commentsCount || recipe.comments?.length || 0}</span>
                        </div>
                        <div className="meta-item">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                            </svg>
                            <span>{(recipe.ratingsAvg || 0).toFixed(1)}</span>
                        </div>
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

    const DisplayRecipes = () => {
        const hasAnyCategory = platsRecipes.length > 0 || dessertRecipes.length > 0;
        
        if (!hasAnyCategory && recipes.length > 0) {
            return (
                <div className="category-section">
                    <div className="cards-wrapper">
                        {recipes.map((recipe) => (
                            <RecipeCard key={recipe._id} recipe={recipe} />
                        ))}
                    </div>
                </div>
            );
        }
        
        return (
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
            </div>
        );
    };

    if (loading) {
        return (
            <div className="recipes-container">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Chargement des recettes...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="recipes-container">
                <div className="alert alert-danger">
                    <strong>Erreur:</strong> {error}
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
        <div className="recipes-container">
            <DisplayRecipes />
            
            {recipes.length === 0 && !loading && (
                <div className="empty-state">
                    <div className="empty-state-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
                        </svg>
                    </div>
                    <h3>Aucune recette trouvée</h3>
                    <p>
                        {filter === "mine" 
                            ? "Vous n'avez pas encore créé de recette" 
                            : "Soyez le premier à partager une recette !"}
                    </p>
                    {filter === "mine" && (
                        <button 
                            className="btn-primary-hero"
                            onClick={() => navigate('/selectCategory')}
                        >
                            Créer ma première recette
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

export default AllRecipes;
