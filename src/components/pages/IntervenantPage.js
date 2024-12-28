import React   from 'react';
import   { useEffect ,useState}  from 'react';
import { useNavigate } from 'react-router-dom';
import RecentActivities from '../Intervenant/RecentActivitiesinter'; // Import du nouveau composant
import IntervenantDashboard from '../Intervenant/IntervenantDashboard';
import Navbar from '../Intervenant/Navbar_intervenant';
import '../css/IntervenantPage.css';

function IntervenantPage() {
  const navigate = useNavigate();
  const [intervenantName, setIntervenantName] = useState('');


  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser ) {
      setIntervenantName(currentUser.username); // Utilise 'username' si c'est le champ utilisé dans le handleLogin
    }
  }, []);

  return (
    <div fluid className="AdminPage">
      <div className="divnav">
        <Navbar />
      </div>
      <div className="AdminPagemain">
        <h1 className='animationh3a'>
          Bienvenue intervenant {intervenantName}  dans votre tableau de bord 
        </h1>
        <div className="company">
          <RecentActivities /> {/* Inclusion du nouveau composant */}
        </div>
        <IntervenantDashboard />
      </div>
    </div>
  );
}

export default IntervenantPage;
