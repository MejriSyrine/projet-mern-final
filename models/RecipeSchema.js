const mongoose = require('mongoose');

const RecipeSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    ingredients: {
        type: Array,
        required: true,
        validate: {
            validator: function(v) {
                return Array.isArray(v) && v.length > 0;
            },
            message: 'Ingredients must be a non-empty array'
        }
    },
    instructions: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['plats', 'dessert', 'sweet', 'sour', 'salty', 'spicy'], // Nouvelles catégories + anciennes pour migration
        required: true
    },
    coverImage: {
        type: String,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Commentaires publics simples
    comments: [
        {
            text: { type: String, required: true, trim: true },
            rating: { type: Number, min: 0, max: 5, default: 0 },
            author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            authorEmail: { type: String, trim: true },
            createdAt: { type: Date, default: Date.now },
            reports: [
                {
                    reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                    reason: { type: String, trim: true, default: null },
                    reportedAt: { type: Date, default: Date.now }
                }
            ]
        }
    ],
    // Champs pour la validation
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected','validated'],
        default: 'pending'
    },
    ratingsAvg: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    validatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    validatedAt: {
        type: Date,
        default: null
    },
    rejectionReason: {
        type: String,
        default: null,
        trim: true
    }
}, {
    timestamps: true // Ajoute automatiquement createdAt et updatedAt
});

// Index pour optimiser les recherches
RecipeSchema.index({ category: 1, status: 1, createdAt: -1 });
RecipeSchema.index({ createdBy: 1 });
RecipeSchema.index({ status: 1 });

// Méthode pour valider une recette
RecipeSchema.methods.approve = function(userId) {
    this.status = 'approved';
    this.validatedBy = userId;
    this.validatedAt = new Date();
    this.rejectionReason = null;
    return this.save();
};

// Méthode pour rejeter une recette
RecipeSchema.methods.reject = function(userId, reason) {
    this.status = 'rejected';
    this.validatedBy = userId;
    this.validatedAt = new Date();
    this.rejectionReason = reason;
    return this.save();
};

// Méthode pour réinitialiser le statut
RecipeSchema.methods.resetStatus = function() {
    this.status = 'pending';
    this.validatedBy = null;
    this.validatedAt = null;
    this.rejectionReason = null;
    return this.save();
};

// Middleware pour formater les ingrédients avant sauvegarde
RecipeSchema.pre('save', function(next) {
    // S'assurer que les ingrédients sont un tableau
    if (typeof this.ingredients === 'string') {
        try {
            this.ingredients = JSON.parse(this.ingredients);
        } catch (error) {
            this.ingredients = this.ingredients.split(',').map(item => item.trim());
        }
    }
    
    // Nettoyer les chaînes de caractères
    if (this.title) this.title = this.title.trim();
    if (this.instructions) this.instructions = this.instructions.trim();
    if (this.rejectionReason) this.rejectionReason = this.rejectionReason.trim();
    
    next();
});

// Méthode statique pour récupérer les recettes approuvées par catégorie
RecipeSchema.statics.findApprovedByCategory = function(category) {
    return this.find({ 
        status: 'approved',
        ...(category && { category }) 
    }).populate('createdBy', 'username email').sort({ createdAt: -1 });
};

// Méthode statique pour récupérer les recettes d'un utilisateur
RecipeSchema.statics.findByUser = function(userId, status) {
    const query = { createdBy: userId };
    if (status) query.status = status;
    return this.find(query).populate('createdBy', 'username email').sort({ createdAt: -1 });
};

// Méthode statique pour récupérer les recettes en attente
RecipeSchema.statics.findPending = function() {
    return this.find({ status: 'pending' })
        .populate('createdBy', 'username email')
        .sort({ createdAt: 1 });
};

const Recipe = mongoose.model('Recipe', RecipeSchema);

module.exports = Recipe;
