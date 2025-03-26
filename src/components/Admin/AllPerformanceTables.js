import React, { useEffect, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { getAuth } from "firebase/auth";
import "react-circular-progressbar/dist/styles.css";
import '../css/PerformanceDashboard.css';

function AllPerformanceTables() {
  const [performances, setPerformances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
    const [adminEmail, setAdminEmail] = useState('');
    const auth = getAuth();

  useEffect(() => {
    const fetchPerformances = async () => {
      try {
        const response = await fetch("http://localhost:5000/performances/all");
        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des performances");
        }
        const data = await response.json();
        setPerformances(data);
        console.log(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPerformances();
  }, []);

  return (
    <div className="all-performance-tables">
      <h3 style={{ color: "white", textAlign: "center" }} id="Performances">
        Performance de tous les intervenants
      </h3>

      {loading ? (
        <p>Chargement des performances...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : performances.length === 0 ? (
        <p>Aucune performance trouvée.</p>
      ) : (
        performances.map((performance) => (
          <div key={performance.username} className="performance-table">
            <h4 style={{ color: "black", textAlign: "center", fontWeight: "bolder" }}>
              {performance.username}
            </h4>
            <div className="performance-tablecontent">
              <table style={{ width: "35%", margin: "10px auto" }}>
                <thead>
                  <tr>
                    <th>Statut</th>
                    <th>Nombre de tâches</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Total des tâches</td>
                    <td>{performance.total || 0}</td>
                  </tr>
                  <tr>
                    <td>Tâches terminées</td>
                    <td>{performance.completed || 0}</td>
                  </tr>
                  <tr>
                    <td>Tâches en cours</td>
                    <td>{performance.inProgress || 0}</td>
                  </tr>
                  <tr>
                    <td>Tâches annulées</td>
                    <td>{performance.cancelled || 0}</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ width: "35%", margin: "10px auto" }}>
                <CircularProgressbar
                  value={performance.progress || 0}
                  text={`${performance.progress || 0}%`}
                  styles={buildStyles({
                    textColor: "#000",
                    pathColor: "green",
                    trailColor: "#f4f4f4",
                  })}
                />
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default AllPerformanceTables;
