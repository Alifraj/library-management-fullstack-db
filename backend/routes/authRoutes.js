// routes/authRoutes.js

const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');

// ----------------------------------------------------------------------
// Routes d'Authentification (Accès Public)
// ----------------------------------------------------------------------

/**
 * @route POST /api/auth/signUp
 * @description Inscription d'un nouvel utilisateur (Crée le compte et le profil).
 */
router.post('/signUp', authController.signUp);

/**
 * @route POST /api/auth/signIn
 * @description Connexion de l'utilisateur et génération du JWT.
 */
router.post('/signIn', authController.signIn);

/**
 * @route POST /api/auth/signOut
 * @description Déconnexion symbolique (indique au client de supprimer le token).
 */
router.post('/signOut', authController.signOut);


module.exports = router;