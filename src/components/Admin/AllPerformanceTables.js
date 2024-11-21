import React, { useEffect, useState } from "react";

function AllPerformanceTables() {
  const [performances, setPerformances] = useState([]);

  useEffect(() => {
    // Récupérer les performances depuis le localStorage
    const storedPerformances = JSON.parse(localStorage.getItem("performance")) || [];
    setPerformances(storedPerformances);
  }, []);

  return (
    <div className="all-performance-tables">
      <h3>Performance de tous les intervenants</h3>
      {performances.length === 0 ? (
        <p>Aucune performance trouvée.</p>
      ) : (
        performances.map((performance) => (
          <div key={performance.username} className="performance-table">
            <h4>{performance.username}</h4>
            <table>
              <thead>
                <tr>
                  <th>Statut</th>
                  <th>Nombre de tâches</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Total des tâches</td>
                  <td>{performance.total}</td>
                </tr>
                <tr>
                  <td>Tâches terminées</td>
                  <td>{performance.completed}</td>
                </tr>
                <tr>
                  <td>Tâches en cours</td>
                  <td>{performance.inProgress}</td>
                </tr>
                <tr>
                  <td>Tâches annulées</td>
                  <td>{performance.cancelled}</td>
                </tr>
                <tr>
                  <td>Progrès</td>
                  <td>{performance.progress}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}

export default AllPerformanceTables;
