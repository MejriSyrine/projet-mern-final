// models/Product.js - VERSION FINALE
const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  // === INFORMATIONS DE BASE ===
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  brand: { 
    type: String, 
    required: true,
    trim: true,
    default: "Marque inconnue"
  },
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  
  // === CATÉGORIE ===
  category: { 
    type: String, 
    enum: [
      'Lait & Œufs',
      'Fruits & Légumes', 
      'Viandes & Poissons',
      'Épicerie Salée',
      'Épicerie Sucrée',
      'Boissons',
      'Surgelés',
      'Hygiène & Maison',
      'Autres'
    ],
    default: 'Autres'
  },
  
  // === INFORMATIONS GLUTEN ===
  glutenFree: { 
    type: Boolean, 
    default: true 
  },
  glutenFreeType: {
    type: String,
    enum: ['Naturellement', 'Sans contamination', 'Certifié', 'À vérifier'],
    default: 'Naturellement'
  },
  glutenWarning: {
    type: Boolean,
    default: false
  },
  
  // === DÉTAILS PRODUIT ===
  price: { 
    type: Number, 
    required: true,
    min: 0
  },
  currency: {
    type: String,
    enum: ['EUR', 'TND'],
    default: 'EUR'
  },
  quantity: {
    type: String,
    default: "1 unité",
    trim: true
  },
  supermarket: {
    type: [String],
    default: ["Carrefour"]
  },
  
  // === IMAGES ===
  image: { 
    type: String,
    default: 'https://via.placeholder.com/300',
    trim: true
  },
  
  // === DISPONIBILITÉ & STOCK ===
  available: {
    type: Boolean,
    default: true
  },
  stock: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // === CODE-BARRE ===
  barcode: {
    type: String,
    trim: true,
    sparse: true // Permet plusieurs valeurs null sans conflit d'index unique
  },
  
  // === VÉRIFICATION ===
  verified: {
    type: Boolean,
    default: true
  }
  
}, { 
  timestamps: true // createdAt, updatedAt
});

module.exports = mongoose.model('Product', productSchema);