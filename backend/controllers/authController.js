// controllers/authController.js

const supabase = require("../config/supabase");
const bcrypt = require("bcrypt"); // Utilisation de 'bcrypt' standard
const jwt = require("jsonwebtoken");
require("dotenv").config(); // S'assurer que les variables d'environnement sont chargées

// --- Configuration ---
const saltRounds = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'CLE_SECRETE_TRES_FORTE_ET_UNIQUE'; 
// ---------------------

/**
 * @route POST /api/auth/signUp
 * @description Inscription d'un nouvel utilisateur (création dans 'users' et 'profiles').
 * @access Public
 */
const signUp = async (req, res) => {
    // Attributs requis pour l'inscription dans le modèle de la bibliothèque
    const { email, password, username } = req.body; 

    // 1. Validation de base
    if (!email || !password || !username) {
        return res.status(400).json({ error: 'Veuillez fournir un email, un mot de passe et un nom d\'utilisateur.' });
    }

    try {
        // 2. Hachage du mot de passe
        // Note: Utilisation de saltRounds=10 au lieu de 10 directement si vous utilisez 'bcrypt'
        const passwordHash = await bcrypt.hash(password, saltRounds);
        
        // 3. Insertion dans la table 'users'
        // Le rôle est par défaut 'member'
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert([{ email, password_hash: passwordHash, role: 'member' }])
            .select('user_id') 
            .single();

        if (userError) {
            // Gérer l'erreur d'email déjà utilisé
            if (userError.code === '23505') { 
                return res.status(409).json({ error: 'Cet email est déjà utilisé.' });
            }
            throw userError;
        }

        const newUserId = userData.user_id;

        // 4. Insertion dans la table 'profiles'
        const { error: profileError } = await supabase
            .from('profiles')
            .insert([{ user_id: newUserId, username }]);
            
        if (profileError) {
             // Rollback: Supprimer l'entrée dans 'users' si le profil échoue (cohérence DB)
             await supabase.from('users').delete().eq('user_id', newUserId);
             return res.status(409).json({ error: 'Le nom d\'utilisateur est déjà pris.' });
        }

        // 5. Succès
        res.status(201).json({ 
            message: 'Inscription réussie. Vous pouvez vous connecter.',
            user_id: newUserId,
            username: username
        });

    } catch (error) {
        console.error('Erreur lors de l\'inscription:', error.message);
        res.status(500).json({ error: 'Erreur serveur lors de l\'inscription.' });
    }
};

/**
 * @route POST /api/auth/signIn
 * @description Connexion d'un utilisateur, vérification du mot de passe et génération du JWT (avec role).
 * @access Public
 */
const signIn = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Veuillez fournir un email et un mot de passe.' });
    }

    try {
        // 1. Récupération de l'utilisateur (ID, hash, et RÔLE)
        const { data: users, error: selectError } = await supabase
            .from("users")
            .select("user_id, password_hash, role") // Attributs de la table 'users' du projet de bibliothèque
            .eq("email", email);

        if (selectError || !users || users.length === 0) {
            return res.status(401).json({ error: "Email ou mot de passe invalide." });
        }
        
        const user = users[0];

        // 2. Comparaison du mot de passe crypté
        // Note: Utilisation de password_hash de notre modèle DB
        const isMatch = await bcrypt.compare(password, user.password_hash); 
        
        if (!isMatch) {
            return res.status(401).json({ error: "Email ou mot de passe invalide." });
        }

        // 3. Création du JWT Payload (Contenu du Token)
        const payload = {
            id: user.user_id, // L'ID de l'utilisateur
            role: user.role   // Le rôle (crucial pour le middleware d'autorisation)
        };

        // 4. Signature du Token
        const token = jwt.sign(
            payload,
            JWT_SECRET, // Utilisation de la clé secrète du fichier .env
            { expiresIn: "1h" }
        );

        // 5. Succès de la connexion
        res.status(200).json({ 
            message: "Login successful!", 
            token: token,
            user_id: user.user_id,
            role: user.role
        });
    } catch (error) {
        console.error("Server error during signin:", error);
        res.status(500).json({ error: "Server error." });
    }
};

/**
 * @route POST /api/auth/signOut
 * @description Déconnexion symbolique côté serveur.
 * @access Public
 */
const signOut = async (req, res) => {
    // Dans une architecture JWT, le serveur n'a pas besoin de faire grand-chose.
    // L'action principale est la suppression du token par le client.
    try {
        res.status(200).json({ message: "Déconnexion réussie. Veuillez supprimer le token côté client." });
    } catch (error) {
        console.error("Server error during signout:", error);
        res.status(500).json({ error: "Sign-out failed." });
    }
};


// Exportation des fonctions
module.exports = { signUp, signIn, signOut };