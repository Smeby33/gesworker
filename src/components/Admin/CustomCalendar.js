import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import { FaTh, FaList, FaPlusCircle, FaFilter, FaCheckCircle, FaHourglassHalf } from 'react-icons/fa';
import '../css/CustomCalendar.css'; // Assurez-vous de mettre à jour les styles

function CustomCalendar() {
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // "list" ou "calendar"
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState('month');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    setTasks(storedTasks);
    setFilteredTasks(storedTasks);
  }, []);

  const saveTasksToLocalStorage = (updatedTasks) => {
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  const handleFilterChange = () => {
    const now = new Date();
    const filtered = tasks.filter((task) => {
      const taskDate = new Date(task.dateDebut);
      // Filtrage par période
      if (filterPeriod === 'month') {
        return (
          taskDate.getMonth() === now.getMonth() &&
          taskDate.getFullYear() === now.getFullYear()
        );
      }
      return true;
    });

    // Filtrage par statut
    if (filterStatus !== 'all') {
      setFilteredTasks(
        filtered.filter((task) => task.statut === filterStatus)
      );
    } else {
      setFilteredTasks(filtered);
    }
  };

  useEffect(() => {
    handleFilterChange();
  }, [tasks, filterPeriod, filterStatus]);

  

  const toggleTaskStatus = (taskId) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId
        ? { ...task, statut: task.statut === 'En attente' ? 'Terminé' : 'En attente' }
        : task
    );
    saveTasksToLocalStorage(updatedTasks);
  };

  return (
    <div className="custom-calendar-container">
      {/* En-tête avec filtres et basculement de vue */}
      <div className="header">
        <div className="filters">
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
          >
            <option value="month">Mois</option>
            <option value="week">Semaine</option>
            <option value="day">Jour</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">Tous</option>
            <option value="En attente">En attente</option>
            <option value="Terminé">Terminé</option>
          </select>
        </div>

        <div className="view-toggle">
          <button
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
          >
            <FaList /> Liste
          </button>
          <button
            className={viewMode === 'calendar' ? 'active' : ''}
            onClick={() => setViewMode('calendar')}
          >
            <FaTh /> Calendrier
          </button>
        </div>
        {/* <button onClick={addTask}>
          <FaPlusCircle /> Ajouter Tâche
        </button> */}
      </div>

      {/* Vue Liste */}
      {viewMode === 'list' && (
        <div className="task-list">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div key={task.id} className="task-item">
                    <div className="intervenant-col">{task.categories && task.categories.length > 0 ? task.categories.map((cat, index) => (
                      
                     
                         
                          <span >{cat.name},</span> 
                        
                      
                    )) : <div  className="intervenant-col" >Aucune catégorie.</div >}</div>
                <div  className="intervenant-col" >{task.company}</div>
                <p>Début : {new Date(task.dateDebut).toLocaleDateString()}</p>
                <p>Fin : {new Date(task.dateFin).toLocaleDateString()}</p>
                <p>Statut : {task.statut}</p>
                <button onClick={() => toggleTaskStatus(task.id)}>
                  {task.statut === 'En attente' ? (
                    <FaCheckCircle />
                  ) : (
                    <FaHourglassHalf />
                  )}{' '}
                  {task.statut === 'En attente' ? 'Marquer Terminé' : 'En attente'}
                </button>
              </div>
            ))
          ) : (
            <p>Aucune tâche disponible.</p>
          )}
        </div>
      )}

      {/* Vue Calendrier */}
      {viewMode === 'calendar' && (
        <Calendar
          value={currentDate}
          onChange={setCurrentDate}
          tileContent={({ date, view }) => {
            if (view === 'month') {
              const dayTasks = tasks.filter(
                (task) => new Date(task.dateDebut).toDateString() === date.toDateString()
              );
              return (
                <div>
                  {dayTasks.map((task) => (
                    <span
                      key={task.id}
                      className={`calendar-task ${
                        task.statut === 'Terminé' ? 'completed' : 'pending'
                      }`}
                    >
                      {task.titre}
                    </span>
                  ))}
                </div>
              );
            }
          }}
        />
      )}
    </div>
  );
}

export default CustomCalendar;
