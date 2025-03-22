import React, { useEffect, useState } from 'react';
import Calendar from 'react-calendar';
import { getAuth } from "firebase/auth";
import { FaTh, FaList, FaCheckCircle, FaHourglassHalf } from 'react-icons/fa';
import '../css/CustomCalendar.css';

function CustomCalendar() {
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // "list" ou "calendar"
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [filterPeriod, setFilterPeriod] = useState('month');
  const [filterStatus, setFilterStatus] = useState('all');
  const [adminEmail, setAdminEmail] = useState('');
  const auth = getAuth();
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const fetchTasks = async () => {
      if (auth.currentUser) {
        setAdminEmail(auth.currentUser.email);
        const adminUID = auth.currentUser.uid;
        try {
          const response = await fetch(`http://localhost:5000/taches/tasks-by-owner/${adminUID}`);
          const data = await response.json();
          const formattedData = data.map(task => ({
            
            ...task,
            date_debut: task.date_debut ? new Date(task.date_debut) : null,
            date_fin: task.date_fin ? new Date(task.date_fin) : null,
            categories: task.categories ? task.categories.split(',').map(cat => ({ name: cat.trim(), sousStatut: 'En cours' })) : [],
            intervenants: task.intervenants ? task.intervenants.split(',') : [],
            
            
          }
        ));
          
          
          setTasks(formattedData);
          setFilteredTasks(formattedData);
        } catch (error) {
          console.error("Erreur lors de la récupération des tâches :", error);
        }
      }
    };
    fetchTasks();
  }, [auth.currentUser]);

  const saveTasksToLocalStorage = (updatedTasks) => {
    localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  const handleFilterChange = () => {
    const now = new Date();
    const filtered = tasks.filter((task) => {
      const taskDate = new Date(task.date_debut);
      // Filtrage par période
      if (filterPeriod === 'month') {
        return taskDate.getMonth() === now.getMonth() && taskDate.getFullYear() === now.getFullYear();
      }
      return true;
    });

    // Filtrage par statut
    if (filterStatus !== 'all') {
      setFilteredTasks(filtered.filter((task) => task.statut === filterStatus));
    } else {
      setFilteredTasks(filtered);
    }
  };

  useEffect(() => {
    if (tasks.length > 0) {
      handleFilterChange();
    }
  }, [tasks, filterPeriod, filterStatus]);
  console.log("Tasks filtrées :", filteredTasks);


  const toggleTaskStatus = (taskId) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId
        ? { ...task, statut: task.statut === 'En attente' ? 'Terminé' : 'En attente' }
        : task
    );
    saveTasksToLocalStorage(updatedTasks);
  };

  // Fonction pour récupérer les tâches d'un jour spécifique
  const getTasksForDay = (date) => {
    return tasks.filter((task) => {
      if (!task.date_debut) return false;
      return (
        task.date_debut.getFullYear() === date.getFullYear() &&
        task.date_debut.getMonth() === date.getMonth() &&
        task.date_debut.getDate() === date.getDate()
      );
    });
  };
  

  return (
    <div className="custom-calendar-container">
      {/* En-tête avec filtres et basculement de vue */}
      <div className="header">
        <div className="filters">
          <select value={filterPeriod} onChange={(e) => setFilterPeriod(e.target.value)}>
            <option value="month">Mois</option>
            <option value="week">Semaine</option>
            <option value="day">Jour</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Tous</option>
            <option value="En attente">En attente</option>
            <option value="Terminé">Terminé</option>
          </select>
        </div>
        <div className="view-toggle">
          <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}>
            <FaList /> Liste
          </button>
          <button className={viewMode === 'calendar' ? 'active' : ''} onClick={() => setViewMode('calendar')}>
            <FaTh /> Calendrier
          </button>
        </div>
      </div>

      {/* Vue Liste */}
      {viewMode === 'list' && (
        <div className="task-list">
          {filteredTasks.length > 0 ? (
            filteredTasks.map((task) => (
              <div key={task.id} className="task-item">
                <div className="affichagelist">
                  <div className="intervenant-row">
                    <div className="intervenant-col">
                      {task.categories && task.categories.length > 0
                        ? task.categories.map((cat, index) => <span key={index}>{cat.name}</span>)
                        : <div>Aucune catégorie.</div>}
                    </div>
                    <div className="intervenant-col">{task.company}</div>
                    <div className="intervenant-col">
                      <p>Début : {task.date_debut ? new Date(task.date_debut).toLocaleDateString() : "Non défini"}</p>
                      <p>Fin : {task.date_fin ? new Date(task.date_fin).toLocaleDateString() : "Non défini"}</p>
                    </div>
                    <div className="intervenant-col"><p>Statut : {task.statut}</p></div>
                    <button onClick={() => toggleTaskStatus(task.id)}>
                      {task.statut === 'En attente' ? <FaCheckCircle /> : <FaHourglassHalf />}
                      {task.statut === 'En attente' ? 'Marquer Terminé' : 'En attente'}
                    </button>
                  </div>
                </div>
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
              const dayTasks = getTasksForDay(date);
              return dayTasks.length > 0 ? (
                <div className="calendar-tasks">
                  {dayTasks.map((task) => (
                    <span key={task.id} className={task.statut === 'Terminé' ? 'completed' : 'pending'}>
                      {task.titre}
                    </span>
                  ))}
                </div>
              ) : null;
            }
          }}
        />
      )}
    </div>
  );
}

export default CustomCalendar;
