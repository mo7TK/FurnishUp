import React, { useEffect, useState } from "react";
import Navbar from "../../components/componentjs/navbar";
import { getCommandesConfirmees } from "../../api"; 
import "../pagescss/acheter.css";
import {FaShoppingBag } from "react-icons/fa";

export const Acheter = () => {
  const [commandes, setCommandes] = useState([]);
  const userId = localStorage.userid;
  const isAdmin = userId === "67d58664c14a211ded9e25ed";
  useEffect(() => {
    const fetchCommandes = async () => {
      try {
        const toutesCommandes = await getCommandesConfirmees();
        
        // Filtre pour ne garder que celles de l'utilisateur connecté
        const userCommandes = toutesCommandes.filter(
          commande => commande.utilisateur === userId
        );
        
        // Trie les commandes par date (du plus récent au plus ancien)
        const commandesTriees = userCommandes.sort((a, b) => {
          const dateA = new Date(a.dateConfirmation || a.date);
          const dateB = new Date(b.dateConfirmation || b.date);
          return dateB - dateA; // Ordre décroissant
        });
        
        setCommandes(commandesTriees);
      } catch (error) {
        console.error("Erreur lors du chargement des commandes :", error);
      }
    };
    
    fetchCommandes();
  }, [userId]);

  return (
    <div>
      {!isAdmin && <Navbar />}
      <div className="acheter-container">
        {commandes.length === 0 ? (
          <div className="panier-vide-container">
            <FaShoppingBag size={100} className="panier-vide-icon" />
            <p className="panier-vide-message">Vous n'avez aucune commande confirmée ou envoyée pour le moment</p>
          </div>
        ) : (
          <>
            <h2>Mes Commandes</h2>
            {commandes.map((commande) => (
              <div key={commande._id} className="commande-card">
                <h3>Commande #{commande._id.slice(-6).toUpperCase()}</h3>
                <p>Statut : {commande.statut}</p>
                {commande.dateConfirmation && (
                  <p>Date : {new Date(commande.dateConfirmation).toLocaleDateString()}</p>
                )}
                {commande.lieu && (
                  <div className="livraison-info" style={{overflow: 'auto'}}>
                    <h4 style={{float: "left", margin: '0', marginRight: '10px'}}>Adresse de livraison :</h4>  
                    <p style={{float: 'left', margin: '0'}}>{commande.lieu}</p>
                  </div>
                )}
                <ul>
                  {commande.produits.map((p, i) => (
                    <li key={i}>
                      {p.produit?.nom} - Quantité : {p.quantite} - Prix : {(p.produit?.prix || 0) * p.quantite} DA
                    </li>
                  ))}
                </ul>
                <p className="total">
                  Total : {commande.produits.reduce(
                    (acc, p) => acc + (p.produit?.prix || 0) * p.quantite, 
                    0
                  )} DA
                </p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
	
