import React, { useEffect, useState } from 'react';
import TaskCreation from './TaskCreation';
import { getAuth, } from "firebase/auth";
import TaskComments from '../Intervenant/TaskComments';
 import { FaCheckCircle,FaUserPlus, FaHourglassHalf, FaTh, FaTimesCircle,FaFileMedical, FaFilter, FaList,FaMailBulk, FaExclamationTriangle } from 'react-icons/fa';
import '../css/Tasks.css';


const PRIORITIES = [
  { id: 1, label: 'Priorité Maximale' },
  { id: 2, label: 'Priorité Élevée' },
  { id: 3, label: 'Priorité Moyenne' },
  { id: 4, label: 'Priorité Faible' },
  { id: 5, label: 'Priorité Nulle' }
];

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filter, setFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState(null); // Nouvel état pour le filtre de priorité
  const [noTasksMessage, setNoTasksMessage] = useState('');
  const [comments, setComments] = useState({});
  const [currentUser, setCurrentUser] = useState('Admin');
  const [taskStats, setTaskStats] = useState({});
  const [viewMode, setViewMode] = useState('list');
  const [ajoutertache, setAjoutertache] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedTaskIdbtn, setSelectedTaskIdbtn] = useState(null);
  const [countTasks, setCountTasks] = useState(0);
  const [adminEmail, setAdminEmail] = useState('');
  const auth = getAuth();
    

  const getPriorityColor = (priorityId) => {
    switch(priorityId) {
      case 1: return '#ff6b6b'; // Rouge
      case 2: return '#ffa502'; // Orange
      case 3: return '#feca57'; // Jaune
      case 4: return '#48dbfb'; // Bleu clair
      case 5: return '#c8d6e5'; // Gris
      default: return '#ddd';   // Gris par défaut
    }
  };
  // Récupérer les tâches et commentaires depuis le localStorage
  useEffect(() => {
    const fetchTasks = async () => {
      if (auth.currentUser) {
        setAdminEmail(auth.currentUser.email);
        const adminUID = auth.currentUser.uid;
        try {
          const response = await fetch(`https://gesworkerback.onrender.com/taches/tasks-by-owner/${adminUID}`);
          const data = await response.json();
          console.log("Données reçues :", data);
          if (Array.isArray(data)) {
            setTasks(data);
            setCountTasks(data.length);
            setTaskStats(countTasksByStatus(data));
          }

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
    console.log("Mise à jour sous-statut :", { taskId, categoryIndex, newSubStatus });

    setTasks(prevTasks => {
        return prevTasks.map(task => {
            if (task.id === taskId) {
                const updatedCategories = task.categories.map((cat, idx) =>
                    idx === categoryIndex ? { ...cat, sousStatut: newSubStatus } : cat
                );

                const allCompleted = updatedCategories.every(cat => cat.sousStatut === "Terminé");

                // Mettre à jour le statut global en même temps
                const newStatus = allCompleted ? "Terminé" : task.statut;

                // Envoyer la mise à jour à l'API avec les catégories actualisées
                updateTaskStatus(taskId, newStatus, updatedCategories);

                return { ...task, categories: updatedCategories, statut: newStatus };
            }
            return task;
        });
    });
};

  // Mise à jour du statut d'une tâche
  const updateTaskStatus = async (id, newStatus, categories = []) => {
    try {
        console.log(`Mise à jour du statut de la tâche ${id} vers : ${newStatus}`);
        console.log("Données envoyées :", { statut: 'Terminé', categories });
        console.log(categories)
        
        const response = await fetch(`https://gesworkerback.onrender.com/taches/updatestatus/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ statut: newStatus, categories }), // Ajout des catégories
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Erreur HTTP: ${response.status} - ${errorText}`);
        }

        const updatedTask = await response.json();
        console.log("Réponse de l'API :", updatedTask);
        
        setTasks(prevTasks =>
            prevTasks.map(task =>
                task.id === id ? { ...task, statut: newStatus } : task
            )
        );

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

  const handlePriorityFilterChange = (priorityId) => {
    setPriorityFilter(priorityId);
    filterTasks(tasks, filter);
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
    if (priorityFilter) {
      filtered = filtered.filter(task => task.priorite === priorityFilter);
    }

    // Tri par priorité (la plus haute priorité en premier)
    filtered.sort((a, b) => {
      if (!a.priorite) return 1;
      if (!b.priorite) return -1;
      return a.priorite - b.priorite;
    });

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
    {ajoutertache && (
                  <TaskCreation closeForm={() => setAjoutertache(false)} />
                )}
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
      <button onClick={() => setAjoutertache((prev) => !prev)}>
        <FaFileMedical/> Tâches
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

    <div className="priority-filters">
      <span>Priorité: </span>
      <button 
        onClick={() => handlePriorityFilterChange(null)} 
        className={!priorityFilter ? 'active' : ''}
      >
        Toutes
      </button>
      {PRIORITIES.map(priority => (
        <button
          key={priority.id}
          onClick={() => handlePriorityFilterChange(priority.id)}
          className={priorityFilter === priority.id ? 'active' : ''}
          style={{ backgroundColor: getPriorityColor(priority.id) }}
        >
          {priority.label}
        </button>
      ))}
    </div>

    {noTasksMessage && <p className="no-tasks-message"><span>{noTasksMessage}</span></p>}
    
    {filteredTasks.length === 0 && !noTasksMessage ? (
      <div>
        <p>Aucune tâche trouvée.</p>
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
                          value={cat.sousStatut}
                          onChange={(e) => {
                            const newSubStatus = e.target.value;
                            updateCategorySubStatus(task.id, index, newSubStatus);
                        
                            // Vérifie si toutes les sous-catégories sont à "Terminé"
                            const allCompleted = task.categories.every((c, idx) => 
                              idx === index ? newSubStatus === "Terminé" : c.sousStatut === "Terminé"
                            );
                        
                            if (allCompleted) {
                              updateTaskStatus(task.id, "Terminé");
                            }
                          }}
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

               
                
                {selectedTaskIdbtn === task.id && (
                  <div className="task-actions">
                    <button onClick={() => updateTaskStatus(task.id, 'En cours')}>En cours</button>
                    <button onClick={() => updateTaskStatus(task.id, 'Terminé')}>Terminer</button>
                    <button onClick={() => updateTaskStatus(task.id, 'Annulé')}>Annuler</button>
                  </div>
                )}

               {/* Afficher les commentaires uniquement si la tâche est sélectionnée */}
               {selectedTaskId === task.id && (
                  <TaskComments taskId={task.id} currentUser={auth.currentUser} />
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
