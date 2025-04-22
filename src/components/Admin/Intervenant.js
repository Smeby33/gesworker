import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import CreateCompany from './CreateCompany';
import CreateIntervenant from './CreateIntervenant';
import InterTaskCreation from './InterTaskCreation ';
import { getAuth } from "firebase/auth";
import ProfilePicture from './ProfilePicture';
import TaskCreation from './TaskCreation';
import { FaUserPlus, FaFileMedical, FaBuilding, FaTimes, FaList, FaTh, FaPlusCircle } from 'react-icons/fa';
import 'react-toastify/dist/ReactToastify.css';
import '../css/Intervenant.css';

function Intervenant() {
    const [hoveredIntervenant, setHoveredIntervenant] = useState(null);
    const [viewMode, setViewMode] = useState('list');
    const [showIntervenantForm, setShowIntervenantForm] = useState(false);
    const [activeIntervenantIndex, setActiveIntervenantIndex] = useState(null);
    const [selectedIntervenantForTask, setSelectedIntervenantForTask] = useState(null);
    const [selectedIntervenants, setSelectedIntervenants] = useState([]);
    const [showCompanyBtn, setShowCompanyBtn] = useState(null);
    const [showAjoutinter, setShowAjoutinter] = useState(null);
    const [adminEmail, setAdminEmail] = useState('');
    const [tasks, setTasks] = useState([]);
    const [intervenants, setIntervenants] = useState([]);
    const [companies, setCompanies] = useState([]);
    const auth = getAuth();

    useEffect(() => {
        if (auth.currentUser) {
            setAdminEmail(auth.currentUser.email);
            const adminUID = auth.currentUser.uid;

            const fetchData = async () => {
                try {
                    const [tasksRes, intervenantsRes] = await Promise.all([
                        fetch(`https://gesworkerback.onrender.com/taches/tasks-by-owner/${adminUID}`),
                        fetch(`https://gesworkerback.onrender.com/intervenants/recuperertout/${adminUID}`)
                    ]);

                    const tasksData = await tasksRes.json();
                    setTasks(tasksData);

                    const intervenantsData = await intervenantsRes.json();
                    setIntervenants(intervenantsData);
                } catch (error) {
                    console.error("Erreur lors de la récupération des données :", error);
                }
            };

            fetchData();
        }
    }, []);

    const toggleFormState = (key, value) => {
        if (key === 'selectedIntervenantForTask') {
            setSelectedIntervenantForTask(prev => (prev === value ? null : value));
        }
    };

    const getTasksForIntervenant = (intervenantName) => {
        if (!Array.isArray(tasks)) return []; // sécurité en cas de problème
    
        return tasks.filter(task => {
            if (!task.intervenants) return false;
    
            return task.intervenants
                .split(",")
                .map(name => name.trim().toLowerCase())
                .includes(intervenantName.toLowerCase());
        });
    };
    

    const getTaskBackgroundColor = (task) => {
        const today = new Date();
        const taskDateFin = new Date(task.dateFin);
        const diffDays = Math.ceil((taskDateFin - today) / (1000 * 60 * 60 * 24));

        if (task.statut !== 'Terminé' && diffDays < 0) return 'red';
        if (diffDays <= 3 && diffDays >= 0) return 'orange';
        return 'white';
    };

    return (
        <div className="intervenant-container" id='Intervenant'>
            <h3 id='intervenants'>Liste des Intervenants</h3>

            <div className="view-selector">
                <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}><FaList /> Liste</button>
                <button onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'active' : ''}><FaTh /> Grille</button>
                <button onClick={() => setShowAjoutinter(!showAjoutinter)}><FaPlusCircle /> Intervenant</button>
            </div>

            <div className={`intervenant-view ${viewMode}`}>
                {intervenants.length > 0 ? (
                    intervenants.map((intervenant, index) => (
                        <div key={index} className="intervenant-item"
                            onMouseEnter={() => setHoveredIntervenant(intervenant)}
                            onMouseLeave={() => setHoveredIntervenant(null)}
                            onClick={() => setShowCompanyBtn(showCompanyBtn === index ? null : index)}>

                            {showCompanyBtn === index && (
                                <div className="navclient">
                                    <div className="nav-button" onClick={() => toggleFormState('activeIntervenantIndex', index)}>
                                        <FaBuilding className="btnnavicon" /> <p className='btnent' > Add Entreprise</p>
                                    </div>
                                    <div className="nav-button" onClick={() => toggleFormState('selectedIntervenantForTask', intervenant)}>
                                        <FaFileMedical className="btnnavicon" /> <p className='btnent' > Add Tâches </p>
                                    </div>
                                </div>
                            )}

                                <div className="affichagetable">

                                <div className="intervenant-row">
                                  <div className="intervenant-col">{intervenant.name}</div>
                                  <div className="intervenant-col"> {intervenant.phone}</div>
                                  <div className="intervenant-col">{intervenant.email}</div>
                                  <div className="intervenant-col">{intervenant.id}</div>
                                  <div className="intervenant-col">{intervenant.password}</div>
                                </div>
                                <div className="profile-picture-container">
                                  <ToastContainer />
                                  <h3> {intervenant.name}</h3> {/* Affichage du username */}

                                  {/* Affichage de la photo actuelle */}
                                  <div
                                    className="profile-picture-display"
                                  >
                                    {intervenant.profilePicture ? (
                                      <img
                                        src= {intervenant.profilePicture}
                                        alt="Photo de profil"
                                        className="profile-picture-image"
                                      />
                                    ) : (
                                      <div className="placeholder">Aucune photo</div>
                                    )}
                                  </div>
                                </div>

                                {activeIntervenantIndex === index && <CreateCompany onCompanyCreated={setCompanies} />}
                                {selectedIntervenantForTask === intervenant && <InterTaskCreation onIntervenantAdded={setIntervenants} />}

                                {hoveredIntervenant && hoveredIntervenant.name === intervenant.name && (
                                    <div className="intervenant-details">
                                        <h4>Tâches assignées</h4>
                                        <div className="tasks">
                                            {getTasksForIntervenant(intervenant.name).map((task, idx) => (
                                                <div key={idx} className="task-item2" style={{ backgroundColor: getTaskBackgroundColor(task) }}>
                                                    <strong>{task.company}</strong>
                                                    <p>{task.categories}</p>
                                                    <p>{task.statut}</p>
                                                    <p>{task.date_fin}</p>
                                                </div>
                                            ))}
                                            {getTasksForIntervenant(intervenant.name).length === 0 && (<p>Aucune info</p>)}
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
            {showAjoutinter && <CreateIntervenant onIntervenantAdded={setIntervenants} />}
            <ToastContainer />
        </div>
    );
}

export default Intervenant;
