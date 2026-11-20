// backend/routes/bookRoutes.js

const express = require('express');
const router = express.Router();

const bookController = require('../controllers/bookController');
const { protect, checkRole } = require('../middlewares/auth');

// 👇 1. IMPORT DU MIDDLEWARE UPLOAD (Indispensable)
const upload = require('../middlewares/upload'); 

// ----------------------------------------------------------------------
// Routes Publiques (Lecture)
// ----------------------------------------------------------------------

// GET /api/books : Récupérer tous les livres
router.get('/', bookController.getAllBooks);

// GET /api/books/:id : Récupérer un livre par son ID
router.get('/:id', bookController.getBookById);


// ----------------------------------------------------------------------
// Routes Protégées (CRUD pour Administrateurs)
// ----------------------------------------------------------------------

// POST /api/books : Créer un nouveau livre
router.post(
    '/', 
    protect, 
    checkRole('admin'), 
    
    // Il intercepte le fichier nommé 'image' et le met dans req.file
    upload.single('image'), 
    bookController.createBook
);

// PUT /api/books/:id : Modifier un livre existant
router.put(
    '/:id', 
    protect, 
    checkRole('admin'), 
    
    upload.single('image'), 
    bookController.updateBook
);

// DELETE /api/books/:id : Supprimer un livre
router.delete(
    '/:id', 
    protect, 
    checkRole('admin'), 
    bookController.deleteBook
);

module.exports = router;