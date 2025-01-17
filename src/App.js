import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import AdminPage from "./components/pages/AdminPage";
import IntervenantPage from "./components/pages/IntervenantPage";
import Auth from "./components/pages/Auth";
import RegisterPage from "./components/pages/RegisterPage";
import LoadingScreen from "./components/pages/LoadingScreen";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour récupérer l'utilisateur connecté depuis le localStorage
  const getUserFromLocalStorage = () => {
    return JSON.parse(localStorage.getItem("currentUser")) || null;
  };

  // Fonction pour gérer le chargement initial
  useEffect(() => {
    const timeout = setTimeout(() => {
      setLoading(false);
      const user = getUserFromLocalStorage();
      if (user) {
        setIsAuthenticated(true);
        setCurrentUser(user);
      }
    }, 3000); // Simule un écran de chargement pendant 2 secondes

    return () => clearTimeout(timeout);
  }, []);
   // Polling : vérifier les mises à jour toutes les X secondes
   useEffect(() => {
    const interval = setInterval(() => {
      const updatedUser = getUserFromLocalStorage();
      if (JSON.stringify(updatedUser) !== JSON.stringify(currentUser)) {
        setIsAuthenticated(!!updatedUser);
        setCurrentUser(updatedUser);
        console.log("Mise à jour détectée via polling !");
      }
    }, 2000); // Vérifie toutes les 5 secondes

    return () => clearInterval(interval);
  }, [currentUser]);

  // Écoute les modifications du localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = getUserFromLocalStorage();
      setIsAuthenticated(!!updatedUser);
      setCurrentUser(updatedUser);
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const handleLoginSuccess = (user) => {
    setIsAuthenticated(true);
    setCurrentUser(user);
    localStorage.setItem("currentUser", JSON.stringify(user));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    localStorage.removeItem("currentUser");
  };

  const onRegisterSuccess = (newUser) => {
    const users = JSON.parse(localStorage.getItem("users")) || [];
    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem("currentUser", JSON.stringify(newUser));
  };

  // Affiche l'écran de chargement si nécessaire
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Router>
      <Routes>
        {/* Routes pour les utilisateurs non connectés */}
        <Route path="/" element={<Auth onLoginSuccess={handleLoginSuccess} />} />

        {!isAuthenticated ? (
          <>
            <Route path="/register" element={<RegisterPage onRegisterSuccess={onRegisterSuccess} />} />
          </>
        ) : (
          <>
            {/* Routes pour les administrateurs */}
            {currentUser?.isAdmin ? (
              <>
                <Route path="/admin" element={<AdminPage onLogout={handleLogout} />} />
                <Route path="/Auth" element={<Auth onLoginSuccess={handleLoginSuccess} />} />
              </>
            ) : (
              <>
                {/* Routes pour les intervenants */}
                <Route path="/intervenant" element={<IntervenantPage onLogout={handleLogout} />} />
              </>
            )}
            {/* Redirection par défaut pour les utilisateurs connectés */}
            <Route path="*" element={<Navigate to={currentUser?.isAdmin ? "/admin" : "/intervenant"} replace />} />
          </>
        )}
        {/* Redirection par défaut pour les utilisateurs non connectés */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
