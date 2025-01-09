import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import CreateCompany from  './CreateCompany';
import CreateIntervenant from  './CreateIntervenant';
import TaskCreation from './TaskCreation';
import {
  FaUserPlus,
  FaFileMedical,
  FaBuilding,
  FaTimes,
  FaList,
  FaTh
} from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import '../css/Intervenant.css'; // Assure-toi que le chemin est correct

function Intervenant() {
// ** États globaux liés aux intervenants et interactions **
const [hoveredIntervenant, setHoveredIntervenant] = useState(null); // Intervenant survolé
const [viewMode, setViewMode] = useState('list'); // Vue par défaut (liste)
const [showIntervenantForm, setShowIntervenantForm] = useState(false); // Formulaire d'intervenant affiché
const [activeIntervenantIndex, setActiveIntervenantIndex] = useState(null); // Index actif pour les formulaires
const [selectedIntervenantForTask, setSelectedIntervenantForTask] = useState(null); // Intervenant spécifique à une tâche
const [selectedIntervenantState, setSelectedIntervenantState] = useState(''); // État sélectionné
const [selectedIntervenant, setSelectedIntervenant] = useState(null); // Intervenant actuellement sélectionné

const [tasks, setTasks] = useState([]);
const [categories, setCategories] = useState([]);
const [intervenants, setIntervenants] = useState([]);
const [companies, setCompanies] = useState([]);

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

  if (!formState.selectedIntervenantForTask) {
    toast.error('Veuillez sélectionner un intervenant.');
    return;
  }

  const newTask = {
    id: tasks.length + 1,
    titre,
    company: selectedCompany,
    categories: selectedCategories,
    intervenants: [formState.selectedIntervenantForTask.name], // Assigner l'intervenant sélectionné
    dateDebut,
    dateFin: dateFin || dateDebut,
    statut: 'En attente',
  };

  const updatedTasks = [...tasks, newTask];
  setTasks(updatedTasks);
  saveTasksToLocalStorage(updatedTasks);
  toast.success('Tâche créée avec succès !');

  // Réinitialisation des champs
  setTitre('');
  setSelectedCategories([]);
  setSelectedCompany('');
  setDateDebut(new Date().toISOString().slice(0, 16));
  setDateFin('');
};







// ** États complexes et groupés **

   const [formState, setFormState] = useState({
  showIntervenantForm: null,
  activeIntervenantIndex: null,
  selectedIntervenantForTask: null,
}); // Gestion centralisée des formulaires

const [taskForm, setTaskForm] = useState({
  titre: '',
  selectedCategories: [],
  selectedCompany: '',
  dateDebut: new Date().toISOString().slice(0, 16),
  dateFin: '',
}); // Formulaire des tâches



// ** États liés aux champs du formulaire **


// ** Initialisation des données depuis le localStorage **
useEffect(() => {
  const storedCategories = JSON.parse(localStorage.getItem('taskCategories')) || [];
  const storedIntervenants = JSON.parse(localStorage.getItem('intervenant')) || [];
  const storedCompanies = JSON.parse(localStorage.getItem('clients')) || [];
  const storedTasks = JSON.parse(localStorage.getItem('tasks')) || [];

  setCategories(storedCategories);
  setIntervenants(storedIntervenants);
  setCompanies(storedCompanies);
  setTasks(storedTasks);
}, []);



// ** Fonctions utilitaires **

// Sauvegarder les tâches dans le localStorage



// Création d'une tâche
// Bascule de l'état d'un formulaire
const toggleFormState = (key, value) => {
  setFormState((prev) => ({
    ...prev,
    [key]: prev[key] === value ? null : value,
  }));

  if (key === 'selectedIntervenantForTask') {
    setSelectedIntervenantForTask(value); // Mettez à jour l'état de l'intervenant sélectionné
  }
};

// Empêcher le dédoublement des formulaires
const handleIntervenantFormToggle = (intervenantIndex) => {
  setShowIntervenantForm(showIntervenantForm === intervenantIndex ? null : intervenantIndex);
};

// Récupérer les tâches d'un intervenant spécifique
const getTasksForIntervenant = (intervenantName) => {
  return tasks.filter((task) => task.intervenants.includes(intervenantName));
};

