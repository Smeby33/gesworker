import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import AdminDashboard from '../Admin/AdminDashboard';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Navbar from '../Intervenant/Navbar';
import RecentActivities from '../Admin/RecentActivities'; // Import du composant
import '../css/AdminPage.css';

function AdminPage() {
  const [adminName, setAdminName] = useState('');
  const [showRecentActivities, setShowRecentActivities] = useState(false); // État pour gérer la visibilité

  // Récupérer le nom de l'administrateur depuis le localStorage
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.isAdmin) {
      setAdminName(currentUser.username); // Utilise 'username' si c'est le champ utilisé dans le handleLogin
    }
  }, []);

  // Fonction pour basculer la visibilité du composant RecentActivities
  const toggleRecentActivities = () => {
    setShowRecentActivities((prev) => !prev);
  };

  return (
    <div className="AdminPage">
      <div className="divnav">
        <Navbar />
      </div>
      <div className="AdminPagemain">
        <h1 className="animationh3a">
          Bienvenue administrateur {adminName} dans votre tableau de bord
        </h1>
        <div className="btnshow">
          <button
            id="toggle-buttonrecent"
            className="nav-button"
            onClick={toggleRecentActivities}
          >
            {showRecentActivities ? <FaEyeSlash className="btnnavicon"  /> : <FaEye className="btnnavicon"  />}
            <a  className="nav-link"> Historiques</a>
          </button>
        </div>
        {showRecentActivities && (
          <div className="company">
            <RecentActivities /> {/* Inclusion conditionnelle */}
          </div>
        )}
        <AdminDashboard />
      </div>
    </div>
  );
}

export default AdminPage;
