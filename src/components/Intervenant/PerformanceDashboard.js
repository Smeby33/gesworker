import React, { useEffect, useState } from "react";
import "../css/PerformanceDashboard.css"; // Créez un fichier CSS si besoin

function PerformanceDashboard() {
  const [tasks, setTasks] = useState([]);
  const [userTasks, setUserTasks] = useState([]);
  const [statistics, setStatistics] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    cancelled: 0,
    progress: 0,
  });

  // Récupérer l'utilisateur connecté
  const currentUser = JSON.parse(localStorage.getItem("currentUser")) || {};

  useEffect(() => {
    // Récupérer les tâches du localStorage
    const storedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    setTasks(storedTasks);
  }, []);

  useEffect(() => {
    if (tasks.length > 0 && currentUser?.username) {
      // Filtrer les tâches assignées à l'utilisateur connecté
      const assignedTasks = tasks.filter((task) =>
        task.intervenants.some((intervenant) => intervenant === currentUser.username)
      );
      setUserTasks(assignedTasks);

      // Calculer les statistiques
      const completed = assignedTasks.filter((task) => task.statut === "Terminé").length;
      const inProgress = assignedTasks.filter((task) => task.statut === "En cours").length;
      const cancelled = assignedTasks.filter((task) => task.statut === "Annulé").length;
      const total = assignedTasks.length;

      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

      const newStatistics = {
        total,
        completed,
        inProgress,
        cancelled,
        progress,
      };

      setStatistics(newStatistics);

      // Stocker les performances dans le localStorage
      updatePerformanceInLocalStorage(currentUser.username, newStatistics);
    }
  }, [tasks, currentUser]);

  // Fonction pour mettre à jour les performances dans le localStorage
  const updatePerformanceInLocalStorage = (username, performance) => {
    const storedPerformances =
      JSON.parse(localStorage.getItem("performance")) || [];

    // Vérifier si l'utilisateur existe déjà dans le tableau
    const userIndex = storedPerformances.findIndex(
      (item) => item.username === username
    );

    if (userIndex !== -1) {
      // Mettre à jour les performances existantes
      storedPerformances[userIndex] = { username, ...performance };
    } else {
      // Ajouter de nouvelles performances
      storedPerformances.push({ username, ...performance });
    }

    // Enregistrer dans le localStorage
    localStorage.setItem("performance", JSON.stringify(storedPerformances));
  };

  return (
    <div className="dashboard-container">
      <h3>Tableau de bord : {currentUser.username}</h3>
      <div className="dashboard-stats">
        <div className="stat-box">
          <h4>Total des tâches</h4>
          <p>{statistics.total}</p>
        </div>
        <div className="stat-box">
          <h4>Tâches terminées</h4>
          <p>{statistics.completed}</p>
        </div>
        <div className="stat-box">
          <h4>Tâches en cours</h4>
          <p>{statistics.inProgress}</p>
        </div>
        <div className="stat-box">
          <h4>Tâches annulées</h4>
          <p>{statistics.cancelled}</p>
        </div>
        <div className="stat-box progress-box">
          <h4>Progrès global</h4>
          <div className="progress-bar">
            <div
              className="progress"
              style={{ width: `${statistics.progress}%` }}
            ></div>
          </div>
          <p>{statistics.progress}%</p>
        </div>
      </div>
    </div>
  );
}

export default PerformanceDashboard;
