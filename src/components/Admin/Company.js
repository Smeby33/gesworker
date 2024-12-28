import React, { useEffect, useState } from 'react';
import CreateCompany from  './CreateCompany';
import TaskCreation from './TaskCreation';
import '../css/Company.css'; // Assure-toi que le chemin est correct
import {
  FaUserPlus,
  FaFileMedical,
  FaBuilding,
  FaList,
  FaTh
} from 'react-icons/fa';

function Company() {
  const [companies, setCompanies] = useState([]);
  const [hoveredCompany, setHoveredCompany] = useState(null);
  const [activeCompanyIndex, setActiveCompanyIndex] = useState(null); 
  const [selectedCompanyForTask, setSelectedCompanyForTask] = useState(null); // Devient spécifique
  const [viewMode, setViewMode] = useState('list'); // Vue par défaut : liste

  useEffect(() => {
    const storedCompanies = JSON.parse(localStorage.getItem('clients')) || [];
    setCompanies(storedCompanies);
  }, []);

  // Récupère les tâches associées à une entreprise
  const getTasksForCompany = (companyName) => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    return storedTasks.filter((task) => task.company === companyName);
  };

  // Fonction pour déterminer le style de la tâche en fonction de la date limite
  const getTaskBackgroundColor = (task) => {
    const today = new Date();
    const dateFin = new Date(task.dateFin);
    const diffTime = dateFin - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convertir en jours

    if (task.statut !== 'Terminé' && diffDays < 0) {
      return 'red'; // Si la date est dépassée et la tâche non terminée
    } else if (diffDays <= 3 && diffDays >= 0) {
      return 'orange'; // Si la date limite est dans 3 jours ou moins
    }
    return 'white'; // Couleur par défaut
  };

  // Met à jour la liste des entreprises après la création
  const handleCompanyCreation = () => {
    const updatedCompanies = JSON.parse(localStorage.getItem('clients')) || [];
    setCompanies(updatedCompanies);
    setActiveCompanyIndex(null); // Fermer tous les formulaires
  };
// Fonction pour afficher TaskCreation pour une entreprise
const handleAddTaskClick = (companyIndex) => {
  setSelectedCompanyForTask(
    selectedCompanyForTask === companyIndex ? null : companyIndex
  ); // Permet de basculer entre afficher/masquer
};



  return (
    <div className="company-container">
      <h3 id="clients">Liste des Clients</h3>

      {/* Sélecteur de vue */}
      <div className="view-selector">
        <button
          onClick={() => setViewMode('list')}
          className={viewMode === 'list' ? 'active' : ''}
        >
          <FaList /> Liste
        </button>
        <button
          onClick={() => setViewMode('grid')}
          className={viewMode === 'grid' ? 'active' : ''}
        >
          <FaTh /> Grille
        </button>
      </div>

      {/* Conteneur des clients */}
      <div className={`client-view ${viewMode}`}>
        {companies.length > 0 ? (
          companies.map((company, index) => (
            <div
              key={index}
              className={`client-item ${hoveredCompany === company ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredCompany(company)}
              onMouseLeave={() => setHoveredCompany(null)}
            >
              <div className="navclient">
                <div className="btnnav">
                  <button className="nav-button">
                  <FaUserPlus className="btnnavicon"/>
                    <a href="#form-intervenant" className="nav-link">
                       Add Intervenant
                    </a>
                  </button>
                </div>
                <div className="btnnav">
                  <button className="nav-button" onClick={() => 
                      setActiveCompanyIndex(activeCompanyIndex === index ? null : index)
                    }>
                      <FaBuilding className="btnnavicon" />
                    <a  className="nav-link">
                       Add Entreprise
                    </a>
                  </button>
                </div>
                <div className="btnnav">
                  <button className="nav-button"  onClick={() => handleAddTaskClick(index)} // Appel avec l'index
        >
                    <FaFileMedical className="btnnavicon" />
                    <a className="nav-link">
                       Add Tâches
                    </a>
                  </button>
                </div>
              </div>
              <strong>{company.companyName}</strong>
              <p>
                <span>Contact:</span> {company.contact}
              </p>
              <p>
                <span>Email:</span> {company.email}
              </p>
              <p>
                <span>Adresse:</span> {company.address}
              </p>
              <p>
                <span>Description:</span> {company.description}
              </p>
              {activeCompanyIndex === index && (
                <CreateCompany onCompanyCreated={handleCompanyCreation} className="company-details1" />
              )}
               {/* Afficher le composant TaskCreation si une entreprise est sélectionnée */}
               {selectedCompanyForTask === index && (
                  <TaskCreation
                    selectedCompany={company.companyName}
                    onClose={() => setSelectedCompanyForTask(null)} // Permet de fermer TaskCreation
/>
                )}

              {hoveredCompany && hoveredCompany.companyName === company.companyName && (
                <div className="company-details">
                  <h4>Détails de l'entreprise: {company.companyName}</h4>
                  <div className="tasks">
                    <h5>Tâches associées à cette entreprise</h5>
                    {getTasksForCompany(company.companyName).length > 0 ? (
                      getTasksForCompany(company.companyName).map((task, index) => (
                        <div
                          key={index}
                          className="task-item3"
                          style={{ backgroundColor: getTaskBackgroundColor(task) }}
                        >
                          <strong>{task.categories.join(', ')}</strong> - Statut: {task.statut}
                          <p>Date limite: {task.dateFin}</p>
                          <div className="task-item-ul3">
                            {task.intervenants.map((intervenant, i) => (
                              <div key={i}>
                                <p>{intervenant}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>Aucune tâche pour cette entreprise.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>Aucun client trouvé.</p>
        )}
      </div>
    </div>
  );
}

export default Company;
