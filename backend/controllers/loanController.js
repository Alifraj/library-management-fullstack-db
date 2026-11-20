// controllers/loanController.js

const supabase = require('../config/supabase'); 

// Définir la durée de prêt par défaut 
const LOAN_DURATION_DAYS = 14; 

/**
 * Calcule la date de retour prévue.
 * Utilise l'objet Date natif de JavaScript.
 */
const calculateDueDate = (loanDate) => {
    const date = new Date(loanDate);
    date.setDate(date.getDate() + LOAN_DURATION_DAYS);
    return date.toISOString();
};


// ------------------------------------------------------------------
// 1. Créer un Emprunt (POST /api/loans)
// ------------------------------------------------------------------
exports.createLoan = async (req, res) => {
    const { book_id } = req.body;
    // L'ID de l'utilisateur est extrait du JWT par le middleware 'protect'
    const user_id = req.user.id; 

    if (!book_id) {
        return res.status(400).json({ error: 'L\'ID du livre est requis.' });
    }

    try {
        // 1. Récupérer le livre et vérifier le stock
        const { data: book, error: bookFetchError } = await supabase
            .from('books')
            .select('stock_quantity')
            .eq('book_id', book_id)
            .single();

        if (bookFetchError || !book) {
            return res.status(404).json({ error: 'Livre non trouvé.' });
        }
        if (book.stock_quantity <= 0) {
            return res.status(409).json({ error: 'Ce livre n\'est plus disponible en stock.' });
        }

        // 2. Préparer les données de l'emprunt
        const loan_date = new Date().toISOString();
        const due_date = calculateDueDate(loan_date);

        // 3. Créer l'entrée dans la table 'loans'
        const { data: newLoan, error: loanError } = await supabase
            .from('loans')
            .insert([{ book_id, user_id, loan_date, due_date }])
            .select()
            .single();

        if (loanError) {
             // Affichage détaillé de l'erreur PostgreSQL dans la console
             console.error("ERREUR CRITIQUE DE SUPABASE (CREATE LOAN):", loanError); 
             
             if (loanError.code === '23505') { 
                return res.status(409).json({ error: 'Vous avez déjà un emprunt actif pour ce livre.' });
            }
            throw loanError;
        }

        // 4. Décrémenter la quantité en stock dans la table 'books'
        const newStock = book.stock_quantity - 1;
        const { error: stockUpdateError } = await supabase
            .from('books')
            .update({ stock_quantity: newStock })
            .eq('book_id', book_id);

        if (stockUpdateError) {
            console.error("ALERTE: Erreur de mise à jour du stock après emprunt! Emprunt actif dans la DB.");
            return res.status(500).json({ error: 'Emprunt réussi, mais erreur de mise à jour du stock.' });
        }

        res.status(201).json({ message: 'Livre emprunté avec succès.', loan: newLoan });

    } catch (error) {
        console.error("Erreur serveur lors de la création de l'emprunt:", error.message);
        res.status(500).json({ error: 'Erreur interne du serveur lors de l\'emprunt.' });
    }
};


// ------------------------------------------------------------------
// 2. Afficher les Emprunts (GET /api/loans)
// ------------------------------------------------------------------
exports.getLoans = async (req, res) => {
    const user_id = req.user.id;
    const user_role = req.user.role;
    
    let query = supabase.from('loans')
        .select(`
            loan_id, loan_date, due_date, return_date,
            books (title, isbn, cover_url),
            users (email) 
        `)
        .order('loan_date', { ascending: false });

    // Filtrer par utilisateur si le rôle est 'member'
    if (user_role === 'member') {
        query = query.eq('user_id', user_id);
    }
    // Si 'admin', aucune restriction n'est appliquée

    try {
        const { data: loans, error } = await query;

        if (error) {
            console.error("Erreur Supabase (Récupération Emprunt):", error);
            throw error;
        }

        res.status(200).json(loans);

    } catch (error) {
        console.error("Erreur serveur lors de la récupération des emprunts:", error.message);
        res.status(500).json({ error: 'Erreur lors de la récupération des emprunts.' });
    }
};


// ------------------------------------------------------------------
// 3. Retourner un Livre (PUT /api/loans/:id/return)
// ------------------------------------------------------------------
exports.returnBook = async (req, res) => {
    const { id } = req.params; // loan_id
    const user_role = req.user.role;
    const user_id = req.user.id;

    try {
        // 1. Récupérer l'emprunt pour vérifier l'état et l'autorisation
        const { data: loan, error: loanFetchError } = await supabase
            .from('loans')
            .select('book_id, user_id, return_date')
            .eq('loan_id', id)
            .single();

        if (loanFetchError || !loan) {
            return res.status(404).json({ error: 'Emprunt non trouvé.' });
        }
        if (loan.return_date) {
            return res.status(400).json({ error: 'Ce livre a déjà été retourné.' });
        }

        // 2. Vérification d'autorisation (Admin OU utilisateur propriétaire)
        if (user_role !== 'admin' && loan.user_id !== user_id) {
            return res.status(403).json({ error: 'Accès refusé. Vous ne pouvez retourner que vos propres emprunts.' });
        }

        // 3. Mettre à jour la table 'loans' (marquer comme retourné)
        const return_date = new Date().toISOString();
        const { error: loanUpdateError } = await supabase
            .from('loans')
            .update({ return_date })
            .eq('loan_id', id);

        if (loanUpdateError) {
            console.error("Erreur Supabase (Update Emprunt):", loanUpdateError);
            throw loanUpdateError;
        }

        // 4. Incrémenter la quantité en stock dans la table 'books'
        const { data: book } = await supabase
            .from('books')
            .select('stock_quantity')
            .eq('book_id', loan.book_id)
            .single();
        
        const newStock = (book ? book.stock_quantity : 0) + 1; // Gestion de cas où le livre n'est pas trouvé
        await supabase.from('books').update({ stock_quantity: newStock }).eq('book_id', loan.book_id);
        
        // 5. Succès
        res.status(200).json({ message: 'Livre retourné avec succès. Stock mis à jour.' });

    } catch (error) {
        console.error("Erreur serveur lors du retour du livre:", error.message);
        res.status(500).json({ error: 'Erreur interne du serveur lors du retour.' });
    }
};


// ------------------------------------------------------------------
// EXPORTATION FINALE DES FONCTIONS
// ------------------------------------------------------------------
module.exports = {
    createLoan: exports.createLoan,
    getLoans: exports.getLoans,
    returnBook: exports.returnBook,
};