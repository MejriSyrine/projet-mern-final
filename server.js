const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const middleware = require('i18next-http-middleware');
const fs = require('fs');
const path = require('path');

// Ensure public/images directory exists
const imagesDir = path.join(__dirname, 'public', 'images');
if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
    console.log('✅ Created public/images directory');
}

// i18n config
const i18next = require('./i18n/config');

// DB connection helper (optionnel mais propre)
const connectDB = require('./config/connectionDB');

// Routes
const userRoutes = require('./routes/user');
const recipeRoutes = require('./routes/recipe');
const productRoutes = require('./routes/product');

// Models (pour les routes de debug)
const Recipe = require('./models/RecipeSchema');

const app = express();
const PORT = process.env.PORT || 5000;

/* ======================
   🔧 DEBUG MODE
====================== */
console.log("🔧 Mode debug activé");
console.log("🔑 SECRET_KEY:", process.env.SECRET_KEY ? "✓ Défini" : "✗ Non défini");
console.log("🔑 JWT_SECRET:", process.env.JWT_SECRET ? "✓ Défini" : "✗ Non défini");

/* ======================
   🧩 MIDDLEWARES
====================== */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// i18n middleware (DOIT être avant les routes)
app.use(middleware.handle(i18next));

/* ======================
   📁 STATIC FILES
====================== */
app.use('/public', express.static('public'));

/* ======================
   🐛 ROUTES DE DEBUG (À PLACER AVANT LES AUTRES ROUTES)
====================== */

// 1. Route debug SANS authentification
app.get('/api/debug/stats', async (req, res) => {
  try {
    console.log("🐛 /api/debug/stats appelé (sans auth)");
    
    const stats = {
      total: await Recipe.countDocuments({}),
      pending: await Recipe.countDocuments({ status: 'pending' }),
      validated: await Recipe.countDocuments({ status: 'validated' }),
      rejected: await Recipe.countDocuments({ status: 'rejected' })
    };
    
    console.log("📊 Stats MongoDB réelles:", stats);
    
    res.json({
      success: true,
      message: "Données réelles depuis MongoDB (DEBUG MODE)",
      ...stats,
      debug: {
        timestamp: new Date(),
        source: "Route debug sans authentification"
      }
    });
    
  } catch (error) {
    console.error("❌ Erreur /api/debug/stats:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    });
  }
});

// 2. Route pour tester JWT
app.get('/api/debug/test-jwt', (req, res) => {
  try {
    const jwt = require('jsonwebtoken');
    const secret = process.env.SECRET_KEY || process.env.JWT_SECRET;
    
    if (!secret) {
      return res.status(500).json({
        success: false,
        message: "Aucun secret JWT trouvé dans .env"
      });
    }
    
    // Créer un token de test
    const testToken = jwt.sign(
      { 
        id: '65a1b2c3d4e5f67890123456',
        email: 'nutritionist@test.com',
        role: 'nutritionist',
        matricule: 'NUTR001'
      },
      secret,
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token: testToken,
      secretUsed: secret.substring(0, 5) + '...',
      instructions: "Utilisez ce token avec Authorization: Bearer <token>"
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// 3. Route pour vérifier la connexion MongoDB
app.get('/api/debug/mongodb', async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    // Compter les documents dans chaque collection
    const counts = {};
    for (const collName of collectionNames) {
      counts[collName] = await mongoose.connection.db.collection(collName).countDocuments();
    }
    
    res.json({
      success: true,
      connected: mongoose.connection.readyState === 1,
      database: mongoose.connection.db.databaseName,
      collections: collectionNames,
      counts: counts,
      recipes: {
        total: await Recipe.countDocuments({}),
        byStatus: {
          pending: await Recipe.countDocuments({ status: 'pending' }),
          validated: await Recipe.countDocuments({ status: 'validated' }),
          rejected: await Recipe.countDocuments({ status: 'rejected' })
        }
      }
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error.message,
      mongooseState: mongoose.connection.readyState 
    });
  }
});

/* ======================
   🚏 ROUTES PRINCIPALES
====================== */
app.use('/user', userRoutes);
app.use('/api/recipes', recipeRoutes);  // ← Contient /stats (avec auth)
app.use('/product', productRoutes);

// Route test racine
app.get('/', (req, res) => {
    res.json({ 
        message: 'API is running 🚀',
        debug: {
          routes: {
            stats: '/api/debug/stats (sans auth)',
            testJWT: '/api/debug/test-jwt',
            mongodb: '/api/debug/mongodb',
            recipesStats: '/api/recipes/stats (avec auth)'
          }
        }
    });
});

/* ======================
   🔁 SPA HASH REDIRECT
   Redirige les chemins non-API et non-fichiers vers /#<path>
   Exemple: /contact  ->  /#/contact
   Ceci permet à HashRouter de gérer les routes profondes lorsque
   le serveur reçoit directement une URL sans hash.
====================== */
app.use((req, res, next) => {
  try {
    const requestPath = req.path || '';

    // Ne pas rediriger les routes API, ni les assets publics ni les fichiers (ex: .css, .js, .png)
    if (requestPath.startsWith('/api') || requestPath.startsWith('/user') || requestPath.startsWith('/product') || requestPath.startsWith('/public') || path.extname(requestPath)) {
      return next();
    }

    // Si l'URL contient déjà un hash (rare côté serveur), laisser passer
    if (req.originalUrl && req.originalUrl.includes('#')) {
      return next();
    }

    // Construire la cible : /# + originalUrl (inclut query string)
    const target = `${req.protocol}://${req.get('host')}/#${req.originalUrl}`;
    return res.redirect(301, target);
  } catch (err) {
    console.error('Erreur middleware hash-redirect:', err);
    return next();
  }
});

/* ======================
   ❌ ERROR HANDLER
====================== */
app.use((err, req, res, next) => {
    console.error('❌ Global error handler:', err.stack);
    res.status(500).json({
        success: false,
        message: req.t ? req.t('auth.serverError') : 'Server error',
        error: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
});

/* ======================
   🔌 DATABASE CONNECTION
====================== */
connectDB()
  .then(() => {
    console.log('✅ MongoDB connected successfully');
    
    // Démarrer le serveur APRÈS la connexion DB
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔗 Base URL: http://localhost:${PORT}`);
      console.log(`🐛 Routes debug:`);
      console.log(`   • http://localhost:${PORT}/api/debug/stats`);
      console.log(`   • http://localhost:${PORT}/api/debug/test-jwt`);
      console.log(`   • http://localhost:${PORT}/api/debug/mongodb`);
      console.log(`   • http://localhost:${PORT}/api/recipes/stats (avec auth)`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });