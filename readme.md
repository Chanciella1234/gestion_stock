# Application de Gestion de Stock
### Projet d'Examen — Développement JavaScript & Base de Données NoSQL

---

## Informations du projet

| Élément         | Détail                                              |
|-----------------|-----------------------------------------------------|
| **Cours**       | JavaScript (Node.js / Express) & Base de Données NoSQL (MongoDB) |
| **Projet**      | Projet 2 — Application de Gestion de Stock          |
| **Groupe**      | Groupe 2 — 3 étudiants                              |


---

## Description de l'application

Application web full-stack de gestion de stock permettant à des **clients** de consulter un catalogue de produits, gérer un panier persistant et passer des commandes, et à des **administrateurs** de gérer les stocks, suivre les commandes et recevoir des alertes automatiques en cas de stock faible.

---

## Fonctionnalités implémentées

### Côté Client
- Inscription et connexion avec token JWT
- Catalogue de produits avec recherche et filtres par catégorie
- Panier persistant (sauvegardé en base de données, TTL 7 jours)
- Passage de commande avec code promotionnel
- Historique des commandes et suivi du statut
- Avis et notes sur les produits achetés
- Notifications en temps réel (commandes, promotions)

### Côté Administrateur
- Tableau de bord avec statistiques (CA, produits vendus, alertes actives)
- Gestion complète des produits (CRUD + images)
- Gestion des catégories
- Suivi et mise à jour des commandes (statuts)
- Alertes automatiques de stock faible
- Gestion des promotions (pourcentage ou montant fixe)
- Gestion des clients
- Modération des avis

---

## Stack technologique

| Couche          | Technologie                          |
|-----------------|--------------------------------------|
| **Runtime**     | Node.js v18 LTS                      |
| **Framework**   | Express.js v4                        |
| **Base de données** | MongoDB + Mongoose v8            |
| **Authentification** | JSON Web Token (JWT) + bcrypt   |
| **Upload fichiers** | Multer                           |
| **Frontend**    | HTML5 / CSS3 / JavaScript Vanilla    |
| **CSS**         | Bootstrap 5 (CDN)                    |
| **Graphiques**  | Chart.js (dashboard admin)           |
| **Variables env** | dotenv                             |
| **Dev**         | Nodemon                              |

---

## Structure du projet

