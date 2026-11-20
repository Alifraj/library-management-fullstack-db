# 📚 Système de Gestion de Bibliothèque (Full-Stack & Base de Données)

Application web full-stack dédiée à la gestion complète d'une bibliothèque : catalogue des ouvrages, gestion des adhérents, suivi des emprunts et retours, ainsi que l'administration des données via une base de données relationnelle.

---

## ✨ Fonctionnalités Principales

- **Gestion du Catalogue (CRUD) :** Ajout, modification, suppression et recherche avancée de livres (par titre, auteur, catégorie ou disponibilité).
- **Gestion des Adhérents :** Inscription des membres, consultation des profils et historique individuel des emprunts.
- **Suivi des Emprunts & Retours :** Enregistrement des prêts, calcul des dates d'échéance, gestion des retards et mise à jour automatique du stock disponible.
- **Authentification & Rôles :** Accès sécurisé avec distinction entre les privilèges administrateur (bibliothécaire) et utilisateur (lecteur).
- **Base de Données Relationnelle :** Structuration optimisée des tables, clés étrangères et contraintes d'intégrité référentielle.

---

## 🏗️ Architecture du Projet

```text
library-management-fullstack-db/
├── backend/          # API serveur, logique métier et connexion à la base de données
├── frontend/         # Interface utilisateur interactive
└── README.md         # Documentation du projet

🛠️ Technologies Utilisées
Frontend : HTML5, CSS3, JavaScript / React (à adapter selon votre stack)

Backend : Node.js / Express (ou Python / PHP selon l'implémentation)

Base de Données : SQL (MySQL / PostgreSQL)

Outils : Git, GitHub, VS Code