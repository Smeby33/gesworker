import React, { useEffect, useState } from 'react';
import TaskCreation from './TaskCreation';
import { getAuth, } from "firebase/auth";
import { FaCheckCircle,FaUserPlus, FaHourglassHalf, FaTh, FaTimesCircle, FaFilter, FaList,FaMailBulk, FaExclamationTriangle } from 'react-icons/fa';
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
  const [ajoutertache, setAjoutertache] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTaskIdbtn, setSelectedTaskIdbtn] = useState(null);
  const [adminEmail, setAdminEmail] = useState('');
  const auth = getAuth();
    
  


  // Récupérer les tâches et commentaires depuis le localStorage
  useEffect(() => {
    const fetchTasks = async () => {
      if (auth.currentUser) {
        setAdminEmail(auth.currentUser.email);
        const adminUID = auth.currentUser.uid;
        try {
          const response = await fetch(`http://localhost:5000/taches/tasks-by-owner/${adminUID}`);
          const data = await response.json();
          console.log("Données reçues :", data);

          const formattedData = data.map(task => ({
            ...task,
            date_debut: task.date_debut ? new Date(task.date_debut) : null,
            date_fin: task.date_fin ? new Date(task.date_fin) : null,
            categories: task.categories
              ? task.categories.split(',').map(cat => ({ name: cat.trim(), sousStatut: 'En cours' }))
              : [],
            intervenants: task.intervenants ? task.intervenants.split(',') : []
          }));
          
          console.log("Données après transformation :", formattedData);
          
  
          // Convertir les champs 'categories' et 'intervenants' en tableaux
          
          
          
  
          setTasks(Array.isArray(formattedData) ? formattedData : []);
          setFilteredTasks(Array.isArray(formattedData) ? formattedData : []);
        } catch (error) {
          console.error("Erreur lors de la récupération des tâches :", error);
          setTasks([]);
          setFilteredTasks([]);
        }
      }
    };
  
    fetchTasks();
  
    const storedComments = JSON.parse(localStorage.getItem('comments')) || {};
    setComments(storedComments);
  }, []);
  
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
    const date_fin = new Date(task.date_fin);
    return task.statut !== 'Terminé' && date_fin < today;
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
  const updateTaskStatus = async (id, newStatus) => {
    try {
      console.log(`Mise à jour du statut de la tâche ${id} vers : ${newStatus}`);
  
      const response = await fetch(`http://localhost:5000/taches/updatestatus/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ statut: newStatus }),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
      }
  
      const updatedTask = await response.json();
      console.log("ID envoyé :", id);
      console.log("Statut envoyé :", newStatus);
      console.log("Réponse de l'API :", updatedTask);

  
      // Vérifier que l'API renvoie bien la tâche mise à jour
      if (!updatedTask || !updatedTask.id) {
        throw new Error("Réponse invalide de l'API.");
      }
  
      // Mettre à jour l'état local
      setTasks(prevTasks =>
        prevTasks.map(task =>
          task.id === id ? { ...task, statut: newStatus } : task
        )
      );
  
      // Mettre à jour l'affichage des tâches filtrées
      filterTasks(tasks, filter);
  
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
    }
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
        if (task.statut !== 'Terminé' && new Date(task.date_fin) < new Date()) {
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
        <button onClick={() => setAjoutertache((prev) => !prev)} >
          <FaUserPlus/> Tâches
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
          {filteredTasks.map(task =>{ 
            console.log(task.date_debut);
            
            return(
            
            <div
            key={task.id}
            className={`task-item ${isTaskOverdue(task) ? 'overdue-task' : ''}`}

          >
                <div className="affichagelist">
                
                <div className="intervenant-row">
                  <div className="category-itemparent" id='cate'>
                  {Array.isArray(task.categories) ? (
                    task.categories.map((cat, index) => (
                      <div key={index} onClick={() => handleCategoryClick(task.id, index)}>
                        {isCategorySelected(task.id, index) ? (
                          <select
                            value={cat.sousStatut} // Maintenant cat a bien un sousStatut
                            onChange={(e) => updateCategorySubStatus(task.id, index, e.target.value)}
                            onBlur={() =>
                              setSelectedCategory((prevState) => ({
                                ...prevState,
                                [task.id]: null,
                              }))
                            }
                          >
                            <option value="En cours">En cours</option>
                            <option value="Terminé">Terminé</option>
                          </select>
                        ) : (
                          <p>{cat.name}</p> // Affiche le nom correctement
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="intervenant-col">Aucune catégorie.</div>
                  )}


                </div>

                  <div className="intervenant-col" id='cate'><p>{Array.isArray(task.intervenants) ? task.intervenants.join(', ') : 'Non spécifié'} </p> </div>
                  <div className="intervenant-col" id='cate'>
                  <p>{formatDate(task.date_debut)}</p>
                  <p>{formatDate(task.date_fin)}</p>

                  </div>

                  <div   className="intervenant-col"> <p onClick={() => setSelectedTaskIdbtn(selectedTaskIdbtn === task.id ? null : task.id)} > {task.statut} </p> </div>
                  <div  className="intervenant-col" ><p>{task.company}</p></div>
                  <button
                    onClick={() => setSelectedTaskId(selectedTaskId === task.id ? null : task.id)} >
                    <FaMailBulk/>
                  </button>
                </div>

                {ajoutertache && (
                  <TaskCreation/>
                  
                )}
                
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
            
          )})}
        </div>
      )}
    </div>
  );
}

export default Tasks;
