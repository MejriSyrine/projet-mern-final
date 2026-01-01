const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Recipe = require('../models/RecipeSchema');
const isNutritionist = require('../middleware/isNutritionist');
const verifyToken = require('../middleware/auth');

// ============================================
// CONFIGURATION MULTER POUR UPLOAD D'IMAGES
// ============================================

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/images/');
  },
  filename: (req, file, cb) => {
    const uniqueName = `recipe-${Date.now()}-${Math.floor(Math.random() * 1000000000)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Seules les images sont autorisées (JPG, PNG, GIF)'));
  }
});

// ============================================
// ROUTES SPÉCIFIQUES EN PREMIER
// ============================================

// GET statistiques pour le dashboard nutritionniste
router.get('/stats', isNutritionist, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const pendingCount = await Recipe.countDocuments({ status: 'pending' });
    const validatedCount = await Recipe.countDocuments({ 
      status: 'validated',
      validatedBy: userId 
    });
    const rejectedCount = await Recipe.countDocuments({ 
      status: 'rejected',
      validatedBy: userId 
    });
    const totalCount = await Recipe.countDocuments({});
    const totalValidated = await Recipe.countDocuments({ status: 'validated' });
    
    res.json({
      pending: pendingCount,
      validated: validatedCount,
      rejected: rejectedCount,
      total: totalCount,
      totalValidated: totalValidated,
      nutritionistId: userId
    });
    
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      error: 'Error fetching statistics',
      details: error.message 
    });
  }
});

// GET recettes en attente
router.get('/pending', isNutritionist, async (req, res) => {
  try {
    const pendingRecipes = await Recipe.find({ status: 'pending' })
      .sort({ createdAt: -1 });
    
    res.json(pendingRecipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET recettes validées (par CE nutritionniste)
router.get('/validated/mine', isNutritionist, async (req, res) => {
  try {
    const validatedRecipes = await Recipe.find({ 
      status: 'validated',
      validatedBy: req.user.id 
    })
      .sort({ approvedAt: -1 });
    
    res.json(validatedRecipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET TOUTES les recettes validées
router.get('/validated/all', isNutritionist, async (req, res) => {
  try {
    const validatedRecipes = await Recipe.find({ status: 'validated' })
      .sort({ approvedAt: -1 });
    
    res.json(validatedRecipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET recettes rejetées
router.get('/rejected/mine', isNutritionist, async (req, res) => {
  try {
    const rejectedRecipes = await Recipe.find({ 
      status: 'rejected',
      validatedBy: req.user.id 
    })
      .sort({ updatedAt: -1 });
    
    res.json(rejectedRecipes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET recettes de l'utilisateur connecté
router.get('/mine', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log(`📋 Récupération des recettes pour l'utilisateur ${userId}`);
    
    const myRecipes = await Recipe.find({ 
      createdBy: userId
    })
      .sort({ createdAt: -1 });
    
    console.log(`✅ ${myRecipes.length} recettes trouvées pour cet utilisateur`);
    res.json(myRecipes);
  } catch (error) {
    console.error('Error fetching user recipes:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la récupération des recettes',
      details: error.message 
    });
  }
});

// ============================================
// ROUTE GÉNÉRALE (SANS AUTH)
// ============================================

// GET toutes les recettes (liste publique) — n'inclut pas le contenu complet des commentaires, seulement le nombre
router.get('/', async (req, res) => {
  try {
    console.log('📋 Récupération de toutes les recettes (liste publique)...');
    const recipes = await Recipe.find().populate('createdBy', 'username email').sort({ createdAt: -1 });

    // Map pour remplacer la liste complète des commentaires par un compteur
    const payload = recipes.map(r => ({
      _id: r._id,
      title: r.title,
      category: r.category,
      coverImage: r.coverImage,
      createdBy: r.createdBy,
      createdAt: r.createdAt,
      status: r.status,
      ratingsAvg: r.ratingsAvg || 0,
      ratingsCount: r.ratingsCount || 0,
      commentsCount: (r.comments && r.comments.length) || 0
    }));

    console.log(`✅ ${payload.length} recettes préparées pour la réponse publique`);
    res.json(payload);
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({ message: error.message });
  }
});

