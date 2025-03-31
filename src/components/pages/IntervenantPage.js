import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RecentActivities from '../Intervenant/RecentActivitiesinter';
import IntervenantDashboard from '../Intervenant/IntervenantDashboard';
import { getAuth } from "firebase/auth";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios'; // Importez axios
import Navbar from '../Intervenant/Navbar_intervenant';
import '../css/IntervenantPage.css';

function IntervenantPage() {
  const navigate = useNavigate();
  const [intervenantName, setIntervenantName] = useState('');
  const [showRecentActivities, setShowRecentActivities] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const auth = getAuth();
  
  

  useEffect(() => {
    const fetchIntervenantData = async () => {
      if (auth.currentUser) {
        setAdminEmail(auth.currentUser.email);
        const adminUID = auth.currentUser.uid;
      try {
        // Récupérer l'ID de l'utilisateur depuis le localStorage ou l'état d'authentification
        

        // Appel à l'API backend
        const response = await axios.get(`http://localhost:5000/intervenants/recupererun/${adminUID}`);
        
        // Mettre à jour l'état avec les données reçues
        setIntervenantName(response.data.name); // Utilisez le champ approprié (name ou username)
        
      } catch (err) {
        console.error("Erreur lors de la récupération des données:", err);
        setError(err.response?.data?.error || "Erreur lors du chargement des données");
        // Redirection si l'intervenant n'est pas trouvé
        if (err.response?.status === 404) {
          navigate('/auth'); // ou une page d'erreur appropriée
        }
      } finally {
        setLoading(false);
      }
    }
  };

    fetchIntervenantData();
  }, [auth.currentUser]);

  const toggleRecentActivities = () => {
    setShowRecentActivities((prev) => !prev);
  };

  if (loading) {
    return <div className="loading">Chargement en cours...</div>;
  }

  if (error) {
    return <div className="error">Erreur: {error}</div>;
  }

  return (
    <div fluid className="AdminPage">
      <div className="divnav">
        <Navbar />
      </div>
      <div className="AdminPagemain">
        <h1 className='animationh3a'>
          Bienvenue intervenant {intervenantName} dans votre tableau de bord 
        </h1>
        {/* <div className="btnshow">
          <button
            id="toggle-buttonrecent"
            className="nav-button"
            onClick={toggleRecentActivities}
          >
            {showRecentActivities ? <FaEyeSlash className="btnnavicon" /> : <FaEye className="btnnavicon" />}
            <a className="nav-link"> Historiques</a>
          </button>
        </div> */}
        {showRecentActivities && (
          <div className="company">
            <RecentActivities />
          </div>
        )}
        <IntervenantDashboard />
      </div>
    </div>
  );
}

export default IntervenantPage;