// backend/middleware/upload.js
const multer = require('multer');

// On stocke le fichier en mémoire (buffer) pour pouvoir l'envoyer directement à Supabase
const storage = multer.memoryStorage();

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // Limite à 5MB
});

module.exports = upload;