```
gestion-stock/
│
├── server.js                    ← Point d'entrée — configure Express et lance le serveur
│
├── .env                         ← Variables d'environnement (NON versionné)
├── .env.example                 ← Modèle du fichier .env
├── .gitignore                   ← Fichiers exclus de Git
├── package.json                 ← Dépendances et scripts npm
│
├── config/
│   ├── database.js              ← Connexion à MongoDB (Mongoose)
│   └── multer.js                ← Configuration upload d'images produits
│
├── models/                      ← Schémas Mongoose (9 collections)
│   ├── index.js                 ← Export groupé de tous les modèles
│   ├── Utilisateur.js           ← Comptes clients et admin (bcrypt intégré)
│   ├── Categorie.js             ← Catégories de produits (slug auto)
│   ├── Produit.js               ← Produits avec seuil d'alerte automatique
│   ├── Panier.js                ← Panier persistant (TTL 7 jours, lignes embarquées)
│   ├── Commande.js              ← Commandes (snapshot immuable des prix)
│   ├── Alerte.js                ← Alertes de stock faible (historique)
│   ├── Notification.js          ← Notifications clients et admin
│   ├── Avis.js                  ← Notes et commentaires sur les produits
│   └── Promotion.js             ← Codes promo (% ou montant fixe)
│
├── controllers/                 ← Logique métier (une fonction par action)
│   ├── authController.js        ← Inscription, connexion, profil
│   ├── produitController.js     ← CRUD produits + recherche + filtres
│   ├── categorieController.js   ← CRUD catégories
│   ├── panierController.js      ← Ajout, modification, suppression de lignes
│   ├── commandeController.js    ← Création commande + déduction stock
│   ├── alerteController.js      ← Liste alertes, résolution
│   ├── notificationController.js← Liste notifications, marquer comme lue
│   ├── avisController.js        ← Ajout avis, validation admin
│   ├── promotionController.js   ← CRUD promotions, vérification code promo
│   └── dashboardController.js   ← Statistiques et agrégations MongoDB
│
├── routes/                      ← Définition des endpoints API REST
│   ├── authRoutes.js            ← POST /api/auth/register, /login, /me
│   ├── produitRoutes.js         ← GET/POST/PUT/DELETE /api/produits
│   ├── categorieRoutes.js       ← GET/POST/PUT/DELETE /api/categories
│   ├── panierRoutes.js          ← GET/POST/PUT/DELETE /api/panier
│   ├── commandeRoutes.js        ← GET/POST/PATCH /api/commandes
│   ├── alerteRoutes.js          ← GET/PATCH /api/alertes
│   ├── notificationRoutes.js    ← GET/PATCH /api/notifications
│   ├── avisRoutes.js            ← GET/POST/PATCH /api/avis
│   ├── promotionRoutes.js       ← GET/POST/PUT/DELETE /api/promotions
│   └── dashboardRoutes.js       ← GET /api/dashboard/stats
│
├── middleware/
│   ├── auth.js                  ← Vérifie le token JWT (protect)
│   ├── roles.js                 ← Vérifie le rôle (adminOnly, clientOnly)
│   └── errorHandler.js          ← Gestion centralisée des erreurs
│
├── utils/
│   ├── apiResponse.js           ← Formatage uniforme des réponses JSON
│   ├── jwtUtils.js              ← Génération et vérification des tokens
│   └── validators.js            ← Validation des données entrantes
│
├── seed/
│   └── seed.js                  ← Données de test (4 users, 14 produits, commandes...)
│
├── public/                      ← Fichiers statiques servis par Express
│   ├── css/
│   │   ├── style.css            ← Styles globaux (client)
│   │   └── admin.css            ← Styles du panneau admin
│   ├── js/
│   │   ├── auth.js              ← Inscription, connexion, gestion du token
│   │   ├── produits.js          ← Catalogue, recherche, filtres
│   │   ├── panier.js            ← Interactions panier (Fetch API)
│   │   ├── commandes.js         ← Passage de commande, historique
│   │   ├── admin.js             ← Dashboard, gestion produits/commandes
│   │   └── notifications.js     ← Affichage et mise à jour des notifs
│   └── images/                  ← Images produits uploadées
│
└── views/                       ← Pages HTML (servies statiquement)
    ├── index.html               ← Page d'accueil (catalogue public)
    ├── partials/
    │   ├── navbar.html          ← Barre de navigation (incluse via JS)
    │   └── footer.html          ← Pied de page
    ├── auth/
    │   ├── login.html           ← Page de connexion
    │   └── register.html        ← Page d'inscription
    ├── produits/
    │   ├── catalogue.html       ← Catalogue avec filtres
    │   └── detail.html          ← Fiche produit + avis
    ├── panier/
    │   └── panier.html          ← Panier et validation de commande
    ├── commandes/
    │   ├── commandes.html       ← Historique des commandes client
    │   └── confirmation.html    ← Page de confirmation après achat
    └── admin/
        ├── dashboard.html       ← Statistiques et graphiques
        ├── produits.html        ← Gestion produits et stock
        ├── commandes.html       ← Suivi et mise à jour commandes
        ├── alertes.html         ← Alertes de stock faible
        └── clients.html         ← Gestion des comptes clients
```

---

## Base de données — 9 collections MongoDB

| Collection       | Rôle                                          | Relations                        |
|------------------|-----------------------------------------------|----------------------------------|
| `utilisateurs`   | Comptes clients et admins                     | Référencé par toutes les autres  |
| `categories`     | Catégories de produits                        | Référencée par `produits`        |
| `produits`       | Catalogue avec stock et seuil d'alerte        | Référence `categories`           |
| `panier`         | Panier actif par client (lignes embarquées)   | Référence `utilisateurs`         |
| `commandes`      | Historique commandes (snapshot immuable)      | Référence `utilisateurs`         |
| `alertes`        | Alertes stock faible (historique)             | Référence `produits`             |
| `notifications`  | Messages in-app pour clients et admin         | Référence `utilisateurs`         |
| `avis`           | Notes et commentaires sur les produits        | Référence `produits`, `utilisateurs` |
| `promotions`     | Codes promo (% ou montant fixe)               | Référence `produits`, `categories` |

---

## API REST — Endpoints principaux

### Authentification
```
POST   /api/auth/register          Inscription client
POST   /api/auth/login             Connexion (retourne JWT)
GET    /api/auth/me                Profil connecté         [protégé]
```

