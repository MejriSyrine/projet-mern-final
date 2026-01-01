const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/UserSchema');
const verifyToken = require('../middleware/auth');
const allowedMatricules = require('../config/nutritionistMatricules');

// =======================
// 🔐 AUTHENTICATION
// =======================

// Route de test
router.get('/test', (req, res) => {
    res.status(200).json({ message: 'Auth routes are working' });
});

// Inscription
router.post('/register', async (req, res) => {
    try {
        console.debug('[Register] body:', req.body);
        const { email, password, role, nutritionistId, username } = req.body;

        // Validation des données
        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Email and password are required' 
            });
        }

        // Validation du rôle
        if (role && !['user', 'nutritionist', 'admin'].includes(role)) {
            return res.status(400).json({ 
                success: false,
                message: 'Invalid role. Must be user, nutritionist, or admin' 
            });
        }

        // Vérification si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                message: 'User with this email already exists' 
            });
        }

        // Validation spécifique pour nutritionniste
        if (role === 'nutritionist') {
            if (!nutritionistId) {
                return res.status(400).json({
                    success: false,
                    message: 'Nutritionist ID is required for nutritionist role'
                });
            }

            // Vérifier si le matricule est autorisé
            if (!allowedMatricules.includes(nutritionistId)) {
                return res.status(403).json({
                    success: false,
                    message: 'Invalid nutritionist matricule'
                });
            }

            // Vérifier si le matricule est déjà utilisé
            const existingNutritionist = await User.findOne({ 
                role: 'nutritionist', 
                nutritionistId: nutritionistId 
            });
            if (existingNutritionist) {
                return res.status(400).json({
                    success: false,
                    message: 'This nutritionist ID is already registered'
                });
            }
        }

        // Création de l'utilisateur
        const newUser = new User({
            email: email.toLowerCase().trim(),
            password,
            username: username || email.split('@')[0],
            role: role || 'user',
            nutritionistId: role === 'nutritionist' ? nutritionistId : null
        });

        await newUser.save();

        // Génération du token JWT
        const token = jwt.sign(
            { 
                id: newUser._id, 
                email: newUser.email, 
                role: newUser.role,
                username: newUser.username
            },
            process.env.SECRET_KEY,
            { expiresIn: '7d' }
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                _id: newUser._id,
                email: newUser.email,
                username: newUser.username,
                role: newUser.role,
                nutritionistId: newUser.nutritionistId,
                favorites: newUser.favorites,
                createdAt: newUser.createdAt
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        // In development, return the original error message to help debugging
        res.status(500).json({ 
            success: false,
            message: 'Server error during registration',
            error: error.message
        });
    }
});

// Connexion
router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation des données
        if (!email || !password) {
            return res.status(400).json({ 
                success: false,
                message: 'Email and password are required' 
            });
        }

        // Recherche de l'utilisateur
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid email or password' 
            });
        }

        // Vérifier si le compte est actif
        if (!user.isActive) {
            return res.status(403).json({ 
                success: false,
                message: 'Account is deactivated. Please contact support.' 
            });
        }

        // Vérification du mot de passe
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                success: false,
                message: 'Invalid email or password' 
            });
        }

        // Mettre à jour le dernier login
        user.lastLogin = new Date();
        await user.save();

        // Génération du token JWT
        const token = jwt.sign(
            { 
                id: user._id, 
                email: user.email, 
                role: user.role,
                username: user.username,
                nutritionistId: user.nutritionistId
            },
            process.env.SECRET_KEY,
            { expiresIn: '7d' }
        );

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
                nutritionistId: user.nutritionistId,
                profileImage: user.profileImage,
                favorites: user.favorites,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Vérifier le token (keep-alive)
router.get('/verify', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate('favorites', 'title coverImage category status');
        
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Token is valid',
            user: {
                _id: user._id,
                email: user.email,
                username: user.username,
                role: user.role,
                nutritionistId: user.nutritionistId,
                profileImage: user.profileImage,
                favorites: user.favorites,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            }
        });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during token verification'
        });
    }
});

// =======================
// 👤 USER PROFILE
// =======================

