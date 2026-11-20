// server.js

// 1. Charger les variables d'environnement dès le départ
const dotenv = require('dotenv');
dotenv.config();

// 2. Importer l'application Express configurée
const app = require('./app');

// 3. Définir le port
const PORT = process.env.PORT || 3001; // Utilise la variable PORT du .env ou 3001 par défaut

// 4. Démarrer le serveur et écouter les connexions
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API accessible sur http://localhost:${PORT}/api/`);
});