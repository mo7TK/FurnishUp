import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../pagescss/detailsproduit.css";
import Navbar from '../../components/componentjs/navbar';
import { isUserConnected } from "../../isUserConnected";
import { ajouterCommentaire, getVendeur, deleteProduit, validerProduit, getUserById,createCommande  } from "../../api";
import { useCart } from "../../components/componentjs/CartContext";

const DetailsProduit = () => {
  const location = useLocation();
  const produit = location.state;
  const [commentaire, setCommentaire] = useState("");
  const [note, setNote] = useState(5);
  const [vendeurNom, setVendeurNom] = useState("Vendeur inconnu");
  const [commentaires, setCommentaires] = useState(produit.commentaires || []);
  const [mainImage, setMainImage] = useState(produit.images[0]);
  const [userNames, setUserNames] = useState({});
  const [enStock, setEnStock] = useState(produit.quantite_disponible > 0);

  const { addToCart } = useCart() || { addToCart: () => {} };
  const navigate = useNavigate();
  const userId = localStorage.getItem("userid");
  const isVendeur = userId === produit.vendeur_id;
  const isAdmin = userId === "67d58664c14a211ded9e25ed";

  // Fonction pour récupérer le nom d'un utilisateur
  const fetchUserName = async (userId) => {
    if (!userNames[userId]) {
      try {
        const userData = await getUserById(userId);
        setUserNames(prev => ({
          ...prev,
          [userId]: userData.nom || "Utilisateur inconnu"
        }));
      } catch (error) {
        console.error("Erreur lors de la récupération du nom:", error);
        setUserNames(prev => ({
          ...prev,
          [userId]: "Utilisateur inconnu"
        }));
      }
    }
  };

  // Au montage, charger les noms des utilisateurs qui ont commenté
  useEffect(() => {
    const fetchAllCommenters = async () => {
      if (produit.commentaires) {
        const uniqueUserIds = [...new Set(produit.commentaires.map(c => c.utilisateur_id))];
        await Promise.all(uniqueUserIds.map(fetchUserName));
      }
    };

    fetchAllCommenters();

    // Récupérer le nom du vendeur
    const fetchVendeur = async () => {
      if (produit.vendeur_id) {
        const data = await getVendeur(produit.vendeur_id);
        if (data.success) {
          setVendeurNom(data.vendeur.nom);
        }
      }
    };
    fetchVendeur();

    // Vérifier le stock
    setEnStock(produit.quantite_disponible > 0);
  }, [produit]);

  const handleCommentSubmit = async () => {
    if (!commentaire.trim()) return alert("Le commentaire ne peut pas être vide");
    
    const result = await ajouterCommentaire(produit._id, commentaire, note);

    if (result.success) {
      const currentUserName = localStorage.getItem("username") || "Utilisateur inconnu";
      
      const newComment = {
        utilisateur_id: userId,
        commentaire,
        note,
      };
      
      setCommentaires(prev => [newComment, ...prev]);
      setUserNames(prev => ({
        ...prev,
        [userId]: currentUserName
      }));
      
      setCommentaire("");
      setNote(5);
      alert("Commentaire ajouté !");
    } else {
      alert(result.message);
    }
  };

  const handleDeleteProduit = async () => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      const result = await deleteProduit(produit._id);
      if (result.success) {
        alert("Produit supprimé avec succès !");
        navigate(-1);
      } else {
        alert(`Erreur : ${result.message}`);
      }
    }
  };

  const handleValiderProduit = async () => {
    const result = await validerProduit(produit._id);
    if (result.success) {
      alert("Produit validé avec succès !");
      navigate("/ValidationDesProduits");
    } else {
      alert(`Erreur : ${result.message}`);
    }
  };

 const handleAcheterMaintenant = async () => {
  if (isUserConnected()) {
    try {
      // Create the command with proper field names
      const result = await createCommande(
        [{ produitId: produit._id, quantite: 1 }], // Note: produitId instead of produit
        produit.prix,
        localStorage.getItem("userid")
      );

      if (result.success) {
        // Prepare checkout data
        const commande = {
          _id: result.commande._id, // Use the returned commande
          produits: [{ produit, quantite: 1 }],
          total: produit.prix,
          firstname: localStorage.getItem("username") || "",
          lastname: localStorage.getItem("userlastname") || "",
          address: localStorage.getItem("useraddress") || "",
        };

        navigate("/checkout", { state: { commande } });
      } else {
        throw new Error(result.message || "Failed to create command");
      }
    } catch (error) {
      console.error("Error:", error);
      alert(`Failed: ${error.message}`);
    }
  } else {
    const confirmRedirect = window.confirm("Please login to purchase this product.");
    if (confirmRedirect) {
      navigate("/login");
    }
  }
};

  const handleAddToCart = () => {
    if (!enStock) return;
    
    addToCart(produit);
    alert(`${produit.nom} a été ajouté au panier`);
  };

  return (
    <div>
      {!isAdmin && <Navbar />}

      <div className="details-container">
        <div className="top-section">
          <div className="image-section">
            <div className="main-image-container">
              <img src={`http://localhost:5005/${mainImage}`} alt={produit.nom} className="main-image" />
            </div>
            <div className="thumbnails">
              {produit.images.filter(img => img !== mainImage).map((img, i) => (
                <img
                  key={i}
                  src={`http://localhost:5005/${img}`}
                  alt={`${produit.nom} ${i}`}
                  className={`thumbnail ${mainImage === img ? 'active-thumbnail' : ''}`}
                  onClick={() => setMainImage(img)}
                />
              ))}
            </div>
          </div>

          <div className="info-section">
            <h1>{produit.nom}</h1>
            <p className="prix">{produit.prix} DA</p>
            <p className="vendeur"><span className="badge">Vendu par:</span> {vendeurNom}</p>
            <p className="description">{produit.description}</p>

            <div className={`stock-status ${enStock ? 'in-stock' : 'out-of-stock'}`}>
              {enStock ? 
                `En stock (${produit.quantite_disponible} disponible(s))` : 
                "Rupture de stock"}
            </div>

            <div className="info-details">
              <div className="left-info">
                <p><strong>Catégorie:</strong> {produit.categorie}</p>
                <p><strong>Couleur:</strong> {produit.couleur}</p>
                <p><strong>Matériau:</strong> {produit.materiau}</p>
                <p><strong>État:</strong> {produit.etat}</p>
              </div>
              {produit.dimensions && (
                <div className="right-info">
                  {produit.dimensions.largeur && <p><strong>Largeur:</strong> {produit.dimensions.largeur}cm</p>}
                  {produit.dimensions.hauteur && <p><strong>Hauteur:</strong> {produit.dimensions.hauteur}cm</p>}
                  {produit.dimensions.profondeur && <p><strong>Profondeur:</strong> {produit.dimensions.profondeur}cm</p>}
                </div>
              )}
            </div>

            <div className="buttons">
              {isVendeur ? (
                <>
                  <button className="ajouter-panier" onClick={() => navigate(`/modifier/${produit._id}`, { state: { produit } })}>
                    Modifier 📝
                  </button>
                  <button className="acheter-direct" onClick={handleDeleteProduit}>
                    Supprimer 🗑️
                  </button>
                </>
              ) : isAdmin ? (
                <>
                  <button className="ajouter-panier" onClick={handleValiderProduit}>
                    Valider ✅
                  </button>
                  <button className="acheter-direct" onClick={handleDeleteProduit}>
                    Supprimer 🗑️
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className={`ajouter-panier ${!enStock ? 'disabled' : ''}`}
                    onClick={handleAddToCart}
                    disabled={!enStock}
                  >
                    {enStock ? "Ajouter au panier 🛒" : "Indisponible"}
                  </button>
                  <button
                    className={`acheter-direct ${!enStock ? 'disabled' : ''}`}
                    onClick={handleAcheterMaintenant}
                    disabled={!enStock}
                  >
                    {enStock ? "Acheter maintenant 💳" : "Indisponible"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="commentaires-section">
          {produit.valider ? (
            <>
              <h2>Commentaires</h2>
              {commentaires.length > 0 ? (
                commentaires.map((comment, i) => (
                  <div key={i} className="commentaire">
                    <p className="comment-user">
                      <strong>{userNames[comment.utilisateur_id] || "Chargement..."}</strong>
                    </p>
                    <div className="stars">
                      {Array.from({ length: comment.note }, (_, i) => <span key={i}>⭐</span>)}
                    </div>
                    <p className="comment-text">{comment.commentaire}</p>
                  </div>
                ))
              ) : (
                <p className="no-comments">Aucun commentaire pour ce produit.</p>
              )}

              {isUserConnected() ? (
                <>
                  <textarea
                    value={commentaire}
                    onChange={(e) => setCommentaire(e.target.value)}
                    placeholder="Écrire un commentaire..."
                    className="comment-input"
                  />
                  <div className="rating-section">
                    <p>Note :</p>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className={`star ${note === n ? "selected" : ""}`}
                        onClick={() => setNote(n)}
                      >
                        ⭐
                      </span>
                    ))}
                  </div>
                  <button className="envoyer-commentaire" onClick={handleCommentSubmit}>
                    Envoyer
                  </button>
                </>
              ) : (
                <button className="envoyer-commentaire" onClick={() => navigate("/login")}>
                  Connectez-vous pour commenter
                </button>
              )}
            </>
          ) : (
            <p className="no-comments"></p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DetailsProduit;