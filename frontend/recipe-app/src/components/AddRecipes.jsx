import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './AddRecipes.css';
import config from '../config';

function AddRecipes() {
    const location = useLocation();
    const navigate = useNavigate();
    const category = location.state?.category;
    const fileInputRef = useRef(null);

    const [recipe, setRecipe] = useState({
        title: '',
        ingredients: [],
        instructions: '',
        category: category || '',
        coverImage: null
    });

    const [imagePreview, setImagePreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        if (!category) {
            navigate('/selectCategory');
        }
    }, [category, navigate]);

    const onHandleChange = (e) => {
        const { name, value, files } = e.target;
        let val;
        
        if (name === "ingredients") {
            val = value.split(/[,\n]/)
                .map(item => item.trim())
                .filter(item => item.length > 0);
        } else if (name === "coverImage") {
            const file = files?.[0] || null;
            val = file;
            if (file) {
                setImagePreview(URL.createObjectURL(file));
            }
        } else {
            val = value;
        }
        
        setRecipe(prev => ({...prev, [name]: val}));
        setError('');
    }

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const file = e.dataTransfer.files[0];
            if (file.type.startsWith('image/')) {
                setRecipe(prev => ({...prev, coverImage: file}));
                setImagePreview(URL.createObjectURL(file));
            }
        }
    };

    const removeImage = () => {
        setRecipe(prev => ({...prev, coverImage: null}));
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const validateRecipe = () => {
        if (!recipe.title?.trim()) {
            return 'Le titre est requis';
        }
        if (!recipe.ingredients || recipe.ingredients.length === 0) {
            return 'Veuillez ajouter au moins un ingrédient';
        }
        if (!recipe.instructions?.trim()) {
            return 'Les instructions sont requises';
        }
        if (!recipe.category) {
            return 'La catégorie est requise';
        }
        return null;
    }

    const onHandleSubmit = async (e) => {
        e.preventDefault();
        
        const validationError = validateRecipe();
        if (validationError) {
            setError(validationError);
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const formData = new FormData();
            formData.append('title', recipe.title.trim());
            formData.append('ingredients', JSON.stringify(recipe.ingredients));
            formData.append('instructions', recipe.instructions.trim());
            formData.append('category', recipe.category);
            
            if (recipe.coverImage) {
                formData.append('coverImage', recipe.coverImage);
            }

            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error('Vous devez être connecté pour ajouter une recette');
            }

            const response = await axios.post(`${config.API_URL}/api/recipes`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            setSuccess('Recette ajoutée avec succès !');
            
            setTimeout(() => {
                navigate("/myRecipes");
            }, 2000);

        } catch (error) {
            let errorMessage = 'Une erreur est survenue lors de l\'ajout de la recette';
            
            if (error.response) {
                errorMessage = error.response.data?.error || 
                              error.response.data?.message || 
                              `Erreur ${error.response.status}`;
            } else if (error.request) {
                errorMessage = 'Le serveur ne répond pas.';
            } else {
                errorMessage = error.message;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }

    if (!category) {
        return (
            <div className="add-recipe-loading">
                <div className="loader"></div>
                <p>Redirection...</p>
            </div>
        );
    }

    return (
        <div className="add-recipe-page">
            <div className="add-recipe-container">
                <div className="add-recipe-header">
                    <button 
                        type="button" 
                        className="back-btn"
                        onClick={() => navigate(-1)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M19 12H5M12 19l-7-7 7-7"/>
                        </svg>
                        Retour
                    </button>
                    
                    <div className="header-content">
                        <h1>Créer une recette</h1>
                        <div className={`category-tag ${recipe.category}`}>
                            {recipe.category === 'dessert' ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2C8.43 2 5.23 3.54 3.01 6L12 22l8.99-16C18.78 3.55 15.57 2 12 2z"/>
                                    </svg>
                                    Dessert
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/>
                                    </svg>
                                    Plats
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="alert alert-error">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <path d="M15 9l-6 6M9 9l6 6"/>
                        </svg>
                        {error}
                    </div>
                )}

                {success && (
                    <div className="alert alert-success">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                            <polyline points="22 4 12 14.01 9 11.01"/>
                        </svg>
                        {success}
                    </div>
                )}

                <form onSubmit={onHandleSubmit} className="recipe-form">
                    <div className="form-grid">
                        <div className="form-main">
                            <div className="form-group">
                                <label htmlFor="title">
                                    Titre de la recette
                                    <span className="required">*</span>
                                </label>
                                <input 
                                    id="title"
                                    onChange={onHandleChange} 
                                    name='title' 
                                    type="text" 
                                    placeholder='Ex: Tarte aux pommes maison' 
                                    value={recipe.title}
                                    disabled={loading}
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="ingredients">
                                    Ingrédients
                                    <span className="required">*</span>
                                </label>
                                <textarea 
                                    id="ingredients"
                                    onChange={onHandleChange} 
                                    rows="4" 
                                    name='ingredients' 
                                    placeholder='Séparez les ingrédients par des virgules&#10;Ex: 200g de farine, 3 œufs, 100g de sucre'
                                    value={recipe.ingredients.join(', ')}
                                    disabled={loading}
                                    className="form-textarea"
                                />
                                <div className="input-hint">
                                    <span className="ingredient-count">{recipe.ingredients.length}</span> ingrédient{recipe.ingredients.length !== 1 ? 's' : ''} ajouté{recipe.ingredients.length !== 1 ? 's' : ''}
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="instructions">
                                    Instructions
                                    <span className="required">*</span>
                                </label>
                                <textarea 
                                    id="instructions"
                                    onChange={onHandleChange} 
                                    rows="6" 
                                    name='instructions' 
                                    placeholder='Décrivez les étapes de préparation...'
                                    value={recipe.instructions}
                                    disabled={loading}
                                    className="form-textarea"
                                />
                            </div>
                        </div>

                        <div className="form-sidebar">
                            <div className="form-group">
                                <label>Photo de la recette</label>
                                <div 
                                    className={`image-upload-zone ${dragActive ? 'drag-active' : ''} ${imagePreview ? 'has-image' : ''}`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={() => !imagePreview && fileInputRef.current?.click()}
                                >
                                    {imagePreview ? (
                                        <div className="image-preview">
                                            <img src={imagePreview} alt="Aperçu" />
                                            <button 
                                                type="button" 
                                                className="remove-image-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeImage();
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M18 6L6 18M6 6l12 12"/>
                                                </svg>
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="upload-placeholder">
                                            <div className="upload-icon">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                                    <polyline points="17 8 12 3 7 8"/>
                                                    <line x1="12" y1="3" x2="12" y2="15"/>
                                                </svg>
                                            </div>
                                            <p className="upload-text">Glissez une image ici</p>
                                            <p className="upload-subtext">ou cliquez pour parcourir</p>
                                            <span className="upload-formats">JPG, PNG, GIF - Max 5MB</span>
                                        </div>
                                    )}
                                    <input 
                                        ref={fileInputRef}
                                        onChange={onHandleChange} 
                                        name='coverImage' 
                                        type="file" 
                                        accept="image/*"
                                        disabled={loading}
                                        className="file-input-hidden"
                                    />
                                </div>
                            </div>

                            <div className="tips-card">
                                <h4>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="10"/>
                                        <path d="M12 16v-4M12 8h.01"/>
                                    </svg>
                                    Conseils
                                </h4>
                                <ul>
                                    <li>Utilisez un titre descriptif</li>
                                    <li>Listez tous les ingrédients avec les quantités</li>
                                    <li>Décrivez chaque étape clairement</li>
                                    <li>Ajoutez une belle photo</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="button" 
                            className="btn-secondary"
                            onClick={() => navigate(-1)}
                            disabled={loading}
                        >
                            Annuler
                        </button>
                        <button 
                            className="btn-primary" 
                            type='submit'
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="btn-loader"></span>
                                    Publication...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 5v14M5 12h14"/>
                                    </svg>
                                    Publier la recette
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default AddRecipes;
