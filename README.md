# 🛋️ Application E-commerce de Vente de Meubles

Ce projet est une application web e-commerce dédiée à la vente de meubles. Il a été développé dans le cadre d’un projet universitaire en utilisant des technologies modernes du web.

# compte Admin

Email:admin@example.com
PW : 123123

## 🔧 Technologies utilisées

- **Frontend** : React.js
- **Backend** : Express.js (Node.js)
- **Base de données** : MongoDB

## 📁 Structure du projet

```
/Frontend        → Interface utilisateur (React)
/Backend        → API backend (Express)
/uploads       → Stockage des fichiers (ex: images)
/README.md     → Documentation du projet
```

## 🚀 Fonctionnalités principales

- Authentification des utilisateurs (inscription, connexion)
- Visualisation des produits (meubles)
- Ajout au panier
- Gestion des commandes
- Interface administrateur (gestion des produits, utilisateurs, etc.)
- Téléversement d’images pour les produits

## ▶️ Lancer le projet en local

### Prérequis

- Node.js installé
- MongoDB (local)

### Étapes

1. **Cloner le projet**

```bash
git clone https://github.com/mo7TK/FurnishUp
cd ton-repo
```

2. **Installer les dépendances**

```bash
cd frontend
npm install
cd ../backend
npm install
```

3. **Configurer les variables d’environnement**

Crée un fichier `.env` dans le dossier `/server` avec :

```env
MONGO_URI=ton_lien_mongodb
PORT=5000
```

4. **Démarrer le serveur**

```bash
cd server
node server.js
```

5. **Démarrer le frontend**

```bash
cd Frontend
npm start
```

6. **Accéder à l’application**

- Frontend : http://localhost:5173
- Backend : http://localhost:5000

## 📦 Déploiement

Ce projet peut être déployé sur :

- **Frontend** : Vercel, Netlify, GitHub Pages (via build)
- **Backend** : Render, Railway, ou VPS (avec PM2)
- **MongoDB** : MongoDB Atlas (cloud)

## 👥 Équipe projet

- [Trad khodja mohammed]
- [smail rima]
- [taliouine anis]
- [yahiaoui massinissa]
- [tiab lyna]

## 📄 Licence

Ce projet est à usage éducatif.

---

> Développé dans le cadre d’un projet universitaire sur le thème **Application E-commerce **.
