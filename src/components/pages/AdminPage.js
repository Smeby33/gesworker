import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import AdminDashboard from '../Admin/AdminDashboard';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Navbar from '../Intervenant/Navbar';
import RecentActivities from '../Admin/RecentActivities';
import { getAuth } from "firebase/auth";
import '../css/AdminPage.css';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AdminPage() {
  const [adminData, setAdminData] = useState({
    name: '',
    email: '',
    company_name: '',
    profile_picture: ''
  });
  const [showRecentActivities, setShowRecentActivities] = useState(false);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();

  useEffect(() => {
    const fetchAdminData = async () => {
      if (auth.currentUser) {
        try {
          const adminUID = auth.currentUser.uid;
          const response = await axios.get(`http://localhost:5000/users/getUser/${adminUID}`);
          
          if (response.data) {
            setAdminData({
              name: response.data.name || 'Administrateur',
              email: response.data.email,
              company_name: response.data.company_name || 'Votre entreprise',
              profile_picture: response.data.profile_picture
            });
          }
        } catch (err) {
          console.error("Erreur lors de la récupération des données:", err);
          toast.error(err.response?.data?.error || "Erreur lors du chargement des données");
        } finally {
          setLoading(false);
        }
      }
    };

    fetchAdminData();
  }, [auth.currentUser]);

  const toggleRecentActivities = () => {
    setShowRecentActivities(prev => !prev);
  };

  if (loading) {
    return (
      <div className="AdminPage">
        <div className="divnav">
          <Navbar />
        </div>
        <div className="loading-container">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Chargement...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="AdminPage">
      <div className="divnav">
        <Navbar profilePicture={adminData.profile_picture} />
      </div>
      <div className="AdminPagemain">
        <header className="admin-header">
          <h1 className="welcome-title">
            Bienvenue {adminData.name} dans votre tableau de bord
          </h1>
          <p className="company-name">{adminData.company_name}</p>
        </header>

        <div className="btnshow">
          <button
            id="toggle-buttonrecent"
            className="nav-button"
            onClick={toggleRecentActivities}
            aria-expanded={showRecentActivities}
          >
            {showRecentActivities ? (
              <>
                <FaEyeSlash className="btnnavicon" />
                <span className="nav-link">Masquer l'historique</span>
              </>
            ) : (
              <>
                <FaEye className="btnnavicon" />
                <span className="nav-link">Afficher l'historique</span>
              </>
            )}
          </button>
        </div>

        {showRecentActivities && (
          <div className="company">
            <RecentActivities adminId={auth.currentUser?.uid} />
          </div>
        )}

        <AdminDashboard adminEmail={adminData.email} />
      </div>
    </div>
  );
}

export default AdminPage;