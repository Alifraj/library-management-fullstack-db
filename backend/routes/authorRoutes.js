// backend/routes/authorRoutes.js

const express = require('express');
const router = express.Router();
const authorController = require('../controllers/authorController');
const { protect, checkRole } = require('../middlewares/auth');
const upload = require('../middlewares/upload'); // 👈 IMPORT DU MIDDLEWARE

console.log("✅ Chargement des routes Auteurs...");

// Lecture
router.get('/', authorController.getAllAuthors);

// Création (Admin)
// 👇 ON AJOUTE 'upload.single("image")'
// Cela signifie : "Attends-toi à recevoir un fichier dans le champ appelé 'image'"
router.post(
    '/', 
    protect, 
    checkRole('admin'), 
    upload.single('image'), 
    authorController.createAuthor
);

// Modification (Admin)
router.put(
    '/:id', 
    protect, 
    checkRole('admin'), 
    upload.single('image'), 
    authorController.updateAuthor
);

// Suppression (Admin)
router.delete('/:id', protect, checkRole('admin'), authorController.deleteAuthor);

module.exports = router;