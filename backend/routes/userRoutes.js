//userRoutes.js
const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const User = require("../models/userModel");
const Produit = require("../models/produitModel");
const { verifyToken } = require("../middleware/authMiddleware");

const router = express.Router();

// ID de l'administrateur (à sécuriser via .env dans une vraie appli)
const ADMIN_ID = "67d58664c14a211ded9e25ed";


router.get("/utils", async (req, res) => {
  try {
    // Récupérer tous les utilisateurs
    const utilisateurs = await User.find({}, '_id nom lastname email');
    
    // Pour chaque utilisateur, compter ses produits
    const utilisateursAvecProduits = await Promise.all(
      utilisateurs.map(async (user) => {
        const nombreProduits = await Produit.countDocuments({ vendeur_id: user._id });
        return {
          _id: user._id,
          nom: user.nom,
          lastname: user.lastname,
          email: user.email,
          nombre_produits: nombreProduits
        };
      })
    );

    res.json(utilisateursAvecProduits);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});



// Inscription
router.post("/register", async (req, res) => {
  try {
    const { nom, lastname, address, email, password } = req.body;

    if (await User.findOne({ email })) {
      return res.status(400).json({ message: "L'email est déjà utilisé" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ nom, lastname, address, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      user: {
        _id: newUser._id,
        nom: newUser.nom,
        lastname: newUser.lastname,
        address: newUser.address,
        email: newUser.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Connexion
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    const token = jwt.sign({ userId: user._id }, "secret_key", { expiresIn: "3h" });

    res.json({
      token,
      user: {
        _id: user._id,
        nom: user.nom,
        lastname: user.lastname,
        address: user.address,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Infos utilisateur connecté
router.get("/user", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Suppression d'un utilisateur et tous ses produits
router.delete("/deleteutil/:id", verifyToken, async (req, res) => {
  try {
    const userIdToDelete = req.params.id;

    // Interdiction de supprimer l'admin
    if (userIdToDelete === ADMIN_ID) {
      return res.status(403).json({
        success: false,
        message: "Impossible de supprimer le compte administrateur"
      });
    }

    // Supprimer tous les produits liés à cet utilisateur
    await Produit.deleteMany({ vendeur_id: userIdToDelete });

    // Supprimer l'utilisateur lui-même
    const deletedUser = await User.findByIdAndDelete(userIdToDelete);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "Utilisateur non trouvé"
      });
    }

    res.json({
      success: true,
      message: "Utilisateur et ses produits supprimés avec succès"
    });
  } catch (error) {
    console.error("Erreur suppression utilisateur:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la suppression"
    });
  }
});

// Récupérer un utilisateur par son ID
router.get("/adminutil/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});


// Récupérer un vendeur par son ID
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, message: "ID invalide" });
    }

    const vendeur = await User.findById(req.params.id).select("nom email");
    if (!vendeur) {
      return res.status(404).json({ success: false, message: "Vendeur non trouvé" });
    }

    res.json({ success: true, vendeur });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur serveur", error });
  }
});

// Mettre à jour l'utilisateur connecté
router.put("/update", verifyToken, async (req, res) => {
  try {
    const { nom, lastname, address, email, password } = req.body;
    const userId = req.user.userId;

    const currentUser = await User.findById(userId);
    if (!currentUser) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const nameTaken = await User.findOne({ nom, _id: { $ne: userId } });
    if (nameTaken) {
      return res.status(400).json({ message: "Ce nom est déjà utilisé." });
    }

    const emailTaken = await User.findOne({ email, _id: { $ne: userId } });
    if (emailTaken) {
      return res.status(400).json({ message: "Cet email est déjà utilisé." });
    }

    const updates = { nom, lastname, address, email };
    if (password) {
      updates.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updates, { new: true }).select("-password");

    res.json(updatedUser);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour." });
  }
});

// Statistiques (admin/dashboard)
router.get("/aut/stats", verifyToken, async (req, res, next) => {
  try {
    const totalUtilisateurs = await User.countDocuments();
    res.json({ totalUtilisateurs });
  } catch (err) {
    next(err);
  }
});









module.exports = router;

