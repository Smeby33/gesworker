import React, { useEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { getAuth } from "firebase/auth";
import { FaTh, FaList, FaChartLine, FaUserTie, FaInfoCircle } from "react-icons/fa";
import "react-circular-progressbar/dist/styles.css";
import '../css/PerformanceDashboard.css';

function AllPerformanceTables() {
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const auth = getAuth();
  const currentUser = auth.currentUser;

  useEffect(() => {
    const fetchPerformances = async () => {
      if (!currentUser) {
        setError("Utilisateur non connecté");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/performances/all/${currentUser.uid}`);
        
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des performances");
        }
        
        const data = await response.json();
        setPerformances(data.map(p => ({
          ...p,
          progress: calculateProgress(p)
        })));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformances();
  }, [currentUser]);

  const calculateProgress = (performance) => {
    if (!performance.total || performance.total === 0) return 0;
    return Math.round((performance.completed / performance.total) * 100);
  };

  if (!currentUser) {
    return (
      <div className="performance-container auth-error">
        Veuillez vous connecter pour accéder aux performances
      </div>
    );
  }

  return (
    <div className="performance-dashboard">
      <div className="dashboard-header">
        <h2 className="dashboard-title">
          <FaChartLine /> Tableau de Performance des Intervenants
        </h2>
        
        <div className="view-selector">
          
          <button 
            onClick={() => setViewMode('list')} 
            className={viewMode === 'list' ? 'active' : ''}
          >
            <FaList /> Liste
          </button>
          <button 
            onClick={() => setViewMode('grid')} 
            className={viewMode === 'grid' ? 'active' : ''}
          >
            <FaTh /> Grille
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Chargement des performances...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      ) : performances.length === 0 ? (
        <div className="empty-state">
          <p>Aucune donnée de performance disponible</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="performance-grid">
          {performances.map((performance) => (
            <div key={performance.username} className="performance-card">
              <div className="card-header">
                <FaUserTie className="user-icon" />
                <h3>{performance.username}</h3>
              </div>
              
              <div className="card-content">
                <div className="progress-container">
                  <CircularProgressbar
                    value={performance.progress}
                    text={`${performance.progress}%`}
                    styles={buildStyles({
                      textColor: "#2c3e50",
                      pathColor: "#4CAF50",
                      trailColor: "#f0f0f0",
                      textSize: '16px',
                    })}
                  />
                  <div className="progress-label">Taux de complétion</div>
                </div>
                
                <table className="performance-table">
                  <thead>
                    <tr>
                      <th>Statut</th>
                      <th>Nombre</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Total</td>
                      <td>{performance.total || 0}</td>
                    </tr>
                    <tr>
                      <td>Terminées</td>
                      <td>{performance.completed || 0}</td>
                    </tr>
                    <tr>
                      <td>En cours</td>
                      <td>{performance.inProgress || 0}</td>
                    </tr>
                    <tr>
                      <td>Annulées</td>
                      <td>{performance.cancelled || 0}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <div className="card-footer">
                <div className="performance-summary">
                  <span>Taux de réussite: </span>
                  <span className="highlight">{performance.progress}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="performance-list">
          {performances.map((performance) => (
            <div key={performance.username} className="performance-list-item">
              <div className="list-item-main">
                <div className="user-info">
                  <FaUserTie className="user-icon" />
                  <span>{performance.username}</span>
                </div>
                <div className="progress-info">
                  <div className="linear-progress">
                    <div 
                      className="progress-bar" 
                      style={{ width: `${performance.progress}%` }}
                    ></div>
                  </div>
                  <span className="progress-value">{performance.progress}%</span>
                </div>
              </div>
              
              <div className="list-item-details">
                <div className="detail-row">
                  <span>Total tâches:</span>
                  <span>{performance.total || 0}</span>
                </div>
                <div className="detail-row">
                  <span>Terminées:</span>
                  <span>{performance.completed || 0}</span>
                </div>
                <div className="detail-row">
                  <span>En cours:</span>
                  <span>{performance.inProgress || 0}</span>
                </div>
                <div className="detail-row">
                  <span>Annulées:</span>
                  <span>{performance.cancelled || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default AllPerformanceTables;