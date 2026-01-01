import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../config';

function ValidatedRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('mine'); // 'mine' ou 'all'
  const navigate = useNavigate();

  useEffect(() => {
    fetchValidatedRecipes();
  }, [filter]);

  const fetchValidatedRecipes = async () => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = filter === 'mine' 
        ? `${config.API_URL}/api/recipes/validated/mine`
        : `${config.API_URL}/api/recipes/validated/all`;
      
      const response = await axios.get(endpoint, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      setRecipes(response.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching validated recipes:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-3">Loading validated recipes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="card shadow">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <div>
                <h3 className="mb-0">
                  <i className="fas fa-check-circle me-2"></i>
                  Validated Recipes
                </h3>
                <p className="mb-0 mt-1">
                  <small>
                    Showing: {filter === 'mine' ? 'Validated by you' : 'All validated recipes'} 
                    ({recipes.length} recipes)
                  </small>
                </p>
              </div>
              
              <div className="btn-group">
                <button 
                  className={`btn btn-sm ${filter === 'mine' ? 'btn-light' : 'btn-outline-light'}`}
                  onClick={() => setFilter('mine')}
                >
                  My Validations
                </button>
                <button 
                  className={`btn btn-sm ${filter === 'all' ? 'btn-light' : 'btn-outline-light'}`}
                  onClick={() => setFilter('all')}
                >
                  All Validated
                </button>
              </div>
            </div>
            
            <div className="card-body">
              {recipes.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-clipboard fa-3x text-muted mb-3"></i>
                  <h4>No validated recipes found</h4>
                  <p className="text-muted">
                    {filter === 'mine' 
                      ? "You haven't validated any recipes yet." 
                      : "No recipes have been validated yet."}
                  </p>
                  <button 
                    className="btn btn-success mt-3"
                    onClick={() => navigate('/nutritionist/pending-recipes')}
                  >
                    <i className="fas fa-clipboard-list me-2"></i>
                    Review Pending Recipes
                  </button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Recipe Name</th>
                        <th>Author</th>
                        <th>Category</th>
                        <th>Validated By</th>
                        <th>Validated On</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recipes.map(recipe => (
                        <tr key={recipe._id}>
                          <td>
                            <strong>{recipe.title}</strong>
                            <br />
                            <small className="text-muted">
                              {recipe.description?.substring(0, 50) || 'No description'}...
                            </small>
                          </td>
                          <td>{recipe.createdBy?.email || 'Unknown'}</td>
                          <td>
                            <span className={`badge category-badge ${recipe.category === 'sweet' ? 'dessert' : ['sour', 'salty', 'spicy'].includes(recipe.category) ? 'plats' : recipe.category}`}>
                              {(recipe.category === 'dessert' || recipe.category === 'sweet') ? 'Dessert' : 'Plats'}
                            </span>
                          </td>
                          <td>{recipe.validatedBy?.email || 'System'}</td>
                          <td>
                            {recipe.validatedAt 
                              ? new Date(recipe.validatedAt).toLocaleDateString()
                              : 'N/A'
                            }
                            <br />
                            <small className="text-muted">
                              {recipe.validatedAt 
                                ? new Date(recipe.validatedAt).toLocaleTimeString()
                                : ''
                              }
                            </small>
                          </td>
                          <td>
                            <button 
                              className="btn btn-info btn-sm"
                              onClick={() => navigate(`/recipe/${recipe._id}`)}
                            >
                              <i className="fas fa-eye me-1"></i> View
                            </button>
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
    </div>
  );
}

export default ValidatedRecipes;