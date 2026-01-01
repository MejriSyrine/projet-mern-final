import axios from 'axios';
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import './EditRecipe.css';

// Fonction helper pour les URLs d'images
const getImageUrl = (coverImage) => {
    if (!coverImage) {
        return null;
    }
    
    // Si c'est une URL complète (Unsplash ou autre)
    if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
        return coverImage;
    }
    
    // Sinon, c'est un fichier local
    return `http://localhost:5000/public/images/${coverImage}`;
};

function EditRecipe() {
    const navigate = useNavigate();
    const { id } = useParams();
    const fileInputRef = useRef(null);

    const [recipe, setRecipe] = useState({
        title: '',
        ingredients: '',
        instructions: '',
        category: '',
        coverImageFile: null,
        coverImagePreview: null
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [dragActive, setDragActive] = useState(false);

    useEffect(() => {
        const getRecipe = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/recipes/${id}`);
                const res = response.data;

                setRecipe({
                    title: res.title || '',
                    ingredients: Array.isArray(res.ingredients) ? res.ingredients.join(', ') : (res.ingredients || ''),
                    instructions: res.instructions || '',
                    category: res.category || '',
                    coverImageFile: null,
                    coverImagePreview: getImageUrl(res.coverImage)
                });
            } catch (err) {
                console.error('Error fetching recipe for edit:', err);
                setError('Impossible de charger la recette');
            } finally {
                setLoading(false);
            }
        };

        getRecipe();
    }, [id]);

    const onHandleChange = (e) => {
        const { name, value, files } = e.target;

        if (name === 'coverImage') {
            const file = files?.[0] || null;
            setRecipe(prev => ({
                ...prev,
                coverImageFile: file,
                coverImagePreview: file ? URL.createObjectURL(file) : prev.coverImagePreview
            }));
            return;
        }

        setRecipe(prev => ({ ...prev, [name]: value }));
        setError('');
    };

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
                setRecipe(prev => ({
                    ...prev,
                    coverImageFile: file,
                    coverImagePreview: URL.createObjectURL(file)
                }));
            }
        }
    };

    const removeImage = () => {
        setRecipe(prev => ({
            ...prev,
            coverImageFile: null,
            coverImagePreview: null
        }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const onHandleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const formData = new FormData();
            formData.append('title', recipe.title);

            const ingredientsArray = (typeof recipe.ingredients === 'string')
                ? recipe.ingredients.split(',').map(s => s.trim()).filter(Boolean)
                : recipe.ingredients;
            formData.append('ingredients', JSON.stringify(ingredientsArray));

            formData.append('instructions', recipe.instructions);
            formData.append('category', recipe.category);

            if (recipe.coverImageFile && recipe.coverImageFile instanceof File) {
                formData.append('coverImage', recipe.coverImageFile);
            }

            const res = await axios.put(`http://localhost:5000/api/recipes/${id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (res.status === 200) {
                setSuccess('Recette modifiée avec succès !');
                setTimeout(() => {
                    navigate(`/recipe/${id}`);
                }, 1500);
            }
        } catch (error) {
            console.error('Error updating recipe:', error);
            setError('Échec de la modification. Veuillez réessayer.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="edit-recipe-page">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Chargement de la recette...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="edit-recipe-page">
            <div className="edit-recipe-container">
                <div className="edit-recipe-header">
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
                        <h1>
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                            Modifier la recette
                        </h1>
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

                <form onSubmit={onHandleSubmit} className="edit-form">
                    <div className="form-grid">
                        <div className="form-main">
                            <div className="form-group">
                                <label htmlFor="title">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 20h9"/>
                                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                                    </svg>
                                    Titre de la recette
                                </label>
                                <input 
                                    id="title"
                                    value={recipe.title} 
                                    onChange={onHandleChange} 
                                    name='title' 
                                    type="text" 
                                    placeholder='Titre de la recette'
                                    className="form-input"
                                    disabled={saving}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="ingredients">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
                                        <rect x="9" y="3" width="6" height="4" rx="1"/>
                                        <path d="M9 12h6M9 16h6"/>
                                    </svg>
                                    Ingrédients
                                </label>
                                <textarea 
                                    id="ingredients"
                                    value={recipe.ingredients} 
                                    onChange={onHandleChange} 
                                    rows="4" 
                                    name='ingredients' 
                                    placeholder='Séparez les ingrédients par des virgules'
                                    className="form-textarea"
                                    disabled={saving}
                                />
                                <span className="input-hint">Séparez les ingrédients par des virgules</span>
                            </div>

                            <div className="form-group">
                                <label htmlFor="instructions">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                        <polyline points="14 2 14 8 20 8"/>
                                        <line x1="16" y1="13" x2="8" y2="13"/>
                                        <line x1="16" y1="17" x2="8" y2="17"/>
                                    </svg>
                                    Instructions
                                </label>
                                <textarea 
                                    id="instructions"
                                    value={recipe.instructions} 
                                    onChange={onHandleChange} 
                                    rows="6" 
                                    name='instructions' 
                                    placeholder='Décrivez les étapes de préparation...'
                                    className="form-textarea"
                                    disabled={saving}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="category">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 7h16M4 12h16M4 17h10"/>
                                    </svg>
                                    Catégorie
                                </label>
                                <select 
                                    id="category"
                                    value={recipe.category} 
                                    onChange={onHandleChange} 
                                    name='category' 
                                    className='form-select'
                                    disabled={saving}
                                >
                                    <option value=''>Sélectionner une catégorie</option>
                                    <option value='plats'>Plats</option>
                                    <option value='dessert'>Dessert</option>
                                </select>
                            </div>
                        </div>

                        <div className="form-sidebar">
                            <div className="form-group">
                                <label>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                        <circle cx="8.5" cy="8.5" r="1.5"/>
                                        <polyline points="21 15 16 10 5 21"/>
                                    </svg>
                                    Photo de la recette
                                </label>
                                <div 
                                    className={`image-upload-zone ${dragActive ? 'drag-active' : ''} ${recipe.coverImagePreview ? 'has-image' : ''}`}
                                    onDragEnter={handleDrag}
                                    onDragLeave={handleDrag}
                                    onDragOver={handleDrag}
                                    onDrop={handleDrop}
                                    onClick={() => !recipe.coverImagePreview && fileInputRef.current?.click()}
                                >
                                    {recipe.coverImagePreview ? (
                                        <div className="image-preview">
                                            <img src={recipe.coverImagePreview} alt="Aperçu" />
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
                                            <button 
                                                type="button" 
                                                className="change-image-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    fileInputRef.current?.click();
                                                }}
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                                    <polyline points="17 8 12 3 7 8"/>
                                                    <line x1="12" y1="3" x2="12" y2="15"/>
                                                </svg>
                                                Changer
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
                                        </div>
                                    )}
                                    <input 
                                        ref={fileInputRef}
                                        onChange={onHandleChange} 
                                        name='coverImage' 
                                        type="file" 
                                        accept="image/*"
                                        disabled={saving}
                                        className="file-input-hidden"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button 
                            type="button" 
                            className="btn-secondary"
                            onClick={() => navigate(-1)}
                            disabled={saving}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 6L6 18M6 6l12 12"/>
                            </svg>
                            Annuler
                        </button>
                        <button 
                            className="btn-primary" 
                            type='submit'
                            disabled={saving}
                        >
                            {saving ? (
                                <>
                                    <span className="btn-loader"></span>
                                    Enregistrement...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                                        <polyline points="17 21 17 13 7 13 7 21"/>
                                        <polyline points="7 3 7 8 15 8"/>
                                    </svg>
                                    Enregistrer
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditRecipe;
