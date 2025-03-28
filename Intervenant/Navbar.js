import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaTasks,FaUserShield, FaUserTie, FaSignInAlt ,FaDiagnoses ,FaStreetView,FaUserPlus,FaBuilding,FaFileMedical ,FaCalendarAlt  } from 'react-icons/fa';
import Modal from 'react-modal';
import Dashboard from '../Admin/Dashbord'; // Assurez-vous que le chemin est correct
import TaskCategories from './TaskCategories'; // Assurez-vous que le chemin est correct
import ProfilePicture from '../Admin/ProfilePicture';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/Navbar.css'; // Assurez-vous que le chemin est correct

Modal.setAppElement('#root'); // Nécessaire pour l'accessibilité

function Navbar() {
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  const handleLogout = () => {
    // Suppression des données de l'utilisateur connecté dans le localStorage
    localStorage.removeItem('currentUser');
    
    // Message de confirmation de déconnexion
    toast.success("Vous êtes maintenant déconnecté.");

    // Rediriger l'utilisateur vers la page d'authentification
    navigate('/auth');
  };
  const navigate = useNavigate();

  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const openDashboard = () => setIsDashboardOpen(true);
  const closeDashboard = () => setIsDashboardOpen(false);

  const openActions = () => setIsActionsOpen(true);
  const closeActions = () => setIsActionsOpen(false);
  const handleIntervenantClick = () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')); // Récupère l'utilisateur connecté
  
    if (!currentUser) {
      // Si personne n'est connecté, redirige vers la page d'authentification
      toast.warn('Veuillez vous authentifier pour accéder à cette page.');
      
      navigate('/auth'); // Redirection vers la page d'authentification
    } else {
      // Si un utilisateur est connecté, autorise l'accès à la page intervenant
      navigate('/intervenant');
    }
    navigate('/auth', { state: { redirectTo: '/intervenant' } });

  };
  const handleAdminClick = () => {
    

    // Vérification si l'utilisateur est connecté
    if (!currentUser) {
      toast.alert('Veuillez vous authentifier pour accéder à cette page.');
        navigate('/auth');  // Redirige vers la page de connexion
    } 
    // Si l'utilisateur est administrateur
    else if (currentUser.isAdmin) {
        const shouldAccessIntervenant = toast.info('Voulez-vous accéder au tableau de bord de l\'intervenant ?');
        
        if (shouldAccessIntervenant) {
            navigate('/intervenant'); // L'administrateur choisit d'accéder à l'intervenant
        } else {
            navigate('/admin'); // Accès à la page admin
        }
    } 
    // Si l'utilisateur n'est pas un administrateur
    else {
      toast.error("Vous n'avez pas les droits d'accès en tant qu'administrateur.");
    }
};

  
  

  return (
    <nav>
      <div className="navbar-list">
      <ToastContainer />
      <ProfilePicture/>
      <div className="btnnav"> 
      <button  className="nav-button" onClick={handleAdminClick}>
        <Link to="/admin" className="nav-link"> <FaUserShield />  Admin</Link>
      </button>
      </div>
      <button onClick={handleIntervenantClick} className="nav-button">
          <div className="nav-link" >  <FaDiagnoses />  Intervenantdash </div>
      </button>
      <div>
  {currentUser ? (
     <Link to="/">
    <button
      className="nav-button"
      onClick={() => {
        handleLogout();
        navigate('/auth'); // Redirection après déconnexion
      }}
    >
      <div className="nav-link" >
      <FaSignInAlt /> Déconnexion
      </div>
    </button>
    </Link>
  ) : (
    <button
      className="nav-button"
      onClick={() => navigate('/auth')} // Redirection vers Auth pour connexion
    >
      <div className="nav-link" >
      <FaSignInAlt /> Se connecter
      </div>
    </button>
  )}
</div>

          {/* <a href="#tableau">
            <button  className="nav-button">
              <FaTachometerAlt />  Tableau de bord
            </button>
          </a>
          
          <div className="btnnav">
            <button  className="nav-button">
              <a href="#form-intervenant" className="nav-link"> <FaUserPlus />  Add Intervenant</a>
            </button>
          </div>
        
          <div className="btnnav">
            <button  className="nav-button">
              <a href="#Form-company" className="nav-link"> <FaBuilding  />  Add Entreprise</a>
            </button>
          </div>
          <div className="btnnav">
            <button  className="nav-button">
              <a href="#from-tache" className="nav-link"> <FaFileMedical/>  Add Tâches</a>
            </button>
          </div> */}
        </div>
          {/* onClick={openActions} onClick={openDashboard} */}
      
      

      {/* Modal pour le Tableau de bord */}
      <Modal
        isOpen={isDashboardOpen}
        onRequestClose={closeDashboard}
        contentLabel="Tableau de bord"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <button onClick={closeDashboard} className="close-button">X</button>
        <Dashboard /> {/* Composant du tableau de bord */}
      </Modal>

      {/* Modal pour Nos actions */}
      <Modal
        isOpen={isActionsOpen}
        onRequestClose={closeActions}
        contentLabel="Nos actions"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <button onClick={closeActions} className="close-button">X</button>
        <TaskCategories /> {/* Composant des catégories de tâches */}
      </Modal>
    </nav>
  );
}

export default Navbar;
