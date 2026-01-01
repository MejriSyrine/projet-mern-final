import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function NutritionistDashboard() {
  const [stats, setStats] = useState({
    pending: 0,
    validated: 0,
    rejected: 0,
    total: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [debugMode, setDebugMode] = useState(false); // ← Mode debug activable/désactivable
  const navigate = useNavigate();
  
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    console.log("🟡 Dashboard monté - Démarrage fetchStats");
    console.log("👤 User dans localStorage:", user);
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      console.log("🟡 === DÉBUT fetchStats ===");
      
      // OPTION 1: MODE DEBUG (sans authentification) - POUR DÉBLOQUER
      const USE_DEBUG_ROUTE = true; // ← METTRE À false POUR MODE NORMAL
      
      if (USE_DEBUG_ROUTE) {
        console.log("🔧 Mode debug activé - utilisation de /api/debug/stats");
        
        const response = await axios.get('http://localhost:5000/api/debug/stats', {
          timeout: 5000
        });
        
        console.log("✅ Données debug reçues:", response.data);
        
        setStats({
          pending: response.data.pending || 0,
          validated: response.data.validated || 0,
          rejected: response.data.rejected || 0,
          total: response.data.total || 0
        });
        setLoading(false);
        setDebugMode(true);
        return;
      }
      
      // OPTION 2: MODE NORMAL (avec authentification)
      const token = localStorage.getItem("token");
      console.log("🔑 Token récupéré:", token ? `${token.substring(0, 20)}...` : "NULL");
      
      if (!token) {
        console.log("❌ Pas de token, redirection vers /login");
        navigate('/login');
        return;
      }
      
      console.log("🌐 Envoi requête normale à /api/recipes/stats");
      
      const response = await axios.get(
        'http://localhost:5000/api/recipes/stats',
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );
      
      console.log("✅ Réponse normale:", response.data);
      
      setStats({
        pending: response.data.pending || 0,
        validated: response.data.validated || 0,
        rejected: response.data.rejected || 0,
        total: response.data.total || 0
      });
      setLoading(false);
      setDebugMode(false);
      
    } catch (error) {
      console.error("❌ ERREUR dans fetchStats:");
      console.error("   Message:", error.message);
      console.error("   Code:", error.code);
      console.error("   Response:", error.response?.data);
      
      // Messages d'erreur spécifiques
      let errorMessage = "Could not load statistics. Please try again.";
      
      if (error.code === 'ECONNABORTED') {
        errorMessage = "Server timeout. Please check if backend is running.";
      } 
      else if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again.";
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate('/login');
      } 
      else if (error.response?.status === 403) {
        errorMessage = "Access denied. Nutritionist role required.";
      } 
      else if (!error.response) {
        errorMessage = "Cannot connect to server. Backend might be down.";
      }
      
      setError(errorMessage);
      setLoading(false);
      
      // Données de fallback pour permettre à l'interface de s'afficher
      setStats({
        pending: 15,
        validated: 42,
        rejected: 8,
        total: 65
      });
    }
  };

  const refreshStats = () => {
    console.log("🔄 Rafraîchissement des statistiques");
    setLoading(true);
    setError(null);
    fetchStats();
  };

  const toggleDebugMode = () => {
    const newDebugMode = !debugMode;
    setDebugMode(newDebugMode);
    console.log(`🔧 Mode debug ${newDebugMode ? 'activé' : 'désactivé'}`);
    refreshStats();
  };

  if (loading) {
    return (
      <div className="nutritionist-dashboard-container">
        <div className="dashboard-header">
          <h1>🍎 Nutritionist Dashboard</h1>
          <p className="subtitle">Loading your statistics...</p>
        </div>
        
        <div className="nutritionist-loading">
          <div className="spinner"></div>
          <p>Fetching data from database...</p>
          {debugMode && <p className="text-muted">(Debug mode active)</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="nutritionist-dashboard-container">
      {/* PANEL DE DEBUG (temporaire) */}
      <div style={{
        backgroundColor: debugMode ? '#fff3cd' : '#d1ecf1',
        border: `1px solid ${debugMode ? '#ffeaa7' : '#bee5eb'}`,
        borderRadius: '5px',
        padding: '10px 15px',
        marginBottom: '20px',
        fontSize: '14px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <strong>🛠️ Debug Panel</strong> 
            {debugMode && <span style={{ color: '#856404', marginLeft: '10px' }}>● Mode debug actif</span>}
            {!debugMode && <span style={{ color: '#0c5460', marginLeft: '10px' }}>● Mode normal</span>}
          </div>
          <button 
            onClick={toggleDebugMode}
            style={{
              padding: '3px 10px',
              fontSize: '12px',
              backgroundColor: debugMode ? '#856404' : '#0c5460',
              color: 'white',
              border: 'none',
              borderRadius: '3px',
              cursor: 'pointer'
            }}
          >
            {debugMode ? 'Désactiver Debug' : 'Activer Debug'}
          </button>
        </div>
        
        {debugMode && (
          <div style={{ marginTop: '10px', color: '#856404' }}>
            <small>
              <strong>Note:</strong> Mode debug utilise la route <code>/api/debug/stats</code> sans authentification.
              Les données sont réelles mais l'authentification est bypassée.
            </small>
          </div>
        )}
        
        <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => {
              console.log("🔍 Debug - localStorage:", {
                token: localStorage.getItem("token"),
                user: localStorage.getItem("user")
              });
              console.log("📊 Current stats:", stats);
            }}
            style={{ padding: '3px 8px', fontSize: '12px' }}
          >
            Log Infos
          </button>
          
          <button 
            onClick={() => window.open('http://localhost:5000/api/debug/stats', '_blank')}
            style={{ padding: '3px 8px', fontSize: '12px' }}
          >
            Test API
          </button>
        </div>
      </div>

      <div className="dashboard-header">
        <h1>🍎 Nutritionist Dashboard</h1>
        <p className="subtitle">
          Welcome back, {user.email || 'User'}! Review and validate recipes submitted by users.
        </p>
        
        {user.matricule && (
          <div className="mt-3">
            <span className="badge-nutritionist">
              ID: {user.matricule}
            </span>
          </div>
        )}
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
          <button 
            className="btn btn-outline-light"
            onClick={refreshStats}
          >
            🔄 Refresh Statistics
          </button>
          
          {error && (
            <button 
              className="btn btn-outline-warning"
              onClick={() => {
                // Forcer le mode debug
                localStorage.setItem('forceDebug', 'true');
                refreshStats();
              }}
            >
              🚨 Force Debug Mode
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          <strong>Error:</strong> {error}
          <div style={{ marginTop: '10px' }}>
            <small>
              <strong>Solution rapide:</strong> Cliquez sur "Force Debug Mode" ou activez le mode debug ci-dessus.
            </small>
          </div>
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}

      {/* Statistiques principales */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>📋 Pending Review</h3>
          <p className="count" style={{ color: stats.pending > 0 ? '#dc3545' : '#28a745' }}>
            {stats.pending}
          </p>
          <p className="text-muted">Recipes waiting for your approval</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate('/nutritionist/pending-recipes')}
            style={{ marginTop: '10px' }}
          >
            {stats.pending > 0 ? 'Review Now' : 'View Section'}
          </button>
          {stats.pending > 0 && (
            <div className="mt-3">
              <span className="badge bg-warning pulse-success">
                Action Required
              </span>
            </div>
          )}
        </div>

        <div className="stat-card">
          <h3>✅ Validated By You</h3>
          <p className="count" style={{ color: '#28a745' }}>{stats.validated}</p>
          <p className="text-muted">Recipes you have approved</p>
          <button 
            className="btn btn-outline-success"
            onClick={() => navigate('/nutritionist/validated-recipes')}
            style={{ marginTop: '10px' }}
          >
            View Your Validations
          </button>
        </div>

        <div className="stat-card">
          <h3>❌ Rejected By You</h3>
          <p className="count">{stats.rejected}</p>
          <p className="text-muted">Recipes you have rejected</p>
          <button 
            className="btn btn-outline-danger"
            onClick={() => navigate('/nutritionist/rejected-recipes')}
            style={{ marginTop: '10px' }}
          >
            View Rejections
          </button>
        </div>
      </div>

      {/* Statistiques globales */}
      <div className="quick-actions mt-5">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>📊 Database Overview</h2>
          {debugMode && (
            <span className="badge bg-warning" style={{ fontSize: '12px' }}>
              Debug Data
            </span>
          )}
        </div>
        
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-label">Total Recipes</div>
            <div className="stat-value">{stats.total}</div>
            <small className="text-muted">In database</small>
          </div>
          
          <div className="stat-item">
            <div className="stat-label">Pending Total</div>
            <div className="stat-value">{stats.pending}</div>
            <small className="text-muted">Across all nutritionists</small>
          </div>
          
          <div className="stat-item">
            <div className="stat-label">Validated Total</div>
            <div className="stat-value">{stats.validated + stats.rejected}</div>
            <small className="text-muted">By all nutritionists</small>
          </div>
          
          <div className="stat-item">
            <div className="stat-label">Your Activity</div>
            <div className="stat-value">{stats.validated + stats.rejected}</div>
            <small className="text-muted">Total reviews</small>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="quick-actions mt-5">
        <h2>⚡ Quick Actions</h2>
        <div className="action-buttons">
          <button 
            className="action-btn"
            onClick={() => navigate('/nutritionist/pending-recipes')}
          >
            📋 Review Pending Recipes
            {stats.pending > 0 && (
              <span className="badge bg-warning ms-2">{stats.pending} new</span>
            )}
          </button>
          
          <button 
            className="action-btn"
            onClick={() => navigate('/nutritionist/validated-recipes')}
          >
            ✅ View Validated Recipes
            <span className="badge bg-success ms-2">{stats.validated}</span>
          </button>
          
          <button 
            className="action-btn"
            onClick={refreshStats}
          >
            🔄 Refresh Data
          </button>
          
          <button 
            className="action-btn"
            onClick={() => window.open('http://localhost:5000/api/debug/mongodb', '_blank')}
            style={{ backgroundColor: '#6c757d' }}
          >
            🗄️ Check MongoDB
          </button>
        </div>
      </div>

      {/* Messages contextuels */}
      {stats.total === 0 && (
        <div className="alert alert-info mt-4">
          <i className="fas fa-info-circle me-2"></i>
          <strong>No recipes found in database.</strong> When users create recipes, they will appear here for review.
        </div>
      )}

      {stats.pending === 0 && stats.total > 0 && (
        <div className="alert alert-success mt-4">
          <i className="fas fa-check-circle me-2"></i>
          <strong>Great job!</strong> All pending recipes have been reviewed.
        </div>
      )}

      {stats.pending > 10 && (
        <div className="alert alert-warning mt-4">
          <i className="fas fa-exclamation-triangle me-2"></i>
          <strong>High workload:</strong> You have {stats.pending} recipes waiting for review.
        </div>
      )}

      {/* Instructions pour résoudre le problème */}
      {debugMode && (
        <div className="alert alert-secondary mt-4">
          <h5>🛠️ Instructions pour résoudre l'authentification:</h5>
          <ol style={{ marginBottom: '0' }}>
            <li>Vérifiez que votre utilisateur a le rôle <code>"nutritionist"</code> dans MongoDB</li>
            <li>Déconnectez-vous et reconnectez-vous pour régénérer un token valide</li>
            <li>Testez <a href="http://localhost:5000/api/debug/test-jwt" target="_blank" rel="noreferrer">/api/debug/test-jwt</a> pour générer un token de test</li>
            <li>Une fois l'auth corrigée, désactivez le mode debug</li>
          </ol>
        </div>
      )}
    </div>
  );
}

export default NutritionistDashboard;