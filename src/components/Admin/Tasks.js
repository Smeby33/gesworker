import React, { useEffect, useState } from 'react';
import TaskCreation from './TaskCreation';
import { FaCheckCircle, FaHourglassHalf, FaTh, FaTimesCircle, FaFilter, FaList,FaMailBulk, FaExclamationTriangle } from 'react-icons/fa';
import '../css/Tasks.css';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filter, setFilter] = useState('');
  const [noTasksMessage, setNoTasksMessage] = useState('');
  const [comments, setComments] = useState({});
  const [currentUser, setCurrentUser] = useState('Admin'); // Simuler un utilisateur connecté
  const [taskStats, setTaskStats] = useState({});
  const [viewMode, setViewMode] = useState('list');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTaskIdbtn, setSelectedTaskIdbtn] = useState(null);


  // Récupérer les tâches et commentaires depuis le localStorage
  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    setTasks(storedTasks);
    setFilteredTasks(storedTasks);

    const storedComments = JSON.parse(localStorage.getItem('comments')) || {};
    setComments(storedComments);
  }, []);

  const handleCategoryClick = (taskId, index) => {
    setSelectedCategory((prevState) => ({
      ...prevState,
      [taskId]: index // Stocke l'index de la catégorie sélectionnée pour chaque tâche
    }));
  };

  const isCategorySelected = (taskId, index) => {
    if (!selectedCategory || !taskId) return false; // Vérifie que "selectedCategory" et "taskId" existent
    return selectedCategory[taskId] === index; // Compare si l'index correspond
  };

  // Fonction pour vérifier si une tâche est en retard
  const isTaskOverdue = (task) => {
    const today = new Date();
    const dateFin = new Date(task.dateFin);
    return task.statut !== 'Terminé' && dateFin < today;
  };

  const saveTasksToLocalStorage = (updatedTasks) => {
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
    filterTasks(updatedTasks, filter);
  };

  // Vérification si toutes les catégories sont terminées
  const areAllCategoriesCompleted = (categories) =>
    categories.every((cat) => cat.sousStatut === 'Terminé');

  // Mettre à jour le sous-statut d'une catégorie
  const updateCategorySubStatus = (taskId, categoryIndex, newSubStatus) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const updatedCategories = task.categories.map((cat, index) => {
          if (index === categoryIndex) {
            return { ...cat, sousStatut: newSubStatus };
          }
          return cat;
        });

        // Si toutes les catégories sont terminées, mettre la tâche à "Terminé"
        const allCategoriesCompleted = areAllCategoriesCompleted(updatedCategories);

        return {
          ...task,
          categories: updatedCategories,
          statut: allCategoriesCompleted ? 'Terminé' : task.statut,
        };
      }
      return task;
    });

    saveTasksToLocalStorage(updatedTasks);
  };

  // Mise à jour du statut d'une tâche
  const updateTaskStatus = (id, newStatus) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, statut: newStatus } : task
    );
    setTasks(updatedTasks);
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    filterTasks(updatedTasks, filter);
  };

  // Fonction de filtrage
  const handleFilterChange = (status) => {
    setFilter(status);
    filterTasks(tasks, status);
  };

  // Filtrer les tâches en fonction du statut
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

  // Ajouter un commentaire avec le nom de l'utilisateur
  const addComment = (taskId, comment) => {
    if (!comment.trim()) return;

    const updatedComments = {
      ...comments,
      [taskId]: [
        ...(comments[taskId] || []),
        { user: currentUser, text: comment, date: new Date() }
      ]
    };

    setComments(updatedComments);
    localStorage.setItem('comments', JSON.stringify(updatedComments));
  };

  // Fonction pour compter les tâches par statut
  const countTasksByStatus = (tasks) => {
    return tasks.reduce(
      (acc, task) => {
        acc[task.statut] = (acc[task.statut] || 0) + 1;
        if (task.statut !== 'Terminé' && new Date(task.dateFin) < new Date()) {
          acc.overdue += 1;
        }
        return acc;
      },
      { 'En attente': 0, 'En cours': 0, 'Terminé': 0, 'Annulé': 0, overdue: 0 }
    );
  };

  // Mettre à jour les statistiques des tâches
  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const stats = countTasksByStatus(storedTasks);
    setTaskStats(stats);
  }, []);

  return (
    <div className="tasks-container">
      <h3 id="taches">Liste des Tâches</h3>
      <div className="countertask">
        <p className="ptachestyle">Tâches terminées : {taskStats['Terminé'] || 0}</p>
        <p className="ptachestyle">Tâches En cours : {taskStats['En cours'] || 0}</p>
        <p className="ptachestyle">Tâches En attente : {taskStats['En attente'] || 0}</p>
        <p className="ptachestyle">Tâches Annulé : {taskStats['Annulé'] || 0}</p>
        <p className="ptachestyle">Tâches en retard : {taskStats.overdue || 0}</p>
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
        <button onClick={() => handleFilterChange('')} className={filter === '' ? 'active' : ''}>
          <FaFilter /> Tous
        </button>
        <button onClick={() => handleFilterChange('En cours')} className={filter === 'En cours' ? 'active' : ''}>
          <FaHourglassHalf /> En cours
        </button>
        <button onClick={() => handleFilterChange('Terminé')} className={filter === 'Terminé' ? 'active' : ''}>
          <FaCheckCircle /> Terminé
        </button>
        <button onClick={() => handleFilterChange('Annulé')} className={filter === 'Annulé' ? 'active' : ''}>
          <FaTimesCircle /> Annulé
        </button>
        <button onClick={() => handleFilterChange('overdue')} className={filter === 'overdue' ? 'active overdue' : ''}>
          <FaExclamationTriangle /> En retard
        </button>
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
            
            <div
            key={task.id}
            className={`task-item ${isTaskOverdue(task) ? 'overdue-task' : ''}`}

          >
                <div className="affichagelist">
                
                <div className="intervenant-row">
                  <div className="category-itemparent" id='cate'>
                  {task.categories && task.categories.length > 0 ? task.categories.map((cat, index) => (
                      
                      <div
                        key={index}
                        onClick={() => handleCategoryClick(task.id, index)} // Définit la catégorie sélectionnée
                      >
                        {isCategorySelected(task.id, index) ? (
                          <select
                            value={cat.sousStatut}
                            onChange={(e) => updateCategorySubStatus(task.id, index, e.target.value)}
                            onBlur={() => setSelectedCategory((prevState) => ({ ...prevState, [task.id]: null }))} // Cache le <select>
                          >
                            <option value="En cours">En cours</option>
                            <option value="Terminé">Terminé</option>
                          </select>
                        ) : (
                          <p >{cat.name}</p> // Affiche le nom de la catégorie si ce n'est pas sélectionné
                        )}
                      </div>
                      
                    )) : <div  className="intervenant-col" >Aucune catégorie.</div >}
                  </div>
                  <div className="intervenant-col" id='cate'><p>{Array.isArray(task.intervenants) ? task.intervenants.join(', ') : 'Non spécifié'} </p> </div>
                  <div  className="intervenant-col" id='cate'> <p> {task.dateDebut} </p> <p> {task.dateFin || 'Non sdivécifiée'} </p>  </div>
                  <div   className="intervenant-col"> <p onClick={() => setSelectedTaskIdbtn(selectedTaskIdbtn === task.id ? null : task.id)} > {task.statut} </p> </div>
                  <div  className="intervenant-col" ><p>{task.company}</p></div>
                  <button
                    onClick={() => setSelectedTaskId(selectedTaskId === task.id ? null : task.id)} >
                    <FaMailBulk/>
                  </button>
                </div>

               
                
                {selectedTaskIdbtn === task.id && (
                  <div className="task-actions">
                    <button onClick={() => updateTaskStatus(task.id, 'En cours')}>En cours</button>
                    <button onClick={() => updateTaskStatus(task.id, 'Terminé')}>Terminer</button>
                    <button onClick={() => updateTaskStatus(task.id, 'Annulé')}>Annuler</button>
                  </div>
                )}

               {/* Afficher les commentaires uniquement si la tâche est sélectionnée */}
               {selectedTaskId === task.id && (
                    <div className="lescoment">
                      <div className="task-comments">
                        <h5>Commentaires</h5>
                        {comments[task.id]?.length > 0 ? (
                          <ul>
                            {comments[task.id].map((comment, index) => (
                              <li key={index}>
                                <p><strong>{comment.user} :</strong> {comment.text}</p>
                                <span>{new Date(comment.date).toLocaleString()}</span>
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
                    </div>
                  )}
              
              </div>

              
            </div>
            
          ))}
        </div>
      )}
    </div>
  );
}

export default Tasks;
