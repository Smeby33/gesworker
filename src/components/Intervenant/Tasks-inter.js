import React, { useEffect, useState } from 'react';
import TaskCreation from '../Admin/TaskCreation';
import TaskComments from './TaskComments';
import { getAuth } from "firebase/auth";
import { FaCheckCircle, FaUserPlus, FaHourglassHalf, FaTh, FaTimesCircle, FaFilter, FaList, FaMailBulk, FaExclamationTriangle } from 'react-icons/fa';
import '../css/Tasks.css';

function Tasksinter() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filter, setFilter] = useState('');
  const [noTasksMessage, setNoTasksMessage] = useState('');
  const [currentUser] = useState('Admin');
  const [taskStats, setTaskStats] = useState({});
  const [viewMode, setViewMode] = useState('list');
  const [ajoutertache, setAjoutertache] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTaskIdbtn, setSelectedTaskIdbtn] = useState(null);
  const [countTasks, setCountTasks] = useState(0);
  const [adminEmail, setAdminEmail] = useState('');
  const auth = getAuth();

  useEffect(() => {
    const fetchTasks = async () => {
      if (auth.currentUser) {
        setAdminEmail(auth.currentUser.email);
        const adminUID = auth.currentUser.uid;
        try {
          const response = await fetch(`https://gesworkerback.onrender.com/taches/intervenant/${adminUID}`);
          const data = await response.json();

          if (Array.isArray(data)) {
            const formattedData = data.map(task => ({
              ...task,
              date_debut: task.date_debut ? new Date(task.date_debut) : null,
              date_fin: task.date_fin ? new Date(task.date_fin) : null,
              categories: formatCategories(task.categories),
              intervenants: formatIntervenants(task.intervenants)
            }));

            setTasks(formattedData);
            setFilteredTasks(formattedData);
            setCountTasks(data.length);
            setTaskStats(countTasksByStatus(data));
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des tâches :", error);
          setTasks([]);
          setFilteredTasks([]);
        }
      }
    };

    fetchTasks();
  }, [auth.currentUser]);

  const formatCategories = (categories) => {
    if (Array.isArray(categories)) {
      return categories.map(cat => ({
        name: typeof cat === 'string' ? cat.trim() : cat.name || '',
        sousStatut: cat.sousStatut || 'En cours'
      }));
    }
    if (typeof categories === 'string') {
      return categories.split(',').map(cat => ({
        name: cat.trim(),
        sousStatut: 'En cours'
      }));
    }
    return [];
  };

  const formatIntervenants = (intervenants) => {
    if (Array.isArray(intervenants)) return intervenants;
    if (typeof intervenants === 'string') return intervenants.split(',');
    return [];
  };

  const formatDate = (date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) return "Date invalide";
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + " , " + date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCategoryClick = (taskId, index) => {
    setSelectedCategory(prev => ({ ...prev, [taskId]: index }));
  };

  const isCategorySelected = (taskId, index) => {
    return selectedCategory?.[taskId] === index;
  };

  const isTaskOverdue = (task) => {
    return task.statut !== 'Terminé' && new Date(task.date_fin) < new Date();
  };

  const updateCategorySubStatus = (taskId, categoryIndex, newSubStatus) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id === taskId) {
        const updatedCategories = task.categories.map((cat, idx) =>
          idx === categoryIndex ? { ...cat, sousStatut: newSubStatus } : cat
        );
        
        const allCompleted = updatedCategories.every(cat => cat.sousStatut === "Terminé");
        const newStatus = allCompleted ? "Terminé" : task.statut;
        
        updateTaskStatus(taskId, newStatus, updatedCategories);
        return { ...task, categories: updatedCategories, statut: newStatus };
      }
      return task;
    }));
  };

  const updateTaskStatus = async (id, newStatus, categories = []) => {
    try {
      const response = await fetch(`https://gesworkerback.onrender.com/taches/updatestatus/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ statut: newStatus, categories }),
      });

      if (response.ok) {
        setTasks(prev => prev.map(task => 
          task.id === id ? { ...task, statut: newStatus } : task
        ));
        filterTasks(tasks, filter);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
  };

  const handleFilterChange = (status) => {
    setFilter(status);
    filterTasks(tasks, status);
  };

  const filterTasks = (tasks, status) => {
    let filtered;
    if (status === 'overdue') {
      filtered = tasks.filter(isTaskOverdue);
      setNoTasksMessage(filtered.length === 0 ? 'Aucune tâche en retard trouvée.' : '');
    } else if (status === '') {
      filtered = tasks;
      setNoTasksMessage('');
    } else {
      filtered = tasks.filter(task => task.statut === status);
      setNoTasksMessage(filtered.length === 0 ? `Vous n'avez aucune tâche ${status.toLowerCase()}.` : '');
    }
    setFilteredTasks(filtered);
  };

  const countTasksByStatus = (tasks) => {
    return tasks.reduce((acc, task) => {
      acc[task.statut] = (acc[task.statut] || 0) + 1;
      if (task.statut !== 'Terminé' && new Date(task.date_fin) < new Date()) {
        acc.overdue += 1;
      }
      return acc;
    }, { 'En attente': 0, 'En cours': 0, 'Terminé': 0, 'Annulé': 0, overdue: 0 });
  };

  return (
    <div className="tasks-container">
      <h3 id="taches">Liste des Tâches</h3>
      <div className="countertask">
        {Object.entries(taskStats).map(([statut, count]) => (
          <p key={statut} className="ptachestyle">
            {statut === 'overdue' ? 'Tâches en retard' : `Tâches ${statut.toLowerCase()}`} : {count || 0}
          </p>
        ))}
      </div>

      <div className="view-selector">
        <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}>
          <FaList /> Liste
        </button>
        <button onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'active' : ''}>
          <FaTh /> Grille
        </button>
      </div>

      <div className="filter-buttons">
        {['', 'En cours', 'Terminé', 'Annulé', 'overdue'].map(status => (
          <button
            key={status || 'all'}
            onClick={() => handleFilterChange(status)}
            className={`${filter === status ? 'active' : ''} ${status === 'overdue' ? 'overdue' : ''}`}
          >
            {getFilterIcon(status)} {getFilterLabel(status)}
          </button>
        ))}
      </div>

      {noTasksMessage && <p className="no-tasks-message"><span>{noTasksMessage}</span></p>}

      {filteredTasks.length === 0 && !noTasksMessage ? (
        <div>
          <p>Aucune tâche trouvée.</p>
          <TaskCreation/>
        </div>
      ) : (
        <div className={`tasks-view ${viewMode}`}>
          {filteredTasks.map(task => (
            <div key={task.id} className={`task-item ${isTaskOverdue(task) ? 'overdue-task' : ''}`}>
              <div className="affichagelist">
                <div className="intervenant-row">
                  <div className="category-itemparent" id='cate'>
                    {task.categories.length > 0 ? (
                      task.categories.map((cat, index) => (
                        <div key={index} onClick={() => handleCategoryClick(task.id, index)}>
                          {isCategorySelected(task.id, index) ? (
                            <select
                              value={cat.sousStatut}
                              onChange={(e) => {
                                const newSubStatus = e.target.value;
                                updateCategorySubStatus(task.id, index, newSubStatus);
                                if (task.categories.every((c, idx) => 
                                  idx === index ? newSubStatus === "Terminé" : c.sousStatut === "Terminé"
                                )) {
                                  updateTaskStatus(task.id, "Terminé");
                                }
                              }}
                              onBlur={() => setSelectedCategory(prev => ({ ...prev, [task.id]: null }))}
                            >
                              <option value="En cours">En cours</option>
                              <option value="Terminé">Terminé</option>
                            </select>
                          ) : (
                            <p>{cat.name}</p>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="intervenant-col">Aucune catégorie.</div>
                    )}
                  </div>

                  <div className="intervenant-col" id='cate'>
                    <p>{task.intervenants.join(', ') || 'Non spécifié'}</p>
                  </div>
                  <div className="intervenant-col" id='cate'>
                    <p>{formatDate(task.date_debut)}</p>
                    <p>{formatDate(task.date_fin)}</p>
                  </div>
                  <div className="intervenant-col">
                    <p onClick={() => setSelectedTaskIdbtn(prev => prev === task.id ? null : task.id)}>
                      {task.statut}
                    </p>
                  </div>
                  <div className="intervenant-col">
                    <p>{task.company}</p>
                  </div>
                  <button onClick={() => setSelectedTaskId(prev => prev === task.id ? null : task.id)}>
                    <FaMailBulk/>
                  </button>
                </div>

                {ajoutertache && <TaskCreation/>}
                
                {selectedTaskIdbtn === task.id && (
                  <div className="task-actions">
                    <button onClick={() => updateTaskStatus(task.id, 'En cours')}>En cours</button>
                    <button onClick={() => updateTaskStatus(task.id, 'Terminé')}>Terminer</button>
                    <button onClick={() => updateTaskStatus(task.id, 'Annulé')}>Annuler</button>
                  </div>
                )}

                {selectedTaskId === task.id && (
                  <TaskComments taskId={task.id} currentUser={auth.currentUser} />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Fonctions utilitaires pour les filtres
const getFilterIcon = (status) => {
  switch(status) {
    case '': return <FaFilter />;
    case 'En cours': return <FaHourglassHalf />;
    case 'Terminé': return <FaCheckCircle />;
    case 'Annulé': return <FaTimesCircle />;
    case 'overdue': return <FaExclamationTriangle />;
    default: return null;
  }
};

const getFilterLabel = (status) => {
  switch(status) {
    case '': return 'Tous';
    case 'overdue': return 'En retard';
    default: return status;
  }
};

export default Tasksinter;