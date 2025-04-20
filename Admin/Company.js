// 


import React, { useEffect, useState } from 'react';
import CreateCompany from './CreateCompany';
import TaskCreation from './TaskCreacomp';
import CreateIntervenant from './CreateIntervenant';
import { getAuth } from "firebase/auth";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/Company.css';
import {
  FaUserPlus,
  FaFileMedical,
  FaList,
  FaPlusCircle,
  FaTimes,
  FaTh
} from 'react-icons/fa';

function Company() {
  // États simplifiés et consolidés
  const [companies, setCompanies] = useState([]);
  const [hoveredCompany, setHoveredCompany] = useState(null);
  const [viewMode, setViewMode] = useState('list');
  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [expandedCompany, setExpandedCompany] = useState(null);
  const [formToShow, setFormToShow] = useState(null); // 'intervenant' ou 'task'
  const [selectedCompany, setSelectedCompany] = useState(null);
  
  const [adminEmail, setAdminEmail] = useState('');
  const auth = getAuth();

  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [intervenants, setIntervenants] = useState([]);
  
  // États du formulaire de tâche
  const [titre, setTitre] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedIntervenants, setSelectedIntervenants] = useState([]);
  const [dateDebut, setDateDebut] = useState(new Date().toISOString().slice(0, 16));
  const [dateFin, setDateFin] = useState('');

  // Chargement des données

  const toggleCompanyActions = (company) => {
    if (expandedCompany === company) {
      setExpandedCompany(null);
      setFormToShow(null);
    } else {
      setExpandedCompany(company);
      setSelectedCompany(company);
    }
  };

  const showForm = (formType) => {
    setFormToShow(formType);
  };

  const closeForm = () => {
    setFormToShow(null);
  };

  useEffect(() => { 
    const fetchCategories = async () => {
      try {
        const response = await fetch("https://gesworkerback.onrender.com/categories/toutescategories");
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des catégories :", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchIntervenants = async () => {
      if (auth.currentUser) {
        setAdminEmail(auth.currentUser.email);
        const adminUID = auth.currentUser.uid;
        try {
          const response = await fetch(`https://gesworkerback.onrender.com/intervenats/recuperertout/${adminUID}`);
          const data = await response.json();
          setIntervenants(data);
        } catch (error) {
          console.error("Erreur lors de la récupération des intervenants :", error);
        }
      }
    };
  
    fetchIntervenants();
  }, [auth.currentUser]);

  useEffect(() => {
    const fetchCompanies = async () => {
      if (auth.currentUser) {
        setAdminEmail(auth.currentUser.email);
        const adminUID = auth.currentUser.uid;
      try {
        const response = await fetch(`https://gesworkerback.onrender.com/clients/client/${adminUID}`);
        const data = await response.json();
        setCompanies(data);
      } catch (error) {
        console.error("Erreur lors de la récupération des entreprises :", error);
      }
    }
    };

    fetchCompanies();
  }, [auth.currentUser]);

  // Fonctions utilitaires
  const saveTasksToLocalStorage = (tasks) => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  };

  const getTasksForCompany = (companyName) => {
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
    return storedTasks.filter((task) => task.company === companyName);
  };

  const getTaskBackgroundColor = (task) => {
    const today = new Date();
    const dateFin = new Date(task.dateFin);
    const diffTime = dateFin - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (task.statut !== 'Terminé' && diffDays < 0) {
      return 'pink';
    } else if (diffDays <= 3 && diffDays >= 0) {
      return 'orange';
    }
    return 'white';
  };

  // Gestion des formulaires
  const handleCompanyCreation = () => {
    const updatedCompanies = JSON.parse(localStorage.getItem('clients')) || [];
    setCompanies(updatedCompanies);
    setShowCreateCompany(false);
  };

  // Gestion des tâches
  const handleCategoryChange = (category) => {
    const categoryExists = selectedCategories.find((cat) => cat.name === category.name);
    if (categoryExists) {
      setSelectedCategories(selectedCategories.filter((cat) => cat.name !== category.name));
    } else {
      setSelectedCategories([...selectedCategories, { name: category.name, sousStatut: 'En attente' }]);
    }
  };

  const handleIntervenantChange = (intervenant) => {
    if (selectedIntervenants.includes(intervenant)) {
      setSelectedIntervenants(selectedIntervenants.filter((int) => int !== intervenant));
    } else {
      setSelectedIntervenants([...selectedIntervenants, intervenant]);
    }
  };

  const handleTaskCreation = (e) => {
    e.preventDefault();

    if (!selectedCompany) {
      toast.error('Veuillez sélectionner une entreprise avant de créer une tâche.');
      return;
    }

    const newTask = {
      id: tasks.length + 1,
      titre,
      company: selectedCompany.company_name,
      categories: selectedCategories,
      intervenants: selectedIntervenants,
      dateDebut,
      dateFin: dateFin || dateDebut,
      statut: 'En attente',
    };

    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasksToLocalStorage(updatedTasks);
    toast.success('Tâche créée avec succès !');

    // Réinitialisation
    setTitre('');
    setSelectedCategories([]);
    setSelectedIntervenants([]);
    setDateDebut(new Date().toISOString().slice(0, 16));
    setDateFin('');
    closeForm();
  };

  return (
    <div className='company-containerparentadmin' >
    <div className="company-container">
      <h3 id="clients">Liste des Clients</h3>

      <div className="view-selector">
        <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}>
          <FaList /> Liste
        </button>
        <button onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'active' : ''}>
          <FaTh /> Grille
        </button>
        <button onClick={() => setShowCreateCompany(!showCreateCompany)}>
          <FaPlusCircle/> Client
        </button>
      </div>

      {showCreateCompany && (
         <CreateCompany 
         onCompanyCreated={handleCompanyCreation}
         closeForm={() => {
           setShowCreateCompany(false);
           closeForm(); // Appel à la fonction originale si nécessaire
         }}
       />
      )}

      <div className={`client-view ${viewMode}`}>
        {companies.length > 0 ? (
          companies.map((company, index) => (
            <div
              key={index}
              className={`client-item ${hoveredCompany === company ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredCompany(company)}
              onMouseLeave={() => setHoveredCompany(null)}
            >
              <div className="affichagetable">
                <div 
                  className="company-row" 
                  onClick={() => toggleCompanyActions(company)}
                >
                  <div className="company-col">{company.company_name}</div>
                  <div className="company-col">{company.contact}</div>
                  <div className="company-col">{company.email}</div>
                  <div className="company-col">{company.address}</div>
                  <div className="company-col">{company.description}</div>
                </div>

                {expandedCompany === company && (
                  <div className="navclient">
                    <div className="btnnav">
                      <button 
                        className="nav-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          showForm('intervenant');
                        }}
                      >
                        <FaUserPlus className="btnnavicon"/>
                        <span className="nav-link">Add Intervenant</span>
                      </button>
                    </div>

                    <div className="btnnav">
                      <button
                        className="nav-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          showForm('task');
                        }}
                      >
                        <FaFileMedical className="btnnavicon" />
                        <span className="nav-link">Add Tâches</span>
                      </button>
                    </div>
                  </div>
                )}

                {expandedCompany === company && formToShow === 'intervenant' && (
                  <CreateIntervenant 
                    onIntervenantAdded={(updatedIntervenants) => {
                      setIntervenants(updatedIntervenants);
                      closeForm();
                    }}
                    closeForm={closeForm}
                  />
                )}

                {expandedCompany === company && formToShow === 'task' && (
                    <TaskCreation
                    closeForm={() => {
                      setShowCreateCompany(false);
                      closeForm(); // Appel à la fonction originale si nécessaire
                    }}/>
                )}

                {hoveredCompany === company && (
                  <div className="company-details">
                  <h4>Détails de l'entreprise: {company.company_name}</h4>
                  <div className="tasks">
                    <h5>Tâches associées à cette entreprise</h5>
                    {getTasksForCompany(company.company_name).length > 0 ? (
                      getTasksForCompany(company.company_name).map((task, index) => (
                        <div
                          key={index}
                          className="task-item3"
                          style={{ backgroundColor: getTaskBackgroundColor(task) }}
                        >
                          <strong><p>Catégorie: {task.categories && task.categories.length > 0 ? 
                            task.categories.map((cat, idx) => <p key={idx}>-{cat.name}</p>) : 
                              <div className="intervenant-col">Aucune catégorie.</div>}</p></strong>
                          <p>Statut: {task.statut}</p>
                          <p>Date limite: {task.dateFin}</p>
                          <div className="task-item-ul3">
                            {task.intervenants.map((intervenant, i) => (
                              <div key={i}>
                                <p>{intervenant}</p>
                              </div>
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
              </div>
            </div>
          ))
        ) : (
          <div>
            <p>Aucun client trouvé</p>
            <CreateCompany onCompanyCreated={handleCompanyCreation} 
             closeForm={closeForm}
            />
          </div>
        )}
      </div>
    </div>
    </div>
  );
}

export default Company;
