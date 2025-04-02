import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { 
  FaCheckCircle, 
  FaHourglassHalf, 
  FaTimesCircle, 
  FaChartLine,
  FaArrowUp,
  FaTasks,
  FaBuilding,
  FaFlag,
  FaCalendarAlt,
  FaClock
} from 'react-icons/fa';
import "../css/PerformanceDashboard.css";

function PerformanceDashboard() {
  const [userTasks, setUserTasks] = useState([]);
  const [adminEmail, setAdminEmail] = useState('');
  const [nom, setNom] = useState(''); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    completed: 0,
    in_progress: 0,
    cancelled: 0,
    progress: 0,
    priorities: {
      low: 0,
      medium: 0,
      high: 0
    },
    average_duration: null,
  });



  const auth = getAuth();
  const currentUser = auth.currentUser;



  const fetchPerformanceData = async (userId) => {
    try {
      const response = await fetch(`https://gesworkerback.onrender.com/performances/${userId}`);
      if (!response.ok) throw new Error("Erreur réseau");
      return await response.json();
    } catch (error) {
      console.error("Erreur fetchPerformanceData:", error);
      throw error;
    }
  };



  const fetchUserTasks = async (userId) => {
    try {
      const response = await fetch(`https://gesworkerback.onrender.com/taches/intervenantinters/${userId}`);
      if (!response.ok) throw new Error(`Erreur HTTP: ${response.status}`);
      
      const data = await response.json();
      console.log(data)
      
      if (!Array.isArray(data)) {
        throw new Error("Les données reçues ne sont pas un tableau");
      }
      
      return data;
    } catch (error) {
      console.error("Erreur fetchUserTasks:", error);
      throw error;
    }
  };

  const calculateAverageDuration = (tasks) => {
    const validTasks = tasks.filter(task => 
      task.date_debut && task.date_fin && task.statut === "Terminé"
    );

    if (validTasks.length === 0) return null;

    const totalDuration = validTasks.reduce((sum, task) => {
      const start = new Date(task.date_debut);
      const end = new Date(task.date_fin);
      return sum + (end - start);
    }, 0);

    const avgMs = totalDuration / validTasks.length;
    return Math.round(avgMs / (1000 * 60 * 60 * 24)); // Convertit en jours
  };

  const calculatePerformanceStats = (tasks) => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.statut === "Terminé").length;
    const in_progress = tasks.filter(task => task.statut === "En cours").length;
    const cancelled = tasks.filter(task => task.statut === "Annulé").length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    const priorityStats = {
      low: tasks.filter(task => task.priorite === "Priorité Faible").length,
      medium: tasks.filter(task => task.priorite === "Priorité Moyenne").length,
      high: tasks.filter(task => task.priorite === "Priorité Maximale").length
    };

    return {
      total,
      completed,
      in_progress,
      cancelled,
      progress,
      priorities: priorityStats,
      average_duration: calculateAverageDuration(tasks)
    };
  };

  const updatePerformanceInDatabase = async (userId, performance) => {
    try {

      const userResponse = await fetch(`https://gesworkerback.onrender.com/intervenants/recupererun/${userId}`);
      const userData = await userResponse.json();
      setNom(userData.name); // Stockez le nom dans le state
      console.log("le nom",userData.name)
      console.log("le proprietaire",userData.proprietaire)
      console.log("les infos sont",userData)



      const payload = {
        username: userData.name,
        total: performance.total,
        completed: performance.completed,
        in_progress: performance.in_progress,
        cancelled: performance.cancelled,
        progress: performance.progress,
        proprietaire:userData.proprietaire
      };
  
      console.log("📤 Données envoyées à la route POST /performance/add :", payload);
  
      const response = await fetch("https://gesworkerback.onrender.com/performances/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
  
      const responseData = await response.json();
  
      console.log("📩 Réponse reçue de la route POST /performance/add :", responseData);
  
      if (!response.ok) {
        throw new Error(responseData.error || "Échec de la mise à jour");
      }
      
  
      return responseData;
    } catch (error) {
      console.error("❌ Erreur updatePerformanceInDatabase:", error);
      throw error;
    }
  };
 

  useEffect(() => {
    if (!currentUser) {
      setError("Utilisateur non connecté");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        setAdminEmail(currentUser.email);
        
        const userId = currentUser.uid;
        const tasksData = await fetchUserTasks(userId);
        setUserTasks(tasksData);

        const newStats = calculatePerformanceStats(tasksData);
        setStatistics(newStats);

        await updatePerformanceInDatabase(userId, newStats);
      } catch (err) {
        setError(err.message);
        console.error("Erreur loadData:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser]);

  if (!currentUser) {
    return <div className="dashboard-container">Veuillez vous connecter pour accéder au tableau de bord</div>;
  }

  if (loading) {
    return <div className="dashboard-container">Chargement en cours...</div>;
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="error-message">
          Erreur: {error}
          <button onClick={() => window.location.reload()}>Réessayer</button>
        </div>
      </div>
    );
  }

  // Fonction pour calculer la durée d'une tâche individuelle
  const calculateTaskDuration = (task) => {
    if (!task.date_debut || !task.date_fin) return null;
    const durationMs = new Date(task.date_fin) - new Date(task.date_debut);
    return Math.round(durationMs / (1000 * 60 * 60 * 24));
  };
  return (
    <div className="dashboard-container animate-fade-in">
      <header className="dashboard-header">
        <h2 className="dashboard-title">
          <FaChartLine className="mr-2" />
          Tableau de bord de performance
        </h2>
        <p className="dashboard-subtitle">
          Bonjour, { nom || adminEmail}
        </p>
      </header>
      
      <div className="stats-grid">
        {/* Carte Statistiques Globales */}
        <div className="stat-card total-tasks animate-slide-up delay-100">
          <div className="stat-icon">
            <FaTasks />
          </div>
          <div className="stat-content">
            <h6>Total des tâches</h6>
            <p className="stat-value">{statistics.total}</p>
            <p className="stat-change">
              <FaArrowUp className="text-green-500" />
              <span>+5% vs mois dernier</span>
            </p>
          </div>
        </div>
        
        {/* Carte Tâches Terminées */}
        <div className="stat-card completed animate-slide-up delay-200">
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div className="stat-content">
            <h6>Terminées</h6>
            <p className="stat-value">{statistics.completed}</p>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill"
                style={{ width: `${statistics.progress}%` }}
              ></div>
            </div>
            <p className="stat-percentage">{statistics.progress}% de complétion</p>
          </div>
        </div>
        
        {/* Carte Tâches en Cours */}
        <div className="stat-card in-progress animate-slide-up delay-300">
          <div className="stat-icon">
            <FaHourglassHalf />
          </div>
          <div className="stat-content">
            <h6>En cours</h6>
            <p className="stat-value">{statistics.in_progress}</p>
          </div>
        </div>
        
        {/* Carte Tâches Annulées */}
        <div className="stat-card cancelled animate-slide-up delay-400">
          <div className="stat-icon">
            <FaTimesCircle />
          </div>
          <div className="stat-content">
            <h6>Annulées</h6>
            <p className="stat-value">{statistics.cancelled}</p>
          </div>
        </div>
        
      </div>
      <div className="stats-grid">
        
        {/* Cartes Priorités */}
        <div className="stat-card priority-low animate-slide-up delay-500">
          <div className="stat-icon">
            <FaFlag className="text-blue-500" />
          </div>
          <div className="stat-content">
            <h6>Priorité Faible</h6>
            <p className="stat-value">{statistics.priorities.low}</p>
          </div>
        </div>
        
        <div className="stat-card priority-medium animate-slide-up delay-600">
          <div className="stat-icon">
            <FaFlag className="text-yellow-500" />
          </div>
          <div className="stat-content">
            <h6>Priorité Moyenne</h6>
            <p className="stat-value">{statistics.priorities.medium}</p>
          </div>
        </div>
        
        <div className="stat-card priority-high animate-slide-up delay-700">
          <div className="stat-icon">
            <FaFlag className="text-red-500" />
          </div>
          <div className="stat-content">
            <h6>Priorité Maximale</h6>
            <p className="stat-value">{statistics.priorities.high}</p>
          </div>
        </div>
        
        {/* Carte Durée Moyenne */}
        {statistics.average_duration !== null && (
          <div className="stat-card duration animate-slide-up delay-800">
            <div className="stat-icon">
              <FaClock />
            </div>
            <div className="stat-content">
              <h6>Durée moyenne</h6>
              <p className="stat-value">{statistics.average_duration} jours</p>
            </div>
          </div>
        )}
      </div>
      {/* Section Tâches Récentes */}
      <section className="recent-tasks-section animate-fade-in delay-900">
        <h6 className="section-title">
          <FaTasks className="mr-2" />
          Vos dernières tâches
        </h6>
        
        {userTasks.length > 0 ? (
          <div className="tasks-grid">
            {userTasks.slice(0, 5).map((task, index) => {
              const durationDays = calculateTaskDuration(task);
              
              return (
                <div 
                  key={task.id} 
                  className={`task-card priority-${task.priorite.toLowerCase().split(' ')[1]} animate-pop delay=${1000 + (index * 100)}`}
                >
                  <div className="task-header">
                    <h4 className="task-title">{task.title}</h4>
                    <span className={`task-priority ${task.priorite.toLowerCase().split(' ')[1]}`}>
                      {task.priorite}
                    </span>
                  </div>
                  
                  <div className="task-details">
                    <p className="task-company">
                      <FaBuilding className="mr-1" />
                      {task.company}
                    </p>
                    
                    <p className={`task-status ${task.statut.toLowerCase().replace(' ', '-')}`}>
                      {task.statut}
                    </p>
                    
                    <p className="task-deadline">
                      <FaCalendarAlt className="mr-1" />
                      {new Date(task.date_fin).toLocaleDateString()}
                    </p>
                    
                    {durationDays !== null && (
                      <p className="task-duration">
                        <FaClock className="mr-1" />
                        Durée: {durationDays} jours
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-tasks-message">
            <p>Aucune tâche assignée pour le moment</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default PerformanceDashboard;
