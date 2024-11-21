import React, { useEffect, useState } from 'react';
import '../css/Company.css'; // Assure-toi que le chemin est correct

function Company() {
  const [companies, setCompanies] = useState([]);
  const [hoveredCompany, setHoveredCompany] = useState(null);

  useEffect(() => {
    const storedCompanies = JSON.parse(localStorage.getItem('clients')) || [];
    setCompanies(storedCompanies);
  }, []);

  // Récupère les tâches associées à une entreprise
  const getTasksForCompany = (companyName) => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    return storedTasks.filter((task) => task.company === companyName);
  };

  // Fonction pour déterminer le style de la tâche en fonction de la date limite
  const getTaskBackgroundColor = (task) => {
    const today = new Date();
    const dateFin = new Date(task.dateFin);
    const diffTime = dateFin - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); // Convertir en jours

    if (task.statut !== 'Terminé' && diffDays < 0) {
      return 'red'; // Si la date est dépassée et la tâche non terminée
    } else if (diffDays <= 3 && diffDays >= 0) {
      return 'orange'; // Si la date limite est dans 3 jours ou moins
    }
    return 'white'; // Couleur par défaut
  };

  return (
    <div className="company-container">
      <h3>Liste des Clients</h3>
      <ul className="client-list">
        {companies.length > 0 ? (
          companies.map((company, index) => (
            <li
              key={index}
              className="client-item"
              onMouseEnter={() => setHoveredCompany(company)}
              onMouseLeave={() => setHoveredCompany(null)}
            >
              <strong>{company.companyName}</strong>
              <p><span>Contact:</span> {company.contact}</p>
              <p><span>Email:</span> {company.email}</p>
              <p><span>Adresse:</span> {company.address}</p>
              <p><span>Description:</span> {company.description}</p>

              {hoveredCompany && hoveredCompany.companyName === company.companyName && (
                <div className="company-details">
                  <h4>Détails de l'entreprise: {company.companyName}</h4>
                  <div className="tasks">
                    <h5>Tâches associées à cette entreprise</h5>
                    {getTasksForCompany(company.companyName).length > 0 ? (
                      getTasksForCompany(company.companyName).map((task, index) => (
                        <div
                          key={index}
                          className="task-item3"
                          style={{ backgroundColor: getTaskBackgroundColor(task) }}
                        >
                          <strong>{task.categories.join(', ')}</strong> - Statut: {task.statut}
                          <p>Date limite: {task.dateFin}</p>
                          <div className="task-item-ul3">
                            {task.intervenants.map((intervenant, i) => (
                              <div key={i}><p>{intervenant}</p></div>
                            ))}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p>Aucune tâche pour cette entreprise.</p>
                    )}
                  </div>
                </div>
              )}
            </li>
          ))
        ) : (
          <p>Aucun client trouvé.</p>
        )}
      </ul>
    </div>
  );
}

export default Company;
