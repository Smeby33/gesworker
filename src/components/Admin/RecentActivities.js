import React, { useEffect, useState } from 'react';
import { FaSyncAlt } from 'react-icons/fa'; 
import '../css/RecentActivities.css';

function RecentActivities() {
  const [recentActivities, setRecentActivities] = useState([]);

  // Fonction pour charger les activités récentes
  const loadRecentActivities = () => {
    const now = new Date().getTime();
    const thirtyMinutes = 30 * 60 * 1000; // 30 minutes en millisecondes
    const activities = [];

    // Fonction pour vérifier si un élément a été ajouté dans les 30 dernières minutes
    const isRecent = (timestamp) => now - timestamp < thirtyMinutes;

    // Vérifier les entreprises récentes
    const storedCompanies = JSON.parse(localStorage.getItem('clients')) || [];
    storedCompanies.forEach((company) => {
      if (isRecent(company.timestamp)) {
        activities.push({
          type: 'Entreprise',
          name: company.companyName,
          description: company.description,
          timestamp: company.timestamp,
        });
      }
    });

    // Vérifier les tâches récentes
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    storedTasks.forEach((task) => {
      if (isRecent(task.timestamp)) {
        activities.push({
          type: 'Tâche',
          name: task.titre,
          description: task.company,
          timestamp: task.timestamp,
        });
      }
    });

    // Vérifier les intervenants récents
    const storedIntervenants = JSON.parse(localStorage.getItem('intervenant')) || [];
    storedIntervenants.forEach((intervenant) => {
      if (isRecent(intervenant.timestamp)) {
        activities.push({
          type: 'Intervenant',
          name: intervenant.name,
          description: intervenant.email,
          timestamp: intervenant.timestamp,
        });
      }
    });

    // Trier les activités par ordre décroissant (les plus récentes en premier)
    activities.sort((a, b) => b.timestamp - a.timestamp);

    setRecentActivities(activities);
  };

  // Charger les activités récentes au montage du composant
  useEffect(() => {
    loadRecentActivities();
  }, []);

  // Fonction pour rafraîchir les données
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
              <p>Description: {activity.description}</p>
              <span>{new Date(activity.timestamp).toLocaleTimeString()}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucune activité récente.</p>
      )}
    </div>
  );
}

export default RecentActivities;
