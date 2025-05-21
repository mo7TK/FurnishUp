import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  FaUserCircle, 
  FaBoxOpen, 
  FaUsers, 
  FaClipboardList, 
  FaCheckCircle, 
  FaTachometerAlt, 
  FaSignOutAlt,
  FaBars,
  FaTimes
} from "react-icons/fa";
import { logout } from "../../isUserConnected";
import "../componentcss/Sidebar.css";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  // Check window size when component mounts and when window resizes
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile && !sidebarOpen) {
        setSidebarOpen(true);
      } else if (mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarOpen]);

  const isActive = (path) => location.pathname === path;

  const handleAvatarClick = () => {
    navigate("/profilAdmin");
  };

  const handleLogout = () => {
    const confirmation = window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?");
    if (confirmation) {
      logout();
      navigate("/acceuil");
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <>
      <div className="hamburger-menu" onClick={toggleSidebar}>
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </div>
      <div className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="admin-profile">
          <div className="avatar" onClick={handleAvatarClick}>
            <FaUserCircle size={80} />
          </div>
          <p className="admin-name">Administrateur</p>
        </div>
        <ul>
          <li className={isActive("/Dashboard") ? "active" : ""}>
            <a onClick={() => { navigate("/Dashboard"); isMobile && setSidebarOpen(false); }}>
              <FaTachometerAlt /> <span>Dashboard</span>
            </a>
          </li>
          <li className={isActive("/ValidationDesProduits") ? "active" : ""}>
            <a onClick={() => { navigate("/ValidationDesProduits"); isMobile && setSidebarOpen(false); }}>
              <FaCheckCircle /> <span>Produits à valider</span>
            </a>
          </li>
          <li className={isActive("/tous-produits") ? "active" : ""}>
            <a onClick={() => { navigate("/tous-produits"); isMobile && setSidebarOpen(false); }}>
              <FaBoxOpen /> <span>Tous les produits</span>
            </a>
          </li>
          <li className={isActive("/utilisateurs") ? "active" : ""}>
            <a onClick={() => { navigate("/utilisateurs"); isMobile && setSidebarOpen(false); }}>
              <FaUsers /> <span>Utilisateurs</span>
            </a>
          </li>
          <li className={isActive("/AdminCommandes") ? "active" : ""}>
            <a onClick={() => { navigate("/AdminCommandes"); isMobile && setSidebarOpen(false); }}>
              <FaClipboardList /> <span>Mes Ventes</span>
            </a>
          </li>
          <li>
            <a onClick={handleLogout}>
              <FaSignOutAlt /> <span>Se déconnecter</span>
            </a>
          </li>
        </ul>
      </div>
      {sidebarOpen && isMobile && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
      )}
    </>
  );
};

export default Sidebar;