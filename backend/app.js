// app.js

const express = require('express');
const cors = require('cors');

// Importez uniquement les routes que vous conservez
const authRoutes = require('./routes/authRoutes'); 
const authorRoutes = require('./routes/authorRoutes');
const bookRoutes = require('./routes/bookRoutes') ; 
const loanRoutes =require('./routes/loanRoutes') ; 
const userRoutes=require('./routes/userRoutes') ; 
// 1. DÉCLARATION DE L'APPLICATION EXPRESS
const app = express(); // <--- CETTE LIGNE EST CRUCIALE !

// 2. Middlewares de base
app.use(cors()); 
app.use(express.json()); 

// 3. Définition des routes
// Route de test
app.get('/', (req, res) => {
    res.status(200).json({ message: "API en cours d'exécution." });
});

// Routes d'authentification
app.use('/api/auth', authRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/loans', loanRoutes) ;
app.use('/api/users', userRoutes) ;  // L'utilisation de 'app' est maintenant correcte

module.exports = app;