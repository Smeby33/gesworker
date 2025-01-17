import React, { useEffect, useState } from 'react';
import '../css/TaskCreation.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function TaskCreation() {
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

    const newTask = {
      id: tasks.length + 1,
      titre,
      company: selectedCompany,
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

    // Réinitialisation des champs
    setTitre('');
    setSelectedCategories([]);
    setSelectedIntervenants([]);
    setSelectedCompany('');
    setDateDebut(new Date().toISOString().slice(0, 16));
    setDateFin('');
  };

  return (
    <div className="task-creation-container">
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
  );
}

export default TaskCreation;
