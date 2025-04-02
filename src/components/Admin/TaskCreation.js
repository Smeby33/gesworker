import React, { useEffect, useState } from 'react';
import '../css/TaskCreation.css';
import { toast, ToastContainer } from 'react-toastify';
import { signOut, getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

import 'react-toastify/dist/ReactToastify.css';

function TaskCreation() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [intervenants, setIntervenants] = useState([]);  
  const [companies, setCompanies] = useState([]);
  const [priorités, setPriorités] = useState([]);
  const [adminEmail, setAdminEmail] = useState('');
  const auth = getAuth();

  // États pour les champs du formulaire
  const [titre, setTitre] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedIntervenants, setSelectedIntervenants] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedPriorités, setSelectedPriorités] = useState('');
  const [dateDebut, setDateDebut] = useState(new Date().toISOString().slice(0, 16));
  const [dateFin, setDateFin] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (auth.currentUser) {
        setAdminEmail(auth.currentUser.email);
        const adminUID = auth.currentUser.uid;
  
        try {
          const [prioritesRes, intervenantsRes, tasksRes, companiesRes, categoriesRes] = await Promise.all([
            fetch('https://gesworkerback.onrender.com/prioritys/toutesprioritys'),
            fetch(`https://gesworkerback.onrender.com/intervenants/recuperertout/${adminUID}`),
            fetch(`https://gesworkerback.onrender.com/taches/tasks-by-owner/${adminUID}`),
            fetch(`https://gesworkerback.onrender.com/clients/client/${adminUID}`),
            fetch('https://gesworkerback.onrender.com/categories/toutescategories'),
          ]);
  
          setPriorités(await prioritesRes.json());
          setIntervenants(await intervenantsRes.json());
          setTasks(await tasksRes.json());
          setCompanies(await companiesRes.json());
          setCategories(await categoriesRes.json());
        } catch (error) {
          console.error("Erreur lors de la récupération des données :", error);
        }
      }
    };
  
    fetchData();
  }, []);
  

  const handleCategoryChange = (category) => {
    setSelectedCategories((prevSelected) => {
      const categoryExists = prevSelected.some((cat) => cat.name === category.name);
  
      if (categoryExists) {
        // Retirer la catégorie si elle est déjà sélectionnée
        return prevSelected.filter((cat) => cat.name !== category.name);
      } else {
        // Ajouter la nouvelle catégorie
        return [...prevSelected, { name: category.name, sousStatut: 'En attente' }];
      }
    });
  };
  

  const handleIntervenantChange = (intervenant) => {
    if (selectedIntervenants.includes(intervenant)) {
      setSelectedIntervenants(selectedIntervenants.filter((int) => int !== intervenant));
    } else {
      setSelectedIntervenants([...selectedIntervenants, intervenant]);
    }
  };

  const handleTaskCreation = async (e) => {
    e.preventDefault();

    const newTask = {
      title: titre,
      company: selectedCompany,
      priorite: parseInt(selectedPriorités, 10), // Convertir en nombre si c'est un ID
      categories: selectedCategories.map((cat) => cat.name), // Transformer en tableau de noms
      intervenants: selectedIntervenants, // Déjà un tableau
      date_debut: dateDebut,
      date_fin: dateFin || dateDebut,
      statut: 'En attente',
    };

    // Console log pour voir les données envoyées
    console.log("Données envoyées au backend:", JSON.stringify(newTask, null, 2));

    try {
        const response = await fetch('https://gesworkerback.onrender.com/taches/add-task', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTask),
        });

        const data = await response.json();

        if (response.ok) {
            toast.success('Tâche créée avec succès !');

            // Réinitialisation des champs
            setTitre('');
            setSelectedCategories([]);
            setSelectedIntervenants([]);
            setSelectedCompany('');
            setDateDebut(new Date().toISOString().slice(0, 16));
            setDateFin('');
        } else {
            toast.error(`Erreur: ${data.error}`);
        }
    } catch (error) {
        console.error('Erreur lors de l\'envoi de la tâche:', error);
        toast.error('Une erreur est survenue, veuillez réessayer.');
    }
};


  return (
    <div className="task-creation-container">
      <ToastContainer />
      <h3>Création de Tâche</h3>
      <div className="form-wrapper">

      <form onSubmit={handleTaskCreation} className=''>
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
                  value={category.id}
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
          <label>priorité :</label>
          <select
            value={selectedPriorités}
            onChange={(e) => setSelectedPriorités(e.target.value)}
            required
          >
            <option value="">Sélectionnez une priorité</option>
            {priorités.map((Priorité, index) => (
              <option key={index} value={Priorité.id}>
                {Priorité.Type}
              </option>
            ))}
          </select>

          <div>
          <label>Entreprise :</label>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            required
          >
            <option value="">Sélectionnez une entreprise</option>
            {companies.map((company, index) => (
              <option key={index} value={company.company_name}>
                {company.company_name}
              </option>
            ))}
          </select>
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
    </div>
  );
}

export default TaskCreation;
