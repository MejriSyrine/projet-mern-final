import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { HiHeart, HiOutlineHeart, HiShare } from 'react-icons/hi2';
import config from '../config';

// Fonction helper pour les URLs d'images
const getImageUrl = (coverImage) => {
  if (!coverImage) {
    return 'https://via.placeholder.com/600x400?text=No+Image';
  }
  
  // Si c'est une URL complète (Unsplash ou autre)
  if (coverImage.startsWith('http://') || coverImage.startsWith('https://')) {
    return coverImage;
  }
  
  // Sinon, c'est un fichier local
  return `${config.API_URL}/public/images/${coverImage}`;
};

export default function RecipeDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [user, setUser] = useState(null);
  const [draftCommentText, setDraftCommentText] = useState('');
  const [draftCommentRating, setDraftCommentRating] = useState(0);
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    const fetchRecipe = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${config.API_URL}/api/recipes/${id}`);
        setRecipe(res.data);

        // Determine favorite status (if logged in)
        const token = localStorage.getItem('token');
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        setUser(storedUser);

        if (token && storedUser) {
          try {
            const favRes = await axios.get(`${config.API_URL}/user/favorites`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const favs = favRes.data.favorites || [];
            const favIds = favs.map(f => (typeof f === 'string' ? f : (f._id ? String(f._id) : String(f))));
            setIsFavorite(favIds.includes(String(id)));
          } catch (e) {
            console.warn('Could not fetch favorites:', e);
          }
        }
      } catch (err) {
        console.error('Error fetching recipe:', err);
        setError(err.response?.data?.error || err.message || 'Failed to load recipe');
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id]);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareText = `Check out this recipe: ${recipe?.title}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe?.title,
          text: shareText,
          url: shareUrl
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setShareMessage('Link copied to clipboard!');
        setTimeout(() => setShareMessage(''), 3000);
      } catch (err) {
        console.error('Copy failed:', err);
        setShareMessage('Failed to copy link');
        setTimeout(() => setShareMessage(''), 3000);
      }
    }
  };

  const toggleFavorite = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // optimistic
    setIsFavorite(prev => !prev);

    try {
      const res = await axios.put(`${config.API_URL}/user/favorite/${id}`, null, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsFavorite(!!res.data.isFavorite);
    } catch (err) {
      console.error('Toggle favorite failed:', err);
      // revert
      setIsFavorite(prev => !prev);
      alert('Failed to update favorite.');
    }
  };

  if (loading) return (
    <div className="recipes-container">
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading recipe...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="recipes-container">
      <div className="alert alert-danger">{error}</div>
    </div>
  );

  if (!recipe) return null;

  return (
    <div className="recipes-container recipe-details">
      <button className="btn-back" onClick={() => navigate(-1)}>← Back</button>

      <div className="details-card">
        <div className="details-media">
          <img
            src={getImageUrl(recipe.coverImage)} // ✅ CORRECTION ICI
            alt={recipe.title}
            onError={(e) => { e.target.src = 'https://via.placeholder.com/600x400'; }}
          />
        </div>

        <div className="details-content">
          <h1>{recipe.title}</h1>

          <div className="meta-row">
            <span className={`category-badge ${recipe.category === 'sweet' ? 'dessert' : ['sour', 'salty', 'spicy'].includes(recipe.category) ? 'plats' : recipe.category}`}>
              {(recipe.category === 'dessert' || recipe.category === 'sweet') ? 'Dessert' : 'Plats'}
            </span>
            <span className="created-by">By: {recipe.createdBy?.username || recipe.createdBy?.email || recipe.createdBy || 'Unknown'}</span>
            <span className="created-at">{new Date(recipe.createdAt || recipe.createdAt || recipe.createdAt).toLocaleString()}</span>
            <div style={{ marginLeft: 12 }}>
              <strong>Rating:</strong> {(recipe.ratingsAvg || 0).toFixed(2)} ({recipe.ratingsCount || 0})
              <div style={{ fontSize: 12, color: '#777' }}>{
                (recipe.ratingsAvg >= 4 ? '✅ Strong recommendation' : (recipe.ratingsAvg >= 3 ? '👍 Recommended' : (recipe.ratingsAvg > 0 ? '⚠️ Mixed reviews' : 'Be the first to rate')))
              }</div>
            </div>
          </div>

          <div className="ingredients">
            <h4>Ingredients</h4>
            <ul>
              {Array.isArray(recipe.ingredients) ? (
                recipe.ingredients.map((ing, i) => <li key={i}>{ing}</li>)
              ) : (
                <li>{recipe.ingredients}</li>
              )}
            </ul>
          </div>

          <div className="instructions">
            <h4>Instructions</h4>
            <div style={{ whiteSpace: 'pre-wrap' }}>{recipe.instructions}</div>
          </div>

          <div className="details-actions">
            {isFavorite ? (
              <HiHeart className="icons fav-detail" style={{ color: 'red', cursor: 'pointer' }} onClick={toggleFavorite} title="Remove from favorites" />
            ) : (
              <HiOutlineHeart className="icons fav-detail" style={{ cursor: 'pointer' }} onClick={toggleFavorite} title="Add to favorites" />
            )}

            <HiShare 
              className="icons share-detail" 
              style={{ cursor: 'pointer', marginLeft: '10px' }} 
              onClick={handleShare} 
              title="Share recipe"
            />
            {shareMessage && <span style={{ marginLeft: '10px', color: 'green', fontSize: '14px' }}>{shareMessage}</span>}

            {user && (String(user._id) === String(recipe.createdBy?._id || recipe.createdBy)) && (
              <button className="btn btn-outline-primary" onClick={() => navigate(`/EditRecipe/${id}`)}>Edit</button>
            )}
          </div>

          {/* Commentaires (affichés seulement sur la page détail) */}
          <div style={{ marginTop: 20 }}>
            <h4>Commentaires ({recipe.comments?.length || 0})</h4>

            {(!recipe.comments || recipe.comments.length === 0) ? (
              <p className="text-muted">Aucun commentaire pour le moment.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {recipe.comments.map((c, i) => (
                  <div key={i} style={{ padding: 10, background: '#fafafa', borderRadius: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <strong>{c.author?.username || c.authorEmail || 'Anonymous'}</strong>
                        <div style={{ fontSize: 12, color: '#666' }}>{c.author?.email || c.authorEmail || ''}</div>
                      </div>
                      <div style={{ fontSize: 12, color: '#999' }}>{c.createdAt ? new Date(c.createdAt).toLocaleString() : ''}</div>
                    </div>

                    <div style={{ marginTop: 8 }}>
                      <div style={{ fontWeight: 600 }}>⭐ {c.rating}</div>
                      <div style={{ marginTop: 6 }}>{c.text}</div>

                      <div style={{ marginTop: 8, display: 'flex', gap: 8 }}>
                        {(user && (String(user._id) === String(c.author) || user.role === 'admin')) && (
                          <button className="btn btn-sm btn-outline-danger" onClick={async () => {
                            if (!confirm('Supprimer ce commentaire ?')) return;
                            try {
                              const token = localStorage.getItem('token');
                              const resp = await axios.delete(`${config.API_URL}/api/recipes/${id}/comment/${c._id}`, { headers: { Authorization: `Bearer ${token}` } });
                              setRecipe(prev => ({ ...prev, comments: resp.data.comments, ratingsAvg: resp.data.ratingsAvg, ratingsCount: resp.data.ratingsCount }));
                            } catch (err) { console.error('Delete failed', err); alert('Suppression échouée'); }
                          }}>Supprimer</button>
                        )}

                        <button className="btn btn-sm btn-outline-warning" onClick={async () => {
                          const reason = prompt('Raison du signalement (optionnel)');
                          if (reason === null) return;
                          try {
                            const token = localStorage.getItem('token');
                            await axios.post(`${config.API_URL}/api/recipes/${id}/comment/${c._id}/report`, { reason }, { headers: { Authorization: `Bearer ${token}` } });
                            alert('Commentaire signalé. Merci.');
                          } catch (err) { console.error('Report failed', err); alert('Signalement échoué'); }
                        }}>Signaler</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Si l'utilisateur est connecté, afficher le formulaire d'ajout/update */}
            {user && (
              <div style={{ marginTop: 16 }}>
                <h5>Ajouter / Mettre à jour votre commentaire</h5>
                <textarea
                  rows={3}
                  value={draftCommentText}
                  onChange={(e) => setDraftCommentText(e.target.value)}
                  placeholder="Écris un commentaire..."
                  style={{ width: '100%', padding: 8, borderRadius: 6, border: '1px solid #ddd' }}
                />
                <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                    Note:
                    <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
                      {[1,2,3,4,5].map(n => (
                        <span 
                          key={n} 
                          style={{ 
                            cursor: 'pointer', 
                            fontSize: 20, 
                            color: draftCommentRating >= n ? '#f5b301' : '#ccc' 
                          }} 
                          onClick={() => setDraftCommentRating(n)}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </label>
                  <button className="btn btn-primary" onClick={async () => {
                    const token = localStorage.getItem('token');
                    if (!token) { navigate('/login'); return; }
                    try {
                      const res = await axios.post(
                        `${config.API_URL}/api/recipes/${id}/comment`, 
                        { 
                          text: draftCommentText, 
                          rating: draftCommentRating 
                        }, 
                        { 
                          headers: { Authorization: `Bearer ${token}` } 
                        }
                      );
                      setRecipe(prev => ({ 
                        ...prev, 
                        comments: res.data.comments, 
                        ratingsAvg: res.data.ratingsAvg, 
                        ratingsCount: res.data.ratingsCount 
                      }));
                      setDraftCommentText('');
                      setDraftCommentRating(0);
                    } catch (err) { 
                      console.error(err); 
                      alert('Erreur lors de l\'envoi du commentaire'); 
                    }
                  }}>Poster</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}