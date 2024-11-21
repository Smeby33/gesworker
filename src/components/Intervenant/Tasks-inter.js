import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaFilter, FaExclamationCircle } from 'react-icons/fa';
import '../css/Tasks.css';

function Tasksinter() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState(null); // État pour stocker le statut du filtre
  const [noTasksMessage, setNoTasksMessage] = useState(""); // État pour le message d'alerte
  const [comments, setComments] = useState({}); // Stockage des commentaires par tâche

  // Récupérer l'utilisateur connecté depuis le localStorage
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

  // Récupérer les tâches depuis le localStorage
  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    setTasks(storedTasks);

    // Charger les commentaires
    const storedComments = JSON.parse(localStorage.getItem('comments')) || {};
    setComments(storedComments);
  }, []);

  // Filtrer les tâches assignées à l'utilisateur connecté
  useEffect(() => {
    if (tasks.length > 0 && currentUser?.username) {
      const assignedTasks = tasks.filter(task =>
        task.intervenants.some(intervenant => intervenant === currentUser.username)
      );
      setFilteredTasks(assignedTasks);
    }
  }, [tasks, currentUser]);

  // Détermine si une tâche est en retard
  const isTaskLate = (task) => {
    const today = new Date();
    const dateFin = new Date(task.dateFin);
    return task.statut !== 'Terminé' && dateFin < today;
  };

  // Filtrer les tâches en fonction du statut ou des critères (y compris les tâches en retard)
  const filterTasks = (status) => {
    setFilterStatus(status); // Mettre à jour le statut du filtre
    let filtered;

    if (status === 'En retard') {
      filtered = filteredTasks.filter(task => isTaskLate(task));
    } else if (status) {
      filtered = filteredTasks.filter(task => task.statut === status);
    } else {
      filtered = tasks.filter(task =>
        task.intervenants.some(intervenant => intervenant === currentUser.username)
      );
    }

    setFilteredTasks(filtered);

    // Gérer le message d'alerte
    if (filtered.length === 0) {
      const message = status === 'En retard'
        ? "Vous n'avez aucune tâche en retard."
        : `Vous n'avez aucune tâche ${status?.toLowerCase()}.`;
      setNoTasksMessage(message);
    } else {
      setNoTasksMessage(""); // Réinitialiser le message si on a des tâches
    }
  };

  // Mise à jour du statut d'une tâche
  const updateTaskStatus = (id, newStatus) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, statut: newStatus } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));

    // Mettre à jour les tâches filtrées
    setFilteredTasks(
      updatedTasks.filter(task =>
        task.intervenants.some(intervenant => intervenant === currentUser.username)
      )
    );
  };

  // Ajouter un commentaire à une tâche
  const addComment = (taskId, comment) => {
    if (!comment.trim()) return; // Empêcher l'ajout de commentaires vides

    const updatedComments = {
      ...comments,
      [taskId]: [...(comments[taskId] || []), { user: currentUser.username, text: comment, date: new Date() }]
    };

    setComments(updatedComments);
    localStorage.setItem('comments', JSON.stringify(updatedComments));
  };

  return (
    <div className="tasks-container">
      <h3>Liste des Tâches</h3>
      <p className='userconected'>Utilisateur connecté : <span>{currentUser.username}</span></p>

      {/* Section des filtres */}
      <div className="filters">
      <button onClick={() => filterTasks(null)}>
          <FaFilter /> Toutes
        </button>
        <button onClick={() => filterTasks('En attente')}>
          <FaHourglassHalf /> En attente
        </button>
        <button onClick={() => filterTasks('En cours')}>
          <FaHourglassHalf /> En cours
        </button>
        <button onClick={() => filterTasks('Terminé')}>
          <FaCheckCircle /> Terminé
        </button>
        <button onClick={() => filterTasks('Annulé')}>
          <FaTimesCircle /> Annulé
        </button>
        <button onClick={() => filterTasks('En retard')}>
          <FaExclamationCircle /> En retard
        </button>
      </div>

      {/* Alerte si aucune tâche ne correspond au filtre */}
      {noTasksMessage && <p className="no-tasks-message"><span>{noTasksMessage}</span></p>}

      {/* Affichage des tâches filtrées */}
      {filteredTasks.length === 0 && !noTasksMessage ? (
        <p>Aucune tâche assignée trouvée pour : {currentUser.username}</p>
      ) : (
        <ul className="tasks-list">
          {filteredTasks.map(task => (
            <li
              key={task.id}
              className="task-item1"
              style={{ backgroundColor: isTaskLate(task) ? 'red' : 'white' }} // Affiche en rouge si en retard
            >
              <h4>{task.titre}</h4>
              <p><strong>Entreprise :</strong> {task.company}</p>
              <p>
                <strong>Catégories :</strong> {task.categories.join(', ')}
              </p>
              <p>
                <strong>Intervenants :</strong> {task.intervenants.join(', ')}
              </p>
              <div className="task-item1-date">
                <p><strong>Date de début :</strong> {task.dateDebut}</p>
                <p><strong>Statut :</strong> {task.statut}</p>
                <p>{task.dateFin && <strong>Date de fin :</strong>} {task.dateFin}</p>
              </div>
              <div className="task-actions">
                {task.statut !== 'Terminé' && task.statut !== 'Annulé' && (
                  <>
                    <button onClick={() => updateTaskStatus(task.id, 'En cours')}>En cours</button>
                    <button onClick={() => updateTaskStatus(task.id, 'Terminé')}>Terminer</button>
                    <button onClick={() => updateTaskStatus(task.id, 'Annulé')}>Annuler</button>
                  </>
                )}
              </div>

              {/* Section des commentaires */}
              <div className="task-comments">
                <h5>Commentaires</h5>
                {comments[task.id]?.length > 0 ? (
                  <ul>
                    {comments[task.id].map((comment, index) => (
                      <li key={index}>
                        <p>
                          <strong style={{ color: '#007bff' }}>{comment.user}</strong>: {comment.text}
                        </p>
                        <span style={{ fontSize: '0.8em', color: '#888' }}>
                          {new Date(comment.date).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Aucun commentaire.</p>
                )}
              </div>
              {/* Ajout d'un commentaire */}
              <div className="add-comment">
                <input
                  type="text"
                  placeholder="Ajouter un commentaire..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addComment(task.id, e.target.value);
                      e.target.value = '';
                    }
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Tasksinter;
