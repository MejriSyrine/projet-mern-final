import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function PendingRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingRecipes();
  }, []);

  const fetchPendingRecipes = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        'http://localhost:5000/api/recipes/pending',
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      setRecipes(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching pending recipes:", error);
      setError("Could not load pending recipes. Please check your connection.");
      setLoading(false);
    }
  };

  const handleApprove = async (recipeId) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/recipes/${recipeId}/approve`,
        {},
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      // Mettre à jour la liste locale
      setRecipes(recipes.filter(recipe => recipe._id !== recipeId));
      alert("✅ Recipe approved successfully!");
      
      // Rafraîchir les stats du dashboard
      window.dispatchEvent(new Event('statsUpdated'));
      
    } catch (error) {
      console.error("Error approving recipe:", error);
      alert("❌ Error approving recipe: " + (error.response?.data?.error || error.message));
    }
  };

  const handleReject = async (recipeId) => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/api/recipes/${recipeId}/reject`,
        { reason: rejectReason },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      
      // Mettre à jour la liste locale
      setRecipes(recipes.filter(recipe => recipe._id !== recipeId));
      setSelectedRecipe(null);
      setRejectReason('');
      alert("❌ Recipe rejected successfully!");
      
      // Rafraîchir les stats du dashboard
      window.dispatchEvent(new Event('statsUpdated'));
      
    } catch (error) {
      console.error("Error rejecting recipe:", error);
      alert("❌ Error rejecting recipe: " + (error.response?.data?.error || error.message));
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading pending recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
              <div>
                <h3 className="mb-0">
                  <i className="fas fa-clock me-2"></i>
                  Pending Recipes for Review
                </h3>
                <p className="mb-0 mt-1">
                  <small>Total: {recipes.length} recipe(s) waiting for approval</small>
                </p>
              </div>
              <button 
                className="btn btn-sm btn-outline-dark"
                onClick={fetchPendingRecipes}
              >
                <i className="fas fa-redo me-1"></i> Refresh
              </button>
            </div>
            
            <div className="card-body">
              {error && (
                <div className="alert alert-danger">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  {error}
                </div>
              )}

              {recipes.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-check-circle fa-3x text-success mb-3"></i>
                  <h4>No pending recipes!</h4>
                  <p className="text-muted">All recipes have been reviewed.</p>
                  <button 
                    className="btn btn-success mt-3"
                    onClick={() => navigate('/nutritionist/dashboard')}
                  >
                    <i className="fas fa-tachometer-alt me-2"></i>
                    Back to Dashboard
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover pending-recipes-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Recipe Name</th>
                        <th>Author</th>
                        <th>Category</th>
                        <th>Difficulty</th>
                        <th>Time</th>
                        <th>Submitted</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipes.map((recipe, index) => (
                        <tr key={recipe._id}>
                          <td>{index + 1}</td>
                          <td>
                            <strong>{recipe.title}</strong>
                            <br />
                            <small className="text-muted">
                              {recipe.description ? recipe.description.substring(0, 50) + '...' : 'No description'}
                            </small>
                          </td>
                          <td>
                            {/* MODIFICATION ICI: createdBy au lieu de author */}
                            {recipe.createdBy?.email || 'Unknown'}
                            <br />
                            <small className="text-muted">
                              {recipe.createdBy?.username || 'No username'}
                            </small>
                          </td>
                          <td>
                            <span className={`badge category-badge ${recipe.category === 'sweet' ? 'dessert' : ['sour', 'salty', 'spicy'].includes(recipe.category) ? 'plats' : recipe.category}`}>
                              {(recipe.category === 'dessert' || recipe.category === 'sweet') ? 'Dessert' : 'Plats'}
                            </span>
                          </td>
                          <td>
                            {/* Si votre schéma n'a pas de champ difficulty, utilisez une valeur par défaut */}
                            <span className={`badge bg-${recipe.difficulty === 'easy' ? 'success' : recipe.difficulty === 'medium' ? 'warning' : 'danger'}`}>
                              {recipe.difficulty || 'medium'}
                            </span>
                          </td>
                          <td>
                            {/* Si votre schéma n'a pas de champ cookingTime, affichez N/A */}
                            {recipe.cookingTime ? `${recipe.cookingTime} min` : 'N/A'}
                          </td>
                          <td>
                            {new Date(recipe.createdAt).toLocaleDateString()}
                            <br />
                            <small className="text-muted">
                              {new Date(recipe.createdAt).toLocaleTimeString()}
                            </small>
                          </td>
                          <td>
                            <div className="recipe-actions">
                              <button 
                                className="btn btn-success btn-sm"
                                onClick={() => handleApprove(recipe._id)}
                                title="Approve this recipe"
                              >
                                <i className="fas fa-check me-1"></i> Approve
                              </button>
                              
                              <button 
                                className="btn btn-danger btn-sm"
                                onClick={() => setSelectedRecipe(recipe)}
                                title="Reject this recipe"
                              >
                                <i className="fas fa-times me-1"></i> Reject
                              </button>
                              
                              <button 
                                className="btn btn-info btn-sm"
                                onClick={() => navigate(`/recipe/${recipe._id}`)}
                                title="View recipe details"
                              >
                                <i className="fas fa-eye me-1"></i> View
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal pour rejet */}
      {selectedRecipe && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="fas fa-exclamation-triangle text-danger me-2"></i>
                Reject Recipe
              </h5>
              <button 
                type="button" 
                className="btn-close" 
                onClick={() => {
                  setSelectedRecipe(null);
                  setRejectReason('');
                }}
              ></button>
            </div>
            
            <div className="modal-body">
              <p>
                You are about to reject the recipe: <strong>{selectedRecipe.title}</strong>
              </p>
              <p className="text-muted">
                {/* MODIFICATION ICI AUSSI: createdBy au lieu de author */}
                Submitted by: {selectedRecipe.createdBy?.email || 'Unknown'}
                {selectedRecipe.createdBy?.username && (
                  <span> ({selectedRecipe.createdBy?.username})</span>
                )}
              </p>
              
              <div className="form-group mt-3">
                <label htmlFor="rejectReason" className="form-label">
                  <strong>Reason for rejection:</strong>
                  <span className="text-danger">*</span>
                </label>
                <textarea
                  id="rejectReason"
                  className="form-control"
                  rows="4"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Please provide a clear reason for rejection (e.g., inappropriate content, missing information, etc.)"
                  required
                />
                <small className="text-muted">
                  This reason will be visible to the recipe author.
                </small>
              </div>
            </div>
            
            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => {
                  setSelectedRecipe(null);
                  setRejectReason('');
                }}
              >
                Cancel
              </button>
              <button 
                type="button" 
                className="btn btn-danger"
                onClick={() => handleReject(selectedRecipe._id)}
                disabled={!rejectReason.trim()}
              >
                <i className="fas fa-times me-1"></i>
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PendingRecipes;