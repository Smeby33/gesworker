import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaFilter, FaExclamationCircle, FaThList, FaThLarge } from 'react-icons/fa';
import '../css/Tasks.css';

function Tasksinter() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [noTasksMessage, setNoTasksMessage] = useState('');
  const [comments, setComments] = useState({});
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
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

      <div className="view-switcher">
        <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}>
          <FaThList /> Liste
        </button>
        <button onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'active' : ''}>
          <FaThLarge /> Grille
        </button>
      </div>

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

      <div className={viewMode === 'list' ? 'tasks-list' : 'tasks-grid'}>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`task-item ${isTaskLate(task) ? 'overdue-task' : ''}`}
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
              <div className="task-dates">
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
            </div>
          ))
        ) : (
          !noTasksMessage && <p>Aucune tâche assignée trouvée.</p>
        )}
      </div>
    </div>
  );
}

export default Tasksinter;
