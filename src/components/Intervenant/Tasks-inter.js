import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaFilter, FaExclamationCircle } from 'react-icons/fa';
import '../css/Tasks.css';

function Tasksinter() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [noTasksMessage, setNoTasksMessage] = useState('');
  const [comments, setComments] = useState({});
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    setTasks(storedTasks);
    setFilteredTasks(storedTasks);

    const storedComments = JSON.parse(localStorage.getItem('comments')) || {};
    setComments(storedComments);
  }, []);

  const isTaskLate = (task) => {
    const today = new Date();
    const dateFin = new Date(task.dateFin);
    return task.statut !== 'Terminé' && dateFin < today;
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    filterTasks(tasks, status);
  };

  const filterTasks = (tasks, status) => {
    const assignedTasks = tasks.filter((task) =>
      task.intervenants.includes(currentUser.username)
    );

    let filtered;
    if (status === 'overdue') {
      filtered = assignedTasks.filter(isTaskLate);
      setNoTasksMessage(filtered.length === 0 ? 'Aucune tâche en retard.' : '');
    } else if (status === '') {
      filtered = assignedTasks;
      setNoTasksMessage('');
    } else {
      filtered = assignedTasks.filter((task) => task.statut === status);
      setNoTasksMessage(
        filtered.length === 0 ? `Aucune tâche ${status.toLowerCase()}.` : ''
      );
    }

    setFilteredTasks(filtered);
  };

  const updateTaskStatus = (taskId, newStatus) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, statut: newStatus, timestamp: new Date().getTime() };
      }
      return task;
    });

    setTasks(updatedTasks);
    setFilteredTasks(updatedTasks.filter((task) => task.intervenants.includes(currentUser.username)));
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
  };

  const addComment = (taskId, comment) => {
    if (!comment.trim()) return;

    const updatedComments = {
      ...comments,
      [taskId]: [
        ...(comments[taskId] || []),
        { user: currentUser.username, text: comment, date: new Date() }
      ]
    };

    setComments(updatedComments);
    localStorage.setItem('comments', JSON.stringify(updatedComments));
  };

  return (
    <div className="tasks-container">
      <h3>Mes Tâches Assignées</h3>
      <p className="userconected">
        Utilisateur connecté : <span>{currentUser.username}</span>
      </p>

      <div className="filters">
        <button
          onClick={() => handleFilterChange('')}
          className={filterStatus === '' ? 'active' : ''}
        >
          <FaFilter /> Toutes
        </button>
        <button
          onClick={() => handleFilterChange('En attente')}
          className={filterStatus === 'En attente' ? 'active' : ''}
        >
          <FaHourglassHalf /> En attente
        </button>
        <button
          onClick={() => handleFilterChange('En cours')}
          className={filterStatus === 'En cours' ? 'active' : ''}
        >
          <FaHourglassHalf /> En cours
        </button>
        <button
          onClick={() => handleFilterChange('Terminé')}
          className={filterStatus === 'Terminé' ? 'active' : ''}
        >
          <FaCheckCircle /> Terminé
        </button>
        <button
          onClick={() => handleFilterChange('Annulé')}
          className={filterStatus === 'Annulé' ? 'active' : ''}
        >
          <FaTimesCircle /> Annulé
        </button>
        <button
          onClick={() => handleFilterChange('overdue')}
          className={filterStatus === 'overdue' ? 'active' : ''}
        >
          <FaExclamationCircle /> En retard
        </button>
      </div>

      {noTasksMessage && (
        <p className="no-tasks-message">
          <span>{noTasksMessage}</span>
        </p>
      )}

      {filteredTasks.length > 0 ? (
        <ul className="tasks-list">
          {filteredTasks.map((task) => (
            <li
              key={task.id}
              className={`task-item1 ${
                isTaskLate(task) ? 'overdue-task' : ''
              }`}
            >
              <h4>{task.titre}</h4>
              <p>
                <strong>Entreprise :</strong> {task.company}
              </p>
              <p>
                <strong>Catégories :</strong> {task.categories.join(', ')}
              </p>
              <p>
                <strong>Intervenants :</strong> {task.intervenants.join(', ')}
              </p>
              <div className="task-item1-date">
                <p>
                  <strong>Date de début :</strong> {task.dateDebut}
                </p>
                <p>
                  <strong>Date de fin :</strong> {task.dateFin || 'Non spécifiée'}
                </p>
                <p>
                  <strong>Statut :</strong> {task.statut}
                </p>
              </div>

              <div className="task-actions">
                <button
                  className="btn-start"
                  onClick={() => updateTaskStatus(task.id, 'En cours')}
                  disabled={task.statut === 'En cours'}
                >
                  En cours
                </button>
                <button
                  className="btn-complete"
                  onClick={() => updateTaskStatus(task.id, 'Terminé')}
                  disabled={task.statut === 'Terminé'}
                >
                  Terminer
                </button>
                <button
                  className="btn-cancel"
                  onClick={() => updateTaskStatus(task.id, 'Annulé')}
                  disabled={task.statut === 'Annulé'}
                >
                  Annuler
                </button>
              </div>

              <div className="task-comments">
                <h5>Commentaires</h5>
                {comments[task.id]?.length > 0 ? (
                  <ul>
                    {comments[task.id].map((comment, index) => (
                      <li key={index}>
                        <p className='comment-one'>
                          <strong>{comment.user} :</strong> {comment.text}
                        </p>
                        <span>
                          {new Date(comment.date).toLocaleString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>Aucun commentaire.</p>
                )}
              </div>

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
      ) : (
        !noTasksMessage && <p>Aucune tâche assignée trouvée.</p>
      )}
    </div>
  );
}

export default Tasksinter;
