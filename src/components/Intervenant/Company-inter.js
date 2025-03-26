import React, { useEffect, useState } from 'react';
import { getAuth } from "firebase/auth";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/Company.css';
import {
  FaList,
  FaPlusCircle,
  FaTh
} from 'react-icons/fa';

function Company() {
  const [companies, setCompanies] = useState([]);
  const [hoveredCompany, setHoveredCompany] = useState(null); 
  const [ajouterCompany, setAjouterCompany] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [adminEmail, setAdminEmail] = useState('');
  const auth = getAuth();
  
  const [tasksByCompany, setTasksByCompany] = useState({});

  useEffect(() => {
    const fetchCompaniesAndTasks = async () => {
      if (auth.currentUser) {
        setAdminEmail(auth.currentUser.email);
        const adminUID = auth.currentUser.uid;
        
        try {
          // Récupérer les entreprises
          const companiesResponse = await fetch(`http://localhost:5000/intervenantinters/entreprises/intervenant/${adminUID}`);
          const companiesData = await companiesResponse.json();
          setCompanies(companiesData);
          
          // Pour chaque entreprise, récupérer les tâches
          const tasksMap = {};
          for (const company of companiesData) {
            try {
              const tasksResponse = await fetch(`http://localhost:5000/intervenantinters/tasks/company/${company.id}`);
              const tasksData = await tasksResponse.json();
              console.log(tasksData)
              
              // Formater les tâches pour avoir des tableaux d'objets pour categories et intervenants
              const formattedTasks = tasksData.map(task => {
                // Convertir les catégories en tableau d'objets
                let categoriesArray = [];
                if (Array.isArray(task.categories)) {
                  categoriesArray = task.categories;
                } else if (typeof task.categories === 'string') {
                  categoriesArray = task.categories.split(', ').map(cat => ({
                    id: Math.random().toString(36).substr(2, 9), // ID temporaire
                    name: cat.trim()
                  }));
                }

                // Convertir les intervenants en tableau d'objets
                let intervenantsArray = [];
                if (Array.isArray(task.intervenants)) {
                  intervenantsArray = task.intervenants;
                } else if (typeof task.intervenants === 'string') {
                  intervenantsArray = task.intervenants.split(', ').map(int => ({
                    id: Math.random().toString(36).substr(2, 9), // ID temporaire
                    name: int.trim()
                  }));
                }

                return {
                  ...task,
                  categories: categoriesArray,
                  intervenants: intervenantsArray
                };
              });
              
              tasksMap[company.id] = formattedTasks;
            } catch (error) {
              console.error(`Erreur lors de la récupération des tâches pour l'entreprise ${company.id}:`, error);
              tasksMap[company.id] = [];
            }
          }
          setTasksByCompany(tasksMap);
          
        } catch (error) {
          console.error("Erreur lors de la récupération des entreprises :", error);
          toast.error("Erreur lors de la récupération des données");
        }
      }
    };

    fetchCompaniesAndTasks();
  }, [auth.currentUser]);

  const getTasksForCompany = (companyId) => {
    return tasksByCompany[companyId] || [];
  };

  const getTaskBackgroundColor = (task) => {
    if (!task.date_fin) return 'white';
    
    const today = new Date();
    const dateFin = new Date(task.date_fin);
    const diffTime = dateFin - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (task.statut !== 'Terminé' && diffDays < 0) {
      return 'pink';
    } else if (diffDays <= 3 && diffDays >= 0) {
      return 'orange';
    }
    return 'white';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Non spécifiée';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="company-container">
      <ToastContainer />
      <h3 id="clients">Liste des Clients</h3>

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
        <button onClick={() => setAjouterCompany(!ajouterCompany)}>
          <FaPlusCircle/> Client
        </button>
      </div>

      <div className={`client-view ${viewMode}`}>
        {companies.length > 0 ? (
          companies.map((company) => (
            <div
              key={company.id}
              className={`client-item ${hoveredCompany?.id === company.id ? 'hovered' : ''}`}
            >
              <div className="affichagetable">
                <div className="company-row">
                  <div className="company-col"
                    onClick={() => setHoveredCompany(company)}
                    onDoubleClick={() => setHoveredCompany(null)}>
                    {company.company_name}
                  </div>
                  <div className="company-col">{company.contact || 'Non spécifié'}</div>
                  <div className="company-col">{company.email || 'Non spécifié'}</div>
                  <div className="company-col">{company.address || 'Non spécifié'}</div>
                  <div className="company-col">{company.description || 'Aucune description'}</div>
                </div>

                {hoveredCompany?.id === company.id && (
                  <div className="company-details">
                    <h4>Détails de l'entreprise: {company.company_name}</h4>
                    <div className="tasks">
                      <h5>Tâches associées ({getTasksForCompany(company.id).length})</h5>
                      {getTasksForCompany(company.id).length > 0 ? (
                        <div className="tasks-list">
                          {getTasksForCompany(company.id).map((task) => (
                            <div
                              key={task.id}
                              className="task-item3"
                              style={{ backgroundColor: getTaskBackgroundColor(task) }}
                            >
                              <h4>{task.title}</h4>
                              <p><strong>Statut:</strong> {task.statut || 'Non spécifié'}</p>
                              
                              <div className="task-categories">
                                <strong>Catégories:</strong>
                                {task.categories?.length > 0 ? (
                                  <div className="categories-list">
                                    {task.categories.map((category) => (
                                      <span key={category.id} className="cate">
                                        {category.name}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="no-data">Aucune catégorie</span>
                                )}
                              </div>
                              
                              <p><strong>Dates:</strong> {formatDate(task.date_debut)} → {formatDate(task.date_fin)}</p>
                              
                              <div className="task-intervenants">
                                <strong>Intervenants:</strong>
                                {task.intervenants?.length > 0 ? (
                                  <div className="intervenants-list">
                                    {task.intervenants.map((intervenant) => (
                                      <div key={intervenant.id} className="cate">
                                        {intervenant.name}
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="no-data">Aucun intervenant</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="no-tasks">Aucune tâche pour cette entreprise.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="no-companies">
            <p>Aucun client trouvé</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Company;