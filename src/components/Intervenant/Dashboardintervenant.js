import React, { useState, useEffect } from 'react';
import { Container, Row } from 'react-bootstrap';
import { FaUsers, FaUserTie, FaTasks, FaUserGraduate, FaCheckCircle, FaHourglassHalf, FaExclamationTriangle } from 'react-icons/fa';
import Intervenantinter from './Intervenant-inter';
import Tasksinter from './Tasks-inter';
import { getAuth } from "firebase/auth";
import '../css/Dashboard.css';
import Companyinter from './Company-inter';
import PerformanceDashboard from './PerformanceDashboard';

function Dashboardintervenant() {
  const [selectedView, setSelectedView] = useState('clients');
  const [adminEmail, setAdminEmail] = useState('');
  const auth = getAuth();
  const [countClients, setCountClients] = useState(0);
  const [countIntervenants, setCountIntervenants] = useState(0);
  const [countTasks, setCountTasks] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [taskStats, setTaskStats] = useState({
    'En attente': 0,
    'En cours': 0,
    'Terminé': 0,
    'Annulé': 0,
    overdue: 0
  });
  const [showTaskStats, setShowTaskStats] = useState(false);
  const [showPerformanceStats, setShowPerformanceStats] = useState(false);

  // Fonction pour compter les tâches par statut
  const countTasksByStatus = (tasks) => {
    // Réinitialise toujours les compteurs à zéro avant de compter
    return tasks.reduce(
      (acc, task) => {
        acc[task.statut] = (acc[task.statut] || 0) + 1;
        if (task.statut !== 'Terminé' && new Date(task.date_fin) < new Date()) {
          acc.overdue = (acc.overdue || 0) + 1;
        }
        return acc;
      },
      { 
        'En attente': 0, 
        'En cours': 0, 
        'Terminé': 0, 
        'Annulé': 0, 
        overdue: 0 
      } // Initialisation propre à chaque appel
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      if (auth.currentUser) {
        setAdminEmail(auth.currentUser.email);
        const userId = auth.currentUser.uid;
        
        try {
          // Récupérer les tâches de l'intervenant
          const tasksResponse = await fetch(`https://gesworkerback.onrender.com/taches/intervenantinters/${userId}`);
          const tasksData = await tasksResponse.json();
          
          if (Array.isArray(tasksData)) {
            // Calcul des stats AVANT de mettre à jour les states
            const stats = countTasksByStatus(tasksData);
            
            // Mise à jour atomique des states
            setTasks(tasksData);
            setCountTasks(tasksData.length);
            setTaskStats(stats);
            
            console.log("Données et stats mises à jour:", { tasksData, stats });
          }

          // Compter les clients
          const clientsResponse = await fetch(`https://gesworkerback.onrender.com/intervenantinters/entreprises/intervenant/${userId}`);
          const clientsCount = await clientsResponse.json();
          console.log("Clients:", clientsCount);
          setCountClients(clientsCount.length);

          // Compter les intervenants
          const intervenantsResponse = await fetch(`https://gesworkerback.onrender.com/intervenantinters/mesintervenants/${userId}`);
          const intervenantsCount = await intervenantsResponse.json();
          console.log("Intervenants:", intervenantsCount);
          setCountIntervenants(intervenantsCount.count);

        } catch (error) {
          console.error("Erreur lors de la récupération des données:", error);
        }
      }
    };

    fetchData();
  }, [auth.currentUser, selectedView]); // Ajout de selectedView comme dépendance

  const renderContent = () => {
    switch (selectedView) {
      case 'Performance':
        return <PerformanceDashboard tasks={tasks} />;
      case 'clients':
        return <Companyinter />;
      case 'intervenants':
        return <Intervenantinter />;
      case 'taches':
        return <Tasksinter tasks={tasks} />;
      default:
        return <p>Sélectionnez une option dans le menu.</p>;
    }
  };

  return (
    <Container fluid className="Dashboard" id='tableau' style={{ display: 'flex', flexDirection: 'row', height: '100vh',justifyContent: 'space-between',width:'100%' }}>
      <div className="nav-buttons-inter" style={{ width: '30%' }}>
            <div
              className="navb-button1"
              onClick={() => setSelectedView('intervenants')}
            >
              <a className='nav-link1' href="#intervenants">
                <FaUserTie className="me-2" /> Mes collègues
              </a>
              <p>total : {countIntervenants}</p>
            </div>
            <div
              className="navb-button1"
              onClick={() => setSelectedView('clients')}
            >
              <a className='nav-link1' href="#clients">
                <FaUsers className="me-2" />Clients
              </a>
              <p>total: {countClients}</p>
            </div>
            <div
              className="navb-button1"
              onClick={() => setSelectedView('taches')}
              onMouseEnter={() => setShowTaskStats(true)}
              onMouseLeave={() => setShowTaskStats(false)}
            >
              <a className='nav-link1' href="#taches">
                <FaTasks className="me-2" /> Mes Tâches
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
              className="navb-button1"
              onClick={() => setSelectedView('Performance')}
              onMouseEnter={() => setShowPerformanceStats(true)}
              onMouseLeave={() => setShowPerformanceStats(false)}
            >
              <a className='nav-link1' href="#Performances">
                <FaUserGraduate className="me-2" />Mes performances
              </a>
              <p>total: {countTasks}</p>
              {showPerformanceStats && (
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
        
        </div>
      <Row className="sepa" style={{ width: '80%',marginLeft: '2%',minWidth:'80%'}} >
        {/* Barre de navigation à gauche */}
        
        {/* <div className="nav-buttons-inter" style={{ width: '20%' }}>
            <div
              className="navb-button1"
              onClick={() => setSelectedView('intervenants')}
            >
              <a className='nav-link1' href="#intervenants">
                <FaUserTie className="me-2" /> Mes collègues
              </a>
              <p>total : {countIntervenants}</p>
            </div>
            <div
              className="navb-button1"
              onClick={() => setSelectedView('clients')}
            >
              <a className='nav-link1' href="#clients">
                <FaUsers className="me-2" />Clients
              </a>
              <p>total: {countClients}</p>
            </div>
            <div
              className="navb-button1"
              onClick={() => setSelectedView('taches')}
              onMouseEnter={() => setShowTaskStats(true)}
              onMouseLeave={() => setShowTaskStats(false)}
            >
              <a className='nav-link1' href="#taches">
                <FaTasks className="me-2" /> Mes Tâches
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
              className="navb-button1"
              onClick={() => setSelectedView('Performance')}
              onMouseEnter={() => setShowPerformanceStats(true)}
              onMouseLeave={() => setShowPerformanceStats(false)}
            >
              <a className='nav-link1' href="#Performances">
                <FaUserGraduate className="me-2" />Mes performances
              </a>
              <p>total: {countTasks}</p>
              {showPerformanceStats && (
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
        
        </div> */}

        {/* Contenu dynamique en fonction de la vue sélectionnée */}
        <div xs={12} md={9} className="p-4 contenu " id='p-4'style={{ width: '100%' }}>
          {renderContent()}
        </div>
      </Row>
    </Container>
  );
}

export default Dashboardintervenant;  