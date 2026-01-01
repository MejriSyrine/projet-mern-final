const jwt = require('jsonwebtoken');
const User = require('../models/UserSchema');

module.exports = async (req, res, next) => {
    try {
        console.log('🔐 Vérification authentification nutritionniste...');
        
        // 1. Récupérer le token depuis les headers
        const authHeader = req.header('Authorization');
        console.log('Authorization header:', authHeader);
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Token manquant. Connectez-vous.'
            });
        }
        
        const token = authHeader.replace('Bearer ', '');
        console.log('Token extrait:', token.substring(0, 20) + '...');
        
        // 2. Vérifier et décoder le token
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        console.log('Token décodé:', decoded);
        
        // 3. Chercher l'utilisateur dans la base
        const user = await User.findById(decoded.id);
        console.log('Utilisateur trouvé:', user ? user.email : 'non trouvé');
        
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }
        
        // 4. Vérifier le rôle
        console.log('Rôle de l\'utilisateur:', user.role);
        
        if (user.role !== 'nutritionist') {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé. Rôle nutritionniste requis.'
            });
        }
        
        // 5. Ajouter l'utilisateur à la requête
        req.user = {
            id: user._id,
            email: user.email,
            role: user.role,
            matricule: user.matricule
        };
        
        console.log('✅ Authentification réussie pour:', req.user.email);
        next();
        
    } catch (error) {
        console.error('❌ Erreur authentification:', error.message);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token invalide'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expiré'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Erreur d\'authentification',
            error: error.message
        });
    }
};