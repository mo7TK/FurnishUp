const express = require("express");
const Commande = require("../models/commandeModel");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const bcrypt = require("bcrypt");


// POST /commande/create - Crée une nouvelle commande
router.post('/achetermnt', async (req, res) => {
  try {
    const { produits, total, userId } = req.body;
    
    // Validate required fields
    if (!produits || !userId) {
      return res.status(400).json({
        success: false,
        message: "Produits and userId are required"
      });
    }

    const nouvelleCommande = new Commande({
      utilisateur: userId,  // Match schema field name
      produits: produits.map(p => ({
        produit: p.produitId,  // Match schema field name
        quantite: p.quantite,
        envoyer: false  // Add default value
      })),
      total,
      statut: "En attente",  // Match enum values
      lieu: "Address to be provided"  // Temporary placeholder
    });

    await nouvelleCommande.save();
    
    res.json({ 
      success: true,
      commande: nouvelleCommande  // Return full commande object
    });
  } catch (error) {
    console.error("Error creating commande:", error);
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
});

// Ajouter un produit au panier (Base de données si connecté)
router.post("/ajouter", verifyToken, async (req, res) => {
  try {
    const utilisateurId = req.user.userId;
    const { produitId, quantite } = req.body;

    // Validation des données
    if (!produitId || !quantite) {
      return res.status(400).json({ message: "Produit ID et quantité requis" });
    }

    // Recherche d'une commande existante "En attente" pour cet utilisateur
    let commande = await Commande.findOne({ 
      utilisateur: utilisateurId,
      statut: "En attente"
    });

    // Si aucune commande en attente n'existe, on en crée une nouvelle
    if (!commande) {
      commande = new Commande({ 
        utilisateur: utilisateurId, 
        produits: [],
        statut: "En attente" // On s'assure que le statut est bien "En attente"
      });
    }

    // Recherche si le produit existe déjà dans la commande
    const produitIndex = commande.produits.findIndex(
      p => p.produit.toString() === produitId
    );

    if (produitIndex > -1) {
      // Si le produit existe déjà, on met à jour la quantité
      commande.produits[produitIndex].quantite += quantite;
    } else {
      // Sinon, on ajoute le nouveau produit
      commande.produits.push({ produit: produitId, quantite, envoyer : false });
    }

    // Sauvegarde de la commande
    await commande.save();

    // Réponse avec la commande mise à jour
    res.json({ 
      message: "Produit ajouté au panier", 
      commande 
    });

  } catch (error) {
    console.error("Erreur lors de l'ajout au panier:", error);
    res.status(500).json({ 
      message: "Erreur serveur", 
      error: error.message 
    });
  }
});
// Récupérer le panier d'un utilisateur (uniquement les commandes "En attente")
router.get("/", verifyToken, async (req, res) => {
  try {
    const utilisateurId = req.user.userId;
    const commande = await Commande.findOne({ 
      utilisateur: utilisateurId,
      statut: "En attente" // Ajout du filtre
    }).populate("produits.produit");
    
    res.json(commande || { produits: [] });
  } catch (error) {
    console.error("Erreur serveur :", error);
    res.status(500).json({ message: "Erreur serveur", error });
  }
});
  router.get("/commande", verifyToken, async (req, res) => {
    try {
      const commandes = await Commande.find()
        .populate("utilisateur", "nom prenom email adresse") // infos client
        .populate("produits.produit"); // détail produit
  
      res.json(commandes);
    } catch (err) {
      console.error("Erreur getAllCommandes:", err);
      res.status(500).json({ message: "Erreur serveur" });
    }
  });
// Modifier la quantité d'un produit dans le panier
router.put("/modifier", verifyToken, async (req, res) => {
  try {
    const { produitId, quantite } = req.body;
    const utilisateurId = req.user.userId;

    // Validation des données
    if (!produitId || quantite === undefined || quantite < 1) {
      return res.status(400).json({ 
        success: false,
        message: "ID produit et quantité valide requis" 
      });
    }

    // Trouver la commande en attente de l'utilisateur
    const commande = await Commande.findOne({ 
      utilisateur: utilisateurId,
      statut: "En attente"
    }).populate("produits.produit");

    if (!commande) {
      return res.status(404).json({ 
        success: false,
        message: "Panier introuvable" 
      });
    }

    // Trouver l'index du produit dans le panier
    const produitIndex = commande.produits.findIndex(
      p => p.produit._id.toString() === produitId
    );

    if (produitIndex === -1) {
      return res.status(404).json({ 
        success: false,
        message: "Produit non trouvé dans le panier" 
      });
    }

    // Vérifier le stock disponible
    const produit = commande.produits[produitIndex].produit;
    if (quantite > produit.quantite_disponible) {
      return res.status(400).json({ 
        success: false,
        message: "Quantité demandée supérieure au stock disponible" 
      });
    }

    // Mettre à jour la quantité
    commande.produits[produitIndex].quantite = quantite;
    await commande.save();

    // Renvoyer la commande mise à jour
    const commandeUpdated = await Commande.findById(commande._id)
      .populate("produits.produit");

    res.json({ 
      success: true,
      message: "Quantité mise à jour",
      commande: commandeUpdated
    });

  } catch (error) {
    console.error("Erreur modification quantité:", error);
    res.status(500).json({ 
      success: false,
      message: "Erreur serveur",
      error: error.message 
    });
  }
});

// Supprimer un produit du panier
router.delete("/supprimer/:produitId", verifyToken, async (req, res) => {
  try {
    const { produitId } = req.params;
    const utilisateurId = req.user.userId;
    
    // Trouver la commande en attente de l'utilisateur
    let commande = await Commande.findOne({ 
      utilisateur: utilisateurId,
      statut: "En attente" // Seulement pour les commandes en attente
    });
    
    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable" });
    }
    
    // Filtrer le produit à supprimer
    commande.produits = commande.produits.filter(p => p.produit.toString() !== produitId);
    
    // Si le panier est vide après suppression, supprimer la commande
    if (commande.produits.length === 0) {
      await Commande.findByIdAndDelete(commande._id);
      return res.json({ message: "Dernier produit supprimé, commande annulée" });
    }
    
    // Sinon, sauvegarder la commande mise à jour
    await commande.save();
    
    res.json({ 
      message: "Produit supprimé du panier", 
      commande 
    });
    
  } catch (error) {
    console.error("Erreur suppression produit:", error);
    res.status(500).json({ 
      message: "Erreur serveur", 
      error: error.message 
    });
  }
});
// Vider complètement le panier (optionnel)
router.delete("/vider", verifyToken, async (req, res) => {
  try {
    const utilisateurId = req.user.userId;
    let commande = await Commande.findOne({ utilisateur: utilisateurId });
    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable" });
    }
    commande.produits = [];
    await commande.save();
    res.json({ message: "Panier vidé", commande });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});
