import React, { useState } from 'react';
import { Container, Row, Button } from 'react-bootstrap';
import { FaUsers, FaUserTie, FaTasks,FaUserGraduate } from 'react-icons/fa'; // ajout de l'icône des tâches
 import Intervenantinter from './Intervenant-inter';
import Tasksinter from './Tasks-inter'; // Import du composant Tasks
import '../css/Dashboard.css';
import Companyinter from './Company-inter';
import PerformanceDashboard from './PerformanceDashboard';

function Dashboardintervenant() {
  const [selectedView, setSelectedView] = useState('clients');

  // Fonction pour afficher le contenu en fonction de la vue sélectionnée
  const renderContent = () => {
    switch (selectedView) {
      case 'clients':
        return <Companyinter />;
      case 'intervenants':
        return <Intervenantinter />;
      case 'taches':
        return <Tasksinter/>;
        case 'performance':
        return <PerformanceDashboard/>;
      default:
        return <p>Sélectionnez une option dans le menu.</p>;
    }
  };

  return (
    <Container fluid className="Dashboard" id='tableau'>
      <Row>
        {/* Barre de navigation à gauche */}
          <div className="nav-buttons">
          <div className="butondash1">
                <div
                  id="company"
                  variant="dark" 
                  className="w-24% mb-2 d-flex align-items-center" 
                  onClick={() => setSelectedView('clients')}
                >
                  <FaUsers className="me-2" /> Liste des Clients
                </div>
                <div
                   id="company" 
                  variant="dark" 
                  className="w-24% mb-2 d-flex align-items-center" 
                  onClick={() => setSelectedView('intervenants')}
                >
                  <FaUserTie className="me-2" /> Mes Collegues 
                </div>
                <div
                  id="company"
                  variant="dark" 
                  className="w-24% d-flex align-items-center" 
                  onClick={() => setSelectedView('taches')}
                >
                  <FaTasks className="me-2" /> Mes Tâches
                </div>
                <div
                  id="company" 
                  variant="dark" 
                  className="w-24% d-flex align-items-center" 
                  onClick={() => setSelectedView('performance')}
                >
                  <FaUserGraduate className="me-2" /> Mes performances
                </div>
          </div>
          </div>

        {/* Contenu dynamique en fonction de la vue sélectionnée */}
        <div xs={12} md={9} className="p-4 contenu " id='p-4'>
          {renderContent()}
        </div>
      </Row>
    </Container>
  );
}

export default Dashboardintervenant;
