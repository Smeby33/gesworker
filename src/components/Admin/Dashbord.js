import React, { useState, useEffect } from 'react';
import { Container, Row } from 'react-bootstrap';
import { FaUsers, FaUserTie, FaCalendarAlt,FaTasks, FaUserGraduate, FaCheckCircle, FaHourglassHalf, FaExclamationTriangle } from 'react-icons/fa';
import Company from './Company';
import { signOut, getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import Intervenant from './Intervenant';
import TaskCategories from '../Intervenant/TaskCategories'; // Assurez-vous que le chemin est correct
import Tasks from './Tasks'; // Import du composant Tasks
import '../css/Dashboard.css';
import AllPerformanceTables from './AllPerformanceTables';
import axios from "axios";
import CustomCalendar from './CustomCalendar';
import { Await } from 'react-router-dom';

function Dashboard() {
  const [selectedView, setSelectedView] = useState('clients');
  const [taskStats, setTaskStats] = useState({});
  const [adminEmail, setAdminEmail] = useState('');
  const auth = getAuth();
  const [performances, setPerformances] = useState([]);
  const [countClients, setCountClients] = useState(0);
  const [countIntervenants, setCountIntervenants] = useState(0);
  const [showTaskStats, setShowTaskStats] = useState(false);
  const [countTasks, setCountTasks] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [countTaskCategories, setCountTaskCategories] = useState(0);
  // ^ minuscule ici
  
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchcountClients();
        fetchcountIntervenants();
      }
    });
  
    return () => unsubscribe();
  }, [auth]);
  
  // Fonction pour compter les clients
  const fetchcountClients = async () => {
    if (auth.currentUser) {
      setAdminEmail(auth.currentUser.email);
      const adminUID = auth.currentUser.uid;
      try {
        const response = await fetch(`http://localhost:5000/clients/client/${adminUID}`);
        const data = await response.json();
        setCountClients(data.length); // Met à jour l'état avec le nombre de clients
      } catch (error) {
        console.error("Erreur lors de la récupération des intervenants :", error);
      }
    }
  };
  
  
  useEffect(() => {
    fetchcountClients();
  }, []);

  const fetchcountIntervenants = async () => {
    if (auth.currentUser) {
      setAdminEmail(auth.currentUser.email);
      const adminUID = auth.currentUser.uid;
      try {
        const response = await fetch(`http://localhost:5000/intervenants/recuperertout/${adminUID}`);
        const data = await response.json();
        setCountIntervenants(data.length); // Met à jour l'état avec le nombre de clients
      } catch (error) {
        console.error("Erreur lors de la récupération des intervenants :", error);
      }
    }
  };
  
  
  useEffect(() => {
    fetchcountIntervenants();
  }, []);

  // Fonction pour compter les taskCategories
// 2. Modifiez légèrement la fonction fetch
const fetchcountTaskCategories = async () => {
  try {
    const response = await axios.get("http://localhost:5000/categories/toutescategories");
    setCountTaskCategories(response.data?.length || 0); // Ajout de la sécurité ?
  } catch (error) {
    console.error("Erreur:", error);
    setCountTaskCategories(0);
  }
};