// ============================================
// ROUTES POST (CRÉATION)
// ============================================

// POST - Créer une nouvelle recette
router.post('/', verifyToken, upload.single('coverImage'), async (req, res) => {
  try {
    const { title, ingredients, instructions, category } = req.body;
    
    console.log('📥 Received recipe data:', { 
      title, 
      category, 
      hasImage: !!req.file,
      userId: req.user.id 
    });
    
    if (!title || !ingredients || !instructions || !category) {
      return res.status(400).json({ 
        error: 'Champs requis manquants',
        required: ['title', 'ingredients', 'instructions', 'category']
      });
    }

    const newRecipe = new Recipe({
      title: title.trim(),
      ingredients: typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients,
      instructions: instructions.trim(),
      category,
      coverImage: req.file ? req.file.filename : null,
      createdBy: req.user.id,
      status: 'pending',
    });

    await newRecipe.save();
    
    console.log('✅ Recipe created successfully:', newRecipe._id);
    res.status(201).json({ 
      message: 'Recette créée avec succès',
      recipe: newRecipe 
    });
  } catch (error) {
    console.error('❌ Error creating recipe:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la création de la recette',
      details: error.message 
    });
  }
});

// ============================================
// ROUTES PUT (MODIFICATIONS)
// ============================================

// PUT approuver une recette
router.put('/:id/approve', isNutritionist, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    recipe.status = 'validated';
    recipe.validatedBy = req.user.id;
    recipe.approvedAt = Date.now();
    recipe.rejectionReason = undefined;
    
    await recipe.save();
    
    console.log(`✅ Recipe ${req.params.id} approved by ${req.user.id}`);
    res.json({ 
      message: 'Recipe approved successfully', 
      recipe: recipe
    });
  } catch (error) {
    console.error('Error approving recipe:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT rejeter une recette
router.put('/:id/reject', isNutritionist, async (req, res) => {
  try {
    const { reason } = req.body;
    
    if (!reason || reason.trim() === '') {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }
    
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    recipe.status = 'rejected';
    recipe.rejectionReason = reason;
    recipe.validatedBy = req.user.id;
    recipe.approvedAt = Date.now();
    
    await recipe.save();
    
    console.log(`❌ Recipe ${req.params.id} rejected by ${req.user.id}`);
    res.json({ 
      message: 'Recipe rejected successfully', 
      recipe: recipe
    });
  } catch (error) {
    console.error('Error rejecting recipe:', error);
    res.status(500).json({ error: error.message });
  }
});

// PUT modifier une recette
router.put('/:id', verifyToken, upload.single('coverImage'), async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    const userId = String(req.user.id);
    const createdById = String(recipe.createdBy?._id || recipe.createdBy || '');
    const isAdmin = req.user.role === 'admin';
    const isNutritionist = req.user.role === 'nutritionist';
    
    console.log(`🔍 Edit check: userId=${userId}, createdById=${createdById}, isAdmin=${isAdmin}`);
    
    if (createdById !== userId && !isAdmin && !isNutritionist) {
      return res.status(403).json({ error: 'Unauthorized to edit this recipe' });
    }
    
    const { title, ingredients, instructions, category } = req.body;
    
    if (title) recipe.title = title.trim();
    if (ingredients) recipe.ingredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
    if (instructions) recipe.instructions = instructions.trim();
    if (category) recipe.category = category;
    if (req.file) recipe.coverImage = req.file.filename;
    
    await recipe.save();
    
    console.log(`✅ Recipe ${req.params.id} updated by ${userId}`);
    res.json({ 
      message: 'Recipe updated successfully',
      success: true,
      recipe 
    });
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ 
      error: 'Error updating recipe',
      details: error.message 
    });
  }
});

// ============================================
// ROUTES DELETE (SUPPRESSION)
// ============================================

