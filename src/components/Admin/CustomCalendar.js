import React, { useEffect, useState } from 'react';
import '../css/CustomCalendar.css';

function CustomCalendar() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]); // Pour les catégories
  const [intervenants, setIntervenants] = useState([]); // Pour les intervenants
  const [companies, setCompanies] = useState([]); // Pour les entreprises
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterPeriod, setFilterPeriod] = useState('month'); // Période de filtre
  const [filterStatus, setFilterStatus] = useState('all'); // Sous-filtre par statut
  const [isEditing, setIsEditing] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

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

  const saveTasksToLocalStorage = (updatedTasks) => {
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  const filterTasksByPeriod = () => {
    const now = new Date();
    const filteredTasks = tasks.filter((task) => {
      const taskDate = new Date(task.dateDebut);
      switch (filterPeriod) {
        case 'day':
          return taskDate.toDateString() === now.toDateString();
        case 'week':
          const weekStart = new Date(now); // Créer une nouvelle instance pour ne pas modifier 'now'
          weekStart.setDate(now.getDate() - now.getDay());
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekStart.getDate() + 6);
          return taskDate >= weekStart && taskDate <= weekEnd;
        case 'month':
          return (
            taskDate.getMonth() === now.getMonth() &&
            taskDate.getFullYear() === now.getFullYear()
          );
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3) + 1;
          const startMonth = (quarter - 1) * 3;
          const quarterStart = new Date(now.getFullYear(), startMonth, 1);
          const quarterEnd = new Date(now.getFullYear(), startMonth + 3, 0);
          return taskDate >= quarterStart && taskDate <= quarterEnd;
        case 'semester':
          const semesterStart = now.getMonth() < 6 ? 0 : 6;
          const semesterEnd = semesterStart + 5;
          return (
            taskDate.getMonth() >= semesterStart &&
            taskDate.getMonth() <= semesterEnd &&
            taskDate.getFullYear() === now.getFullYear()
          );
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

  const openEditModal = (task) => {
    setTaskToEdit({ ...task }); // Cloner pour éviter des références directes
    setIsEditing(true);
  };

  const closeEditModal = () => {
    setTaskToEdit(null);
    setIsEditing(false);
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!taskToEdit.categories.length || !taskToEdit.intervenants.length) {
      alert('Veuillez sélectionner au moins une catégorie et un intervenant.');
      return;
    }
    const updatedTasks = tasks.map((task) =>
      task.id === taskToEdit.id ? { ...taskToEdit } : task
    );
    saveTasksToLocalStorage(updatedTasks);
    closeEditModal();
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setTaskToEdit({ ...taskToEdit, [name]: value });
  };

  useEffect(() => {
    if (isEditing) {
      document.querySelector('input')?.focus();
    }
  }, [isEditing]);

  return (
    <div className="calendar-container" id="calendar">
      <h3>Calendrier des Tâches</h3>

      {/* Filtres principaux */}
      <div className="filters">
        <label>Filtrer par période :</label>
        <select
          value={filterPeriod}
          onChange={(e) => setFilterPeriod(e.target.value)}
        >
          <option value="day">Jour</option>
          <option value="week">Semaine</option>
          <option value="month">Mois</option>
          <option value="quarter">Trimestre</option>
          <option value="semester">Semestre</option>
          <option value="year">Année</option>
        </select>

        <label>Filtrer par statut :</label>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Tous</option>
          <option value="En attente">En attente</option>
          <option value="En cours">En cours</option>
          <option value="Terminée">Terminée</option>
        </select>
      </div>

      {/* Liste des tâches */}
      <div className="task-list">
        {filteredTasks.length > 0 ? (
          filteredTasks.map((task) => (
            <div key={task.id} className="task-item">
              <h4>Titre : {task.titre}</h4>
              <p><strong>Catégories :</strong> {task.categories.join(', ')}</p>
              <p><strong>Intervenants :</strong> {task.intervenants.join(', ')}</p>
              <p><strong>Entreprise :</strong> {task.company}</p>
              <p><strong>Date de début :</strong> {new Date(task.dateDebut).toLocaleString()}</p>
              <p><strong>Date de fin :</strong> {task.dateFin ? new Date(task.dateFin).toLocaleString() : 'Non spécifiée'}</p>
              <p><strong>Statut :</strong> <span className="status">{task.statut}</span></p>
              <button onClick={() => openEditModal(task)}>Modifier</button>
            </div>
          ))
        ) : (
          <p>Aucune tâche disponible pour cette période et ce statut.</p>
        )}
      </div>

      {/* Formulaire de modification */}
      {isEditing && (
        <div className="modal">
          <div className="modal-content">
            <h4>Modifier la Tâche</h4>
            <form onSubmit={handleEditSubmit}>
              {/* Titre */}
              <label>
                Titre :
                <input
                  type="text"
                  name="titre"
                  value={taskToEdit.titre}
                  onChange={handleEditChange}
                  required
                />
              </label>

              {/* Catégories */}
              <label>Catégories de tâche :</label>
              <div className="checkbox-group">
                {categories.map((category, index) => (
                  <div key={index}>
                    <input
                      type="checkbox"
                      id={`edit-category-${index}`}
                      value={category.name}
                      checked={taskToEdit.categories.includes(category.name)}
                      onChange={(e) => {
                        const updatedCategories = e.target.checked
                          ? [...taskToEdit.categories, category.name]
                          : taskToEdit.categories.filter((cat) => cat !== category.name);
                        setTaskToEdit({ ...taskToEdit, categories: updatedCategories });
                      }}
                    />
                    <label htmlFor={`edit-category-${index}`}>
                      <img src={category.icon} alt="" className="icon" /> {category.name}
                    </label>
                  </div>
                ))}
              </div>

              {/* Intervenants */}
              <label>Intervenants :</label>
              <div className="checkbox-group">
                {intervenants.map((intervenant, index) => (
                  <div key={index}>
                    <input
                      type="checkbox"
                      id={`edit-intervenant-${index}`}
                      value={intervenant.name}
                      checked={taskToEdit.intervenants.includes(intervenant.name)}
                      onChange={(e) => {
                        const updatedIntervenants = e.target.checked
                          ? [...taskToEdit.intervenants, intervenant.name]
                          : taskToEdit.intervenants.filter((int) => int !== intervenant.name);
                        setTaskToEdit({ ...taskToEdit, intervenants: updatedIntervenants });
                      }}
                    />
                    <label htmlFor={`edit-intervenant-${index}`}>
                      <img src={intervenant.icon} alt="" className="icon" /> {intervenant.name}
                    </label>
                  </div>
                ))}
              </div>

              {/* Dates */}
              <label>
                Date de début :
                <input
                  type="date"
                  name="dateDebut"
                  value={new Date(taskToEdit.dateDebut).toLocaleDateString('en-CA')}
                  onChange={handleEditChange}
                />
              </label>
              <label>
                Date de fin :
                <input
                  type="date"
                  name="dateFin"
                  value={taskToEdit.dateFin ? new Date(taskToEdit.dateFin).toLocaleDateString('en-CA') : ''}
                  onChange={handleEditChange}
                />
              </label>

              <button type="submit">Enregistrer</button>
              <button type="button" onClick={closeEditModal}>Annuler</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomCalendar;
