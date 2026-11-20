// backend/controllers/userController.js

const supabase = require('../config/supabase'); 

// Bucket pour les avatars
const BUCKET_NAME = 'avatars'; // Vérifie le nom dans ton Supabase

// --- Fonction Utilitaire : Upload ---
const uploadToSupabase = async (file) => {
    try {
        const fileExt = file.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1E9)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(BUCKET_NAME)
            .upload(filePath, file.buffer, {
                contentType: file.mimetype,
                upsert: false
            });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from(BUCKET_NAME)
            .getPublicUrl(filePath);

        return data.publicUrl;
    } catch (error) {
        console.error("Erreur Upload Avatar:", error);
        throw new Error("Impossible d'uploader l'avatar.");
    }
};

// ------------------------------------------------------------------
// Logique d'Administration (Admin)
// ------------------------------------------------------------------

// GET /api/users (Admin) - Code inchangé
exports.getAllUsers = async (req, res) => {
    try {
        const { data: users, error } = await supabase
            .from('users')
            .select(`
                user_id, email, role, created_at,
                profiles ( username, first_name, last_name, avatar_url )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.status(200).json(users);
    } catch (err) {
        console.error("Erreur getAllUsers:", err);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};

// PUT /api/users/:id/role (Admin) - Code inchangé
exports.updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    if (req.user.id === id) return res.status(403).json({ error: "Impossible de modifier votre propre rôle." });
    if (!['admin', 'member'].includes(role)) return res.status(400).json({ error: "Rôle invalide." });

    try {
        const { data, error } = await supabase
            .from('users')
            .update({ role })
            .eq('user_id', id)
            .select('user_id, email, role')
            .single();

        if (error) throw error;
        res.status(200).json({ message: 'Rôle mis à jour.', user: data });
    } catch (err) {
        console.error("Erreur updateUserRole:", err);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};

// ------------------------------------------------------------------
// Logique Utilisateur (Profil)
// ------------------------------------------------------------------

// GET /api/users/me
exports.getProfile = async (req, res) => {
    const user_id = req.user.id;

    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select(`
                username, first_name, last_name, avatar_url,
                users ( email, role )
            `)
            .eq('user_id', user_id)
            .single();

        if (error || !profile) return res.status(404).json({ error: 'Profil non trouvé.' });
        res.status(200).json(profile);
    } catch (err) {
        console.error("Erreur getProfile:", err);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};

// PUT /api/users/me - AVEC IMAGE
exports.updateProfile = async (req, res) => {
    const user_id = req.user.id; 
    // req.body contient les textes, req.file contient l'avatar
    const { username, first_name, last_name } = req.body;
    const file = req.file;

    let updates = { username, first_name, last_name };

    try {
        // 1. Upload Avatar si présent
        if (file) {
            console.log("📂 Avatar détecté, upload en cours...");
            const avatar_url = await uploadToSupabase(file);
            updates.avatar_url = avatar_url;
        }

        // 2. Mise à jour DB
        const { data, error } = await supabase
            .from('profiles')
            .update(updates)
            .eq('user_id', user_id)
            .select()
            .single();

        if (error) {
            if (error.code === '23505') return res.status(409).json({ error: "Ce nom d'utilisateur est déjà pris." });
            throw error;
        }

        res.status(200).json({ message: 'Profil mis à jour.', profile: data });

    } catch (err) {
        console.error("Erreur updateProfile:", err);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};
// 5. Supprimer un Utilisateur (DELETE) - Admin
// ------------------------------------------------------------------
exports.deleteUser = async (req, res) => {
    const { id } = req.params;

    try {
        // 1. Récupérer le profil pour voir s'il y a un avatar à supprimer
        const { data: profile } = await supabase
            .from('profiles')
            .select('avatar_url')
            .eq('user_id', id)
            .single();

        // 2. Supprimer l'utilisateur de la table 'users' 
        // (Grâce au "ON DELETE CASCADE" de SQL, cela supprimera aussi le profil)
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('user_id', id);

        if (error) {
            console.error("Erreur Supabase Delete User:", error);
            return res.status(500).json({ error: "Erreur lors de la suppression." });
        }

        // 3. Nettoyage : Supprimer l'avatar du bucket s'il existe
        if (profile?.avatar_url) {
            const fileName = profile.avatar_url.split('/').pop();
            await supabase.storage.from('avatars').remove([fileName]).catch(() => {});
        }

        res.status(200).json({ message: "Utilisateur supprimé avec succès." });

    } catch (err) {
        console.error("Erreur serveur deleteUser:", err);
        res.status(500).json({ error: "Erreur serveur." });
    }
};
module.exports = {
    getAllUsers: exports.getAllUsers,
    updateUserRole: exports.updateUserRole,
    getProfile: exports.getProfile,
    updateProfile: exports.updateProfile,
    deleteUser: exports.deleteUser,
};