// Déterminer la couleur de fond d'une tâche en fonction de la date limite
const getTaskBackgroundColor = (task) => {
  const today = new Date();
  const taskDateFin = new Date(task.dateFin);
  const diffTime = taskDateFin - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (task.statut !== 'Terminé' && diffDays < 0) {
    return 'red'; // Date dépassée et tâche non terminée
  } else if (diffDays <= 3 && diffDays >= 0) {
    return 'orange'; // Proche de la date limite
  }
  return 'white'; // Par défaut
};

// Mise à jour de la liste des entreprises
const handleCompanyCreation = () => {
  const updatedCompanies = JSON.parse(localStorage.getItem('clients')) || [];
  setCompanies(updatedCompanies);
  setActiveIntervenantIndex(null); // Fermer tous les formulaires
};
   
  return (
    <div className="intervenant-container" id='Intervenant'>
      <h3 id='intervenants'>Liste des Intervenants</h3>

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

      {/* Conteneur des intervenants */}
      <div className={`intervenant-view ${viewMode}`}>
        {intervenants.length > 0 ? (
          intervenants.map((intervenant, index) => (
            <div
              key={index}
              className={`intervenant-item ${hoveredIntervenant === intervenant ? 'hovered' : ''}`}
              onMouseEnter={() => setHoveredIntervenant(intervenant)}
              onMouseLeave={() => setHoveredIntervenant(null)}
            >
              <div className="navclient">
                <div className="btnnav">
                <button className="nav-button"
                 onClick={() => toggleFormState('showIntervenantForm', index)}
                >
                  <FaUserPlus className="btnnavicon"/>
                    <a href="#form-intervenant" className="nav-link">
                       Add Intervenant
                    </a>
                  </button>
                </div>
                <div className="btnnav">
                  <button className="nav-button"onClick={() => toggleFormState('activeIntervenantIndex', index)}
                    >
                      <FaBuilding className="btnnavicon" />
                    <a  className="nav-link">
                       Add Entreprise
                    </a>
                  </button>
                </div>
                <div className="btnnav">
               <button  className="nav-button" onClick={() => toggleFormState('selectedIntervenantForTask', intervenant)}>
            
                    <FaFileMedical className="btnnavicon" />
                    <a className="nav-link">
                       Add Tâches
                    </a>
                  </button>
                </div>
              </div>
              <div className="affichagetable">

              <div className="intervenant-row">
                <div className="intervenant-col">{intervenant.name}</div>
                <div className="intervenant-col"> {intervenant.phone}</div>
                <div className="intervenant-col">{intervenant.email}</div>
                <div className="intervenant-col">{intervenant.id}</div>
                <div className="intervenant-col">{intervenant.password}</div>
              </div>
        

               {formState.showIntervenantForm === index && (     
                 <CreateIntervenant id='form'  onIntervenantAdded={setIntervenants} />
                  )}
                   {formState.activeIntervenantIndex === index && (
                     <CreateCompany onCompanyCreated={setCompanies} />
                     )}
              {formState.selectedIntervenantForTask?.name === intervenant.name && (
                <div className="task-creation-container" id="form">
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
                    <label>Entreprise :</label>
                    <select
                      value={selectedCompany}
                      onChange={(e) => setSelectedCompany(e.target.value)}
                      required
                    >
                      <option value="">Sélectionnez une entreprise</option>
                      {companies.map((company, index) => (
                        <option key={index} value={company.companyName}>
                          {company.companyName}
                        </option>
                      ))}
                    </select>
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
             
           
              

              {hoveredIntervenant && hoveredIntervenant.name === intervenant.name && (
                <div className="intervenant-details">
                  <h4>Tâches assignées</h4>
                  <div className="tasks">
                    {getTasksForIntervenant(intervenant.name).length > 0 ? (
                      getTasksForIntervenant(intervenant.name).map((task, index) => (
                        <div
                          key={index}
                          className="task-item2"
                          style={{ backgroundColor: getTaskBackgroundColor(task) }}
                        >
                          <strong>Client: {task.company}</strong> 
                          <p>Catégorie: {task.categories.join(', ')}</p> 
                          <p>Statut: {task.statut}</p>
                          <p>Date limite: {task.dateFin}</p>
                        </div>
                      ))
                    ) : (
                      <p>Aucune tâche assignée.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
            </div>
          ))
        ) : (
          <p>Aucun intervenant trouvé.</p>
        )}
      </div>
    </div>
  );
}

export default Intervenant;





  



   

   


 
