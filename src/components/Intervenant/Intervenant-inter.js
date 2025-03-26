import React, { useEffect, useState } from 'react';
import '../css/Intervenant.css';
import { FaList, FaTh } from 'react-icons/fa';
import { getAuth } from "firebase/auth";
import axios from 'axios';

function Intervenantinter() {
  const [intervenants, setIntervenants] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [interProfil, setInterProfil] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [taskAssigned, setTaskAssigned] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Récupérer l'utilisateur connecté
        const user = auth.currentUser;
        if (!user) {
          throw new Error("Aucun utilisateur connecté");
        }
        setCurrentUser(user);

        // Récupérer les intervenants du même propriétaire
        const intervenantsResponse = await axios.get(`http://localhost:5000/intervenantinters/mesintervenants/${user.uid}`);
        
        // Gestion robuste des données reçues
        const receivedIntervenants = intervenantsResponse.data?.data || intervenantsResponse.data;
        console.log("Intervenants reçus (DETAILS):", receivedIntervenants);
        setIntervenants(Array.isArray(receivedIntervenants) ? receivedIntervenants : []);

        // Récupérer les tâches
        const tasksResponse = await axios.get(`http://localhost:5000/taches/intervenantinters/${user.uid}`);
        const receivedTasks = tasksResponse.data?.data || tasksResponse.data;
        console.log("Tâches reçues (DETAILS):", receivedTasks);
        setTasks(Array.isArray(receivedTasks) ? receivedTasks : []);

        setLoading(false);
      } catch (err) {
        console.error("Erreur DETAILLEE:", err.response ? err.response.data : err);
        setError(err.message);
        setIntervenants([]);
        setTasks([]);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Fonction pour récupérer les tâches d'un intervenant (sécurisée)
  const getTasksForIntervenant = (intervenantName) => {
    if (!Array.isArray(tasks)) return [];
    return tasks.filter(
      (task) =>
        Array.isArray(task.intervenants) && 
        task.intervenants.includes(intervenantName)
    );
  };

  // Filtrer les intervenants (version sécurisée)
  const filteredIntervenants = Array.isArray(intervenants) 
    ? intervenants.filter(intervenant => {
        if (!Array.isArray(tasks)) return false;
        
        return tasks.some(task => 
          Array.isArray(task.intervenants) && 
          task.intervenants.includes(intervenant.name)
        );
      })
    : [];

  // Déterminer la couleur de fond de la tâche
  const getTaskBackgroundColor = (task) => {
    if (!task?.date_fin) return 'white';
    
    try {
      const today = new Date();
      const dateFin = new Date(task.date_fin);
      const diffDays = Math.ceil((dateFin - today) / (1000 * 60 * 60 * 24));

      if (task.statut !== 'Terminé' && diffDays < 0) return 'red';
      if (diffDays <= 3 && diffDays >= 0) return 'orange';
      return 'white';
    } catch {
      return 'white';
    }
  };
// Fonction de formatage de date pour le composant Intervenants
const formatDate = (date) => {
  // Si la date est invalide ou null, retourner une chaîne par défaut
  if (!date || isNaN(new Date(date).getTime())) return 'Date non disponible';
  
  // Créer un objet Date
  const formattedDate = new Date(date);
  
  // Formater la date et l'heure en français
  return formattedDate.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }) + ' , ' + formattedDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

  if (loading) return <div className="loading">Chargement en cours...</div>;
  if (error) return <div className="error">Erreur: {error}</div>;

  return (
    <div className="intervenant-container" id="Intervenant">
      <h3>Liste des collègues</h3>

      {/* Boutons de changement de vue */}
      <div className="view-toggle">
        <button
          className={`toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
          onClick={() => setViewMode('list')}
        >
          <FaList /> Vue Liste
        </button>
        <button
          className={`toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
          onClick={() => setViewMode('grid')}
        >
          <FaTh /> Vue Grille
        </button>
      </div>

      {/* Affichage des intervenants */}
      <div className={`intervenant-${viewMode}`}>
     
        {filteredIntervenants.length > 0 ? (
          filteredIntervenants.map((intervenant, index) => (
            <div
              key={`${intervenant.id}-${index}`}
              onClick={() => setTaskAssigned(taskAssigned === intervenant.id ? null : intervenant.id)}
              className={`intervenant-item ${viewMode === 'grid' ? 'grid-item' : ''}`}
            >
              
              <div className="intervenant-row">
                <strong className="intervenant-col">{intervenant.name || 'Nom non disponible'}</strong>
                <p className="intervenant-col">Contact: {intervenant.phone || 'Non renseigné'}</p>
                <p className="intervenant-col">Email: {intervenant.email || 'Non renseigné'}</p>
                <p className="intervenant-col">ID: {intervenant.id || 'Non disponible'}</p>
              </div>
              
              {taskAssigned === intervenant.id && (
                <div className="intervenant-details">
                  <h4>Tâches assignées</h4>
                  <div className="tasks">
                    {getTasksForIntervenant(intervenant.name).length > 0 ? (
                      getTasksForIntervenant(intervenant.name).map((task, taskIndex) => (
                        <div
                          key={`task-${taskIndex}`}
                          className="task-item2"
                          style={{ backgroundColor: getTaskBackgroundColor(task) }}
                        >
                          <strong>Client: {task.company || 'Non spécifié'}</strong>
                          <p>
                            <span>Catégorie:</span>{' '}
                            {task.categories?.length > 0 ? (
                              task.categories.map((cat, catIndex) => (
                                <span className='cate' key={`cat-${catIndex}`}>
                                  -{cat || 'Catégorie sans nom'} 
                                </span>
                              ))
                            ) : (
                              <span>Aucune catégorie</span>
                            )}
                          </p>
                          <p>Statut: {task.statut || 'Inconnu'}</p>
                          <p>Date limite: {formatDate(task.date_fin) || 'Non spécifiée'}</p>
                        </div>
                      ))
                    ) : (
                      <p>Aucune tâche assignée.</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <p>Aucun intervenant trouvé avec des tâches en commun.</p>
        )}
      </div>
    </div>
  );
}

export default Intervenantinter;