import React, { useEffect, useState } from 'react';
import { FaSyncAlt } from 'react-icons/fa';
import '../css/RecentActivities.css';

function RecentActivities() {
  const [userActivities, setUserActivities] = useState([]);
  const currentUser = JSON.parse(localStorage.getItem('currentUser')) || {};

  const loadUserRelatedActivities = () => {
    const now = new Date().getTime();
    const thirtyMinutes = 30 * 60 * 1000; // 30 minutes en millisecondes
    const activities = [];

    // Fonction pour vérifier si un élément est récent
    const isRecent = (timestamp) => timestamp && now - timestamp < thirtyMinutes;

    // Vérifier les tâches attribuées ou modifiées pour le currentUser
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    storedTasks.forEach((task) => {
      if (
        isRecent(task.timestamp) &&
        task.intervenants.includes(currentUser.username)
      ) {
        activities.push({
          type: 'Tâche',
          name: task.titre,
          description: `Statut : ${task.statut} | Entreprise : ${task.company || 'Non spécifiée'}`,
          timestamp: task.timestamp,
        });
      }
    });

    // Vérifier les commentaires associés aux tâches du currentUser
    const storedComments = JSON.parse(localStorage.getItem('comments')) || {};
    Object.entries(storedComments).forEach(([taskId, taskComments]) => {
      taskComments.forEach((comment) => {
        if (
          isRecent(new Date(comment.date).getTime()) &&
          (comment.user === currentUser.username ||
            storedTasks.some(
              (task) =>
                task.id === parseInt(taskId, 10) &&
                task.intervenants.includes(currentUser.username)
            ))
        ) {
          activities.push({
            type: 'Commentaire',
            name: `Tâche ID: ${taskId}`,
            description: `Commentaire de ${comment.user}`,
            timestamp: new Date(comment.date).getTime(),
          });
        }
      });
    });

    // Vérifier les relations (ajout ou modification de collègues)
    const storedIntervenants = JSON.parse(localStorage.getItem('intervenant')) || [];
    storedIntervenants.forEach((intervenant) => {
      if (
        isRecent(intervenant.timestamp) &&
        intervenant.name !== currentUser.username
      ) {
        activities.push({
          type: 'Intervenant',
          name: intervenant.name,
          description: `Ajouté ou modifié récemment.`,
          timestamp: intervenant.timestamp,
        });
      }
    });

    // Trier les activités par ordre décroissant
    activities.sort((a, b) => b.timestamp - a.timestamp);
    setUserActivities(activities);
  };

  // Charger les activités liées au currentUser au montage
  useEffect(() => {
    loadUserRelatedActivities();
  }, []);

  const refreshActivities = () => {
    loadUserRelatedActivities();
  };

  return (
    <div className="user-related-activities">
      <div className="header">
        <h3>Activités Liées à Vous (30 dernières minutes)</h3>
        <button onClick={refreshActivities} className="refresh-button">
          <FaSyncAlt /> Actualiser
        </button>
      </div>
      {userActivities.length > 0 ? (
        <ul className="activity-list">
          {userActivities.map((activity, index) => (
            <li key={index} className="activity-item">
              <strong>{activity.type} :</strong> {activity.name}
              <p>{activity.description}</p>
              <span>{new Date(activity.timestamp).toLocaleTimeString()}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: 'black', fontWeight: 'bold' }}>
          Aucune activité récente liée à vous.
        </p>
      )}
    </div>
  );
}

export default RecentActivities;
