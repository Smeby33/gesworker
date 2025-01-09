import React, { useEffect, useState } from 'react';
import CreateCompany from  './CreateCompany';
import CreateIntervenant from  './CreateIntervenant';
import TaskCreation from './TaskCreation';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../css/Company.css'; // Assure-toi que le chemin est correct
import {
  FaUserPlus,
  FaFileMedical,
  FaBuilding,
  FaList,
  FaTimes,
  FaTh
} from 'react-icons/fa';

function Company() {
  const [companies, setCompanies] = useState([]);
  const [hoveredCompany, setHoveredCompany] = useState(null);
  const [activeCompanyIndex, setActiveCompanyIndex] = useState(null); 
  const [selectedCompanyForTask, setSelectedCompanyForTask] = useState(null);// Devient spécifique
  const [viewMode, setViewMode] = useState('list'); // Vue par défaut : liste
  const [showIntervenantForm, setShowIntervenantForm] = useState(false);
  const [selectedCompanyForIntervenant, setSelectedCompanyForIntervenant] = useState(null);


  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [intervenants, setIntervenants] = useState([]);

  // États pour les champs du formulaire
  const [titre, setTitre] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedIntervenants, setSelectedIntervenants] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [dateDebut, setDateDebut] = useState(new Date().toISOString().slice(0, 16));
  const [dateFin, setDateFin] = useState('');

  useEffect(() => {
    // Récupération des données depuis le localStorage
    const storedCategories = JSON.parse(localStorage.getItem('taskCategories')) || [];
    const storedIntervenants = JSON.parse(localStorage.getItem('intervenant')) || [];
    const storedCompanies = JSON.parse(localStorage.getItem('clients')) || [];
    const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];

    setCategories(storedCategories);
    setIntervenants(storedIntervenants);
    setCompanies(storedCompanies);
    setTasks(storedTasks);
  }, []);

  const saveTasksToLocalStorage = (tasks) => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  };

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

    const newTask = {
      id: tasks.length + 1,
      titre,
      company: selectedCompanyForTask?.companyName,
      categories: selectedCategories,
      intervenants: selectedIntervenants,
      dateDebut,
      dateFin: dateFin || dateDebut,
      statut: 'En attente',
    };
    if (!selectedCompanyForTask) {
      toast.error('Veuillez sélectionner une entreprise avant de créer une tâche.');
      return;
    }
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    saveTasksToLocalStorage(updatedTasks);
    toast.success('Tâche créée avec succès !');

    // Réinitialisation des champs
    setTitre('');
    setSelectedCategories([]);
    setSelectedIntervenants([]);
    setSelectedCompany('');
    setDateDebut(new Date().toISOString().slice(0, 16));
    setDateFin('');
  };




  
  
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
      return 'pink'; // Si la date est dépassée et la tâche non terminée
    } else if (diffDays <= 3 && diffDays >= 0) {
      return 'orange'; // Si la date limite est dans 3 jours ou moins
    }
    return 'white'; // Couleur par défaut
  };

  // Met à jour la liste des entreprises après la création
  const handleCompanyCreation = () => {
    const updatedCompanies = JSON.parse(localStorage.getItem('clients')) || [];
    setCompanies(updatedCompanies);
    setActiveCompanyIndex(null); // Fermer tous les formulaires
  };
// Fonction pour afficher TaskCreation pour une entreprise
const handleAddTaskClick = (companyIndex) => {
  setSelectedCompanyForTask(
    selectedCompanyForTask === companyIndex ? null : companyIndex
  ); // Permet de basculer entre afficher/masquer
};



//fonction pour empecher le dedoublemment 
const handleIntervenantFormToggle = (companyIndex) => {
  setShowIntervenantForm(showIntervenantForm === companyIndex ? null : companyIndex); // Bascule l'état
};