// Obtenir le profil de l'utilisateur
router.get('/profile', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .select('-password')
            .populate({
                path: 'favorites',
                select: 'title coverImage category status createdAt',
                match: { status: 'validated' }
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: user.toPublicProfile()
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Mettre à jour le profil
router.put('/profile', verifyToken, async (req, res) => {
    try {
        const { username, profileImage } = req.body;
        
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        if (username) user.username = username.trim();
        if (profileImage !== undefined) user.profileImage = profileImage;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            user: user.toPublicProfile()
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Changer le mot de passe
router.put('/change-password', verifyToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password and new password are required'
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'New password must be at least 6 characters long'
            });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Vérifier l'ancien mot de passe
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Mettre à jour le mot de passe
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// =======================
// ⭐ FAVORITES
// =======================

// Ajouter/retirer des favoris
router.put('/favorite/:recipeId', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const recipeId = req.params.recipeId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'User not found' 
            });
        }

        // Vérifier que la recette existe et est approuvée
        const Recipe = require('../models/RecipeSchema');
        const recipe = await Recipe.findById(recipeId);
        
        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recipe not found'
            });
        }

        // Utiliser les méthodes du modèle
        const isFavorite = user.isFavorite(recipeId);
        
        if (isFavorite) {
            await user.removeFromFavorites(recipeId);
            res.status(200).json({
                success: true,
                message: 'Recipe removed from favorites',
                isFavorite: false,
                favorites: user.favorites
            });
        } else {
            await user.addToFavorites(recipeId);
            res.status(200).json({
                success: true,
                message: 'Recipe added to favorites',
                isFavorite: true,
                favorites: user.favorites
            });
        }
    } catch (error) {
        console.error('Favorite toggle error:', error);
        res.status(500).json({ 
            success: false,
            message: 'Server error',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Obtenir les favoris
router.get('/favorites', verifyToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate({
                path: 'favorites',
                select: 'title ingredients instructions coverImage category status createdAt'
            });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Filter out null values and optionally filter by status
        const validFavorites = (user.favorites || []).filter(fav => fav !== null);

        res.status(200).json({
            success: true,
            favorites: validFavorites,
            count: validFavorites.length
        });
    } catch (error) {
        console.error('Get favorites error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// =======================
// 👥 ADMIN/NUTRITIONIST
// =======================

// Obtenir tous les utilisateurs (admin/nutritionniste)
router.get('/users', verifyToken, async (req, res) => {
    try {
        // Vérifier les permissions
        if (req.user.role !== 'admin' && req.user.role !== 'nutritionist') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin or nutritionist role required.'
            });
        }

        const users = await User.find()
            .select('-password')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            users,
            count: users.length
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Obtenir un utilisateur par ID
router.get('/:id', verifyToken, async (req, res) => {
    try {
        // Vérifier les permissions (soi-même, admin ou nutritionniste)
        if (req.params.id !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'nutritionist') {
            return res.status(403).json({
                success: false,
                message: 'Access denied'
            });
        }

        const user = await User.findById(req.params.id)
            .select('-password')
            .populate('favorites', 'title coverImage category');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: user.toPublicProfile()
        });
    } catch (error) {
        console.error('Get user by ID error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// =======================
// 🔍 NUTRITIONIST SPECIFIC
// =======================

// Obtenir tous les nutritionnistes actifs
router.get('/nutritionists/all', verifyToken, async (req, res) => {
    try {
        // Vérifier les permissions (admin seulement)
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Admin role required.'
            });
        }

        const nutritionists = await User.find({ role: 'nutritionist', isActive: true })
            .select('email username nutritionistId createdAt lastLogin')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            nutritionists,
            count: nutritionists.length
        });
    } catch (error) {
        console.error('Get nutritionists error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// Vérifier si un matricule est disponible
router.get('/check-matricule/:matricule', async (req, res) => {
    try {
        const { matricule } = req.params;
        
        if (!matricule) {
            return res.status(400).json({
                success: false,
                message: 'Matricule is required'
            });
        }

        // Vérifier si le matricule est dans la liste autorisée
        const isValid = allowedMatricules.includes(matricule);
        
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid nutritionist matricule'
            });
        }

        // Vérifier si le matricule est déjà utilisé
        const existingUser = await User.findOne({ 
            role: 'nutritionist', 
            nutritionistId: matricule 
        });

        res.status(200).json({
            success: true,
            isValid: true,
            isAvailable: !existingUser,
            message: existingUser 
                ? 'This matricule is already registered' 
                : 'Matricule is available'
        });
    } catch (error) {
        console.error('Check matricule error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;