// DELETE supprimer une recette
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    const userId = String(req.user.id);
    const createdById = String(recipe.createdBy?._id || recipe.createdBy || '');
    const isAdmin = req.user.role === 'admin';
    const isNutritionist = req.user.role === 'nutritionist';
    
    console.log(`🔍 Delete check: userId=${userId}, createdById=${createdById}, isAdmin=${isAdmin}`);
    
    if (createdById !== userId && !isAdmin && !isNutritionist) {
      return res.status(403).json({ error: 'Unauthorized to delete this recipe' });
    }
    
    await Recipe.findByIdAndDelete(req.params.id);
    
    console.log(`🗑️ Recipe ${req.params.id} deleted by ${userId}`);
    res.json({ message: 'Recipe deleted successfully', success: true });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ 
      error: 'Error deleting recipe',
      details: error.message 
    });
  }
});

// ============================================
// ROUTES GET INDIVIDUELLES (À LA FIN)
// ============================================

// POST ajouter un commentaire à une recette (auth requis)
router.post('/:id/comment', verifyToken, async (req, res) => {
  try {
    const { text, rating } = req.body;
    if (!text || text.trim() === '') {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    const comment = {
      text: text.trim(),
      rating: rating !== undefined ? Number(rating) : 0,
      author: req.user.id,
      authorEmail: req.user.email || null,
      createdAt: new Date()
    };

    recipe.comments = recipe.comments || [];
    // If user already commented, update it, else push
    const existing = recipe.comments.find(c => String(c.author) === String(req.user.id));
    if (existing) {
      existing.text = comment.text;
      existing.rating = comment.rating;
      existing.createdAt = new Date();
    } else {
      recipe.comments.push(comment);
    }

    // Recalculate simple ratings
    const ratings = recipe.comments.map(c => Number(c.rating) || 0);
    recipe.ratingsCount = ratings.length;
    recipe.ratingsAvg = ratings.length ? Math.round((ratings.reduce((a,b) => a+b,0) / ratings.length) * 100) / 100 : 0;

    await recipe.save();

    const populated = await Recipe.findById(req.params.id).populate('comments.author', 'username email');
    res.status(existing ? 200 : 201).json({ comments: populated.comments, ratingsAvg: populated.ratingsAvg, ratingsCount: populated.ratingsCount });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE supprimer un commentaire (l'auteur ou admin seulement)
router.delete('/:id/comment/:commentId', verifyToken, async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const recipe = await Recipe.findById(id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    const comment = recipe.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    // Autorisation : auteur du commentaire ou admin
    if (String(comment.author) !== String(req.user.id) && (!req.user.role || req.user.role !== 'admin')) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    comment.remove();

    // Recalculate ratings
    const ratings = recipe.comments.map(c => Number(c.rating) || 0);
    recipe.ratingsCount = ratings.length;
    recipe.ratingsAvg = ratings.length ? Math.round((ratings.reduce((a,b) => a+b,0) / ratings.length) * 100) / 100 : 0;

    await recipe.save();

    const populated = await Recipe.findById(id).populate('comments.author', 'username email');
    res.json({ comments: populated.comments, ratingsAvg: populated.ratingsAvg, ratingsCount: populated.ratingsCount });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST signaler un commentaire (n'importe quel utilisateur connecté)
router.post('/:id/comment/:commentId/report', verifyToken, async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { reason } = req.body;
    const recipe = await Recipe.findById(id);
    if (!recipe) return res.status(404).json({ error: 'Recipe not found' });

    const comment = recipe.comments.id(commentId);
    if (!comment) return res.status(404).json({ error: 'Comment not found' });

    comment.reports = comment.reports || [];
    comment.reports.push({ reporter: req.user.id, reason: reason || null, reportedAt: new Date() });

    await recipe.save();

    res.json({ message: 'Comment reported', reports: comment.reports });
  } catch (error) {
    console.error('Error reporting comment:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET une recette spécifique par ID (avec createdBy peuplé)
router.get('/:id', async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('createdBy', 'username email')
      .populate('comments.author', 'username email');
    
    if (!recipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    res.json(recipe);
  } catch (error) {
    console.error('Error fetching recipe by id:', error);
    res.status(500).json({ 
      error: 'Error fetching recipe',
      details: error.message 
    });
  }
});

module.exports = router;