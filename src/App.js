import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import AdminPage from './components/pages/AdminPage';
import IntervenantPage from './components/pages/IntervenantPage';
import Auth from './components/pages/Auth';
import RegisterPage from './components/pages/RegisterPage';
import LoadingScreen from './components/pages/LoadingScreen';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour récupérer l'utilisateur du localStorage
  const getUserFromLocalStorage = () => {
    const loggedInUser = JSON.parse(localStorage.getItem('currentUser'));
    return loggedInUser;
  };

  // Récupérer tous les utilisateurs du localStorage
  const getAllUsers = () => {
    return JSON.parse(localStorage.getItem('users')) || [];
  };

  // Sauvegarder tous les utilisateurs dans le localStorage
  const saveAllUsers = (users) => {
    localStorage.setItem('users', JSON.stringify(users));
  };

  useEffect(() => {
    // Affiche l'écran de chargement pendant 2 secondes (par exemple)
    const timeout = setTimeout(() => {
      setLoading(false);
      const user = getUserFromLocalStorage();
      if (user) {
        setIsAuthenticated(true);
        setCurrentUser(user);
      }
    }, 2000); // 2 secondes

    // Nettoyage du timeout lorsque le composant est démonté
    return () => clearTimeout(timeout);
  }, []);

  // Écoute les modifications du localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = getUserFromLocalStorage();
      if (updatedUser) {
        setIsAuthenticated(true);
        setCurrentUser(updatedUser);
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    };

    // Ajoute un event listener pour détecter les changements sur le localStorage
    window.addEventListener('storage', handleStorageChange);

    // Nettoie l'event listener lorsque le composant est démonté
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleLoginSuccess = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
  };

  const onRegisterSuccess = (newUser) => {
    const users = getAllUsers();
    users.push(newUser);
    saveAllUsers(users);  // Sauvegarde le tableau d'utilisateurs mis à jour dans le localStorage
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(newUser));
  };

  // Affiche le LoadingScreen si le chargement est en cours
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Routes>
        {!isAuthenticated ? (
          <Route path="/" element={<Auth onLoginSuccess={handleLoginSuccess} />} />
        ) : (
          <>
            <Route
              path="/admin"
              element={
                currentUser?.isAdmin ? (
                  <AdminPage onLogout={handleLogout} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/Auth"
              element={
                currentUser?.isAdmin ? (
                  <div>
                    <Auth onLoginSuccess={handleLoginSuccess} />
                  </div>
                ) : (
                  <Navigate to="/" />
                )
              }
            />
            <Route
              path="/intervenant"
              element={
                !currentUser?.isAdmin ? (
                  <IntervenantPage onLogout={handleLogout} />
                ) : (
                  <Navigate to="/" />
                )
              }
            />
          </>
        )}
        <Route path="/register" element={<RegisterPage onRegisterSuccess={onRegisterSuccess} />} />
      </Routes>
    </Router>
  );
}

export default App;
