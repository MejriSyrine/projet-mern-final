import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { HiHeart } from 'react-icons/hi2';
import { useNavigate } from 'react-router-dom';

function MyFavRecipes() {
    const navigate = useNavigate();
    const [favoriteRecipes, setFavoriteRecipes] = useState([]);
    // ✅ AJOUT : Fonction helper pour gérer les URLs d'images
    const getImageUrl = (coverImage) => {
        if (!coverImage) {
            return 'https://via.placeholder.com/300?text=No+Image';
        }
        
        // Si c'est une URL complète (Unsplash ou autre)
        if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
            return coverImage;
        }
        
        // Sinon, c'est un fichier local
        return `http://localhost:5000/public/images/${coverImage}`;
    };
    useEffect(() => {
        const fetchFavoriteRecipes = async () => {
            const token = localStorage.getItem('token');
            if (!token) return; // user not logged in

            try {
                // Fetch favorites directly (requires auth)
                const res = await axios.get('http://localhost:5000/user/favorites', {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (res.data && Array.isArray(res.data.favorites)) {
                    setFavoriteRecipes(res.data.favorites);
                } else {
                    setFavoriteRecipes([]);
                }
            } catch (error) {
                console.error('Error fetching favorites:', error);
                setFavoriteRecipes([]);
            }
        }
        fetchFavoriteRecipes();
    }, []);

    const removeFavorite = async (recipeId) => {
        try {
            const user = JSON.parse(localStorage.getItem("user"));
            if (!user) return;

            await axios.put(`http://localhost:5000/user/favorite/${recipeId}`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });

            // Mettre à jour l'affichage
            setFavoriteRecipes(prev => prev.filter(recipe => recipe._id !== recipeId));
            
        } catch (error) {
            console.error('Error removing favorite:', error);
        }
    }

    return (
        <div className="recipes-container">
            <h2>My Favorite Recipes</h2>
            {favoriteRecipes.length === 0 ? (
                <p>No favorite recipes found.</p>
            ) : (
                <div className="cards-wrapper">
                    {favoriteRecipes.map((recipe) => (
                        <div className="recipe-card" key={recipe._id}>
                            <img
                                className="w-100 clickable-recipe-image"
                                src={getImageUrl(recipe.coverImage)}
                                alt={recipe.title}
                                onClick={() => navigate(`/recipe/${recipe._id}`)}
                            />
                            <h4 className="mt-4 clickable-recipe-title" onClick={() => navigate(`/recipe/${recipe._id}`)}>{recipe.title}</h4>
                            <p>{recipe.ingredients}</p>
                            
                            <HiHeart 
                                className="icons" 
                                style={{color: 'red', cursor: 'pointer'}}
                                onClick={() => removeFavorite(recipe._id)}
                                title="Remove from favorites"
                            />
                        </div>
                    ))}

                </div>
            )}
        </div>
    );
}

export default MyFavRecipes;