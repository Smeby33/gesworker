import React, { useEffect, useState } from 'react';
import '../css/Intervenant.css';
import { FaList, FaTh } from 'react-icons/fa';

function Intervenantinter() {
  const [intervenants, setIntervenants] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [interProfil,setinterProfil] = useState(false)
  const [viewMode, setViewMode] = useState('list');
  const [ taskAssigned, setTaskAssigned ] = useState(null);

  useEffect(() => {
    // Charger les données depuis le localStorage
    const storedUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    setCurrentUser(storedUser);

    const storedProfil = JSON.parse(localStorage.getItem('profilePicture')) || {};
    setinterProfil(storedProfil);

    


    const storedIntervenants = JSON.parse(localStorage.getItem('intervenant')) || [];
    setIntervenants(storedIntervenants);

    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const validatedTasks = storedTasks.filter((task) => Array.isArray(task.intervenants));
    setTasks(validatedTasks);
  }, []);

  // Fonction pour récupérer les tâches d'un intervenant
  const getTasksForIntervenant = (intervenantName) => {
    return tasks.filter(
      (task) =>
        Array.isArray(task.intervenants) && task.intervenants.includes(intervenantName)
    );
  };

  // Filtrer les intervenants
  const filteredIntervenants = intervenants.filter((intervenant) => {
    return tasks.some(
      (task) =>
        Array.isArray(task.intervenants) &&
        task.intervenants.includes(intervenant.name) &&
        (task.intervenants.includes(currentUser?.name) || task.company === currentUser?.company)
    );
  });

  // Déterminer la couleur de fond de la tâche
  const getTaskBackgroundColor = (task) => {
    const today = new Date();
    const dateFin = new Date(task.dateFin);
    const diffDays = Math.ceil((dateFin - today) / (1000 * 60 * 60 * 24));

    if (task.statut !== 'Terminé' && diffDays < 0) {
      return 'red';
    } else if (diffDays <= 3 && diffDays >= 0) {
      return 'orange';
    }
    return 'white';
  };

  return (
    <div className="intervenant-container" id="Intervenant">
      <h3>Liste des collègues</h3>

      {/* Boutons de changement de vue */}
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
              onClick={() => setTaskAssigned(taskAssigned === intervenant.id ? null : intervenant.id)}

              className={`intervenant-item ${viewMode === 'grid' ? 'grid-item' : ''}`}
            >
              <div className="intervenant-row">
                <strong className="intervenant-col">{intervenant.name}</strong>
                <p className="intervenant-col">Contact: {intervenant.phone}</p>
                <p className="intervenant-col">Email: {intervenant.email}</p>
                <p className="intervenant-col">Identifiant: {intervenant.id}</p>
              </div>
              {taskAssigned === intervenant.id && (
              <div className="intervenant-details">
                <h4>Tâches assignées</h4>
                <div className="tasks">
                  {getTasksForIntervenant(intervenant.name).length > 0 ? (
                    getTasksForIntervenant(intervenant.name).map((task, index) => (
                      <div
                        key={index}
                        className="task-item2"
                        style={{ backgroundColor: getTaskBackgroundColor(task) }}
                      >
                        <strong>Client: {task.company}</strong>
                        <p>
                          <span>Catégorie:</span>{' '}
                          {task.categories && task.categories.length > 0 ? (
                            task.categories.map((cat, index) => (
                            
                              <span className='cate' key={index}>-{cat.name} </span>
                            ))
                          ) : (
                            <span>Aucune catégorie</span>
                          )}
                        </p>
                        <p>Statut: {task.statut}</p>
                        <p>Date limite: {task.dateFin}</p>
                      </div>
                    ))
                  ) : (
                    <p>Aucune tâche assignée.</p>
                  )}
                </div>
              </div>
              )}
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