// Confirmer une commande*****************************************************************************
router.post("/confirmer", verifyToken, async (req, res) => {
  try {
    const { commandeId, shippingAddress } = req.body;

    // Récupérer la commande
    const commande = await Commande.findById(commandeId)
      .populate("produits.produit");

    if (!commande) {
      return res.status(404).json({ success: false, message: "Commande non trouvée" });
    }

    // Mettre à jour la commande
    commande.lieu = `${shippingAddress.address1}, ${shippingAddress.city}, ${shippingAddress.zip}, ${shippingAddress.country}`;
    commande.statut = "Confirmée";
    await commande.save();

    res.json({ success: true, commande });
    
  } catch (error) {
    console.error("Erreur confirmation commande:", error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur",
      error: error.message
    });
  }
});

// Récupérer les commandes confirmées/envoyées d'un utilisateur
router.get("/cmdconfirmer", verifyToken, async (req, res) => {
  try {
    console.log("Tentative d'accès à /cmdconfirmer"); // Debug
    const commandes = await Commande.find({
      utilisateur: req.user.userId,
      statut: { $in: ["Confirmée", "Envoyée"] }
    }).populate("produits.produit");
    
    console.log("Commandes trouvées:", commandes.length); // Debug
    res.json(commandes);
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


///// recuperer commandes confirmees d'un vendeur
router.get("/cmdconfirmervendeur", verifyToken, async (req, res) => {
  try {
    const commandes = await Commande.find({
      statut: { $in: ["Confirmée", "Envoyée"] }
    })
    .populate("utilisateur", "nom prenom email")
    .populate({
      path: "produits.produit",
      populate: {
        path: "vendeur_id",
        select: "nom prenom"
      }
    });

    res.json(commandes);
  } catch (error) {
    console.error("Erreur:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});


// Marquer un produit comme envoyé
router.put("/produit/envoyer/:commandeId/:produitId", verifyToken, async (req, res) => {
  try {
    const { commandeId, produitId } = req.params;
    
    const commande = await Commande.findById(commandeId);
    if (!commande) {
      return res.status(404).json({ message: "Commande introuvable" });
    }

    // Trouver le produit dans la commande
    const produit = commande.produits.find(
      p => p.produit.toString() === produitId
    );
    
    if (!produit) {
      return res.status(404).json({ message: "Produit non trouvé dans la commande" });
    }

    // Mettre à jour le statut d'envoi
    produit.envoyer = true;
    await commande.save();

    // Vérifier si tous les produits sont envoyés pour mettre à jour le statut global
    const tousEnvoyes = commande.produits.every(p => p.envoyer);
    if (tousEnvoyes) {
      commande.statut = "Envoyée";
      await commande.save();
    }

    res.json({ 
      success: true,
      message: "Produit marqué comme envoyé",
      commande: await Commande.findById(commandeId)
        .populate("produits.produit")
        .populate("utilisateur", "nom prenom email")
    });
    
  } catch (error) {
    console.error("Erreur marquage produit envoyé:", error);
    res.status(500).json({ 
      success: false,
      message: "Erreur serveur",
      error: error.message 
    });
  }
});


// Route pour calculer le profit de l'admin
router.get("/profit-admin", async (req, res) => {
  try {
    const adminId = "67d58664c14a211ded9e25ed";
    const commandes = await Commande.find({ statut: "Confirmée" })
      .populate({
        path: "produits.produit",
        select: "vendeur_id prix" // Optimisation: ne récupérer que les champs nécessaires
      });

    let totalProfit = 0;

    for (const commande of commandes) {
      for (const item of commande.produits) {
        const produit = item.produit;
        // Vérification robuste
        if (produit?.vendeur_id?.toString() === adminId) {
          totalProfit += (produit.prix || 0) * (item.quantite || 0);
        }
      }
    }

    res.json({ profitAdmin: totalProfit });
  } catch (error) {
    console.error("Erreur calcul profit admin:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});

// Route pour calculer les 5% des autres vendeurs
router.get("/profit-autres", async (req, res) => {
  try {
    const adminId = "67d58664c14a211ded9e25ed";
    const commandes = await Commande.find({ statut: "Confirmée" })
      .populate({
        path: "produits.produit",
        select: "vendeur_id prix" // Optimisation: ne récupérer que les champs nécessaires
      });

    let totalAutres = 0;
    let commission = 0;

    for (const commande of commandes) {
      for (const item of commande.produits) {
        const produit = item.produit;
        // Vérification robuste
        if (produit?.vendeur_id && produit.vendeur_id.toString() !== adminId) {
          const montant = (produit.prix || 0) * (item.quantite || 0);
          totalAutres += montant;
          commission += montant * 0.05;
        }
      }
    }

    res.json({ 
      commission: parseFloat(commission.toFixed(2)), 
      totalAutres: parseFloat(totalAutres.toFixed(2)) 
    });
  } catch (error) {
    console.error("Erreur calcul profit autres:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
});


// Route pour récupérer les statistiques du dashboard
router.get("/com/stats", async (req, res) => {
  try {
    const commandesEnAttente = await Commande.countDocuments({ statut: "En attente" });
    const totalCommandes = await Commande.countDocuments(); // Total de toutes les commandes
    res.json({ commandesEnAttente, totalCommandes });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
});







module.exports = router;
	
