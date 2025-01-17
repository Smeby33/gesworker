import React, { useState, useEffect } from 'react';
import { Container, Row } from 'react-bootstrap';
import { FaUsers, FaUserTie, FaTasks, FaUserGraduate, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa'; // ajout des icônes nécessaires
import Company from './Company';
import Intervenant from './Intervenant';
import TaskCategories from '../Intervenant/TaskCategories'; // Assurez-vous que le chemin est correct
import Tasks from './Tasks'; // Import du composant Tasks
import '../css/Dashboard.css';
import AllPerformanceTables from './AllPerformanceTables';
import CustomCalendar from './CustomCalendar';

function Dashboard() {
  const [selectedView, setSelectedView] = useState('clients');
  const [taskStats, setTaskStats] = useState({});
  
  // Fonction pour compter les clients
  const countClients = () => {
    const clientsData = JSON.parse(localStorage.getItem('clients')) || [];
    return clientsData.length;
  };
  // Fonction pour compter les taskCategories
  const countTaskCategories = () => {
    const taskCategoriesData = JSON.parse(localStorage.getItem('taskCategories')) || [];
    return taskCategoriesData.length;
  };
  
  // Fonction pour compter les performances
  const countPerformances = () => {
    const performancesData = JSON.parse(localStorage.getItem('performance')) || [];
    return performancesData.length;
  };
  // Fonction pour compter les intervenants
  const countIntervenants = () => {
    const intervenantData = JSON.parse(localStorage.getItem('intervenant')) || [];
    return intervenantData.length;
  };
  const counttask = () => {
    const taskData = JSON.parse(localStorage.getItem('tasks')) || [];
    return taskData.length;
  };

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
              <p>total : {countIntervenants()}</p>
            </div>
            <div
              id="companyadm"
              className="w-24% mb-2 d-flex align-items-center"
              onClick={() => setSelectedView('clients')}
            >
              <a href="#clients">
                <FaUsers className="me-2" />Clients
              </a>
              <p>total: {countClients()}</p>
            </div>
            <div
              id="companyadm"
              className="w-24% d-flex align-items-center"
              onClick={() => setSelectedView('taches')}
            >
              <a href="#taches">
                <FaTasks className="me-2" /> Liste des Tâches
              </a>
              <p>total: {counttask()}</p>
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
              <p>total: {countPerformances()}</p>

            </div>
            <div
              id="companyadm"
              className="w-24% d-flex align-items-center"
              onClick={() => setSelectedView('actions')}
            >
              <a href="#Action">
                <FaTasks className="me-2" /> Nos actions
              </a>
              <p>total: {countTaskCategories()}</p>

              
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
