// middlewares/auth.js

const jwt = require("jsonwebtoken");
require("dotenv").config(); // S'assurer que le .env est chargé ici aussi

const JWT_SECRET = process.env.JWT_SECRET || 'CLE_SECRETE_TRES_FORTE_ET_UNIQUE'; 

/**
 * @description Middleware principal pour vérifier et décoder le JWT.
 * Assure que l'utilisateur est authentifié et attache son ID et son RÔLE à req.user.
 */
exports.protect = (req, res, next) => {
    // Utilisation de la syntaxe que vous avez fournie (req.headers.authorization?.split(" ")[1])
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        // 401 Unauthorized : L'utilisateur n'a pas fourni de token
        return res.status(401).json({ error: "Accès refusé. Aucun token fourni (Bearer manquant)." });
    }

    try {
        // 1. Vérification et décodage du token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Le payload décodé doit contenir { id: user_id, role: role }
        
        // 2. Attacher les données décodées à la requête
        // req.user est désormais disponible pour les contrôleurs suivants
        req.user = {
            id: decoded.id, // Correspond à user_id dans notre DB
            role: decoded.role // Contient 'member' ou 'admin'
        };

        // 3. Passer au middleware/contrôleur suivant
        next();
    } catch (error) {
        // 403 Forbidden : Le token est invalide, expiré ou corrompu
        console.error('Erreur de vérification du token:', error.message);
        // Utilisation de 403 Forbidden car le token a été fourni mais n'est pas bon.
        res.status(403).json({ error: "Token invalide ou expiré." }); 
    }
};


/**
 * @description Fonction usine de middlewares pour vérifier le rôle de l'utilisateur.
 * Doit toujours être utilisé APRÈS le middleware 'protect'.
 * @param {string} requiredRole - Le rôle requis ('admin' ou 'member').
 */
exports.checkRole = (requiredRole) => (req, res, next) => {
    // Vérifie si 'protect' a attaché les informations utilisateur
    if (!req.user || !req.user.role) {
        return res.status(500).json({ error: 'Erreur d\'autorisation : Informations utilisateur manquantes.' });
    }

    // 1. Vérifier si le rôle de l'utilisateur correspond au rôle requis
    if (req.user.role !== requiredRole) {
        // 403 Forbidden : L'utilisateur n'a pas les permissions nécessaires
        return res.status(403).json({ error: `Accès refusé. Rôle requis: ${requiredRole}.` });
    }

    // 2. Si le rôle correspond, passer au contrôleur final
    next();
};