### Produits
```
GET    /api/produits               Catalogue (public, filtres possibles)
GET    /api/produits/:id           Détail d'un produit
POST   /api/produits               Créer un produit        [admin]
PUT    /api/produits/:id           Modifier un produit     [admin]
DELETE /api/produits/:id           Supprimer un produit    [admin]
```

### Panier
```
GET    /api/panier                 Mon panier              [client]
POST   /api/panier/ajouter         Ajouter un produit      [client]
PUT    /api/panier/:ligneId        Modifier une quantité   [client]
DELETE /api/panier/:ligneId        Retirer une ligne       [client]
DELETE /api/panier/vider           Vider le panier         [client]
```

### Commandes
```
POST   /api/commandes              Passer une commande     [client]
GET    /api/commandes/mes          Mes commandes           [client]
GET    /api/commandes              Toutes les commandes    [admin]
PATCH  /api/commandes/:id/statut   Changer le statut       [admin]
```

### Alertes, Notifications, Avis, Promotions
```
GET    /api/alertes                Liste des alertes       [admin]
PATCH  /api/alertes/:id/resoudre   Résoudre une alerte     [admin]
GET    /api/notifications          Mes notifications       [protégé]
PATCH  /api/notifications/:id/lue  Marquer comme lue       [protégé]
POST   /api/avis                   Laisser un avis         [client]
GET    /api/promotions/verifier    Vérifier un code promo  [client]
GET    /api/dashboard/stats        Statistiques admin      [admin]
```

---

## Guide d'installation

### Prérequis
- Node.js v18 LTS ou supérieur — https://nodejs.org
- MongoDB Community Server v7 (local) OU un compte MongoDB Atlas (cloud)
- Git — https://git-scm.com

### Étape 1 — Cloner le projet
```bash
git clone https://github.com/Chanciella1234/gestion_stock_web.git
cd gestion_stock_web
```

### Étape 2 — Installer les dépendances
```bash
npm install
```

### Étape 3 — Configurer les variables d'environnement
```bash
# Copier le fichier exemple
cp .env.example .env

# Ouvrir .env et modifier les valeurs
MONGO_URI=mongodb://localhost:27017/gestion_stock
JWT_SECRET=VotreSecretPersonnelTresLong2024
JWT_EXPIRE=7d
PORT=5000
NODE_ENV=development
```

> Si vous utilisez MongoDB Atlas (cloud), remplacez MONGO_URI par votre chaîne de connexion Atlas.

### Étape 4 — Charger les données de test
```bash
npm run seed
```


### Étape 5 — Lancer l'application
```bash
# Mode développement (redémarrage automatique)
npm run dev

# Mode production
npm start
```

### Étape 6 — Accéder à l'application
Ouvrir un navigateur et aller sur :
```
http://localhost:5000
```
---

## Authentification — Fonctionnement

1. Le client s'inscrit (`POST /api/auth/register`) → mot de passe hashé par **bcrypt**
2. Le client se connecte (`POST /api/auth/login`) → le serveur retourne un **token JWT**
3. Le token est stocké dans le `localStorage` du navigateur
4. Chaque requête protégée envoie le token dans le header :
   ```
   Authorization: Bearer <token>
   ```
5. Le middleware `auth.js` vérifie le token et attache `req.user` à chaque requête
6. Le middleware `roles.js` vérifie que `req.user.role` correspond au rôle requis

---

## Répartition des tâches

| Membre   | Rôle principal         | Responsabilités                                                    |
|----------|------------------------|--------------------------------------------------------------------|
| Membre 1 | Backend & API          | Serveur Express, routes, contrôleurs, authentification JWT, tests Postman |
| Membre 2 | Frontend & UI          | Pages HTML/CSS, JavaScript client, Fetch API, interface admin      |
| Membre 3 | Base de données & Rapport | Modèles Mongoose, agrégations, seed, rédaction du rapport       |

---

## Tests — Outils utilisés

- **Postman** : test de toutes les routes API (authentification, CRUD, cas d'erreur)
- **MongoDB Compass** : vérification des données en base, inspection des collections
- **Navigateurs testés** : Google Chrome, Mozilla Firefox, Microsoft Edge

---

## Dépôt Git

```
https://github.com/Chanciella1234/gestion_stock_web.git
```

---
