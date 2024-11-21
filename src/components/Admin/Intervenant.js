import React, { useEffect, useState } from 'react';
import '../css/Intervenant.css'; // Assure-toi que le chemin est correct

function Intervenant() {
  const [intervenants, setIntervenants] = useState([]);
  const [hoveredIntervenant, setHoveredIntervenant] = useState(null);
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
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
    <div className="intervenant-container" id='Intervenant'>
      <h3>Liste des Intervenants</h3>
      <ul className="intervenant-list">
        {intervenants.length > 0 ? (
          intervenants.map((intervenant, index) => (
            <li
              key={index}
              className="intervenant-item"
              onMouseEnter={() => setHoveredIntervenant(intervenant)}
              onMouseLeave={() => setHoveredIntervenant(null)}
            >
              <strong>{intervenant.name}</strong>
              <p><span>Contact:</span> {intervenant.contact}</p>
              <p><span>Email:</span> {intervenant.email}</p>
              <p><span>Identifiant:</span> {intervenant.id}</p>
              <p><span>Mot de passe:</span> {intervenant.password}</p>

              {hoveredIntervenant && hoveredIntervenant.name === intervenant.name && (
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
                          <strong>Client:  {task.company} </strong> - Catégorie: {task.categories.join(', ')}
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
            </li>
          ))
        ) : (
          <p>Aucun intervenant trouvé.</p>
        )}
      </ul>
    </div>
  );
}

export default Intervenant;
