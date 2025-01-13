import React, { useEffect, useState } from 'react';
import {
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaFilter,
  FaExclamationCircle,
  FaList,
  FaTh
} from 'react-icons/fa';
import '../css/Tasks.css';

function Tasksinter() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filterStatus, setFilterStatus] = useState('');
  const [noTasksMessage, setNoTasksMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [comments, setComments] = useState({});
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};
  const [selectedTaskId, setSelectedTaskId] = useState(null);


  // Load tasks and comments from localStorage
  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const filteredAssignedTasks = storedTasks.filter(
      (task) =>
        Array.isArray(task.intervenants) &&
        task.intervenants.includes(currentUser.username)
    );
    setTasks(filteredAssignedTasks);
    setFilteredTasks(filteredAssignedTasks);

    const storedComments = JSON.parse(localStorage.getItem('comments')) || {};
    setComments(storedComments);
  }, []);

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

  // Helpers
  const isTaskLate = (task) => {
    const today = new Date();
    const dateFin = new Date(task.dateFin);
    return task.statut !== 'Terminé' && dateFin < today;
  };

  const isCategorySelected = (taskId, index) => {
    if (!selectedCategory || !taskId) return false;
    return selectedCategory[taskId] === index;
  };

  const areAllCategoriesCompleted = (categories) =>
    categories.every((cat) => cat.sousStatut === 'Terminé');

  const saveTasksToLocalStorage = (updatedTasks) => {
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
    filterTasks(updatedTasks, filterStatus);
  };

  // Update functions
  const updateCategorySubStatus = (taskId, categoryIndex, newSubStatus) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const updatedCategories = task.categories.map((cat, index) => {
          if (index === categoryIndex) {
            return { ...cat, sousStatut: newSubStatus };
          }
          return cat;
        });

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

  const updateTaskStatus = (taskId, newStatus) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        return { ...task, statut: newStatus, timestamp: new Date().getTime() };
      }
      return task;
    });

    saveTasksToLocalStorage(updatedTasks);
  };

  // Filtering tasks
  const filterTasks = (tasks, status) => {
    const assignedTasks = tasks.filter((task) =>
      Array.isArray(task.intervenants) && task.intervenants.includes(currentUser.username)
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

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    filterTasks(tasks, status);
  };

  const handleCategoryClick = (taskId, index) => {
    setSelectedCategory((prevState) => ({
      ...prevState,
      [taskId]: index,
    }));
  };

  // Rendering
  return (
    <div className="tasks-container">
      <h3>Mes Tâches Assignées</h3>
      <p className="userconected">
        Utilisateur connecté : <span>{currentUser.username}</span>
      </p>

      <div className="view-toggle">
        <button
          id='toggle-btn'
          onClick={() => setViewMode('list')}
          className={viewMode === 'list' ? 'active' : ''}
        >
          <FaList /> Liste
        </button>
        <button
          id='toggle-btn'
          onClick={() => setViewMode('grid')}
          className={viewMode === 'grid' ? 'active' : ''}
        >
          <FaTh /> Grille
        </button>
      </div>

      <div className="filters">
        {['', 'En cours', 'Terminé', 'Annulé', 'overdue'].map(
          (status) => (
            <button
              key={status}
              onClick={() => handleFilterChange(status)}
              className={filterStatus === status ? 'active' : ''}
            >
              {status === '' && <FaFilter />} {status === 'overdue' && <FaExclamationCircle />}
              {status === 'En attente' && <FaHourglassHalf />} {status === 'En cours' && <FaHourglassHalf />}
              {status === 'Terminé' && <FaCheckCircle />} {status === 'Annulé' && <FaTimesCircle />}
              {status || 'Toutes'}
            </button>
          )
        )}
      </div>

      {noTasksMessage && <p className="no-tasks-message">{noTasksMessage}</p>}

      <div className={`tasks-view ${viewMode}`}>
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              onClick={() => setSelectedTaskId(selectedTaskId === task.id ? null : task.id)}
              className={`task-item ${isTaskLate(task) ? 'overdue-task' : ''}`}
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
                  <div   className="intervenant-col"> <p> {task.statut} </p> </div>
                  <div  className="intervenant-col" ><p>{task.company}</p></div>

                </div>

               
                

                <div className="task-actions">
                  <button onClick={() => updateTaskStatus(task.id, 'En cours')}>En cours</button>
                  <button onClick={() => updateTaskStatus(task.id, 'Terminé')}>Terminer</button>
                  <button onClick={() => updateTaskStatus(task.id, 'Annulé')}>Annuler</button>
                </div>

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
          ))
        ) : (
          !noTasksMessage && <p>Aucune tâche assignée trouvée.</p>
        )}
      </div>
    </div>
  );
}

export default Tasksinter;
