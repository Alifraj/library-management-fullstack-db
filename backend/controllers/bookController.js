// controllers/bookController.js

const supabase = require('../config/supabase');

// --- Sélecteur de jointure pour l'auteur ---
const authorSelect = `
    author_id,
    first_name, 
    last_name
`;

// --- Sélecteur de toutes les colonnes du livre ---
const bookSelect = `
    book_id,
    title,
    isbn,
    publication_year,
    publisher,
    stock_quantity,
    cover_url,
    description,
    authors (
        ${authorSelect}
    )
`;

// ------------------------------------------------------------------
// 1. Créer un Livre (POST /api/books) - Admin
// ------------------------------------------------------------------
exports.createBook = async (req, res) => {
    const {
        title,
        isbn,
        publication_year,
        author_id,
        publisher,
        stock_quantity,
        description
    } = req.body;

    // Vérification des champs obligatoires
    if (!title || !isbn || !author_id || !publisher || stock_quantity === undefined) {
        return res.status(400).json({
            error: "Les champs title, isbn, author_id, publisher et stock_quantity sont obligatoires."
        });
    }

    try {
        let cover_url = null;
        
        // Traitement du fichier de couverture s'il existe
        if (req.file) {
            const file = req.file;
            
            // Générer un nom de fichier unique
            const fileName = `cover_${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
            
            // Upload vers Supabase Storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('book_covers')
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype,
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error("Erreur upload Supabase:", uploadError);
                return res.status(500).json({
                    error: "Échec de l'upload de la couverture.",
                    details: uploadError.message
                });
            }

            // Générer l'URL publique
            const { data: urlData } = supabase.storage
                .from('book_covers')
                .getPublicUrl(fileName);
            
            cover_url = urlData.publicUrl;
        }

        // Préparation des données du livre
        const newBook = {
            title,
            isbn: isbn.trim(),
            publication_year: publication_year || null,
            author_id,
            cover_url,
            publisher,
            stock_quantity: parseInt(stock_quantity),
            description: description || null
        };

        // Insertion dans la base de données
        const { data, error } = await supabase
            .from("books")
            .insert([newBook])
            .select(bookSelect)
            .single();

        if (error) {
            console.error("Erreur Supabase (createBook):", error);
            return res.status(400).json({
                message: "Échec de la création du livre.",
                supabase_error: error.message,
            });
        }

        return res.status(201).json({
            message: "Livre créé avec succès.",
            book: data
        });

    } catch (err) {
        console.error("Erreur serveur (createBook):", err);
        return res.status(500).json({ error: "Erreur interne du serveur." });
    }
};

// ------------------------------------------------------------------
// 2. Lire tous les livres / Rechercher (GET /api/books) - Public
// ------------------------------------------------------------------
exports.getAllBooks = async (req, res) => {
    const searchTerm = req.query.search?.trim();

    try {
        let query = supabase.from('books').select(bookSelect);

        if (searchTerm) {
            const pattern = `%${searchTerm}%`;
            const escapedTerm = searchTerm.replace(/'/g, "''");

            // Recherche dans le titre du livre
            query = query.ilike('title', `%${escapedTerm}%`);

            // Recherche dans le prénom OU nom de l'auteur
            query = query.or(
                `first_name.ilike.${pattern},last_name.ilike.${pattern}`,
                { foreignTable: 'authors' }
            );
        }

        // Optionnel : tri par titre
        query = query.order('title', { ascending: true });

        const { data: books, error } = await query;

        if (error) {
            console.error("Erreur Supabase:", error.message);
            return res.status(500).json({ 
                error: "Erreur lors de la récupération des livres.",
                details: error.message 
            });
        }

        return res.status(200).json({
            message: "Liste des livres récupérée avec succès.",
            count: books.length,
            books
        });

    } catch (err) {
        console.error("Erreur serveur (getAllBooks):", err);
        return res.status(500).json({ error: "Erreur interne du serveur." });
    }
};

// ------------------------------------------------------------------
// 3. Lire un livre par ID
// ------------------------------------------------------------------
exports.getBookById = async (req, res) => {
    const { id } = req.params;

    try {
        const { data: book, error } = await supabase
            .from("books")
            .select(`
                *,
                authors(${authorSelect})
            `)
            .eq("book_id", id)
            .single();

        if (error || !book) {
            return res.status(404).json({ error: "Livre non trouvé." });
        }

        res.status(200).json(book);

    } catch (err) {
        console.error("Erreur serveur (getBookById):", err);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};

// ------------------------------------------------------------------
// 4. Modifier un livre (avec possibilité de changer la couverture)
// ------------------------------------------------------------------
exports.updateBook = async (req, res) => {
    const { id } = req.params;
    const {
        title,
        isbn,
        publication_year,
        author_id,
        publisher,
        stock_quantity,
        description
    } = req.body;

    try {
        // Récupérer le livre existant pour vérifier l'ancienne couverture
        const { data: existingBook, error: fetchError } = await supabase
            .from("books")
            .select("cover_url")
            .eq("book_id", id)
            .single();

        if (fetchError) {
            return res.status(404).json({ error: "Livre non trouvé." });
        }

        let cover_url = existingBook.cover_url;
        
        // Si un nouveau fichier est uploadé
        if (req.file) {
            // Supprimer l'ancienne couverture si elle existe
            if (existingBook.cover_url) {
                try {
                    // Extraire le nom du fichier de l'URL
                    const oldFileName = existingBook.cover_url.split('/').pop();
                    await supabase.storage
                        .from('book_covers')
                        .remove([oldFileName]);
                } catch (deleteError) {
                    console.warn("Impossible de supprimer l'ancienne couverture:", deleteError);
                }
            }

            // Uploader la nouvelle couverture
            const file = req.file;
            const fileName = `cover_${Date.now()}_${file.originalname.replace(/\s+/g, '_')}`;
            
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('book_covers')
                .upload(fileName, file.buffer, {
                    contentType: file.mimetype,
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                console.error("Erreur upload Supabase:", uploadError);
                return res.status(500).json({
                    error: "Échec de l'upload de la nouvelle couverture.",
                    details: uploadError.message
                });
            }

            // Générer la nouvelle URL publique
            const { data: urlData } = supabase.storage
                .from('book_covers')
                .getPublicUrl(fileName);
            
            cover_url = urlData.publicUrl;
        }

        // Préparer les mises à jour
        const updates = {
            title: title || existingBook.title,
            isbn: isbn ? isbn.trim() : existingBook.isbn,
            publication_year: publication_year || existingBook.publication_year,
            author_id: author_id || existingBook.author_id,
            publisher: publisher || existingBook.publisher,
            stock_quantity: stock_quantity !== undefined ? parseInt(stock_quantity) : existingBook.stock_quantity,
            description: description !== undefined ? description : existingBook.description,
            cover_url
        };

        // Mettre à jour le livre dans la base de données
        const { data, error } = await supabase
            .from("books")
            .update(updates)
            .eq("book_id", id)
            .select(bookSelect)
            .single();

        if (error) {
            console.error("Erreur Supabase (updateBook):", error);
            return res.status(400).json({ error: "Échec de la mise à jour du livre." });
        }

        res.status(200).json({
            message: "Livre mis à jour avec succès.",
            book: data
        });

    } catch (err) {
        console.error("Erreur serveur (updateBook):", err);
        res.status(500).json({ error: "Erreur interne du serveur." });
    }
};

// ------------------------------------------------------------------
// 5. Supprimer un livre (supprime aussi la couverture associée)
// ------------------------------------------------------------------
exports.deleteBook = async (req, res) => {
    const { id } = req.params;

    try {
        // Récupérer le livre pour obtenir l'URL de la couverture
        const { data: book, error: fetchError } = await supabase
            .from("books")
            .select("cover_url")
            .eq("book_id", id)
            .single();

        if (fetchError) {
            return res.status(404).json({ error: "Livre non trouvé." });
        }

        // Supprimer la couverture si elle existe
        if (book.cover_url) {
            try {
                const fileName = book.cover_url.split('/').pop();
                await supabase.storage
                    .from('book_covers')
                    .remove([fileName]);
            } catch (deleteError) {
                console.warn("Impossible de supprimer la couverture:", deleteError);
            }
        }

        // Supprimer le livre de la base de données
        const { error } = await supabase
            .from("books")
            .delete()
            .eq("book_id", id);

        if (error) {
            console.error("Erreur Supabase (deleteBook):", error);
            if (error.code === '23503') { 
                return res.status(400).json({ error: "Impossible de supprimer ce livre car il est emprunté." });
            }
            return res.status(400).json({ error: "Impossible de supprimer ce livre." });
        }

        res.status(200).json({ message: "Livre supprimé avec succès." });

    } catch (err) {
        console.error("Erreur serveur (deleteBook):", err);
        return res.status(500).json({ error: "Erreur interne du serveur." });
    }
};

// ------------------------------------------------------------------
// EXPORTATION FINALE DES FONCTIONS
// ------------------------------------------------------------------
module.exports = {
    createBook: exports.createBook,
    getAllBooks: exports.getAllBooks,
    getBookById: exports.getBookById,
    updateBook: exports.updateBook,
    deleteBook: exports.deleteBook,
};