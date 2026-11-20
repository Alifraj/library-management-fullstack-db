// backend/routes/userRoutes.js

const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { protect, checkRole } = require('../middlewares/auth');
const upload = require('../middlewares/upload'); // 👈 Import du middleware

// ----------------------------------------------------------------------
// Routes d'Administration (Admin seulement)
// ----------------------------------------------------------------------

router.get('/', protect, checkRole('admin'), userController.getAllUsers);
router.put('/:id/role', protect, checkRole('admin'), userController.updateUserRole);

// ----------------------------------------------------------------------
// Routes Utilisateur (Profil)
// ----------------------------------------------------------------------

router.get('/me', protect, userController.getProfile);

// 👇 AJOUT DU MIDDLEWARE UPLOAD ICI
// Le champ du formulaire frontend devra s'appeler 'image' (ou 'avatar' si tu changes ici)
router.put(
    '/me', 
    protect, 
    upload.single('image'), 
    userController.updateProfile
);
router.delete('/:id', protect, checkRole('admin'), userController.deleteUser);

module.exports = router;