useEffect(() => {
  // Récupérer les données depuis le local storage
  const storedCategories = JSON.parse(localStorage.getItem('taskCategories')) || [];
  const storedIntervenants = JSON.parse(localStorage.getItem('intervenant')) || [];
  const storedCompanies = JSON.parse(localStorage.getItem('clients')) || [];
  const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];

  setCategories(storedCategories);
  setIntervenants(storedIntervenants);
  setCompanies(storedCompanies);
  setTasks(storedTasks);
}, []);





  return (
    <div className="company-container">
      <h3 id="clients">Liste des Clients</h3>

      {/* Sélecteur de vue */}
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

      {/* Conteneur des clients */}
      <div className={`client-view ${viewMode}`}>
        {companies.length > 0 ? (
          companies.map((company, index) => (
            <div
              key={index}
              className={`client-item ${hoveredCompany === company ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredCompany(company)}
              onMouseLeave={() => setHoveredCompany(null)}
            >
              <div className="navclient">
                <div className="btnnav">
                <button className="nav-button"
                  onClick={() => handleIntervenantFormToggle(index)} // Passe l'index de l'entreprise
                >
                  <FaUserPlus className="btnnavicon"/>
                    <a href="#form-intervenant" className="nav-link">
                       Add Intervenant
                    </a>
                  </button>
                </div>
                <div className="btnnav">
                  <button className="nav-button" onClick={() => 
                      setActiveCompanyIndex(activeCompanyIndex === index ? null : index)
                    }>
                      <FaBuilding className="btnnavicon" />
                    <a  className="nav-link">
                       Add Entreprise
                    </a>
                  </button>
                </div>
                <div className="btnnav">
                <button
                  className="nav-button"
                  onClick={() =>
                    setSelectedCompanyForTask(
                      selectedCompanyForTask?.companyName === company.companyName
                        ? null
                        : company
                    )
                  }
                >
                    <FaFileMedical className="btnnavicon" />
                    <a className="nav-link">
                       Add Tâches
                    </a>
                  </button>
                </div>
              </div>
              <div className="affichagetable">

              <div className="company-row">
                <div className="company-col">{company.companyName}</div>
                <div className="company-col">{company.contact}</div>
                <div className="company-col">{company.email}</div>
                <div className="company-col">{company.address}</div>
                <div className="company-col">{company.description}</div>
              </div>

              {showIntervenantForm === index && (
                <div>
                  <CreateIntervenant 
                    onIntervenantAdded={(updatedIntervenants) =>
                      setIntervenants(updatedIntervenants)
                      
                    }
                  />
                  </div>
                )}
              {activeCompanyIndex === index && (
                <CreateCompany onCompanyCreated={handleCompanyCreation} className="company-details1" />
              )}
               {/* Afficher le composant TaskCreation si une entreprise est sélectionnée */}
               {selectedCompanyForTask?.companyName ===
                company.companyName && (
                  <div className="task-creation-container" id="form" >
      <ToastContainer />
      <h3>Création de Tâche</h3>

      <form onSubmit={handleTaskCreation}>
        <div>
          <label>Titre de la tâche :</label>
          <input
            type="text"
            value={titre}
            onChange={(e) => setTitre(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Catégories de tâche :</label>
          <div className="checkbox-group">
            {categories.map((category, index) => (
              <div key={index}>
                <input
                  type="checkbox"
                  id={`category-${index}`}
                  value={category.name}
                  checked={selectedCategories.some((cat) => cat.name === category.name)}
                  onChange={() => handleCategoryChange(category)}
                />
                <label htmlFor={`category-${index}`}>
                  <img src={category.icon} alt="" className="icon" /> {category.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label>Intervenants :</label>
          <div className="checkbox-group">
            {intervenants.map((intervenant, index) => (
              <div key={index}>
                <input
                  type="checkbox"
                  id={`intervenant-${index}`}
                  value={intervenant.name}
                  checked={selectedIntervenants.includes(intervenant.name)}
                  onChange={() => handleIntervenantChange(intervenant.name)}
                />
                <label htmlFor={`intervenant-${index}`}>
                  <img src={intervenant.icon} alt="" className="icon" /> {intervenant.name}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <label>Date de début :</label>
          <input
            type="datetime-local"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
          />
        </div>

        <div>
          <label>Date de fin :</label>
          <input
            type="datetime-local"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
          />
        </div>

        <button type="submit">Créer la tâche</button>
      </form>
    </div>
              )}

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
          <p>Aucun client trouvé.</p>
        )}
      </div>
    </div>
  );
}

export default Company;
