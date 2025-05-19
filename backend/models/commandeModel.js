const mongoose = require("mongoose");
const commandeSchema = new mongoose.Schema({
  utilisateur: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true , index: true  },
  produits: [
    {
      produit: { type: mongoose.Schema.Types.ObjectId, ref: "Produit", required: true ,index: true },
      quantite: { type: Number, required: true, default: 1 },
      envoyer: { type: Boolean, default: false }, // Ajoute ce champ

    },
  ],
  date: { type: Date, default: Date.now },
  statut: {
    type: String,
    default: "En attente",
    index: true, // Index sur le statut
    enum: ["En attente", "Confirmée", "Envoyée"] // Validation des valeurs possibles
  },
  lieu: { // Nouveau champ pour stocker l'adresse complète
    type: String,
  },
});
module.exports = mongoose.model("Commande", commandeSchema);


	
