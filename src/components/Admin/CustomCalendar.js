import React, { useEffect, useState, useMemo, useRef } from 'react';
import PropTypes from 'prop-types';
import Calendar from 'react-calendar';
import { getAuth } from "firebase/auth";
import { FaTh, FaList, FaCheckCircle, FaHourglassHalf, FaExclamationTriangle, FaEdit, FaFilePdf, FaCalendarAlt } from 'react-icons/fa';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';
import { createEvents } from 'ics'; // Import modifié ici
import '../css/CustomCalendar.css';

// Composant pour le PDF (à personnaliser)
const TasksPDF = ({ tasks }) => (
  <div>
    {/* Structure du PDF - à adapter avec @react-pdf/renderer */}
    <h1>Liste des Tâches</h1>
    <ul>
      {tasks.map(task => (
        <li key={task.id}>
          {task.titre} - {task.statut}
        </li>
      ))}
    </ul>
  </div>
);

function CustomCalendar() {
  const [tasks, setTasks] = useState([]);
  const [viewMode, setViewMode] = useState('list');
  const [filterPeriod, setFilterPeriod] = useState('month');
  const [filterStatus, setFilterStatus] = useState('all');
  const [adminEmail, setAdminEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [dragTask, setDragTask] = useState(null);
  const auth = getAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const calendarRef = useRef(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Définition du type de tâche
  const taskShape = {
    id: PropTypes.string.isRequired,
    titre: PropTypes.string,
    date_debut: PropTypes.instanceOf(Date),
    date_fin: PropTypes.instanceOf(Date),
    categories: PropTypes.arrayOf(
      PropTypes.shape({
        name: PropTypes.string,
        sousStatut: PropTypes.string
      })
    ),
    intervenants: PropTypes.arrayOf(PropTypes.string),
    company: PropTypes.string,
    statut: PropTypes.oneOf(['En attente', 'Terminé'])
  };

  useEffect(() => {
    const fetchTasks = async () => {
      if (auth.currentUser) {
        setIsLoading(true);
        setError(null);
        setAdminEmail(auth.currentUser.email);
        const adminUID = auth.currentUser.uid;
        
        try {
          const response = await fetch(`http://localhost:5000/taches/tasks-by-owner/${adminUID}`);
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          const data = await response.json();
          console.log("nos taches recus sont",data)
          const formattedData = data.map(task => ({
            ...task,
            date_debut: task.date_debut ? new Date(task.date_debut) : null,
            date_fin: task.date_fin ? new Date(task.date_fin) : null,
            categories: task.categories 
              ? task.categories.split(',').map(cat => ({ 
                  name: cat.trim(), 
                  sousStatut: 'En cours' 
                })) 
              : [],
            intervenants: task.intervenants ? task.intervenants.split(',') : [],
          }));
          
          setTasks(formattedData);
        } catch (err) {
          console.error("Erreur lors de la récupération des tâches :", err);
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      }
    };
    fetchTasks();
  }, [auth, auth.currentUser]);

  // Optimisation du filtrage avec useMemo
  const filteredTasks = useMemo(() => {
    if (!tasks.length) return [];
    
    const now = new Date();
    return tasks.filter((task) => {
      if (!task.date_debut) return false;
      
      // Filtrage par période
      const taskDate = task.date_debut;
      let periodMatch = true;
      
      if (filterPeriod === 'month') {
        periodMatch = (
          taskDate.getMonth() === now.getMonth() && 
          taskDate.getFullYear() === now.getFullYear()
        );
      } else if (filterPeriod === 'week') {
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        
        periodMatch = taskDate >= weekStart && taskDate <= weekEnd;
      } else if (filterPeriod === 'day') {
        periodMatch = (
          taskDate.getDate() === now.getDate() &&
          taskDate.getMonth() === now.getMonth() &&
          taskDate.getFullYear() === now.getFullYear()
        );
      }
      
      // Filtrage par statut
      const statusMatch = filterStatus === 'all' || task.statut === filterStatus;
      
      return periodMatch && statusMatch;
    });
  }, [tasks, filterPeriod, filterStatus]);

  const toggleTaskStatus = (taskId) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId
        ? { ...task, statut: task.statut === 'En attente' ? 'Terminé' : 'En attente' }
        : task
    );
    setTasks(updatedTasks);
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
  };

  const saveTaskChanges = () => {
    if (!editingTask) return;
    
    const updatedTasks = tasks.map(task => 
      task.id === editingTask.id ? editingTask : task
    );
    
    setTasks(updatedTasks);
    setEditingTask(null);
    
    // Ici, vous pourriez aussi sauvegarder les changements sur le serveur
    // await saveTaskToServer(editingTask);
  };


  const updateTaskOnServer = async (task) => {
    try {
      const response = await fetch(`http://localhost:5000/taches/${task.id}`, {
        method: 'PUT', // ou 'PATCH' selon votre API
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...task,
          date_debut: task.date_debut.toISOString(),
          date_fin: task.date_fin.toISOString()
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
  
      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la tâche :", error);
      throw error;
    }
  };

  const handleDragStart = (task, e) => {
    setDragTask(task);
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (date, e) => {
    e.preventDefault();
    if (!dragTask || isUpdating) return;
    setIsUpdating(true);
  
    // Crée une copie de la date pour éviter les effets de bord
    const newDate = new Date(date);
    newDate.setHours(12, 0, 0, 0); // Fixe à midi
  
    // Calcule la nouvelle date de fin si elle existe
    let newEndDate = null;
    if (dragTask.date_fin) {
      const durationInDays = Math.floor(
        (new Date(dragTask.date_fin) - new Date(dragTask.date_debut)) / 
        (1000 * 60 * 60 * 24)
      );
      newEndDate = new Date(newDate);
      newEndDate.setDate(newDate.getDate() + durationInDays);
    }
  
    const updatedTask = {
      ...dragTask,
      date_debut: newDate,
      date_fin: newEndDate || newDate
    };
  
    try {
      // Mise à jour sur le serveur
      const savedTask = await updateTaskOnServer(updatedTask);
      
      // Mise à jour locale seulement après confirmation du serveur
      const updatedTasks = tasks.map(task => 
        task.id === savedTask.id ? {
          ...savedTask,
          date_debut: new Date(savedTask.date_debut),
          date_fin: savedTask.date_fin ? new Date(savedTask.date_fin) : null
        } : task
      );
  
      setTasks(updatedTasks);
    } catch (error) {
      console.error("Erreur lors du déplacement de la tâche :", error);
      // Vous pourriez ajouter ici un message d'erreur à l'utilisateur
    } finally {
      setIsUpdating(false);
      setDragTask(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const exportToPDF = () => {
    // Utilisation réelle avec PDFDownloadLink
    return (
      <PDFDownloadLink 
        document={<TasksPDF tasks={filteredTasks} />} 
        fileName="taches.pdf"
      >
        {({ loading }) => (loading ? 'Génération...' : 'Exporter en PDF')}
      </PDFDownloadLink>
    );
  };

  const exportToICal = () => {
    const events = filteredTasks.map(task => ({
      start: [
        task.date_debut.getFullYear(),
        task.date_debut.getMonth() + 1,
        task.date_debut.getDate(),
        task.date_debut.getHours(),
        task.date_debut.getMinutes()
      ],
      end: [
        task.date_fin.getFullYear(),
        task.date_fin.getMonth() + 1,
        task.date_fin.getDate(),
        task.date_fin.getHours(),
        task.date_fin.getMinutes()
      ],
      title: task.titre,
      description: `Statut: ${task.statut}\nEntreprise: ${task.company}`,
      location: task.company,
      status: task.statut === 'Terminé' ? 'CONFIRMED' : 'TENTATIVE'
    }));
  
    const { error, value } = createEvents(events);
    
    if (error) {
      console.error(error);
      return;
    }
  
    const blob = new Blob([value], { type: 'text/calendar;charset=utf-8' });
    saveAs(blob, 'taches.ics');
  };

  const getTasksForDay = (date) => {
    return tasks.filter((task) => {
      console.log("nous avons recus les dates",date)
      if (!task.date_debut) return false;
      return (
        task.date_debut.getFullYear() === date.getFullYear() &&
        task.date_debut.getMonth() === date.getMonth() &&
        task.date_debut.getDate() === date.getDate()
      );
    });
  };

  if (isLoading) {
    return (
      <div className="loading-container" aria-live="polite">
        <p>Chargement des tâches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container" role="alert">
        <FaExclamationTriangle />
        <p>Erreur lors du chargement des tâches : {error}</p>
        <button onClick={() => window.location.reload()}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="custom-calendar-container">
      <div className="header">
        <div className="filters">
          <select 
            value={filterPeriod} 
            onChange={(e) => setFilterPeriod(e.target.value)}
            aria-label="Filtrer par période"
          >
            <option value="month">Mois</option>
            <option value="week">Semaine</option>
            <option value="day">Jour</option>
          </select>
          <select 
            value={filterStatus} 
            onChange={(e) => setFilterStatus(e.target.value)}
            aria-label="Filtrer par statut"
          >
            <option value="all">Tous</option>
            <option value="En attente">En attente</option>
            <option value="Terminé">Terminé</option>
          </select>
        </div>
        <div className="export-buttons">
          <button onClick={exportToICal} className="export-btn">
            <FaCalendarAlt /> Exporter iCal
          </button>
          <PDFDownloadLink 
            document={<TasksPDF tasks={filteredTasks} />} 
            fileName="taches.pdf"
            className="export-btn"
          >
            {({ loading }) => (
              <span>
                <FaFilePdf /> {loading ? 'Génération...' : 'Exporter PDF'}
              </span>
            )}
          </PDFDownloadLink>
        </div>
        <div className="view-toggle" role="tablist">
          <button 
            className={viewMode === 'list' ? 'active' : ''} 
            onClick={() => setViewMode('list')}
            role="tab"
            aria-selected={viewMode === 'list'}
            aria-controls="task-list-view"
          >
            <FaList aria-hidden="true" /> Liste
          </button>
          <button 
            className={viewMode === 'calendar' ? 'active' : ''} 
            onClick={() => setViewMode('calendar')}
            role="tab"
            aria-selected={viewMode === 'calendar'}
            aria-controls="calendar-view"
          >
            <FaTh aria-hidden="true" /> Calendrier
          </button>
        </div>
      </div>

      {/* Modal d'édition */}
      {editingTask && (
        <div className="edit-modal">
          <div className="modal-content">
            <h2>Modifier la tâche</h2>
            <form onSubmit={(e) => {
              e.preventDefault();
              saveTaskChanges();
            }}>
              <label>
                Titre:
                <input 
                  type="text" 
                  value={editingTask.titre || ''} 
                  onChange={(e) => setEditingTask({...editingTask, titre: e.target.value})}
                />
              </label>
              
              <label>
                Date de début:
                <input 
                  type="datetime-local" 
                  value={editingTask.date_debut?.toISOString().slice(0, 16) || ''}
                  onChange={(e) => setEditingTask({
                    ...editingTask, 
                    date_debut: new Date(e.target.value)
                  })}
                />
              </label>
              
              <div className="modal-actions">
                <button type="submit">Enregistrer</button>
                <button type="button" onClick={() => setEditingTask(null)}>Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewMode === 'list' && (
        <div id="task-list-view" role="tabpanel">
          {filteredTasks.length > 0 ? (
            <ul className="task-list">
              {filteredTasks.map((task) => (
                <li key={task.id} className="task-item">
                  <div className="affichagelist">
                    <div className="intervenant-row">
                      <div className="intervenant-col">
                        {task.categories?.length > 0 ? (
                          task.categories.map((cat, index) => (
                            <span key={index}>{cat.name}</span>
                          ))
                        ) : (
                          <div>Aucune catégorie.</div>
                        )}
                      </div>
                      <div className="intervenant-col">{task.company}</div>
                      <div className="intervenant-col">
                        <p>Début : {task.date_debut?.toLocaleDateString() || "Non défini"}</p>
                        <p>Fin : {task.date_fin?.toLocaleDateString() || "Non défini"}</p>
                      </div>
                      <div className="intervenant-col">
                        <p>Statut : {task.statut}</p>
                      </div>
                      <div className="action-buttons">
                        <button 
                          onClick={() => handleEditTask(task)}
                          aria-label={`Modifier la tâche ${task.titre}`}
                        >
                          <FaEdit aria-hidden="true" />
                        </button>
                        <button 
                          onClick={() => toggleTaskStatus(task.id)}
                          aria-label={`Marquer la tâche comme ${task.statut === 'En attente' ? 'Terminé' : 'En attente'}`}
                        >
                          {task.statut === 'En attente' ? (
                            <><FaCheckCircle aria-hidden="true" /></>
                          ) : (
                            <><FaHourglassHalf aria-hidden="true" /></>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="no-tasks">Aucune tâche disponible pour les filtres sélectionnés.</p>
          )}
        </div>
      )}

      {viewMode === 'calendar' && (
        <div 
          id="calendar-view" 
          role="tabpanel"
          ref={calendarRef}
          onDragOver={handleDragOver}
        >
          <Calendar
            value={currentDate}
            onChange={setCurrentDate}
            tileContent={({ date, view }) => {
              if (view === 'month') {
                const dayTasks = getTasksForDay(date);
                return dayTasks.length > 0 ? (
                  <div 
                    className="calendar-day"
                    onDrop={(e) => handleDrop(date, e)}
                    onDragOver={handleDragOver}
                  >
                    {dayTasks.map((task) => (
                      <div
                      key={task.id}
                      className={`calendar-task ${task.statut === 'Terminé' ? 'completed' : 'pending'} ${dragTask?.id === task.id ? 'dragging' : ''}`}
                      draggable
                      onDragStart={(e) => handleDragStart(task, e)}
                      onClick={() => handleEditTask(task)}
                      aria-label={`Tâche ${task.titre}, statut ${task.statut}`}
                    >
                      {task.titre}
                      {isUpdating && dragTask?.id === task.id && <span className="updating-spinner"></span>}
                    </div>
                    ))}
                  </div>
                ) : (
                  <div 
                    className="calendar-day empty"
                    onDrop={(e) => handleDrop(date, e)}
                    onDragOver={handleDragOver}
                  />
                );
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

CustomCalendar.propTypes = {
  // Props types définis ici si nécessaire
};

export default CustomCalendar;