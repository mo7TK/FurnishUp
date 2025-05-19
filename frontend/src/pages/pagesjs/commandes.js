import React, { useEffect, useState } from "react";
import Navbar from "../../components/componentjs/navbar";
import { getCommandesConfirmeesvendeur, marquerProduitEnvoye } from "../../api";
import "../pagescss/commandes.css";



export const Commandes = () => {
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.userid;

  const fetchCommandes = async () => {
    try {
      setLoading(true);
      const toutesCommandes = await getCommandesConfirmeesvendeur();

      // Filtrer les commandes pour ne garder que celles contenant des produits du vendeur
      const commandesFiltrees = toutesCommandes.filter(commande => {
        return commande.produits.some(
          p => p.produit?.vendeur_id?._id?.toString() === userId
        );
      });

      // Ajouter des informations supplémentaires à chaque commande
      const commandesAvecDetails = commandesFiltrees.map(commande => {
        const produitsVendeur = commande.produits.filter(
          p => p.produit?.vendeur_id?._id?.toString() === userId
        );

        const tousEnvoyes = produitsVendeur.every(p => p.envoyer);
        const dateCommande = new Date(commande.date);
        const dateFormatee = dateCommande.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        return {
          ...commande,
          produitsVendeur,
          totalVendeur: produitsVendeur.reduce(
            (acc, p) => acc + (p.produit?.prix || 0) * p.quantite,
            0
          ),
          tousEnvoyes,
          dateFormatee
        };
      });

      // Trier les commandes: non envoyées d'abord (plus anciennes en premier), puis envoyées (plus récentes en premier)
      const commandesTriees = [...commandesAvecDetails].sort((a, b) => {
        if (a.tousEnvoyes && !b.tousEnvoyes) return 1;
        if (!a.tousEnvoyes && b.tousEnvoyes) return -1;
        if (!a.tousEnvoyes && !b.tousEnvoyes) {
          return new Date(a.date) - new Date(b.date); // Plus anciennes en premier pour les non envoyées
        }
        return new Date(b.date) - new Date(a.date); // Plus récentes en premier pour les envoyées
      });

      setCommandes(commandesTriees);
    } catch (error) {
      console.error("Erreur lors du chargement des commandes :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommandes();
  }, [userId]);

  const handleMarquerEnvoye = async (commandeId, produitId) => {
    try {
      await marquerProduitEnvoye(commandeId, produitId);
      await fetchCommandes();
    } catch (error) {
      console.error("Erreur lors du marquage du produit comme envoyé:", error);
      alert("Une erreur est survenue lors du marquage du produit comme envoyé");
    }
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="commandes-container">
          <p>Chargement en cours...</p>
        </div>
      </div>
    );
  }

  const commandesEnCours = commandes.filter(c => !c.tousEnvoyes);
  const commandesCompletees = commandes.filter(c => c.tousEnvoyes);

  return (
    <div>
      <Navbar />
      <div className="commandes-container">
        <h2>Mes Ventes</h2>

        {/* Section Commandes en cours */}
        <div className="commandes-section">
          <h3>Commandes à traiter ({commandesEnCours.length})</h3>
          {commandesEnCours.length === 0 ? (
            <p className="aucune-commande">Aucune commande à traiter actuellement.</p>
          ) : (
            [...commandesEnCours].sort((a, b) => new Date(a.date) - new Date(b.date)).map((commande) => (
              <div key={commande._id} className="commande-card">
                <div className="commande-header">
                  <div className="commande-info">
                    <p><strong>Date:</strong> {commande.dateFormatee}</p>
                    <p><strong>Client:</strong> {commande.utilisateur?.nom} {commande.utilisateur?.prenom}</p>
                    {commande.lieu && (
                      <p><strong>Livraison:</strong> {commande.lieu}</p>
                    )}
                  </div>
                  <div className="commande-id">Commande #{commande._id.slice(-6).toUpperCase()}</div>
                </div>

                <ul className="produits-list">
                  {commande.produitsVendeur.map((p, i) => (
                    <li key={i} className="produit-item">
                      <div className="produit-info">
                        <h4>{p.produit?.nom || 'Produit inconnu'}</h4>
                        <div className="produit-details">
                          <span>Quantité: {p.quantite}</span>
                          <span>Prix: {p.produit?.prix || 0} DA</span>
                          <span className="produit-total">Total: {(p.produit?.prix || 0) * p.quantite} DA</span>
                        </div>
                      </div>

                      <div className="produit-actions">
                        {!p.envoyer ? (
                          <button
                            onClick={() => handleMarquerEnvoye(commande._id, p.produit?._id)}
                            className="envoyer-btn"
                          >
                            Marquer comme envoyé
                          </button>
                        ) : (
                          <span className="envoye-badge">✔ Envoyé</span>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="commande-footer">
                  <div className="total-commande">
                    Total commande: {commande.totalVendeur} DA
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Section Commandes complétées */}
        <div className="commandes-section completee-section">
          <h3>Commandes expédiées ({commandesCompletees.length})</h3>
          {commandesCompletees.length === 0 ? (
            <p className="aucune-commande">Aucune commande expédiée pour le moment.</p>
          ) : (
            commandesCompletees.map((commande) => (
              <div key={commande._id} className="commande-card completee">
                <div className="commande-header">
                  <div className="commande-info">
                    <p><strong>Date:</strong> {commande.dateFormatee}</p>
                    <p><strong>Client:</strong> {commande.utilisateur?.nom} {commande.utilisateur?.prenom}</p>
                    {commande.lieu && (
                      <p><strong>Livraison:</strong> {commande.lieu}</p>
                    )}
                  </div>
                  <div className="commande-id">Commande #{commande._id.slice(-6).toUpperCase()}</div>
                </div>

                <ul className="produits-list">
                  {commande.produitsVendeur.map((p, i) => (
                    <li key={i} className="produit-item">
                      <div className="produit-info">
                        <h4>{p.produit?.nom || 'Produit inconnu'}</h4>
                        <div className="produit-details">
                          <span>Quantité: {p.quantite}</span>
                          <span>Prix: {p.produit?.prix || 0} DA</span>
                          <span className="produit-total">Total: {(p.produit?.prix || 0) * p.quantite} DA</span>
                        </div>
                      </div>
                      <div className="produit-actions">
                        <span className="envoye-badge">✔ Envoyé</span>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="commande-footer">
                  <div className="total-commande">
                    Total commande: {commande.totalVendeur} DA
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};