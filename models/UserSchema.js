const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(v) {
                return validator.isEmail(v);
            },
            message: 'Please provide a valid email address'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    username: {
        type: String,
        trim: true,
        default: function() {
            return this.email.split('@')[0];
        }
    },
    role: {
        type: String,
        enum: ['user', 'nutritionist', 'admin'],
        default: 'user'
    },
    nutritionistId: {
        type: String,
        unique: true,
        sparse: true,
        validate: {
            validator: function(v) {
                if (this.role === 'nutritionist' && !v) {
                    return false;
                }
                return true;
            },
            message: 'Nutritionist ID is required for nutritionist role'
        }
    },
    favorites: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Recipe' 
    }],
    profileImage: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index pour optimiser les recherches
UserSchema.index({ email: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ nutritionistId: 1 });

// Middleware pour hacher le mot de passe avant sauvegarde
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Middleware pour mettre à jour updatedAt
UserSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Méthode pour vérifier le mot de passe
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour ajouter une recette aux favoris
UserSchema.methods.addToFavorites = function(recipeId) {
    if (!this.favorites.includes(recipeId)) {
        this.favorites.push(recipeId);
    }
    return this.save();
};

// Méthode pour retirer une recette des favoris
UserSchema.methods.removeFromFavorites = function(recipeId) {
    this.favorites = this.favorites.filter(id => id.toString() !== recipeId.toString());
    return this.save();
};

// Méthode pour vérifier si une recette est en favoris
UserSchema.methods.isFavorite = function(recipeId) {
    return this.favorites.some(id => id.toString() === recipeId.toString());
};

// Méthode pour mettre à jour le rôle
UserSchema.methods.updateRole = function(newRole, nutritionistId = null) {
    this.role = newRole;
    if (newRole === 'nutritionist' && nutritionistId) {
        this.nutritionistId = nutritionistId;
    } else if (newRole !== 'nutritionist') {
        this.nutritionistId = null;
    }
    return this.save();
};

// Méthode pour désactiver le compte
UserSchema.methods.deactivate = function() {
    this.isActive = false;
    return this.save();
};

// Méthode pour réactiver le compte
UserSchema.methods.activate = function() {
    this.isActive = true;
    return this.save();
};

// Méthode pour mettre à jour le dernier login
UserSchema.methods.updateLastLogin = function() {
    this.lastLogin = new Date();
    return this.save();
};

// Méthode pour vérifier si l'utilisateur est nutritionniste
UserSchema.methods.isNutritionist = function() {
    return this.role === 'nutritionist';
};

// Méthode pour vérifier si l'utilisateur est admin
UserSchema.methods.isAdmin = function() {
    return this.role === 'admin';
};

// Méthode pour vérifier si l'utilisateur peut valider des recettes
UserSchema.methods.canValidateRecipes = function() {
    return this.role === 'nutritionist' || this.role === 'admin';
};

// Méthode statique pour trouver un utilisateur par email
UserSchema.statics.findByEmail = function(email) {
    return this.findOne({ email: email.toLowerCase().trim() });
};

// Méthode statique pour trouver un nutritionniste par matricule
UserSchema.statics.findNutritionistById = function(nutritionistId) {
    return this.findOne({ 
        role: 'nutritionist', 
        nutritionistId: nutritionistId 
    });
};

// Méthode statique pour trouver tous les nutritionnistes actifs
UserSchema.statics.findActiveNutritionists = function() {
    return this.find({ 
        role: 'nutritionist', 
        isActive: true 
    }).select('email username nutritionistId createdAt');
};

// Méthode pour obtenir un profil public (sans données sensibles)
UserSchema.methods.toPublicProfile = function() {
    return {
        _id: this._id,
        email: this.email,
        username: this.username,
        role: this.role,
        nutritionistId: this.nutritionistId,
        profileImage: this.profileImage,
        favorites: this.favorites,
        favoritesCount: this.favorites.length,
        createdAt: this.createdAt,
        lastLogin: this.lastLogin,
        isActive: this.isActive
    };
};

// Méthode pour obtenir un profil complet (admin/nutritionist)
UserSchema.methods.toFullProfile = function() {
    return {
        _id: this._id,
        email: this.email,
        username: this.username,
        role: this.role,
        nutritionistId: this.nutritionistId,
        profileImage: this.profileImage,
        favorites: this.favorites,
        isActive: this.isActive,
        lastLogin: this.lastLogin,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
    };
};

const User = mongoose.model('User', UserSchema);

module.exports = User;