import React, { useEffect, useState } from 'react';
import '../css/Company.css'; // Assure-toi que le chemin est correct
import { FaList, FaTh } from 'react-icons/fa';

function Companyinter() {
  const [companies, setCompanies] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // Utilisateur connecté
  const [hoveredCompany, setHoveredCompany] = useState(null);
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'grid'

  useEffect(() => {
    // Charger l'utilisateur connecté depuis le localStorage
    const storedUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    setCurrentUser(storedUser);

    // Charger les entreprises depuis le localStorage
    const storedCompanies = JSON.parse(localStorage.getItem('clients')) || [];
    setCompanies(storedCompanies);

    // Charger les tâches depuis le localStorage
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    setTasks(storedTasks);
  }, []);

  // Récupère les tâches associées à une entreprise
  const getTasksForCompany = (companyName) => {
    return tasks.filter((task) => task.company === companyName);
  };

  // Filtrer les entreprises en fonction des tâches partagées ou de l'entreprise
  const filteredCompanies = companies.filter((company) => {
    // Vérifie si l'entreprise a des tâches en commun avec l'utilisateur
    const hasCommonTask = tasks.some((task) =>
      task.company === company.companyName && 
      task.intervenants.includes(currentUser.name)
    );
    return hasCommonTask || company.companyName === currentUser.company; // Filtrer par entreprise
  });

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

  return (
    <div className="company-container">
      <h3>Liste des Clients</h3>

      {/* Boutons pour basculer entre les vues */}
      <div className="view-toggle">
        <button
          className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          <FaList /> Vue Liste
        </button>
        <button
          className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
          onClick={() => setViewMode('grid')}
        >
          <FaTh /> Vue Grille
        </button>
      </div>

      {/* Affichage des entreprises */}
      <div className={`client-${viewMode}`}>
        {filteredCompanies.length > 0 ? (
          filteredCompanies.map((company, index) => (
            <div
              key={index}
              className={`client-item ${viewMode === 'grid' ? 'grid-item' : ''}`}
              onMouseEnter={() => setHoveredCompany(company)}
              onMouseLeave={() => setHoveredCompany(null)}
            >
              <strong>{company.companyName}</strong>
              <p><span>Contact:</span> {company.contact}</p>
              <p><span>Email:</span> {company.email}</p>
              <p><span>Adresse:</span> {company.address}</p>
              <p><span>Description:</span> {company.description}</p>

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
                              <div key={i}><p>{intervenant}</p></div>
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
          <p>Aucune entreprise avec des tâches partagées ou dans la même entreprise.</p>
        )}
      </div>
    </div>
  );
}

export default Companyinter;
