import React, { useEffect, useState } from 'react'; 
import '../css/Intervenant.css'; // Assure-toi que le chemin est correct
import { FaList, FaTh } from 'react-icons/fa';

function Intervenantinter() {
  const [intervenants, setIntervenants] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null); // Utilisateur connecté
  const [viewMode, setViewMode] = useState('list'); // 'list' ou 'grid'

  useEffect(() => {
    // Charger l'utilisateur connecté depuis le localStorage
    const storedUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    setCurrentUser(storedUser);

    // Charger les intervenants depuis le localStorage
    const storedIntervenants = JSON.parse(localStorage.getItem('intervenant')) || [];
    setIntervenants(storedIntervenants);

    // Charger les tâches depuis le localStorage
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    setTasks(storedTasks);
  }, []);

  // Fonction pour récupérer les tâches associées à un intervenant
  const getTasksForIntervenant = (intervenantName) => {
    return tasks.filter((task) => task.intervenants.includes(intervenantName));
  };

  // Filtrer les intervenants en fonction des tâches partagées ou de l'entreprise
  const filteredIntervenants = intervenants.filter((intervenant) => {
    // Vérifie si l'intervenant est dans la même entreprise ou a une tâche en commun
    const hasCommonTask = tasks.some((task) =>
      task.intervenants.includes(intervenant.name) && 
      (task.intervenants.includes(currentUser.name) || task.company === currentUser.company)
    );
    return hasCommonTask;
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
    <div className="intervenant-container" id="Intervenant">
      <h3>Liste des Intervenants</h3>

      {/* Boutons pour changer de vue */}
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

      {/* Affichage des intervenants */}
      <div className={`intervenant-${viewMode}`}>
        {filteredIntervenants.length > 0 ? (
          filteredIntervenants.map((intervenant, index) => (
            <div
              key={index}
              className={`intervenant-item ${viewMode === 'grid' ? 'grid-item' : ''}`}
            >
              <strong>{intervenant.name}</strong>
              <p><span>Contact:</span> {intervenant.contact}</p>
              <p><span>Email:</span> {intervenant.email}</p>
              <p><span>Identifiant:</span> {intervenant.id}</p>

              <div className="intervenant-details">
                <h4>Tâches assignées </h4>
                <div className="tasks">
                  {getTasksForIntervenant(intervenant.name).length > 0 ? (
                    getTasksForIntervenant(intervenant.name).map((task, index) => (
                      <div
                        key={index}
                        className="task-item2"
                        style={{ backgroundColor: getTaskBackgroundColor(task) }}
                      >
                        <strong>Client: {task.company}</strong> - Catégorie: {task.categories.join(', ')}
                        <p>Statut: {task.statut}</p>
                        <p>Date limite: {task.dateFin}</p>
                      </div>
                    ))
                  ) : (
                    <p>Aucune tâche assignée.</p>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p>Aucun intervenant trouvé avec des tâches en commun ou dans la même entreprise.</p>
        )}
      </div>
    </div>
  );
}

export default Intervenantinter;
