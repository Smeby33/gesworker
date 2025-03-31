import React, { useState, useEffect, useCallback } from 'react';
import Calendar from 'react-calendar';
import PropTypes from 'prop-types';
import { getAuth } from "firebase/auth";
import { FaFilePdf, FaCalendarAlt } from 'react-icons/fa';
import '../css/CustomCalendar.css';

function CalendarView({
  currentDate,
  onDateChange,
  onExportPDF,
  onExportICal
}) {
  const [dragTask, setDragTask] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updateError, setUpdateError] = useState(null);
  const auth = getAuth();

  // Récupération des tâches
  const fetchTasks = useCallback(async () => {
    if (!auth.currentUser) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5000/taches/tasks-by-owner/${auth.currentUser.uid}`);
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      
      const data = await response.json();
      
      const formattedData = data.map(task => ({
        ...task,
        date_debut: task.date_debut ? new Date(task.date_debut) : null,
        date_fin: task.date_fin ? new Date(task.date_fin) : null,
        categories: task.categories?.split(',').map(cat => ({ 
          name: cat.trim(), 
          sousStatut: 'En cours' 
        })) || [],
        intervenants: task.intervenants?.split(',') || [],
      }));
      
      setTasks(formattedData);
    } catch (err) {
      console.error("Erreur lors de la récupération des tâches:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [auth.currentUser]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Mémoïsation des tâches par jour avec gestion du timezone
  const getTasksForDay = useCallback((date) => {
    return tasks.filter(task => {
      if (!task.date_debut) return false;
      
      const taskDate = new Date(task.date_debut);
      const displayDate = new Date(date);
      
      taskDate.setHours(0, 0, 0, 0);
      displayDate.setHours(0, 0, 0, 0);
      
      return taskDate.getTime() === displayDate.getTime();
    });
  }, [tasks]);

  // Gestion de la mise à jour des tâches
  const handleTaskUpdate = useCallback(async (updatedTask) => {
    setIsUpdating(true);
    setUpdateError(null);
    
    try {
      const authToken = await auth.currentUser.getIdToken();
      
      const requestBody = {
        title: updatedTask.title,
        company: updatedTask.company,
        priorite: updatedTask.priorite,
        categories: updatedTask.categories.map(c => c.name),
        intervenants: updatedTask.intervenants,
        date_debut: updatedTask.date_debut.toISOString(),
        date_fin: updatedTask.date_fin.toISOString(),
        statut: updatedTask.statut || 'En cours'
      };

      const response = await fetch(`http://localhost:5000/taches/update-task/${updatedTask.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Échec de la mise à jour');
      }

      // Mise à jour optimiste de l'état local
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === updatedTask.id ? updatedTask : t
        )
      );

      return await response.json();
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      setUpdateError(error.message);
      await fetchTasks();
      throw error;
    } finally {
      setIsUpdating(false);
    }
  }, [auth.currentUser, fetchTasks]);

  // Gestion du drag & drop
  const handleDragStart = useCallback((task, e) => {
    setDragTask(task);
    e.dataTransfer.setData('text/plain', task.id);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDrop = useCallback(async (date, e) => {
    e.preventDefault();
    if (!dragTask || isUpdating) return;

    const newDate = new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      12, 0, 0
    ));

    let durationInDays = 0;
    if (dragTask.date_fin && dragTask.date_debut) {
      durationInDays = Math.floor(
        (new Date(dragTask.date_fin) - new Date(dragTask.date_debut)) / 
        (1000 * 60 * 60 * 24)
      );
    }

    const newEndDate = new Date(newDate);
    if (durationInDays > 0) {
      newEndDate.setDate(newEndDate.getDate() + durationInDays);
    }

    const updatedTask = {
      ...dragTask,
      date_debut: newDate,
      date_fin: durationInDays > 0 ? newEndDate : newDate
    };

    try {
      setTasks(prevTasks => 
        prevTasks.map(t => 
          t.id === updatedTask.id ? updatedTask : t
        )
      );

      await handleTaskUpdate(updatedTask);
      await fetchTasks();
    } catch (error) {
      console.error("Erreur lors du déplacement:", error);
      await fetchTasks();
    } finally {
      setDragTask(null);
    }
  }, [dragTask, isUpdating, handleTaskUpdate, fetchTasks]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  // Gestion de l'édition
  const handleEditTask = useCallback((task) => {
    setEditingTask(task);
  }, []);

  const saveTaskChanges = useCallback(async () => {
    if (!editingTask) return;
    try {
      await handleTaskUpdate(editingTask);
      setEditingTask(null);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
    }
  }, [editingTask, handleTaskUpdate]);

  if (isLoading) {
    return <div className="loading-container">Chargement des tâches...</div>;
  }

  if (error) {
    return (
      <div className="error-container" role="alert">
        <p>Erreur lors du chargement: {error}</p>
        <button onClick={fetchTasks}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="calendar-view-container">
      <div className="calendar-export-buttons">
        <button onClick={onExportICal} className="export-btn">
          <FaCalendarAlt /> Exporter iCal
        </button>
        {/* <button onClick={onExportPDF} className="export-btn">
          <FaFilePdf /> Exporter PDF
        </button> */}
      </div>

      {updateError && (
        <div className="error-message">
          Erreur lors de la mise à jour : {updateError}
          <button onClick={() => setUpdateError(null)}>×</button>
        </div>
      )}

      <div id="calendar-view" role="tabpanel" onDragOver={handleDragOver}>
        <Calendar
          value={currentDate}
          onChange={onDateChange}
          tileContent={({ date, view }) => {
            if (view !== 'month') return null;
            
            const dayTasks = getTasksForDay(date);
            
            return (
              <div 
                className={`calendar-day ${dragTask ? 'drop-target' : ''}`}
                onDrop={(e) => handleDrop(date, e)}
                onDragOver={handleDragOver}
              >
                {dayTasks.map(task => (
                  <div
                    id='jourday'
                    key={task.id}
                    className={`calendar-task ${task.statut === 'Terminé' ? 'completed' : 'pending'} ${dragTask?.id === task.id ? 'dragging' : ''}`}
                    draggable
                    onDragStart={(e) => handleDragStart(task, e)}
                    onClick={() => handleEditTask(task)}
                  >
                    {task.title}
                    <span>{task.intervenants.join(', ')}</span>
                    {isUpdating && dragTask?.id === task.id && (
                      <span className="updating-spinner"></span>
                    )}
                  </div>
                ))}
              </div>
            );
          }}
        />
      </div>

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
                  value={editingTask.title || ''} 
                  onChange={(e) => setEditingTask({
                    ...editingTask, 
                    title: e.target.value
                  })}
                  required
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
                  required
                />
              </label>
              
              <div className="modal-actions">
                <button type="submit">Enregistrer</button>
                <button 
                  type="button" 
                  onClick={() => setEditingTask(null)}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

CalendarView.propTypes = {
  currentDate: PropTypes.instanceOf(Date).isRequired,
  onDateChange: PropTypes.func.isRequired,
  onExportPDF: PropTypes.func.isRequired,
  onExportICal: PropTypes.func.isRequired
};

export default CalendarView;