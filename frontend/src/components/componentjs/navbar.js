import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaUser, FaShoppingCart, FaSearch, FaShoppingBag } from "react-icons/fa";
import axios from "axios";
import "../componentcss/navbar.css";
import { searchProducts, registerUser, loginUser } from "../../api";
import { isUserConnected, logout } from "../../isUserConnected";
import { useCart } from "./CartContext";

const Navbar = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const { cart } = useCart() || { cart: [] };
  const [cartItemsCount, setCartItemsCount] = useState(0);

  useEffect(() => {
    if (isUserConnected()) {
      const count = cart.reduce((sum, item) => sum + (item.quantite || 0), 0);
      setCartItemsCount(count);
    } else {
      const count = cart.reduce((sum, item) => sum + (item.quantite || 0), 0);
      setCartItemsCount(count);
    }
  }, [cart]);

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      return;
    }

    const fetchResults = async () => {
      const data = await searchProducts(query);
      setResults(data);
    };

    fetchResults();
  }, [query]);

  const handleLogout = () => {
    const confirmation = window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?");
    if (confirmation) {
      logout();
      navigate("/acceuil"); 
      window.location.reload();
    }
  };

  return (
    <div className="navbar-container">
      <div className="navbar-wrapper">
        <div className="navbar-left">
          <Link to="/acceuil" className="navbar-logo">
            FurnishUp
          </Link>
        </div>

        <div className="navbar-center">
          <form
            className="search-container"
            onSubmit={(e) => e.preventDefault()}
          >
            <input
              type="text"
              placeholder="Rechercher..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (query.trim() !== "") {
                    navigate(`/ListeProduitsPage?q=${query}`);
                    setResults([]);
                  }
                }
              }}
              className="search-input"
            />
            <FaSearch className="search-icon" />
          </form>
          {query.trim() !== "" && (
            <div className="search-results">
              {results.length > 0 ? (
                results.map((product) => (
                  <div key={product._id} className="search-item" onClick={() => { navigate("/details", { state: product }); setQuery(""); setResults([]) }}>
                    <Link to={`/produit/${product._id}`} className="search-link">
                      <img
                        src={`https://furnishup-backend.onrender.com/${product.images[0]}`}
                        alt={product.nom}
                        className="cart-item-image"
                      />
                      <div className="search-text">
                        <p>{product.nom}</p>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <p style={{ color: "black", fontWeight: "bold" }}>Produit n'existe pas</p>
              )}
            </div>
          )}
        </div>

        <div className="navbar-right">
          <Link 
            to="/acceuil" 
            title="Acceuil"
            className={`icon-link ${location.pathname === "/acceuil" ? "active-icon" : ""}`}
          >
            <FaHome />
          </Link>
          <div className="cart-icon-container">
            <Link 
              to="/panier" 
              title="Mon panier"
              className={`icon-link ${location.pathname === "/panier" ? "active-icon" : ""}`}
            >
              <FaShoppingCart />
              {cartItemsCount > 0 && (
                <span className="cart-badge">{cartItemsCount}</span>
              )}
            </Link>
          </div>
          {isUserConnected() && (
            <Link 
              to="/acheter"
              title="Mes Commandes"
              className={`icon-link ${location.pathname === "/acheter" ? "active-icon" : ""}`} 
            >
              <FaShoppingBag />
            </Link>
          )}
          {isUserConnected() ? (
            <div className="user-menu" ref={dropdownRef}>
              <FaUser
                className={`icon-link ${location.pathname === "/profil" ? "active-icon" : ""}`}
                onClick={() => setShowDropdown(!showDropdown)}
              />
              {showDropdown && (
                <div className="dropdown-menu">
                  <Link 
                    to="/profil" 
                    className={`dropdown-item ${location.pathname === "/profil"}`}
                  >
                    mon profil
                  </Link>
                  <button className="button" onClick={handleLogout}>Se deconnecter</button>
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="user-menu" ref={dropdownRef}>
                <FaUser
                  className="icon-link"
                  onClick={() => setShowDropdown(!showDropdown)}
                />
                {showDropdown && (
                  <div className="dropdown-menu">
                    <Link 
                      to="/login" 
                      className={`dropdown-item ${location.pathname === "/login" ? "active-icon" : ""}`}
                    >
                      Se connecter
                    </Link>
                    <Link 
                      to="/inscription" 
                      className={`dropdown-item ${location.pathname === "/inscription" ? "active-icon" : ""}`}
                    >
                      S'inscrire
                    </Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;