// 3. useEffect corrigé
useEffect(() => {
  const fetchData = async () => {
    if (auth.currentUser) {
      await fetchcountTaskCategories();
    }
  };
  fetchData();
}, [auth.currentUser]);

    const fetchPerformances = async () => {
      if (auth.currentUser) {
        setAdminEmail(auth.currentUser.email);
        const adminUID = auth.currentUser.uid;
        try {
      
        const response = await fetch(`http://localhost:5000/performances/all/${adminUID}`);
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des performances");
        }
        const data = await response.json();
        setPerformances(data.length);
        console.log(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    };

    useEffect(() => {
    fetchPerformances();
  }, [auth.currentUser]);
  // Fonction pour compter les performances
  const countPerformances = () => {
    const performancesData = JSON.parse(localStorage.getItem('performance')) || [];
    return performancesData.length;
  };
  // Fonction pour compter les intervenants
  
  useEffect(() => {
    const fetchTaskCount = async () => {
      if (auth.currentUser) {
        setAdminEmail(auth.currentUser.email);
        const adminUID = auth.currentUser.uid;
        try {
          const response = await fetch(`http://localhost:5000/taches/tasks-by-owner/${adminUID}`);
          const data = await response.json();
          console.log("nous voulons les taches pour tout le monde ",data)
          setCountTasks(data.total);
          if (Array.isArray(data)) {
            setTasks(data);
            setCountTasks(data.length);
            setTaskStats(countTasksByStatus(data));
          }  // Met à jour l'état avec le nombre de tâches
        } catch (error) {
          console.error("Erreur lors du comptage des tâches :", error);
          setCountTasks(0);  // Définit 0 en cas d'erreur pour éviter un état vide
        }
      }
    };
  
    fetchTaskCount();
  }, [auth.currentUser]); // Ajout d'une dépendance pour exécuter l'effet quand l'utilisateur change
  



  // Fonction pour compter les tâches par statut
  const countTasksByStatus = (tasks) => {
    return tasks.reduce(
      (acc, task) => {
        acc[task.statut] = (acc[task.statut] || 0) + 1;
        if (task.statut !== 'Terminé' && new Date(task.dateFin) < new Date()) {
          acc.overdue += 1;
        }
        return acc;
      },
      { 'En attente': 0, 'En cours': 0, 'Terminé': 0, 'Annulé': 0, overdue: 0 }
    );
  };

  // Mettre à jour les statistiques des tâches
  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const stats = countTasksByStatus(storedTasks);
    setTaskStats(stats);
  }, []); // L'effet se déclenche une fois au montage du composant

  // Fonction pour afficher le contenu en fonction de la vue sélectionnée
  const renderContent = () => {
    switch (selectedView) {
      case 'clients':
        return <Company />;
      case 'intervenants':
        return <Intervenant />;
      case 'taches':
        return <Tasks />;
      case 'Performance':
        return <AllPerformanceTables />;
      case 'Calendrier':
        return <CustomCalendar />;
      case 'actions':
        return <TaskCategories />;
      default:
        return <p>Sélectionnez une option dans le menu.</p>;
    }
  };

  return (
    <Container fluid className="Dashboard" id="tableau">
      <Row>
        {/* Barre de navigation à gauche */}
        <div className="nav-buttons">
          <div className="butondash1adm">
            
            <div
              id="companyadm"
              className="w-24% mb-2 d-flex align-items-center"
              onClick={() => setSelectedView('intervenants')}
            >
              <a href="#intervenants">
                <FaUserTie className="me-2" /> Intervenants
              </a>
              <p>total : {countIntervenants}</p>
            </div>
            <div
              id="companyadm"
              className="w-24% mb-2 d-flex align-items-center"
              onClick={() => setSelectedView('clients')}
            >
              <a href="#clients">
                <FaUsers className="me-2" />Clients
              </a>
              <p>total: {countClients}</p>
            </div>
            <div
              id="companyadm"
              className="w-24% d-flex align-items-center"
              onClick={() => setSelectedView('taches')}
              onMouseEnter={() => setShowTaskStats(true)}
              onMouseLeave={() => setShowTaskStats(false)}
            >
              <a href="#taches">
                <FaTasks className="me-2" /> Liste des Tâches
              </a>
              <p>total: {countTasks}</p>
                            {showTaskStats && (
                              <div className="task-stats">
                                <span className="stat-completed">
                                  {taskStats['Terminé']} <FaCheckCircle /> 
                                </span>
                                <span className="stat-in-progress">
                                  {taskStats['En cours']} <FaHourglassHalf />
                                </span>
                                <span className="stat-overdue">
                                  {taskStats.overdue} <FaExclamationTriangle />
                                </span>
                              </div>
                            )}
            </div>
            <div
              id="companyadm"
              className="w-24% d-flex align-items-center"
              onClick={() => setSelectedView('Calendrier')}
            >
              <a href="#Calendrier">
                <FaCalendarAlt className="me-2" /> Calendrier
              </a>
            </div>
            <div
              id="companyadm"
              className="w-24% d-flex align-items-center"
              onClick={() => setSelectedView('Performance')}
            >
              <a href="#Performances">
                <FaUserGraduate className="me-2" /> Performances
              </a>
               { <p>total: {performances}</p>}

            </div>
            <div
              id="companyadm"
              className="w-24% d-flex align-items-center"
              onClick={() => setSelectedView('actions')}
            >
              <a href="#Action">
                <FaTasks className="me-2" /> Nos actions
              </a>
              <p>total: {countTaskCategories}</p>

              
            </div>
          </div>
        </div>

        {/* Contenu dynamique en fonction de la vue sélectionnée */}
        <div xs={12} md={9} className="p-4 contenu" id="p-4">
          {renderContent()}
        </div>
      </Row>
    </Container>
  );
}

export default Dashboard;
