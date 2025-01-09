import React, { useEffect, useState } from 'react';
import '../css/CustomCalendar.css';

function CustomCalendar() {

  const [tasks, setTasks] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);

  const [categories, setCategories] = useState([]);
  const [intervenants, setIntervenants] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterPeriod, setFilterPeriod] = useState('month');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [titre, setTitre] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedIntervenants, setSelectedIntervenants] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [dateDebut, setDateDebut] = useState(new Date().toISOString().slice(0, 16));
  const [dateFin, setDateFin] = useState('');
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    setTasks(storedTasks);

    const storedCategories = JSON.parse(localStorage.getItem('categories')) || [];
    setCategories(storedCategories);

    const storedIntervenants = JSON.parse(localStorage.getItem('intervenants')) || [];
    setIntervenants(storedIntervenants);

    const storedCompanies = JSON.parse(localStorage.getItem('clients')) || [];
    setCompanies(storedCompanies);
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

  const isTaskOverdue = (task) => {
    const today = new Date();
    const dateFin = new Date(task.dateFin);
    return task.statut !== 'Terminé' && dateFin < today;
  };

  const areAllCategoriesCompleted = (categories) =>
    categories.every((cat) => cat.sousStatut === 'Terminé');


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

  const filterTasksByPeriod = () => {
    const now = new Date();
    const filteredTasks = tasks.filter((task) => {
      const taskDate = new Date(task.dateDebut);
      switch (filterPeriod) {
        case 'day':
          return taskDate.toDateString() === now.toDateString();
        case 'week':
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - now.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return taskDate >= weekStart && taskDate <= weekEnd;
        case 'month':
          return taskDate.getMonth() === now.getMonth() && taskDate.getFullYear() === now.getFullYear();
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3) + 1;
          const startMonth = (quarter - 1) * 3;
          const quarterStart = new Date(now.getFullYear(), startMonth, 1);
          const quarterEnd = new Date(now.getFullYear(), startMonth + 3, 0);
          return taskDate >= quarterStart && taskDate <= quarterEnd;
        case 'semester':
          const semesterStart = now.getMonth() < 6 ? 0 : 6;
          const semesterEnd = semesterStart + 5;
          return taskDate.getMonth() >= semesterStart && taskDate.getMonth() <= semesterEnd && taskDate.getFullYear() === now.getFullYear();
        case 'year':
          return taskDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });
    return filteredTasks;
  };

  const filterTasksByStatus = (filteredTasks) => {
    if (filterStatus === 'all') return filteredTasks;
    return filteredTasks.filter((task) => task.statut === filterStatus);
  };

  const getFilteredTasks = () => {
    const periodFilteredTasks = filterTasksByPeriod();
    return filterTasksByStatus(periodFilteredTasks);
  };

  const filteredTasks = getFilteredTasks();



  // États pour les champs du formulaire

  useEffect(() => {
    const storedCategories = JSON.parse(localStorage.getItem('taskCategories')) || [];
    const storedIntervenants = JSON.parse(localStorage.getItem('intervenant')) || [];
    const storedCompanies = JSON.parse(localStorage.getItem('clients')) || [];
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];

    setCategories(storedCategories);
    setIntervenants(storedIntervenants);
    setCompanies(storedCompanies);
    setTasks(storedTasks);
  }, []);

  const saveTasksToLocalStorage = (tasks) => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((cat) => cat !== category) : [...prev, category]
    );
  };

  const handleIntervenantChange = (intervenant) => {
    setSelectedIntervenants((prev) =>
      prev.includes(intervenant) ? prev.filter((int) => int !== intervenant) : [...prev, intervenant]
    );
  };

  const handleTaskCreation = (e) => {
    e.preventDefault();

    const newTask = {
      id: tasks.length + 1,
      titre,
      categories: selectedCategories,
      intervenants: selectedIntervenants,
      company: selectedCompany,
      dateDebut,
      dateFin: dateFin || dateDebut,
      statut: 'En attente',
      timestamp: new Date().getTime(),
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasksToLocalStorage(updatedTasks);

    // Réinitialisation des champs
    resetForm();
  };

  const handleEditClick = (taskId) => {
    const taskToEdit = tasks.find((task) => task.id === taskId);
    setEditingTask(taskToEdit);
    setTitre(taskToEdit.titre);
    setSelectedCategories(taskToEdit.categories);
    setSelectedIntervenants(taskToEdit.intervenants);
    setSelectedCompany(taskToEdit.company);
    setDateDebut(taskToEdit.dateDebut);
    setDateFin(taskToEdit.dateFin);
  };

  const handleTaskUpdate = (e) => {
    e.preventDefault();

    const updatedTask = {
      ...editingTask,
      titre,
      categories: selectedCategories,
      intervenants: selectedIntervenants,
      company: selectedCompany,
      dateDebut,
      dateFin,
    };

    const updatedTasks = tasks.map((task) => (task.id === editingTask.id ? updatedTask : task));
    setTasks(updatedTasks);
    saveTasksToLocalStorage(updatedTasks);

    resetForm();
  };

  const resetForm = () => {
    setTitre('');
    setSelectedCategories([]);
    setSelectedIntervenants([]);
    setSelectedCompany('');
    setDateDebut(new Date().toISOString().slice(0, 16));
    setDateFin('');
    setEditingTask(null);
  };

  return (
    <div className="calendar-container" id="calendar">

    <div className="bg-dark text-white p-3 nav-column"> 
      {/* Filtres principaux */}
      <div className="filters">
        <label>Filtrer par période :</label>
        <select value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)}>
          <option value="day">Jour</option>
          <option value="week">Semaine</option>
          <option value="month">Mois</option>
          <option value="quarter">Trimestre</option>
          <option value="semester">Semestre</option>
          <option value="year">Année</option>
        </select>

        <label>Filtrer par statut :</label>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">Tous</option>
          <option value="En attente">En attente</option>
          <option value="En cours">En cours</option>
          <option value="Terminée">Terminée</option>
        </select>
      </div>
    </div>

      {/* Liste des tâches */}
      <div className="task-list">
      <div xs={12} md={9} className="p-4 contenu " id='p-4'>
      <div className="tasks-container">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div
            key={task.id}
            className={`task-item ${isTaskOverdue(task) ? 'overdue-task' : ''}`}
            onClick={() => setSelectedTaskId(selectedTaskId === task.id ? null : task.id)} // Gérer la sélection
          >
                <div className="affichagelist">
                
                  <div className="intervenant-row">

                    <div  className="intervenant-col" >{task.titre}</div>
                    <div  className="intervenant-col" >{task.company}</div>
                    <div  className="intervenant-col">{task.intervenants.join(', ')}</div>
                    <div  className="intervenant-col"> {task.dateDebut}</div>
                    <div  className="intervenant-col" > {task.dateFin || 'Non sdivécifiée'}</div>
                    <div   className="intervenant-col"> {task.statut}</div>

                  </div>

                  <div className="category-itemparent">
                  {task.categories && task.categories.length > 0 ? task.categories.map((cat, index) => (
                      
                      <div
                        key={index}
                        className="category-item"
                        onClick={() => handleCategoryClick(task.id, index)} // Définit la catégorie sélectionnée
                      >
                        {isCategorySelected(task.id, index) ? (
                          <select
                            value={cat.sousStatut}
                            onChange={(e) => updateCategorySubStatus(task.id, index, e.target.value)}
                            onBlur={() => setSelectedCategory((prevState) => ({ ...prevState, [task.id]: null }))} // Cache le <select>
                          >
                            <option value="En attente">En attente</option>
                            <option value="En cours">En cours</option>
                            <option value="Terminé">Terminé</option>
                          </select>
                        ) : (
                          <span >{cat.name}</span> // Affiche le nom de la catégorie si ce n'est pas sélectionné
                        )}
                      </div>
                      
                    )) : <div  className="intervenant-col" >Aucune catégorie.</div >}
                  </div>
                
                </div>
            </div>
          ))
        ) : (
          <p>Aucune tâche disponible pour cette période et ce statut.</p>
        )}
      </div>
      </div>
      </div>

      

    </div>
  );
}

export default CustomCalendar;
