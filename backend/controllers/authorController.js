// controllers/authorController.js
const supabase = require('../config/supabase');

const BUCKET_NAME = 'author_image';

// Génère l'URL publique (le bucket DOIT être public)
const getPublicUrl = (path) => {
  if (!path) return null;
  return `${process.env.SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${path}`;
};

// ------------------------------------------------------------------
// 1. CREATE Author + Image
// ------------------------------------------------------------------
exports.createAuthor = async (req, res) => {
  const { first_name, last_name, biography } = req.body;
  const file = req.file; // multer

  if (!first_name || !last_name) {
    return res.status(400).json({ error: 'Prénom et nom requis.' });
  }

  try {
    let author_url = null;

    if (file) {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `author_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return res.status(500).json({ error: 'Échec upload image' });
      }

      author_url = getPublicUrl(fileName);
    }

    const { data, error } = await supabase
      .from('authors')
      .insert({
        first_name,
        last_name,
        biography: biography || null,
        author_url,
      })
      .select()
      .single();

    if (error) {
      if (file) {
        await supabase.storage.from(BUCKET_NAME).remove([fileName]).catch(() => {});
      }
      return res.status(400).json({ error: error.message });
    }

    res.status(201).json({
      message: 'Auteur créé avec succès',
      author: data,
    });
  } catch (err) {
    console.error('Erreur création:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// ------------------------------------------------------------------
// 2. GET All Authors (image déjà dans author_url)
// ------------------------------------------------------------------
exports.getAllAuthors = async (req, res) => {
  try {
    const { data: authors, error } = await supabase
      .from('authors')
      .select('*')
      .order('last_name', { ascending: true });

    if (error) throw error;

    res.status(200).json(authors);
  } catch (err) {
    console.error('Erreur getAllAuthors:', err);
    res.status(500).json({ error: 'Impossible de charger les auteurs' });
  }
};

// ------------------------------------------------------------------
// 3. UPDATE Author
// ------------------------------------------------------------------
exports.updateAuthor = async (req, res) => {
  const { id } = req.params;
  const { first_name, last_name, biography } = req.body;
  const file = req.file;

  try {
    // Récupérer l'auteur actuel
    const { data: current } = await supabase
      .from('authors')
      .select('author_url')
      .eq('author_id', id)
      .single();

    let author_url = current?.author_url;

    if (file) {
      const fileExt = file.originalname.split('.').pop();
      const fileName = `author_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(fileName, file.buffer, {
          contentType: file.mimetype,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      author_url = getPublicUrl(fileName);

      // Supprimer l'ancienne image
      if (current?.author_url) {
        const oldFile = current.author_url.split('/').pop();
        await supabase.storage.from(BUCKET_NAME).remove([oldFile]).catch(() => {});
      }
    }

    const { data, error } = await supabase
      .from('authors')
      .update({
        first_name,
        last_name,
        biography: biography || null,
        author_url,
      })
      .eq('author_id', id)
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({
      message: 'Auteur mis à jour',
      author: data,
    });
  } catch (err) {
    console.error('Erreur update:', err);
    res.status(500).json({ error: 'Échec mise à jour' });
  }
};

// ------------------------------------------------------------------
// 4. DELETE Author + Image
// ------------------------------------------------------------------
exports.deleteAuthor = async (req, res) => {
  const { id } = req.params;

  try {
    const { data: author } = await supabase
      .from('authors')
      .select('author_url')
      .eq('author_id', id)
      .single();

    const { error } = await supabase
      .from('authors')
      .delete()
      .eq('author_id', id);

    if (error) {
      if (error.code === '23503') {
        return res.status(400).json({ error: 'Auteur lié à des livres' });
      }
      throw error;
    }

    if (author?.author_url) {
      const fileName = author.author_url.split('/').pop();
      await supabase.storage.from(BUCKET_NAME).remove([fileName]).catch(() => {});
    }

    res.status(200).json({ message: 'Auteur supprimé' });
  } catch (err) {
    console.error('Erreur suppression:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = {
  createAuthor: exports.createAuthor,
  getAllAuthors: exports.getAllAuthors,
  updateAuthor: exports.updateAuthor,
  deleteAuthor: exports.deleteAuthor,
};