// routes/loanRoutes.js

const express = require('express');
const router = express.Router();

const loanController = require('../controllers/loanController');
const { protect } = require('../middlewares/auth'); // Seul 'protect' est nécessaire ici

// ----------------------------------------------------------------------
// Routes d'Emprunt (Toutes les routes nécessitent une authentification)
// ----------------------------------------------------------------------

/**
 * @route POST /api/loans
 * @description Créer un nouvel emprunt (Emprunter un livre).
 * @access Private (Member/Admin)
 */
router.post(
    '/', 
    protect, // JWT requis
    loanController.createLoan
);


/**
 * @route GET /api/loans/
 * @description Récupérer les emprunts (Filtre basé sur le rôle géré dans le contrôleur).
 * @access Private (Member/Admin)
 */
router.get(
    '/', 
    protect, // JWT requis
    loanController.getLoans 
);


/**
 * @route PUT /api/loans/:id/return
 * @description Marquer un livre comme retourné.
 * @access Private (Admin ou l'utilisateur concerné).
 * Note: Le contrôleur vérifie l'autorisation.
 */
router.put(
    '/:id/return', 
    protect, // JWT requis
    loanController.returnBook 
);


module.exports = router;