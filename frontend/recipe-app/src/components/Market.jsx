import React, { useEffect, useState } from 'react';
import './Market.css';
import config from '../config';

const Icons = {
  cart: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
      <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
    </svg>
  ),
  leaf: (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/>
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
    </svg>
  ),
  check: (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  ),
  star: (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  help: (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  warning: (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  verified: (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      <polyline points="9 12 12 15 16 10"/>
    </svg>
  ),
  plus: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  map: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  )
};

function Market() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedSupermarket, setSelectedSupermarket] = useState('Tous');
  const [showOnlyGlutenFree, setShowOnlyGlutenFree] = useState(true);

  const categories = ['Tous', 'Lait & Œufs', 'Fruits & Légumes', 'Viandes & Poissons', 'Épicerie Salée', 'Épicerie Sucrée', 'Boissons'];
  const supermarkets = ['Tous', 'Monoprix', 'Aziza', 'Géant', 'MG','Tyfano - sans gluten','Gluten Free Serenity','Hayet medical','Felder'];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (products.length > 0) {
      let filtered = [...products];
      
      if (selectedCategory !== 'Tous') {
        filtered = filtered.filter(p => p.category === selectedCategory);
      }
      
      if (selectedSupermarket !== 'Tous') {
        filtered = filtered.filter(p => p.supermarket && p.supermarket.includes(selectedSupermarket));
      }
      
      if (showOnlyGlutenFree) {
        filtered = filtered.filter(p => p.glutenFree);
      }
      
      setFilteredProducts(filtered);
    }
  }, [products, selectedCategory, selectedSupermarket, showOnlyGlutenFree]);

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${config.API_URL}/product`);
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des produits');
      }
      const data = await response.json();
      
      const productsWithCurrency = data.map(product => ({
        ...product,
        currency: product.currency || 'EUR'
      }));
      
      setProducts(productsWithCurrency);
      setFilteredProducts(productsWithCurrency);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    console.log('Produit ajouté:', product);
    alert(`${product.name} ajouté à votre liste de courses !`);
  };

  const getGlutenBadge = (product) => {
    if (!product.glutenFree) return null;
    
    const badges = {
      'Naturellement': { icon: Icons.leaf, text: 'Naturellement', className: 'badge-natural' },
      'Sans contamination': { icon: Icons.check, text: 'Sans gluten', className: 'badge-safe' },
      'Certifié': { icon: Icons.star, text: 'Certifié', className: 'badge-certified' },
      'À vérifier': { icon: Icons.help, text: 'À vérifier', className: 'badge-check' }
    };
    
    const badge = badges[product.glutenFreeType] || badges['Sans contamination'];
    return (
      <span className={`gluten-badge ${badge.className}`}>
        {badge.icon} {badge.text}
      </span>
    );
  };

  const formatPrice = (product) => {
    const price = product.price?.toFixed(2) || '0.00';
    if (product.currency === 'TND') {
      return `${price} DT`;
    } else {
      return `${price} €`;
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Chargement des produits...</p>
      </div>
    );
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="market-container">
      <div className="market-header">
        <h1>{Icons.cart} Gluten-Free Finder</h1>
        <p>Les produits de supermarché vérifiés sans gluten</p>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Catégorie:</label>
          <select 
            value={selectedCategory} 
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="filter-select"
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Supermarché:</label>
          <select 
            value={selectedSupermarket} 
            onChange={(e) => setSelectedSupermarket(e.target.value)}
            className="filter-select"
          >
            {supermarkets.map(sup => (
              <option key={sup} value={sup}>{sup}</option>
            ))}
          </select>
        </div>

        {selectedSupermarket && selectedSupermarket !== 'Tous' && (
          <div className="filter-group maps-action">
            <label>Visiter sur la carte:</label>
            <button
              className="btn-view-map"
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedSupermarket)}`, '_blank')}
            >
              {Icons.map} Ouvrir {selectedSupermarket} dans Maps
            </button>
          </div>
        )}

        <div className="filter-group checkbox-group">
          <label>
            <input 
              type="checkbox" 
              checked={showOnlyGlutenFree}
              onChange={(e) => setShowOnlyGlutenFree(e.target.checked)}
            />
            Sans gluten seulement
          </label>
          <span className="product-count">
            {filteredProducts.length} produits
          </span>
        </div>
      </div>

      <div className="products-grid">
        {filteredProducts.length === 0 ? (
          <div className="no-products">
            <p>Aucun produit ne correspond à vos critères</p>
          </div>
        ) : (
          filteredProducts.map((product) => (
            <div key={product._id} className="product-card">
              <div className="product-image">
                <img 
                  src={product.image || 'https://via.placeholder.com/300'} 
                  alt={product.name}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300';
                  }}
                />
                <div className="product-badges">
                  {getGlutenBadge(product)}
                  {product.glutenWarning && (
                    <span className="warning-badge">{Icons.warning} Traces possibles</span>
                  )}
                  {product.verified && (
                    <span className="verified-badge">{Icons.verified} Vérifié</span>
                  )}
                </div>
              </div>
              
              <div className="product-info">
                <h3>{product.name || 'Produit sans nom'}</h3>
                <p className="product-brand">{product.brand || ''}</p>
                <p className="product-description">{product.description || ''}</p>
                
                <div className="product-details">
                  <div className="supermarkets">
                    {product.supermarket && product.supermarket.map(store => (
                      <button
                        key={store}
                        className="store-tag store-link"
                        onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store)}`, '_blank')}
                        title={`Ouvrir ${store} dans Google Maps`}
                      >
                        {store}
                      </button>
                    ))}
                  </div>
                  
                  <div className="quantity-info">{product.quantity || ''}</div>
                </div>
                
                <div className="product-footer">
                  <span 
                    className="product-price" 
                    data-currency={product.currency || 'EUR'}
                  >
                    {formatPrice(product)}
                  </span>
                  <button 
                    className="btn-add-cart"
                    onClick={() => addToCart(product)}
                  >
                    {Icons.plus} Ajouter
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Market;
