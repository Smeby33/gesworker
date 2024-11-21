import React, { useState } from 'react';
import { Container, Row, Button } from 'react-bootstrap';
import { FaUsers, FaUserTie, FaTasks, FaUserGraduate } from 'react-icons/fa'; // ajout de l'icône des tâches
import Company from './Company';
import Intervenant from './Intervenant';
import Tasks from './Tasks'; // Import du composant Tasks
import '../css/Dashboard.css';
import AllPerformanceTables from './AllPerformanceTables';

function Dashboard() {
  const [selectedView, setSelectedView] = useState('clients');

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
      default:
        return <p>Sélectionnez une option dans le menu.</p>;
    }
  };

  return (
    <Container fluid className="Dashboard" id='tableau'>
      <Row>
        {/* Barre de navigation à gauche */}
        <div xs={12} md={3} className="bg-dark text-white p-3 nav-column">
          <div className="nav-buttons">
            <Button 
              variant="dark" 
              className="w-24% mb-2 d-flex align-items-center" 
              onClick={() => setSelectedView('clients')}
            >
              <FaUsers className="me-2" /> Liste des Clients
            </Button>
            <Button 
              variant="dark" 
              className="w-24% mb-2 d-flex align-items-center" 
              onClick={() => setSelectedView('intervenants')}
            >
              <FaUserTie className="me-2" /> Liste des Intervenants
            </Button>
            <Button 
              variant="dark" 
              className="w-24% d-flex align-items-center" 
              onClick={() => setSelectedView('taches')}
            >
              <FaTasks className="me-2" /> Liste des Tâches
            </Button>
            <Button 
              variant="dark" 
              className="w-24% d-flex align-items-center" 
              onClick={() => setSelectedView('Performance')}
            >
              <FaUserGraduate className="me-2" /> Performances
            </Button>
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

export default Dashboard;
