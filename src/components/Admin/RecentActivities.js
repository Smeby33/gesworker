import React, { useEffect, useState } from 'react';
import { FaSyncAlt } from 'react-icons/fa';
import '../css/RecentActivities.css';

function RecentActivities() {
  const [recentActivities, setRecentActivities] = useState([]);

  const loadRecentActivities = () => {
    const now = new Date().getTime();
    const thirtyMinutes = 30 * 60 * 1000; // 30 minutes en millisecondes
    const activities = [];

    // Fonction pour vérifier si un élément est récent
    const isRecent = (timestamp) => timestamp && now - timestamp < thirtyMinutes;

    // Récupérer et traiter les entreprises
    const storedCompanies = JSON.parse(localStorage.getItem('clients')) || [];
    storedCompanies.forEach((company) => {
      if (isRecent(company.timestamp)) {
        activities.push({
          type: 'Entreprise',
          name: company.companyName,
          description: `Description : ${company.description || 'Aucune'}`,
          timestamp: company.timestamp,
        });
      }
    });

    // Récupérer et traiter les tâches
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    storedTasks.forEach((task) => {
      if (isRecent(task.timestamp)) {
        activities.push({
          type: 'Tâche',
          name: task.titre,
          description: `Entreprise : ${task.company || 'Non spécifiée'}`,
          timestamp: task.timestamp,
        });
      }
    });

    // Récupérer et traiter les intervenants
    const storedIntervenants = JSON.parse(localStorage.getItem('intervenant')) || [];
    storedIntervenants.forEach((intervenant) => {
      if (isRecent(intervenant.timestamp)) {
        activities.push({
          type: 'Intervenant',
          name: intervenant.name,
          description: `Email : ${intervenant.email || 'Non spécifié'}`,
          timestamp: intervenant.timestamp,
        });
      }
    });

    // Trier les activités par ordre décroissant
    activities.sort((a, b) => b.timestamp - a.timestamp);
    setRecentActivities(activities);
  };

  // Charger les activités récentes au montage
  useEffect(() => {
    loadRecentActivities();
  }, []);

  const refreshActivities = () => {
    loadRecentActivities();
  };

  return (
    <div className="recent-activities">
      <div className="header">
        <h3>Activités Récentes (30 dernières minutes)</h3>
        <button onClick={refreshActivities} className="refresh-button">
          <FaSyncAlt /> Actualiser
        </button>
      </div>
      {recentActivities.length > 0 ? (
        <ul className="activity-list">
          {recentActivities.map((activity, index) => (
            <li key={index} className="activity-item">
              <strong>{activity.type} :</strong> {activity.name}
              <p>{activity.description}</p>
              <span>{new Date(activity.timestamp).toLocaleTimeString()}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p style={{ color: 'black ', fontWeight: 'bold' }}>Aucune activité récente.</p>
      )}
    </div>
  );
}

export default RecentActivities;
