import React, { useState, useEffect } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import AdminDashboard from '../Admin/AdminDashboard';
import Navbar from '../Intervenant/Navbar';
import RecentActivities from '../Admin/RecentActivities'; // Import du nouveau composant
import '../css/AdminPage.css';

function AdminPage() {
  const [adminName, setAdminName] = useState('');

  // Récupérer le nom de l'administrateur depuis le localStorage
  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    if (currentUser && currentUser.isAdmin) {
      setAdminName(currentUser.username); // Utilise 'username' si c'est le champ utilisé dans le handleLogin
    }
  }, []);

  return (
    <div fluid className="AdminPage">
      <div className="divnav">
        <Navbar />
      </div>
      <div className="AdminPagemain">
        <h1 className='animationh3a'>
          Bienvenue administrateur {adminName} dans votre tableau de bord 
        </h1>
        <div className="company">
          <RecentActivities /> {/* Inclusion du nouveau composant */}
        </div>
        <AdminDashboard />
      </div>
    </div>
  );
}

export default AdminPage;
