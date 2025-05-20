import { useEffect, useState } from "react";
import { getUser, getCommentairesByUser, getUserById, updateUserInfos, getUserProducts, getUserProductsnnvalide ,deleteComment }  from "../../api";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { FaUserCircle, FaBoxOpen  } from "react-icons/fa";
import { FiEdit, FiPlus,FiShoppingBag } from "react-icons/fi";
import "../pagescss/profil.css";
import Navbar from "../../components/componentjs/navbar";
import ListeProduitsByID from "../../components/componentjs/ListeProduitsByID";
import { useNavigate, useParams } from "react-router-dom";
import { FaComment, FaStar, FaTrash } from "react-icons/fa";

const validationSchema = Yup.object().shape({
  nom: Yup.string().required("Nom requis").min(3),
  lastname: Yup.string().required("Prénom requis").min(2),
  address: Yup.string().required("Adresse requise").min(5),
  email: Yup.string().required("Email requis").email(),
  password: Yup.string()
    .min(6)
    .transform((value) => (value === "" ? undefined : value))
    .notRequired(),
});

export default function Profil() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [produits, setProduits] = useState([]);
  const [produitsnnvalide, setProduitsnnvalide] = useState([]);
  const [showEditForm, setShowEditForm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { id } = useParams();
  const userId = localStorage.getItem("userid");
  const isCurrentUser = !id || id === userId;
  const [commentaires, setCommentaires] = useState([]);
  const [loadingCommentaires, setLoadingCommentaires] = useState(false);
  const isAdmin = userId === "67d58664c14a211ded9e25ed";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(validationSchema),
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData = id ? await getUserById(id) : await getUser();

        if (userData) {
          setUser(userData);
          setValue("nom", userData.nom);
          setValue("lastname", userData.lastname);
          setValue("address", userData.address);
          setValue("email", userData.email);

          const userProducts = await getUserProducts(userData._id);
          const userProductsnnvalide = await getUserProductsnnvalide(userData._id);
          setProduits(userProducts);
          setProduitsnnvalide(userProductsnnvalide);
        }

        if (id) {
          setLoadingCommentaires(true);
          const userCommentaires = await getCommentairesByUser(id);
          setCommentaires(userCommentaires);
          setLoadingCommentaires(false);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        setLoadingCommentaires(false);
      }
    };

    fetchUser();
  }, [id, setValue]);


  const handleDeleteComment = async (produitId, commentId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce commentaire ?")) {
      return;
    }

    try {
      const data = await deleteComment(produitId, commentId);

      const updatedCommentaires = commentaires.map(produit => {
        if (produit._id === produitId) {
          return {
            ...produit,
            commentaires: produit.commentaires.filter(c => c._id !== commentId)
          };
        }
        return produit;
      }).filter(produit => produit.commentaires.length > 0);

      setCommentaires(updatedCommentaires);
      alert(data.message || "Commentaire supprimé avec succès");
    } catch (error) {
      console.error("Erreur:", error);
      alert(error.response?.data?.message || "Une erreur s'est produite");
    }
  };

  const onSubmit = async (data) => {
    try {
      const updated = await updateUserInfos(data);
      setUser(updated);
      setMessage("Profil mis à jour !");
      setError("");
      setShowEditForm(false);
      window.alert("Vos informations ont été mises à jour avec succès !");
    } catch (err) {
      setError("Erreur lors de la mise à jour.");
      setMessage("");
    }
  };

  if (!user) return <p className="loading">Chargement...</p>;

  return (
    <div>
      {!isAdmin && <Navbar />}


      <div className="profil-wrapper">
        <div className="profil-header">
          <div className="avatar">
            <FaUserCircle size={80} />
          </div>
          <div className="profil-info">
            <h2>{user.nom} {user.lastname}</h2>
            <p>{produits.length} {produits.length === 1 ? "produit" : "produits"} en vente</p>
            <div className="profil-actions">
              {isCurrentUser && (
                <>
                  <button onClick={() => setShowEditForm(true)} title="Modifier mes informations">
                    <FiEdit />
                  </button>
                  <button title="Ajouter un produit" onClick={() => navigate("/ajoutproduit")}>
                    <FiPlus />
                  </button>
                  <button title="Mes Ventes" onClick={() => navigate("/commandes")}>
                    <FiShoppingBag />
                  </button>

                </>
              )}
            </div>
          </div>
        </div>

        {showEditForm && (
          <form className="profil-form" onSubmit={handleSubmit(onSubmit)}>
            <input type="text" placeholder="Nom" {...register("nom")} />
            {errors.nom && <p className="error">{errors.nom.message}</p>}
            <input type="text" placeholder="Prénom" {...register("lastname")} />
            {errors.lastname && <p className="error">{errors.lastname.message}</p>}
            <input type="text" placeholder="Adresse" {...register("address")} />
            {errors.address && <p className="error">{errors.address.message}</p>}
            <input type="email" placeholder="Email" {...register("email")} />
            {errors.email && <p className="error">{errors.email.message}</p>}
            <input type="password" placeholder="Nouveau mot de passe" {...register("password")} />
            {errors.password && <p className="error">{errors.password.message}</p>}
            <button type="submit" className="submit-btnn">Mettre à jour</button>
            {message && <p className="message">{message}</p>}
            {error && <p className="error">{error}</p>}
          </form>
        )}
      </div>

      <div className="titre-produits">
        <h3>
          <FaBoxOpen />
          {isCurrentUser ? "Mes produits" : `Produits de ${user.nom}`}
        </h3>
      </div>
      {produits.length === 0 ? (
        <p className="no-products">Aucun produit mis en vente.</p>
      ) : (
        <ListeProduitsByID produits={produits} setProduits={setProduits} />
      )}

      {isCurrentUser && (
        <>
          <div className="titre-produits">
            <h3>
              <FaBoxOpen />
              Mes produits en attente de validation 
            </h3>
          </div>
          {produitsnnvalide.length === 0 ? (
            <p className="no-products">Aucun produit en attente de validation.</p>
          ) : (
            <ListeProduitsByID produits={produitsnnvalide} setProduits={setProduitsnnvalide} />
          )}
        </>
      )}

      {id && !isCurrentUser && (
        <div className="commentaires-section">
          <h3>
            <FaComment /> Commentaires de {user.nom}
          </h3>

          {loadingCommentaires ? (
            <p>Chargement des commentaires...</p>
          ) : commentaires.length === 0 ? (
            <p className="no-comments">Cet utilisateur n'a pas encore posté de commentaires.</p>
          ) : (
            <div className="commentaires-list">
              {commentaires.map((produit) => (
                produit.commentaires.map((commentaire) => (
                  <div key={`${produit._id}-${commentaire._id}`} className="commentaire-card">
                    {/* Bouton de suppression en haut à droite */}
                    {(isCurrentUser || isAdmin) && (
                      <button
                        className="delete-comment-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteComment(produit._id, commentaire._id);
                        }}
                        title="Supprimer ce commentaire"
                      >
                        <FaTrash size={14} />
                      </button>
                    )}

                    <div
                      className="commentaire-produit"
                      onClick={() => {
                        const produitComplet = commentaires.find(p => p._id === produit._id);
                        navigate("/details", { state: produitComplet });
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      <img
                        src={`https://furnishup-backend.onrender.com/${produit.images[0]}`}
                        alt={produit.nom}
                        className="commentaire-image"
                      />
                      <h4>{produit.nom}</h4>
                    </div>

                    <div className="commentaire-content">
                      <div className="commentaire-note">
                        {[...Array(5)].map((_, i) => (
                          <FaStar
                            key={i}
                            className={i < commentaire.note ? "star-filled" : "star-empty"}
                          />
                        ))}
                      </div>
                      <p className="commentaire-text">{commentaire.commentaire}</p>
                      <p className="commentaire-date">
                        {new Date(commentaire.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}





