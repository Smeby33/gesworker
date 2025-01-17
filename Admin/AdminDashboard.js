import React from 'react';
import TaskCreation from './TaskCreation';
import CreateCompany from './CreateCompany';
import CreateIntervenant from './CreateIntervenant';
import Dashboard from './Dashbord';
import PresenceChecker from './PresenceChecker';
import PresenceList from './PresenceList';
import '../css/AdminDashboard.css';

function AdminDashboard() {

    const handlePositionMatch = () => {
      console.log("Position correspondante !");
      alert("Votre présence a été marquée.");
    };
  
  return (
    <div className='AdminDashboard'>
      <div className="divh2">
        <h2>Admin Dashboard</h2>
        <Dashboard/>
      </div>
      <div className="AD-cintenu">
        {/* <TaskManagement /> */}
      </div>
      {/* <div className="AD-cintenu1">
      <h2 className="calendar-containerh3" >Calendrier des Tâches</h2>
        <PresenceChecker
        targetLatitude={-0.7268689} // Exemple de coordonnées cibles
        targetLongitude={8.7811752}
        onPositionMatched={handlePositionMatch}
        />
      </div>
      <PresenceList/>
      */}
    </div>
  );
}

export default AdminDashboard;
