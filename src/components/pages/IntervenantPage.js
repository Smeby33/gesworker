import React   from 'react';
import   { useEffect ,useState}  from 'react';
import { useNavigate } from 'react-router-dom';
import RecentActivities from '../Intervenant/RecentActivitiesinter'; // Import du nouveau composant
import IntervenantDashboard from '../Intervenant/IntervenantDashboard';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import Navbar from '../Intervenant/Navbar_intervenant';
import '../css/IntervenantPage.css';

function IntervenantPage() {
  const navigate = useNavigate();
  const [intervenantName, setIntervenantName] = useState('');
  const [showRecentActivities, setShowRecentActivities] = useState(false); // État pour gérer la visibilité



  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser ) {
      setIntervenantName(currentUser.username); // Utilise 'username' si c'est le champ utilisé dans le handleLogin
    }
  }, []);
  const toggleRecentActivities = () => {
    setShowRecentActivities((prev) => !prev);
  };

  return (
    <div fluid className="AdminPage">
      <div className="divnav">
        <Navbar />
      </div>
      <div className="AdminPagemain">
        <h1 className='animationh3a'>
          Bienvenue intervenant {intervenantName}  dans votre tableau de bord 
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
        <IntervenantDashboard />
      </div>
    </div>
  );
}

export default IntervenantPage;
