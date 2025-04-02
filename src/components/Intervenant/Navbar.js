import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getAuth, signOut } from "firebase/auth";
import { 
  FaTachometerAlt, FaTasks, FaUserShield, FaUserTie, FaSignInAlt, FaDiagnoses, 
  FaStreetView, FaUserPlus, FaBuilding, FaFileMedical, FaCalendarAlt 
} from 'react-icons/fa';
import Modal from 'react-modal';
import Dashboard from '../Admin/Dashbord'; 
import TaskCategories from './TaskCategories'; 
import ProfilePicture from '../Admin/ProfilePicture';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/Navbar.css';

// Configuration de l'élément principal pour l'accessibilité
Modal.setAppElement('#root');

function Navbar() {
  const [adminEmail, setAdminEmail] = useState('');
  const [tasks, setTasks] = useState([]);
  const [intervenants, setIntervenants] = useState([]);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isActionsOpen, setIsActionsOpen] = useState(false);

  const auth = getAuth();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));

  // Fonction de déconnexion
  const onLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("currentUser");

      toast.success("Vous êtes maintenant déconnecté.");
      navigate("/");
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
      toast.error("Erreur lors de la déconnexion !");
    }
  };

  // Récupération des tâches et intervenants liés à l'admin
  useEffect(() => {
    if (auth.currentUser) {
      setAdminEmail(auth.currentUser.email);
      const adminUID = auth.currentUser.uid;

      const fetchData = async () => {
        try {
          const [tasksRes, intervenantsRes] = await Promise.all([
            fetch(`https://gesworkerback.onrender.com/taches/tasks-by-owner/${adminUID}`),
            fetch(`https://gesworkerback.onrender.com/intervenants/recuperertout/${adminUID}`)
          ]);

          setTasks(await tasksRes.json());
          setIntervenants(await intervenantsRes.json());
        } catch (error) {
          console.error("Erreur lors de la récupération des données :", error);
        }
      };

      fetchData();
    }
  }, []);

  // Gestion des redirections
  const handleIntervenantClick = () => {
    if (!currentUser) {
      toast.warn('Veuillez vous authentifier pour accéder à cette page.');
      navigate('/auth', { state: { redirectTo: '/intervenant' } });
    } else {
      navigate('/intervenant');
    }
  };

  const handleAdminClick = () => {
    if (!currentUser) {
      toast.warn('Veuillez vous authentifier pour accéder à cette page.');
      navigate('/auth');
    } else if (currentUser.isAdmin) {
      navigate('/admin');
    } else {
      toast.error("Vous n'avez pas les droits d'accès en tant qu'administrateur.");
    }
  };

  return (
    <nav className='navb'>
      <ToastContainer />

      <div className="navbar-list">
        <div className="separation">
        {/* Photo de profil */}
        <ProfilePicture />

        {/* Bouton Admin */}
        <div className="btnnav">
          <button className="navb-button"  onClick={onLogout}>
            <Link to="/admin" className="nav-link">
              <FaUserShield /> Admin
            </Link>
          </button>
        </div>

        {/* Bouton Intervenant */}
        <button  className="navb-button" onClick={onLogout}>
          <div className="nav-link">
            <FaDiagnoses /> Intervenant
          </div>
        </button>
        </div>

        {/* Bouton Connexion/Déconnexion */}
        <div>
          {auth.currentUser ? (
            <button className="navb-button" onClick={onLogout}>
              <div className="nav-link">
                <FaSignInAlt /> Déconnexion
              </div>
            </button>
          ) : (
            <button className="navb-button" onClick={() => navigate('/')}>
              <div className="nav-link">
                <FaSignInAlt /> Se connecter
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Modal - Tableau de bord */}
      <Modal
        isOpen={isDashboardOpen}
        onRequestClose={() => setIsDashboardOpen(false)}
        contentLabel="Tableau de bord"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <button onClick={() => setIsDashboardOpen(false)} className="close-button">X</button>
        <Dashboard />
      </Modal>

      {/* Modal - Nos actions */}
      <Modal
        isOpen={isActionsOpen}
        onRequestClose={() => setIsActionsOpen(false)}
        contentLabel="Nos actions"
        className="modal-content"
        overlayClassName="modal-overlay"
      >
        <button onClick={() => setIsActionsOpen(false)} className="close-button">X</button>
        <TaskCategories />
      </Modal>
    </nav>
  );
}

export default Navbar;
